import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import SizeBadge from '../components/SizeBadge'
import type { Idea, AdminLogEntry, Identity } from '../types'

interface Props {
  identity: Identity | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function Admin({ identity }: Props) {
  const [archived, setArchived] = useState<Idea[]>([])
  const [log, setLog] = useState<AdminLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    Promise.all([api.admin.archived(), api.admin.log()])
      .then(([a, l]) => { setArchived(a); setLog(l) })
      .catch(() => setError('Could not load admin data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleArchive = async (id: number) => {
    if (!identity) { alert('Set your identity first.'); return }
    const reason = prompt('Reason for archiving? (optional)')
    try {
      await api.admin.archive(id, identity.name, reason ?? undefined)
      load()
    } catch {
      alert('Archive failed.')
    }
  }

  const handleRestore = async (id: number) => {
    if (!identity) { alert('Set your identity first.'); return }
    try {
      await api.admin.restore(id, identity.name)
      load()
    } catch {
      alert('Restore failed.')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Admin</h1>
        <Link to="/" className="btn btn-ghost btn-sm">← Back to board</Link>
      </div>

      {error && <p className="error-msg">{error}</p>}
      {loading && <p className="loading">Loading…</p>}

      {/* Archive active ideas — quick access */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          To archive an active idea, open it from the{' '}
          <Link to="/" style={{ color: '#4f46e5' }}>Board</Link> and use the archive button below.
          Archiving is reversible — it just hides an idea from the board.
        </p>
      </div>

      {/* Archived ideas */}
      <h2 className="section-title">Archived ideas ({archived.length})</h2>

      {!loading && archived.length === 0 && (
        <p className="empty-state">No archived ideas.</p>
      )}

      {archived.map((idea) => (
        <div className="card" key={idea.id} style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <strong style={{ fontSize: '0.95rem' }}>{idea.title}</strong>
                <SizeBadge size={idea.size} />
                {idea.category && <span className="category-badge">{idea.category}</span>}
                <span className="badge-archived" style={{ background: '#f3f4f6', color: '#6b7280', padding: '0.15rem 0.45rem', borderRadius: 4, fontSize: '0.72rem' }}>
                  archived
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                {idea.submitted_by_role} · {idea.submitted_by_team} · 👍 {idea.votes_up} · 👎 {idea.votes_down}
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleRestore(idea.id)}
            >
              Restore
            </button>
          </div>
        </div>
      ))}

      {/* Admin log */}
      <h2 className="section-title" style={{ marginTop: '2rem' }}>Admin log</h2>

      {!loading && log.length === 0 && (
        <p className="empty-state">No admin actions yet.</p>
      )}

      {log.length > 0 && (
        <div className="card">
          <table className="log-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Idea</th>
                <th>By</th>
                <th>Reason</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className={`action-${entry.action}`}>{entry.action}</span>
                  </td>
                  <td>
                    <Link to={`/idea/${entry.idea_id}`} style={{ color: '#4f46e5' }}>
                      {entry.idea_title}
                    </Link>
                  </td>
                  <td>{entry.performed_by}</td>
                  <td style={{ color: '#6b7280' }}>{entry.reason ?? '—'}</td>
                  <td style={{ color: '#9ca3af', whiteSpace: 'nowrap' }}>{formatDate(entry.performed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Archive button on Board */}
      <ArchiveFromBoard identity={identity} onArchive={load} />
    </div>
  )
}

// Inline archive panel — lists active ideas with an archive button
function ArchiveFromBoard({ identity, onArchive }: { identity: Identity | null; onArchive: () => void }) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadActive = () => {
    setLoading(true)
    api.ideas.list().then(setIdeas).finally(() => setLoading(false))
  }

  const toggle = () => {
    if (!open) loadActive()
    setOpen((v) => !v)
  }

  const archive = async (id: number) => {
    if (!identity) { alert('Set your identity first.'); return }
    const reason = prompt('Reason for archiving? (optional)')
    try {
      await api.admin.archive(id, identity.name, reason ?? undefined)
      loadActive()
      onArchive()
    } catch {
      alert('Archive failed.')
    }
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <button className="btn btn-ghost btn-sm" onClick={toggle}>
        {open ? '▲ Hide active ideas' : '▼ Archive an active idea'}
      </button>

      {open && (
        <div className="card" style={{ marginTop: '0.75rem' }}>
          {loading && <p className="loading">Loading…</p>}
          {!loading && ideas.length === 0 && <p className="empty-state">No active ideas.</p>}
          {ideas.map((idea) => (
            <div
              key={idea.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SizeBadge size={idea.size} />
                <span style={{ fontSize: '0.875rem' }}>{idea.title}</span>
              </div>
              <button
                className="btn btn-sm"
                style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' }}
                onClick={() => archive(idea.id)}
              >
                Archive
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
