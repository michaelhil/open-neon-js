# Open Neon JS API Documentation

> **Comprehensive API Reference for Research Applications**
> 
> This documentation covers all APIs for research-grade eye tracking with Pupil Labs Neon devices.

## 📦 Package Overview

### @open-neon/api - Auto-Detecting Meta Package
```javascript
import { connectToDevice, discoverDevices } from '@open-neon/api'
```

### @open-neon/core - Shared Utilities
```javascript
import { 
  GazeData, DeviceInfo, RecordingInfo,
  parseAddress, isValidGazeData, createError 
} from '@open-neon/core'
```

### @open-neon/node - Node.js Implementation  
```javascript
import { connectToDevice, discoverDevices } from '@open-neon/node'
```

### @open-neon/browser - Browser Implementation
```javascript
import { connectToDevice } from '@open-neon/browser'
```

## 🎯 Core API Reference

### Device Connection

#### `connectToDevice(address, options?)`
Connect to a Pupil Labs Neon device.

```javascript
const device = await connectToDevice('192.168.1.100:8080', {
  timeout: 5000,
  autoReconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 10
})
```

**Parameters:**
- `address` (string): Device IP address and port (e.g., '192.168.1.100:8080')
- `options` (Object, optional):
  - `timeout` (number): Connection timeout in milliseconds (default: 5000)
  - `autoReconnect` (boolean): Enable automatic reconnection (default: true)
  - `reconnectInterval` (number): Reconnection interval in milliseconds (default: 1000)
  - `maxReconnectAttempts` (number): Maximum reconnection attempts (default: 10)

**Returns:** Promise\<Device\>

**Throws:** 
- `ConnectionError` - Failed to connect to device
- `TimeoutError` - Connection attempt timed out
- `InvalidAddressError` - Invalid address format

#### `discoverDevices(options?)` (Node.js only)
Discover Pupil Labs devices on the network using mDNS.

```javascript
const devices = await discoverDevices({
  timeout: 10000,
  deviceTypes: ['Neon', 'Invisible']
})
```

**Parameters:**
- `options` (Object, optional):
  - `timeout` (number): Discovery timeout in milliseconds (default: 10000)
  - `deviceTypes` (Array\<string\>): Device types to discover (default: ['Neon', 'Invisible'])

**Returns:** Promise\<DeviceInfo[]\>

### Device Object API

#### `device.getStatus()`
Get current device status and information.

```javascript
const status = await device.getStatus()
console.log({
  batteryLevel: status.batteryLevel,    // 0-100
  isCharging: status.isCharging,        // boolean
  isWorn: status.isWorn,                // boolean
  firmwareVersion: status.firmwareVersion
})
```

**Returns:** Promise\<DeviceInfo\>

#### `device.createGazeStream(options?)`
Create a real-time gaze data stream.

```javascript
const gazeStream = device.createGazeStream({
  sampleRate: 200,  // Hz
  bufferSize: 100   // samples
})

gazeStream.subscribe({
  next: (gaze) => {
    console.log(`Gaze: (${gaze.x.toFixed(3)}, ${gaze.y.toFixed(3)})`)
    console.log(`Confidence: ${gaze.confidence.toFixed(2)}`)
    console.log(`Timestamp: ${gaze.timestamp}`)
  },
  error: (error) => console.error('Stream error:', error),
  complete: () => console.log('Stream ended')
})
```

**Parameters:**
- `options` (Object, optional):
  - `sampleRate` (number): Sample rate in Hz (default: 200)
  - `bufferSize` (number): Buffer size in samples (default: 100)

**Returns:** Observable\<GazeData\>

#### `device.receiveGazeDatum(timeout?)`
Receive a single gaze data sample.

```javascript
const gaze = await device.receiveGazeDatum(1000)
console.log(`Single gaze sample: (${gaze.x}, ${gaze.y})`)
```

**Parameters:**
- `timeout` (number, optional): Timeout in milliseconds (default: 1000)

**Returns:** Promise\<GazeData\>

#### `device.startRecording(name, options?)`
Start recording gaze data and video.

```javascript
await device.startRecording('experiment_001', {
  template: 'default',
  duration: 60000,  // milliseconds
  gazeData: true,
  sceneVideo: true,
  eyeVideo: false
})
```

**Parameters:**
- `name` (string): Recording name
- `options` (Object, optional):
  - `template` (string): Recording template (default: 'default')
  - `duration` (number): Recording duration in milliseconds
  - `gazeData` (boolean): Record gaze data (default: true)
  - `sceneVideo` (boolean): Record scene video (default: true)
  - `eyeVideo` (boolean): Record eye video (default: false)

**Returns:** Promise\<RecordingInfo\>

#### `device.stopRecording()`
Stop the current recording.

