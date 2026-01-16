import { useEffect, useState } from 'react'
import './DocumentViewerModal.css'

function DocumentViewerModal({ isOpen, onClose, documentUrl, fileName, fileType }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setLoading(true)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('doc-viewer-modal-backdrop')) {
      onClose()
    }
  }

  const renderViewer = () => {
    if (fileType === 'pdf') {
      return (
        <iframe
          src={documentUrl}
          title={fileName}
          className="doc-viewer-iframe"
          onLoad={() => setLoading(false)}
        />
      )
    } else if (['jpg', 'jpeg', 'png'].includes(fileType?.toLowerCase())) {
      return (
        <img
          src={documentUrl}
          alt={fileName}
          className="doc-viewer-image"
          onLoad={() => setLoading(false)}
        />
      )
    }
    return <div className="doc-viewer-unsupported">File type not supported for preview</div>
  }

  return (
    <div className="doc-viewer-modal-backdrop" onClick={handleBackdropClick}>
      <div className="doc-viewer-modal-container">
        <div className="doc-viewer-modal-header">
          <h3 className="doc-viewer-modal-title">{fileName}</h3>
          <button className="doc-viewer-close-btn" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="doc-viewer-modal-body">
          {loading && (
            <div className="doc-viewer-loader">
              <div className="doc-viewer-spinner"></div>
              <p>Loading document...</p>
            </div>
          )}
          {renderViewer()}
        </div>
      </div>
    </div>
  )
}

export default DocumentViewerModal
