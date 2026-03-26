/**
 * PerceptionPage — main page for the team lead / admin.
 * - Create a survey round
 * - Rate the team yourself (self)
 * - Generate XFN share links
 * - Toggle anonymous mode
 * - View all responses + summary
 */

import { useEffect, useState } from 'react'
import { perceptionApi, PerceptionDimension, PerceptionSurvey, PerceptionResponse, DimensionSummary } from '../api'
import { Identity } from '../components/IdentityModal'
import SliderRow from '../components/SliderRow'
import SummaryBar from '../components/SummaryBar'

interface Props { identity: Identity | null }

export default function PerceptionPage({ identity }: Props) {
  const [dims, setDims]           = useState<PerceptionDimension[]>([])
  const [surveys, setSurveys]     = useState<PerceptionSurvey[]>([])
  const [activeSurvey, setActive] = useState<PerceptionSurvey | null>(null)
  const [responses, setResponses] = useState<PerceptionResponse[]>([])
  const [summary, setSummary]     = useState<DimensionSummary[]>([])
  const [values, setValues]       = useState<Record<number, number>>({})
  const [newLabel, setNewLabel]   = useState('')
  const [newAnon, setNewAnon]     = useState(true)
  const [shareUrl, setShareUrl]   = useState('')
  const [copyMsg, setCopyMsg]     = useState('')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<'rate'|'responses'|'summary'>('rate')

  useEffect(() => {
    async function load() {
      try {
        const [d, s] = await Promise.all([perceptionApi.getDimensions(), perceptionApi.listSurveys()])
        setDims(d)
        setSurveys(s)
        const init: Record<number, number> = {}
        d.forEach(dim => { init[dim.id] = 0.5 })
        setValues(init)
        if (s.length > 0) await selectSurvey(s[0], d)
      } catch (e) {
        console.error('Failed to load perception data:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const selectSurvey = async (survey: PerceptionSurvey, dimsArg?: PerceptionDimension[]) => {
    setActive(survey)
    const [resp, sum] = await Promise.all([
      perceptionApi.listResponses(survey.id, true),
      perceptionApi.getSummary(survey.id),
    ])
    setResponses(resp)
    setSummary(sum)
    // Pre-fill self rating if one exists
    const selfResp = resp.findLast(r => r.respondent_type === 'self')
    if (selfResp) {
      const v: Record<number, number> = {}
      ;(dimsArg ?? dims).forEach(d => { v[d.id] = 0.5 })
      selfResp.ratings.forEach(r => { v[r.dimension_id] = r.value })
      setValues(v)
    }
    setSaved(false)
    setShareUrl('')
  }

  const handleCreate = async () => {
    if (!newLabel.trim()) return
    const s = await perceptionApi.createSurvey(newLabel.trim(), newAnon)
    const updated = [s, ...surveys]
    setSurveys(updated)
    setNewLabel('')
    await selectSurvey(s)
  }

  const handleSelfSave = async () => {
    if (!activeSurvey) return
    setSaving(true)
    const ratings = Object.entries(values).map(([id, v]) => ({ dimension_id: Number(id), value: v }))
    await perceptionApi.submitResponse(activeSurvey.id, 'self', identity?.name ?? 'Me', identity?.team ?? null, ratings)
    const [resp, sum] = await Promise.all([
      perceptionApi.listResponses(activeSurvey.id, true),
      perceptionApi.getSummary(activeSurvey.id),
    ])
    setResponses(resp)
    setSummary(sum)
    setSaving(false)
    setSaved(true)
  }

  const handleToggleAnon = async (anon: boolean) => {
    if (!activeSurvey) return
    await perceptionApi.setAnonymous(activeSurvey.id, anon)
    setActive({ ...activeSurvey, anonymous: anon })
    setSurveys(surveys.map(s => s.id === activeSurvey.id ? { ...s, anonymous: anon } : s))
  }

  const handleGenerateLink = async () => {
    if (!activeSurvey) return
    const result = await perceptionApi.createToken(activeSurvey.id, 'XFN share link')
    setShareUrl(result.respond_url)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopyMsg('Copied!')
    setTimeout(() => setCopyMsg(''), 2000)
  }

  const selfResponses = responses.filter(r => r.respondent_type === 'self')
  const xfnResponses  = responses.filter(r => r.respondent_type === 'xfn')

  if (loading) return <div className="loading">Loading perception data…</div>

  return (
    <div className="page">
      <h1 className="page-title">Team Perception</h1>
      <p className="page-sub">
        How does your team show up? Rate yourselves and collect feedback from XFN partners.
        Not every position is right for every situation — use this to spot trends over time.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Left: survey list + create ── */}
        <div style={{ flex: '0 0 220px' }}>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.75rem' }}>NEW SURVEY ROUND</p>
            <input
              className="label-input"
              placeholder="e.g. Q1 2025"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              style={{ marginBottom: '0.5rem', width: '100%' }}
            />
            <label className="perception-toggle-row">
              <input type="checkbox" checked={newAnon} onChange={e => setNewAnon(e.target.checked)} />
              <span>Anonymous XFN</span>
            </label>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} onClick={handleCreate}>
              Create
            </button>
          </div>

          <div className="snapshot-list">
            {surveys.map(s => (
              <div
                key={s.id}
                className={`snapshot-item ${activeSurvey?.id === s.id ? 'selected' : ''}`}
                onClick={() => selectSurvey(s)}
              >
                <span className="snap-label">{s.label}</span>
                <span className="snap-date">{s.anonymous ? '🔒 anon' : '👁 visible'}</span>
              </div>
            ))}
            {surveys.length === 0 && <p className="empty" style={{ padding: '1rem 0' }}>No surveys yet.</p>}
          </div>
        </div>

        {/* ── Right: main content ── */}
        {activeSurvey ? (
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Survey header */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{activeSurvey.label}</h2>
                <label className="perception-toggle-row" style={{ marginLeft: 'auto' }}>
                  <input
                    type="checkbox"
                    checked={activeSurvey.anonymous}
                    onChange={e => handleToggleAnon(e.target.checked)}
                  />
                  <span>Anonymous XFN responses</span>
                </label>
                <button className="btn btn-ghost" onClick={handleGenerateLink}>
                  Generate XFN link
                </button>
              </div>
              {shareUrl && (
                <div className="share-box" style={{ marginTop: '0.75rem' }}>
                  <span className="share-url">{shareUrl}</span>
                  <button className="btn btn-secondary" onClick={handleCopy}>{copyMsg || 'Copy'}</button>
                </div>
              )}
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                {selfResponses.length} self · {xfnResponses.length} XFN partner{xfnResponses.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Tabs */}
            <div className="perception-tabs">
              {(['rate', 'responses', 'summary'] as const).map(t => (
                <button key={t} className={`perception-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'rate' ? 'Self-rate' : t === 'responses' ? 'All responses' : 'XFN summary'}
                </button>
              ))}
            </div>

            {/* Tab: Self-rate */}
            {tab === 'rate' && (
              <div className="card">
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  Rate where your team currently sits on each dimension. Be honest — this is for your own reflection.
                </p>
                {dims.map(d => (
                  <SliderRow
                    key={d.id}
                    teasingLabel={d.teasing_label}
                    pleasingLabel={d.pleasing_label}
                    value={values[d.id] ?? 0.5}
                    onChange={v => { setValues(prev => ({ ...prev, [d.id]: v })); setSaved(false) }}
                  />
                ))}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button className="btn btn-primary" onClick={handleSelfSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save self-rating'}
                  </button>
                  {saved && <span className="status-msg">Saved ✓</span>}
                </div>
              </div>
            )}

            {/* Tab: All responses */}
            {tab === 'responses' && (
              <div className="card">
                {responses.length === 0 && <p className="empty">No responses yet.</p>}
                {responses.map(r => (
                  <div key={r.id} className="response-card">
                    <div className="response-header">
                      <span className={`response-badge ${r.respondent_type}`}>
                        {r.respondent_type === 'self' ? 'Self' : 'XFN'}
                      </span>
                      <span className="response-who">
                        {r.respondent_team && <strong>{r.respondent_team}</strong>}
                        {r.respondent_name && !activeSurvey.anonymous && <span> · {r.respondent_name}</span>}
                      </span>
                      <span className="response-date">
                        {new Date(r.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {dims.map(d => {
                      const rating = r.ratings.find(rt => rt.dimension_id === d.id)
                      return (
                        <SliderRow
                          key={d.id}
                          teasingLabel={d.teasing_label}
                          pleasingLabel={d.pleasing_label}
                          value={rating?.value ?? 0.5}
                          readOnly
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: XFN summary */}
            {tab === 'summary' && (
              <div className="card">
                {summary.length === 0 ? (
                  <p className="empty">No XFN responses yet. Share the link with partner teams to collect feedback.</p>
                ) : (
                  <>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                      Averaged across {xfnResponses.length} XFN partner response{xfnResponses.length !== 1 ? 's' : ''}.
                    </p>
                    {summary.map(s => (
                      <SummaryBar
                        key={s.dimension_id}
                        teasingLabel={s.teasing_label}
                        pleasingLabel={s.pleasing_label}
                        avgValue={s.avg_value}
                        responseCount={s.response_count}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="empty" style={{ flex: 1 }}>Create a survey round to get started.</div>
        )}
      </div>
    </div>
  )
}
