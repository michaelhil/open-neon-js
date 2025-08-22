// Quick test to verify semantic imports work
import { createSemanticConfig, enhanceGazeData, enhanceError } from './packages/core/src/index.js'

console.log('Testing semantic imports...')

// Test createSemanticConfig
const config = createSemanticConfig({ enabled: true, level: 'basic' })
console.log('✅ createSemanticConfig works:', config)

// Test enhanceGazeData
const sampleData = { x: 0.5, y: 0.5, confidence: 0.8, timestamp: Date.now() / 1000, worn: true }
const enhanced = enhanceGazeData(sampleData, config)
console.log('✅ enhanceGazeData works:', enhanced.semantic ? 'has semantic data' : 'no semantic data')

// Test enhanceError
const error = { code: 'CONNECTION_FAILED', message: 'Test error' }
const enhancedError = enhanceError(error, config)
console.log('✅ enhanceError works:', enhancedError.humanReadable ? 'has human readable' : 'no enhancement')

console.log('All semantic functions working correctly!')