```javascript
const recording = await device.stopRecording()
console.log(`Recording saved: ${recording.id}`)
```

**Returns:** Promise\<RecordingInfo\>

#### `device.getRecording()`
Get current recording status.

```javascript
const recording = await device.getRecording()
console.log({
  isRecording: recording.isRecording,
  duration: recording.duration,
  frameCount: recording.frameCount
})
```

**Returns:** Promise\<RecordingInfo\>

#### `device.startCalibration(points?)`
Start device calibration process.

```javascript
await device.startCalibration([
  { x: 0.1, y: 0.1 },
  { x: 0.5, y: 0.5 },
  { x: 0.9, y: 0.9 }
])
```

**Parameters:**
- `points` (Array\<CalibrationPoint\>, optional): Calibration points (default: 9-point grid)

**Returns:** Promise\<CalibrationResult\>

#### `device.close()`
Close connection to the device.

```javascript
await device.close()
```

**Returns:** Promise\<void\>

## 📊 Data Types

### GazeData
```typescript
interface GazeData {
  x: number              // X coordinate (0-1 normalized)
  y: number              // Y coordinate (0-1 normalized)
  confidence: number     // Confidence score (0-1)
  timestamp: number      // Unix timestamp in seconds
  worn: boolean          // Device wearing status
}
```

### DeviceInfo
```typescript
interface DeviceInfo {
  id: string                // Device ID
  name: string              // Device name
  model: string             // Device model ('Neon' | 'Invisible')
  serialNumber: string      // Serial number
  firmwareVersion: string   // Firmware version
  batteryLevel: number      // Battery level (0-100)
  isCharging: boolean       // Charging status
  isWorn: boolean           // Wearing status
  ipAddress: string         // IP address
  port: number              // API port
}
```

### RecordingInfo
```typescript
interface RecordingInfo {
  id: string                // Recording ID
  name: string              // Recording name
  isRecording: boolean      // Recording status
  startTime: number         // Start timestamp
  duration: number          // Duration in seconds
  frameCount: number        // Video frames recorded
  gazeSampleCount: number   // Gaze samples recorded
}
```

### CalibrationPoint
```typescript
interface CalibrationPoint {
  x: number                 // X coordinate (0-1 normalized)
  y: number                 // Y coordinate (0-1 normalized)
  timestamp: number         // Unix timestamp
}
```

### CalibrationResult
```typescript
interface CalibrationResult {
  success: boolean          // Calibration success
  accuracy: number          // Average accuracy in degrees
  precision: number         // Average precision in degrees
  points: CalibrationPoint[] // Points used
  message: string           // Status message
}
```

## 🔧 Utility Functions

### Address Parsing
```javascript
import { parseAddress } from '@open-neon/core'

const { host, port } = parseAddress('192.168.1.100:8080')
// host: '192.168.1.100', port: 8080

const { host, port } = parseAddress('192.168.1.100')
// host: '192.168.1.100', port: 8080 (default)
```

### Data Validation
```javascript
import { isValidGazeData } from '@open-neon/core'

const isValid = isValidGazeData({
  x: 0.5, y: 0.3, confidence: 0.9, timestamp: Date.now() / 1000
})
// Returns: true
```

### Coordinate Conversion
```javascript
import { normalizedToPixel, pixelToNormalized } from '@open-neon/core'

// Convert normalized coordinates to pixels
const pixel = normalizedToPixel(0.5, 0.3, 1920, 1080)
// { x: 960, y: 324 }

// Convert pixels to normalized coordinates
const normalized = pixelToNormalized(960, 324, 1920, 1080)
// { x: 0.5, y: 0.3 }
```

### Circular Buffer
```javascript
import { createCircularBuffer } from '@open-neon/core'

const buffer = createCircularBuffer(100)
buffer.push(gazeData)
const recentGaze = buffer.getLast()
const allData = buffer.getAll()
```

## ⚠️ Error Handling

### Error Types
- `ConnectionError` - Device connection issues
- `DeviceError` - Device-specific problems
- `StreamError` - Data streaming issues
- `CalibrationError` - Calibration failures
- `RecordingError` - Recording problems

### Error Codes
```javascript
import { ErrorCodes } from '@open-neon/core'

// Connection errors
ErrorCodes.CONNECTION_FAILED
ErrorCodes.CONNECTION_TIMEOUT
ErrorCodes.DEVICE_NOT_FOUND

// Device errors  
ErrorCodes.DEVICE_BUSY
ErrorCodes.DEVICE_NOT_WORN
ErrorCodes.DEVICE_LOW_BATTERY

// Stream errors
ErrorCodes.STREAM_START_FAILED
ErrorCodes.STREAM_INTERRUPTED

// Calibration errors
ErrorCodes.CALIBRATION_FAILED
ErrorCodes.CALIBRATION_POOR_QUALITY
```

