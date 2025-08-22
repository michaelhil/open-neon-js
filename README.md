# Open Neon JS - JavaScript/TypeScript API for Pupil Labs Neon

> Research-grade eye tracking API for Node.js and browsers. Designed for scientific applications requiring high-precision gaze data streaming and device control.

[![npm version](https://badge.fury.io/js/%40open-neon%2Fapi.svg)](https://badge.fury.io/js/%40open-neon%2Fapi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Support](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Bun Support](https://img.shields.io/badge/bun-%3E%3D1.0.0-orange)](https://bun.sh/)

## 🎯 Overview

This library provides a comprehensive JavaScript/TypeScript API for the [Pupil Labs Neon](https://pupil-labs.com/products/neon) eye tracker, enabling real-time gaze data streaming, device control, and experiment management in both Node.js and browser environments.

**Key Features:**
- 🔥 **Real-time gaze streaming** at 200Hz with sub-50ms latency
- 🌐 **Universal compatibility** - Works in Node.js and browsers
- 🔧 **Complete device control** - Recording, calibration, status monitoring
- 📊 **Research-focused** - Built for scientific accuracy and reproducibility
- 🧪 **Comprehensive testing** - Mock hardware for development and CI/CD
- 📱 **Cross-platform** - macOS, Windows, Linux support
- ⚡ **Dual runtime** - Compatible with both Bun and Node.js

## 🚀 Quick Start

### Installation

```bash
# Auto-detecting package (recommended)
npm install @open-neon/api

# Platform-specific packages
npm install @open-neon/node      # Node.js only
npm install @open-neon/browser   # Browser only
```

### Basic Usage

```javascript
import { connectToDevice } from '@open-neon/api'

// Connect to device
const device = await connectToDevice('192.168.1.100:8080')

// Get device status
const status = await device.getStatus()
console.log('Battery level:', status.batteryLevel)

// Stream real-time gaze data
const gazeStream = device.createGazeStream()
gazeStream.subscribe({
  next: (gaze) => {
    console.log(`Gaze: (${gaze.x.toFixed(3)}, ${gaze.y.toFixed(3)})`)
    console.log(`Confidence: ${gaze.confidence.toFixed(2)}`)
  },
  error: (error) => console.error('Stream error:', error),
  complete: () => console.log('Stream ended')
})

// Start recording
await device.startRecording('experiment_001')

// Stop recording after 30 seconds
setTimeout(async () => {
  await device.stopRecording()
  await device.close()
}, 30000)
```

### Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { connectToDevice } from '@open-neon/browser'
    
    const device = await connectToDevice('192.168.1.100:8080')
    const gazeStream = device.createGazeStream()
    
    gazeStream.subscribe({
      next: (gaze) => {
        document.getElementById('gaze').textContent = 
          `Gaze: (${gaze.x.toFixed(3)}, ${gaze.y.toFixed(3)})`
      }
    })
  </script>
</head>
<body>
  <div id="gaze">Connecting...</div>
</body>
</html>
```

## 📦 Package Architecture

This project uses a modular architecture optimized for different environments:

- **`@open-neon/api`** - Auto-detecting meta package (recommended)
- **`@open-neon/core`** - Shared types and utilities
- **`@open-neon/node`** - Node.js implementation with full protocol support
- **`@open-neon/browser`** - Browser-optimized with WebSocket streaming

```javascript
// Auto-detection (recommended)
import { connectToDevice } from '@open-neon/api'

// Platform-specific (advanced usage)
import { connectToDevice } from '@open-neon/node'
import { connectToDevice } from '@open-neon/browser'
```

## 🔧 Development Setup

### Prerequisites

- **Node.js** ≥18.0.0 or **Bun** ≥1.0.0
- **Pupil Labs Neon** device or mock server for testing

### Installation

```bash
# Clone repository
git clone https://github.com/pupil-labs/pupil-labs-neon-js
cd pupil-labs-neon-js

# Install dependencies (works with both npm and bun)
npm install
# or
bun install
```

### Testing

```bash
# Run all tests with mock hardware
npm run test:all

# Start mock server for development
npm run mock-server

# Run tests in watch mode
npm run test:watch

# Performance testing
npm run test:performance
```

### Development with Real Hardware

```bash
# Test connection to real device
npm run test:device -- --ip=192.168.1.100

# Debug connection issues
npm run debug-connection -- --device=192.168.1.100:8080
```

## 📚 API Documentation

### Device Connection

```javascript
import { connectToDevice, discoverDevices } from '@open-neon/api'

// Auto-discovery
const devices = await discoverDevices()
const device = await connectToDevice(devices[0].address)

// Direct connection
const device = await connectToDevice('192.168.1.100:8080', {
  timeout: 5000,
  retries: 3
})
```

### Gaze Data Streaming

```javascript
// Real-time streaming
const gazeStream = device.createGazeStream()

gazeStream.subscribe({
  next: (gaze) => {
    // gaze.x, gaze.y: normalized coordinates (0-1)
    // gaze.confidence: confidence score (0-1)
    // gaze.timestamp: Unix timestamp
    // gaze.worn: device wearing status
  }
})

// Single gaze sample
const gaze = await device.receiveGazeDatum(timeout = 1000)
```

### Recording Control

```javascript
// Start recording
await device.startRecording('experiment_name', {
  template: 'default',
  duration: 60000  // milliseconds
})

// Get recording status
const recording = await device.getRecording()
console.log('Recording ID:', recording.id)

// Stop recording
await device.stopRecording()
```

### Device Status

```javascript
const status = await device.getStatus()
console.log({
  batteryLevel: status.batteryLevel,     // 0-100
  isCharging: status.isCharging,         // boolean
  isWorn: status.isWorn,                 // boolean
  diskSpace: status.diskSpace,           // bytes available
  temperature: status.temperature        // celsius
})
```

## 🧪 Testing Infrastructure

This project includes comprehensive testing designed for research software:

```bash
# Complete test suite
npm run test:all

# Integration tests with mock hardware
npm run test:integration

# Performance and latency testing
npm run test:performance

# Cross-platform compatibility
npm run test:matrix

# Generate test reports for analysis
npm run test:report
```

**Mock Server Features:**
- Complete Pupil Labs API simulation
- Realistic gaze data generation (200Hz)
- Network condition simulation
- Device state management
- Web interface for debugging

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

## 🔬 Research Applications

### PsychoPy Integration

```python
# Python side (PsychoPy)
import psychopy
from psychopy import visual, event

# JavaScript side (this library)
const device = await connectToDevice()
const gazeStream = device.createGazeStream()

gazeStream.subscribe({
  next: (gaze) => {
    // Send gaze data to PsychoPy via WebSocket/OSC
    sendToPsychoPy({ type: 'gaze', data: gaze })
  }
})
```

### Real-time Analysis

```javascript
import { connectToDevice } from '@open-neon/api'
import { filter, map, bufferTime } from 'rxjs'

const device = await connectToDevice()
const gazeStream = device.createGazeStream()

// Fixation detection
const fixations = gazeStream.pipe(
  filter(gaze => gaze.confidence > 0.8),
  bufferTime(100),  // 100ms windows
  map(detectFixations)
)

fixations.subscribe(fixation => {
  console.log('Fixation detected:', fixation)
})
```

## 🌐 Browser Deployment

### ES Modules (Modern)

```html
<script type="module">
  import { connectToDevice } from 'https://unpkg.com/@open-neon/browser/dist/index.js'
  // Your code here
</script>
```

### Bundle Integration

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@open-neon/api': '@open-neon/browser'
    }
  }
}
```

## 🛡️ Error Handling

The API provides comprehensive error handling with detailed context:

```javascript
try {
  const device = await connectToDevice('192.168.1.100:8080')
} catch (error) {
  console.log('Error code:', error.code)              // CONNECTION_FAILED
  console.log('Suggestion:', error.suggestion)        // Check network connectivity
  console.log('Debug steps:', error.debugSteps)       // Array of troubleshooting steps
  console.log('Environment:', error.environment)      // System information
}
```

**Common Error Codes:**
- `CONNECTION_FAILED` - Network connectivity issues
- `DEVICE_NOT_FOUND` - Device discovery failed
- `CALIBRATION_REQUIRED` - Device needs calibration
- `RECORDING_IN_PROGRESS` - Cannot start new recording
- `GAZE_DATA_INVALID` - Data validation failed

## 🤝 Contributing

We welcome contributions from the research community!

### Development Workflow

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Start mock server**: `npm run mock-server`
4. **Run tests**: `npm run test:all`
5. **Make changes** and add tests
6. **Submit pull request**

### Code Standards

- **TypeScript**: Use JSDoc for type annotations
- **Testing**: Maintain >95% test coverage
- **Documentation**: Update docs for API changes
- **Cross-platform**: Test on macOS, Windows, Linux
- **Dual runtime**: Verify Bun and Node.js compatibility

## 📊 Performance

**Typical Performance Metrics:**
- **Latency**: <50ms end-to-end
- **Throughput**: 200Hz sustained
- **Memory**: <50MB steady state
- **Bundle size**: <100KB gzipped (browser)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Pupil Labs**: https://pupil-labs.com/
- **Neon Documentation**: https://docs.pupil-labs.com/neon/
- **Python API**: https://github.com/pupil-labs/realtime-api
- **Issues**: https://github.com/michaelhil/open-neon-js/issues
- **Discussions**: https://github.com/michaelhil/open-neon-js/discussions

## 🙏 Acknowledgments

Built for the research community by researchers. Special thanks to:
- Pupil Labs team for excellent hardware and documentation
- Research community for feedback and testing
- Contributors and maintainers

---

**Research-grade eye tracking for the JavaScript ecosystem** 👁️✨