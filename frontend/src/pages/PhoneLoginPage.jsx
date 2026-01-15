import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import './PhoneLoginPage.css'

function PhoneLoginPage() {
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (phoneNumber.length === 10) {
      setLoading(true)
      setError('')

      try {
        // Call backend API to check if phone is registered
        const response = await authAPI.phoneLogin(phoneNumber)
        
        if (response.status === 'success') {
          // Store phone number for OTP verification
          sessionStorage.setItem('pendingPhone', phoneNumber)
          
          // Show OTP from backend (temporary until SMS API is integrated)
          if (response.data.otp) {
            console.log('OTP for phone', phoneNumber, ':', response.data.otp)
            alert(`Your OTP: ${response.data.otp}\n(This is for testing only. SMS API will be integrated later)`)
          } else {
            alert('OTP sent successfully! Check backend console for OTP.')
          }
          
          // Redirect to OTP page
          navigate('/otp', { state: { mobile: phoneNumber } })
        }
      } catch (err) {
        console.error('Phone login error:', err)
        setError(err.response?.data?.message || 'Phone number not registered. Please signup first.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="phone-login-page">
      <div className="phone-login-header">
        <button className="back-button" onClick={() => navigate('/login')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <img src="/Logo.png" alt="Bharat Records" className="phone-login-logo" />
      </div>

      <h1 className="phone-login-title">Login with Phone</h1>
      <p className="phone-login-subtitle">Enter your mobile number to receive OTP</p>

      {error && <div className="error-message">{error}</div>}

      <form className="phone-login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="phone-input-wrapper">
            <span className="country-code">+91</span>
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                if (value.length <= 10) {
                  setPhoneNumber(value)
                }
              }}
              className="form-input phone-input"
              maxLength="10"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={phoneNumber.length !== 10 || loading}
        >
          {loading ? 'Checking...' : 'Send OTP'}
        </button>
      </form>

      <div className="signup-link">
        <span>Don't have an account ? </span>
        <button onClick={() => navigate('/signup')} className="link-button">Signup</button>
      </div>
    </div>
  )
}

export default PhoneLoginPage
