import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { documentAPI } from '../services/api'
import './DocumentUploadTemplate.css'

function InvestmentDocumentUploadTemplate({ title, icon, documentType, formFields, category = 'investment' }) {
  const navigate = useNavigate()
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({})

  // Initialize form data
  useEffect(() => {
    const initialData = {}
    formFields?.forEach(field => {
      initialData[field.name] = field.type === 'checkbox' ? false : ''
    })
    setFormData(initialData)
  }, [formFields])

  // Load documents on mount
  useEffect(() => {
    loadDocuments()
  }, [documentType])

  const loadDocuments = async () => {
    try {
      const response = await documentAPI.getAll(category, documentType)
      if (response.status === 'success') {
        setUploadedDocs(response.data.documents)
      }
    } catch (err) {
      console.error('Failed to load documents:', err)
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size should be less than 2 MB')
        return
      }
      setSelectedFile(file)
      setError('')
      setSuccess('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('document', selectedFile)
      uploadFormData.append('category', category)
      uploadFormData.append('documentType', documentType)
      uploadFormData.append('title', `${title} - ${new Date().toLocaleDateString()}`)
      uploadFormData.append('metadata', JSON.stringify(formData))

      const response = await documentAPI.upload(uploadFormData)

      if (response.status === 'success') {
        setSuccess('Document uploaded successfully!')
        setSelectedFile(null)
        document.getElementById('fileInput').value = ''
        // Reset form
        const resetData = {}
        formFields?.forEach(field => {
          resetData[field.name] = field.type === 'checkbox' ? false : ''
        })
        setFormData(resetData)
        await loadDocuments()
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.message || 'Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await documentAPI.delete(docId)
      if (response.status === 'success') {
        setSuccess('Document deleted successfully!')
        await loadDocuments()
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete document')
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-')
  }

  const renderFormField = (field) => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.name} className="form-group">
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={handleFormChange}
              className="form-input-purple"
              required={field.required}
            />
          </div>
        )
      case 'select':
        return (
          <div key={field.name} className="form-group">
            <select
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleFormChange}
              className="form-select"
              required={field.required}
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )
      case 'checkbox':
        return (
          <div key={field.name} className="checkbox-group">
            <label className="checkbox-label">
              <span>{field.label}</span>
              <input
                type="checkbox"
                name={field.name}
                checked={formData[field.name] || false}
                onChange={handleFormChange}
                className="form-checkbox"
              />
            </label>
          </div>
        )
      case 'textarea':
        return (
          <div key={field.name} className="form-group">
            <textarea
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={handleFormChange}
              className="form-textarea"
              rows="4"
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="document-upload-page">
      <div className="page-header-purple">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>{title} {icon}</h1>
      </div>

      {error && <div className="error-message" style={{ margin: '20px', textAlign: 'center' }}>{error}</div>}
      {success && <div className="success-message" style={{ margin: '20px', textAlign: 'center' }}>{success}</div>}

      <div className="upload-section">
        {/* Form Fields */}
        {formFields && formFields.length > 0 && (
          <div className="form-content" style={{ marginBottom: '20px' }}>
            {formFields.map(field => renderFormField(field))}
          </div>
        )}

        {/* File Upload Area */}
        <div className="upload-area">
          <div className="upload-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="10" y="20" width="50" height="40" rx="4" stroke="#666" strokeWidth="2" strokeDasharray="4 4"/>
              <path d="M25 35L32 28L39 35" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="32" y1="28" x2="32" y2="48" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="55" cy="25" r="15" fill="white" stroke="#666" strokeWidth="2"/>
              <line x1="55" y1="18" x2="55" y2="32" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
              <line x1="48" y1="25" x2="62" y2="25" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="upload-hint">Document should be less than 2 MB</p>
          {selectedFile && <p className="selected-file">Selected: {selectedFile.name}</p>}
        </div>

        <input
          id="fileInput"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <button 
          className="btn-attach-document" 
          onClick={() => document.getElementById('fileInput').click()}
          disabled={loading}
        >
          <span>Attach Document</span>
          <span className="plus-icon">+</span>
        </button>

        <button 
          className="btn-submit-purple" 
          onClick={handleUpload}
          disabled={loading || !selectedFile}
        >
          {loading ? 'Uploading...' : 'Submit'}
        </button>
      </div>

      <div className="uploaded-docs-section">
        <div className="section-divider">
          <span>Document Uploaded ({uploadedDocs.length})</span>
        </div>

        {uploadedDocs.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No documents uploaded yet</p>
        ) : (
          <div className="uploaded-docs-list">
            {uploadedDocs.map((doc) => (
              <div key={doc._id} className="uploaded-doc-card">
                <div className="doc-pdf-icon">
                  <div className="pdf-icon-wrapper">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                      <rect width="60" height="60" rx="8" fill="#F5F5F5"/>
                      <path d="M20 15L40 15L40 45L20 45Z" fill="white"/>
                      <rect x="22" y="32" width="16" height="8" rx="2" fill="#FF4444"/>
                      <text x="30" y="38" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">
                        {doc.fileType?.toUpperCase() || 'DOC'}
                      </text>
                    </svg>
                  </div>
                </div>

                <div className="doc-info">
                  <p className="doc-name">Name : {doc.fileName}</p>
                  <p className="doc-date">Date : {formatDate(doc.uploadDate)}</p>
                  {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                    <div className="doc-metadata">
                      {Object.entries(doc.metadata).map(([key, value]) => {
                        if (value && key !== '_id') {
                          return (
                            <p key={key} className="metadata-item">
                              <strong>{key}:</strong> {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                            </p>
                          )
                        }
                        return null
                      })}
                    </div>
                  )}
                  <div className="doc-actions">
                    <button 
                      className="action-btn-download"
                      onClick={() => handleDownload(doc._id, doc.fileName)}
                      title="Download"
                    >
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="20" fill="white"/>
                        <line x1="20" y1="13" x2="20" y2="24" stroke="#3D1F8F" strokeWidth="2"/>
                        <path d="M16 21L20 25L24 21" stroke="#3D1F8F" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <line x1="14" y1="27" x2="26" y2="27" stroke="#3D1F8F" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button 
                      className="action-btn-delete"
                      onClick={() => handleDelete(doc._id)}
                      title="Delete"
                    >
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="20" fill="white"/>
                        <path d="M15 16L15 27L25 27L25 16Z" stroke="#3D1F8F" strokeWidth="2" fill="none"/>
                        <line x1="13" y1="16" x2="27" y2="16" stroke="#3D1F8F" strokeWidth="2"/>
                        <path d="M17 14L17 13L23 13L23 14" stroke="#3D1F8F" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InvestmentDocumentUploadTemplate
