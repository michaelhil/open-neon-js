/**
 * Device discovery for Node.js using mDNS/Bonjour
 */
import { Bonjour } from 'bonjour-service'
import { EventEmitter } from 'node:events'
import { 
  MDNS, 
  DEFAULTS, 
  TIMEOUTS,
  DeviceError, 
  ErrorCodes 
} from '@pupil-labs/neon-core'

/**
 * Create device discovery service
 * @param {Object} options - Discovery options
 * @returns {Object} Discovery service
 */
export const createDiscovery = (options = {}) => {
  const {
    timeout = DEFAULTS.DISCOVERY_TIMEOUT,
    serviceType = MDNS.SERVICE_TYPE
  } = options
  
  const emitter = new EventEmitter()
  const bonjour = new Bonjour()
  const discoveredDevices = new Map()
  
  let isDiscovering = false
  let browser = null
  
  const deviceFromService = (service) => ({
    id: service.txt?.id || service.name,
    name: service.name,
    model: service.name.includes('Neon') ? 'Neon' : 'Invisible',
    ipAddress: service.addresses?.[0] || service.host,
    port: service.port || DEFAULTS.PORT,
    txtRecord: service.txt || {},
    lastSeen: Date.now()
  })
  
  const start = () => {
    if (isDiscovering) return
    
    isDiscovering = true
    discoveredDevices.clear()
    
    browser = bonjour.find({
      type: serviceType
    })
    
    browser.on('up', (service) => {
      // Filter for Pupil Labs devices
      if (service.name?.includes('monitor') && 
          (service.name.includes('Neon') || service.name.includes('PI'))) {
        const device = deviceFromService(service)
        discoveredDevices.set(device.id, device)
        emitter.emit('device', device)
      }
    })
    
    browser.on('down', (service) => {
      const deviceId = service.txt?.id || service.name
      if (discoveredDevices.has(deviceId)) {
        discoveredDevices.delete(deviceId)
        emitter.emit('deviceLost', deviceId)
      }
    })
    
    browser.start()
  }
  
  const stop = () => {
    if (!isDiscovering) return
    
    isDiscovering = false
    
    if (browser) {
      browser.stop()
      browser = null
    }
    
    emitter.removeAllListeners()
  }
  
  const getDevices = () => Array.from(discoveredDevices.values())
  
  return {
    start,
    stop,
    getDevices,
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter)
  }
}

/**
 * Discover devices with timeout
 * @param {Object} options - Discovery options
 * @returns {Promise<Array>} Array of discovered devices
 */
export const discoverDevices = async (options = {}) => {
  const { timeout = DEFAULTS.DISCOVERY_TIMEOUT } = options
  const discovery = createDiscovery(options)
  const devices = []
  
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      discovery.stop()
      resolve(devices)
    }, timeout)
    
    discovery.on('device', (device) => {
      devices.push(device)
    })
    
    discovery.on('error', (error) => {
      clearTimeout(timer)
      discovery.stop()
      reject(error)
    })
    
    try {
      discovery.start()
    } catch (error) {
      clearTimeout(timer)
      reject(DeviceError('Failed to start device discovery', ErrorCodes.DEVICE_NOT_FOUND, { error }))
    }
  })
}

/**
 * Discover first available device
 * @param {Object} options - Discovery options
 * @returns {Promise<Object|null>} First discovered device or null
 */
export const discoverFirstDevice = async (options = {}) => {
  const { timeout = DEFAULTS.DISCOVERY_TIMEOUT } = options
  const discovery = createDiscovery(options)
  
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      discovery.stop()
      resolve(null)
    }, timeout)
    
    discovery.once('device', (device) => {
      clearTimeout(timer)
      discovery.stop()
      resolve(device)
    })
    
    discovery.on('error', (error) => {
      clearTimeout(timer)
      discovery.stop()
      reject(error)
    })
    
    try {
      discovery.start()
    } catch (error) {
      clearTimeout(timer)
      reject(DeviceError('Failed to start device discovery', ErrorCodes.DEVICE_NOT_FOUND, { error }))
    }
  })
}

/**
 * Wait for specific device to appear
 * @param {string} deviceId - Device ID to wait for
 * @param {Object} options - Discovery options
 * @returns {Promise<Object>} Device info
 */
export const waitForDevice = async (deviceId, options = {}) => {
  const { timeout = DEFAULTS.DISCOVERY_TIMEOUT } = options
  const discovery = createDiscovery(options)
  
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      discovery.stop()
      reject(DeviceError(`Device ${deviceId} not found within timeout`, ErrorCodes.DEVICE_NOT_FOUND))
    }, timeout)
    
    discovery.on('device', (device) => {
      if (device.id === deviceId) {
        clearTimeout(timer)
        discovery.stop()
        resolve(device)
      }
    })
    
    discovery.on('error', (error) => {
      clearTimeout(timer)
      discovery.stop()
      reject(error)
    })
    
    try {
      discovery.start()
    } catch (error) {
      clearTimeout(timer)
      reject(DeviceError('Failed to start device discovery', ErrorCodes.DEVICE_NOT_FOUND, { error }))
    }
  })
}