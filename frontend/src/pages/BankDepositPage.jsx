import InvestmentDocumentUploadTemplate from '../components/InvestmentDocumentUploadTemplate'

function BankDepositPage() {
  const formFields = [
    {
      name: 'accountNumber',
      type: 'text',
      placeholder: 'Account Number*',
      required: true
    },
    {
      name: 'ifscCode',
      type: 'text',
      placeholder: 'IFSC Code*',
      required: true
    },
    {
      name: 'depositType',
      type: 'select',
      placeholder: 'Type of Bank Deposit',
      options: [
        { value: 'savings', label: 'Savings Account' },
        { value: 'current', label: 'Current Account' },
        { value: 'fixed', label: 'Fixed Deposit' },
        { value: 'recurring', label: 'Recurring Deposit' }
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
      title="Bank Deposit" 
      icon="🏦" 
      documentType="BANK_DEPOSITS"
      formFields={formFields}
    />
  )
}

export default BankDepositPage
