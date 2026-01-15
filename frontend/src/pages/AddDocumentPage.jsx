import { useNavigate } from 'react-router-dom'
import './AddDocumentPage.css'

function AddDocumentPage() {
  const navigate = useNavigate()

  const categories = [
    { id: 1, name: 'Personal', icon: '👤', path: '/personal' },
    { id: 2, name: 'Investment', icon: '💰 ', path: '/investment' },
    { id: 3, name: 'Insurance', icon: '🛡️', path: '/insurance' },
    { id: 4, name: 'Loans(Liability)', icon: '💳', path: '/loans' },
    { id: 5, name: 'Retirement Claims', icon: '💵', path: '/retirement' },
  ]

  return (
    <div className="add-document-page">
      <div className="page-header-purple">
        <h1>Add Documents 📄</h1>
      </div>

      <div className="document-categories-list">
        {categories.map((category) => (
          <button
            key={category.id}
            className="doc-category-item"
            onClick={() => navigate(category.path)}
          >
            <div className="doc-category-icon" style={{ backgroundColor: category.color }}>
              <span>{category.icon}</span>
            </div>
            <span className="doc-category-name">{category.name}</span>
            <span className="arrow-right">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default AddDocumentPage
