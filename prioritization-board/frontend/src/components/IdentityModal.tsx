import { useState, useEffect } from 'react'
import { api } from '../api/client'
import type { Identity, AppConfig } from '../types'

interface Props {
  onSave: (identity: Identity) => void
  current: Identity | null
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function IdentityModal({ onSave, current }: Props) {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [name,  setName]  = useState(current?.name  ?? '')
  const [email, setEmail] = useState(current?.email ?? '')
  const [role,  setRole]  = useState(current?.role  ?? '')
  const [team,  setTeam]  = useState(current?.team  ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    api.config.get().then(setConfig).catch(() => {
      setConfig({
        roles: ['Developer', 'Manager', 'Leader'],
        teams: ['Data Engineering', 'Data Analytics', 'Data Architecture',
                'Business Intelligence', 'Platform Engineering', 'Business'],
        admin_users: [],
      })
    })
  }, [])

  const handleSave = () => {
    if (!name.trim())          { setError('Please enter your display name.'); return }
    if (!email.trim())         { setError('Please enter your work email.'); return }
    if (!isValidEmail(email))  { setError('Please enter a valid email address.'); return }
    if (!role)                 { setError('Please select your role.'); return }
    if (!team)                 { setError('Please select your team.'); return }
    onSave({ name: name.trim(), email: email.trim().toLowerCase(), role, team })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Who are you?</h2>
        <p>
          Your details are stored locally only — votes are shown by role and team.
          You can update this anytime from the nav bar.
        </p>

        <div className="form">
          <div className="field">
            <label>Display name</label>
            <input
              type="text"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Work email</label>
            <input
              type="email"
              placeholder="e.g. alex.johnson@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select role…</option>
                {config?.roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Team</label>
              <select value={team} onChange={(e) => setTeam(e.target.value)}>
                <option value="">Select team…</option>
                {config?.teams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p style={{ color: '#dc2626', margin: 0, fontSize: '0.82rem' }}>{error}</p>}

          <button className="btn btn-primary" onClick={handleSave} style={{ alignSelf: 'flex-start' }}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
