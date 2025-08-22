/**
 * @pupil-labs/neon
 * Auto-detecting Pupil Labs Neon eye tracker API
 * Automatically selects Node.js or Browser implementation
 */

// Re-export core functionality
export * from '@pupil-labs/neon-core'

// Environment detection
const isNode = typeof process !== 'undefined' && 
               process.versions && 
               process.versions.node

const isBrowser = typeof window !== 'undefined' && 
                  typeof document !== 'undefined'

// Environment info
export const ENVIRONMENT = isNode ? 'node' : isBrowser ? 'browser' : 'unknown'
export const VERSION = '0.1.0'

// Dynamic import helpers
export const loadNodeImplementation = async () => {
  if (!isNode) {
    throw new Error('Node.js implementation not available in browser environment')
  }
  const nodeModule = await import('@pupil-labs/neon-node')
  return nodeModule
}

export const loadBrowserImplementation = async () => {
  if (!isBrowser) {
    throw new Error('Browser implementation not available in Node.js environment')
  }
  const browserModule = await import('@pupil-labs/neon-browser')
  return browserModule
}

// Auto-detecting API
export const Device = {
  async connect(address, options) {
    if (isNode) {
      const { Device } = await loadNodeImplementation()
      return Device.connect(address, options)
    } else if (isBrowser) {
      const { Device } = await loadBrowserImplementation()  
      return Device.connect(address, options)
    } else {
      throw new Error('Unknown environment')
    }
  },
  
  async create(deviceInfo, options) {
    if (isNode) {
      const { Device } = await loadNodeImplementation()
      return Device.create(deviceInfo, options)
    } else if (isBrowser) {
      const { Device } = await loadBrowserImplementation()
      return Device.create(deviceInfo, options)
    } else {
      throw new Error('Unknown environment')
    }
  }
}

// Node.js only API
export const Discovery = {
  async find(options) {
    if (!isNode) {
      throw new Error('Device discovery only available in Node.js environment')
    }
    const { Discovery } = await loadNodeImplementation()
    return Discovery.find(options)
  },
  
  async findFirst(options) {
    if (!isNode) {
      throw new Error('Device discovery only available in Node.js environment')
    }
    const { Discovery } = await loadNodeImplementation()
    return Discovery.findFirst(options)
  }
}

// Convenience functions
export const getEnvironmentInfo = () => ({
  environment: ENVIRONMENT,
  isNode,
  isBrowser,
  version: VERSION,
  userAgent: isBrowser ? navigator.userAgent : undefined,
  nodeVersion: isNode ? process.version : undefined
})