import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'

const ROLE_INFO = [
  { role: 'leadership', label: 'Leadership', desc: 'Read-only dashboard view',           color: '#2980b9', icon: '👁' },
  { role: 'contributor', label: 'Engineer / TPM', desc: 'Create & update entries',        color: '#16a085', icon: '✏️' },
  { role: 'tpm',        label: 'TPM Admin',      desc: 'Full access — create, update, delete', color: '#c0392b', icon: '⚙️' },
]

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username.trim(), password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  function quickLogin(u: string, p: string) {
    setUsername(u); setPassword(p)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="nav-logo-box" style={{ fontSize: 28, gap: 4 }}>
            <span className="nav-logo-r">R</span>
            <span className="nav-logo-a">A</span>
            <span className="nav-logo-i">I</span>
            <span className="nav-logo-d">D</span>
            <span style={{ color: '#16a085' }}>DC</span>
          </div>
          <div className="login-brand-text">
            <div className="login-title">RAID Log</div>
            <div className="login-subtitle">Corporate Risk &amp; Decision Management</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">{error}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !username || !password}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Role reference */}
        <div className="login-roles">
          <div className="login-roles-title">Available Roles</div>
          <div className="login-roles-grid">
            {ROLE_INFO.map(r => (
              <div
                key={r.role}
                className="login-role-card"
                style={{ borderLeftColor: r.color }}
                onClick={() => quickLogin(
                  r.role === 'contributor' ? 'engineer' : r.role,
                  r.role === 'tpm' ? 'tpm2024' : r.role === 'contributor' ? 'eng2024' : 'lead2024'
                )}
                title="Click to fill credentials"
              >
                <span className="login-role-icon">{r.icon}</span>
                <div>
                  <div className="login-role-label" style={{ color: r.color }}>{r.label}</div>
                  <div className="login-role-desc">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="login-creds-hint">
            Click a role above to pre-fill credentials for demo
          </div>
        </div>
      </div>
    </div>
  )
}
