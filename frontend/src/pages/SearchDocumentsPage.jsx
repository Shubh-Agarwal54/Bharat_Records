import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { documentAPI } from '../services/api'
import DocumentViewerModal from '../components/DocumentViewerModal'
import DocumentShareModal from '../components/DocumentShareModal'
import BottomNav from '../components/BottomNav'
import './SearchDocumentsPage.css'

function SearchDocumentsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [allDocuments, setAllDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [viewerModal, setViewerModal] = useState({ isOpen: false, url: '', fileName: '', fileType: '' })
  const [shareModal, setShareModal] = useState({ isOpen: false, documentId: '', documentName: '' })

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'personal', label: 'Personal' },
    { value: 'investment', label: 'Investment' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'loans', label: 'Loans' },
    { value: 'retirement', label: 'Retirement' }
  ]

  useEffect(() => {
    loadAllDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [searchQuery, selectedCategory, allDocuments])

  const loadAllDocuments = async () => {
    try {
      setLoading(true)
      const response = await documentAPI.getAll()
      
      if (response.status === 'success') {
        setAllDocuments(response.data.documents)
      }
    } catch (err) {
      console.error('Failed to load documents:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = [...allDocuments]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.fileName.toLowerCase().includes(query) ||
        doc.title.toLowerCase().includes(query) ||
        doc.documentType.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query)
      )
    }

    setFilteredDocuments(filtered)
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
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

  const getCategoryBadgeColor = (category) => {
    const colors = {
      personal: '#3D1F8F',
      investment: '#00A8E8',
      insurance: '#FF6B6B',
      loans: '#FFA500',
      retirement: '#4CAF50'
    }
    return colors[category] || '#666'
  }

  return (
    <div className="search-documents-page">
      <div className="search-page-header">
        <button className="search-back-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>Search Documents 🔍</h1>
      </div>

      <div className="search-content">
        <input
          type="text"
          placeholder="Search by name, type, or category..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-filter-btn ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {error && <div className="search-error-message">{error}</div>}

        {loading ? (
          <div className="search-loading">
            <div className="search-spinner"></div>
            <p>Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="search-empty-state">
            <div className="empty-icon">📭</div>
            <p className="empty-title">No documents found</p>
            <p className="empty-subtitle">
              {searchQuery ? 'Try different search terms' : 'Upload your first document to get started'}
            </p>
          </div>
        ) : (
          <div className="search-results">
            <div className="results-header">
              <p>{filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found</p>
            </div>
            <div className="search-documents-list">
              {filteredDocuments.map((doc) => (
                <div key={doc._id} className="search-doc-card">
                  <div className="search-doc-icon">
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                      <rect width="50" height="50" rx="8" fill="#F5F5F5"/>
                      <path d="M15 10L35 10L35 40L15 40Z" fill="white"/>
                      <rect x="17" y="28" width="16" height="8" rx="2" fill="#FF4444"/>
                      <text x="25" y="34" fontSize="7" fill="white" textAnchor="middle" fontWeight="bold">
                        {doc.fileType?.toUpperCase() || 'DOC'}
                      </text>
                    </svg>
                  </div>

                  <div className="search-doc-details">
                    <h3 className="search-doc-name">{doc.fileName}</h3>
                    <p className="search-doc-title">{doc.title}</p>
                    <div className="search-doc-meta">
                      <span className="search-doc-badge" style={{ backgroundColor: getCategoryBadgeColor(doc.category) }}>
                        {doc.category}
                      </span>
                      <span className="search-doc-type">{doc.documentType.replace('_', ' ')}</span>
                    </div>
                    <p className="search-doc-date">Uploaded: {formatDate(doc.uploadDate)}</p>

                    <div className="search-doc-actions">
                      <button 
                        className="search-action-btn view"
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
                        className="search-action-btn download"
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
                        className="search-action-btn share"
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
                        className="search-action-btn delete"
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
          </div>
        )}
      </div>

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

      <BottomNav />
    </div>
  )
}

export default SearchDocumentsPage
