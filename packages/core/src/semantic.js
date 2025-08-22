/**
 * Semantic Enhancement Utilities for LLM-Friendly Data Formats
 * Phase 1 Implementation: Basic semantic layer with human-readable interpretations
 */

/**
 * Default semantic configuration
 */
export const DEFAULT_SEMANTIC_CONFIG = {
  enabled: false,
  level: 'basic',
  includeContext: true,
  includeDerivations: false,
  humanReadableErrors: true
}

/**
 * Screen regions for gaze location interpretation
 */
const SCREEN_REGIONS = {
  upper_left: { x: [0, 0.33], y: [0, 0.33] },
  upper_center: { x: [0.33, 0.67], y: [0, 0.33] },
  upper_right: { x: [0.67, 1], y: [0, 0.33] },
  middle_left: { x: [0, 0.33], y: [0.33, 0.67] },
  center: { x: [0.33, 0.67], y: [0.33, 0.67] },
  middle_right: { x: [0.67, 1], y: [0.33, 0.67] },
  lower_left: { x: [0, 0.33], y: [0.67, 1] },
  lower_center: { x: [0.33, 0.67], y: [0.67, 1] },
  lower_right: { x: [0.67, 1], y: [0.67, 1] }
}

/**
 * Determine screen region from normalized coordinates
 * @param {number} x - Normalized X coordinate (0-1)
 * @param {number} y - Normalized Y coordinate (0-1)
 * @returns {string} Region name
 */
export const getScreenRegion = (x, y) => {
  for (const [region, bounds] of Object.entries(SCREEN_REGIONS)) {
    if (x >= bounds.x[0] && x < bounds.x[1] && y >= bounds.y[0] && y < bounds.y[1]) {
      return region
    }
  }
  return 'center' // fallback
}

/**
 * Generate human-readable description of gaze location
 * @param {number} x - Normalized X coordinate (0-1)
 * @param {number} y - Normalized Y coordinate (0-1)
 * @returns {string} Human-readable description
 */
export const describeGazeLocation = (x, y) => {
  const region = getScreenRegion(x, y)
  const regionMap = {
    upper_left: 'upper-left corner',
    upper_center: 'top of screen',
    upper_right: 'upper-right corner',
    middle_left: 'left side of screen',
    center: 'center of screen',
    middle_right: 'right side of screen',
    lower_left: 'lower-left corner',
    lower_center: 'bottom of screen',
    lower_right: 'lower-right corner'
  }
  
  return `User is looking at ${regionMap[region]}`
}

/**
 * Classify confidence level into human-readable terms
 * @param {number} confidence - Confidence value (0-1)
 * @returns {string} Quality description
 */
export const classifyDataQuality = (confidence) => {
  if (confidence >= 0.9) return 'excellent'
  if (confidence >= 0.8) return 'high_confidence'
  if (confidence >= 0.6) return 'moderate'
  if (confidence >= 0.4) return 'low_confidence'
  return 'poor'
}

/**
 * Convert numeric confidence to human-readable level
 * @param {number} confidence - Confidence value (0-1)
 * @returns {string} Confidence level description
 */
export const getConfidenceLevel = (confidence) => {
  if (confidence >= 0.9) return 'very_high'
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  if (confidence >= 0.4) return 'low'
  return 'very_low'
}

/**
 * Interpret attention based on confidence and stability
 * @param {number} confidence - Confidence value (0-1)
 * @param {boolean} worn - Whether device is worn
 * @returns {string} Attention interpretation
 */
export const interpretAttention = (confidence, worn) => {
  if (!worn) return 'device_not_worn'
  if (confidence >= 0.8) return 'focused_attention'
  if (confidence >= 0.6) return 'moderate_attention'
  if (confidence >= 0.4) return 'distracted'
  return 'poor_tracking'
}

/**
 * Generate basic gaze behavior classification
 * @param {number} confidence - Confidence value (0-1)
 * @param {boolean} worn - Whether device is worn
 * @returns {string} Behavior type
 */
export const classifyGazeBehavior = (confidence, worn) => {
  if (!worn) return 'no_tracking'
  if (confidence >= 0.8) return 'fixation'
  if (confidence >= 0.5) return 'tracking'
  return 'unstable'
}

/**
 * Enhance gaze data with semantic information
 * @param {Object} gazeData - Raw gaze data
 * @param {Object} config - Semantic configuration
 * @param {Object} [deviceContext] - Optional device context information
 * @returns {Object} Enhanced gaze data with semantic information
 */
