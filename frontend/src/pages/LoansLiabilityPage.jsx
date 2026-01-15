import InvestmentDocumentUploadTemplate from '../components/InvestmentDocumentUploadTemplate'

function LoansLiabilityPage() {
  const formFields = [
    {
      name: 'fullName',
      type: 'text',
      placeholder: 'Full Name',
      required: true
    },
    {
      name: 'loanTakenFrom',
      type: 'select',
      placeholder: 'Loan Taken From',
      options: [
        { value: 'bank', label: 'Bank' },
        { value: 'nbfc', label: 'NBFC' },
        { value: 'personal', label: 'Personal Loan' },
        { value: 'business', label: 'Business Loan' }
      ]
    },
    {
      name: 'typeOfLoan',
      type: 'select',
      placeholder: 'Type of Loan',
      options: [
        { value: 'home', label: 'Home Loan' },
        { value: 'car', label: 'Car Loan' },
        { value: 'personal', label: 'Personal Loan' },
        { value: 'education', label: 'Education Loan' },
        { value: 'business', label: 'Business Loan' }
      ]
    },
    {
      name: 'remarks',
      type: 'textarea',
      placeholder: 'Remarks (in details)'
    }
  ]

  return (
    <InvestmentDocumentUploadTemplate 
      title="Loans (Liability)" 
      icon="🏦💳" 
      documentType="PERSONAL_LOAN"
      formFields={formFields}
      category="loans"
    />
  )
}

export default LoansLiabilityPage
