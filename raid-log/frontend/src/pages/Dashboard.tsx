import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadEntries, deleteEntry, exportToExcel, importFromExcel } from '../store'
import type { RaidEntry, RaidType, RaidStatus, Priority, Urgency, RiskLevel } from '../types'
import { RAID_TYPE_LABELS, riskLevelToColor } from '../types'
import RiskMatrix from '../components/RiskMatrix'

const TYPE_COLORS: Record<RaidType, string> = {
  R: '#c0392b', A: '#2980b9', I: '#e67e22', D: '#8e44ad', DC: '#16a085',
}
const STATUS_COLORS: Record<RaidStatus, string> = {
  'Open':             '#c0392b',
  'In Progress':      '#f0a500',
  'Blocked':          '#7b3f8c',
  'Deferred':         '#5d6d7e',
  'Deferred (Future)':'#85929e',
  'Resolved':         '#3a9e6e',
  'Closed':           '#7f8c8d',
  'Proposed':         '#2980b9',
  'Accepted':         '#27ae60',
  'Superseded':       '#e67e22',
  'Deprecated':       '#95a5a6',
}
const PRIORITY_COLORS: Record<Priority, string> = {
  High: '#c0392b', Medium: '#f0a500', Low: '#3a9e6e',
}
const URGENCY_COLORS: Record<Urgency, string> = {
  High: '#c0392b', Medium: '#f0a500', Low: '#3a9e6e',
}
const PRIORITY_RANK: Record<Priority, number> = { High: 1, Medium: 2, Low: 3 }
const URGENCY_RANK:  Record<Urgency,  number> = { High: 1, Medium: 2, Low: 3 }

type TypeFilter = 'All' | RaidType
type SortKey = 'priority' | 'urgency' | 'due_date' | null

const STATUSES: RaidStatus[] = ['Open', 'In Progress', 'Blocked', 'Deferred', 'Deferred (Future)', 'Resolved', 'Closed', 'Proposed', 'Accepted', 'Superseded', 'Deprecated']
const PRIORITIES: Priority[] = ['High', 'Medium', 'Low']
const URGENCIES:  Urgency[]  = ['High', 'Medium', 'Low']

export default function Dashboard({ canCreate = true, canDelete = true }: { canCreate?: boolean; canDelete?: boolean }) {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<RaidEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [typeFilter, setTypeFilter]       = useState<TypeFilter>('All')
  const [statusFilter, setStatusFilter]   = useState<RaidStatus | 'All'>('All')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All')
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'All'>('All')
  const [projectFilter, setProjectFilter] = useState<string>('All')
  const [ownerFilter, setOwnerFilter]     = useState<string>('All')
  const [search, setSearch]               = useState('')

  // Sort
  const [sortKey, setSortKey]   = useState<SortKey>(null)
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc')

  const [riskLevelFilter, setRiskLevelFilter] = useState<RiskLevel | null>(null)
  const [showMatrix, setShowMatrix]       = useState(false)
  const [importMsg, setImportMsg]         = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try { setEntries(await loadEntries()) }
    catch (err) { setError(`Failed to load entries: ${err}`) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Dynamic dropdown options
  const projectOptions = useMemo(() =>
    [...new Set(entries.map(e => e.project).filter(Boolean))].sort(), [entries])
  const ownerOptions = useMemo(() =>
    [...new Set(entries.map(e => e.owner).filter(Boolean))].sort(), [entries])

  // Filter
  const filtered = useMemo(() => {
    let list = entries.filter(e => {
      if (typeFilter     !== 'All' && e.type     !== typeFilter)     return false
      if (statusFilter   !== 'All' && e.status   !== statusFilter)   return false
      if (priorityFilter !== 'All' && e.priority !== priorityFilter) return false
      if (urgencyFilter  !== 'All' && e.urgency  !== urgencyFilter)  return false
      if (projectFilter  !== 'All' && e.project  !== projectFilter)  return false
      if (ownerFilter    !== 'All' && e.owner    !== ownerFilter)     return false
      if (riskLevelFilter && e.risk_level !== riskLevelFilter)         return false
      if (search) {
        const q = search.toLowerCase()
        if (!e.title.toLowerCase().includes(q) &&
            !e.description.toLowerCase().includes(q) &&
            !e.owner.toLowerCase().includes(q) &&
            !e.project.toLowerCase().includes(q) &&
            !e.id.toLowerCase().includes(q)) return false
      }
      return true
    })

    // Sort
    if (sortKey) {
      list = [...list].sort((a, b) => {
        let av = 0, bv = 0
        if (sortKey === 'priority') { av = PRIORITY_RANK[a.priority]; bv = PRIORITY_RANK[b.priority] }
        if (sortKey === 'urgency')  { av = URGENCY_RANK[a.urgency];   bv = URGENCY_RANK[b.urgency] }
        if (sortKey === 'due_date') {
          av = a.due_date ? new Date(a.due_date).getTime() : 9e15
          bv = b.due_date ? new Date(b.due_date).getTime() : 9e15
        }
        return sortDir === 'asc' ? av - bv : bv - av
      })
    }
    return list
  }, [entries, typeFilter, statusFilter, priorityFilter, urgencyFilter, projectFilter, ownerFilter, riskLevelFilter, search, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return <span className="sort-icon">⇅</span>
    return <span className="sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  // Summary counts (always from full entries, not filtered)
  const typeCounts = (['R', 'A', 'I', 'D', 'DC'] as RaidType[]).map(t => ({
    type: t, label: RAID_TYPE_LABELS[t],
    total:      entries.filter(e => e.type === t).length,
    open:       entries.filter(e => e.type === t && e.status === 'Open').length,
    inProgress: entries.filter(e => e.type === t && e.status === 'In Progress').length,
    blocked:    entries.filter(e => e.type === t && e.status === 'Blocked').length,
    high:       entries.filter(e => e.type === t && e.priority === 'High').length,
  }))

  const hasActiveFilter = typeFilter !== 'All' || statusFilter !== 'All' ||
    priorityFilter !== 'All' || urgencyFilter !== 'All' ||
    projectFilter !== 'All' || ownerFilter !== 'All' || !!riskLevelFilter || !!search

  function clearFilters() {
    setTypeFilter('All'); setStatusFilter('All')
    setPriorityFilter('All'); setUrgencyFilter('All')
    setProjectFilter('All'); setOwnerFilter('All')
    setRiskLevelFilter(null); setSearch('')
  }

  async function handleDelete(id: string) {
    if (deleteConfirm !== id) { setDeleteConfirm(id); return }
    await deleteEntry(id); setDeleteConfirm(null); refresh()
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setImportMsg('Importing…')
    try {
      const r = await importFromExcel(file); refresh()
      setImportMsg(`Done: ${r.added} added, ${r.updated} updated` +
        (r.skipped ? `, ${r.skipped} skipped` : '') +
        (r.errors.length ? ` (${r.errors.length} errors)` : ''))
    } catch (err) { setImportMsg(`Import failed: ${err}`) }
    if (fileRef.current) fileRef.current.value = ''
    setTimeout(() => setImportMsg(''), 6000)
  }

  const priDist = PRIORITIES.map(p => ({ p, count: filtered.filter(e => e.priority === p).length }))
  const urgDist = URGENCIES.map(u  => ({ u, count: filtered.filter(e => e.urgency  === u).length }))

  return (
    <div className="dashboard">
      {/* ── Topbar ── */}
      <div className="dashboard-topbar">
        <div>
          <h1 className="dashboard-heading">RAID Log Dashboard</h1>
          <p className="dashboard-sub">
            {loading ? 'Loading…' : `${entries.length} total · ${filtered.length} shown`}
          </p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowMatrix(m => !m)}>
            {showMatrix ? 'Hide' : 'Show'} Risk Matrix
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }} onChange={handleImport} />
          <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
            ↑ Import Excel
          </button>
          <button className="btn btn-secondary btn-sm"
            onClick={() => exportToExcel(filtered)} disabled={filtered.length === 0}>
            ↓ Export {filtered.length > 0 ? `(${filtered.length})` : ''}
          </button>
          {canCreate && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/raid/new')}>
              + New Entry
            </button>
          )}
        </div>
      </div>

      {error && <div className="import-msg import-msg-error">{error}
        <button className="btn btn-ghost btn-sm" onClick={refresh}>Retry</button></div>}
      {importMsg && <div className={`import-msg ${importMsg.includes('failed') ? 'import-msg-error' : 'import-msg-ok'}`}>{importMsg}</div>}

      {showMatrix && (
        <div className="matrix-section">
          <RiskMatrix
            compact
            filteredLevel={riskLevelFilter}
            onFilterLevel={setRiskLevelFilter}
          />
        </div>
      )}
      {riskLevelFilter && !showMatrix && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: riskLevelToColor(riskLevelFilter),
            color: '#fff', fontWeight: 600, fontSize: 13,
            borderRadius: 6, padding: '4px 10px',
          }}>
            Risk Level: {riskLevelFilter}
            <button
              onClick={() => setRiskLevelFilter(null)}
              style={{
                background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff',
                borderRadius: 4, cursor: 'pointer', padding: '0 5px', fontWeight: 700, fontSize: 13,
              }}
              title="Clear risk level filter"
            >✕</button>
          </span>
          <span style={{ fontSize: 12, color: '#888' }}>
            Show Risk Matrix to change filter
          </span>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="summary-cards">
        {typeCounts.map(tc => (
          <div key={tc.type}
            className={`summary-card ${typeFilter === tc.type ? 'card-active' : ''}`}
            style={{ borderTopColor: TYPE_COLORS[tc.type] }}
            onClick={() => setTypeFilter(f => f === tc.type ? 'All' : tc.type)}
          >
            <div className="card-type-badge" style={{ background: TYPE_COLORS[tc.type] }}>{tc.type}</div>
            <div className="card-label">{tc.label}s</div>
            <div className="card-count">{loading ? '…' : tc.total}</div>
            <div className="card-pills">
              <span className="pill" style={{ background: STATUS_COLORS['Open'] }}>{tc.open} Open</span>
              <span className="pill" style={{ background: STATUS_COLORS['In Progress'] }}>{tc.inProgress} In Progress</span>
              {tc.blocked > 0 && <span className="pill" style={{ background: STATUS_COLORS['Blocked'] }}>{tc.blocked} Blocked</span>}
              {tc.high > 0    && <span className="pill" style={{ background: PRIORITY_COLORS.High }}>{tc.high} High</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="filter-bar">
        {/* Row 1: Type toggles */}
        <div className="filter-group">
          <span className="filter-group-label">Type</span>
          <div className="filter-toggles">
            {(['All', 'R', 'A', 'I', 'D', 'DC'] as TypeFilter[]).map(t => (
              <button key={t}
                className={`filter-toggle ${typeFilter === t ? 'active' : ''}`}
                style={typeFilter === t && t !== 'All'
                  ? { background: TYPE_COLORS[t as RaidType], borderColor: TYPE_COLORS[t as RaidType], color: '#fff' }
                  : typeFilter === t ? { background: '#2c3e50', color: '#fff', borderColor: '#2c3e50' }
                  : t !== 'All' ? { borderColor: TYPE_COLORS[t as RaidType], color: TYPE_COLORS[t as RaidType] }
                  : {}}
                onClick={() => setTypeFilter(t)}
              >
                {t === 'All' ? 'All Types' : `${t} — ${RAID_TYPE_LABELS[t as RaidType]}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Dropdowns */}
        <div className="filter-selects">
          <div className="filter-select-group">
            <label>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as RaidStatus | 'All')}>
              <option value="All">All</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-select-group">
            <label>Priority</label>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as Priority | 'All')}>
              <option value="All">All</option>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="filter-select-group">
            <label>Urgency</label>
            <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value as Urgency | 'All')}>
              <option value="All">All</option>
              {URGENCIES.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="filter-select-group">
            <label>Project / Programme</label>
            <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ minWidth: 180 }}>
              <option value="All">All Projects</option>
              {projectOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="filter-select-group">
            <label>Owner</label>
            <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} style={{ minWidth: 160 }}>
              <option value="All">All Owners</option>
              {ownerOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="filter-select-group filter-search">
            <label>Search</label>
            <input className="filter-search-input" placeholder="ID, title, owner…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {hasActiveFilter && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Clear All</button>
          )}
        </div>
      </div>

      {/* ── Distribution bar ── */}
      {filtered.length > 0 && (
        <div className="dist-bar">
          <div className="dist-section">
            <span className="dist-label">Priority:</span>
            {priDist.map(({ p, count }) => count > 0 &&
              <span key={p} className="dist-chip" style={{ background: PRIORITY_COLORS[p] }}>{p}: {count}</span>)}
          </div>
          <div className="dist-section">
            <span className="dist-label">Urgency:</span>
            {urgDist.map(({ u, count }) => count > 0 &&
              <span key={u} className="dist-chip" style={{ background: URGENCY_COLORS[u] }}>{u}: {count}</span>)}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div className="empty-state"><h3>Loading RAID entries…</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {entries.length === 0
            ? <><h3>No RAID entries yet</h3><p>Click <strong>+ New RAID</strong> to get started.</p></>
            : <><h3>No entries match your filters</h3><p>Try adjusting the filters above.</p></>}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="raid-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Title</th>
                <th>Status</th>
                <th
                  className="sortable"
                  onClick={() => handleSort('priority')}
                  style={riskLevelFilter ? {
                    borderBottom: `3px solid ${riskLevelToColor(riskLevelFilter)}`,
                    color: riskLevelToColor(riskLevelFilter),
                  } : undefined}
                  title={riskLevelFilter ? `Filtered by risk level: ${riskLevelFilter}` : undefined}
                >
                  Priority {sortIcon('priority')}
                  {riskLevelFilter && (
                    <span style={{
                      display: 'block',
                      fontSize: 10,
                      fontWeight: 600,
                      color: riskLevelToColor(riskLevelFilter),
                      letterSpacing: '0.03em',
                      marginTop: 1,
                    }}>
                      ← {riskLevelFilter}
                    </span>
                  )}
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSort('urgency')}
                  style={riskLevelFilter ? {
                    borderBottom: `3px solid ${riskLevelToColor(riskLevelFilter)}`,
                    color: riskLevelToColor(riskLevelFilter),
                  } : undefined}
                  title={riskLevelFilter ? `Filtered by risk level: ${riskLevelFilter}` : undefined}
                >
                  Urgency {sortIcon('urgency')}
                  {riskLevelFilter && (
                    <span style={{
                      display: 'block',
                      fontSize: 10,
                      fontWeight: 600,
                      color: riskLevelToColor(riskLevelFilter),
                      letterSpacing: '0.03em',
                      marginTop: 1,
                    }}>
                      ← {riskLevelFilter}
                    </span>
                  )}
                </th>
                <th>Risk Score</th>
                <th>Owner</th>
                <th className="sortable" onClick={() => handleSort('due_date')}>
                  Due Date {sortIcon('due_date')}
                </th>
                <th>Project</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} className="raid-row">
                  <td>
                    <span className="id-badge" style={{ background: TYPE_COLORS[entry.type] }}>
                      {entry.id}
                    </span>
                  </td>
                  <td>
                    <span className="type-chip" style={{ background: TYPE_COLORS[entry.type] }}
                      title={RAID_TYPE_LABELS[entry.type]}>
                      {entry.type}
                    </span>
                  </td>
                  <td>
                    <div className="title-cell">
                      <span className="title-text">{entry.title}</span>
                      {entry.description && <span className="desc-preview">{entry.description}</span>}
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: STATUS_COLORS[entry.status] }}>
                      {entry.status}
                    </span>
                  </td>
                  <td>
                    <span className="priority-dot" style={{ background: PRIORITY_COLORS[entry.priority] }} />
                    {entry.priority}
                  </td>
                  <td>
                    <span className="priority-dot" style={{ background: URGENCY_COLORS[entry.urgency] }} />
                    {entry.urgency}
                  </td>
                  <td>
                    {entry.risk_score && entry.risk_level
                      ? <span className="risk-score-chip"
                          style={{ background: riskLevelToColor(entry.risk_level) }}
                          title={`Score ${entry.risk_score} → ${entry.risk_level}`}>
                          {entry.risk_score} — {entry.risk_level}
                        </span>
                      : <span className="na-text">—</span>}
                  </td>
                  <td>{(entry.type === 'DC' ? entry.made_by : entry.owner) || <span className="na-text">—</span>}</td>
                  <td>
                    {entry.due_date
                      ? <span className={isOverdue(entry.due_date, entry.status) ? 'overdue' : ''}>
                          {formatDate(entry.due_date)}
                        </span>
                      : <span className="na-text">—</span>}
                  </td>
                  <td>
                    {entry.project
                      ? <span className="project-chip" title={entry.project}>{entry.project}</span>
                      : <span className="na-text">—</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {canCreate && (
                        <button className="btn-action btn-edit"
                          onClick={() => navigate(`/raid/${entry.id}/edit`)}>Edit</button>
                      )}
                      {canDelete && (
                        <button
                          className={`btn-action btn-delete ${deleteConfirm === entry.id ? 'confirm' : ''}`}
                          onClick={() => handleDelete(entry.id)}
                          onBlur={() => setDeleteConfirm(null)}>
                          {deleteConfirm === entry.id ? 'Confirm?' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function formatDate(d: string): string {
  if (!d) return ''
  const parts = d.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d
}
function isOverdue(d: string, status: string): boolean {
  if (!d || status === 'Resolved' || status === 'Closed') return false
  return new Date(d) < new Date(new Date().toISOString().slice(0, 10))
}
