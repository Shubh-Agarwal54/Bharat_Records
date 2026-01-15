import { useNavigate } from 'react-router-dom'
import './MyReferralsPage.css'

function MyReferralsPage() {
  const navigate = useNavigate()

  const referrals = [
    { clientId: 'BR0055656', aadhaar: '123456798989', points: 25, redeemed: true },
    { clientId: 'BR0055656', aadhaar: '123456798989', points: 25, redeemed: true },
    { clientId: 'BR0055656', aadhaar: '123456798989', points: 25, redeemed: true },
    { clientId: 'BR0055656', aadhaar: '123456798989', points: 25, redeemed: true },
    { clientId: 'BR0055656', aadhaar: '123456798989', points: 25, redeemed: true }
  ]

  return (
    <div className="my-referrals-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>My Referrals</h1>
      </div>

      <div className="referrals-content">
        <div className="stats-card">
          <div className="stat-row">
            <span className="stat-label">Total Referrals Given :</span>
            <span className="stat-value">50</span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stat-row">
            <span className="stat-label">Total Referral Points Earned :</span>
            <span className="stat-value">200</span>
          </div>
        </div>

        <button className="redeem-button">Reedeem</button>

        <div className="referrals-list">
          {referrals.map((referral, index) => (
            <div key={index} className="referral-card">
              <div className="referral-info">
                <div className="info-row">
                  <span className="info-label">Client ID :</span>
                  <span className="info-value">{referral.clientId}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Aadhar Number :</span>
                  <span className="info-value">{referral.aadhaar}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Points :</span>
                  <span className="info-value">{referral.points}</span>
                </div>
              </div>
              {referral.redeemed && (
                <div className="redeemed-badge">Reedeemed</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyReferralsPage
