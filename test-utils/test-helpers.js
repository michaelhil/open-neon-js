/**
 * Common testing utilities for both human developers and LLM debugging
 */
import { performance } from 'node:perf_hooks'
import { createHash } from 'node:crypto'

/**
 * Enhanced assertion functions with detailed error context
 */
export const assert = {
  /**
   * Assert with debugging context for LLM analysis
   */
  withContext(condition, message, context = {}) {
    if (!condition) {
      const error = new Error(message)
      error.name = 'AssertionError'
      error.context = {
        ...context,
        timestamp: Date.now(),
        stackTrace: error.stack,
        environment: getEnvironmentInfo()
      }
      throw error
    }
  },

  /**
   * Assert gaze data validity with detailed validation
   */
  isValidGazeData(gaze, context = {}) {
    const issues = []
    
    if (typeof gaze.x !== 'number' || gaze.x < 0 || gaze.x > 1) {
      issues.push(`Invalid x coordinate: ${gaze.x} (must be 0-1)`)
    }
    
    if (typeof gaze.y !== 'number' || gaze.y < 0 || gaze.y > 1) {
      issues.push(`Invalid y coordinate: ${gaze.y} (must be 0-1)`)
    }
    
    if (typeof gaze.confidence !== 'number' || gaze.confidence < 0 || gaze.confidence > 1) {
      issues.push(`Invalid confidence: ${gaze.confidence} (must be 0-1)`)
    }
    
    if (typeof gaze.timestamp !== 'number' || gaze.timestamp <= 0) {
      issues.push(`Invalid timestamp: ${gaze.timestamp} (must be positive number)`)
    }
    
    if (issues.length > 0) {
      const error = new Error(`Invalid gaze data: ${issues.join(', ')}`)
      error.name = 'GazeValidationError'
      error.context = {
        gaze,
        issues,
        ...context,
        suggestedFix: 'Verify gaze data source and parsing logic'
      }
      throw error
    }
  },

  /**
   * Assert performance within expected bounds
   */
  performance(actualMs, expectedMs, tolerance = 0.2, context = {}) {
    const maxAllowed = expectedMs * (1 + tolerance)
    const minAllowed = expectedMs * (1 - tolerance)
    
    if (actualMs > maxAllowed || actualMs < minAllowed) {
      const error = new Error(
        `Performance assertion failed: ${actualMs}ms not within ${tolerance * 100}% of ${expectedMs}ms`
      )
      error.name = 'PerformanceAssertionError'
      error.context = {
        actual: actualMs,
        expected: expectedMs,
        tolerance,
        maxAllowed,
        minAllowed,
        difference: actualMs - expectedMs,
        percentDifference: ((actualMs - expectedMs) / expectedMs * 100).toFixed(1),
        ...context
      }
      throw error
    }
  }
}

/**
 * Test data generators for consistent testing
 */
export const generators = {
  /**
   * Generate realistic gaze data sequence
   */
  gazeSequence(count = 100, options = {}) {
    const {
      centerX = 0.5,
      centerY = 0.5,
      movement = 0.1,
      sampleRate = 200,
      startTime = Date.now() / 1000
    } = options
    
    const sequence = []
    for (let i = 0; i < count; i++) {
      const t = i / sampleRate
      sequence.push({
        x: centerX + Math.sin(t * 0.5) * movement + (Math.random() - 0.5) * 0.02,
        y: centerY + Math.cos(t * 0.3) * movement * 0.5 + (Math.random() - 0.5) * 0.02,
        confidence: 0.8 + Math.random() * 0.2,
        timestamp: startTime + t,
        worn: true
      })
    }
    return sequence
  },

  /**
   * Generate device info for testing
   */
  deviceInfo(overrides = {}) {
    return {
      id: 'TEST-DEVICE-001',
      name: 'Test Neon Device',
      model: 'Neon',
      serialNumber: 'TEST-001',
      firmwareVersion: '1.0.0-test',
      batteryLevel: 85,
      isCharging: false,
      isWorn: true,
      ipAddress: '127.0.0.1',
      port: 8080,
      ...overrides
    }
  },

  /**
   * Generate test scenarios
   */
  testScenario(name, config = {}) {
    return {
      id: createHash('md5').update(name + JSON.stringify(config)).digest('hex').slice(0, 8),
      name,
      timestamp: Date.now(),
      config,
      environment: getEnvironmentInfo()
    }
  }
}

/**
 * Performance measurement utilities
 */
export const perf = {
  /**
   * Measure function execution time
   */
  async measure(fn, context = {}) {
    const start = performance.now()
    let result, error
    
    try {
      result = await fn()
    } catch (e) {
      error = e
    }
    
    const duration = performance.now() - start
    
    return {
      duration,
      success: !error,
      error,
      result,
      context: {
        ...context,
        timestamp: Date.now(),
        memoryUsage: process.memoryUsage()
      }
    }
  },

  /**
   * Measure streaming performance
   */
  async measureStream(stream, options = {}) {
    const { duration = 5000, expectedRate = 200 } = options
    
    return new Promise((resolve) => {
      const startTime = performance.now()
      const samples = []
      let lastTimestamp = null
      
      const subscription = stream.subscribe({
        next: (data) => {
          const now = performance.now()
          samples.push({
            data,
            receivedAt: now,
            latency: lastTimestamp ? now - lastTimestamp : 0
          })
          lastTimestamp = now
        },
        error: (error) => {
          resolve({
            success: false,
            error,
            samples: samples.length,
            duration: performance.now() - startTime
          })
        }
      })
      
      setTimeout(() => {
        subscription.unsubscribe()
        const totalDuration = performance.now() - startTime
        const actualRate = (samples.length / totalDuration) * 1000
        
        resolve({
          success: true,
          samples: samples.length,
          duration: totalDuration,
          expectedRate,
          actualRate,
          rateAccuracy: (actualRate / expectedRate),
          avgLatency: samples.length > 1 ? 
            samples.slice(1).reduce((sum, s) => sum + s.latency, 0) / (samples.length - 1) : 0,
          maxLatency: Math.max(...samples.slice(1).map(s => s.latency))
        })
      }, duration)
    })
  }
}

