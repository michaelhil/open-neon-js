/**
 * @typedef {Object} GazeSemanticData
 * @property {string} description - Human-readable description of gaze location
 * @property {string} region - Screen region (e.g., 'upper_left', 'center', 'lower_right')
 * @property {string} quality - Data quality description (e.g., 'high_confidence', 'moderate', 'low')
 * @property {string} interpretation - Behavioral interpretation (e.g., 'focused_attention', 'scanning')
 * @property {string} [behavior_type] - Gaze behavior classification (e.g., 'fixation', 'saccade', 'smooth_pursuit')
 */

/**
 * @typedef {Object} GazeContextData
 * @property {string} calibration_quality - Calibration status description
 * @property {string} tracking_stability - Tracking stability assessment
 * @property {string} device_health - Overall device health status
 * @property {string} environmental_conditions - Environmental assessment
 */

/**
 * @typedef {Object} GazeDerivedData
 * @property {{x: number, y: number}} [screen_coordinates] - Screen pixel coordinates (if screen size known)
 * @property {string} attention_level - Attention level assessment
 * @property {string} gaze_pattern - Current gaze pattern classification
 * @property {string} confidence_level - Human-readable confidence level
 */

/**
 * @typedef {Object} GazeData
 * @property {number} x - X coordinate (0-1 normalized)
 * @property {number} y - Y coordinate (0-1 normalized)  
 * @property {number} confidence - Confidence value (0-1)
 * @property {number} timestamp - Unix timestamp in seconds
 * @property {boolean} worn - Whether device is being worn
 * @property {GazeSemanticData} [semantic] - Optional semantic enhancement data
 * @property {GazeContextData} [context] - Optional device and environmental context
 * @property {GazeDerivedData} [derived] - Optional derived calculations and interpretations
 */

/**
 * @typedef {Object} VideoFrame
 * @property {Uint8Array} data - Raw pixel data
 * @property {number} width - Frame width in pixels
 * @property {number} height - Frame height in pixels
 * @property {number} timestamp - Unix timestamp in seconds
 * @property {'rgb' | 'bgr' | 'gray'} format - Pixel format
 */

/**
 * @typedef {Object} IMUData
 * @property {[number, number, number, number]} quaternion - Orientation quaternion [w, x, y, z]
 * @property {[number, number, number]} accelerometer - Acceleration [x, y, z] in m/s²
 * @property {[number, number, number]} gyroscope - Angular velocity [x, y, z] in rad/s
 * @property {number} timestamp - Unix timestamp in seconds
 */

/**
 * @typedef {Object} EyeState
 * @property {number} pupilDiameter - Pupil diameter in mm
 * @property {number} eyeballCenterX - Eyeball center X in mm
 * @property {number} eyeballCenterY - Eyeball center Y in mm
 * @property {number} eyeballCenterZ - Eyeball center Z in mm
 * @property {number} opticalAxisX - Optical axis X component
 * @property {number} opticalAxisY - Optical axis Y component
 * @property {number} opticalAxisZ - Optical axis Z component
 * @property {number} confidence - Detection confidence (0-1)
 * @property {number} timestamp - Unix timestamp in seconds
 */

/**
 * @typedef {Object} BlinkEvent
 * @property {'start' | 'end'} type - Blink event type
 * @property {number} timestamp - Unix timestamp in seconds
 * @property {number} duration - Duration in seconds (only for 'end' events)
 */

/**
 * @typedef {Object} FixationEvent
 * @property {'start' | 'end'} type - Fixation event type
 * @property {number} x - X coordinate (0-1 normalized)
 * @property {number} y - Y coordinate (0-1 normalized)
 * @property {number} timestamp - Unix timestamp in seconds
 * @property {number} duration - Duration in seconds (only for 'end' events)
 * @property {number} dispersion - Dispersion in pixels (only for 'end' events)
 */

