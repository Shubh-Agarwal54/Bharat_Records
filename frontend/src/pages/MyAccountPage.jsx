import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../services/api'
import './MyAccountPage.css'

function MyAccountPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    dob: '',
    aadhaarNumber: '',
    panNumber: '',
    mobileNumber: '',
    email: ''
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user')
    console.log('📦 Raw localStorage user data:', userData)
    if (userData) {
      const user = JSON.parse(userData)
      console.log('👤 Parsed user object:', user)
      console.log('Profile picture URL from localStorage:', user.profilePicture)
      setFormData({
        clientId: user.clientId || '',
        name: user.fullName || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        aadhaarNumber: user.aadhaarNumber || '',
        panNumber: user.panNumber || '',
        mobileNumber: user.mobile || '',
        email: user.email || ''
      })
      if (user.profilePicture) {
        setProfilePicturePreview(user.profilePicture)
        console.log('✅ Profile picture preview set to:', user.profilePicture)
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB')
        return
      }
      setProfilePicture(file)
      setProfilePicturePreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const updateData = new FormData()
      updateData.append('fullName', formData.name)
      updateData.append('dob', formData.dob)
      updateData.append('aadhaarNumber', formData.aadhaarNumber)
      updateData.append('panNumber', formData.panNumber)
      updateData.append('mobile', formData.mobileNumber)
      
      if (profilePicture) {
        updateData.append('profilePicture', profilePicture)
      }

      const response = await userAPI.updateProfile(updateData)
      
      console.log('Backend response:', response)
      console.log('User data from response:', response.data.user)
      console.log('Profile picture URL:', response.data.user?.profilePicture)
      
      if (response.success) {
        // Update localStorage with complete new user data
        const updatedUser = {
          ...response.data.user,
          // Ensure all fields from form are included
          fullName: response.data.user.fullName || formData.name,
          dob: response.data.user.dob || formData.dob,
          aadhaarNumber: response.data.user.aadhaarNumber || formData.aadhaarNumber,
          panNumber: response.data.user.panNumber || formData.panNumber,
          mobile: response.data.user.mobile || formData.mobileNumber
        }
        console.log('Updated user object:', updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Update profile picture preview if S3 URL is returned
        if (response.data.user.profilePicture) {
          setProfilePicturePreview(response.data.user.profilePicture)
          console.log('Profile picture preview set to:', response.data.user.profilePicture)
        }
        
        setSuccess('Profile updated successfully!')
        // Redirect immediately to home page
        setTimeout(() => {
          navigate('/home')
        }, 500)
      }
    } catch (err) {
      console.error('Update profile error:', err)
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const navigationLinks = [
    { label: 'My Nominees', path: '/my-nominees' },
    { label: 'My Benefeciaries', path: '/my-beneficiaries' },
    { label: 'My Subscription', path: '/my-subscriptions' },
    { label: 'My Referrals', path: '/my-referrals' }
  ]

  return (
    <div className="my-account-page">
      <div className="page-header">
        <h1>My Account 👤</h1>
      </div>

      <div className="account-content">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profilePicturePreview ? (
              <img 
                src={profilePicturePreview} 
                alt="Profile" 
                className="profile-picture"
                onError={(e) => {
                  console.error('Failed to load profile picture:', profilePicturePreview);
                  console.error('Image load error event:', e);
                  // Clear the preview to show SVG fallback
                  setProfilePicturePreview(null);
                }}
                onLoad={() => {
                  console.log('✅ Profile picture loaded successfully:', profilePicturePreview);
                }}
              />
            ) : (
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="40" fill="#3D1F8F"/>
                <path d="M40 45c8.284 0 15-6.716 15-15s-6.716-15-15-15-15 6.716-15 15 6.716 15 15 15zM40 50c-13.333 0-25 6.667-25 15v5h50v-5c0-8.333-11.667-15-25-15z" fill="#2D165F"/>
              </svg>
            )}
          </div>
          <label htmlFor="profilePictureInput" className="upload-picture-btn">
            📷 Upload Picture
          </label>
          <input
            id="profilePictureInput"
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            style={{ display: 'none' }}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="account-form">
          <div className="form-row">
            <label className="form-label">Client Id :</label>
            <input
              type="text"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              className="form-input-field"
            />
          </div>

          <div className="form-row">
            <label className="form-label">Name :</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input-field"
            />
          </div>

          <div className="form-row">
            <label className="form-label">D.O.B :</label>
            <input
              type="text"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="form-input-field"
            />
          </div>

          <div className="form-row">
            <label className="form-label">Aadhaar Number :</label>
            <input
              type="text"
              name="aadhaarNumber"
              value={formData.aadhaarNumber}
              onChange={handleChange}
              className="form-input-field"
            />
          </div>

          <div className="form-row">
            <label className="form-label">PAN Number:</label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              className="form-input-field"
            />
          </div>

          <div className="form-row">
            <label className="form-label">Mobile Number : ✏️</label>
            <input
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="form-input-field editable"
            />
          </div>

          <button className="update-phone-btn" onClick={() => navigate('/update-phone-otp')}>Update Phone Number</button>

          <div className="form-row">
            <label className="form-label">Email : ✏️</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input-field editable"
            />
          </div>

          <button className="update-email-btn" onClick={() => navigate('/update-phone-otp')}>Update Email</button>
        </div>

        <button 
          className="save-details-btn" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Details'}
        </button>

        <div className="navigation-links">
          {navigationLinks.map((link, index) => (
            <div key={index} className="nav-link" onClick={() => navigate(link.path)}>
              <span className="nav-label">{link.label}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="#3D1F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyAccountPage
