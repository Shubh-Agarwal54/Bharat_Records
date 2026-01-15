import InvestmentDocumentUploadTemplate from '../components/InvestmentDocumentUploadTemplate'

function OtherInvestmentPage() {
  const formFields = [
    {
      name: 'investmentName',
      type: 'text',
      placeholder: 'Name of the investment',
      required: true
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
      title="Other Investment" 
      icon="💰📈" 
      documentType="OTHER_INVESTMENT"
      formFields={formFields}
    />
  )
}

export default OtherInvestmentPage
