import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HelpCenterPage.css'

function HelpCenterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    query: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Help form submitted:', formData)
  }

  return (
    <div className="help-center-page">
      <div className="page-header">
        <span className="header-icon">🎧</span>
        <h1>Help Center</h1>
      </div>

      <div className="help-content">
        <div className="illustration">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
            <ellipse cx="150" cy="250" rx="80" ry="20" fill="#E0E0E0"/>
            <rect x="60" y="180" width="120" height="80" rx="40" fill="#BDBDBD"/>
            <circle cx="120" cy="120" r="50" fill="#E8DED6"/>
            <circle cx="110" cy="110" r="5" fill="#333"/>
            <circle cx="130" cy="110" r="5" fill="#333"/>
            <path d="M110 125Q120 130 130 125" stroke="#333" strokeWidth="2" fill="none"/>
            <rect x="90" y="160" width="60" height="40" rx="20" fill="#26A69A"/>
            <rect x="140" y="200" width="8" height="50" fill="#26A69A"/>
            <path d="M148 250L155 245L155 255Z" fill="#4DB6AC"/>
            <circle cx="220" cy="80" r="30" fill="#F5F5F5"/>
            <text x="220" y="90" textAnchor="middle" fill="#26A69A" fontSize="24">★★★★★</text>
          </svg>
        </div>

        <p className="help-text">
          Hello, if you are facing any problems or need any information, please fill out the form below and write your issues in the given box
        </p>

        <form className="help-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter Your Name"
            value={formData.name}
            onChange={handleChange}
            className="help-input"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Enter Your Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="help-input"
          />

          <textarea
            name="query"
            placeholder="Please write  your Query"
            value={formData.query}
            onChange={handleChange}
            className="help-textarea"
            rows="6"
          />

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default HelpCenterPage
