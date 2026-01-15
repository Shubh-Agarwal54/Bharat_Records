import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import './SearchDocumentsPage.css'

function SearchDocumentsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="search-documents-page">
      <div className="page-header">
        <h1>Search Documents 🔍</h1>
      </div>

      <div className="search-content">
        <input
          type="text"
          placeholder="Search Documents"
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />

        <div className="empty-state">
          {/* Empty state - no documents shown */}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default SearchDocumentsPage
