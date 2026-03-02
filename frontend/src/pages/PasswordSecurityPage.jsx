import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI, authAPI } from '../services/api'
import './PasswordSecurityPage.css'

function PasswordSecurityPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Forgot password overlay states
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState(1) // 1: enter identifier, 2: enter OTP + new password
  const [forgotData, setForgotData] = useState({ identifier: '', otp: '', newPassword: '', confirmPassword: '' })
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.currentPassword) {
      setError('Please enter your current password')
      return
    }
    if (!formData.newPassword || formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await userAPI.changePassword(formData.currentPassword, formData.newPassword)
      setSuccess(response.message || 'Password changed successfully!')
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => navigate(-1), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Forgot password handlers
  const handleForgotSendOTP = async () => {
    setForgotError('')
    if (!forgotData.identifier.trim()) {
      setForgotError('Please enter your email or mobile number')
      return
    }
    setForgotLoading(true)
    try {
      await authAPI.forgotPassword(forgotData.identifier.trim())
      setForgotSuccess('OTP sent! Check your email or mobile.')
      setForgotStep(2)
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleOtpDigitChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const digits = [...otpDigits]
      digits[index] = value
      setOtpDigits(digits)
      if (value && index < 5) {
        document.getElementById(`fp-otp-${index + 1}`)?.focus()
      }
    }
  }

  const handleForgotReset = async () => {
    setForgotError('')
    const otp = otpDigits.join('')
    if (otp.length !== 6) {
      setForgotError('Please enter the complete 6-digit OTP')
      return
    }
    if (!forgotData.newPassword || forgotData.newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters')
      return
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotError('Passwords do not match')
      return
    }
    setForgotLoading(true)
    try {
      await authAPI.resetPassword(forgotData.identifier.trim(), otp, forgotData.newPassword)
      setForgotSuccess('Password reset successfully! Please login.')
      setTimeout(() => {
        setShowForgotModal(false)
        navigate('/login')
      }, 1500)
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid OTP or error resetting password.')
    } finally {
      setForgotLoading(false)
    }
  }

  const closeForgotModal = () => {
    setShowForgotModal(false)
    setForgotStep(1)
    setForgotData({ identifier: '', otp: '', newPassword: '', confirmPassword: '' })
    setOtpDigits(['', '', '', '', '', ''])
    setForgotError('')
    setForgotSuccess('')
  }

  return (
    <div className="password-security-page">
      <div className="password-content">
        <div className="logo-section">
          <img src="/Logo.png" alt="Bharat Records" className="app-logo" />
          {/* <p className="tagline">SMART WALLET FOR SMART PEOPLE</p> */}
        </div>

        {error && <div className="ps-error">{error}</div>}
        {success && <div className="ps-success">{success}</div>}

        <form className="password-form" onSubmit={handleSubmit}>
          <input
            type="password"
            name="currentPassword"
            placeholder="Current password"
            value={formData.currentPassword}
            onChange={handleChange}
            className="password-input"
            disabled={loading}
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New password"
            value={formData.newPassword}
            onChange={handleChange}
            className="password-input"
            disabled={loading}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="New confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="password-input"
            disabled={loading}
          />

          <button type="button" className="forgot-link" onClick={() => setShowForgotModal(true)}>
            Forgot Password
          </button>

          <button type="submit" className="save-button" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>

      {/* Forgot Password Overlay */}
      {showForgotModal && (
        <div className="fp-overlay">
          <div className="fp-modal">
            <button className="fp-close" onClick={closeForgotModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {forgotStep === 1 ? (
              <>
                <h2 className="fp-title">Forgot Password</h2>
                <p className="fp-subtitle">Enter your registered email or mobile number</p>

                {forgotError && <div className="ps-error">{forgotError}</div>}

                <input
                  type="text"
                  placeholder="Email or mobile number"
                  value={forgotData.identifier}
                  onChange={(e) => setForgotData(prev => ({ ...prev, identifier: e.target.value }))}
                  className="password-input fp-input"
                  disabled={forgotLoading}
                  onKeyPress={(e) => e.key === 'Enter' && handleForgotSendOTP()}
                />

                <button className="save-button" onClick={handleForgotSendOTP} disabled={forgotLoading}>
                  {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <h2 className="fp-title">Reset Password</h2>
                <p className="fp-subtitle">Enter the OTP sent to your {forgotData.identifier.includes('@') ? 'email' : 'mobile'}</p>

                {forgotError && <div className="ps-error">{forgotError}</div>}
                {forgotSuccess && <div className="ps-success">{forgotSuccess}</div>}

                <div className="fp-otp-row">
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      id={`fp-otp-${i}`}
                      type="text"
                      maxLength="1"
                      value={d}
                      onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                      className="fp-otp-box"
                      inputMode="numeric"
                      disabled={forgotLoading}
                    />
                  ))}
                </div>

                <input
                  type="password"
                  placeholder="New password"
                  value={forgotData.newPassword}
                  onChange={(e) => setForgotData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="password-input fp-input"
                  disabled={forgotLoading}
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={forgotData.confirmPassword}
                  onChange={(e) => setForgotData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="password-input fp-input"
                  disabled={forgotLoading}
                />

                <button className="save-button" onClick={handleForgotReset} disabled={forgotLoading}>
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button className="forgot-link fp-resend" onClick={handleForgotSendOTP} disabled={forgotLoading}>
                  Resend OTP
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PasswordSecurityPage
