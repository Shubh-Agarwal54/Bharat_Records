import { useState, useEffect } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'
import { biometricAPI } from '../services/api'
import './BiometricLockScreen.css'

function BiometricLockScreen({ onUnlock, onSkip }) {
  const [status, setStatus] = useState('idle') // idle | scanning | error | success
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Auto-trigger on mount
    handleScan()
  }, [])

  const handleScan = async () => {
    setStatus('scanning')
    setErrorMsg('')

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user._id || user.id

      if (!userId) {
        setStatus('error')
        setErrorMsg('Session expired. Please log in again.')
        return
      }

      // Get challenge from server
      const optionsRes = await biometricAPI.getAuthOptions(userId)
      if (!optionsRes.success) {
        setStatus('error')
        setErrorMsg(optionsRes.message || 'Failed to get auth options.')
        return
      }

      // Trigger browser biometric prompt
      let authResponse
      try {
        authResponse = await startAuthentication({ optionsJSON: optionsRes.data })
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          setStatus('error')
          setErrorMsg('Biometric scan cancelled or not allowed.')
        } else {
          setStatus('error')
          setErrorMsg(err.message || 'Biometric scan failed.')
        }
        return
      }

      // Verify with server
      const verifyRes = await biometricAPI.verifyAuthentication(userId, authResponse)
      if (verifyRes.success) {
        setStatus('success')
        setTimeout(() => onUnlock(), 500)
      } else {
        setStatus('error')
        setErrorMsg(verifyRes.message || 'Authentication failed.')
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.message || err.message || 'Biometric authentication failed.')
    }
  }

  return (
    <div className="bls-overlay">
      <div className="bls-container">
        <img src="/Logo.png" alt="Bharat Records" className="bls-logo" />

        <h2 className="bls-title">Verify Your Identity</h2>
        <p className="bls-subtitle">Scan your fingerprint or use Face ID to continue</p>

        <div className={`bls-icon-wrap ${status === 'scanning' ? 'bls-icon-pulse' : ''} ${status === 'error' ? 'bls-icon-error' : ''} ${status === 'success' ? 'bls-icon-success' : ''}`}>
          {status === 'success' ? (
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="#4CAF50" strokeWidth="3"/>
              <path d="M24 40l12 12 20-22" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke={status === 'error' ? '#E53935' : '#3D1F8F'} strokeWidth="3"/>
              <path d="M40 20 Q32 30, 32 40 T32 60" stroke={status === 'error' ? '#E53935' : '#3D1F8F'} strokeWidth="3" fill="none"/>
              <path d="M40 20 Q48 30, 48 40 T48 60" stroke={status === 'error' ? '#E53935' : '#3D1F8F'} strokeWidth="3" fill="none"/>
              <path d="M40 24 Q35 32, 35 40 T35 57" stroke={status === 'error' ? '#E53935' : '#3D1F8F'} strokeWidth="2" fill="none"/>
              <path d="M40 24 Q45 32, 45 40 T45 57" stroke={status === 'error' ? '#E53935' : '#3D1F8F'} strokeWidth="2" fill="none"/>
              <ellipse cx="40" cy="30" rx="6" ry="9" stroke={status === 'error' ? '#E53935' : '#3D1F8F'} strokeWidth="3" fill="none"/>
            </svg>
          )}
        </div>

        {status === 'scanning' && (
          <p className="bls-status-text bls-scanning">Scanning...</p>
        )}

        {status === 'error' && (
          <>
            <p className="bls-status-text bls-err">{errorMsg}</p>
            <button className="bls-btn-primary" onClick={handleScan}>
              Try Again
            </button>
          </>
        )}

        {status === 'idle' && (
          <button className="bls-btn-primary" onClick={handleScan}>
            Scan Fingerprint
          </button>
        )}

        <button className="bls-btn-skip" onClick={onSkip}>
          Use Password Instead
        </button>
      </div>
    </div>
  )
}

export default BiometricLockScreen
