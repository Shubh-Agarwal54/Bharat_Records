import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { nomineeAPI } from '../services/api'
import './AcceptNomineeInvitePage.css'

function AcceptNomineeInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inviteInfo, setInviteInfo] = useState(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user')
    if (!user) {
      // Redirect to login with return URL
      localStorage.setItem('pendingInviteToken', token)
      navigate('/login')
      return
    }

    loadInviteInfo()
  }, [token])

  const loadInviteInfo = async () => {
    try {
      setLoading(true)
      // Note: We need to create a public endpoint to get invite info
      // For now, we'll just show the accept button
      setLoading(false)
    } catch (err) {
      setError('Invalid or expired invitation link')
      setLoading(false)
    }
  }

  const handleAcceptInvite = async () => {
    try {
      setAccepting(true)
      const user = JSON.parse(localStorage.getItem('user'))
      
      const response = await nomineeAPI.acceptInvite(token, user.id)
      
      setInviteInfo({
        accountOwner: response.data.accountOwner,
        accessLevel: response.data.nominee.accessLevel,
        categories: response.data.nominee.canViewCategories
      })

      setTimeout(() => {
        navigate('/nominee-access')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="accept-invite-page">
        <div className="accept-invite-loading">
          <div className="accept-invite-spinner"></div>
          <p>Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (inviteInfo) {
    return (
      <div className="accept-invite-page">
        <div className="accept-invite-success-card">
          <div className="accept-invite-success-icon">✅</div>
          <h1>Invitation Accepted!</h1>
          <p>You now have access to <strong>{inviteInfo.accountOwner.fullName}'s</strong> account.</p>
          <div className="accept-invite-details">
            <div className="accept-invite-detail-item">
              <span className="accept-invite-detail-label">Access Level:</span>
              <span className="accept-invite-detail-value">{inviteInfo.accessLevel}</span>
            </div>
            <div className="accept-invite-detail-item">
              <span className="accept-invite-detail-label">Categories:</span>
              <span className="accept-invite-detail-value">
                {inviteInfo.categories.join(', ')}
              </span>
            </div>
          </div>
          <p className="accept-invite-redirect-text">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="accept-invite-page">
      <div className="accept-invite-card">
        <div className="accept-invite-icon">🔑</div>
        <h1>Account Access Invitation</h1>
        
        {error ? (
          <>
            <div className="accept-invite-error">{error}</div>
            <button 
              className="accept-invite-back-btn"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <p className="accept-invite-description">
              You've been invited to access someone's account and documents.
            </p>
            <div className="accept-invite-info-box">
              <p>✅ You must be logged in to accept this invitation</p>
              <p>🔒 You will only see documents the owner has permitted</p>
              <p>📅 Access may be time-limited based on owner's settings</p>
            </div>
            <button 
              className="accept-invite-accept-btn"
              onClick={handleAcceptInvite}
              disabled={accepting}
            >
              {accepting ? 'Accepting...' : '✅ Accept Invitation'}
            </button>
            <button 
              className="accept-invite-decline-btn"
              onClick={() => navigate('/home')}
              disabled={accepting}
            >
              Decline
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AcceptNomineeInvitePage
