/**
 * React hook for Pupil Labs Neon eye tracker
 */
import { useState, useEffect, useRef } from 'react'
import { Device } from '@pupil-labs/neon-browser'

export function useEyeTracker(address, options = {}) {
  const [device, setDevice] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [gaze, setGaze] = useState(null)
  const [status, setStatus] = useState(null)
  const subscriptionRef = useRef(null)
  
  const connect = async () => {
    if (isConnecting || isConnected) return
    
    setIsConnecting(true)
    setError(null)
    
    try {
      const newDevice = await Device.connect(address, options)
      
      // Set up event listeners
      newDevice.device.addEventListener('connected', (event) => {
        setIsConnected(true)
        setStatus(event.detail)
      })
      
      newDevice.device.addEventListener('disconnected', () => {
        setIsConnected(false)
        setGaze(null)
        setStatus(null)
      })
      
      newDevice.device.addEventListener('error', (event) => {
        setError(event.detail)
      })
      
      newDevice.device.addEventListener('status-update', (event) => {
        setStatus(event.detail)
      })
      
      setDevice(newDevice)
      
      // Start gaze streaming
      const gazeStream = newDevice.device.createGazeStream()
      subscriptionRef.current = gazeStream.subscribe({
        next: (gazeData) => setGaze(gazeData),
        error: (err) => setError(err)
      })
      
    } catch (err) {
      setError(err)
    } finally {
      setIsConnecting(false)
    }
  }
  
  const disconnect = async () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }
    
    if (device) {
      await device.close()
      setDevice(null)
    }
    
    setIsConnected(false)
    setGaze(null)
    setStatus(null)
  }
  
  const startRecording = async (recordingId) => {
    if (!device) throw new Error('Device not connected')
    return await device.startRecording(recordingId)
  }
  
  const stopRecording = async () => {
    if (!device) throw new Error('Device not connected')
    return await device.stopRecording()
  }
  
  const startCalibration = async () => {
    if (!device) throw new Error('Device not connected')
    return await device.startCalibration()
  }
  
  const stopCalibration = async () => {
    if (!device) throw new Error('Device not connected')
    return await device.stopCalibration()
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
      if (device) {
        device.close()
      }
    }
  }, [])
  
  return {
    // State
    device,
    isConnected,
    isConnecting,
    error,
    gaze,
    status,
    
    // Actions
    connect,
    disconnect,
    startRecording,
    stopRecording,
    startCalibration,
    stopCalibration,
    
    // Clear error
    clearError: () => setError(null)
  }
}