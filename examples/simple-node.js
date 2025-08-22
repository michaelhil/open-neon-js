/**
 * Simple Node.js example using the Pupil Labs Neon API
 */
import { Device, Discovery } from '@pupil-labs/neon-node'

async function simpleExample() {
  try {
    console.log('🔍 Discovering Pupil Labs devices...')
    
    // In demo mode, connect to mock device
    if (process.env.DEMO_MODE) {
      console.log('🎭 Demo mode: connecting to mock device...')
      const device = await Device.connect(process.env.MOCK_DEVICE_ADDRESS || '127.0.0.1:8081')
      console.log('✅ Connected to mock device:', device.info.name)
      return device
    }
    
    // Method 1: Discover first available device
    const device = await Device.discover({ maxSearchDuration: 5000 })
    
    if (!device) {
      console.log('❌ No devices found')
      
      // Method 2: Connect to known IP address
      console.log('📡 Attempting to connect to known device...')
      const knownDevice = await Device.connect('192.168.1.100')
      console.log('✅ Connected to device:', knownDevice.info.name)
      return knownDevice
    }
    
    console.log('✅ Found device:', device.info.name)
    console.log('📊 Device info:', device.info)
    
    // Get current status
    const status = await device.getStatus()
    console.log('📋 Device status:', status)
    
    // Stream gaze data for 5 seconds
    console.log('👁️  Starting gaze streaming...')
    let gazeCount = 0
    const startTime = Date.now()
    
    while (Date.now() - startTime < 5000) {
      try {
        const gaze = await device.receiveGazeDatum(1000)
        gazeCount++
        console.log(`Gaze ${gazeCount}: x=${gaze.x.toFixed(3)}, y=${gaze.y.toFixed(3)}, confidence=${gaze.confidence.toFixed(3)}`)
      } catch (error) {
        console.log('⏰ Timeout waiting for gaze data')
        break
      }
    }
    
    console.log(`📈 Received ${gazeCount} gaze samples in 5 seconds`)
    
    // Clean up
    await device.close()
    console.log('🔌 Device disconnected')
    
    return device
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code) {
      console.error('🔍 Error code:', error.code)
    }
  }
}

async function discoveryExample() {
  try {
    console.log('\n🔍 Device discovery example...')
    
    // Find all devices
    const devices = await Discovery.find({ timeout: 3000 })
    console.log(`📱 Found ${devices.length} devices:`)
    
    devices.forEach((device, index) => {
      console.log(`  ${index + 1}. ${device.name} (${device.model}) - ${device.ipAddress}:${device.port}`)
    })
    
    // Wait for a specific device
    if (devices.length === 0) {
      console.log('⏳ Waiting for new device to appear...')
      const newDevice = await Discovery.waitFor('some-device-id', { timeout: 5000 })
      console.log('📱 New device appeared:', newDevice.name)
    }
    
  } catch (error) {
    console.error('❌ Discovery error:', error.message)
  }
}

async function streamingExample() {
  try {
    console.log('\n🌊 Reactive streaming example...')
    
    const deviceAddress = process.env.DEMO_MODE ? 
      (process.env.MOCK_DEVICE_ADDRESS || '127.0.0.1:8081') : 
      '192.168.1.100'
    
    const device = await Device.connect(deviceAddress)
    
    // Create gaze stream
    const gazeStream = device.createGazeStream()
    
    const subscription = gazeStream.subscribe({
      next: (gaze) => {
        console.log(`📍 Gaze: (${gaze.x.toFixed(3)}, ${gaze.y.toFixed(3)}) confidence=${gaze.confidence.toFixed(3)}`)
      },
      error: (error) => {
        console.error('❌ Stream error:', error.message)
      },
      complete: () => {
        console.log('✅ Stream completed')
      }
    })
    
    // Stop after 3 seconds
    setTimeout(() => {
      subscription.unsubscribe()
      device.disconnect()
    }, 3000)
    
  } catch (error) {
    console.error('❌ Streaming error:', error.message)
  }
}

// Run examples
async function main() {
  console.log('🚀 Pupil Labs Neon JavaScript API Examples\n')
  
  await simpleExample()
  await discoveryExample()
  await streamingExample()
  
  console.log('\n✅ Examples completed!')
}

if (import.meta.main) {
  main().catch(console.error)
}

export { simpleExample, discoveryExample, streamingExample }