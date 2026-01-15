import { useNavigate } from 'react-router-dom'
import './DocShareHistoryPage.css'

function DocShareHistoryPage() {
  const navigate = useNavigate()

  const shareHistory = [
    { platform: 'Gmail', icon: '📧', contact: 'abc@gmail.com', document: 'Aadhar Card', date: '12-12-23 // 02:02 PM' },
    { platform: 'WhatsApp', icon: '💬', contact: '+911234567890', document: 'PAN Card', date: '12-12-23 // 02:02 PM' },
    { platform: 'Telegram', icon: '✈️', contact: '+911234567890', document: 'Driving License', date: '12-12-23 // 02:02 PM' }
  ]

  return (
    <div className="doc-share-history-page">
      <div className="page-header">
        <span className="header-icon">🕐</span>
        <h1>Doc Share History</h1>
      </div>

      <div className="history-list">
        {shareHistory.map((item, index) => (
          <div key={index} className="history-card">
            <div className="platform-icon">
              <span className="icon-emoji">{item.icon}</span>
            </div>
            <div className="history-info">
              <h3 className="platform-name">{item.platform}</h3>
              <p className="contact-info">{item.contact}</p>
              <p className="document-name">{item.document}</p>
              <p className="share-date">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DocShareHistoryPage
