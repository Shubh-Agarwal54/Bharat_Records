import { useNavigate } from 'react-router-dom'
import './InvestmentPage.css'

function InvestmentPage() {
  const navigate = useNavigate()

  const investments = [
    { id: 1, name: 'Real Estate', icon: '🏠', path: '/investment/real-estate' },
    { id: 2, name: 'Post Office Deposit', icon: '📮', path: '/investment/post-office' },
    { id: 3, name: 'Bank Deposits', icon: '🏦', path: '/investment/bank-deposits' },
    { id: 4, name: 'Mutual Fund', icon: '💰', path: '/investment/mutual-fund' },
    { id: 5, name: 'SIP', icon: '💵', path: '/investment/sip' },
    { id: 6, name: 'DEMAT Details', icon: '📊', path: '/investment/demat-details' },
    { id: 7, name: 'Other Investments', icon: '💎', path: '/investment/other' },
  ]

  return (
    <div className="investment-page">
      <div className="page-header-purple">
        <h1>Investments 💰📈</h1>
      </div>

      <div className="investment-list">
        {investments.map((item) => (
          <button
            key={item.id}
            className="investment-item"
            onClick={() => navigate(item.path)}
          >
            <span className="investment-icon">{item.icon}</span>
            <span className="investment-name">{item.name}</span>
            <span className="arrow-right">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default InvestmentPage
