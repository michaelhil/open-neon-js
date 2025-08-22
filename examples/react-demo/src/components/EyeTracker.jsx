/**
 * Eye Tracker React Component
 */
import { useState, useEffect, useRef } from 'react'
import { useEyeTracker } from '../hooks/useEyeTracker'

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    color: 'white'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '24px',
    margin: '16px 0',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  button: {
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    border: 'none',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '8px 8px 8px 0',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '16px',
    marginRight: '12px',
    '::placeholder': {
      color: 'rgba(255, 255, 255, 0.6)'
    }
  },
  gazeViz: {
    width: '100%',
    height: '300px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    overflow: 'hidden'
  },
  gazeDot: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    background: 'radial-gradient(circle, #ff6b6b, #ee5a52)',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 20px rgba(255, 107, 107, 0.6)',
    transition: 'all 0.1s ease-out'
  },
  error: {
    background: 'rgba(255, 82, 82, 0.1)',
    border: '1px solid rgba(255, 82, 82, 0.3)',
    color: '#ff5252',
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0'
  },
  success: {
    background: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid rgba(76, 175, 80, 0.3)',
    color: '#4caf50',
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },
  statusItem: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }
}

export function EyeTracker() {
  const [deviceAddress, setDeviceAddress] = useState('127.0.0.1:8080')
  const [recordingId, setRecordingId] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const gazeHistoryRef = useRef([])
  
  const {
    isConnected,
    isConnecting,
    error,
    gaze,
    status,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    startCalibration,
    stopCalibration,
    clearError
  } = useEyeTracker(deviceAddress)
  
  // Track recording and calibration state from status
  useEffect(() => {
    if (status) {
      setIsRecording(status.isRecording || false)
      setIsCalibrating(status.isCalibrating || false)
    }
  }, [status])
  
  // Update gaze history for visualization
  useEffect(() => {
    if (gaze) {
      gazeHistoryRef.current.push({ ...gaze, id: Date.now() })
      if (gazeHistoryRef.current.length > 100) {
        gazeHistoryRef.current.shift()
      }
    }
  }, [gaze])
  
  const handleStartRecording = async () => {
    try {
      const id = recordingId || `recording_${Date.now()}`
      await startRecording(id)
      setRecordingId(id)
    } catch (err) {
      console.error('Recording failed:', err)
    }
  }
  
  const handleStopRecording = async () => {
    try {
      await stopRecording()
    } catch (err) {
      console.error('Stop recording failed:', err)
    }
  }
  
  const renderGazeVisualization = () => {
    if (!gaze) return null
    
    const dots = gazeHistoryRef.current.slice(-10).map((g, index) => {
      const opacity = (index + 1) / 10
      const size = 10 + (index * 2)
      
      return (
        <div
          key={g.id}
          style={{
            ...styles.gazeDot,
            left: `${g.x * 100}%`,
            top: `${g.y * 100}%`,
            opacity,
            width: `${size}px`,
            height: `${size}px`
          }}
        />
      )
    })
    
    return dots
  }
  
  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '2rem' }}>
        👁️ Pupil Labs Neon Demo
      </h1>
      
      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error.message}
          <button 
            onClick={clearError}
            style={{ ...styles.button, marginLeft: '12px', padding: '4px 12px' }}
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div style={styles.card}>
        <h2>Connection</h2>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <input
            type="text"
            value={deviceAddress}
            onChange={(e) => setDeviceAddress(e.target.value)}
            placeholder="Device IP:Port"
            style={styles.input}
            disabled={isConnected}
          />
          {isConnected ? (
            <button
              onClick={disconnect}
              style={styles.button}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              style={{
                ...styles.button,
                ...(isConnecting ? styles.buttonDisabled : {})
              }}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
        
        <div style={{ 
          display: 'inline-block',
          padding: '8px 16px',
          borderRadius: '20px',
          background: isConnected 
            ? 'rgba(76, 175, 80, 0.2)' 
            : 'rgba(255, 82, 82, 0.2)',
          color: isConnected ? '#4caf50' : '#ff5252',
          border: `1px solid ${isConnected ? '#4caf50' : '#ff5252'}`
        }}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      {isConnected && status && (
        <div style={styles.card}>
          <h2>Device Status</h2>
          <div style={styles.statusGrid}>
            <div style={styles.statusItem}>
              <strong>Model:</strong> {status.model}
            </div>
            <div style={styles.statusItem}>
              <strong>Battery:</strong> {status.batteryLevel}%
            </div>
            <div style={styles.statusItem}>
              <strong>Worn:</strong> {status.isWorn ? '👁️ Yes' : '❌ No'}
            </div>
            <div style={styles.statusItem}>
              <strong>Recording:</strong> {isRecording ? '🔴 Active' : '⚪ Inactive'}
            </div>
          </div>
        </div>
      )}
      
      {isConnected && (
        <div style={styles.card}>
          <h2>Recording Control</h2>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={recordingId}
              onChange={(e) => setRecordingId(e.target.value)}
              placeholder="Recording ID (optional)"
              style={styles.input}
            />
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                style={{ ...styles.button, background: 'linear-gradient(45deg, #ff5722, #e64a19)' }}
              >
                ⏹️ Stop Recording
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                style={{ ...styles.button, background: 'linear-gradient(45deg, #ff5722, #e64a19)' }}
              >
                🔴 Start Recording
              </button>
            )}
          </div>
          
          <div>
            {isCalibrating ? (
              <button
                onClick={stopCalibration}
                style={{ ...styles.button, background: 'linear-gradient(45deg, #ff9800, #f57c00)' }}
              >
                ❌ Stop Calibration
              </button>
            ) : (
              <button
                onClick={startCalibration}
                style={{ ...styles.button, background: 'linear-gradient(45deg, #ff9800, #f57c00)' }}
              >
                🎯 Start Calibration
              </button>
            )}
          </div>
        </div>
      )}
      
      {isConnected && (
        <div style={styles.card}>
          <h2>Live Gaze Data</h2>
          {gaze ? (
            <div style={{ marginBottom: '16px' }}>
              <p><strong>X:</strong> {gaze.x.toFixed(3)} <strong>Y:</strong> {gaze.y.toFixed(3)}</p>
              <p><strong>Confidence:</strong> {(gaze.confidence * 100).toFixed(1)}%</p>
              <p><strong>Timestamp:</strong> {new Date(gaze.timestamp * 1000).toLocaleTimeString()}</p>
            </div>
          ) : (
            <p>No gaze data received yet...</p>
          )}
          
          <div style={styles.gazeViz}>
            {renderGazeVisualization()}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              fontSize: '12px',
              opacity: 0.6
            }}>
              Gaze Visualization ({gazeHistoryRef.current.length} samples)
            </div>
          </div>
        </div>
      )}
    </div>
  )
}