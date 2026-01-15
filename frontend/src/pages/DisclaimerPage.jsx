import { useNavigate } from 'react-router-dom'
import './DisclaimerPage.css'

function DisclaimerPage() {
  const navigate = useNavigate()

  return (
    <div className="disclaimer-page">
      <div className="disclaimer-content">
        <h1>Disclaimer</h1>

        <div className="disclaimer-list">
          <div className="disclaimer-item">
            <span className="number">1.</span>
            <p>The use of the Services is at your sole risk.To the extent permitted by Applicable Law, the Services are provided on an "as is" and "as available" basis. We do not warrant that the operation of the Services will be uninterrupted or error-free or that the functions contained in the Services will meet your requirements</p>
          </div>

          <div className="disclaimer-item">
            <span className="number">2.</span>
            <p>We may suspend, withdraw, or restrict the availability of all or any part of our App for business, legal and operational reasons.</p>
          </div>

          <div className="disclaimer-item">
            <span className="number">3.</span>
            <p>The Services may include services, Partner Services, content, documents, and information owned by, licensed to, or otherwise made available by a third-party or Partners ("Third-Party Services") or contain links to Third-Party Services.</p>
          </div>

          <div className="disclaimer-item">
            <span className="number">4.</span>
            <p>If you have any questions, complaints, or claims with respect to the Services, you may contact us</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisclaimerPage
