import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './BiometricSecurityPage.css'

function BiometricSecurityPage() {
  const navigate = useNavigate()
  const [isEnabled, setIsEnabled] = useState(false)

  return (
    <div className="biometric-page">
      <div className="biometric-content">
        <div className="logo-section">
          <img src="/Logo.png" alt="Bharat Records" className="app-logo" />
          {/* <p className="tagline">SMART WALLET FOR SMART PEOPLE</p> */}
        </div>

        <h1 className="page-title">Bio Metric Security</h1>

        <div className="info-text">
          <p>Ruth Dsouza Prabhu Ruth Dsouza Prabhu Last Updated: July 29, 2021</p>
          <p>Biometric authentication is defined as a security measure that matches the biometric features of a user looking to access a device or a system. Access to the system is granted only when the parameters match those stored in the database for that particular user. Click here to learn about the basics of biometric authentication and the top seven biometric authentication tools in 2021. Table of ContentsWhat Is Biometric Authentication?</p>
        </div>

        <div className="fingerprint-icon">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" stroke="#3D1F8F" strokeWidth="3"/>
            <path d="M60 30 Q45 45, 45 60 T45 90" stroke="#3D1F8F" strokeWidth="3" fill="none"/>
            <path d="M60 30 Q75 45, 75 60 T75 90" stroke="#3D1F8F" strokeWidth="3" fill="none"/>
            <path d="M60 35 Q52 47, 52 60 T52 85" stroke="#3D1F8F" strokeWidth="2" fill="none"/>
            <path d="M60 35 Q68 47, 68 60 T68 85" stroke="#3D1F8F" strokeWidth="2" fill="none"/>
            <ellipse cx="60" cy="45" rx="8" ry="12" stroke="#3D1F8F" strokeWidth="3" fill="none"/>
          </svg>
        </div>

        <button className="enable-button" onClick={() => setIsEnabled(!isEnabled)}>
          Enable
        </button>

        <button className="disable-button" onClick={() => navigate(-1)}>
          Disable
        </button>
      </div>
    </div>
  )
}

export default BiometricSecurityPage
