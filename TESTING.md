# 🧪 Testing Infrastructure Documentation

> **Critical System Component**: This testing infrastructure is designed to support both human developers and LLM-assisted development. It provides clear error identification, root cause analysis, and debugging paths.

## 📁 Testing Architecture Overview

```
open-neon-js/
├── 📋 TESTING.md                    ← This document
├── 🔧 test-utils/                   ← Testing utilities & mock infrastructure
│   ├── mock-server.js               ← Complete Pupil Labs device simulation
│   ├── test-helpers.js              ← Common testing utilities
│   └── debugging-tools.js           ← Root cause analysis tools
├── 🎯 tests/                        ← Centralized test suites
│   ├── integration/                 ← Cross-package integration tests
│   ├── performance/                 ← Performance & load testing
│   ├── regression/                  ← Regression test suite
│   └── scenarios/                   ← Real-world usage scenarios
├── 📝 scripts/                      ← Test orchestration scripts
│   ├── test-with-mock.js            ← Automated test runner with mock server
│   ├── test-matrix.js               ← Environment matrix testing
│   └── debug-analyzer.js            ← Automated debugging assistant
├── 📊 examples/                     ← Living documentation & demos
│   ├── simple-node.js               ← Basic Node.js usage
│   ├── react-demo/                  ← Interactive web interface
│   └── debug-scenarios/             ← Common debugging scenarios
└── packages/*/src/**/*.test.js      ← Unit tests (co-located with source)
```

## 🎯 Testing Strategy & Principles

### **1. Multi-Level Testing Pyramid**
```
    🔺 E2E Tests (Browser + Node.js real-world scenarios)
   🔺🔺 Integration Tests (Package interactions + Mock server)
  🔺🔺🔺 Unit Tests (Individual functions + components)
 🔺🔺🔺🔺 Static Analysis (TypeScript + Linting + Documentation)
```

### **2. Error Classification System**
All errors are categorized for rapid root cause identification:

- **🔴 CRITICAL**: System crashes, data corruption, security issues
- **🟡 ERROR**: Feature failures, API incompatibilities, performance issues  
- **🟠 WARNING**: Deprecations, sub-optimal usage, configuration issues
- **🔵 INFO**: Performance metrics, usage patterns, debug information

### **3. Debugging-First Design**
Every test includes:
- **Clear error messages** with specific remediation steps
- **Stack trace enhancement** with source mapping
- **Environment context** (Node.js version, browser, OS)
- **Reproduction steps** for both humans and LLMs

## 🚀 Quick Start Testing Guide

### **For Human Developers**
```bash
# 1. Run all tests with visual feedback
bun test:all

# 2. Start interactive development mode
bun test:watch

# 3. Debug specific issues
bun debug-specific --scenario="connection-timeout"

# 4. Performance profiling
bun test:performance --profile=true
```

### **For LLM Development**
```bash
# 1. Get structured test results for analysis
bun test:json-output > test-results.json

# 2. Run diagnostic suite
bun diagnose --component="websocket" --verbose

# 3. Generate debugging context
bun debug-context --error-code="CONNECTION_FAILED"
```

## 🔧 Core Testing Components

### **1. Mock Server (`test-utils/mock-server.js`)**
**Purpose**: Complete Pupil Labs device simulation for testing without hardware

**Features**:
- ✅ Full HTTP REST API (`/api/status`, `/api/recording`, `/api/calibration`)
- ✅ Real-time WebSocket streams (`/api/gaze`, `/api/status`)
- ✅ mDNS service advertisement (Bonjour discovery)
- ✅ Realistic gaze data generation (200Hz with natural eye movement patterns)
- ✅ Device state simulation (battery, recording, calibration)
- ✅ Network condition simulation (latency, packet loss, reconnection)

**Usage**:
```javascript
import { MockPupilDevice } from './test-utils/mock-server.js'

const device = new MockPupilDevice({
  port: 8080,
  model: 'Neon',
  batteryLevel: 85,
  // Simulate network conditions
  latency: 50,        // 50ms latency
  packetLoss: 0.01    // 1% packet loss
})

await device.start()
// Device available at http://localhost:8080
```

**Debugging Features**:
- Web interface at `http://localhost:8080` for visual inspection
- Detailed console logging with timestamps
- Network traffic simulation and monitoring
- State inspection and manual control

### **2. Test Runner (`scripts/test-with-mock.js`)**
**Purpose**: Orchestrates test execution with automatic mock server lifecycle

**Features**:
- ✅ Automatic mock server startup/shutdown
- ✅ Environment isolation (no port conflicts)
- ✅ Graceful error handling and cleanup
- ✅ Parallel test execution support
- ✅ JSON and human-readable output formats

**Error Handling**:
```javascript
// Structured error output for LLM analysis
{
  "testResults": {
    "passed": 15,
    "failed": 2,
    "errors": [
      {
        "test": "WebSocket Connection",
        "error": "CONNECTION_TIMEOUT",
        "cause": "Mock server not responding on port 8081",
        "solution": "Check if port is available or firewall blocking",
        "context": {
          "nodeVersion": "18.17.0",
          "platform": "darwin",
          "memoryUsage": "45MB"
        }
      }
    ]
  }
}
```

