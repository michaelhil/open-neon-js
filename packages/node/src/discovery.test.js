import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createDiscovery } from './discovery.js'

// Mock Bonjour
vi.mock('bonjour-service', () => {
  const mockBrowser = {
    on: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  }
  
  const mockBonjour = {
    find: vi.fn(() => mockBrowser)
  }
  
  return {
    Bonjour: vi.fn(() => mockBonjour),
    __mockBrowser: mockBrowser,
    __mockBonjour: mockBonjour
  }
})

describe('Discovery', () => {
  let discovery
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    if (discovery) {
      discovery.stop()
    }
  })
  
  describe('createDiscovery', () => {
    it('should create discovery service', () => {
      discovery = createDiscovery()
      
      expect(discovery).toBeDefined()
      expect(typeof discovery.start).toBe('function')
      expect(typeof discovery.stop).toBe('function')
      expect(typeof discovery.getDevices).toBe('function')
    })
    
    it('should start and stop discovery', () => {
      discovery = createDiscovery()
      
      discovery.start()
      // Verify Bonjour browser was started
      expect(discovery.getDevices()).toEqual([])
      
      discovery.stop()
      // Should clean up
    })
    
    it('should handle device events', async (done) => {
      discovery = createDiscovery()
      
      discovery.on('device', (device) => {
        expect(device).toBeDefined()
        expect(device.id).toBeDefined()
        expect(device.ipAddress).toBeDefined()
        done()
      })
      
      discovery.start()
      
      // Simulate device discovery
      const { __mockBrowser } = await import('bonjour-service')
      const mockService = {
        name: 'Neon monitor:test:123',
        addresses: ['192.168.1.100'],
        port: 8080,
        txt: { id: 'test-device' }
      }
      
      // Trigger device found
      __mockBrowser.on.mock.calls.find(call => call[0] === 'up')?.[1]?.(mockService)
    })
  })
})