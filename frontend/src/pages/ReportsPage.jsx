import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { documentAPI } from '../services/api'
import DocumentViewerModal from '../components/DocumentViewerModal'
import DocumentShareModal from '../components/DocumentShareModal'
import './ReportsPage.css'

function ReportsPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [viewerModal, setViewerModal] = useState({ isOpen: false, url: '', fileName: '', fileType: '' })
  const [shareModal, setShareModal] = useState({ isOpen: false, documentId: '', documentName: '' })

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Personal', value: 'personal' },
    { label: 'Investment', value: 'investment' },
    { label: 'Insurance', value: 'insurance' },
    { label: 'Loans', value: 'loans' },
    { label: 'Retirement', value: 'retirement' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [activeFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load all documents and stats
      const [docsResponse, statsResponse] = await Promise.all([
        documentAPI.getAll(),
        documentAPI.getStats()
      ])

      if (docsResponse.status === 'success') {
        setDocuments(docsResponse.data.documents)
      }

      if (statsResponse.status === 'success') {
        setStats(statsResponse.data.stats)
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load reports data')
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    // Filter will be applied in rendering
  }

  const getFilteredDocuments = () => {
    if (activeFilter === 'all') {
      return documents
    }
    return documents.filter(doc => doc.category === activeFilter)
  }

  const getCategoryStats = (category) => {
    const stat = stats.find(s => s._id === category)
    return stat ? stat.count : 0
  }

  const getTotalDocuments = () => {
    return documents.length
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-')
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
        setSuccess('Document deleted successfully!')
        await loadData()
        setTimeout(() => setSuccess(''), 3000)
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

  const filteredDocs = getFilteredDocuments()

  return (
    <div className="reports-page">
      <div className="reports-page-header">
        <button className="reports-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="reports-header-icon">📊</span>
        <h1>Reports</h1>
      </div>

      {error && <div className="reports-error-message">{error}</div>}
      {success && <div className="reports-success-message">{success}</div>}

      {loading ? (
        <div className="reports-loading">
          <div className="reports-spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : (
        <div className="reports-content">
          {/* Statistics Cards */}
          <div className="reports-stats-grid">
            <div className="reports-stat-card total">
              <div className="stat-icon">📁</div>
              <div className="stat-info">
                <p className="stat-label">Total Documents</p>
                <p className="stat-value">{getTotalDocuments()}</p>
              </div>
            </div>
            {filters.slice(1).map((filter) => (
              <div key={filter.value} className="reports-stat-card">
                <div className="stat-icon">
                  {filter.value === 'personal' && '👤'}
                  {filter.value === 'investment' && '📈'}
                  {filter.value === 'insurance' && '🛡️'}
                  {filter.value === 'loans' && '💰'}
                  {filter.value === 'retirement' && '💼'}
                </div>
                <div className="stat-info">
                  <p className="stat-label">{filter.label}</p>
                  <p className="stat-value">{getCategoryStats(filter.value)}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="reports-section-title">Filter By Category</h2>
          
          <div className="reports-filter-buttons">
            {filters.map((filter) => (
              <button
                key={filter.value}
                className={`reports-filter-btn ${activeFilter === filter.value ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="reports-documents-header">
            <h2 className="reports-section-title">Your Documents</h2>
            <span className="reports-doc-count">({filteredDocs.length})</span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="reports-empty-state">
              <p className="reports-empty-icon">📭</p>
              <p className="reports-empty-text">No documents found</p>
            </div>
          ) : (
            <div className="reports-documents-list">
              {filteredDocs.map((doc) => (
                <div key={doc._id} className="reports-document-card">
                  <div className="reports-pdf-icon">
                    <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
                      <rect width="70" height="70" rx="10" fill="#F5F5F5"/>
                      <path d="M20 15L50 15L50 55L20 55Z" fill="white"/>
                      <rect x="23" y="42" width="24" height="10" rx="2" fill="#FF4444"/>
                      <text x="35" y="49" fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">
                        {doc.fileType?.toUpperCase() || 'DOC'}
                      </text>
                    </svg>
                  </div>
                  <div className="reports-document-info">
                    <div className="reports-doc-name">{doc.title || doc.fileName}</div>
                    <div className="reports-doc-meta">
                      <span className="reports-doc-category">
                        {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                      </span>
                      <span className="reports-doc-separator">•</span>
                      <span className="reports-doc-date">{formatDate(doc.uploadDate)}</span>
                      {doc.fileSize && (
                        <>
                          <span className="reports-doc-separator">•</span>
                          <span className="reports-doc-size">{formatFileSize(doc.fileSize)}</span>
                        </>
                      )}
                    </div>

                    <div className="reports-document-actions">
                      <button 
                        className="reports-action-btn reports-view-btn"
                        onClick={() => handleView(doc._id, doc.fileName, doc.fileType)}
                        title="View"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M2 12C2 12 5 6 12 6C19 6 22 12 22 12C22 12 19 18 12 18C5 18 2 12 2 12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        View
                      </button>
                      <button 
                        className="reports-action-btn reports-download-btn"
                        onClick={() => handleDownload(doc._id, doc.fileName)}
                        title="Download"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <line x1="12" y1="5" x2="12" y2="16" stroke="currentColor" strokeWidth="2"/>
                          <path d="M8 13L12 17L16 13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <line x1="6" y1="19" x2="18" y2="19" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Download
                      </button>
                      <button 
                        className="reports-action-btn reports-share-btn"
                        onClick={() => handleShare(doc._id, doc.fileName)}
                        title="Share"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <line x1="9" y1="11" x2="15" y2="6" stroke="currentColor" strokeWidth="2"/>
                          <line x1="9" y1="13" x2="15" y2="18" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Share
                      </button>
                      <button 
                        className="reports-action-btn reports-delete-btn"
                        onClick={() => handleDelete(doc._id)}
                        title="Delete"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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

export default ReportsPage
