/**
 * Mock Pupil Labs Neon/Invisible device server for testing
 */
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { Bonjour } from 'bonjour-service'

export class MockPupilDevice {
  constructor(options = {}) {
    this.options = {
      port: 8080,
      name: 'Mock Neon Device',
      model: 'Neon',
      serialNumber: 'MOCK-123456',
      firmwareVersion: '1.0.0',
      ...options
    }
    
    this.state = {
      isRecording: false,
      isCalibrating: false,
      batteryLevel: 85,
      isCharging: false,
      isWorn: true,
      connectionCount: 0
    }
    
    this.httpServer = null
    this.wsServer = null
    this.bonjour = null
    this.statusClients = new Set()
    this.gazeClients = new Set()
    
    // Generate mock data
    this.generateMockData()
  }
  
  generateMockData() {
    // Generate realistic gaze data
    this.gazeGenerator = this.createGazeGenerator()
    this.imuGenerator = this.createIMUGenerator()
  }
  
  *createGazeGenerator() {
    let t = 0
    const centerX = 0.5 + Math.random() * 0.2 - 0.1 // 0.4-0.6 range
    const centerY = 0.5 + Math.random() * 0.2 - 0.1
    
    while (true) {
      t += 0.005 // 200Hz sample rate
      
      // Simulate eye movement patterns
      const noise = () => (Math.random() - 0.5) * 0.02
      const saccade = Math.sin(t * 0.1) * 0.1
      
      const gaze = {
        x: Math.max(0, Math.min(1, centerX + saccade + noise())),
        y: Math.max(0, Math.min(1, centerY + Math.sin(t * 0.3) * 0.05 + noise())),
        confidence: 0.8 + Math.random() * 0.2,
        timestamp: Date.now() / 1000,
        worn: this.state.isWorn
      }
      
      yield gaze
    }
  }
  
  *createIMUGenerator() {
    let t = 0
    while (true) {
      t += 0.01 // 100Hz
      
      const imu = {
        quaternion: [
          0.9 + Math.random() * 0.1,
          Math.sin(t * 0.1) * 0.1,
          Math.cos(t * 0.1) * 0.1,
          Math.random() * 0.05
        ],
        accelerometer: [
          Math.sin(t * 0.5) * 0.5,
          Math.cos(t * 0.3) * 0.3,
          9.81 + Math.random() * 0.1
        ],
        gyroscope: [
          Math.random() * 0.1 - 0.05,
          Math.random() * 0.1 - 0.05,
          Math.random() * 0.1 - 0.05
        ],
        timestamp: Date.now() / 1000
      }
      
      yield imu
    }
  }
  
