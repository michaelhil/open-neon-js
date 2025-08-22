/**
 * Base error for all Pupil Labs Neon API errors
 */
export const createError = (name, message, code, details = {}) => {
  const error = new Error(message)
  error.name = name
  error.code = code
  error.details = details
  error.timestamp = Date.now()
  return error
}

export const ErrorCodes = {
  // Connection errors
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  CONNECTION_LOST: 'CONNECTION_LOST',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  
  // Device errors
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  DEVICE_BUSY: 'DEVICE_BUSY',
  DEVICE_NOT_WORN: 'DEVICE_NOT_WORN',
  DEVICE_LOW_BATTERY: 'DEVICE_LOW_BATTERY',
  
  // Stream errors
  STREAM_START_FAILED: 'STREAM_START_FAILED',
  STREAM_INTERRUPTED: 'STREAM_INTERRUPTED',
  STREAM_DECODE_ERROR: 'STREAM_DECODE_ERROR',
  STREAM_NOT_AVAILABLE: 'STREAM_NOT_AVAILABLE',
  
  // Recording errors
  RECORDING_START_FAILED: 'RECORDING_START_FAILED',
  RECORDING_STOP_FAILED: 'RECORDING_STOP_FAILED',
  RECORDING_STORAGE_FULL: 'RECORDING_STORAGE_FULL',
  
  // Calibration errors
  CALIBRATION_FAILED: 'CALIBRATION_FAILED',
  CALIBRATION_POOR_QUALITY: 'CALIBRATION_POOR_QUALITY',
  CALIBRATION_INSUFFICIENT_DATA: 'CALIBRATION_INSUFFICIENT_DATA',
  
  // API errors
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  API_INVALID_RESPONSE: 'API_INVALID_RESPONSE',
  API_UNAUTHORIZED: 'API_UNAUTHORIZED',
  API_RATE_LIMITED: 'API_RATE_LIMITED',
  
  // Data errors
  INVALID_DATA_FORMAT: 'INVALID_DATA_FORMAT',
  DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',
  
  // General errors
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  OPERATION_CANCELLED: 'OPERATION_CANCELLED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

/**
 * Create specific error types
 */
export const ConnectionError = (message, details) => 
  createError('ConnectionError', message, ErrorCodes.CONNECTION_FAILED, details)

export const DeviceError = (message, code, details) => 
  createError('DeviceError', message, code || ErrorCodes.DEVICE_NOT_FOUND, details)

export const StreamError = (message, code, details) => 
  createError('StreamError', message, code || ErrorCodes.STREAM_START_FAILED, details)

export const RecordingError = (message, code, details) => 
  createError('RecordingError', message, code || ErrorCodes.RECORDING_START_FAILED, details)

export const CalibrationError = (message, code, details) => 
  createError('CalibrationError', message, code || ErrorCodes.CALIBRATION_FAILED, details)

export const APIError = (message, code, details) => 
  createError('APIError', message, code || ErrorCodes.API_REQUEST_FAILED, details)

/**
 * Error recovery suggestions
 */
export const getRecoverySuggestion = (errorCode) => {
  const suggestions = {
    [ErrorCodes.CONNECTION_FAILED]: 'Check device is powered on and connected to the same network',
    [ErrorCodes.CONNECTION_TIMEOUT]: 'Verify network connectivity and firewall settings',
    [ErrorCodes.CONNECTION_LOST]: 'Device will attempt to reconnect automatically',
    [ErrorCodes.INVALID_ADDRESS]: 'Verify the device IP address is correct',
    
    [ErrorCodes.DEVICE_NOT_FOUND]: 'Ensure device is on the network and discoverable',
    [ErrorCodes.DEVICE_BUSY]: 'Close other applications using the device',
    [ErrorCodes.DEVICE_NOT_WORN]: 'Put on the device to enable eye tracking',
    [ErrorCodes.DEVICE_LOW_BATTERY]: 'Charge the device to continue',
    
    [ErrorCodes.STREAM_START_FAILED]: 'Check network bandwidth and device status',
    [ErrorCodes.STREAM_INTERRUPTED]: 'Stream will attempt to resume automatically',
    [ErrorCodes.STREAM_DECODE_ERROR]: 'Check codec support in your environment',
    [ErrorCodes.STREAM_NOT_AVAILABLE]: 'Enable the stream in device settings',
    
    [ErrorCodes.RECORDING_START_FAILED]: 'Check device storage and permissions',
    [ErrorCodes.RECORDING_STOP_FAILED]: 'Try stopping recording from device directly',
    [ErrorCodes.RECORDING_STORAGE_FULL]: 'Free up space on device storage',
    
    [ErrorCodes.CALIBRATION_FAILED]: 'Ensure good lighting and stable head position',
    [ErrorCodes.CALIBRATION_POOR_QUALITY]: 'Repeat calibration with better conditions',
    [ErrorCodes.CALIBRATION_INSUFFICIENT_DATA]: 'Complete all calibration points',
    
    [ErrorCodes.API_REQUEST_FAILED]: 'Check network connection and API endpoint',
    [ErrorCodes.API_INVALID_RESPONSE]: 'Verify API version compatibility',
    [ErrorCodes.API_UNAUTHORIZED]: 'Check device access permissions',
    [ErrorCodes.API_RATE_LIMITED]: 'Reduce request frequency',
    
    [ErrorCodes.INVALID_DATA_FORMAT]: 'Check data format specifications',
    [ErrorCodes.DATA_VALIDATION_FAILED]: 'Verify data meets requirements',
    
    [ErrorCodes.NOT_IMPLEMENTED]: 'Feature not available in current version',
    [ErrorCodes.INVALID_PARAMETER]: 'Check parameter types and ranges',
    [ErrorCodes.OPERATION_CANCELLED]: 'Operation was cancelled by user',
    [ErrorCodes.UNKNOWN_ERROR]: 'Check logs for more information'
  }
  
  return suggestions[errorCode] || 'An unexpected error occurred'
}

/**
 * Check if error is recoverable
 */
export const isRecoverableError = (errorCode) => {
  const recoverableErrors = [
    ErrorCodes.CONNECTION_LOST,
    ErrorCodes.CONNECTION_TIMEOUT,
    ErrorCodes.STREAM_INTERRUPTED,
    ErrorCodes.DEVICE_NOT_WORN,
    ErrorCodes.DEVICE_LOW_BATTERY,
    ErrorCodes.API_RATE_LIMITED,
    ErrorCodes.OPERATION_CANCELLED
  ]
  
  return recoverableErrors.includes(errorCode)
}