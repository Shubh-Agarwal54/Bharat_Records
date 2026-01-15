import { useNavigate } from 'react-router-dom'
import './TermsOfServicePage.css'

function TermsOfServicePage() {
  const navigate = useNavigate()

  return (
    <div className="terms-page">
      <div className="terms-content">
        <h1>Terms of Service</h1>

        <p className="intro-text">
          These Terms and Conditions ("Terms") govern the use of or access to "Bharat Record", a mobile application ("App"), and the Services (defined below).These Terms are also included in Privacy Policy & Disclaimer for any guidelines, additional terms, policies, or disclaimers made available or issued by us from time to time. These Terms constitute a binding and enforceable legal contract between Bharat Records ("we", or "us") and any user of the Services ("you", "User", "your"). If you do not agree to all of these Terms or comply with the requirements herein, please do not access the App or use the Services.
        </p>

        <section className="terms-section">
          <h2>1. DEFINITIONS</h2>
          
          <div className="definition">
            <strong>1.1</strong> Additional Information" shall have the same meaning as assigned to the term under clause 3.1 (iii) of these Terms
          </div>

          <div className="definition">
            <strong>1.2</strong> "Applicable Law" means any statute, law, regulation, ordinance, rule, judgment, notification, order, decree, by-law, permits, licenses, approvals, consents, authorisations, government approvals, directives, guidelines, requirements or other governmental restrictions.
          </div>

          <div className="definition">
            <strong>1.3</strong> "Partner" shall include all such financial institutions, banks, Non-Banking Financial Companies, and other entities whom Zoop has partnered with.
          </div>

          <div className="definition">
            <strong>1.4</strong> "Partner Services" shall mean the services extended by Partners to the Users.
          </div>

          <div className="definition">
            <strong>1.5</strong> "Person" shall include an individual, an association, a corporation, a partnership, a joint venture, a trust, an unincorporated organization, a joint stock company, a bank, a non-banking financial company
          </div>

          <div className="definition">
            <strong>1.6</strong> "Services" shall mean such services set out under clause 3.1
          </div>

          <div className="definition">
            <strong>1.7</strong> "Uploaded Documents" shall mean all the
          </div>
        </section>
      </div>
    </div>
  )
}

export default TermsOfServicePage
