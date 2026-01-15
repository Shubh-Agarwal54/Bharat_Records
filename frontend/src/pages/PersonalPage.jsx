import { useNavigate } from 'react-router-dom'
import './PersonalPage.css'
import { useEffect } from 'react'

function PersonalPage() {
  const navigate = useNavigate()

  const identityDocs = [
    { id: 1, name: 'PAN', icon: '🏛️', path: '/personal/pan' },
    { id: 2, name: 'Aadhar', icon: '👤', path: '/personal/aadhar' },
    { id: 3, name: 'Driving License', icon: '🪪', path: '/personal/driving-license' },
    { id: 4, name: 'Passport', icon: '📘', path: '/personal/passport' },
    { id: 5, name: 'Voter ID', icon: '🗳️', path: '/personal/voter-id' },
  ]

  const educationalDocs = [
    { id: 1, name: 'Markesheet', icon: '📄', path: '/personal/markesheet' },
    { id: 2, name: 'Certificates', icon: '📜', path: '/personal/certificates' },
  ]

  const otherDocs = [
    { id: 1, name: 'Vehicle RC', icon: '🚗', path: '/personal/vehicle-rc' },
    { id: 2, name: 'Resume / CV', icon: '📝', path: '/personal/resume' },
    { id: 3, name: 'Marriage Certificate', icon: '💍', path: '/personal/marriage-certificate' },
    { id: 4, name: 'Debit / Credit Cards', icon: '💳', path: '/personal/debit-credit-cards' },
    { id: 5, name: 'Medical Records', icon: '🏥', path: '/personal/medical-records' },
  ]
  
  useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}, []);

  return (
    <div className="personal-page">
      <div className="page-header-purple">
        <h1>Personal 👤</h1>
      </div>

      <div className="personal-content">
        <div className="doc-section">
          <div className="section-divider">
            <span>Identity Document</span>
          </div>

          <div className="doc-items-list">
            {identityDocs.map((doc) => (
              <button
                key={doc.id}
                className="doc-item"
                onClick={() => navigate(doc.path)}
              >
                <span className="doc-item-icon">{doc.icon}</span>
                <span className="doc-item-name">{doc.name}</span>
                <span className="arrow-right">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="doc-section">
          <div className="section-divider">
            <span>Educational Documents</span>
          </div>

          <div className="doc-items-list">
            {educationalDocs.map((doc) => (
              <button
                key={doc.id}
                className="doc-item"
                onClick={() => navigate(doc.path)}
              >
                <span className="doc-item-icon">{doc.icon}</span>
                <span className="doc-item-name">{doc.name}</span>
                <span className="arrow-right">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="doc-section">
          <div className="section-divider">
            <span>Other Personal Document</span>
          </div>

          <div className="doc-items-list">
            {otherDocs.map((doc) => (
              <button
                key={doc.id}
                className="doc-item"
                onClick={() => navigate(doc.path)}
              >
                <span className="doc-item-icon">{doc.icon}</span>
                <span className="doc-item-name">{doc.name}</span>
                <span className="arrow-right">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalPage
