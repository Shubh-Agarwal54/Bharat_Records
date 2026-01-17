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

  const shareVia = (platform) => {
    if (!shareLink) {
      setError('Please generate a share link first')
      return
    }

    const message = `Check out this document: ${documentName}`
    const encodedMessage = encodeURIComponent(message)
    const encodedLink = encodeURIComponent(shareLink)

    let url = ''
    
    switch(platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedMessage}%0A${encodedLink}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedLink}&text=${encodedMessage}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`
        break
      case 'instagram':
        // Instagram doesn't support direct web sharing, copy to clipboard instead
        copyToClipboard(shareLink)
        setSuccess('Link copied! You can paste it in Instagram')
        return
      default:
        return
    }

    window.open(url, '_blank', 'width=600,height=400')
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

              <div className="doc-share-social-section">
                <label className="doc-share-label">Share via</label>
                <div className="doc-share-social-buttons">
                  <button
                    className="doc-share-social-btn whatsapp"
                    onClick={() => shareVia('whatsapp')}
                    title="Share on WhatsApp"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </button>

                  <button
                    className="doc-share-social-btn telegram"
                    onClick={() => shareVia('telegram')}
                    title="Share on Telegram"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </button>

                  <button
                    className="doc-share-social-btn facebook"
                    onClick={() => shareVia('facebook')}
                    title="Share on Facebook"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>

                  {/* <button
                    className="doc-share-social-btn instagram"
                    onClick={() => shareVia('instagram')}
                    title="Copy link for Instagram"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                    Instagram
                  </button> */}
                </div>
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
