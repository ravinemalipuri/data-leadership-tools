import { useEffect, useState, useRef } from 'react'
import { api, Skill, Snapshot, SnapshotSummary } from '../api'
import RadarChart from '../components/RadarChart'

export default function HistoryPage() {
  const [skills, setSkills]         = useState<Skill[]>([])
  const [summaries, setSummaries]   = useState<SnapshotSummary[]>([])
  const [snapshots, setSnapshots]   = useState<Snapshot[]>([])
  const [activeIdx, setActiveIdx]   = useState(0)
  const [playing, setPlaying]       = useState(false)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [user, skillList] = await Promise.all([api.getMe(), api.getSkills()])
        setSkills(skillList)

        const snaps = await api.listSnapshots(user.id)
        setSummaries(snaps)

        if (snaps.length > 0) {
          const loaded = await Promise.all(snaps.map(s => api.getSnapshot(s.snapshot_id)))
          setSnapshots(loaded)
          setActiveIdx(loaded.length - 1)
        }
      } catch {
        setError('Could not load history.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Replay animation
  useEffect(() => {
    if (playing) {
      let idx = 0
      setActiveIdx(0)
      timerRef.current = setInterval(() => {
        idx++
        if (idx >= snapshots.length) {
          setPlaying(false)
          setActiveIdx(snapshots.length - 1)
          if (timerRef.current) clearInterval(timerRef.current)
        } else {
          setActiveIdx(idx)
        }
      }, 900)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, snapshots.length])

  const activeSnap = snapshots[activeIdx]

  const values: Record<number, number> = {}
  if (activeSnap) {
    skills.forEach(s => { values[s.id] = 0 })
    activeSnap.ratings.forEach(r => { values[r.skill_id] = r.value })
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  if (loading) return <div className="loading">Loading history…</div>
  if (error)   return <div className="loading" style={{ color: '#ef4444' }}>{error}</div>

  if (snapshots.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">History</h1>
        <div className="empty">No snapshots yet. Save your first shape on the My Shape page.</div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">History</h1>
      <p className="page-sub">
        {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} saved.
        {snapshots.length > 1 && ' Hit Replay to watch yourself grow.'}
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Snapshot list */}
        <div style={{ flex: '0 0 220px' }}>
          <div className="snapshot-list">
            {summaries.map((s, i) => (
              <div
                key={s.snapshot_id}
                className={`snapshot-item ${i === activeIdx ? 'selected' : ''}`}
                onClick={() => { setPlaying(false); setActiveIdx(i) }}
              >
                <span className="snap-label">{s.label || `Snapshot ${i + 1}`}</span>
                <span className="snap-date">{fmtDate(s.created_at)}</span>
              </div>
            ))}
          </div>

          {snapshots.length > 1 && (
            <button
              className={`btn ${playing ? 'btn-secondary' : 'btn-primary'}`}
              style={{ width: '100%' }}
              onClick={() => setPlaying(p => !p)}
            >
              {playing ? 'Stop' : 'Replay'}
            </button>
          )}
        </div>

        {/* Chart */}
        <div className="card" style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
            {activeSnap?.label || `Snapshot ${activeIdx + 1}`} &nbsp;·&nbsp; {fmtDate(activeSnap?.created_at ?? '')}
          </div>
          <div className="chart-wrap">
            <RadarChart skills={skills} values={values} readOnly />
          </div>
        </div>

      </div>
    </div>
  )
}
