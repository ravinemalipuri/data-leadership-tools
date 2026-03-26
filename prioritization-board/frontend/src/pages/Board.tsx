import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api/client'
import SizeBadge from '../components/SizeBadge'
import type { Idea, Identity, AppConfig } from '../types'

type SortKey = 'votes_up' | 'votes_down' | 'net' | 'team' | 'size'
type SortDir = 'asc' | 'desc'
const SIZE_ORDER: Record<string, number> = { S: 1, M: 2, L: 3, XL: 4 }

interface Props { identity: Identity | null }

export default function Board({ identity }: Props) {
  const location = useLocation()
  const [comingSoon, setComingSoon] = useState(!!(location.state as any)?.comingSoon)

  const [ideas, setIdeas]   = useState<Idea[]>([])
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('votes_up')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [fading, setFading]   = useState(false)
  const [teamFilter, setTeamFilter] = useState('all')

  useEffect(() => {
    Promise.all([api.ideas.list(), api.config.get()])
      .then(([i, c]) => { setIdeas(i); setConfig(c) })
      .catch(() => setError('Could not load ideas. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const isAdmin = !!(identity && config?.admin_users.includes(identity.name))
  const canToggleFlag = !!(identity && (identity.role === 'Leader' || isAdmin))

  const teams = useMemo(() => {
    const t = new Set(ideas.map(i => i.submitted_by_team))
    return ['all', ...Array.from(t).sort()]
  }, [ideas])

  const sorted = useMemo(() => {
    const base = teamFilter === 'all' ? ideas : ideas.filter(i => i.submitted_by_team === teamFilter)
    return [...base].sort((a, b) => {
      let av: number | string, bv: number | string
      switch (sortKey) {
        case 'votes_up':   av = a.votes_up;   bv = b.votes_up;   break
        case 'votes_down': av = a.votes_down; bv = b.votes_down; break
        case 'net':        av = (a.votes_up - a.votes_down); bv = (b.votes_up - b.votes_down); break
        case 'team':       av = a.submitted_by_team; bv = b.submitted_by_team; break
        case 'size':       av = SIZE_ORDER[a.size] ?? 0; bv = SIZE_ORDER[b.size] ?? 0; break
        default:           av = a.votes_up; bv = b.votes_up
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [ideas, sortKey, sortDir, teamFilter])

  function handleSort(key: SortKey) {
    setFading(true)
    setTimeout(() => {
      if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
      else { setSortKey(key); setSortDir('desc') }
      setFading(false)
    }, 150)
  }

  async function handleToggleFlag(idea: Idea) {
    if (!identity || !canToggleFlag) return
    const newFlag = !idea.planning_flag
    // Optimistic update
    setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, planning_flag: newFlag } : i))
    try {
      await api.ideas.setFlag(idea.id, newFlag, identity.name, identity.role, isAdmin)
    } catch {
      // Revert on error
      setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, planning_flag: idea.planning_flag } : i))
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="sort-icon">⇅</span>
    return <span className="sort-icon active">{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div className="page page-wide fade-in">
      {comingSoon && (
        <div className="info-banner">
          🔗 Azure DevOps / Jira links are not yet configured — they will appear once your tracker is connected.
          <button className="banner-close" onClick={() => setComingSoon(false)}>✕</button>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Active Ideas</h1>
        <Link to="/submit" className="btn btn-primary">+ Submit Idea</Link>
      </div>

      {!identity && (
        <div className="success-banner">
          Set your identity (top right) to vote and submit ideas.
        </div>
      )}

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && (
        <>
          <div className="table-toolbar">
            <div className="filter-group">
              <label className="filter-label">Team</label>
              <select
                value={teamFilter}
                onChange={e => setTeamFilter(e.target.value)}
                className="filter-select"
              >
                {teams.map(t => (
                  <option key={t} value={t}>{t === 'all' ? 'All teams' : t}</option>
                ))}
              </select>
            </div>
            <span className="table-count">{sorted.length} idea{sorted.length !== 1 ? 's' : ''}</span>
            {canToggleFlag && (
              <span className="flag-hint">Click the Planning cell to toggle Y / N</span>
            )}
          </div>

          {sorted.length === 0 ? (
            <div className="empty-state">
              No ideas yet.{' '}
              <Link to="/submit" style={{ color: '#4f46e5' }}>Be the first to submit one.</Link>
            </div>
          ) : (
            <div className={`table-wrap${fading ? ' table-fading' : ''}`}>
              <table className="ideas-table">
                <thead>
                  <tr>
                    <th className="th-rank">#</th>
                    <th className="th-title">Idea</th>
                    <th className="th-size">Size</th>
                    <th className="th-category">Category</th>
                    <th className="th-team sortable" onClick={() => handleSort('team')}>
                      Team <SortIcon col="team" />
                    </th>
                    <th className="th-votes sortable" onClick={() => handleSort('votes_up')}>
                      👍 <SortIcon col="votes_up" />
                    </th>
                    <th className="th-votes sortable" onClick={() => handleSort('votes_down')}>
                      👎 <SortIcon col="votes_down" />
                    </th>
                    <th className="th-votes sortable" onClick={() => handleSort('net')}>
                      Net <SortIcon col="net" />
                    </th>
                    <th className="th-breakdown">By Role (👍)</th>
                    <th className="th-planning">Planning</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((idea, i) => {
                    const net = idea.votes_up - idea.votes_down
                    return (
                      <tr key={idea.id} className="idea-row">
                        <td className="td-rank">{i + 1}</td>
                        <td className="td-title">
                          <Link to={`/idea/${idea.id}`} className="idea-link">{idea.title}</Link>
                        </td>
                        <td><SizeBadge size={idea.size} /></td>
                        <td className="td-category">
                          {idea.category
                            ? <span className="category-badge">{idea.category}</span>
                            : <span className="muted">—</span>}
                        </td>
                        <td className="td-team">{idea.submitted_by_team}</td>
                        <td className="td-votes td-vote-up">{idea.votes_up}</td>
                        <td className="td-votes td-vote-down">{idea.votes_down}</td>
                        <td className={`td-votes td-net${net > 0 ? ' net-pos' : net < 0 ? ' net-neg' : ''}`}>
                          {net > 0 ? '+' : ''}{net}
                        </td>
                        <td className="td-breakdown">
                          {idea.votes_up > 0 ? (
                            <span className="role-pills">
                              {idea.dev_votes_up > 0 && <span className="pill pill-dev">Dev {idea.dev_votes_up}</span>}
                              {idea.mgr_votes_up > 0 && <span className="pill pill-mgr">Mgr {idea.mgr_votes_up}</span>}
                              {idea.ldr_votes_up > 0 && <span className="pill pill-ldr">Ldr {idea.ldr_votes_up}</span>}
                            </span>
                          ) : <span className="muted">—</span>}
                        </td>
                        <td className="td-planning">
                          {canToggleFlag ? (
                            <button
                              className={`planning-toggle ${idea.planning_flag ? 'flag-yes' : 'flag-no'}`}
                              onClick={() => handleToggleFlag(idea)}
                              title="Click to toggle planning consideration"
                            >
                              {idea.planning_flag ? 'Y' : 'N'}
                            </button>
                          ) : (
                            <span className={`planning-badge ${idea.planning_flag ? 'flag-yes' : 'flag-no'}`}>
                              {idea.planning_flag ? 'Y' : 'N'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
