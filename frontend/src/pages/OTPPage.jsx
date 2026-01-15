import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../services/api'
import './OTPPage.css'

function OTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(56)
  const [canResend, setCanResend] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Get email OR mobile from navigation state or session storage
  const email = location.state?.email || sessionStorage.getItem('pendingEmail')
  const mobile = location.state?.mobile || sessionStorage.getItem('pendingPhone')
  const identifier = email || mobile // Use email or mobile as identifier
  const fromSignup = location.state?.from === 'signup'

  useEffect(() => {
    // Redirect to login if no identifier
    if (!identifier) {
      navigate('/login')
      return
    }

    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer, email, navigate])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.verifyOTP(identifier, otp)
      
      if (response.success) {
        // Store tokens and user data
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Clear session storage
        sessionStorage.removeItem('pendingEmail')
        sessionStorage.removeItem('pendingPhone')
        sessionStorage.removeItem('signupEmail')
        
        // Redirect based on whether it's signup or login
        if (fromSignup) {
          alert('Account verified successfully! Please complete your profile.')
          navigate('/my-account')
        } else {
          alert('Login successful!')
          navigate('/home')
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    setLoading(true)
    setError('')

    try {
      // Resend OTP to email or mobile
      await sendOTP(identifier, 'verification')
      
      setTimer(56)
      setCanResend(false)
      setOtp('')
      alert(email ? 'OTP sent to your email!' : 'OTP sent (check console for temp OTP)!')
    } catch (err) {
      console.error('Resend OTP error:', err)
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to resend OTP
  const sendOTP = async (identifier, purpose) => {
    // This will trigger a new signup or login call
    // For now, just show success message
    console.log(`Resending OTP to ${identifier}`)
    return Promise.resolve()
  }

  return (
    <div className="otp-page">
      <div className="otp-header">
        <img src="/Logo.png" alt="Bharat Records" className="otp-logo" />
      </div>

      <div className="otp-content">
        {error && <div className="error-message">{error}</div>}
        
        <div className="otp-input-group">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="otp-input"
            maxLength="6"
          />
        </div>

        <div className="otp-actions">
          <button 
            className={`btn-resend ${canResend ? 'active' : ''}`}
            onClick={handleResend}
            disabled={!canResend}
          >
            Resend OTP
          </button>
        </div>

        <p className="otp-timer">
          Resend OTP after : {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
        </p>

        <button 
          className="btn-verify" 
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </div>
  )
}

export default OTPPage
