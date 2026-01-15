import InvestmentDocumentUploadTemplate from '../components/InvestmentDocumentUploadTemplate'

function DematDetailsPage() {
  const formFields = [
    {
      name: 'brokerName',
      type: 'text',
      placeholder: 'Broker Name*',
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
      name: 'emailLinked',
      type: 'checkbox',
      label: 'Email Linked with Demat'
    },
    {
      name: 'mobileLinked',
      type: 'checkbox',
      label: 'Mobile Number linked with Demat'
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
      title="Demat Details" 
      icon="😃" 
      documentType="DEMAT_DETAILS"
      formFields={formFields}
    />
  )
}

export default DematDetailsPage
