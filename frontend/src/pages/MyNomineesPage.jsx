import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { nomineeAPI } from '../services/api'
import './MyNomineesPage.css'

function MyNomineesPage() {
  const navigate = useNavigate()
  const [nominees, setNominees] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [selectedNominee, setSelectedNominee] = useState(null)
  const [accessSettings, setAccessSettings] = useState({
    accessLevel: 'view',
    canViewCategories: ['personal', 'investment', 'insurance', 'loans', 'retirement'],
    expiresInDays: null
  })
  const [editingNominee, setEditingNominee] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    dateOfBirth: '',
    aadhaarNumber: '',
    panNumber: '',
    mobileNumber: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    sharePercentage: 0,
    notes: ''
  })

  useEffect(() => {
    loadNominees()
    loadStats()
  }, [])

  const loadNominees = async () => {
    try {
      setLoading(true)
      const response = await nomineeAPI.getAll(true)
      setNominees(response.data.nominees)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load nominees')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await nomineeAPI.getStats()
      setStats(response.data.stats)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      let processedValue = value
      
      if (name === 'aadhaarNumber') {
        processedValue = value.replace(/\D/g, '').slice(0, 12)
      } else if (name === 'panNumber') {
        processedValue = value.toUpperCase().slice(0, 10)
      } else if (name === 'mobileNumber') {
        processedValue = value.replace(/\D/g, '').slice(0, 10)
      } else if (name === 'sharePercentage') {
        processedValue = Math.min(100, Math.max(0, parseInt(value) || 0))
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }))
    }
  }

  const handleAddNominee = () => {
    setEditingNominee(null)
    setFormData({
      fullName: '',
      relationship: '',
      dateOfBirth: '',
      aadhaarNumber: '',
      panNumber: '',
      mobileNumber: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      sharePercentage: 0,
      notes: ''
    })
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const handleEditNominee = (nominee) => {
    setEditingNominee(nominee)
    setFormData({
      fullName: nominee.fullName || '',
      relationship: nominee.relationship || '',
      dateOfBirth: nominee.dateOfBirth ? new Date(nominee.dateOfBirth).toISOString().split('T')[0] : '',
      aadhaarNumber: nominee.aadhaarNumber || '',
      panNumber: nominee.panNumber || '',
      mobileNumber: nominee.mobileNumber || '',
      email: nominee.email || '',
      address: {
        street: nominee.address?.street || '',
        city: nominee.address?.city || '',
        state: nominee.address?.state || '',
        pincode: nominee.address?.pincode || '',
        country: nominee.address?.country || 'India'
      },
      sharePercentage: nominee.sharePercentage || 0,
      notes: nominee.notes || ''
    })
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Clean up empty fields - completely omit them from the request
      const cleanedData = {
        fullName: formData.fullName.trim(),
        relationship: formData.relationship,
        dateOfBirth: formData.dateOfBirth,
        sharePercentage: formData.sharePercentage || 0
      }

      // Only add optional fields if they have values
      if (formData.aadhaarNumber?.trim()) {
        cleanedData.aadhaarNumber = formData.aadhaarNumber.trim()
      }
      if (formData.panNumber?.trim()) {
        cleanedData.panNumber = formData.panNumber.trim()
      }
      if (formData.mobileNumber?.trim()) {
        cleanedData.mobileNumber = formData.mobileNumber.trim()
      }
      if (formData.email?.trim()) {
        cleanedData.email = formData.email.trim()
      }
      if (formData.notes?.trim()) {
        cleanedData.notes = formData.notes.trim()
      }

      // Add address only if any field has a value
      const hasAddress = formData.address.street?.trim() || 
                         formData.address.city?.trim() || 
                         formData.address.state?.trim() || 
                         formData.address.pincode?.trim()
      
      if (hasAddress) {
        cleanedData.address = {}
        if (formData.address.street?.trim()) cleanedData.address.street = formData.address.street.trim()
        if (formData.address.city?.trim()) cleanedData.address.city = formData.address.city.trim()
        if (formData.address.state?.trim()) cleanedData.address.state = formData.address.state.trim()
        if (formData.address.pincode?.trim()) cleanedData.address.pincode = formData.address.pincode.trim()
        cleanedData.address.country = formData.address.country || 'India'
      }

      if (editingNominee) {
        await nomineeAPI.update(editingNominee._id, cleanedData)
        setSuccess('Nominee updated successfully!')
      } else {
        await nomineeAPI.create(cleanedData)
        setSuccess('Nominee added successfully!')
      }
      
      await loadNominees()
      await loadStats()
      
      setTimeout(() => {
        setShowModal(false)
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save nominee')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNominee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this nominee?')) return

    try {
      setLoading(true)
      await nomineeAPI.delete(id)
      setSuccess('Nominee deleted successfully!')
      await loadNominees()
      await loadStats()
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete nominee')
    } finally {
      setLoading(false)
    }
  }

  const handleGrantAccess = (nominee) => {
    if (!nominee.email) {
      setError('Nominee must have an email address to grant access')
      setTimeout(() => setError(''), 3000)
      return
    }
    setSelectedNominee(nominee)
    setAccessSettings({
      accessLevel: nominee.accessLevel || 'view',
      canViewCategories: nominee.canViewCategories || ['personal', 'investment', 'insurance', 'loans', 'retirement'],
      expiresInDays: null
    })
    setShowAccessModal(true)
  }

  const handleSendInvite = async () => {
    try {
      setLoading(true)
      const response = await nomineeAPI.invite(
        selectedNominee._id,
        accessSettings.accessLevel,
        accessSettings.canViewCategories,
        accessSettings.expiresInDays
      )
      
      // Show success with invite link if provided
      if (response.data.inviteLink) {
        setSuccess(`Invitation sent! Share this link: ${response.data.inviteLink}`)
      } else {
        setSuccess(`Invitation email sent to ${selectedNominee.email}!`)
      }
      
      await loadNominees()
      setShowAccessModal(false)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeAccess = async (id, name) => {
    if (!window.confirm(`Revoke access for ${name}? They will no longer be able to view your documents.`)) return

    try {
      setLoading(true)
      await nomineeAPI.revokeAccess(id)
      setSuccess('Access revoked successfully!')
      await loadNominees()
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke access')
    } finally {
      setLoading(false)
    }
  }

  const getRelationshipIcon = (relationship) => {
    const icons = {
      spouse: '💑',
      parent: '👴',
      child: '👶',
      sibling: '👫',
      other: '👤'
    }
    return icons[relationship] || '👤'
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="nominees-page-main">
      <div className="nominees-page-header-section">
        <button className="nominees-back-arrow-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="nominees-page-main-title">My Nominees 👥</h1>
      </div>

      <div className="nominees-page-content-wrapper">
        {/* Stats Cards */}
        {stats && (
          <div className="nominees-stats-grid-container">
            <div className="nominees-stat-card-item">
              <div className="nominees-stat-card-icon-wrapper">👥</div>
              <div className="nominees-stat-card-details">
                <div className="nominees-stat-card-value-text">{stats.totalNominees}</div>
                <div className="nominees-stat-card-label-text">Total Nominees</div>
              </div>
            </div>
            
            <div className="nominees-stat-card-item">
              <div className="nominees-stat-card-icon-wrapper">📊</div>
              <div className="nominees-stat-card-details">
                <div className="nominees-stat-card-value-text">{stats.totalShareAllocated}%</div>
                <div className="nominees-stat-card-label-text">Share Allocated</div>
              </div>
            </div>
            
            <div className="nominees-stat-card-item">
              <div className="nominees-stat-card-icon-wrapper">💯</div>
              <div className="nominees-stat-card-details">
                <div className="nominees-stat-card-value-text">{stats.shareRemaining}%</div>
                <div className="nominees-stat-card-label-text">Share Remaining</div>
              </div>
            </div>
          </div>
        )}

        {error && <div className="nominees-error-alert-msg">{error}</div>}
        {success && <div className="nominees-success-alert-msg">{success}</div>}

        <button className="nominees-add-new-btn" onClick={handleAddNominee}>
          ➕ Add New Nominee
        </button>

        {/* Nominees List */}
        {loading && !showModal ? (
          <div className="nominees-loading-spinner-wrap">Loading nominees...</div>
        ) : nominees.length === 0 ? (
          <div className="nominees-empty-state-container">
            <div className="nominees-empty-state-icon">👥</div>
            <h3 className="nominees-empty-state-title">No Nominees Added</h3>
            <p className="nominees-empty-state-desc">Add your first nominee to secure your assets</p>
          </div>
        ) : (
          <div className="nominees-list-cards-container">
            {nominees.map((nominee) => (
              <div key={nominee._id} className="nominee-card-wrapper">
                <div className="nominee-card-top-section">
                  <div className="nominee-card-icon-badge">
                    {getRelationshipIcon(nominee.relationship)}
                  </div>
                  <div className="nominee-card-info-block">
                    <h3 className="nominee-card-name-text">{nominee.fullName}</h3>
                    <p className="nominee-card-relationship-text">{nominee.relationship}</p>
                  </div>
                  {nominee.sharePercentage > 0 && (
                    <div className="nominee-card-share-badge">{nominee.sharePercentage}%</div>
                  )}
                </div>

                <div className="nominee-card-details-grid">
                  {nominee.dateOfBirth && (
                    <div className="nominee-detail-row-item">
                      <span className="nominee-detail-row-label">DOB:</span>
                      <span className="nominee-detail-row-value">{formatDate(nominee.dateOfBirth)}</span>
                    </div>
                  )}
                  {nominee.mobileNumber && (
                    <div className="nominee-detail-row-item">
                      <span className="nominee-detail-row-label">Mobile:</span>
                      <span className="nominee-detail-row-value">{nominee.mobileNumber}</span>
                    </div>
                  )}
                  {nominee.email && (
                    <div className="nominee-detail-row-item">
                      <span className="nominee-detail-row-label">Email:</span>
                      <span className="nominee-detail-row-value">{nominee.email}</span>
                    </div>
                  )}
                  {nominee.aadhaarNumber && (
                    <div className="nominee-detail-row-item">
                      <span className="nominee-detail-row-label">Aadhaar:</span>
                      <span className="nominee-detail-row-value">XXXX-XXXX-{nominee.aadhaarNumber.slice(-4)}</span>
                    </div>
                  )}
                  {nominee.panNumber && (
                    <div className="nominee-detail-row-item">
                      <span className="nominee-detail-row-label">PAN:</span>
                      <span className="nominee-detail-row-value">{nominee.panNumber}</span>
                    </div>
                  )}
                </div>

                {nominee.notes && (
                  <div className="nominee-notes-section">
                    <strong>Notes:</strong> {nominee.notes}
                  </div>
                )}

                {/* Access Status */}
                {nominee.hasAccess && (
                  <div className="nominee-access-status-box">
                    <div className="nominee-access-status-row">
                      <span className="nominee-access-label">
                        {nominee.inviteStatus === 'pending' && '⏳ Invite Pending'}
                        {nominee.inviteStatus === 'accepted' && '✅ Access Granted'}
                        {nominee.inviteStatus === 'revoked' && '🚫 Access Revoked'}
                      </span>
                      <span className="nominee-access-level-badge">{nominee.accessLevel}</span>
                    </div>
                    {nominee.inviteStatus === 'accepted' && nominee.lastAccessedAt && (
                      <div className="nominee-last-access-text">
                        Last accessed: {formatDate(nominee.lastAccessedAt)}
                      </div>
                    )}
                  </div>
                )}

                <div className="nominee-card-actions-row">
                  <button 
                    className="nominee-action-edit-btn" 
                    onClick={() => handleEditNominee(nominee)}
                  >
                    ✏️ Edit
                  </button>
                  
                  {!nominee.hasAccess || nominee.inviteStatus === 'revoked' ? (
                    <button 
                      className="nominee-action-grant-btn" 
                      onClick={() => handleGrantAccess(nominee)}
                      disabled={!nominee.email}
                      title={!nominee.email ? 'Email required to grant access' : 'Grant account access'}
                    >
                      🔑 Grant Access
                    </button>
                  ) : nominee.inviteStatus === 'accepted' ? (
                    <button 
                      className="nominee-action-revoke-btn" 
                      onClick={() => handleRevokeAccess(nominee._id, nominee.fullName)}
                    >
                      🚫 Revoke Access
                    </button>
                  ) : (
                    <button 
                      className="nominee-action-pending-btn" 
                      disabled
                    >
                      ⏳ Invite Sent
                    </button>
                  )}
                  
                  <button 
                    className="nominee-action-delete-btn" 
                    onClick={() => handleDeleteNominee(nominee._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="nominee-modal-overlay-bg" onClick={() => setShowModal(false)}>
          <div className="nominee-modal-content-box" onClick={(e) => e.stopPropagation()}>
            <div className="nominee-modal-header-bar">
              <h2 className="nominee-modal-title-text">
                {editingNominee ? 'Edit Nominee' : 'Add New Nominee'}
              </h2>
              <button className="nominee-modal-close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {error && <div className="nominees-error-alert-msg">{error}</div>}
            {success && <div className="nominees-success-alert-msg">{success}</div>}

            <form className="nominee-form-container" onSubmit={handleSubmit}>
              <div className="nominee-form-row">
                <label className="nominee-form-label">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                  required
                />
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Relationship *</label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                  required
                >
                  <option value="">Select Relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                  required
                />
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                  placeholder="12 digits"
                  maxLength="12"
                />
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                  placeholder="ABCDE1234F"
                  maxLength="10"
                />
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Mobile Number</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                  placeholder="10 digits"
                  maxLength="10"
                />
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                  placeholder="email@example.com"
                />
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Share Percentage (%)</label>
                <input
                  type="number"
                  name="sharePercentage"
                  value={formData.sharePercentage}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                  min="0"
                  max="100"
                />
              </div>

              <div className="nominee-form-section-title">Address (Optional)</div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                />
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                />
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                />
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Pincode</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  className="nominee-form-input"
                  maxLength="6"
                />
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="nominee-form-textarea"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="nominee-form-actions-row">
                <button
                  type="button"
                  className="nominee-form-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="nominee-form-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingNominee ? 'Update Nominee' : 'Add Nominee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access Settings Modal */}
      {showAccessModal && selectedNominee && (
        <div className="nominee-modal-overlay-bg" onClick={() => setShowAccessModal(false)}>
          <div className="nominee-modal-content-box nominee-access-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="nominee-modal-header-bar">
              <h2 className="nominee-modal-title-text">
                Grant Access to {selectedNominee.fullName}
              </h2>
              <button className="nominee-modal-close-btn" onClick={() => setShowAccessModal(false)}>
                ✕
              </button>
            </div>

            <div className="nominee-access-modal-content">
              <div className="nominee-access-info-box">
                <p>🔐 Granting access will allow <strong>{selectedNominee.fullName}</strong> to log in and view your documents based on the permissions you set below.</p>
                <p>📧 An invitation will be sent to: <strong>{selectedNominee.email}</strong></p>
              </div>

              {error && <div className="nominees-error-alert-msg">{error}</div>}

              <div className="nominee-form-row">
                <label className="nominee-form-label">Access Level</label>
                <select
                  value={accessSettings.accessLevel}
                  onChange={(e) => setAccessSettings({...accessSettings, accessLevel: e.target.value})}
                  className="nominee-form-input"
                >
                  <option value="view">View Only - Can view documents</option>
                  <option value="download">Download - Can view and download</option>
                  <option value="full">Full Access - Can view, download, and share</option>
                </select>
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Document Categories to Share</label>
                <div className="nominee-categories-checkbox-grid">
                  {['personal', 'investment', 'insurance', 'loans', 'retirement'].map(cat => (
                    <label key={cat} className="nominee-category-checkbox-label">
                      <input
                        type="checkbox"
                        checked={accessSettings.canViewCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAccessSettings({
                              ...accessSettings,
                              canViewCategories: [...accessSettings.canViewCategories, cat]
                            })
                          } else {
                            setAccessSettings({
                              ...accessSettings,
                              canViewCategories: accessSettings.canViewCategories.filter(c => c !== cat)
                            })
                          }
                        }}
                        className="nominee-category-checkbox-input"
                      />
                      <span className="nominee-category-checkbox-text">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="nominee-form-row">
                <label className="nominee-form-label">Access Expiry (Optional)</label>
                <select
                  value={accessSettings.expiresInDays || ''}
                  onChange={(e) => setAccessSettings({...accessSettings, expiresInDays: e.target.value ? parseInt(e.target.value) : null})}
                  className="nominee-form-input"
                >
                  <option value="">No Expiry</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="180">180 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </div>

              <div className="nominee-form-actions-row">
                <button
                  type="button"
                  className="nominee-form-cancel-btn"
                  onClick={() => setShowAccessModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="nominee-form-submit-btn"
                  onClick={handleSendInvite}
                  disabled={loading || accessSettings.canViewCategories.length === 0}
                >
                  {loading ? 'Sending...' : '📧 Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyNomineesPage
