import { useNavigate } from 'react-router-dom'
import './WalletPage.css'
import BottomNav from '../components/BottomNav'

function WalletPage() {
  const navigate = useNavigate()

  const transactions = [
    { id: 1, name: 'Tarun', amount: 3500.00, date: 'Dec 15 12:32 PM', type: 'credit' },
    { id: 2, name: 'Tarun', amount: 3500.00, date: 'Dec 15 12:32 PM', type: 'credit' },
    { id: 3, name: 'Tarun', amount: 3500.00, date: 'Dec 15 12:32 PM', type: 'credit' },
    { id: 4, name: 'Tarun', amount: 3500.00, date: 'Dec 15 12:32 PM', type: 'credit' },
    { id: 5, name: 'Tarun', amount: 3500.00, date: 'Dec 15 12:32 PM', type: 'credit' },
    { id: 6, name: 'Tarun', amount: 3500.00, date: 'Dec 15 12:32 PM', type: 'credit' },
  ]

  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <h1>Wallet <div className="wallet-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
          </svg>
        </div></h1>
        
      </div>

      <div className="balance-section">
        <p className="balance-label">Your Balance :</p>
        <h2 className="balance-amount">₹ 4999.99</h2>

        <div className="wallet-actions">
          <button className="action-btn1" onClick={() => navigate('/add-money')}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle  cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <span>Add Money</span>
          </button>

          <button className="action-btn1" onClick={() => navigate('/transfer-money')}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
            </div>
            <span>Transfer Money</span>
          </button>

          <button className="action-btn1" onClick={() => navigate('/withdraw-money')}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <span>Withdraw Money</span>
          </button>
        </div>
      </div>

      <div className="transactions-section">
        <h3>Your Transactions</h3>
        <div className="transactions-list">
          {transactions.map((txn) => (
            <div key={txn.id} className="transaction-item">
              <div className="txn-avatar">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="#D4C5F9"/>
                  <circle cx="20" cy="15" r="6" fill="#3D1F8F"/>
                  <path d="M10 30C10 25 14 22 20 22C26 22 30 25 30 30" fill="#3D1F8F"/>
                </svg>
              </div>
              <div className="txn-details">
                <p className="txn-name">{txn.name}</p>
                <p className="txn-date">{txn.date}</p>
              </div>
              <p className="txn-amount">+ ₹ {txn.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="wallet" />
    </div>
  )
}

export default WalletPage
