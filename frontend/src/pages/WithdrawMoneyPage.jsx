import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './WithdrawMoneyPage.css'

function WithdrawMoneyPage() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('0')

  return (
    <div className="withdraw-money-page">
      <div className="page-header-purple">
        <h1>Withdraw Money ⤵</h1>
      </div>

      <div className="amount-display">
        <h2>₹ {amount}</h2>
      </div>

      <div className="withdraw-section">
        <h3>Withdrawl Methods</h3>

        <div className="withdraw-methods-list">
          <button className="withdraw-item">
            <div className="withdraw-logo paytm">
              <span style={{ color: '#00BAF2', fontWeight: 'bold' }}>Pay</span>
              <span style={{ color: '#002E6E', fontWeight: 'bold' }}>tm</span>
            </div>
            <span>Paytm</span>
          </button>

          <button className="withdraw-item">
            <div className="withdraw-logo phonepe">
              <div style={{ width: '40px', height: '40px', backgroundColor: '#5F259F', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                ₹
              </div>
            </div>
            <span>PhonePe</span>
          </button>

          <button className="withdraw-item">
            <div className="withdraw-logo upi">
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#097939' }}>UPI</span>
            </div>
            <span>UPI</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default WithdrawMoneyPage
