import { useNavigate } from 'react-router-dom'
import './SettingPage.css'

function SettingPage() {
  const navigate = useNavigate()

  const settings = [
    { icon: '🔒', label: 'Bio Metric Security', path: '/setting/biometric' },
    { icon: '🔑', label: 'Password Security', path: '/setting/password' },
    { icon: '🗑️', label: 'Delete Your Account', path: '/setting/delete-account' }
  ]

  return (
    <div className="setting-page">
      <div className="page-header">
        <span className="header-icon">⚙️</span>
        <h1>Setting</h1>
      </div>

      <div className="settings-list">
        {settings.map((setting, index) => (
          <div key={index} className="setting-item" onClick={() => navigate(setting.path)}>
            <div className="setting-left">
              <span className="setting-icon">{setting.icon}</span>
              <span className="setting-label">{setting.label}</span>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SettingPage
