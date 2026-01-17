import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { documentAPI } from '../services/api'
import './DocShareHistoryPage.css'

function DocShareHistoryPage() {
  const navigate = useNavigate()
  const [allShares, setAllShares] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAllShareHistory()
  }, [])

  const loadAllShareHistory = async () => {
    try {
      setLoading(true)
      // Get all documents
      const response = await documentAPI.getAll()
      
      if (response.status === 'success') {
        const documents = response.data.documents
        
        // Collect all shares from all documents
        const shares = []
        for (const doc of documents) {
          if (doc.shareHistory && doc.shareHistory.length > 0) {
            doc.shareHistory.forEach(share => {
              shares.push({
                ...share,
                documentName: doc.fileName,
                documentType: doc.documentType,
                documentId: doc._id
              })
            })
          }
        }
        
        // Sort by date (newest first)
        shares.sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt))
        setAllShares(shares)
      }
    } catch (err) {
      console.error('Failed to load share history:', err)
      setError('Failed to load share history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', ' //')
  }

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date()
  }

  const getPlatformIcon = (sharedWith) => {
    if (!sharedWith) return '🔗'
    
    const lower = sharedWith.toLowerCase()
    if (lower.includes('whatsapp')) return '💬'
    if (lower.includes('telegram')) return '✈️'
    if (lower.includes('facebook')) return '📘'
    if (lower.includes('instagram')) return '📷'
    if (lower.includes('link')) return '🔗'
    return '📤'
  }

  const getStatusIcon = (share) => {
    if (isExpired(share.expiresAt)) return '⏰'
    return getPlatformIcon(share.sharedWith)
  }

  return (
    <div className="doc-share-history-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="header-icon">🕐</span>
        <h1>Doc Share History</h1>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading share history...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {!loading && !error && allShares.length === 0 && (
        <div className="empty-state">
          <p>📭</p>
          <p>No documents shared yet</p>
        </div>
      )}

      {!loading && !error && allShares.length > 0 && (
        <div className="history-list">
          {allShares.map((share, index) => (
            <div key={index} className={`history-card ${isExpired(share.expiresAt) ? 'expired' : ''}`}>
              <div className="platform-icon">
                <span className="icon-emoji">{getStatusIcon(share)}</span>
              </div>
              <div className="history-info">
                <h3 className="platform-name">{share.documentName}</h3>
                <p className="document-type">{share.documentType?.replace('_', ' ')}</p>
                <p className="share-method">
                  {isExpired(share.expiresAt) ? (
                    <span className="status-badge expired-badge">⏰ Expired</span>
                  ) : (
                    <span className="status-badge active-badge">✓ Active</span>
                  )}
                  {share.sharedWith && (
                    <span className="platform-badge">
                      {getPlatformIcon(share.sharedWith)} {share.sharedWith}
                    </span>
                  )}
                </p>
                <p className="share-date">📅 {formatDate(share.sharedAt)}</p>
                <p className="share-views">👁️ Views: {share.accessCount || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocShareHistoryPage
