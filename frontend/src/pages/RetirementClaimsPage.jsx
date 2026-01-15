import InvestmentDocumentUploadTemplate from '../components/InvestmentDocumentUploadTemplate'

function RetirementClaimsPage() {
  const formFields = [
    {
      name: 'typeOfDues',
      type: 'select',
      placeholder: 'Type of Dues',
      options: [
        { value: 'pf', label: 'Provident Fund' },
        { value: 'gratuity', label: 'Gratuity' },
        { value: 'pension', label: 'Pension' },
        { value: 'leave', label: 'Leave Encashment' }
      ]
    },
    {
      name: 'pfAccountNo',
      type: 'text',
      placeholder: 'PF Account No.',
      required: true
    },
    {
      name: 'employerName',
      type: 'text',
      placeholder: 'Name of the employer'
    },
    {
      name: 'employerAddress',
      type: 'text',
      placeholder: 'Employer Office Address'
    },
    {
      name: 'employerContact',
      type: 'text',
      placeholder: 'Employer Contact Details (Optional)'
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
      title="Retirement Claims" 
      icon="💵🏦" 
      documentType="EPF"
      formFields={formFields}
      category="retirement"
    />
  )
}

export default RetirementClaimsPage
