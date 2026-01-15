import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ReportsPage.css'

function ReportsPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')

  const filters = ['All', 'Personal', 'Insurance', 'Investment', 'Loans', 'Retirements']

  const documents = [
    { name: 'AADHAR_22022024.pdf', date: '22-02-2024' },
    { name: 'AADHAR_22022024.pdf', date: '22-02-2024' }
  ]

  return (
    <div className="reports-page">
      <div className="page-header">
        <span className="header-icon">📊</span>
        <h1>Reports</h1>
      </div>

      <div className="reports-content">
        <h2 className="section-title">Sort By</h2>
        
        <div className="filter-buttons">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <h2 className="section-title">Your Documents</h2>

        <div className="documents-list">
          {documents.map((doc, index) => (
            <div key={index} className="document-card">
              <div className="pdf-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect width="80" height="80" rx="12" fill="#F0F0F0"/>
                  <path d="M25 20h30l10 10v35a2 2 0 01-2 2H25a2 2 0 01-2-2V22a2 2 0 012-2z" fill="white" stroke="#dddddd49"/>
                  <text x="40" y="50" textAnchor="middle" fill="#E53935" fontSize="16" fontWeight="bold">PDF</text>
                </svg>
              </div>
              <div className="document-info">
                <div className="doc-name">Name : {doc.name}</div>
                <div className="doc-date">Date : {doc.date}</div>

                     <div className="document-actions">
                <button className="action-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M17 3l4 4-10 10H7v-4L17 3z" stroke="#3D1F8F" strokeWidth="2" fill="none"/>
                  </svg>
                </button>
                <button className="action-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 002 2h8a2 2 0 002-2V6" stroke="#3D1F8F" strokeWidth="2" fill="none"/>
                  </svg>
                </button>
                <button className="action-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" stroke="#3D1F8F" strokeWidth="2" fill="none"/>
                  </svg>
                </button>
              </div>
              </div> 
         
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
