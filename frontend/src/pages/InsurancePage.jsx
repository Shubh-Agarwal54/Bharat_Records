import InvestmentDocumentUploadTemplate from '../components/InvestmentDocumentUploadTemplate'

function InsurancePage() {
  const formFields = [
    {
      name: 'policyNo',
      type: 'text',
      placeholder: 'Policy No.',
      required: true
    },
    {
      name: 'typeOfInsurance',
      type: 'select',
      placeholder: 'Type of Insurance',
      options: [
        { value: 'life', label: 'Life Insurance' },
        { value: 'health', label: 'Health Insurance' },
        { value: 'vehicle', label: 'Vehicle Insurance' },
        { value: 'term', label: 'Term Insurance' }
      ]
    },
    {
      name: 'insuranceCompany',
      type: 'select',
      placeholder: 'Enter Your Insurance Company',
      options: [
        { value: 'lic', label: 'LIC' },
        { value: 'hdfc', label: 'HDFC Life' },
        { value: 'icici', label: 'ICICI Prudential' },
        { value: 'sbi', label: 'SBI Life' }
      ]
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
      title="Insurance" 
      icon="🛡️" 
      documentType="LIFE_INSURANCE"
      formFields={formFields}
      category="insurance"
    />
  )
}

export default InsurancePage
