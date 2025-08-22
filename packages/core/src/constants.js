/**
 * API endpoints
 */
export const API_PATHS = {
  STATUS: '/api/status',
  RECORDING: '/api/recording',
  CALIBRATION: '/api/calibration',
  SETTINGS: '/api/settings',
  EVENTS: '/api/events',
  SYSTEM: '/api/system'
}

/**
 * WebSocket endpoints
 */
export const WS_PATHS = {
  STATUS: '/api/status',
  GAZE: '/api/gaze',
  VIDEO: '/api/video',
  IMU: '/api/imu',
  EVENTS: '/api/events'
}

/**
 * RTSP stream paths
 */
export const RTSP_PATHS = {
  SCENE: '/scene',
  EYES: '/eyes',
  GAZE: '/gaze'
}

/**
 * Default configuration values
 */
export const DEFAULTS = {
  PORT: 8080,
  CONNECTION_TIMEOUT: 5000,
  RECONNECT_INTERVAL: 1000,
  MAX_RECONNECT_ATTEMPTS: 10,
  DISCOVERY_TIMEOUT: 10000,
  GAZE_SAMPLE_RATE: 200,
  VIDEO_FRAME_RATE: 30,
  BUFFER_SIZE: 100,
  SYNC_TOLERANCE: 0.05 // 50ms tolerance for frame-gaze matching
}

/**
 * Device capabilities by model
 */
export const DEVICE_CAPABILITIES = {
  Neon: {
    maxGazeRate: 200,
    maxVideoRate: 30,
    hasIMU: true,
    hasWorldCamera: true,
    hasEyeCameras: true,
    hasPupilDiameter: true,
    hasEyeState3D: true,
    supportsCalibrationFree: true
  },
  Invisible: {
    maxGazeRate: 200,
    maxVideoRate: 30,
    hasIMU: true,
    hasWorldCamera: true,
    hasEyeCameras: false,
    hasPupilDiameter: false,
    hasEyeState3D: false,
    supportsCalibrationFree: false
  }
}

/**
 * MIME types
 */
export const MIME_TYPES = {
  JSON: 'application/json',
  MSGPACK: 'application/msgpack',
  H264: 'video/h264',
  JPEG: 'image/jpeg',
  RAW: 'application/octet-stream'
}

/**
 * Event types
 */
export const EVENT_TYPES = {
  // Connection events
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
  
  // Device events
  DEVICE_WORN: 'device.worn',
  DEVICE_REMOVED: 'device.removed',
  BATTERY_LOW: 'battery.low',
  BATTERY_CRITICAL: 'battery.critical',
  
  // Stream events
  STREAM_STARTED: 'stream.started',
  STREAM_STOPPED: 'stream.stopped',
  STREAM_ERROR: 'stream.error',
  
  // Recording events
  RECORDING_STARTED: 'recording.started',
  RECORDING_STOPPED: 'recording.stopped',
  RECORDING_ERROR: 'recording.error',
  
  // Calibration events
  CALIBRATION_STARTED: 'calibration.started',
  CALIBRATION_POINT: 'calibration.point',
  CALIBRATION_COMPLETE: 'calibration.complete',
  CALIBRATION_FAILED: 'calibration.failed',
  
  // Data events
  GAZE_DATA: 'data.gaze',
  VIDEO_FRAME: 'data.video',
  IMU_DATA: 'data.imu',
  EYE_STATE: 'data.eyeState',
  
  // Eye events
  BLINK_START: 'eye.blink.start',
  BLINK_END: 'eye.blink.end',
  FIXATION_START: 'eye.fixation.start',
  FIXATION_END: 'eye.fixation.end',
  SACCADE: 'eye.saccade'
}

/**
 * Time constants (in ms)
 */
export const TIMEOUTS = {
  CONNECTION: 5000,
  API_REQUEST: 3000,
  STREAM_START: 10000,
  CALIBRATION: 60000,
  DISCOVERY: 10000
}

/**
 * Buffer sizes
 */
export const BUFFER_SIZES = {
  GAZE: 1000,
  VIDEO: 30,
  IMU: 500,
  EVENTS: 100
}

/**
 * Validation ranges
 */
export const VALIDATION = {
  GAZE_X: { min: 0, max: 1 },
  GAZE_Y: { min: 0, max: 1 },
  CONFIDENCE: { min: 0, max: 1 },
  BATTERY: { min: 0, max: 100 },
  SAMPLE_RATE: { min: 1, max: 200 },
  FRAME_RATE: { min: 1, max: 60 },
  PORT: { min: 1, max: 65535 }
}

/**
 * Service discovery
 */
export const MDNS = {
  SERVICE_TYPE: '_http._tcp',
  DOMAIN: 'local',
  NEON_NAME_PREFIX: 'Neon monitor',
  INVISIBLE_NAME_PREFIX: 'PI monitor'
}