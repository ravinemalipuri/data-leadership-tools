import { useEffect, useState, useCallback } from 'react'
import { api, Skill, SkillRating } from '../api'
import RadarChart from '../components/RadarChart'
import { Identity } from '../components/IdentityModal'

interface Props { identity: Identity | null }

export default function SkillMapPage({ identity }: Props) {
  const [userId, setUserId]       = useState<number | null>(null)
  const [skills, setSkills]       = useState<Skill[]>([])
  const [values, setValues]       = useState<Record<number, number>>({})
  const [label, setLabel]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [savedId, setSavedId]     = useState<number | null>(null)
  const [shareUrl, setShareUrl]   = useState<string | null>(null)
  const [copyMsg, setCopyMsg]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [user, skillList] = await Promise.all([api.getMe(), api.getSkills()])
        setUserId(user.id)
        setSkills(skillList)

        // Seed values: start from latest snapshot, or spread slightly from centre
        // (0.1 default so all dots are individually visible and clickable on first use)
        const snapshots = await api.listSnapshots(user.id)
        const initial: Record<number, number> = {}
        skillList.forEach(s => { initial[s.id] = 0.1 })

        if (snapshots.length > 0) {
          const latest = snapshots[snapshots.length - 1]
          const snap = await api.getSnapshot(latest.snapshot_id)
          snap.ratings.forEach(r => { initial[r.skill_id] = r.value })
          setSavedId(latest.snapshot_id)
        }

        setValues(initial)
      } catch {
        setError('Could not connect to the API. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = useCallback((skillId: number, value: number) => {
    setValues(prev => ({ ...prev, [skillId]: value }))
    setSavedId(null)
    setShareUrl(null)
  }, [])

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const ratings: SkillRating[] = Object.entries(values).map(([id, v]) => ({
        skill_id: Number(id),
        value: v,
      }))
      const snap = await api.createSnapshot(userId, label.trim() || null, ratings)
      setSavedId(snap.snapshot_id)
      setShareUrl(null)
      setLabel('')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    if (!savedId) return
    const result = await api.createShareToken(savedId)
    setShareUrl(result.share_url)
  }

  const handleCopy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopyMsg('Copied!')
    setTimeout(() => setCopyMsg(''), 2000)
  }

  if (loading) return <div className="loading">Loading your skill map…</div>
  if (error)   return <div className="loading" style={{ color: '#ef4444' }}>{error}</div>

  return (
    <div className="page">
      <h1 className="page-title">{identity ? `${identity.name}'s Shape` : 'My Shape'}</h1>
      <p className="page-sub">Drag each dot to rate your confidence. Save to record a snapshot.</p>

      <div className="shape-note">
        Everyone has a unique shape — and that's exactly the point. This isn't about comparing
        yourself to others. It's about tracking your own growth over time.
      </div>

      <div className="card">
        <div className="chart-wrap">
          <RadarChart skills={skills} values={values} onChange={handleChange} />
        </div>

        <div className="controls">
          <input
            className="label-input"
            placeholder="Label this snapshot (optional) — e.g. Q1 2025"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save snapshot'}
          </button>
          {savedId && !shareUrl && (
            <button className="btn btn-ghost" onClick={handleShare}>
              Generate share link
            </button>
          )}
        </div>

        {shareUrl && (
          <div className="share-box">
            <span className="share-url">{shareUrl}</span>
            <button className="btn btn-secondary" onClick={handleCopy}>
              {copyMsg || 'Copy link'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