### Error Handling Example
```javascript
try {
  const device = await connectToDevice('192.168.1.100:8080')
  const gaze = await device.receiveGazeDatum()
} catch (error) {
  console.log('Error code:', error.code)
  console.log('Error details:', error.details)
  console.log('Suggested solution:', error.details.suggestion)
  
  switch (error.code) {
    case ErrorCodes.CONNECTION_FAILED:
      console.log('Check device network connection')
      break
    case ErrorCodes.DEVICE_NOT_WORN:
      console.log('Ensure device is properly worn')
      break
    case ErrorCodes.CALIBRATION_REQUIRED:
      await device.startCalibration()
      break
  }
}
```

## 🎯 Research-Specific Examples

### PsychoPy Integration
```javascript
// Real-time gaze data for PsychoPy experiments
const device = await connectToDevice('192.168.1.100:8080')
const gazeStream = device.createGazeStream()

gazeStream.subscribe({
  next: (gaze) => {
    // Send to PsychoPy via WebSocket or file
    sendToPsychoPy({
      type: 'gaze',
      x: gaze.x * screenWidth,
      y: gaze.y * screenHeight,
      confidence: gaze.confidence,
      timestamp: gaze.timestamp
    })
  }
})
```

### Statistical Analysis Preparation
```javascript
// Collect gaze data for R/MATLAB analysis
const gazeData = []
const gazeStream = device.createGazeStream()

gazeStream.subscribe({
  next: (gaze) => {
    gazeData.push({
      participant_id: 'P001',
      trial_id: currentTrial,
      gaze_x: gaze.x,
      gaze_y: gaze.y,
      confidence: gaze.confidence,
      timestamp_ms: gaze.timestamp * 1000
    })
  }
})

// Export to CSV for R analysis
const csv = gazeData.map(row => Object.values(row).join(',')).join('\n')
```

### Multi-Device Research Setup
```javascript
// Discover and connect to multiple devices
const devices = await discoverDevices()
const connections = await Promise.all(
  devices.map(device => connectToDevice(device.address))
)

// Synchronize data collection across devices
const streams = connections.map(device => device.createGazeStream())
const synchronizedData = combineLatest(streams)

synchronizedData.subscribe(([gaze1, gaze2]) => {
  // Process synchronized gaze data from multiple participants
  analyzeDualGaze(gaze1, gaze2)
})
```

### Performance Monitoring
```javascript
import { perf } from '@open-neon/core'

// Measure processing performance
const result = await perf.measure(async () => {
  return await processGazeData(gazeSequence)
})

console.log(`Processing took ${result.duration}ms`)
console.log(`Memory usage: ${result.context.memoryUsage.heapUsed}`)
```

## 🔄 Observable Patterns

### RxJS Integration
```javascript
import { map, filter, bufferTime } from 'rxjs/operators'

const gazeStream = device.createGazeStream()

// Filter high-confidence gaze data
const highConfidenceGaze = gazeStream.pipe(
  filter(gaze => gaze.confidence > 0.8)
)

// Buffer gaze data into 100ms windows
const gazeWindows = gazeStream.pipe(
  bufferTime(100)
)

// Convert to screen coordinates
const screenGaze = gazeStream.pipe(
  map(gaze => ({
    ...gaze,
    screenX: gaze.x * screenWidth,
    screenY: gaze.y * screenHeight
  }))
)
```

### Custom Operators
```javascript
// Fixation detection
const detectFixations = (threshold = 50, duration = 100) => {
  return source => source.pipe(
    // Custom fixation detection logic
    bufferTime(duration),
    filter(buffer => buffer.length > 0),
    map(buffer => analyzeFixation(buffer, threshold))
  )
}

const fixations = gazeStream.pipe(
  detectFixations(50, 100)
)
```

## 🚀 Performance Optimization

### Streaming Optimization
```javascript
// Optimize for high-frequency research
const gazeStream = device.createGazeStream({
  sampleRate: 200,        // Maximum supported rate
  bufferSize: 1000        // Large buffer for stability
})

// Process in batches for efficiency
gazeStream.pipe(
  bufferTime(50),         // 50ms batches (20 Hz processing)
  filter(batch => batch.length > 0),
  map(batch => processBatch(batch))
).subscribe(processedData => {
  // Handle processed batch
})
```

### Memory Management
```javascript
// Prevent memory leaks in long experiments
let subscription = gazeStream.subscribe(processGaze)

// Clean up after experiment
setTimeout(() => {
  subscription.unsubscribe()
  device.close()
}, experimentDuration)
```

This API documentation provides comprehensive coverage for research applications. For specific integration examples or advanced usage patterns, see the [examples directory](../examples/) or consult the [research community discussions](https://github.com/michaelhil/open-neon-js/discussions).