import { useState } from 'react'

export interface Identity {
  name:  string
  email: string
}

const STORAGE_KEY = 'sm_identity'

export function loadIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Identity) : null
  } catch {
    return null
  }
}

function saveIdentity(id: Identity) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(id))
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

interface Props {
  current:  Identity | null
  onSave:   (id: Identity) => void
  onClose:  () => void
}

export default function IdentityModal({ current, onSave, onClose }: Props) {
  const [name,  setName]  = useState(current?.name  ?? '')
  const [email, setEmail] = useState(current?.email ?? '')
  const [err,   setErr]   = useState('')

  const submit = () => {
    if (!name.trim())          return setErr('Please enter your name.')
    if (!isValidEmail(email))  return setErr('Please enter a valid email.')
    const id = { name: name.trim(), email: email.trim() }
    saveIdentity(id)
    onSave(id)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Who are you?</h2>
        <p>
          Your details are stored locally in this browser only — they personalise
          your skill map and are never sent to anyone.
        </p>

        <div className="form">
          <div className="field">
            <label>Display name</label>
            <input
              type="text"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={e => { setName(e.target.value); setErr('') }}
            />
          </div>
          <div className="field">
            <label>Work email</label>
            <input
              type="email"
              placeholder="e.g. alex@company.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr('') }}
            />
          </div>

          {err && <p className="form-error">{err}</p>}

          <button className="btn btn-primary" onClick={submit}>
            {current ? 'Update' : 'Get started'}
          </button>
        </div>
      </div>
    </div>
  )
}
