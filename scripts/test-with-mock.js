#!/usr/bin/env node
/**
 * Test runner that starts mock server and runs tests
 * Compatible with both Bun and Node.js
 */
import { spawn } from 'node:child_process'
import { MockPupilDevice } from '../test-utils/mock-server.js'
import { getRuntime, getTestCommand, isBun } from '../packages/core/src/runtime.js'

let mockDevice = null

async function startMockDevice() {
  console.log('🚀 Starting mock device server...')
  mockDevice = new MockPupilDevice({
    port: 8081,
    name: 'Test Neon Device',
    model: 'Neon'
  })
  await mockDevice.start()
  console.log('✅ Mock device ready\n')
}

async function stopMockDevice() {
  if (mockDevice) {
    console.log('\n🛑 Stopping mock device...')
    await mockDevice.stop()
    mockDevice = null
  }
}

async function runTests() {
  const runtime = getRuntime()
  console.log(`🧪 Running tests with ${runtime}...\n`)
  
  return new Promise((resolve, reject) => {
    const [command, ...args] = isBun() 
      ? ['bun', 'test', 'src/integration.test.js']
      : ['npm', 'test', '--', 'src/integration.test.js']
      
    const testProcess = spawn(command, args, {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ All tests passed!')
        resolve()
      } else {
        console.log('\n❌ Some tests failed')
        reject(new Error(`Tests failed with code ${code}`))
      }
    })
    
    testProcess.on('error', (error) => {
      console.error('Failed to start test process:', error)
      reject(error)
    })
  })
}

async function runDemo() {
  const runtime = getRuntime()
  console.log(`🎮 Running demo with ${runtime}...\n`)
  
  return new Promise((resolve, reject) => {
    const [command, ...args] = isBun()
      ? ['bun', 'examples/simple-node.js']
      : ['node', 'examples/simple-node.js']
      
    const demoProcess = spawn(command, args, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        DEMO_MODE: 'true',
        MOCK_DEVICE_ADDRESS: '127.0.0.1:8081'
      }
    })
    
    demoProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Demo completed successfully!')
        resolve()
      } else {
        console.log('\n⚠️  Demo exited with code', code)
        resolve() // Don't fail on demo exit
      }
    })
    
    demoProcess.on('error', (error) => {
      console.error('Failed to start demo:', error)
      reject(error)
    })
  })
}

async function main() {
  const command = process.argv[2] || 'test'
  
  try {
    await startMockDevice()
    
    // Give server time to fully start
    await new Promise(resolve => setTimeout(resolve, 500))
    
    switch (command) {
      case 'test':
        await runTests()
        break
      case 'demo':
        await runDemo()
        break
      case 'both':
        await runTests()
        await runDemo()
        break
      default:
        console.log(`Usage: ${isBun() ? 'bun' : 'node'} test-with-mock.js [test|demo|both]`)
        process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await stopMockDevice()
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Interrupted by user')
  await stopMockDevice()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Terminated')
  await stopMockDevice()
  process.exit(0)
})

main().catch(console.error)