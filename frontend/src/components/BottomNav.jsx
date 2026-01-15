import { useNavigate } from 'react-router-dom'
import './BottomNav.css'

function BottomNav({ active = 'home' }) {
  const navigate = useNavigate()

  return (
    <div className="bottom-nav">
      <button 
        className={`nav-item ${active === 'home' ? 'active' : ''}`}
        onClick={() => navigate('/home')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Home</span>
      </button>

      <button 
        className={`nav-item ${active === 'wallet' ? 'active' : ''}`}
        onClick={() => navigate('/wallet')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
          <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
        </svg>
        <span>Wallet</span>
      </button>

      <button className="nav-item-center" onClick={() => navigate('/add-document')}>
        <div className="add-button">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <line x1="16" y1="8" x2="16" y2="24" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <line x1="8" y1="16" x2="24" y2="16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
      </button>

      <button 
        className={`nav-item ${active === 'search' ? 'active' : ''}`}
        onClick={() => navigate('/search')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <span>Search</span>
      </button>

      <button 
        className={`nav-item ${active === 'menu' ? 'active' : ''}`}
        onClick={() => navigate('/menu')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span>Menu</span>
      </button>
    </div>
  )
}

export default BottomNav
