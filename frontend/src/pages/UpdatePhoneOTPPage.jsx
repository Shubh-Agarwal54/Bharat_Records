import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './UpdatePhoneOTPPage.css'

function UpdatePhoneOTPPage() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', ''])

  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      
      // Auto-focus next input
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`)?.focus()
      }
    }
  }

  const handleVerify = () => {
    console.log('OTP:', otp.join(''))
  }

  return (
    <div className="update-phone-otp-modal">
      <div className="modal-content">
        <button className="close-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <h2 className="modal-title">Enter OTP Received on your updated number</h2>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="otp-box"
            />
          ))}
        </div>

        <button className="verify-button" onClick={handleVerify}>
          Verify
        </button>
      </div>
    </div>
  )
}

export default UpdatePhoneOTPPage
