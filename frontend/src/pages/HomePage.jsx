import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import BottomNav from '../components/BottomNav'
import { bannerAPI } from '../services/api'

function HomePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [banners, setBanners] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const slideTimer = useRef(null)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // Fetch active banners
  useEffect(() => {
    bannerAPI.getActive()
      .then(res => {
        if (res.data && res.data.length > 0) setBanners(res.data)
      })
      .catch(() => {}) // silently fall back to static image
  }, [])

  // Auto-advance slider every 4 s
  useEffect(() => {
    const total = banners.length || 1
    if (total <= 1) return
    slideTimer.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % total)
    }, 4000)
    return () => clearInterval(slideTimer.current)
  }, [banners])

  const categories = [
    { id: 1, name: 'Personal Information', desc: 'Store your Aadhar, PAN, Passport, Voter, DL, etc', color: '#FDB913', icon: '👤', path: '/personal' },
    { id: 2, name: 'Retirements', desc: 'Store your Retirements Documents, other documents in safe place', color: '#4A90E2', icon: '💼', path: '/retirement' },
    { id: 3, name: 'Investments', desc: 'Store your Investments Documents like Realestate, Properties and Deposits etc.', color: '#4CAF50', icon: '📈', path: '/investment' },
    { id: 4, name: 'Loans', desc: 'Store your various Loan Documents', color: '#F44336', icon: '💰', path: '/loans' },
  ]


  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  
  return (
    <div className="home-page">
      <div className="home-header">
        <img src="/Logo.png" alt="Bharat Records" className="home-logo" />
      </div>

      <div className="welcome-card">
        <div className="welcome-content">
          <h2>Welcome, {user?.fullName || 'Guest'}</h2>
          <p className="client-id">Client ID: {user?.clientId || 'N/A'}</p>
          <p className="welcome-text">
            Bharat Record is your personal document repository, accessible anytime from anywhere with high security as per our Terms of service and Privacy policy
          </p>
        </div>
        <div className="user-avatar">
          {user?.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt="Profile" 
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
          ) : null}
          <svg 
            width="60" 
            height="60" 
            viewBox="0 0 60 60" 
            fill="none"
            style={{ display: user?.profilePicture ? 'none' : 'block' }}
          >
            <circle cx="30" cy="30" r="30" fill="#3D1F8F"/>
            <circle cx="30" cy="22" r="10" fill="white"/>
            <path d="M15 45C15 38 21 33 30 33C39 33 45 38 45 45" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="todo-card" onClick={() => navigate('/add-task')}>
        <div className="todo-icon">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <rect x="10" y="5" width="40" height="50" rx="4" fill="#FDB913"/>
            <rect x="15" y="15" width="8" height="8" rx="2" fill="white"/>
            <rect x="15" y="26" width="8" height="8" rx="2" fill="white"/>
            <rect x="15" y="37" width="8" height="8" rx="2" fill="white"/>
            <line x1="27" y1="19" x2="42" y2="19" stroke="white" strokeWidth="2"/>
            <line x1="27" y1="30" x2="42" y2="30" stroke="white" strokeWidth="2"/>
            <line x1="27" y1="41" x2="42" y2="41" stroke="white" strokeWidth="2"/>
            <path d="M48 5L50 10L55 8L52 15L60 18L52 20L50 25L48 20L42 18L48 15L45 8L48 5Z" fill="#F44336"/>
          </svg>
        </div>
        <p>Write your Daily Task on the Todo Feature</p>
      </div>

      <div className="categories-section">
        <div className="section-header">
          <h3>Categories</h3>
          <button className="see-all" onClick={() => navigate('/add-document')}>See All</button>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <button 
              key={category.id} 
              className="category-card" 
              style={{ backgroundColor: category.color }}
              onClick={() => navigate(category.path)}
            >
              <div className="category-icon-circle">
                <span className="category-emoji">{category.icon}</span>
              </div>
              <h4>{category.name}</h4>
              <p>{category.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="whats-new-section">
        <h3>What's new</h3>
        <div className="news-banner" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* ── Banner Slider ── */}
          {banners.length === 0 ? (
            /* Fallback: original static image */
            <div className="news-illustration">
              <img src="/Homebottom.jpg" className="news-text" alt="News" />
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  transition: 'transform 0.5s ease',
                  transform: `translateX(-${currentSlide * 100}%)`,
                  willChange: 'transform'
                }}
              >
                {banners.map((b, i) => (
                  <div
                    key={b._id}
                    style={{ minWidth: '100%', flexShrink: 0 }}
                    onClick={() => b.linkUrl && window.open(b.linkUrl, '_blank')}
                  >
                    <img
                      src={b.imageUrl}
                      alt={b.title || `Banner ${i + 1}`}
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '12px',
                        cursor: b.linkUrl ? 'pointer' : 'default'
                      }}
                      onError={e => { e.target.src = '/Homebottom.jpg'; }}
                    />
                  </div>
                ))}
              </div>

              {/* Dot indicators */}
              {banners.length > 1 && (
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 8,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 6,
                  zIndex: 30,
                  padding: '4px 8px',
                  alignItems: 'center'
                }}>
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => {
                        clearInterval(slideTimer.current)
                        setCurrentSlide(i)
                      }}
                      style={{
                        width: i === currentSlide ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        border: 'none',
                        background: i === currentSlide ? '#3D1F8F' : '#ccc',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'width 0.3s, background 0.3s'
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

export default HomePage
