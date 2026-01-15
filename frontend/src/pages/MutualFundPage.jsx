import InvestmentDocumentUploadTemplate from '../components/InvestmentDocumentUploadTemplate'


function MutualFundPage() {
  const formFields = [
    {
      name: 'mutualFundType',
      type: 'select',
      placeholder: 'Type of Mutual fund',
      options: [
        { value: 'equity', label: 'Equity Fund' },
        { value: 'debt', label: 'Debt Fund' },
        { value: 'hybrid', label: 'Hybrid Fund' },
        { value: 'index', label: 'Index Fund' }
      ]
    },
    {
      name: 'dmatAccount',
      type: 'text',
      placeholder: 'DMAT Account No./BOID*',
      required: true
    },
    {
      name: 'brokerName',
      type: 'text',
      placeholder: 'Broker Name*',
      required: true
    },
    {
      name: 'companyName',
      type: 'text',
      placeholder: 'Name of the Company/fund House'
    },
    {
      name: 'beneficiary',
      type: 'select',
      placeholder: 'Enter Your Beneficiary',
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
      title="Mutual Funds" 
      icon="💰📈" 
      documentType="MUTUAL_FUND"
      formFields={formFields}
    />
  )
}

export default MutualFundPage