export const enhanceGazeData = (gazeData, config = {}, deviceContext = {}) => {
  const semanticConfig = { ...DEFAULT_SEMANTIC_CONFIG, ...config }
  
  if (!semanticConfig.enabled) {
    return gazeData
  }
  
  const enhanced = { ...gazeData }
  
  // Add semantic interpretation
  if (semanticConfig.level === 'basic' || semanticConfig.level === 'enhanced' || semanticConfig.level === 'full') {
    enhanced.semantic = {
      description: describeGazeLocation(gazeData.x, gazeData.y),
      region: getScreenRegion(gazeData.x, gazeData.y),
      quality: classifyDataQuality(gazeData.confidence),
      interpretation: interpretAttention(gazeData.confidence, gazeData.worn)
    }
    
    if (semanticConfig.level === 'enhanced' || semanticConfig.level === 'full') {
      enhanced.semantic.behavior_type = classifyGazeBehavior(gazeData.confidence, gazeData.worn)
    }
  }
  
  // Add context information
  if (semanticConfig.includeContext) {
    enhanced.context = {
      calibration_quality: deviceContext.calibrationQuality || 'unknown',
      tracking_stability: deviceContext.trackingStability || 'stable',
      device_health: deviceContext.deviceHealth || 'optimal',
      environmental_conditions: deviceContext.environmentalConditions || 'good'
    }
  }
  
  // Add derived calculations
  if (semanticConfig.includeDerivations && semanticConfig.level === 'full') {
    enhanced.derived = {
      attention_level: interpretAttention(gazeData.confidence, gazeData.worn),
      gaze_pattern: classifyGazeBehavior(gazeData.confidence, gazeData.worn),
      confidence_level: getConfidenceLevel(gazeData.confidence)
    }
    
    // Add screen coordinates if screen size is provided
    if (deviceContext.screenWidth && deviceContext.screenHeight) {
      enhanced.derived.screen_coordinates = {
        x: Math.round(gazeData.x * deviceContext.screenWidth),
        y: Math.round(gazeData.y * deviceContext.screenHeight)
      }
    }
  }
  
  return enhanced
}

/**
 * Enhance error objects with human-readable descriptions
 * @param {Error} error - Original error object
 * @param {Object} config - Semantic configuration
 * @returns {Object} Enhanced error with semantic information
 */
export const enhanceError = (error, config = {}) => {
  const semanticConfig = { ...DEFAULT_SEMANTIC_CONFIG, ...config }
  
  if (!semanticConfig.humanReadableErrors) {
    return error
  }
  
  const enhanced = { ...error }
  
  // Add human-readable descriptions based on error codes
  const errorDescriptions = {
    CONNECTION_FAILED: 'Unable to connect to the eye tracking device. Please check that the device is powered on and connected to the same network.',
    CONNECTION_TIMEOUT: 'Connection to the device timed out. Please verify network connectivity and firewall settings.',
    CONNECTION_LOST: 'Lost connection to the eye tracking device. The system will attempt to reconnect automatically.',
    DEVICE_NOT_FOUND: 'No eye tracking device was found on the network. Please ensure the device is discoverable and try again.',
    DEVICE_NOT_WORN: 'The eye tracking device is not being worn. Please put on the device to enable eye tracking.',
    DEVICE_LOW_BATTERY: 'The device battery is low. Please charge the device to continue tracking.',
    STREAM_START_FAILED: 'Failed to start data streaming. Please check network bandwidth and device status.',
    STREAM_INTERRUPTED: 'Data streaming was interrupted. The system will attempt to resume automatically.',
    CALIBRATION_FAILED: 'Eye tracking calibration failed. Please ensure good lighting and stable head position, then try again.',
    API_REQUEST_FAILED: 'Communication with the device failed. Please check network connection and device status.'
  }
  
  if (error.code && errorDescriptions[error.code]) {
    enhanced.humanReadable = {
      description: errorDescriptions[error.code],
      severity: error.code.includes('CRITICAL') ? 'critical' : 
                error.code.includes('LOW') || error.code.includes('NOT_WORN') ? 'warning' : 'error',
      recoverable: error.code === 'CONNECTION_LOST' || 
                   error.code === 'STREAM_INTERRUPTED' || 
                   error.code === 'DEVICE_NOT_WORN' || 
                   error.code === 'DEVICE_LOW_BATTERY'
    }
  }
  
  return enhanced
}

/**
 * Create semantic configuration with validation
 * @param {Object} userConfig - User-provided configuration
 * @returns {Object} Validated semantic configuration
 */
export const createSemanticConfig = (userConfig = {}) => {
  const config = { ...DEFAULT_SEMANTIC_CONFIG, ...userConfig }
  
  // Validate level
  if (!['basic', 'enhanced', 'full'].includes(config.level)) {
    console.warn(`Invalid semantic level "${config.level}", using "basic"`)
    config.level = 'basic'
  }
  
  // Ensure boolean values
  config.enabled = Boolean(config.enabled)
  config.includeContext = Boolean(config.includeContext)
  config.includeDerivations = Boolean(config.includeDerivations)
  config.humanReadableErrors = Boolean(config.humanReadableErrors)
  
  // Force includeDerivations to false for non-full levels
  if (config.level !== 'full') {
    config.includeDerivations = false
  }
  
  return config
}