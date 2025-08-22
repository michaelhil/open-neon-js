/**
 * Simple browser API for easy use
 */
import { createDevice } from './device.js'
import {
  DEFAULTS,
  DeviceError,
  ErrorCodes,
  parseAddress
} from 'open-neon-core'

/**
 * Connect to device at specific address
 * @param {string} address - Device IP address
 * @param {Object} options - Connection options
 * @returns {Promise<Object>} Connected device
 */
export const connectToDevice = async (address, options = {}) => {
  const parsed = parseAddress(address)
  
  const deviceInfo = {
    id: `${parsed.host}:${parsed.port}`,
    name: `Device at ${parsed.host}:${parsed.port}`,
    model: 'Unknown',
    ipAddress: parsed.host,
    port: parsed.port
  }
  
  const device = createDevice(deviceInfo, options)
  await device.connect()
  
  return createSimpleDevice(device)
}

/**
 * Create simple wrapper around device
 * @param {Object} device - Core device instance
 * @returns {Object} Simple device interface
 */
const createSimpleDevice = (device) => {
  const gazeBuffer = []
  let gazeSubscription = null
  let isStreaming = false
  
  // Start gaze streaming in background
  const startGazeStreaming = () => {
    if (isStreaming) return
    
    isStreaming = true
    const gazeStream = device.createGazeStream()
    
    gazeSubscription = gazeStream.subscribe({
      next: (gaze) => {
        gazeBuffer.push(gaze)
        // Keep buffer size manageable
        if (gazeBuffer.length > 1000) {
          gazeBuffer.shift()
        }
      },
      error: (error) => {
        console.error('Gaze stream error:', error)
      }
    })
  }
  
  // Simple blocking API methods
  const receiveGazeDatum = (timeoutMs = 1000) => {
    if (!isStreaming) {
      startGazeStreaming()
    }
    
    return new Promise((resolve, reject) => {
      if (gazeBuffer.length > 0) {
        resolve(gazeBuffer.shift())
        return
      }
      
      const checkBuffer = () => {
        if (gazeBuffer.length > 0) {
          resolve(gazeBuffer.shift())
          return
        }
        
        setTimeout(checkBuffer, 10)
      }
      
      setTimeout(() => {
        reject(new Error('Timeout waiting for gaze data'))
      }, timeoutMs)
      
      checkBuffer()
    })
  }
  
  const close = async () => {
    if (gazeSubscription) {
      gazeSubscription.unsubscribe()
      gazeSubscription = null
    }
    isStreaming = false
    gazeBuffer.length = 0
    
    await device.disconnect()
  }
  
  return {
    // Simple API methods
    receiveGazeDatum,
    
    // Device control
    async startRecording(recordingId = `recording_${Date.now()}`) {
      return await device.startRecording(recordingId)
    },
    
    async stopRecording() {
      return await device.stopRecording()
    },
    
    async getRecordingStatus() {
      return await device.getRecordingStatus()
    },
    
    async startCalibration() {
      return await device.startCalibration()
    },
    
    async stopCalibration() {
      return await device.stopCalibration()
    },
    
    async getCalibrationStatus() {
      return await device.getCalibrationStatus()
    },
    
    async getStatus() {
      return await device.getStatus()
    },
    
    // Device info
    get info() {
      return device.info
    },
    
    get connected() {
      return device.connected
    },
    
    // Cleanup
    close,
    
    // Access to underlying device for advanced usage
    get device() {
      return device
    }
  }
}

/**
 * Simple Device API for browser
 */
export const SimpleDevice = {
  /**
   * Connect to device at address
   * @param {string} address - IP address
   * @param {Object} options - Options
   * @returns {Promise<Object>} Simple device
   */
  async connect(address, options = {}) {
    return await connectToDevice(address, options)
  }
}