### **3. Debug Analyzer (`scripts/debug-analyzer.js`)**
**Purpose**: Automated root cause analysis for test failures

**Features**:
- ✅ Error pattern recognition
- ✅ Environment compatibility checking  
- ✅ Performance bottleneck identification
- ✅ Dependency conflict detection
- ✅ Network connectivity validation

## 📋 Test Categories & Coverage

### **🔬 Unit Tests** (Co-located with source)
**Location**: `packages/*/src/**/*.test.js`
**Coverage**: Individual functions, utilities, error handling
**Example**:
```javascript
// packages/core/src/utils.test.js
describe('parseAddress', () => {
  it('should handle IPv4 addresses correctly', () => {
    expect(parseAddress('192.168.1.100:8080')).toEqual({
      host: '192.168.1.100',
      port: 8080
    })
  })
  
  it('should provide clear error for invalid input', () => {
    expect(() => parseAddress('')).toThrow('Invalid address: must be a non-empty string')
  })
})
```

### **🔗 Integration Tests** (`tests/integration/`)
**Purpose**: Cross-package functionality and API compatibility
**Key Scenarios**:
- Device discovery and connection
- Real-time data streaming  
- Error handling and recovery
- Network resilience
- Memory usage patterns

### **🎭 Scenario Tests** (`tests/scenarios/`)
**Purpose**: Real-world usage patterns and edge cases
**Examples**:
- `connection-loss-recovery.test.js` - Network interruption handling
- `high-frequency-streaming.test.js` - Performance under load
- `multi-device-discovery.test.js` - Multiple device handling
- `browser-compatibility.test.js` - Cross-browser testing

### **⚡ Performance Tests** (`tests/performance/`)
**Purpose**: Latency, throughput, and resource usage validation
**Metrics Tracked**:
- Gaze data latency (target: < 50ms)
- Memory usage over time (leak detection)
- CPU usage under load
- Bundle size optimization
- Startup/connection times

## 🐛 Debugging & Troubleshooting System

### **Error Code Reference**
All errors include structured codes for rapid identification:

```javascript
// Error structure optimized for both human and LLM debugging
{
  name: "ConnectionError",
  code: "CONNECTION_FAILED", 
  message: "Failed to connect to device at 192.168.1.100:8080",
  details: {
    host: "192.168.1.100",
    port: 8080,
    timeout: 5000,
    networkError: "ECONNREFUSED"
  },
  timestamp: 1755887456789,
  suggestion: "Check if device is powered on and connected to the same network",
  debugSteps: [
    "Verify device IP with ping command",
    "Check firewall settings",
    "Test with curl: curl http://192.168.1.100:8080/api/status"
  ],
  environment: {
    nodeVersion: "18.17.0",
    platform: "darwin",
    networkInterface: "en0"
  }
}
```

### **Debugging Workflows**

#### **For Connection Issues**:
```bash
# 1. Automated diagnosis
bun debug-connection --device="192.168.1.100:8080"

# 2. Network validation
bun test-network --target="192.168.1.100"

# 3. Mock server validation
bun test-mock --port=8080
```

#### **For Streaming Issues**:
```bash
# 1. WebSocket connection test
bun debug-websocket --url="ws://192.168.1.100:8080/api/gaze"

# 2. Data format validation
bun validate-stream --source="mock" --duration=10s

# 3. Performance profiling
bun profile-streaming --rate=200hz
```

#### **For Package Issues**:
```bash
# 1. Dependency validation
bun check-dependencies --package="@pupil-labs/neon-node"

# 2. API compatibility check
bun test-api-compatibility --version="0.1.0"

# 3. Build validation
bun validate-build --all-packages
```

## 🤖 LLM-Specific Features

### **Structured Test Output**
All test commands support `--format=json` for LLM consumption:
```bash
bun test:all --format=json > results.json
```

**Output Structure**:
```json
{
  "testRun": {
    "timestamp": "2024-08-22T18:30:00.000Z",
    "environment": {
      "node": "18.17.0",
      "platform": "darwin",
      "packages": ["@pupil-labs/neon-core@0.1.0"]
    },
    "summary": {
      "total": 45,
      "passed": 42,
      "failed": 3,
      "duration": 12.5
    },
    "failures": [
      {
        "test": "Integration › Device Connection",
        "file": "tests/integration/connection.test.js:23",
        "error": {
          "type": "ConnectionError",
          "code": "CONNECTION_TIMEOUT",
          "message": "Connection to mock device timed out",
          "cause": "Mock server not responding within 5000ms",
          "possibleCauses": [
            "Mock server not started",
            "Port conflict (8080 already in use)",
            "Network interface not available"
          ],
          "suggestedFixes": [
            "Run 'bun mock-server' in separate terminal",
            "Check port availability with 'lsof -i :8080'", 
            "Try alternative port with MOCK_PORT=8081"
          ]
        }
      }
    ]
  }
}
```

### **Diagnostic Context Generation**
```bash
# Generate comprehensive debugging context for LLM analysis
bun generate-debug-context --issue="websocket-connection" > debug-context.json
```

