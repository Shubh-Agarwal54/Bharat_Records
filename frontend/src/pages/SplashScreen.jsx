import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './SplashScreen.css'

function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login')
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo-container">
          <img src="/Logo.png" alt="Bharat Records" className="splash-logo" />
        </div>
        
        <div className="splash-shield">
          <img src="/splashicon.png" alt="Security Shield" className="splash-icon" />
        </div>

        <h1 className="splash-title">Store Your Data with Bharat Record</h1>
        
        <div className="splash-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
