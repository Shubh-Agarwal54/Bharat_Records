import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { userAPI } from '../services/api'
import './UpdatePhoneOTPPage.css'

function UpdatePhoneOTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const updateType = location.state?.type || 'mobile' // 'mobile' or 'email'
  
  const [step, setStep] = useState(1) // 1: Enter new value, 2: Enter OTP
  const [newValue, setNewValue] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendOTP = async () => {
    if (!newValue.trim()) {
      setError(`Please enter a new ${updateType === 'mobile' ? 'mobile number' : 'email address'}`)
      return
    }

    // Validate mobile number (10 digits)
    if (updateType === 'mobile') {
      if (!/^\d{10}$/.test(newValue)) {
        setError('Please enter a valid 10-digit mobile number')
        return
      }
    }

    // Validate email
    if (updateType === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
        setError('Please enter a valid email address')
        return
      }
    }

    setLoading(true)
    setError('')
    
    try {
      if (updateType === 'mobile') {
        await userAPI.updateMobile(newValue)
      } else {
        await userAPI.updateEmail(newValue)
      }
      
      setSuccess(`OTP sent to your new ${updateType === 'mobile' ? 'mobile number' : 'email address'}`)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to send OTP. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus()
      }
    }
  }

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      let response
      if (updateType === 'mobile') {
        response = await userAPI.verifyUpdateMobile(newValue, otpCode)
      } else {
        response = await userAPI.verifyUpdateEmail(newValue, otpCode)
      }
      
      // Update localStorage with new user data
      if (response.data?.user) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = { ...currentUser, ...response.data.user }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
      
      setSuccess(response.message || `${updateType === 'mobile' ? 'Mobile number' : 'Email'} updated successfully!`)
      
      // Navigate back to My Account after 1 second
      setTimeout(() => {
        navigate('/my-account')
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (step === 1) {
        handleSendOTP()
      } else {
        handleVerifyOTP()
      }
    }
  }

  return (
    <div className="update-phone-otp-modal">
      <div className="modal-content">
        <button className="close-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {step === 1 ? (
          <>
            <h2 className="modal-title">
              Update {updateType === 'mobile' ? 'Mobile Number' : 'Email Address'}
            </h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="input-group">
              <label className="input-label">
                New {updateType === 'mobile' ? 'Mobile Number' : 'Email Address'}
              </label>
              <input
                type={updateType === 'mobile' ? 'tel' : 'email'}
                className="value-input"
                placeholder={updateType === 'mobile' ? '10-digit mobile number' : 'your@email.com'}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={updateType === 'mobile' ? 10 : undefined}
                inputMode={updateType === 'mobile' ? 'numeric' : undefined}
                disabled={loading}
              />
            </div>

            <button 
              className="verify-button" 
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <h2 className="modal-title">Enter OTP</h2>
            <p className="subtitle">
              OTP sent to {updateType === 'mobile' ? 'your new mobile number' : 'your new email address'}
            </p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="otp-box"
                  inputMode="numeric"
                  disabled={loading}
                />
              ))}
            </div>

            <button 
              className="verify-button" 
              onClick={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Update'}
            </button>

            <button 
              className="resend-button" 
              onClick={handleSendOTP}
              disabled={loading}
            >
              Resend OTP
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default UpdatePhoneOTPPage
