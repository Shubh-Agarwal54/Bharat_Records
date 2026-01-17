import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { nomineeAPI, documentAPI } from '../services/api'
import DocumentViewerModal from '../components/DocumentViewerModal'
import './NomineeAccessPage.css'

function NomineeAccessPage() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewerDoc, setViewerDoc] = useState(null)
  const [showViewer, setShowViewer] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const response = await nomineeAPI.getMyAccess()
      setAccounts(response.data.accounts)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAccount = async (account) => {
    setSelectedAccount(account)
    setError('')
    
    try {
      setLoading(true)
      // Log access
      await nomineeAPI.logAccess(account._id)
      
      // Load documents - pass accountId to get owner's documents
      const allDocs = await documentAPI.getAll(null, null, account._id)
      setDocuments(allDocs.data.documents)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = async (doc) => {
    try {
      setError('')
      const response = await documentAPI.getViewUrl(doc._id, selectedAccount._id)
      setViewerDoc({
        ...doc,
        url: response.data.signedUrl
      })
      setShowViewer(true)
    } catch (err) {
      console.error('View error:', err)
      setError(err.response?.data?.message || 'Failed to load document')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDownload = async (doc) => {
    if (selectedAccount.accessLevel === 'view') {
      setError('You only have view access. Download not permitted.')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      setError('')
      const response = await documentAPI.getDownloadUrl(doc._id, selectedAccount._id)
      const link = document.createElement('a')
      link.href = response.data.signedUrl
      link.download = response.data.fileName || doc.fileName
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download error:', err)
      setError(err.response?.data?.message || 'Failed to download document')
      setTimeout(() => setError(''), 3000)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getAccessLevelColor = (level) => {
    const colors = {
      view: '#3498db',
      download: '#2ecc71',
      full: '#9b59b6'
    }
    return colors[level] || '#95a5a6'
  }

  return (
    <div className="nominee-access-main-page">
      <div className="nominee-access-header-section">
        <button className="nominee-access-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="nominee-access-main-title">Accounts I Can Access 🔑</h1>
      </div>

      <div className="nominee-access-content-wrapper">
        {error && <div className="nominee-access-error-msg">{error}</div>}

        {/* Account Selection */}
        {!selectedAccount ? (
          <div className="nominee-accounts-grid-container">
            {loading ? (
              <div className="nominee-access-loading">Loading accounts...</div>
            ) : accounts.length === 0 ? (
              <div className="nominee-access-empty-state">
                <div className="nominee-access-empty-icon">🔒</div>
                <h3>No Access Granted</h3>
                <p>You don't have access to any accounts yet.</p>
              </div>
            ) : (
              accounts.map((account) => (
                <div 
                  key={account._id} 
                  className="nominee-account-access-card"
                  onClick={() => handleSelectAccount(account)}
                >
                  <div className="nominee-account-owner-info">
                    {account.user.profilePicture ? (
                      <img src={account.user.profilePicture} alt="" className="nominee-account-avatar" />
                    ) : (
                      <div className="nominee-account-avatar-placeholder">
                        {account.user.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="nominee-account-details">
                      <h3>{account.user.fullName}</h3>
                      <p>{account.user.email}</p>
                    </div>
                  </div>

                  <div className="nominee-account-access-info">
                    <div className="nominee-account-access-badge" 
                         style={{background: getAccessLevelColor(account.accessLevel)}}>
                      {account.accessLevel.toUpperCase()}
                    </div>
                    <div className="nominee-account-categories">
                      {account.canViewCategories.map(cat => (
                        <span key={cat} className="nominee-category-tag">{cat}</span>
                      ))}
                    </div>
                    {account.accessExpiresAt && (
                      <div className="nominee-account-expiry">
                        Expires: {formatDate(account.accessExpiresAt)}
                      </div>
                    )}
                    {account.lastAccessedAt && (
                      <div className="nominee-account-last-access">
                        Last accessed: {formatDate(account.lastAccessedAt)}
                      </div>
                    )}
                  </div>

                  <button className="nominee-account-view-btn">
                    View Documents →
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Document List */
          <div className="nominee-documents-section">
            <div className="nominee-documents-header">
              <button 
                className="nominee-back-to-accounts-btn"
                onClick={() => {
                  setSelectedAccount(null)
                  setDocuments([])
                }}
              >
                ← Back to Accounts
              </button>
              <h2>Documents from {selectedAccount.user.fullName}</h2>
              <div className="nominee-access-level-indicator">
                Access Level: <span style={{color: getAccessLevelColor(selectedAccount.accessLevel)}}>
                  {selectedAccount.accessLevel.toUpperCase()}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="nominee-access-loading">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="nominee-access-empty-state">
                <div className="nominee-access-empty-icon">📄</div>
                <h3>No Documents Found</h3>
                <p>No documents available in the allowed categories.</p>
              </div>
            ) : (
              <div className="nominee-documents-grid">
                {documents.map((doc) => (
                  <div key={doc._id} className="nominee-document-card">
                    <div className="nominee-doc-icon">
                      {doc.fileType === 'pdf' && '📄'}
                      {['jpg', 'jpeg', 'png'].includes(doc.fileType) && '🖼️'}
                      {!['pdf', 'jpg', 'jpeg', 'png'].includes(doc.fileType) && '📎'}
                    </div>
                    <div className="nominee-doc-info">
                      <h4>{doc.title}</h4>
                      <p className="nominee-doc-category">{doc.category} / {doc.documentType}</p>
                      <p className="nominee-doc-date">Uploaded: {formatDate(doc.uploadDate)}</p>
                    </div>
                    <div className="nominee-doc-actions">
                      <button 
                        className="nominee-doc-view-btn"
                        onClick={() => handleViewDocument(doc)}
                      >
                        👁️ View
                      </button>
                      {(selectedAccount.accessLevel === 'download' || selectedAccount.accessLevel === 'full') && (
                        <button 
                          className="nominee-doc-download-btn"
                          onClick={() => handleDownload(doc)}
                        >
                          ⬇️ Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {showViewer && viewerDoc && (
        <DocumentViewerModal
          isOpen={showViewer}
          documentUrl={viewerDoc.url}
          fileName={viewerDoc.fileName}
          fileType={viewerDoc.fileType}
          onClose={() => {
            setShowViewer(false)
            setViewerDoc(null)
          }}
        />
      )}
    </div>
  )
}

export default NomineeAccessPage
