import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { authAPI } from '../services/api'
import './SignupPage.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function SignupPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('') // Clear error on input change
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.signup(formData)
      
      if (response.success) {
        // Store email for OTP verification
        sessionStorage.setItem('pendingEmail', formData.email)
        sessionStorage.setItem('signupEmail', formData.email)
        
        alert('Signup successful! OTP sent to your email.')
        navigate('/otp', { state: { email: formData.email, from: 'signup' } })
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.googleAuth(credentialResponse.credential)
      
      if (response.success) {
        // Store tokens and user data
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        alert('Google signup successful! Please complete your profile.')
        navigate('/my-account')
      }
    } catch (err) {
      console.error('Google signup error:', err)
      setError(err.response?.data?.message || 'Google signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google signup failed. Please try again.')
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="signup-page">
      <div className="signup-header">
        <img src="/Logo.png" alt="Bharat Records" className="signup-logo" />
      </div>

      <h1 className="signup-title">Signup</h1>

      {error && <div className="error-message">{error}</div>}

      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            className="form-input"
            maxLength="10"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <p className="password-requirements">
          Your password must be at least 8 characters including a lowercase letter, an uppercase letter, a special character and a number,
        </p>

        <div className="terms-checkbox">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            required
          />
          <label htmlFor="terms">
            I have Read <span className="link-text">Privacy Policy</span> and <span className="link-text">Terms of Service</span> carefully
          </label>
        </div>

        <button 
          type="submit" 
          className={`btn-signup ${agreedToTerms ? 'active' : ''}`}
          disabled={!agreedToTerms || loading}
        >
          {loading ? 'Creating Account...' : 'Signup'}
        </button>
      </form>

      <div className="divider">
        <span>OR</span>
      </div>

      <div className="social-buttons">
        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            text="signup_with"
            theme="outline"
            size="large"
            width="100%"
          />
        </div>
      </div>

      <div className="login-link">
        <span>Already have an account ? </span>
        <button onClick={() => navigate('/login')} className="link-button">Login</button>
      </div>
    </div>
    </GoogleOAuthProvider>
  )
}

export default SignupPage
