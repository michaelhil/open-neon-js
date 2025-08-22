/**
 * @pupil-labs/neon-browser
 * Browser implementation for Pupil Labs Neon eye tracker
 */

// Re-export core functionality
export * from 'open-neon-js-api-core'

// Browser specific exports
export { createDevice } from './device.js'
export { connectToDevice, SimpleDevice } from './simple.js'

// Default exports for convenience
export const Device = {
  connect: async (address, options) => {
    const { connectToDevice } = await import('./simple.js')
    return await connectToDevice(address, options)
  },
  
  create: async (deviceInfo, options) => {
    const { createDevice } = await import('./device.js')
    return createDevice(deviceInfo, options)
  }
}

// Version info
export const VERSION = '0.1.0'