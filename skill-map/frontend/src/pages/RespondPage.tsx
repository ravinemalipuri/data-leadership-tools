/**
 * RespondPage — public page for XFN partners.
 * Accessed via share link: /perception/respond/:token
 * No login required. Partner enters their team name and rates.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { perceptionApi, PerceptionDimension } from '../api'
import SliderRow from '../components/SliderRow'

export default function RespondPage() {
  const { token } = useParams<{ token: string }>()

  const [surveyId,    setSurveyId]    = useState<number | null>(null)
  const [surveyLabel, setSurveyLabel] = useState('')
  const [dims,        setDims]        = useState<PerceptionDimension[]>([])
  const [values,      setValues]      = useState<Record<number, number>>({})
  const [teamName,    setTeamName]    = useState('')
  const [respName,    setRespName]    = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [tokenData, dims] = await Promise.all([
          perceptionApi.resolveToken(token!),
          perceptionApi.getDimensions(),
        ])
        setSurveyId(tokenData.survey_id)
        setSurveyLabel(tokenData.survey_label)
        setDims(dims)
        const init: Record<number, number> = {}
        dims.forEach(d => { init[d.id] = 0.5 })
        setValues(init)
      } catch {
        setError('This link is invalid or has expired.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const handleSubmit = async () => {
    if (!teamName.trim()) return setError('Please enter your team name.')
    if (!surveyId) return
    setSubmitting(true)
    setError('')
    try {
      const ratings = Object.entries(values).map(([id, v]) => ({
        dimension_id: Number(id),
        value: v,
      }))
      await perceptionApi.submitResponse(surveyId, 'xfn', respName.trim() || null, teamName.trim(), ratings)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)   return <div className="loading">Loading survey…</div>
  if (error && !surveyId) return <div className="loading" style={{ color: '#ef4444' }}>{error}</div>

  if (submitted) {
    return (
      <div className="page" style={{ maxWidth: 600, textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h1 className="page-title">Thank you!</h1>
        <p className="page-sub">Your feedback has been recorded. The team will use it to reflect and improve.</p>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Responses are kept confidential — only the team name is visible to the team.
        </p>
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <h1 className="page-title">Team Perception Survey</h1>
      <p className="page-sub">{surveyLabel}</p>

      <div className="shape-note" style={{ marginBottom: '1.5rem' }}>
        Rate where you think this team currently sits on each dimension. There are no right or wrong answers —
        this is about honest, constructive reflection. Your team name will be shown; your name is optional and
        kept confidential if the survey is set to anonymous.
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label>Your team name <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              placeholder="e.g. Platform Engineering"
              value={teamName}
              onChange={e => { setTeamName(e.target.value); setError('') }}
            />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label>Your name <span style={{ color: '#94a3b8' }}>(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Alex Johnson"
              value={respName}
              onChange={e => setRespName(e.target.value)}
            />
          </div>
        </div>

        {dims.map(d => (
          <SliderRow
            key={d.id}
            teasingLabel={d.teasing_label}
            pleasingLabel={d.pleasing_label}
            value={values[d.id] ?? 0.5}
            onChange={v => setValues(prev => ({ ...prev, [d.id]: v }))}
          />
        ))}

        {error && <p className="form-error" style={{ marginTop: '0.75rem' }}>{error}</p>}

        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}
