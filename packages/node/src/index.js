/**
 * @pupil-labs/neon-node
 * Node.js implementation for Pupil Labs Neon eye tracker
 */

// Re-export core functionality
export * from '@pupil-labs/neon-core'

// Node.js specific exports
export { 
  createDiscovery, 
  discoverDevices, 
  discoverFirstDevice, 
  waitForDevice 
} from './discovery.js'

export { 
  createDevice 
} from './device.js'

export { 
  discoverOneDevice,
  connectToDevice,
  SimpleDevice
} from './simple.js'

// Default exports for convenience
export const Device = {
  discover: async (options) => {
    const { discoverOneDevice } = await import('./simple.js')
    return await discoverOneDevice(options)
  },
  
  connect: async (address, options) => {
    const { connectToDevice } = await import('./simple.js')
    return await connectToDevice(address, options)
  },
  
  create: async (deviceInfo, options) => {
    const { createDevice } = await import('./device.js')
    return createDevice(deviceInfo, options)
  }
}

export const Discovery = {
  find: async (options) => {
    const { discoverDevices } = await import('./discovery.js')
    return await discoverDevices(options)
  },
  
  findFirst: async (options) => {
    const { discoverFirstDevice } = await import('./discovery.js')
    return await discoverFirstDevice(options)
  },
  
  waitFor: async (deviceId, options) => {
    const { waitForDevice } = await import('./discovery.js')
    return await waitForDevice(deviceId, options)
  },
  
  create: async (options) => {
    const { createDiscovery } = await import('./discovery.js')
    return createDiscovery(options)
  }
}

// Version info
export const VERSION = '0.1.0'