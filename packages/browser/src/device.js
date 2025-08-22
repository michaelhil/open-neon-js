/**
 * Browser Device implementation with WebSocket and WebRTC support
 */
import { Observable } from 'rxjs'
import {
  API_PATHS,
  WS_PATHS,
  DEFAULTS,
  TIMEOUTS,
  ConnectionState,
  EVENT_TYPES,
  ConnectionError,
  DeviceError,
  StreamError,
  APIError,
  ErrorCodes,
  createDeferred,
  withTimeout
} from '@pupil-labs/neon-core'

/**
 * Create a browser device instance
 * @param {Object} deviceInfo - Device information
 * @param {Object} options - Connection options
 * @returns {Object} Device instance
 */
export const createDevice = (deviceInfo, options = {}) => {
  const {
    timeout = DEFAULTS.CONNECTION_TIMEOUT,
    autoReconnect = true,
    reconnectInterval = DEFAULTS.RECONNECT_INTERVAL,
    maxReconnectAttempts = DEFAULTS.MAX_RECONNECT_ATTEMPTS
  } = options
  
  const state = {
    connectionState: ConnectionState.DISCONNECTED,
    deviceInfo: { ...deviceInfo },
    streams: new Map(),
    websockets: new Map(),
    reconnectAttempts: 0
  }
  
  const eventTarget = new EventTarget()
  const baseURL = `http://${deviceInfo.ipAddress}:${deviceInfo.port}`
  const wsBaseURL = `ws://${deviceInfo.ipAddress}:${deviceInfo.port}`
  
  // HTTP API helpers
  const apiRequest = async (path, options = {}) => {
    const url = `${baseURL}${path}`
    const requestOptions = {
      signal: AbortSignal.timeout(TIMEOUTS.API_REQUEST),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }
    
    try {
      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        throw APIError(
          `API request failed: ${response.status} ${response.statusText}`,
          ErrorCodes.API_REQUEST_FAILED,
          { status: response.status, url }
        )
      }
      
      return await response.json()
    } catch (error) {
      if (error.name === 'APIError') throw error
      throw APIError('Network error during API request', ErrorCodes.API_REQUEST_FAILED, { error })
    }
  }
  
  // WebSocket helpers
  const createWebSocket = (path) => {
    const url = `${wsBaseURL}${path}`
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url)
      const timeout = setTimeout(() => {
        ws.close()
        reject(ConnectionError('WebSocket connection timed out'))
      }, TIMEOUTS.CONNECTION)
      
      ws.addEventListener('open', () => {
        clearTimeout(timeout)
        resolve(ws)
      })
      
      ws.addEventListener('error', (event) => {
        clearTimeout(timeout)
        reject(ConnectionError('WebSocket connection failed', { event }))
      })
    })
  }
  
  // Connection management
  const connect = async () => {
    if (state.connectionState === ConnectionState.CONNECTED) {
      return
    }
    
    state.connectionState = ConnectionState.CONNECTING
    eventTarget.dispatchEvent(new CustomEvent(EVENT_TYPES.CONNECTING))
    
    try {
      // Test connection with status endpoint
      const status = await apiRequest(API_PATHS.STATUS)
      state.deviceInfo = { ...state.deviceInfo, ...status }
      
      // Connect to status WebSocket
      const statusWs = await createWebSocket(WS_PATHS.STATUS)
      state.websockets.set('status', statusWs)
      
      statusWs.addEventListener('message', (event) => {
        try {
          const status = JSON.parse(event.data)
          state.deviceInfo = { ...state.deviceInfo, ...status }
          eventTarget.dispatchEvent(new CustomEvent(EVENT_TYPES.STATUS_UPDATE, { detail: status }))
        } catch (error) {
          eventTarget.dispatchEvent(new CustomEvent(EVENT_TYPES.ERROR, {
            detail: StreamError('Failed to parse status message', ErrorCodes.INVALID_DATA_FORMAT, { error })
          }))
        }
      })
      
      statusWs.addEventListener('close', () => {
        if (autoReconnect && state.connectionState === ConnectionState.CONNECTED) {
          handleReconnect()
        }
      })
      
      statusWs.addEventListener('error', (event) => {
        eventTarget.dispatchEvent(new CustomEvent(EVENT_TYPES.ERROR, {
          detail: ConnectionError('Status WebSocket error', { event })
        }))
      })
      
      state.connectionState = ConnectionState.CONNECTED
      state.reconnectAttempts = 0
      eventTarget.dispatchEvent(new CustomEvent(EVENT_TYPES.CONNECTED, { detail: state.deviceInfo }))
      
    } catch (error) {
      state.connectionState = ConnectionState.ERROR
      eventTarget.dispatchEvent(new CustomEvent(EVENT_TYPES.ERROR, { detail: error }))
      
      if (autoReconnect) {
        handleReconnect()
      }
      
      throw error
    }
  }
  
  const disconnect = async () => {
    state.connectionState = ConnectionState.DISCONNECTED
    
    // Close all WebSockets
    for (const [name, ws] of state.websockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
    state.websockets.clear()
    
    // Complete all streams
    for (const [name, stream] of state.streams) {
      if (stream.complete) {
        stream.complete()
      }
    }
    state.streams.clear()
    
    eventTarget.dispatchEvent(new CustomEvent(EVENT_TYPES.DISCONNECTED))
  }
  
  const handleReconnect = async () => {
    if (state.reconnectAttempts >= maxReconnectAttempts) {
      state.connectionState = ConnectionState.ERROR
      eventTarget.dispatchEvent(new CustomEvent(EVENT_TYPES.ERROR, {
        detail: ConnectionError('Maximum reconnection attempts exceeded', ErrorCodes.CONNECTION_FAILED)
      }))
      return
    }
    
    state.connectionState = ConnectionState.RECONNECTING
    state.reconnectAttempts++
    eventTarget.dispatchEvent(new CustomEvent(EVENT_TYPES.RECONNECTING, { 
      detail: { attempt: state.reconnectAttempts }
    }))
    
    await new Promise(resolve => setTimeout(resolve, reconnectInterval))
    
    try {
      await connect()
    } catch (error) {
      // Will try again due to autoReconnect
    }
  }
  
  // Stream creation
  const createGazeStream = () => {
    if (state.streams.has('gaze')) {
      return state.streams.get('gaze').observable
    }
    
    const stream = new Observable(subscriber => {
      if (state.connectionState !== ConnectionState.CONNECTED) {
        subscriber.error(StreamError('Device not connected', ErrorCodes.STREAM_START_FAILED))
        return
      }
      
      let gazeWs = null
      
      const startStream = async () => {
        try {
          gazeWs = await createWebSocket(WS_PATHS.GAZE)
          
          gazeWs.addEventListener('message', (event) => {
            try {
              const gazeData = JSON.parse(event.data)
              subscriber.next(gazeData)
            } catch (error) {
              subscriber.error(StreamError('Failed to parse gaze data', ErrorCodes.STREAM_DECODE_ERROR, { error }))
            }
          })
          
          gazeWs.addEventListener('close', () => {
            if (!subscriber.closed) {
              subscriber.error(StreamError('Gaze stream closed unexpectedly', ErrorCodes.STREAM_INTERRUPTED))
            }
          })
          
          gazeWs.addEventListener('error', (event) => {
            subscriber.error(StreamError('Gaze WebSocket error', ErrorCodes.STREAM_ERROR, { event }))
          })
          
        } catch (error) {
          subscriber.error(StreamError('Failed to start gaze stream', ErrorCodes.STREAM_START_FAILED, { error }))
        }
      }
      
      startStream()
      
      // Cleanup function
      return () => {
        if (gazeWs && gazeWs.readyState === WebSocket.OPEN) {
          gazeWs.close()
        }
        state.streams.delete('gaze')
      }
    })
    
    state.streams.set('gaze', { observable: stream, complete: () => {} })
    return stream
  }
  
  // API methods
  const getStatus = () => apiRequest(API_PATHS.STATUS)
  
  const startRecording = (recordingId) => 
    apiRequest(API_PATHS.RECORDING, {
      method: 'POST',
      body: JSON.stringify({ action: 'start', recording_id: recordingId })
    })
  
  const stopRecording = () =>
    apiRequest(API_PATHS.RECORDING, {
      method: 'POST',
      body: JSON.stringify({ action: 'stop' })
    })
  
  const getRecordingStatus = () => apiRequest(API_PATHS.RECORDING)
  
  const startCalibration = () =>
    apiRequest(API_PATHS.CALIBRATION, {
      method: 'POST',
      body: JSON.stringify({ action: 'start' })
    })
  
  const stopCalibration = () =>
    apiRequest(API_PATHS.CALIBRATION, {
      method: 'POST',
      body: JSON.stringify({ action: 'stop' })
    })
  
  const getCalibrationStatus = () => apiRequest(API_PATHS.CALIBRATION)
  
  // Event handling
  const addEventListener = (type, listener) => eventTarget.addEventListener(type, listener)
  const removeEventListener = (type, listener) => eventTarget.removeEventListener(type, listener)
  
  // Public interface
  return {
    // Connection
    connect,
    disconnect,
    get connected() { return state.connectionState === ConnectionState.CONNECTED },
    get connectionState() { return state.connectionState },
    
    // Device info
    get info() { return { ...state.deviceInfo } },
    
    // Streams
    createGazeStream,
    
    // API methods
    getStatus,
    startRecording,
    stopRecording,
    getRecordingStatus,
    startCalibration,
    stopCalibration,
    getCalibrationStatus,
    
    // Events
    addEventListener,
    removeEventListener,
    
    // Cleanup
    destroy: disconnect
  }
}