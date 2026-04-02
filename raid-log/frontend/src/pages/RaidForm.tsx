import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createEntry, getEntry, updateEntry } from '../store'
import type { RaidType, RaidStatus, Priority, Urgency, RaidEntry } from '../types'
import { getRiskScore, getRiskLevel, riskLevelToPriority, IMPACT_LABELS, LIKELIHOOD_LABELS, RAID_TYPE_LABELS } from '../types'
import RiskMatrix from '../components/RiskMatrix'

const TYPE_COLORS: Record<RaidType, string> = {
  R: '#c0392b', A: '#2980b9', I: '#e67e22', D: '#8e44ad', DC: '#16a085',
}

const RAID_STATUSES: RaidStatus[]     = ['Open', 'In Progress', 'Blocked', 'Deferred', 'Deferred (Future)', 'Resolved', 'Closed']
const DECISION_STATUSES: RaidStatus[] = ['Proposed', 'Accepted', 'Superseded', 'Deprecated']
const PRIORITIES: Priority[] = ['High', 'Medium', 'Low']
const URGENCIES:  Urgency[]  = ['High', 'Medium', 'Low']

const EMPTY: Omit<RaidEntry, 'id' | 'created_at' | 'updated_at'> = {
  type: 'R', title: '', description: '', status: 'Open',
  priority: 'Medium', urgency: 'Medium',
  owner: '', mitigation: '', due_date: '', project: '',
  options_considered: '', decision_rationale: '', made_by: '', review_date: '',
}