**Context Output**:
```json
{
  "issue": "websocket-connection",
  "timestamp": "2024-08-22T18:30:00.000Z",
  "environment": {
    "system": { /* OS, Node.js, hardware info */ },
    "network": { /* IP, interfaces, firewall status */ },
    "dependencies": { /* package versions, conflicts */ }
  },
  "relevantTests": [
    "tests/integration/websocket.test.js",
    "packages/node/src/device.test.js"
  ],
  "recentChanges": [
    { "file": "src/device.js", "change": "Updated WebSocket connection logic" }
  ],
  "similarIssues": [
    { "pattern": "CONNECTION_TIMEOUT", "frequency": 3, "lastSeen": "2024-08-20" }
  ],
  "suggestedInvestigation": [
    "Check WebSocket server is running on expected port",
    "Validate WebSocket URL format",
    "Test with direct WebSocket client (wscat)",
    "Review network proxy settings"
  ]
}
```

## 📊 Testing Commands Reference

### **Primary Commands**
| Command | Purpose | Output Format | LLM-Friendly |
|---------|---------|---------------|--------------|
| `bun test:all` | Run complete test suite | Human + JSON | ✅ |
| `bun test:integration` | Integration tests only | Human + JSON | ✅ |
| `bun test:performance` | Performance & load tests | Metrics + JSON | ✅ |
| `bun test:watch` | Interactive test runner | Human | ❌ |

### **Debugging Commands**
| Command | Purpose | Use Case | Output |
|---------|---------|----------|---------|
| `bun debug-connection --device=IP` | Network connectivity test | Connection failures | JSON diagnostics |
| `bun debug-streaming --duration=30s` | Stream quality analysis | Data issues | Performance metrics |
| `bun diagnose --component=websocket` | Component-specific debug | Specific failures | Structured analysis |
| `bun test-environment` | Environment validation | Setup issues | Compatibility report |

### **Mock Server Commands**
| Command | Purpose | Use Case |
|---------|---------|----------|
| `bun mock-server` | Start development mock | Manual testing |
| `bun mock-server --port=8081` | Custom port | Port conflicts |
| `bun mock-server --model=Invisible` | Different device model | Model-specific testing |
| `bun mock-server --latency=100` | Network simulation | Performance testing |

## 🎯 Best Practices for LLM Development

### **1. Always Start with Diagnostics**
```bash
# Before investigating issues, gather context
bun generate-debug-context --issue="your-problem" > context.json
bun test-environment > env-report.json
```

### **2. Use Structured Test Output**
```bash
# Generate LLM-parseable test results
bun test:all --format=json --verbose > results.json
```

### **3. Validate Changes with Full Suite**
```bash
# After code changes, run comprehensive validation
bun test:all && bun test:performance && bun lint
```

### **4. Mock Server for Isolated Testing**
```bash
# Test without hardware dependencies
bun test:with-mock --scenario="your-test-case"
```

## 🔄 Continuous Integration Support

The testing system is designed for CI/CD environments:

```yaml
# .github/workflows/test.yml
- name: Run Test Suite
  run: |
    bun install
    bun test:all --format=json --output=test-results.json
    bun test:performance --format=json --output=perf-results.json
    
- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: |
      test-results.json
      perf-results.json
```

## 📝 Contributing to Testing

### **Adding New Tests**
1. **Unit Tests**: Add alongside source code with `.test.js` suffix
2. **Integration Tests**: Add to `tests/integration/` with descriptive names
3. **Scenarios**: Add to `tests/scenarios/` for real-world use cases

### **Test Naming Convention**
```javascript
// ✅ Good: Descriptive and specific
test('should connect to device and stream gaze data at 200Hz')
test('should recover from network interruption within 3 reconnection attempts')
test('should validate gaze coordinates are within 0-1 range')

// ❌ Bad: Vague and unclear
test('device works')
test('connection test')
test('data validation')
```

### **Error Message Standards**
```javascript
// ✅ Good: Actionable and specific
throw new ConnectionError(
  'Failed to connect to Pupil Labs device at 192.168.1.100:8080',
  ErrorCodes.CONNECTION_TIMEOUT,
  {
    host: '192.168.1.100',
    port: 8080,
    timeout: 5000,
    suggestion: 'Check if device is powered on and accessible on the network',
    debugSteps: ['ping 192.168.1.100', 'curl http://192.168.1.100:8080/api/status']
  }
)

// ❌ Bad: Vague and unhelpful
throw new Error('Connection failed')
```

---

## 🎯 Testing Success Metrics

This testing infrastructure aims to achieve:

- **🎯 95%+ Code Coverage** across all packages
- **⚡ < 2min Test Suite Runtime** for rapid feedback
- **🔍 100% Error Traceability** with clear root cause identification
- **🤖 LLM-Friendly Output** for automated debugging and development
- **📊 Performance Regression Detection** with automated alerts
- **🌐 Cross-Platform Compatibility** validation (Node.js + Browser)

The testing system is designed to evolve with the project, providing reliable foundations for both human developers and LLM-assisted development workflows.