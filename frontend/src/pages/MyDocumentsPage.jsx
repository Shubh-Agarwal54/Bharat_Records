import { useNavigate } from 'react-router-dom'
import './MyDocumentsPage.css'

function MyDocumentsPage() {
  const navigate = useNavigate()

  return (
    <div className="my-documents-page">
      <div className="page-header">
        <h1>My Documents</h1>
      </div>

      <div className="empty-state">
        <div className="empty-icon">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <rect x="50" y="30" width="100" height="140" rx="8" fill="#FDB913"/>
            <rect x="60" y="60" width="80" height="60" rx="4" fill="#FFE082"/>
            <circle cx="100" cy="50" r="15" fill="white"/>
            <path d="M95 45h10M95 50h10M95 55h10" stroke="white" strokeWidth="2"/>
            <path d="M110 40l10 10" stroke="#8B7000" strokeWidth="3"/>
          </svg>
        </div>
        <p className="empty-text">You have no documents</p>
      </div>
    </div>
  )
}

export default MyDocumentsPage
