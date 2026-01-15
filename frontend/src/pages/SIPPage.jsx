import InvestmentDocumentUploadTemplate from '../components/InvestmentDocumentUploadTemplate'

function SIPPage() {
  const formFields = [
    {
      name: 'fundName',
      type: 'text',
      placeholder: 'Mutual Fund Name',
      required: true
    },
    {
      name: 'sipAmount',
      type: 'number',
      placeholder: 'SIP Amount (₹)'
    },
    {
      name: 'startDate',
      type: 'text',
      placeholder: 'Start Date (DD-MM-YYYY)'
    },
    {
      name: 'endDate',
      type: 'text',
      placeholder: 'End Date (Optional)'
    },
    {
      name: 'frequency',
      type: 'select',
      placeholder: 'SIP Frequency',
      options: [
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'weekly', label: 'Weekly' }
      ]
    },
    {
      name: 'bankAccount',
      type: 'text',
      placeholder: 'Bank Account Number'
    },
    {
      name: 'remarks',
      type: 'textarea',
      placeholder: 'Remarks (in details)'
    }
  ]

  return (
    <InvestmentDocumentUploadTemplate 
      title="SIP" 
      icon="📈" 
      documentType="SIP"
      formFields={formFields}
    />
  )
}

export default SIPPage