  async start() {
    console.log(`🚀 Starting mock ${this.options.model} device on port ${this.options.port}`)
    
    // Start HTTP server
    this.httpServer = createServer()
    this.httpServer.on('request', this.handleHttpRequest.bind(this))
    
    // Start WebSocket server (handles all paths)
    this.wsServer = new WebSocketServer({ 
      server: this.httpServer
    })
    this.wsServer.on('connection', this.handleWebSocketConnection.bind(this))
    
    // Start mDNS advertisement
    this.bonjour = new Bonjour()
    this.advertiseService()
    
    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.options.port, (err) => {
        if (err) {
          reject(err)
        } else {
          console.log(`✅ Mock device listening on http://localhost:${this.options.port}`)
          resolve()
        }
      })
    })
  }
  
  async stop() {
    console.log('🛑 Stopping mock device...')
    
    // Close WebSocket connections
    this.statusClients.forEach(ws => ws.close())
    this.gazeClients.forEach(ws => ws.close())
    
    // Stop servers
    if (this.wsServer) {
      this.wsServer.close()
    }
    
    if (this.httpServer) {
      this.httpServer.close()
    }
    
    if (this.bonjour) {
      this.bonjour.destroy()
    }
    
    console.log('✅ Mock device stopped')
  }
  
  advertiseService() {
    const serviceName = `${this.options.name}:${this.options.serialNumber}`
    
    this.bonjour.publish({
      name: serviceName,
      type: 'http',
      port: this.options.port,
      txt: {
        id: this.options.serialNumber,
        model: this.options.model,
        version: this.options.firmwareVersion
      }
    })
    
    console.log(`📡 Advertising service: ${serviceName}._http._tcp.local`)
  }
  
  handleHttpRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${this.options.port}`)
    
    // Enable CORS - DEVELOPMENT ONLY
    // WARNING: Wide-open CORS policy (* origin) is only acceptable for testing/development
    // Production deployments should restrict origins to specific domains
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }
    
    try {
      switch (url.pathname) {
        case '/api/status':
          this.handleStatus(req, res)
          break
        case '/api/recording':
          this.handleRecording(req, res)
          break
        case '/api/calibration':
          this.handleCalibration(req, res)
          break
        case '/api/settings':
          this.handleSettings(req, res)
          break
        case '/':
          this.handleRoot(req, res)
          break
        default:
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Not found' }))
      }
    } catch (error) {
      console.error('HTTP request error:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Internal server error' }))
    }
  }
  
  handleStatus(req, res) {
    const status = {
      id: this.options.serialNumber,
      name: this.options.name,
      model: this.options.model,
      serialNumber: this.options.serialNumber,
      firmwareVersion: this.options.firmwareVersion,
      batteryLevel: this.state.batteryLevel,
      isCharging: this.state.isCharging,
      isWorn: this.state.isWorn,
      isRecording: this.state.isRecording,
      isCalibrating: this.state.isCalibrating,
      connectionCount: this.state.connectionCount,
      timestamp: Date.now() / 1000
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(status))
  }
  
  handleRecording(req, res) {
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        try {
          const data = JSON.parse(body)
          
          if (data.action === 'start') {
            this.state.isRecording = true
            console.log('📹 Recording started:', data.recording_id || 'unnamed')
          } else if (data.action === 'stop') {
            this.state.isRecording = false
            console.log('⏹️  Recording stopped')
          }
          
          this.broadcastStatus()
          
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ 
            success: true, 
            isRecording: this.state.isRecording,
            recordingId: data.recording_id || null
          }))
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }
      })
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        isRecording: this.state.isRecording,
        recordingId: this.state.isRecording ? 'current-recording' : null
      }))
    }
  }
  
  handleCalibration(req, res) {
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        try {
          const data = JSON.parse(body)
          
          if (data.action === 'start') {
            this.state.isCalibrating = true
            console.log('🎯 Calibration started')
            
            // Simulate calibration completion after 3 seconds
            setTimeout(() => {
              this.state.isCalibrating = false
              console.log('✅ Calibration completed')
              this.broadcastStatus()
            }, 3000)
          } else if (data.action === 'stop') {
            this.state.isCalibrating = false
            console.log('❌ Calibration stopped')
          }
          
          this.broadcastStatus()
          
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ 
            success: true, 
            isCalibrating: this.state.isCalibrating
          }))
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }
      })
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        isCalibrating: this.state.isCalibrating,
        accuracy: this.state.isCalibrating ? null : 0.95,
        precision: this.state.isCalibrating ? null : 0.87
      }))
    }
  }
  
  handleSettings(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      gazeFrequency: 200,
      sceneVideoEnabled: true,
      eyeVideoEnabled: true,
      imuEnabled: true
    }))
  }
  
  handleRoot(req, res) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock ${this.options.model} Device</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .status { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .recording { background: #fff0f0; }
          .calibrating { background: #f0fff0; }
          button { padding: 10px 20px; margin: 5px; font-size: 16px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>🔬 Mock ${this.options.model} Device</h1>
        <div class="status ${this.state.isRecording ? 'recording' : ''} ${this.state.isCalibrating ? 'calibrating' : ''}">
          <h3>Device Status</h3>
          <p><strong>Model:</strong> ${this.options.model}</p>
          <p><strong>Serial:</strong> ${this.options.serialNumber}</p>
          <p><strong>Battery:</strong> ${this.state.batteryLevel}%</p>
          <p><strong>Recording:</strong> ${this.state.isRecording ? '🔴 Active' : '⚪ Inactive'}</p>
          <p><strong>Calibrating:</strong> ${this.state.isCalibrating ? '🎯 Active' : '⚪ Inactive'}</p>
          <p><strong>Worn:</strong> ${this.state.isWorn ? '👁️ Yes' : '❌ No'}</p>
        </div>
        
        <h3>API Endpoints</h3>
        <ul>
          <li><a href="/api/status">/api/status</a></li>
          <li><a href="/api/recording">/api/recording</a></li>
          <li><a href="/api/calibration">/api/calibration</a></li>
          <li><a href="/api/settings">/api/settings</a></li>
        </ul>
        
        <h3>WebSocket Streams</h3>
        <p>Connect to <code>ws://localhost:${this.options.port}/api/status</code> for real-time updates</p>
        
        <script>
          // Auto-refresh page every 5 seconds
          setTimeout(() => location.reload(), 5000)
        </script>
      </body>
      </html>
    `
    
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  }
  
  handleWebSocketConnection(ws, req) {
    const url = new URL(req.url, `http://localhost:${this.options.port}`)
    
    console.log('🔌 WebSocket connected:', url.pathname)
    this.state.connectionCount++
    
    if (url.pathname === '/api/status') {
      this.statusClients.add(ws)
      
      // Send initial status
      ws.send(JSON.stringify(this.getStatus()))
      
      // Send periodic status updates
      const statusInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          // Simulate battery drain
          if (Math.random() < 0.01) {
            this.state.batteryLevel = Math.max(0, this.state.batteryLevel - 1)
          }
          
          ws.send(JSON.stringify(this.getStatus()))
        } else {
          clearInterval(statusInterval)
        }
      }, 1000)
      
      ws.on('close', () => {
        this.statusClients.delete(ws)
        this.state.connectionCount--
        clearInterval(statusInterval)
        console.log('🔌 Status WebSocket disconnected')
      })
    } else if (url.pathname === '/api/gaze') {
      this.gazeClients.add(ws)
      
      // Send gaze data at 200Hz
      const gazeInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN && this.state.isWorn) {
          const gaze = this.gazeGenerator.next().value
          ws.send(JSON.stringify(gaze))
        } else if (ws.readyState !== ws.OPEN) {
          clearInterval(gazeInterval)
        }
      }, 5) // 200Hz
      
      ws.on('close', () => {
        this.gazeClients.delete(ws)
        clearInterval(gazeInterval)
        console.log('👁️  Gaze WebSocket disconnected')
      })
    }
  }
  
  getStatus() {
    return {
      id: this.options.serialNumber,
      name: this.options.name,
      model: this.options.model,
      batteryLevel: this.state.batteryLevel,
      isCharging: this.state.isCharging,
      isWorn: this.state.isWorn,
      isRecording: this.state.isRecording,
      isCalibrating: this.state.isCalibrating,
      connectionCount: this.state.connectionCount,
      timestamp: Date.now() / 1000
    }
  }
  
  broadcastStatus() {
    const status = this.getStatus()
    const message = JSON.stringify(status)
    
    this.statusClients.forEach(ws => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message)
      }
    })
  }
}

// CLI interface
if (import.meta.main) {
  const device = new MockPupilDevice({
    port: process.env.PORT || 8080,
    name: process.env.DEVICE_NAME || 'Mock Neon Device',
    model: process.env.DEVICE_MODEL || 'Neon'
  })
  
  await device.start()
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    await device.stop()
    process.exit(0)
  })
}