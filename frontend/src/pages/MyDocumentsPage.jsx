import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { documentAPI } from '../services/api'
import DocumentViewerModal from '../components/DocumentViewerModal'
import DocumentShareModal from '../components/DocumentShareModal'
import './MyDocumentsPage.css'

function MyDocumentsPage() {
  const navigate = useNavigate()
  const [documentsByCategory, setDocumentsByCategory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedCategories, setExpandedCategories] = useState({
    personal: true,
    investment: true,
    insurance: true,
    loans: true,
    retirement: true
  })

  // Modal states
  const [viewerModal, setViewerModal] = useState({ isOpen: false, url: '', fileName: '', fileType: '' })
  const [shareModal, setShareModal] = useState({ isOpen: false, documentId: '', documentName: '' })

  const categoryInfo = {
    personal: { name: 'Personal Documents', color: '#FDB913', icon: '👤' },
    investment: { name: 'Investment Documents', color: '#4CAF50', icon: '📈' },
    insurance: { name: 'Insurance Documents', color: '#FF6B6B', icon: '🛡️' },
    loans: { name: 'Loan Documents', color: '#F44336', icon: '💰' },
    retirement: { name: 'Retirement Documents', color: '#4A90E2', icon: '💼' }
  }

  useEffect(() => {
    loadAllDocuments()
  }, [])

  const loadAllDocuments = async () => {
    try {
      setLoading(true)
      const response = await documentAPI.getAll()
      
      if (response.status === 'success') {
        // Group documents by category
        const grouped = response.data.documents.reduce((acc, doc) => {
          const category = doc.category || 'other'
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(doc)
          return acc
        }, {})

        setDocumentsByCategory(grouped)
      }
    } catch (err) {
      console.error('Failed to load documents:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const handleView = async (docId, fileName, fileType) => {
    try {
      setError('')
      const response = await documentAPI.getViewUrl(docId)
      if (response.status === 'success') {
        setViewerModal({
          isOpen: true,
          url: response.data.signedUrl,
          fileName: fileName,
          fileType: fileType
        })
      }
    } catch (err) {
      console.error('View error:', err)
      setError('Failed to view document')
    }
  }

  const handleDownload = async (docId, fileName) => {
    try {
      setError('')
      const response = await documentAPI.getDownloadUrl(docId)
      if (response.status === 'success') {
        const link = document.createElement('a')
        link.href = response.data.signedUrl
        link.download = fileName
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download document')
    }
  }

  const handleShare = (docId, fileName) => {
    setShareModal({
      isOpen: true,
      documentId: docId,
      documentName: fileName
    })
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await documentAPI.delete(docId)
      if (response.status === 'success') {
        await loadAllDocuments()
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete document')
    }
  }

  const closeViewerModal = () => {
    setViewerModal({ isOpen: false, url: '', fileName: '', fileType: '' })
  }

  const closeShareModal = () => {
    setShareModal({ isOpen: false, documentId: '', documentName: '' })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-')
  }

  const getTotalDocuments = () => {
    return Object.values(documentsByCategory).reduce((total, docs) => total + docs.length, 0)
  }

  return (
    <div className="mydocs-page">
      <div className="mydocs-header">
        <button className="mydocs-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>My Documents 📁</h1>
      </div>

      {error && <div className="mydocs-error-message">{error}</div>}

      {loading ? (
        <div className="mydocs-loading">
          <div className="mydocs-spinner"></div>
          <p>Loading your documents...</p>
        </div>
      ) : getTotalDocuments() === 0 ? (
        <div className="mydocs-empty-state">
          <div className="mydocs-empty-icon">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <rect x="50" y="30" width="100" height="140" rx="8" fill="#FDB913"/>
              <rect x="60" y="60" width="80" height="60" rx="4" fill="#FFE082"/>
              <circle cx="100" cy="50" r="15" fill="white"/>
              <path d="M95 45h10M95 50h10M95 55h10" stroke="white" strokeWidth="2"/>
              <path d="M110 40l10 10" stroke="#8B7000" strokeWidth="3"/>
            </svg>
          </div>
          <p className="mydocs-empty-text">You have no documents</p>
          <button className="mydocs-add-btn" onClick={() => navigate('/add-document')}>
            Add Document
          </button>
        </div>
      ) : (
        <div className="mydocs-content">
          <div className="mydocs-summary">
            <p className="mydocs-total">Total Documents: <strong>{getTotalDocuments()}</strong></p>
          </div>

          <div className="mydocs-categories">
            {Object.entries(documentsByCategory).map(([category, documents]) => {
              const info = categoryInfo[category] || { name: category, color: '#666', icon: '📄' }
              const isExpanded = expandedCategories[category]

              return (
                <div key={category} className="mydocs-category-section">
                  <div 
                    className="mydocs-category-header"
                    onClick={() => toggleCategory(category)}
                    style={{ borderLeftColor: info.color }}
                  >
                    <div className="mydocs-category-title">
                      <span className="mydocs-category-icon">{info.icon}</span>
                      <h3>{info.name}</h3>
                      <span className="mydocs-category-count">({documents.length})</span>
                    </div>
                    <button className="mydocs-toggle-btn">
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <path d="M6 9l6 6 6-6" stroke="#3D1F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mydocs-list">
                      {documents.map((doc) => (
                        <div key={doc._id} className="mydocs-card">
                          <div className="mydocs-icon">
                            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                              <rect width="50" height="50" rx="8" fill="#F5F5F5"/>
                              <path d="M15 10L35 10L35 40L15 40Z" fill="white"/>
                              <rect x="17" y="28" width="16" height="8" rx="2" fill={info.color}/>
                              <text x="25" y="34" fontSize="7" fill="white" textAnchor="middle" fontWeight="bold">
                                {doc.fileType?.toUpperCase() || 'DOC'}
                              </text>
                            </svg>
                          </div>

                          <div className="mydocs-details">
                            <h4 className="mydocs-filename">{doc.fileName}</h4>
                            <p className="mydocs-doc-title">{doc.title}</p>
                            <p className="mydocs-doc-type">{doc.documentType.replace('_', ' ')}</p>
                            <p className="mydocs-date">Uploaded: {formatDate(doc.uploadDate)}</p>

                            <div className="mydocs-actions">
                              <button 
                                className="mydocs-action-btn mydocs-view"
                                onClick={() => handleView(doc._id, doc.fileName, doc.fileType)}
                                title="View"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  <path d="M2 12C2 12 5 6 12 6C19 6 22 12 22 12C22 12 19 18 12 18C5 18 2 12 2 12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                                </svg>
                                View
                              </button>
                              <button 
                                className="mydocs-action-btn mydocs-download"
                                onClick={() => handleDownload(doc._id, doc.fileName)}
                                title="Download"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <line x1="12" y1="5" x2="12" y2="16" stroke="currentColor" strokeWidth="2"/>
                                  <path d="M8 13L12 17L16 13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                                  <line x1="6" y1="19" x2="18" y2="19" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Download
                              </button>
                              <button 
                                className="mydocs-action-btn mydocs-share"
                                onClick={() => handleShare(doc._id, doc.fileName)}
                                title="Share"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  <line x1="9" y1="11" x2="15" y2="6" stroke="currentColor" strokeWidth="2"/>
                                  <line x1="9" y1="13" x2="15" y2="18" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Share
                              </button>
                              <button 
                                className="mydocs-action-btn mydocs-delete"
                                onClick={() => handleDelete(doc._id)}
                                title="Delete"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path d="M10 11L10 17M14 11L14 17M4 7L20 7M6 7L6 19C6 20.1046 6.89543 21 8 21L16 21C17.1046 21 18 20.1046 18 19L18 7M9 7L9 4L15 4L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <DocumentViewerModal
        isOpen={viewerModal.isOpen}
        onClose={closeViewerModal}
        documentUrl={viewerModal.url}
        fileName={viewerModal.fileName}
        fileType={viewerModal.fileType}
      />

      <DocumentShareModal
        isOpen={shareModal.isOpen}
        onClose={closeShareModal}
        documentId={shareModal.documentId}
        documentName={shareModal.documentName}
      />
    </div>
  )
}

export default MyDocumentsPage
