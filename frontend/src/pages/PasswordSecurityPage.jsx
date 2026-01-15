import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PasswordSecurityPage.css'

function PasswordSecurityPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Password update:', formData)
  }

  return (
    <div className="password-security-page">
      <div className="password-content">
        <div className="logo-section">
          <img src="/Logo.png" alt="Bharat Records" className="app-logo" />
          {/* <p className="tagline">SMART WALLET FOR SMART PEOPLE</p> */}
        </div>

        <form className="password-form" onSubmit={handleSubmit}>
          <input
            type="password"
            name="newPassword"
            placeholder="New password"
            value={formData.newPassword}
            onChange={handleChange}
            className="password-input"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="New confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="password-input"
          />

          <button type="button" className="forgot-link">
            Forgot Password
          </button>

          <button type="submit" className="save-button">
            Save
          </button>
        </form>
      </div>
    </div>
  )
}

export default PasswordSecurityPage
