/**
 * Runtime detection utilities for Bun/Node.js compatibility
 * @fileoverview Provides universal runtime detection and compatibility helpers
 */

/**
 * Detect the current JavaScript runtime environment
 * @returns {'bun' | 'node' | 'browser' | 'unknown'} The detected runtime
 */
export const getRuntime = () => {
  // Check for Bun
  if (typeof Bun !== 'undefined') {
    return 'bun'
  }
  
  // Check for Node.js
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'node'
  }
  
  // Check for browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'browser'
  }
  
  return 'unknown'
}

/**
 * Check if running in Node.js (includes Bun)
 * @returns {boolean} True if running in a Node.js-like environment
 */
export const isNodeLike = () => {
  const runtime = getRuntime()
  return runtime === 'node' || runtime === 'bun'
}

/**
 * Check if running in browser
 * @returns {boolean} True if running in browser
 */
export const isBrowser = () => {
  return getRuntime() === 'browser'
}

/**
 * Check if running in Bun specifically
 * @returns {boolean} True if running in Bun
 */
export const isBun = () => {
  return getRuntime() === 'bun'
}

/**
 * Check if running in Node.js specifically (not Bun)
 * @returns {boolean} True if running in Node.js
 */
export const isNode = () => {
  return getRuntime() === 'node'
}

/**
 * Get the appropriate package manager command
 * @returns {'bun' | 'npm'} The package manager to use
 */
export const getPackageManager = () => {
  return isBun() ? 'bun' : 'npm'
}

/**
 * Get the appropriate test runner command
 * @returns {string} The test command to use
 */
export const getTestCommand = () => {
  return isBun() ? 'bun test' : 'npm test'
}

/**
 * Get runtime-specific configuration
 * @returns {object} Runtime configuration object
 */
export const getRuntimeConfig = () => {
  const runtime = getRuntime()
  
  return {
    runtime,
    supportsTopLevelAwait: runtime === 'bun' || (runtime === 'node' && process.versions.node >= '14.8.0'),
    supportsESModules: true,
    supportsCommonJS: runtime === 'node' || runtime === 'bun',
    supportsWebAPIs: runtime === 'browser' || runtime === 'bun',
    packageManager: getPackageManager(),
    testCommand: getTestCommand()
  }
}

/**
 * Runtime-specific error handling
 * @param {Error} error - The error to handle
 * @returns {object} Enhanced error with runtime context
 */
export const enhanceErrorWithRuntime = (error) => {
  const runtime = getRuntime()
  const config = getRuntimeConfig()
  
  return {
    ...error,
    runtime: {
      environment: runtime,
      config,
      versions: isNodeLike() ? process.versions : { runtime },
      platform: isNodeLike() ? process.platform : 'browser',
      arch: isNodeLike() ? process.arch : 'unknown'
    }
  }
}