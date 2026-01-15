import InvestmentDocumentUploadTemplate from '../components/InvestmentDocumentUploadTemplate'

function PostOfficeDepositPage() {
  const formFields = [
    {
      name: 'accountNumber',
      type: 'text',
      placeholder: 'Account Number*',
      required: true
    },
    {
      name: 'branchAddress',
      type: 'text',
      placeholder: 'Branch Address*',
      required: true
    },
    {
      name: 'accountType',
      type: 'select',
      placeholder: 'Type of Account',
      options: [
        { value: 'savings', label: 'Savings' },
        { value: 'recurring', label: 'Recurring Deposit' },
        { value: 'fixed', label: 'Fixed Deposit' }
      ]
    },
    {
      name: 'beneficiary',
      type: 'select',
      placeholder: 'Enter your Beneficiary',
      options: [
        { value: 'self', label: 'Self' },
        { value: 'spouse', label: 'Spouse' },
        { value: 'child', label: 'Child' }
      ]
    },
    {
      name: 'addNominee',
      type: 'checkbox',
      label: 'Add Nominee'
    },
    {
      name: 'remarks',
      type: 'textarea',
      placeholder: 'Remarks (in details)'
    }
  ]

  return (
    <InvestmentDocumentUploadTemplate 
      title="Post Office Deposit" 
      icon="📮" 
      documentType="POST_OFFICE"
      formFields={formFields}
    />
  )
}

export default PostOfficeDepositPage