export default function RaidForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [impact, setImpact] = useState<number | undefined>()
  const [likelihood, setLikelihood] = useState<number | undefined>()
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isDecision = form.type === 'DC'

  useEffect(() => {
    if (form.type === 'R' && impact && likelihood) {
      const score = getRiskScore(impact, likelihood)
      const level = getRiskLevel(score)
      setForm(f => ({ ...f, risk_score: score, risk_level: level, priority: riskLevelToPriority(level), impact, likelihood }))
    }
  }, [impact, likelihood, form.type])

  useEffect(() => {
    if (!isEdit || !id) return
    getEntry(id).then(entry => {
      if (!entry) { setNotFound(true); return }
      const { id: _id, created_at: _c, updated_at: _u, impact: imp, likelihood: lik, ...rest } = entry
      setForm(rest)
      if (imp) setImpact(imp)
      if (lik) setLikelihood(lik)
      setLoading(false)
    }).catch(() => { setNotFound(true); setLoading(false) })
  }, [id, isEdit])

  function handleTypeChange(type: RaidType) {
    const defaultStatus: RaidStatus = type === 'DC' ? 'Proposed' : 'Open'
    setForm(f => ({ ...f, type, status: defaultStatus }))
    if (type !== 'R') { setImpact(undefined); setLikelihood(undefined) }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.owner.trim() && !isDecision) errs.owner = 'Owner is required'
    if (isDecision && !form.made_by?.trim()) errs.made_by = 'Decision Maker is required'
    if (form.type === 'R' && (!impact || !likelihood)) errs.risk = 'Select a cell on the Risk Matrix'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const data = { ...form, impact, likelihood }
      if (isEdit && id) { await updateEntry(id, data) }
      else { await createEntry(data) }
      setSaved(true)
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setErrors({ submit: `Save failed: ${err}` })
    } finally {
      setSaving(false)
    }
  }

  if (notFound) {
    return (
      <div className="form-page">
        <div className="not-found-box">
          <h2>Entry Not Found</h2>
          <p>No entry with ID <strong>{id}</strong> exists.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="form-page"><div className="not-found-box"><h2>Loading…</h2></div></div>
  }

  const riskScore = (impact && likelihood) ? getRiskScore(impact, likelihood) : undefined
  const riskLevel = riskScore ? getRiskLevel(riskScore) : undefined
  const statuses  = isDecision ? DECISION_STATUSES : RAID_STATUSES

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <div>
            <h1 className="form-title">{isEdit ? 'Edit Entry' : 'New RAID Entry'}</h1>
            {isEdit && <div className="form-subtitle">ID: {id}</div>}
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back to Dashboard</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type selector */}
          <div className="form-section">
            <label className="form-label">Type <span className="required">*</span></label>
            <div className="type-buttons">
              {(['R', 'A', 'I', 'D', 'DC'] as RaidType[]).map(t => (
                <button
                  key={t} type="button"
                  className={`type-btn ${form.type === t ? 'active' : ''}`}
                  style={form.type === t
                    ? { background: TYPE_COLORS[t], borderColor: TYPE_COLORS[t], color: '#fff' }
                    : { borderColor: TYPE_COLORS[t], color: TYPE_COLORS[t] }
                  }
                  onClick={() => handleTypeChange(t)}
                >
                  <span className="type-btn-letter">{t}</span>
                  <span className="type-btn-label">{RAID_TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Risk Matrix — R only */}
          {form.type === 'R' && (
            <div className="form-section">
              <label className="form-label">
                Risk Score Matrix <span className="required">*</span>
                {riskLevel && (
                  <span className="risk-level-badge" style={{
                    background: riskLevel === 'Intolerable' ? '#7b3f8c'
                      : riskLevel === 'Substantial' ? '#e05c2a'
                      : riskLevel === 'Moderate' ? '#f0a500' : '#3a9e6e',
                  }}>
                    Score {riskScore} — {riskLevel} → Priority: {riskLevelToPriority(riskLevel)}
                  </span>
                )}
              </label>
              <RiskMatrix
                selectedImpact={impact}
                selectedLikelihood={likelihood}
                onSelect={(imp, lik) => { setImpact(imp); setLikelihood(lik) }}
              />
              {impact && likelihood && (
                <div className="risk-selection-summary">
                  <strong>Selected:</strong> Likelihood — {LIKELIHOOD_LABELS[likelihood]} ({likelihood}) × Impact — {IMPACT_LABELS[impact]} ({impact})
                </div>
              )}
              {errors.risk && <div className="field-error">{errors.risk}</div>}
            </div>
          )}

          <div className="form-grid">
            {/* Title */}
            <div className="form-field full-width">
              <label className="form-label">Title <span className="required">*</span></label>
              <input
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder={isDecision ? 'Brief title of the decision' : 'Brief title describing this RAID item'}
              />
              {errors.title && <div className="field-error">{errors.title}</div>}
            </div>

            {/* Description / Context */}
            <div className="form-field full-width">
              <label className="form-label">{isDecision ? 'Context / Background' : 'Description'}</label>
              <textarea
                className="form-input" rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={isDecision ? 'What situation or problem drove this decision?' : 'Detailed description'}
              />
            </div>

            {/* Decision-specific fields */}
            {isDecision && (
              <>
                <div className="form-field full-width">
                  <label className="form-label">Options Considered</label>
                  <textarea
                    className="form-input" rows={3}
                    value={form.options_considered ?? ''}
                    onChange={e => setForm(f => ({ ...f, options_considered: e.target.value }))}
                    placeholder="List the alternatives that were evaluated before making this decision"
                  />
                </div>

                <div className="form-field full-width">
                  <label className="form-label">Decision Rationale</label>
                  <textarea
                    className="form-input" rows={3}
                    value={form.decision_rationale ?? ''}
                    onChange={e => setForm(f => ({ ...f, decision_rationale: e.target.value }))}
                    placeholder="Why was this option chosen? What criteria or constraints influenced it?"
                  />
                </div>
              </>
            )}

            {/* Status */}
            <div className="form-field">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as RaidStatus }))}>
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Priority */}
            {!isDecision && (
              <div className="form-field">
                <label className="form-label">
                  Priority
                  {form.type === 'R' && <span className="auto-badge">Auto from Matrix</span>}
                </label>
                <select
                  className="form-input" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                  disabled={form.type === 'R' && Boolean(riskLevel)}
                  style={form.type === 'R' && riskLevel ? { opacity: 0.7 } : {}}
                >
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            )}

            {/* Urgency */}
            {!isDecision && (
              <div className="form-field">
                <label className="form-label">Urgency</label>
                <select className="form-input" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value as Urgency }))}>
                  {URGENCIES.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            )}

            {/* Owner / Made By */}
            {isDecision ? (
              <div className="form-field">
                <label className="form-label">Decision Maker <span className="required">*</span></label>
                <input
                  className={`form-input ${errors.made_by ? 'input-error' : ''}`}
                  value={form.made_by ?? ''}
                  onChange={e => setForm(f => ({ ...f, made_by: e.target.value }))}
                  placeholder="Person, role, or committee who made this decision"
                />
                {errors.made_by && <div className="field-error">{errors.made_by}</div>}
              </div>
            ) : (
              <div className="form-field">
                <label className="form-label">Owner <span className="required">*</span></label>
                <input
                  className={`form-input ${errors.owner ? 'input-error' : ''}`}
                  value={form.owner}
                  onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                  placeholder="Name or team responsible"
                />
                {errors.owner && <div className="field-error">{errors.owner}</div>}
              </div>
            )}

            {/* Decision Date / Due Date */}
            <div className="form-field">
              <label className="form-label">{isDecision ? 'Decision Date' : 'Due Date'}</label>
              <input type="date" className="form-input" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>

            {/* Review Date — Decision only */}
            {isDecision && (
              <div className="form-field">
                <label className="form-label">Review Date</label>
                <input type="date" className="form-input" value={form.review_date ?? ''} onChange={e => setForm(f => ({ ...f, review_date: e.target.value }))} />
              </div>
            )}

            {/* Project */}
            <div className="form-field">
              <label className="form-label">Project / Programme</label>
              <input className="form-input" value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} placeholder="Project or programme name" />
            </div>

            {/* Mitigation / Action plan — not shown for DC */}
            {!isDecision && (
              <div className="form-field full-width">
                <label className="form-label">
                  {form.type === 'R' ? 'Mitigation / Response Plan'
                    : form.type === 'A' ? 'Validation / Action'
                    : form.type === 'I' ? 'Resolution Plan'
                    : 'Management Plan'}
                </label>
                <textarea
                  className="form-input" rows={3}
                  value={form.mitigation}
                  onChange={e => setForm(f => ({ ...f, mitigation: e.target.value }))}
                  placeholder="Describe the action plan, mitigation strategy, or resolution steps"
                />
              </div>
            )}
          </div>

          {errors.submit && <div className="field-error" style={{ marginTop: 8 }}>{errors.submit}</div>}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className={`btn btn-primary ${saved ? 'btn-saved' : ''}`} disabled={saving}>
              {saved ? '✓ Saved!' : saving ? 'Saving…' : isEdit ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
