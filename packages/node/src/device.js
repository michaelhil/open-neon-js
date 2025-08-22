/**
 * Node.js Device implementation with full network capabilities
 */
import { EventEmitter } from 'node:events'
import WebSocket from 'ws'
// Use native fetch API (available in Node.js 18+)
import { Observable } from 'open-neon-js-api-core'
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
  retry,
  withTimeout,
  enhanceGazeData,
  enhanceError,
  createSemanticConfig
} from 'open-neon-js-api-core'

/**
 * Create a device instance
 * @param {Object} deviceInfo - Device information from discovery
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
  
  const emitter = new EventEmitter()
  const state = {
    connectionState: ConnectionState.DISCONNECTED,
    deviceInfo: { ...deviceInfo },
    streams: new Map(),
    websockets: new Map(),
    reconnectAttempts: 0
  }
  
  const baseURL = `http://${deviceInfo.ipAddress}:${deviceInfo.port}`
  const wsBaseURL = `ws://${deviceInfo.ipAddress}:${deviceInfo.port}`
  
  // HTTP API helpers
  const apiRequest = async (path, options = {}) => {
    const url = `${baseURL}${path}`
    const requestOptions = {
      timeout: TIMEOUTS.API_REQUEST,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }
    
    try {
      const response = await withTimeout(
        fetch(url, requestOptions),
        requestOptions.timeout,
        'API request timed out'
      )
      
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
    console.log(`🔌 Connecting to WebSocket: ${url}`) // Debug log
    const ws = new WebSocket(url)
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close()
        reject(ConnectionError('WebSocket connection timed out'))
      }, TIMEOUTS.CONNECTION)
      
      ws.on('open', () => {
        clearTimeout(timeout)
        resolve(ws)
      })
      
      ws.on('error', (error) => {
        clearTimeout(timeout)
        reject(ConnectionError('WebSocket connection failed', { error }))
      })
    })
  }
  
  // Connection management
  const connect = async () => {
    if (state.connectionState === ConnectionState.CONNECTED) {
      return
    }
    
    state.connectionState = ConnectionState.CONNECTING
    emitter.emit(EVENT_TYPES.CONNECTING)
    
    try {
      // Test connection with status endpoint
      const status = await apiRequest(API_PATHS.STATUS)
      state.deviceInfo = { ...state.deviceInfo, ...status }
      
      // Connect to status WebSocket
      const statusWs = await createWebSocket(WS_PATHS.STATUS)
      state.websockets.set('status', statusWs)
      
      statusWs.on('message', (data) => {
        try {
          const status = JSON.parse(data)
          state.deviceInfo = { ...state.deviceInfo, ...status }
          emitter.emit(EVENT_TYPES.STATUS_UPDATE, status)
        } catch (error) {
          emitter.emit(EVENT_TYPES.ERROR, 
            StreamError('Failed to parse status message', ErrorCodes.INVALID_DATA_FORMAT, { error })
          )
        }
      })
      
      statusWs.on('close', () => {
        if (autoReconnect && state.connectionState === ConnectionState.CONNECTED) {
          handleReconnect()
        }
      })
      
      statusWs.on('error', (error) => {
        emitter.emit(EVENT_TYPES.ERROR, 
          ConnectionError('Status WebSocket error', { error })
        )
      })
      
      state.connectionState = ConnectionState.CONNECTED
      state.reconnectAttempts = 0
      emitter.emit(EVENT_TYPES.CONNECTED, state.deviceInfo)
      
    } catch (error) {
      state.connectionState = ConnectionState.ERROR
      emitter.emit(EVENT_TYPES.ERROR, error)
      
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
    
    emitter.emit(EVENT_TYPES.DISCONNECTED)
  }
  
  const handleReconnect = async () => {
    if (state.reconnectAttempts >= maxReconnectAttempts) {
      state.connectionState = ConnectionState.ERROR
      emitter.emit(EVENT_TYPES.ERROR, 
        ConnectionError('Maximum reconnection attempts exceeded', ErrorCodes.CONNECTION_FAILED)
      )
      return
    }
    
    state.connectionState = ConnectionState.RECONNECTING
    state.reconnectAttempts++
    emitter.emit(EVENT_TYPES.RECONNECTING, { attempt: state.reconnectAttempts })
    
    await new Promise(resolve => setTimeout(resolve, reconnectInterval))
    
    try {
      await connect()
    } catch (error) {
      // Will try again due to autoReconnect
    }
  }
  
  // Stream creation
  const createGazeStream = (config = {}) => {
    const streamKey = `gaze_${JSON.stringify(config)}`
    if (state.streams.has(streamKey)) {
      return state.streams.get(streamKey).observable
    }
    
    // Create semantic configuration
    const semanticConfig = createSemanticConfig(config.semantic)
    
    const stream = new Observable(subscriber => {
      if (state.connectionState !== ConnectionState.CONNECTED) {
        subscriber.error(StreamError('Device not connected', ErrorCodes.STREAM_START_FAILED))
        return
      }
      
      let gazeWs = null
      
      const startStream = async () => {
        try {
          gazeWs = await createWebSocket(WS_PATHS.GAZE)
          
          gazeWs.on('message', (data) => {
            try {
              const gazeData = JSON.parse(data)
              
              // Apply semantic enhancement if enabled
              const enhancedData = semanticConfig.enabled 
                ? enhanceGazeData(gazeData, semanticConfig, state.deviceInfo)
                : gazeData
              
              subscriber.next(enhancedData)
            } catch (error) {
              const enhancedError = enhanceError(error, semanticConfig)
              subscriber.error(StreamError('Failed to parse gaze data', ErrorCodes.STREAM_DECODE_ERROR, { error: enhancedError }))
            }
          })
          
          gazeWs.on('close', () => {
            if (!subscriber.closed) {
              subscriber.error(StreamError('Gaze stream closed unexpectedly', ErrorCodes.STREAM_INTERRUPTED))
            }
          })
          
          gazeWs.on('error', (error) => {
            subscriber.error(StreamError('Gaze WebSocket error', ErrorCodes.STREAM_ERROR, { error }))
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
        state.streams.delete(streamKey)
      }
    })
    
    state.streams.set(streamKey, { observable: stream, complete: () => {} })
    return stream
  }
  
  // Simple API methods
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
    
    // Simple API
    getStatus,
    startRecording,
    stopRecording,
    getRecordingStatus,
    startCalibration,
    stopCalibration,
    getCalibrationStatus,
    
    // Events
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter),
    
    // Cleanup
    destroy: disconnect
  }
}