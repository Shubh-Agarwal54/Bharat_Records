import { useNavigate } from 'react-router-dom'
import './MySubscriptionsPage.css'

function MySubscriptionsPage() {
  const navigate = useNavigate()

  const currentPlan = {
    name: 'Yearly',
    code: 'BR898',
    subscriptionDate: '2/12/2023',
    validityUpto: '2/12/2024',
    transactionId: '87432244',
    transactionAmount: '649/-',
    basic: '550/-',
    gst: '99/-'
  }

  const allPlans = [
    {
      name: 'Yearly',
      code: 'BR898',
      validity: '1 Year',
      total: '649/-',
      basic: '550/-',
      gst: '99/-',
      buttonText: 'Upgrade',
      buttonClass: 'upgrade'
    },
    {
      name: 'Five Yearly',
      code: 'BR998',
      validity: '5 Years',
      total: '2655/-',
      basic: '2250/-',
      gst: '405/-',
      buttonText: 'Subscribe',
      buttonClass: 'subscribe'
    },
    {
      name: 'Life Time',
      code: 'BR1000',
      validity: '20 Years',
      total: '649/-',
      basic: '550/-',
      gst: '99/-',
      buttonText: 'Subscribe',
      buttonClass: 'subscribe'
    }
  ]

  return (
    <div className="my-subscriptions-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1>My Subscriptions</h1>
      </div>

      <div className="subscriptions-content">
        <div className="section-title">Your Plan</div>
        <div className="current-plan-card">
          <div className="plan-row">
            <span className="plan-label">Plan Name :</span>
            <span className="plan-value">{currentPlan.name}</span>
          </div>
          <div className="plan-row">
            <span className="plan-label">Plan Code :</span>
            <span className="plan-value">{currentPlan.code}</span>
          </div>
          <div className="plan-row">
            <span className="plan-label">Subscription Date :</span>
            <span className="plan-value">{currentPlan.subscriptionDate}</span>
          </div>
          <div className="plan-row">
            <span className="plan-label">Validity Upto :</span>
            <span className="plan-value">{currentPlan.validityUpto}</span>
          </div>
          <div className="plan-row">
            <span className="plan-label">Transaction ID :</span>
            <span className="plan-value">{currentPlan.transactionId}</span>
          </div>
          <div className="plan-row">
            <span className="plan-label">Transaction Amount :</span>
            <span className="plan-value">{currentPlan.transactionAmount}</span>
          </div>
          <div className="plan-row">
            <span className="plan-label">Basic:</span>
            <span className="plan-value">{currentPlan.basic}</span>
          </div>
          <div className="plan-row">
            <span className="plan-label">GST:</span>
            <span className="plan-value">{currentPlan.gst}</span>
          </div>
        </div>

        <div className="section-title">All Subscriptions Plans</div>
        
        {allPlans.map((plan, index) => (
          <div key={index} className="plan-card">
            <div className="plan-row">
              <span className="plan-label">Plan Name :</span>
              <span className="plan-value">{plan.name}</span>
            </div>
            <div className="plan-row">
              <span className="plan-label">Plan Code :</span>
              <span className="plan-value">{plan.code}</span>
            </div>
            <div className="plan-row">
              <span className="plan-label">Validity Upto :</span>
              <span className="plan-value">{plan.validity}</span>
            </div>
            <div className="plan-row">
              <span className="plan-label">Total Amount :</span>
              <span className="plan-value">{plan.total}</span>
            </div>
            <div className="plan-row">
              <span className="plan-label">Basic:</span>
              <span className="plan-value">{plan.basic}</span>
            </div>
            <div className="plan-row">
              <span className="plan-label">GST:</span>
              <span className="plan-value">{plan.gst}</span>
            </div>
            <button className={`plan-button ${plan.buttonClass}`}>
              {plan.buttonText}
            </button>
          </div>
        ))}

        <button className="show-transactions-btn">Show All Transactions</button>
      </div>
    </div>
  )
}

export default MySubscriptionsPage
