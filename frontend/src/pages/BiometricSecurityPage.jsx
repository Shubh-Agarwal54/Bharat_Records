import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { startRegistration } from '@simplewebauthn/browser'
import { biometricAPI } from '../services/api'
import './BiometricSecurityPage.css'

function BiometricSecurityPage() {
  const navigate = useNavigate()
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load current status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await biometricAPI.getStatus()
        if (res.success) {
          setIsEnabled(res.data.enabled)
          // Sync localStorage
          const user = JSON.parse(localStorage.getItem('user') || '{}')
          user.biometricEnabled = res.data.enabled
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('biometricEnabled', String(res.data.enabled))
        }
      } catch (err) {
        // If auth fails, still show page
        const cached = localStorage.getItem('biometricEnabled') === 'true'
        setIsEnabled(cached)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  const handleEnable = async () => {
    setError('')
    setSuccess('')

    // Check WebAuthn support
    if (!window.PublicKeyCredential) {
      setError('Biometric authentication is not supported on this device or browser.')
      return
    }

    setActionLoading(true)
    try {
      // Step 1: Get registration options from server
      const optionsRes = await biometricAPI.getRegistrationOptions()
      if (!optionsRes.success) {
        setError(optionsRes.message || 'Failed to start registration.')
        return
      }

      // Step 2: Trigger browser biometric (fingerprint/face)
      let registrationResponse
      try {
        registrationResponse = await startRegistration({ optionsJSON: optionsRes.data })
      } catch (err) {
        if (err.name === 'InvalidStateError') {
          setError('This device is already registered. Disable first to re-register.')
        } else if (err.name === 'NotAllowedError') {
          setError('Biometric scan cancelled or not allowed.')
        } else {
          setError(err.message || 'Biometric registration failed.')
        }
        return
      }

      // Step 3: Verify and save credential on server
      const verifyRes = await biometricAPI.verifyRegistration(registrationResponse)
      if (verifyRes.success) {
        setIsEnabled(true)
        localStorage.setItem('biometricEnabled', 'true')
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        user.biometricEnabled = true
        localStorage.setItem('user', JSON.stringify(user))
        setSuccess('Biometric enabled! You will be asked to scan on every login.')
      } else {
        setError(verifyRes.message || 'Registration verification failed.')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to enable biometric.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDisable = async () => {
    setError('')
    setSuccess('')
    setActionLoading(true)
    try {
      const res = await biometricAPI.disable()
      if (res.success) {
        setIsEnabled(false)
        localStorage.setItem('biometricEnabled', 'false')
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        user.biometricEnabled = false
        localStorage.setItem('user', JSON.stringify(user))
        setSuccess('Biometric disabled successfully.')
      } else {
        setError(res.message || 'Failed to disable biometric.')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to disable biometric.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="biometric-page">
      <div className="biometric-content">
        <div className="logo-section">
          <img src="/Logo.png" alt="Bharat Records" className="app-logo" />
          {/* <p className="tagline">SMART WALLET FOR SMART PEOPLE</p> */}
        </div>

        <h1 className="page-title">Bio Metric Security</h1>

        <div className="info-text">
          {/* <p>Ruth Dsouza Prabhu Ruth Dsouza Prabhu Last Updated: July 29, 2021</p> */}
          <p>Biometric authentication is defined as a security measure that matches the biometric features of a user looking to access a device or a system. Access to the system is granted only when the parameters match those stored in the database for that particular user. Click here to learn about the basics of biometric authentication and the top seven biometric authentication tools in 2021. Table of ContentsWhat Is Biometric Authentication?</p>
        </div>

        <div className="fingerprint-icon">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" stroke={isEnabled ? '#4CAF50' : '#3D1F8F'} strokeWidth="3"/>
            <path d="M60 30 Q45 45, 45 60 T45 90" stroke={isEnabled ? '#4CAF50' : '#3D1F8F'} strokeWidth="3" fill="none"/>
            <path d="M60 30 Q75 45, 75 60 T75 90" stroke={isEnabled ? '#4CAF50' : '#3D1F8F'} strokeWidth="3" fill="none"/>
            <path d="M60 35 Q52 47, 52 60 T52 85" stroke={isEnabled ? '#4CAF50' : '#3D1F8F'} strokeWidth="2" fill="none"/>
            <path d="M60 35 Q68 47, 68 60 T68 85" stroke={isEnabled ? '#4CAF50' : '#3D1F8F'} strokeWidth="2" fill="none"/>
            <ellipse cx="60" cy="45" rx="8" ry="12" stroke={isEnabled ? '#4CAF50' : '#3D1F8F'} strokeWidth="3" fill="none"/>
          </svg>
        </div>

        {loading ? (
          <p className="bms-status-badge">Loading...</p>
        ) : (
          <p className={`bms-status-badge ${isEnabled ? 'bms-badge-on' : 'bms-badge-off'}`}>
            {isEnabled ? '✅ Biometric is Enabled' : '❌ Biometric is Disabled'}
          </p>
        )}

        {error && <div className="bms-error">{error}</div>}
        {success && <div className="bms-success">{success}</div>}

        <button
          className="enable-button"
          onClick={handleEnable}
          disabled={actionLoading || loading || isEnabled}
        >
          {actionLoading && !isEnabled ? 'Enabling...' : 'Enable'}
        </button>

        <button
          className="disable-button"
          onClick={isEnabled ? handleDisable : () => navigate(-1)}
          disabled={actionLoading || loading}
        >
          {isEnabled
            ? (actionLoading ? 'Disabling...' : 'Disable')
            : 'Back'}
        </button>
      </div>
    </div>
  )
}

export default BiometricSecurityPage