/**
 * Mock utilities with debugging support
 */
export const mock = {
  /**
   * Create mock device with debugging hooks
   */
  createDevice(overrides = {}) {
    const deviceInfo = generators.deviceInfo(overrides)
    const calls = []
    
    return {
      info: deviceInfo,
      calls,
      
      // Mock methods with call tracking
      async connect() {
        calls.push({ method: 'connect', timestamp: Date.now() })
        return Promise.resolve()
      },
      
      async disconnect() {
        calls.push({ method: 'disconnect', timestamp: Date.now() })
        return Promise.resolve()
      },
      
      async getStatus() {
        calls.push({ method: 'getStatus', timestamp: Date.now() })
        return Promise.resolve(deviceInfo)
      },
      
      createGazeStream() {
        calls.push({ method: 'createGazeStream', timestamp: Date.now() })
        
        return {
          subscribe: (observer) => {
            const interval = setInterval(() => {
              observer.next({
                x: 0.5 + (Math.random() - 0.5) * 0.2,
                y: 0.5 + (Math.random() - 0.5) * 0.2,
                confidence: 0.8 + Math.random() * 0.2,
                timestamp: Date.now() / 1000,
                worn: true
              })
            }, 5) // 200Hz
            
            return {
              unsubscribe: () => clearInterval(interval)
            }
          }
        }
      },
      
      // Debugging helpers
      getCalls() { return [...calls] },
      getLastCall() { return calls[calls.length - 1] },
      clearCalls() { calls.length = 0 }
    }
  }
}

/**
 * Network testing utilities
 */
export const network = {
  /**
   * Test HTTP endpoint availability
   */
  async testEndpoint(url, options = {}) {
    const { timeout = 5000, expectedStatus = 200 } = options
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        signal: controller.signal,
        ...options.fetchOptions
      })
      
      clearTimeout(timeoutId)
      
      return {
        success: response.status === expectedStatus,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        available: true,
        responseTime: response.headers.get('x-response-time') || 'unknown'
      }
    } catch (error) {
      return {
        success: false,
        available: false,
        error: {
          name: error.name,
          message: error.message,
          code: error.code
        },
        suggestion: error.name === 'AbortError' 
          ? 'Endpoint timed out - check network connectivity'
          : 'Endpoint unreachable - verify URL and server status'
      }
    }
  },

  /**
   * Test WebSocket connection
   */
  async testWebSocket(url, options = {}) {
    const { timeout = 5000, expectedMessages = 1 } = options
    
    return new Promise((resolve) => {
      const ws = new WebSocket(url)
      const startTime = performance.now()
      const messages = []
      let connected = false
      
      const cleanup = () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }
      
      const timeoutId = setTimeout(() => {
        cleanup()
        resolve({
          success: false,
          connected,
          messages: messages.length,
          error: 'Connection timed out',
          duration: performance.now() - startTime
        })
      }, timeout)
      
      ws.addEventListener('open', () => {
        connected = true
      })
      
      ws.addEventListener('message', (event) => {
        messages.push({
          data: event.data,
          timestamp: performance.now()
        })
        
        if (messages.length >= expectedMessages) {
          clearTimeout(timeoutId)
          cleanup()
          resolve({
            success: true,
            connected: true,
            messages: messages.length,
            duration: performance.now() - startTime,
            firstMessageDelay: messages[0]?.timestamp - startTime
          })
        }
      })
      
      ws.addEventListener('error', (error) => {
        clearTimeout(timeoutId)
        cleanup()
        resolve({
          success: false,
          connected,
          messages: messages.length,
          error: 'WebSocket connection failed',
          details: error
        })
      })
    })
  }
}

/**
 * Environment information for debugging context
 */
export const getEnvironmentInfo = () => ({
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  memory: process.memoryUsage(),
  uptime: process.uptime(),
  timestamp: Date.now(),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
})

/**
 * Test result formatter for LLM consumption
 */
export const formatTestResults = (results, options = {}) => {
  const { format = 'human', includeStackTrace = false } = options
  
  if (format === 'json') {
    return JSON.stringify({
      summary: {
        total: results.length,
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        duration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
      },
      results: results.map(r => ({
        name: r.name,
        success: r.success,
        duration: r.duration,
        error: r.error ? {
          name: r.error.name,
          message: r.error.message,
          code: r.error.code,
          context: r.error.context,
          ...(includeStackTrace ? { stack: r.error.stack } : {})
        } : null
      })),
      environment: getEnvironmentInfo()
    }, null, 2)
  }
  
  // Human-readable format
  return results.map(r => {
    const status = r.success ? '✅ PASS' : '❌ FAIL'
    const duration = r.duration ? ` (${r.duration.toFixed(1)}ms)` : ''
    let output = `${status} ${r.name}${duration}`
    
    if (r.error) {
      output += `\n   Error: ${r.error.message}`
      if (r.error.context?.suggestion) {
        output += `\n   💡 ${r.error.context.suggestion}`
      }
    }
    
    return output
  }).join('\n')
}