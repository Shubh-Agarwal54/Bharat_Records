import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddMoneyPage.css'

function AddMoneyPage() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('0')

  const paymentMethods = [
    { id: 1, name: 'Debit Card', icon: '💳', color: '#FF6B6B' },
    { id: 2, name: 'Credit Card', icon: '💳', color: '#FF6B6B' },
    { id: 3, name: 'Paytm', logo: 'paytm' },
    { id: 4, name: 'PhonePe', logo: 'phonepe' },
    { id: 5, name: 'UPI', logo: 'upi' },
  ]

  return (
    <div className="add-money-page">
      <div className="page-header-purple">
        <h1>Add Money  <svg className='plusicon' width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle  cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg></h1>
      </div>

      <div className="amount-display">
        <h2>₹ {amount}</h2>
      </div>

      <div className="payment-section">
        <h3>Payment Methods</h3>

        <div className="payment-methods-grid">
          <button className="payment-card">
            <span className="payment-icon" style={{ backgroundColor: '#FF6B6B' }}>💳</span>
            <span>Debit Card</span>
          </button>

          <button className="payment-card">
            <span className="payment-icon" style={{ backgroundColor: '#FF6B6B' }}>💳</span>
            <span>Credit Card</span>
          </button>
        </div>

        <div className="payment-methods-list">
          <button className="payment-item">
            <div className="payment-logo paytm">
              <span style={{ color: '#00BAF2', fontWeight: 'bold' }}>Pay</span>
              <span style={{ color: '#002E6E', fontWeight: 'bold' }}>tm</span>
            </div>
            <span>Paytm</span>
          </button>

          <button className="payment-item">
            <div className="payment-logo phonepe">
              <div style={{ width: '40px', height: '40px', backgroundColor: '#5F259F', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                ₹
              </div>
            </div>
            <span>PhonePe</span>
          </button>

          <button className="payment-item">
            <div className="payment-logo upi">
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#097939' }}>UPI</span>
            </div>
            <span>UPI</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddMoneyPage
