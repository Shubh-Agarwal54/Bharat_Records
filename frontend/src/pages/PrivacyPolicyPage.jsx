import { useNavigate } from 'react-router-dom'
import './PrivacyPolicyPage.css'

function PrivacyPolicyPage() {
  const navigate = useNavigate()

  return (
    <div className="privacy-policy-page">
      <div className="policy-content">
        <h1>Privacy Policy</h1>

        <p className="intro-text">
          Thank you for using "BHARAT RECORDS". This Privacy Policy outlines how we collect, use, and protect the data you provide through our App. By accessing or using our App, you consent to the collection, use, and disclosure of your data as described in this Privacy Policy.
        </p>

        <section className="policy-section">
          <h2>1. INFORMATION WE COLLECT</h2>
          
          <div className="subsection">
            <h3>1.1. Personal Information: We may collect the following types of personal information when you use our App.</h3>
            
            <ul>
              <li>
                <strong>Contact Information:</strong> We may collect your name, email address, and other contact details when you register an account or provide feedback
              </li>
              <li>
                <strong>Account Credentials:</strong> If you create an account with us, we collect and store your username and encrypted password.
              </li>
              <li>
                <strong>Device Information:</strong> We may collect information about your mobile device, including its unique device identifier, operating system, and mobile network information.
              </li>
            </ul>
          </div>

          <div className="subsection">
            <h3>1.2. Data Maintenance Information: Our App allows you to input and store data for the purpose of data maintenance. This may include personal information, such as names, addresses, phone numbers, investments, nominee details and other relevant data. We treat this data with the utmost care and take necessary measures to protect its confidentiality and security.</h3>
          </div>
        </section>

        <section className="policy-section">
          <h2>2. USE OF INFORMATION</h2>
          <div className="subsection">
            <h3>2.1. Personal Information: We use your personal information for the following purposes:</h3>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
