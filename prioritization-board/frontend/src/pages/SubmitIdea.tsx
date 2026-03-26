import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { Identity, AppConfig } from '../types'

interface Props {
  identity: Identity | null
}

const SIZES = ['S', 'M', 'L', 'XL'] as const
const CATEGORIES = ['Tech Debt', 'New Feature', 'Improvement', 'Infrastructure', 'Process', 'Other']

export default function SubmitIdea({ identity }: Props) {
  const navigate = useNavigate()
  const [config, setConfig] = useState<AppConfig | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [size, setSize] = useState<string>('M')
  const [category, setCategory] = useState('')
  const [name, setName] = useState(identity?.name ?? '')
  const [role, setRole] = useState(identity?.role ?? '')
  const [team, setTeam] = useState(identity?.team ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.config.get().then(setConfig).catch(() => null)
  }, [])

  // Sync from identity if it changes
  useEffect(() => {
    if (identity) {
      setName(identity.name)
      setRole(identity.role)
      setTeam(identity.team)
    }
  }, [identity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    if (!description.trim()) { setError('Description is required.'); return }
    if (!name.trim()) { setError('Display name is required.'); return }
    if (!role) { setError('Role is required.'); return }
    if (!team) { setError('Team is required.'); return }

    setSaving(true)
    setError('')
    try {
      await api.ideas.create({
        title: title.trim(),
        description: description.trim(),
        size,
        category: category.trim(),
        submitted_by: name.trim(),
        role,
        team,
      })
      navigate('/')
    } catch {
      setError('Could not submit idea. Try again.')
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Submit an Idea</h1>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Title *</label>
            <input
              type="text"
              placeholder="Short, descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="field">
            <label>Description *</label>
            <textarea
              placeholder="What is it? Why does it matter? What's the impact if we don't do it?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: 120 }}
            />
          </div>

          <div className="field">
            <label>Size *</label>
            <div className="size-options">
              {SIZES.map((s) => (
                <span key={s}>
                  <input
                    type="radio"
                    id={`size-${s}`}
                    name="size"
                    className="size-radio"
                    value={s}
                    checked={size === s}
                    onChange={() => setSize(s)}
                  />
                  <label htmlFor={`size-${s}`} className="size-radio-label">{s}</label>
                </span>
              ))}
            </div>
            <span className="form-hint">S = days · M = weeks · L = sprint+ · XL = quarter+</span>
          </div>

          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <hr className="divider" />
          <p className="form-hint" style={{ margin: '-0.5rem 0 0' }}>
            Your name won't be shown publicly — votes and comments are attributed to role + team only.
          </p>

          <div className="form-row">
            <div className="field">
              <label>Your display name *</label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Role *</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select role…</option>
                {(config?.roles ?? ['Developer', 'Manager', 'Leader']).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Team *</label>
            <select value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value="">Select team…</option>
              {(config?.teams ?? []).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Submitting…' : 'Submit idea'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
