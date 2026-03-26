/**
 * SummaryBar — shows the averaged XFN score for one dimension.
 * Green bar from left up to avg_value position.
 * Red zone from avg_value to right.
 */

interface Props {
  teasingLabel:  string
  pleasingLabel: string
  avgValue:      number   // 0.0–1.0
  responseCount: number
}

export default function SummaryBar({ teasingLabel, pleasingLabel, avgValue, responseCount }: Props) {
  const pct     = Math.round(avgValue * 100)
  const label   = pct <= 30 ? 'Strongly Teasing' : pct <= 45 ? 'Teasing' : pct === 50 ? 'Balanced' : pct <= 65 ? 'Pleasing' : 'Strongly Pleasing'
  const color   = pct <= 45 ? '#16a34a' : pct <= 55 ? '#d97706' : '#dc2626'

  return (
    <div className="summary-bar-row">
      <div className="summary-bar-labels">
        <span className="summary-teasing">{teasingLabel}</span>
        <span className="summary-pleasing">{pleasingLabel}</span>
      </div>
      <div className="summary-bar-track">
        <div className="summary-bar-fill" style={{ width: `${pct}%`, background: color }} />
        <div className="summary-bar-marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="summary-bar-meta">
        <span style={{ color }}>{label}</span>
        <span className="summary-count">{responseCount} response{responseCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}
