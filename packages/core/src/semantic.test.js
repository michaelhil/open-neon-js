/**
 * Semantic Enhancement Tests
 */
import { describe, it, expect } from 'vitest'
import {
  getScreenRegion,
  describeGazeLocation,
  classifyDataQuality,
  enhanceGazeData,
  enhanceError,
  createSemanticConfig
} from './semantic.js'

describe('Semantic Enhancement', () => {
  describe('getScreenRegion', () => {
    it('should classify center coordinates correctly', () => {
      expect(getScreenRegion(0.5, 0.5)).toBe('center')
    })
    
    it('should classify corner coordinates correctly', () => {
      expect(getScreenRegion(0.1, 0.1)).toBe('upper_left')
      expect(getScreenRegion(0.9, 0.1)).toBe('upper_right')
      expect(getScreenRegion(0.1, 0.9)).toBe('lower_left')
      expect(getScreenRegion(0.9, 0.9)).toBe('lower_right')
    })
  })
  
  describe('describeGazeLocation', () => {
    it('should provide human-readable descriptions', () => {
      expect(describeGazeLocation(0.5, 0.5)).toBe('User is looking at center of screen')
      expect(describeGazeLocation(0.1, 0.1)).toBe('User is looking at upper-left corner')
    })
  })
  
  describe('classifyDataQuality', () => {
    it('should classify confidence levels correctly', () => {
      expect(classifyDataQuality(0.95)).toBe('excellent')
      expect(classifyDataQuality(0.85)).toBe('high_confidence')
      expect(classifyDataQuality(0.65)).toBe('moderate')
      expect(classifyDataQuality(0.45)).toBe('low_confidence')
      expect(classifyDataQuality(0.25)).toBe('poor')
    })
  })
  
  describe('enhanceGazeData', () => {
    const sampleGazeData = {
      x: 0.5,
      y: 0.3,
      confidence: 0.85,
      timestamp: 1692720000.123,
      worn: true
    }
    
    it('should return original data when disabled', () => {
      const result = enhanceGazeData(sampleGazeData, { enabled: false })
      expect(result).toEqual(sampleGazeData)
    })
    
    it('should add semantic information when enabled', () => {
      const result = enhanceGazeData(sampleGazeData, { enabled: true, level: 'basic' })
      
      expect(result.semantic).toBeDefined()
      expect(result.semantic.description).toBe('User is looking at top of screen')
      expect(result.semantic.region).toBe('upper_center')
      expect(result.semantic.quality).toBe('high_confidence')
      expect(result.semantic.interpretation).toBe('focused_attention')
    })
    
    it('should include context when configured', () => {
      const result = enhanceGazeData(sampleGazeData, { 
        enabled: true, 
        level: 'basic',
        includeContext: true 
      })
      
      expect(result.context).toBeDefined()
      expect(result.context.calibration_quality).toBe('unknown')
      expect(result.context.tracking_stability).toBe('stable')
    })
  })
  
  describe('createSemanticConfig', () => {
    it('should create valid default config', () => {
      const config = createSemanticConfig()
      
      expect(config.enabled).toBe(false)
      expect(config.level).toBe('basic')
      expect(config.includeContext).toBe(true)
      expect(config.includeDerivations).toBe(false)
    })
    
    it('should validate and fix invalid levels', () => {
      const config = createSemanticConfig({ level: 'invalid' })
      expect(config.level).toBe('basic')
    })
  })
  
  describe('enhanceError', () => {
    it('should add human-readable descriptions to errors', () => {
      const error = {
        code: 'CONNECTION_FAILED',
        message: 'Connection failed'
      }
      
      const enhanced = enhanceError(error, { humanReadableErrors: true })
      
      expect(enhanced.humanReadable).toBeDefined()
      expect(enhanced.humanReadable.description).toContain('Unable to connect')
      expect(enhanced.humanReadable.severity).toBe('error')
      expect(enhanced.humanReadable.recoverable).toBe(false)
    })
  })
})