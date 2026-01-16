import { useState, useEffect } from 'react'
import { documentAPI } from '../services/api'
import './DocumentShareModal.css'

function DocumentShareModal({ isOpen, onClose, documentId, documentName }) {
  const [shareWith, setShareWith] = useState('')
  const [expiryHours, setExpiryHours] = useState(24)
  const [shareHistory, setShareHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [shareLink, setShareLink] = useState('')

  useEffect(() => {
    if (isOpen && documentId) {
      loadShareHistory()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, documentId])

  const loadShareHistory = async () => {
    try {
      const response = await documentAPI.getShareHistory(documentId)
      if (response.status === 'success') {
        setShareHistory(response.data.shareHistory)
      }
    } catch (err) {
      console.error('Failed to load share history:', err)
    }
  }

  const handleGenerateLink = async () => {
    setError('')
    setSuccess('')
    setShareLink('')

    setLoading(true)
    try {
      const response = await documentAPI.share(documentId, expiryHours)
      if (response.status === 'success') {
        setSuccess('Share link generated successfully!')
        setShareLink(response.data.shareLink)
        await loadShareHistory()
      }
    } catch (err) {
      console.error('Share error:', err)
      setError(err.response?.data?.message || 'Failed to generate share link')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (shareId) => {
    if (!window.confirm('Are you sure you want to revoke this share access?')) {
      return
    }

    try {
      const response = await documentAPI.revokeShare(documentId, shareId)
      if (response.status === 'success') {
        setSuccess('Share access revoked successfully!')
        await loadShareHistory()
      }
    } catch (err) {
      console.error('Revoke error:', err)
      setError('Failed to revoke share access')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Link copied to clipboard!')
      setTimeout(() => setSuccess(''), 2000)
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date()
  }

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('doc-share-modal-backdrop')) {
      onClose()
    }
  }

  return (
    <div className="doc-share-modal-backdrop" onClick={handleBackdropClick}>
      <div className="doc-share-modal-container">
        <div className="doc-share-modal-header">
          <h3 className="doc-share-modal-title">Share Document</h3>
          <button className="doc-share-close-btn" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="doc-share-modal-body">
          <div className="doc-share-doc-info">
            <p className="doc-share-doc-name">{documentName}</p>
          </div>

          {error && <div className="doc-share-error">{error}</div>}
          {success && <div className="doc-share-success">{success}</div>}

          <div className="doc-share-form">
            <div className="doc-share-form-group">
              <label className="doc-share-label">Link Expiry Duration</label>
              <select
                className="doc-share-select"
                value={expiryHours}
                onChange={(e) => setExpiryHours(parseInt(e.target.value))}
                disabled={loading}
              >
                <option value={1}>1 Hour</option>
                <option value={6}>6 Hours</option>
                <option value={24}>24 Hours</option>
                <option value={72}>3 Days</option>
                <option value={168}>7 Days</option>
              </select>
            </div>

            <button
              type="button"
              className="doc-share-submit-btn"
              onClick={handleGenerateLink}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Share Link'}
            </button>
          </div>

          {shareLink && (
            <div className="doc-share-link-container">
              <label className="doc-share-label">Share Link</label>
              <div className="doc-share-link-wrapper">
                <input
                  type="text"
                  className="doc-share-link-input"
                  value={shareLink}
                  readOnly
                />
                <button
                  className="doc-share-copy-btn"
                  onClick={() => copyToClipboard(shareLink)}
                  title="Copy link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {shareHistory.length > 0 && (
            <div className="doc-share-history">
              <h4 className="doc-share-history-title">Share History</h4>
              <div className="doc-share-history-list">
                {shareHistory.map((share) => (
                  <div
                    key={share._id}
                    className={`doc-share-history-item ${isExpired(share.expiresAt) ? 'expired' : ''}`}
                  >
                    <div className="doc-share-history-info">
                      <p className="doc-share-history-date">
                        Created: {formatDate(share.sharedAt)}
                      </p>
                      <p className={`doc-share-history-expiry ${isExpired(share.expiresAt) ? 'expired-text' : ''}`}>
                        {isExpired(share.expiresAt) ? 'Expired' : `Expires: ${formatDate(share.expiresAt)}`}
                      </p>
                      <p className="doc-share-history-access">Views: {share.accessCount}</p>
                      {share.sharedWith && <p className="doc-share-history-note">Note: {share.sharedWith}</p>}
                    </div>
                    {!isExpired(share.expiresAt) && (
                      <button
                        className="doc-share-revoke-btn"
                        onClick={() => handleRevoke(share._id)}
                        title="Revoke access"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentShareModal
