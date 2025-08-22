import { describe, it, expect, vi } from 'vitest'
import {
  createDeferred,
  sleep,
  clamp,
  lerp,
  timestampsMatch,
  isValidGazeData,
  normalizedToPixel,
  pixelToNormalized,
  distance,
  createCircularBuffer,
  parseAddress
} from './utils.js'

describe('Utils', () => {
  describe('createDeferred', () => {
    it('should create a deferred promise', async () => {
      const deferred = createDeferred()
      expect(deferred.promise).toBeInstanceOf(Promise)
      expect(typeof deferred.resolve).toBe('function')
      expect(typeof deferred.reject).toBe('function')
      
      deferred.resolve('test')
      await expect(deferred.promise).resolves.toBe('test')
    })
  })
  
  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now()
      await sleep(10)
      const end = Date.now()
      expect(end - start).toBeGreaterThanOrEqual(10)
    })
  })
  
  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-1, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })
  
  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5)
      expect(lerp(10, 20, 0)).toBe(10)
      expect(lerp(10, 20, 1)).toBe(20)
    })
  })
  
  describe('timestampsMatch', () => {
    it('should check if timestamps are within tolerance', () => {
      expect(timestampsMatch(1.0, 1.02, 0.05)).toBe(true)
      expect(timestampsMatch(1.0, 1.1, 0.05)).toBe(false)
    })
  })
  
  describe('isValidGazeData', () => {
    it('should validate gaze data', () => {
      const validGaze = { x: 0.5, y: 0.5, confidence: 0.9, timestamp: 1234567890 }
      expect(isValidGazeData(validGaze)).toBe(true)
      
      const invalidGaze = { x: -1, y: 0.5, confidence: 0.9, timestamp: 1234567890 }
      expect(isValidGazeData(invalidGaze)).toBe(false)
    })
  })
  
  describe('normalizedToPixel', () => {
    it('should convert normalized to pixel coordinates', () => {
      const result = normalizedToPixel(0.5, 0.5, 1920, 1080)
      expect(result).toEqual({ x: 960, y: 540 })
    })
  })
  
  describe('pixelToNormalized', () => {
    it('should convert pixel to normalized coordinates', () => {
      const result = pixelToNormalized(960, 540, 1920, 1080)
      expect(result).toEqual({ x: 0.5, y: 0.5 })
    })
  })
  
  describe('distance', () => {
    it('should calculate distance between points', () => {
      expect(distance(0, 0, 3, 4)).toBe(5)
      expect(distance(0, 0, 0, 0)).toBe(0)
    })
  })
  
  describe('createCircularBuffer', () => {
    it('should create a working circular buffer', () => {
      const buffer = createCircularBuffer(3)
      
      buffer.push('a')
      buffer.push('b')
      expect(buffer.length).toBe(2)
      expect(buffer.getLast()).toBe('b')
      
      buffer.push('c')
      buffer.push('d') // Should overwrite 'a'
      expect(buffer.length).toBe(3)
      expect(buffer.getAll()).toEqual(['b', 'c', 'd'])
    })
  })
  
  describe('parseAddress', () => {
    it('should parse address strings', () => {
      expect(parseAddress('192.168.1.100')).toEqual({ host: '192.168.1.100', port: 8080 })
      expect(parseAddress('192.168.1.100:9090')).toEqual({ host: '192.168.1.100', port: 9090 })
    })
  })
})