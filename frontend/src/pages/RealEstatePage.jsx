import InvestmentDocumentUploadTemplate from '../components/InvestmentDocumentUploadTemplate'

function RealEstatePage() {
  const formFields = [
    {
      name: 'coOwner',
      type: 'select',
      placeholder: 'Whether Co-Owner Exist',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      name: 'will',
      type: 'select',
      placeholder: 'Whether Will Exist',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      name: 'address',
      type: 'textarea',
      placeholder: 'Complete address'
    },
    {
      name: 'propertyType',
      type: 'select',
      placeholder: 'Type of Property',
      options: [
        { value: 'residential', label: 'Residential' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'agricultural', label: 'Agricultural' }
      ]
    },
    {
      name: 'position',
      type: 'select',
      placeholder: 'Position of Property',
      options: [
        { value: 'urban', label: 'Urban' },
        { value: 'rural', label: 'Rural' }
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
      title="Real Estate Property " 
      icon="🏠" 
      documentType="REAL_ESTATE"
      formFields={formFields}
    />
  )
}

export default RealEstatePage
