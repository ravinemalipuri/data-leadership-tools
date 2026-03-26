import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, Skill, Snapshot } from '../api'
import RadarChart from '../components/RadarChart'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const [skills, setSkills]   = useState<Skill[]>([])
  const [snap, setSnap]       = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [skillList, snapshot] = await Promise.all([
          api.getSkills(),
          api.getSharedSnapshot(token!),
        ])
        setSkills(skillList)
        setSnap(snapshot)
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status === 410) setError('This share link has expired.')
        else if (status === 404) setError('Share link not found.')
        else setError('Could not load this shared snapshot.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) return <div className="loading">Loading shared shape…</div>
  if (error)   return <div className="loading" style={{ color: '#ef4444' }}>{error}</div>

  const values: Record<number, number> = {}
  skills.forEach(s => { values[s.id] = 0 })
  snap?.ratings.forEach(r => { values[r.skill_id] = r.value })

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="page">
      <h1 className="page-title">
        {snap?.label ? snap.label : 'Shared Skill Shape'}
      </h1>
      <p className="page-sub">
        Saved {fmtDate(snap?.created_at ?? '')} · read-only view
      </p>

      <div className="card">
        <div className="chart-wrap">
          <RadarChart skills={skills} values={values} readOnly />
        </div>
      </div>
    </div>
  )
}
