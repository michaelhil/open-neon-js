import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { Device, Discovery, discoverOneDevice, connectToDevice } from './index.js'
import { MockPupilDevice } from '../../../test-utils/mock-server.js'

describe('Integration Tests', () => {
  let mockDevice
  const MOCK_PORT = 8081
  const MOCK_ADDRESS = `127.0.0.1:${MOCK_PORT}`
  
  beforeAll(async () => {
    // Start mock device
    mockDevice = new MockPupilDevice({ 
      port: MOCK_PORT,
      name: 'Test Neon Device',
      model: 'Neon',
      serialNumber: 'TEST-001'
    })
    await mockDevice.start()
    
    // Give the server time to fully start
    await new Promise(resolve => setTimeout(resolve, 100))
  }, 10000)
  
  afterAll(async () => {
    if (mockDevice) {
      await mockDevice.stop()
    }
  })
  
  beforeEach(async () => {
    // Reset mock device state
    mockDevice.state.isRecording = false
    mockDevice.state.isCalibrating = false
    mockDevice.state.isWorn = true
  })
  
  describe('Device Discovery', () => {
    it('should discover mock device via mDNS', async () => {
      const devices = await Discovery.find({ timeout: 3000 })
      expect(devices.length).toBeGreaterThan(0)
      
      const testDevice = devices.find(d => d.name.includes('Test Neon'))
      expect(testDevice).toBeDefined()
      expect(testDevice.model).toBe('Neon')
      expect(testDevice.port).toBe(MOCK_PORT)
    }, 5000)
    
    it('should find first device', async () => {
      const device = await Discovery.findFirst({ timeout: 3000 })
      expect(device).toBeDefined()
      expect(device.name).toContain('Test Neon')
    }, 5000)
  })
  
  describe('Device Connection', () => {
    it('should connect to device by address', async () => {
      const device = await connectToDevice(MOCK_ADDRESS, { timeout: 2000 })
      
      expect(device).toBeDefined()
      expect(device.connected).toBe(true)
      expect(device.info.name).toContain('Test Neon')
      
      await device.close()
    }, 5000)
    
    it('should handle connection timeout', async () => {
      await expect(
        connectToDevice('192.168.99.99:8080', { timeout: 500 })
      ).rejects.toThrow()
    }, 2000)
  })
  
  describe('Device API', () => {
    let device
    
    beforeEach(async () => {
      device = await connectToDevice(MOCK_ADDRESS, { timeout: 2000 })
    })
    
    afterEach(async () => {
      if (device) {
        await device.close()
      }
    })
    
    it('should get device status', async () => {
      const status = await device.getStatus()
      
      expect(status).toBeDefined()
      expect(status.id).toBe('TEST-001')
      expect(status.model).toBe('Neon')
      expect(status.batteryLevel).toBeTypeOf('number')
      expect(status.isWorn).toBe(true)
    })
    
    it('should start and stop recording', async () => {
      // Start recording
      const startResult = await device.startRecording('test-recording')
      expect(startResult.success).toBe(true)
      expect(startResult.isRecording).toBe(true)
      
      // Verify recording status
      const recordingStatus = await device.getRecordingStatus()
      expect(recordingStatus.isRecording).toBe(true)
      expect(recordingStatus.recordingId).toBe('test-recording')
      
      // Stop recording
      const stopResult = await device.stopRecording()
      expect(stopResult.success).toBe(true)
      expect(stopResult.isRecording).toBe(false)
    })
    
    it('should handle calibration', async () => {
      // Start calibration
      const startResult = await device.startCalibration()
      expect(startResult.success).toBe(true)
      expect(startResult.isCalibrating).toBe(true)
      
      // Wait for mock calibration to complete
      await new Promise(resolve => setTimeout(resolve, 3500))
      
      // Check calibration status
      const calibrationStatus = await device.getCalibrationStatus()
      expect(calibrationStatus.isCalibrating).toBe(false)
      expect(calibrationStatus.accuracy).toBeGreaterThan(0.8)
    }, 6000)
  })
  
  describe('Data Streaming', () => {
    let device
    
    beforeEach(async () => {
      device = await connectToDevice(MOCK_ADDRESS, { timeout: 2000 })
    })
    
    afterEach(async () => {
      if (device) {
        await device.close()
      }
    })
    
    it('should receive gaze data', async () => {
      const gaze = await device.receiveGazeDatum(2000)
      
      expect(gaze).toBeDefined()
      expect(gaze.x).toBeGreaterThanOrEqual(0)
      expect(gaze.x).toBeLessThanOrEqual(1)
      expect(gaze.y).toBeGreaterThanOrEqual(0)
      expect(gaze.y).toBeLessThanOrEqual(1)
      expect(gaze.confidence).toBeGreaterThan(0)
      expect(gaze.timestamp).toBeGreaterThan(0)
    }, 3000)
    
    it('should timeout when no gaze data', async () => {
      // Simulate device not worn
      mockDevice.state.isWorn = false
      
      await expect(
        device.receiveGazeDatum(500)
      ).rejects.toThrow('Timeout waiting for gaze data')
    }, 2000)
    
    it('should stream multiple gaze samples', async () => {
      const samples = []
      const startTime = Date.now()
      
      // Collect samples for 1 second
      while (Date.now() - startTime < 1000) {
        try {
          const gaze = await device.receiveGazeDatum(100)
          samples.push(gaze)
        } catch (error) {
          break
        }
      }
      
      expect(samples.length).toBeGreaterThan(50) // Should get ~200 samples/sec
      
      // Verify timestamps are increasing
      for (let i = 1; i < samples.length; i++) {
        expect(samples[i].timestamp).toBeGreaterThan(samples[i - 1].timestamp)
      }
    }, 2000)
  })
  
  describe('Reactive Streaming', () => {
    let device
    
    beforeEach(async () => {
      device = await connectToDevice(MOCK_ADDRESS, { timeout: 2000 })
    })
    
    afterEach(async () => {
      if (device) {
        await device.close()
      }
    })
    
    it('should create reactive gaze stream', (done) => {
      const gazeStream = device.device.createGazeStream() // Access underlying device
      const samples = []
      
      const subscription = gazeStream.subscribe({
        next: (gaze) => {
          samples.push(gaze)
          
          if (samples.length >= 10) {
            subscription.unsubscribe()
            
            expect(samples.length).toBe(10)
            samples.forEach(gaze => {
              expect(gaze.x).toBeGreaterThanOrEqual(0)
              expect(gaze.x).toBeLessThanOrEqual(1)
              expect(gaze.confidence).toBeGreaterThan(0)
            })
            
            done()
          }
        },
        error: (error) => {
          done(error)
        }
      })
    }, 3000)
    
    it('should handle stream errors gracefully', (done) => {
      // Disconnect device to simulate error
      setTimeout(() => device.device.disconnect(), 100)
      
      const gazeStream = device.device.createGazeStream()
      
      gazeStream.subscribe({
        next: (gaze) => {
          // Should receive some data before error
        },
        error: (error) => {
          expect(error.name).toBe('StreamError')
          done()
        },
        complete: () => {
          done(new Error('Stream should not complete normally'))
        }
      })
    }, 3000)
  })
  
  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Stop mock server to simulate network error
      await mockDevice.stop()
      
      await expect(
        connectToDevice(MOCK_ADDRESS, { timeout: 1000 })
      ).rejects.toThrow()
      
      // Restart for other tests
      await mockDevice.start()
    }, 3000)
    
    it('should provide helpful error messages', async () => {
      try {
        await connectToDevice('invalid-address', { timeout: 500 })
      } catch (error) {
        expect(error.message).toContain('connection')
        expect(error.code).toBeDefined()
      }
    })
  })
})