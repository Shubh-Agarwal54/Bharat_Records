import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../services/api'
import BottomNav from '../components/BottomNav'

export default function DeleteAccountPage() {
  const navigate = useNavigate()

  // step: 'warn' | 'confirm'
  const [step, setStep] = useState('warn')
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  })()
  const isGoogleUser = user.authProvider === 'google'

  const handleDelete = async (e) => {
    e.preventDefault()
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE exactly to confirm.')
      return
    }
    if (!isGoogleUser && !password.trim()) {
      setError('Please enter your password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await userAPI.deleteAccount(isGoogleUser ? undefined : password, confirmText)
      // Wipe local session
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f7', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={() => step === 'confirm' ? setStep('warn') : navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#222', margin: 0 }}>Delete Account</h1>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: 480, margin: '0 auto' }}>

        {/* ─── STEP 1: Warning ─── */}
        {step === 'warn' && (
          <>
            {/* Icon */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#fff1f0', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
              }}>
                🗑️
              </div>
            </div>

            <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#d32f2f', marginBottom: 8 }}>
              Delete Your Account?
            </h2>
            <p style={{ textAlign: 'center', color: '#666', fontSize: 14, marginBottom: 28 }}>
              This action is <strong>permanent and irreversible</strong>. You will lose access to everything.
            </p>

            {/* What will be deleted */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 24,
              border: '1px solid #ffd0d0',
            }}>
              <p style={{ fontWeight: 700, color: '#d32f2f', marginBottom: 12, fontSize: 14 }}>
                The following will be permanently deleted:
              </p>
              {[
                '🗂️  All your uploaded documents',
                '💼  Your wallet and balance',
                '📊  All transactions',
                '👤  Your profile & personal data',
                '🔗  Nominations and access permissions',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: '#444' }}>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <button
              onClick={() => setStep('confirm')}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: '#d32f2f', color: '#fff', fontWeight: 700,
                fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 12,
              }}
            >
              I understand, continue
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: '#f0f0f0', color: '#333', fontWeight: 600,
                fontSize: 15, border: 'none', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </>
        )}

        {/* ─── STEP 2: Confirmation form ─── */}
        {step === 'confirm' && (
          <form onSubmit={handleDelete}>
            <div style={{
              background: '#fff8e1',
              border: '1px solid #ffe082',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 24,
              fontSize: 13,
              color: '#7a5c00',
            }}>
              ⚠️ Once deleted, your account <strong>cannot be recovered</strong>. Make sure you have backed up any important documents.
            </div>

            {/* Password field (only for email/password accounts) */}
            {!isGoogleUser && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                  Enter your password to verify
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your current password"
                    style={{
                      width: '100%', padding: '13px 44px 13px 14px',
                      borderRadius: 10, border: '1.5px solid #ddd',
                      fontSize: 15, boxSizing: 'border-box', outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#888',
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            {/* Type DELETE */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                Type <span style={{ color: '#d32f2f', fontFamily: 'monospace', fontWeight: 800 }}>DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                style={{
                  width: '100%', padding: '13px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${confirmText === 'DELETE' ? '#d32f2f' : '#ddd'}`,
                  fontSize: 15, boxSizing: 'border-box', outline: 'none',
                  color: confirmText === 'DELETE' ? '#d32f2f' : '#222',
                  fontWeight: confirmText === 'DELETE' ? 700 : 400,
                }}
              />
            </div>

            {error && (
              <div style={{
                background: '#fff1f0', border: '1px solid #ffd0d0',
                borderRadius: 8, padding: '10px 14px',
                color: '#d32f2f', fontSize: 13, marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || confirmText !== 'DELETE'}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: confirmText === 'DELETE' ? '#d32f2f' : '#ccc',
                color: '#fff', fontWeight: 700, fontSize: 15,
                border: 'none', cursor: confirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                marginBottom: 12, transition: 'background 0.2s',
              }}
            >
              {loading ? 'Deleting…' : '🗑️ Permanently Delete Account'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('warn'); setError(''); setPassword(''); setConfirmText('') }}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: '#f0f0f0', color: '#333', fontWeight: 600,
                fontSize: 15, border: 'none', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
