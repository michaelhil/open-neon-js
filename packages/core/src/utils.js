/**
 * Utility functions shared across packages
 */

/**
 * Create a deferred promise
 * @returns {{promise: Promise, resolve: Function, reject: Function}}
 */
export const createDeferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise<*>}
 */
export const retry = async (fn, options = {}) => {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    onRetry = () => {}
  } = options
  
  let lastError
  let delay = initialDelay
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxAttempts) {
        throw error
      }
      
      onRetry({ attempt, error, nextDelay: delay })
      await sleep(delay)
      delay = Math.min(delay * factor, maxDelay)
    }
  }
  
  throw lastError
}

/**
 * Create a timeout promise
 * @param {Promise} promise - Promise to timeout
 * @param {number} ms - Timeout in milliseconds
 * @param {string} message - Error message
 * @returns {Promise<*>}
 */
export const withTimeout = (promise, ms, message = 'Operation timed out') => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timeout])
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number}
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/**
 * Linear interpolation
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number}
 */
export const lerp = (a, b, t) => a + (b - a) * t

/**
 * Check if timestamps are within tolerance
 * @param {number} t1 - First timestamp
 * @param {number} t2 - Second timestamp
 * @param {number} tolerance - Tolerance in seconds
 * @returns {boolean}
 */
export const timestampsMatch = (t1, t2, tolerance = 0.05) => 
  Math.abs(t1 - t2) <= tolerance

/**
 * Find closest timestamp match in sorted array
 * @param {number} target - Target timestamp
 * @param {Array} array - Sorted array of objects with timestamp property
 * @param {number} tolerance - Maximum time difference
 * @returns {*|null}
 */
export const findClosestTimestamp = (target, array, tolerance = 0.05) => {
  if (array.length === 0) return null
  
  let left = 0
  let right = array.length - 1
  let closest = null
  let minDiff = Infinity
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const diff = Math.abs(array[mid].timestamp - target)
    
    if (diff < minDiff && diff <= tolerance) {
      minDiff = diff
      closest = array[mid]
    }
    
    if (array[mid].timestamp < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  
  return closest
}

/**
 * Validate gaze data
 * @param {Object} data - Gaze data to validate
 * @returns {boolean}
 */
export const isValidGazeData = (data) => {
  return data &&
    typeof data.x === 'number' &&
    typeof data.y === 'number' &&
    typeof data.confidence === 'number' &&
    typeof data.timestamp === 'number' &&
    data.x >= 0 && data.x <= 1 &&
    data.y >= 0 && data.y <= 1 &&
    data.confidence >= 0 && data.confidence <= 1
}

/**
 * Validate video frame
 * @param {Object} frame - Video frame to validate
 * @returns {boolean}
 */
export const isValidVideoFrame = (frame) => {
  return frame &&
    frame.data instanceof Uint8Array &&
    typeof frame.width === 'number' &&
    typeof frame.height === 'number' &&
    typeof frame.timestamp === 'number' &&
    frame.width > 0 &&
    frame.height > 0
}

/**
 * Convert normalized coordinates to pixel coordinates
 * @param {number} x - Normalized X (0-1)
 * @param {number} y - Normalized Y (0-1)
 * @param {number} width - Target width in pixels
 * @param {number} height - Target height in pixels
 * @returns {{x: number, y: number}}
 */
export const normalizedToPixel = (x, y, width, height) => ({
  x: Math.round(x * width),
  y: Math.round(y * height)
})

/**
 * Convert pixel coordinates to normalized coordinates
 * @param {number} x - X in pixels
 * @param {number} y - Y in pixels
 * @param {number} width - Source width in pixels
 * @param {number} height - Source height in pixels
 * @returns {{x: number, y: number}}
 */
export const pixelToNormalized = (x, y, width, height) => ({
  x: x / width,
  y: y / height
})

/**
 * Calculate distance between two points
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number}
 */
export const distance = (x1, y1, x2, y2) => 
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

/**
 * Calculate angle between two points in radians
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number}
 */
export const angle = (x1, y1, x2, y2) => 
  Math.atan2(y2 - y1, x2 - x1)

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number}
 */
export const radToDeg = (radians) => radians * (180 / Math.PI)

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number}
 */
export const degToRad = (degrees) => degrees * (Math.PI / 180)

/**
 * Create a circular buffer
 * @param {number} size - Buffer size
 * @returns {Object}
 */
export const createCircularBuffer = (size) => {
  const buffer = new Array(size)
  let head = 0
  let tail = 0
  let count = 0
  
  return {
    push(item) {
      buffer[head] = item
      head = (head + 1) % size
      if (count < size) {
        count++
      } else {
        tail = (tail + 1) % size
      }
    },
    
    get(index) {
      if (index >= count) return undefined
      return buffer[(tail + index) % size]
    },
    
    getLast() {
      if (count === 0) return undefined
      return buffer[(head - 1 + size) % size]
    },
    
    getAll() {
      const result = []
      for (let i = 0; i < count; i++) {
        result.push(buffer[(tail + i) % size])
      }
      return result
    },
    
    clear() {
      head = tail = count = 0
    },
    
    get length() {
      return count
    },
    
    get isFull() {
      return count === size
    }
  }
}

/**
 * Parse device address
 * @param {string} address - Address string (IP or hostname)
 * @returns {{host: string, port: number}}
 */
export const parseAddress = (address) => {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address: must be a non-empty string')
  }
  
  const parts = address.split(':')
  if (parts.length === 1) {
    return { host: parts[0].trim(), port: 8080 }
  } else if (parts.length === 2) {
    const port = parseInt(parts[1], 10)
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port number: ${parts[1]}`)
    }
    return { host: parts[0].trim(), port }
  } else {
    throw new Error(`Invalid address format: ${address}`)
  }
}

/**
 * Format bytes for display
 * @param {number} bytes - Number of bytes
 * @returns {string}
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string}
 */
export const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}