/**
 * @typedef {Object} SaccadeEvent
 * @property {number} startX - Start X coordinate (0-1 normalized)
 * @property {number} startY - Start Y coordinate (0-1 normalized)
 * @property {number} endX - End X coordinate (0-1 normalized)
 * @property {number} endY - End Y coordinate (0-1 normalized)
 * @property {number} timestamp - Unix timestamp in seconds
 * @property {number} duration - Duration in seconds
 * @property {number} amplitude - Amplitude in degrees
 * @property {number} peakVelocity - Peak velocity in degrees/second
 */

/**
 * @typedef {Object} CalibrationPoint
 * @property {number} x - X coordinate (0-1 normalized)
 * @property {number} y - Y coordinate (0-1 normalized)
 * @property {number} timestamp - Unix timestamp in seconds
 */

/**
 * @typedef {Object} CalibrationResult
 * @property {boolean} success - Whether calibration succeeded
 * @property {number} accuracy - Average accuracy in degrees
 * @property {number} precision - Average precision in degrees
 * @property {CalibrationPoint[]} points - Calibration points used
 * @property {string} message - Human-readable status message
 */

/**
 * @typedef {Object} RecordingInfo
 * @property {string} id - Recording ID
 * @property {string} name - Recording name
 * @property {boolean} isRecording - Whether currently recording
 * @property {number} startTime - Start timestamp in seconds
 * @property {number} duration - Duration in seconds
 * @property {number} frameCount - Number of frames recorded
 * @property {number} gazeSampleCount - Number of gaze samples recorded
 */

/**
 * @typedef {Object} DeviceInfo
 * @property {string} id - Device ID
 * @property {string} name - Device name
 * @property {string} model - Device model (e.g., 'Neon', 'Invisible')
 * @property {string} serialNumber - Serial number
 * @property {string} firmwareVersion - Firmware version
 * @property {number} batteryLevel - Battery level (0-100)
 * @property {boolean} isCharging - Whether device is charging
 * @property {boolean} isWorn - Whether device is being worn
 * @property {string} ipAddress - IP address
 * @property {number} port - API port
 */

/**
 * @typedef {Object} SemanticConfig
 * @property {boolean} enabled - Enable semantic enhancement
 * @property {'basic' | 'enhanced' | 'full'} level - Level of semantic enhancement
 * @property {boolean} includeContext - Include device and environmental context
 * @property {boolean} includeDerivations - Include derived calculations (screen coords, patterns)
 * @property {boolean} humanReadableErrors - Include human-readable error descriptions
 */

/**
 * @typedef {Object} StreamConfig
 * @property {boolean} gaze - Enable gaze streaming
 * @property {boolean} sceneVideo - Enable scene video streaming
 * @property {boolean} eyeVideo - Enable eye video streaming
 * @property {boolean} imu - Enable IMU data streaming
 * @property {boolean} events - Enable eye events streaming
 * @property {number} gazeSampleRate - Gaze sample rate in Hz
 * @property {number} videoFrameRate - Video frame rate in fps
 * @property {SemanticConfig} [semantic] - Optional semantic enhancement configuration
 */

/**
 * @typedef {Object} ConnectionOptions
 * @property {string} address - Device IP address or hostname
 * @property {number} port - API port (default: 8080)
 * @property {number} timeout - Connection timeout in ms
 * @property {boolean} autoReconnect - Enable automatic reconnection
 * @property {number} reconnectInterval - Reconnection interval in ms
 * @property {number} maxReconnectAttempts - Maximum reconnection attempts
 */

export const DeviceModel = {
  NEON: 'Neon',
  INVISIBLE: 'Invisible'
}

export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
}

export const RecordingState = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  ERROR: 'error'
}

export const CalibrationState = {
  IDLE: 'idle',
  COLLECTING: 'collecting',
  COMPUTING: 'computing',
  COMPLETE: 'complete',
  ERROR: 'error'
}