import { useNavigate } from 'react-router-dom'
import './TransferMoneyPage.css'

function TransferMoneyPage() {
  const navigate = useNavigate()

  const contacts = Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    name: 'Tarun',
    upi: '123456789@upi'
  }))

  return (
    <div className="transfer-money-page">
      <div className="page-header-purple">
        <h1>Transfer Money ⬆</h1>
      </div>

      <div className="transfer-content">
        <h3>All People on UPI</h3>

        <div className="contacts-list">
          {contacts.map((contact) => (
            <button key={contact.id} className="contact-item">
              <div className="contact-avatar">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                  <circle cx="25" cy="25" r="25" fill="#D4C5F9"/>
                  <circle cx="25" cy="18" r="8" fill="#3D1F8F"/>
                  <path d="M10 40C10 32 16 28 25 28C34 28 40 32 40 40" fill="#3D1F8F"/>
                </svg>
              </div>
              <div className="contact-info">
                <p className="contact-name">{contact.name}</p>
                <p className="contact-upi">{contact.upi}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TransferMoneyPage
