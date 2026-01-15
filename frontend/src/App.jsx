import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SplashScreen from './pages/SplashScreen'
import LoginPage from './pages/LoginPage'
import PhoneLoginPage from './pages/PhoneLoginPage'
import OTPPage from './pages/OTPPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import WalletPage from './pages/WalletPage'
import AddMoneyPage from './pages/AddMoneyPage'
import TransferMoneyPage from './pages/TransferMoneyPage'
import WithdrawMoneyPage from './pages/WithdrawMoneyPage'
import AddDocumentPage from './pages/AddDocumentPage'
import PersonalPage from './pages/PersonalPage'
import PanCardPage from './pages/PanCardPage'
import AadharPage from './pages/AadharPage'
import DrivingLicensePage from './pages/DrivingLicensePage'
import PassportPage from './pages/PassportPage'
import VoterIdPage from './pages/VoterIdPage'
import MarkesheetPage from './pages/MarkesheetPage'
import CertificatesPage from './pages/CertificatesPage'
import VehicleRCPage from './pages/VehicleRCPage'
import ResumePage from './pages/ResumePage'
import MarriageCertificatePage from './pages/MarriageCertificatePage'
import DebitCreditCardsPage from './pages/DebitCreditCardsPage'
import MedicalRecordsPage from './pages/MedicalRecordsPage'
import InvestmentPage from './pages/InvestmentPage'
import RealEstatePage from './pages/RealEstatePage'
import PostOfficeDepositPage from './pages/PostOfficeDepositPage'
import BankDepositPage from './pages/BankDepositPage'
import MutualFundPage from './pages/MutualFundPage'
import SIPPage from './pages/SIPPage'
import DematDetailsPage from './pages/DematDetailsPage'
import OtherInvestmentPage from './pages/OtherInvestmentPage'
import InsurancePage from './pages/InsurancePage'
import LoansLiabilityPage from './pages/LoansLiabilityPage'
import RetirementClaimsPage from './pages/RetirementClaimsPage'
import SearchDocumentsPage from './pages/SearchDocumentsPage'
import MenuPage from './pages/MenuPage'
import MyAccountPage from './pages/MyAccountPage'
import MySubscriptionsPage from './pages/MySubscriptionsPage'
import DisclaimerPage from './pages/DisclaimerPage'
import MyReferralsPage from './pages/MyReferralsPage'
import MyDocumentsPage from './pages/MyDocumentsPage'
import ReportsPage from './pages/ReportsPage'
import SettingPage from './pages/SettingPage'
import BiometricSecurityPage from './pages/BiometricSecurityPage'
import PasswordSecurityPage from './pages/PasswordSecurityPage'
import UpdatePhoneOTPPage from './pages/UpdatePhoneOTPPage'
import DocShareHistoryPage from './pages/DocShareHistoryPage'
import HelpCenterPage from './pages/HelpCenterPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import { useEffect } from 'react'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/phone-login" element={<PhoneLoginPage />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/add-money" element={<AddMoneyPage />} />
        <Route path="/transfer-money" element={<TransferMoneyPage />} />
        <Route path="/withdraw-money" element={<WithdrawMoneyPage />} />
        <Route path="/add-document" element={<AddDocumentPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/personal/pan" element={<PanCardPage />} />
        <Route path="/personal/aadhar" element={<AadharPage />} />
        <Route path="/personal/driving-license" element={<DrivingLicensePage />} />
        <Route path="/personal/passport" element={<PassportPage />} />
        <Route path="/personal/voter-id" element={<VoterIdPage />} />
        <Route path="/personal/markesheet" element={<MarkesheetPage />} />
        <Route path="/personal/certificates" element={<CertificatesPage />} />
        <Route path="/personal/vehicle-rc" element={<VehicleRCPage />} />
        <Route path="/personal/resume" element={<ResumePage />} />
        <Route path="/personal/marriage-certificate" element={<MarriageCertificatePage />} />
        <Route path="/personal/debit-credit-cards" element={<DebitCreditCardsPage />} />
        <Route path="/personal/medical-records" element={<MedicalRecordsPage />} />
        <Route path="/investment" element={<InvestmentPage />} />
        <Route path="/investment/real-estate" element={<RealEstatePage />} />
        <Route path="/investment/post-office" element={<PostOfficeDepositPage />} />
        <Route path="/investment/bank-deposits" element={<BankDepositPage />} />
        <Route path="/investment/mutual-fund" element={<MutualFundPage />} />
        <Route path="/investment/sip" element={<SIPPage />} />
        <Route path="/investment/demat-details" element={<DematDetailsPage />} />
        <Route path="/investment/other" element={<OtherInvestmentPage />} />
        <Route path="/insurance" element={<InsurancePage />} />
        <Route path="/loans" element={<LoansLiabilityPage />} />
        <Route path="/retirement" element={<RetirementClaimsPage />} />
        <Route path="/search" element={<SearchDocumentsPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/my-account" element={<MyAccountPage />} />
        <Route path="/my-subscriptions" element={<MySubscriptionsPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/my-referrals" element={<MyReferralsPage />} />
        <Route path="/my-documents" element={<MyDocumentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/setting" element={<SettingPage />} />
        <Route path="/setting/biometric" element={<BiometricSecurityPage />} />
        <Route path="/setting/password" element={<PasswordSecurityPage />} />
        <Route path="/update-phone-otp" element={<UpdatePhoneOTPPage />} />
        <Route path="/doc-share-history" element={<DocShareHistoryPage />} />
        <Route path="/help-center" element={<HelpCenterPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
