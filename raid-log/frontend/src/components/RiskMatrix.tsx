import type { RiskLevel } from '../types'
import { getRiskScore, getRiskLevel, riskLevelToColor, IMPACT_LABELS, LIKELIHOOD_LABELS } from '../types'

interface RiskMatrixProps {
  selectedImpact?: number
  selectedLikelihood?: number
  onSelect?: (impact: number, likelihood: number) => void
  compact?: boolean
  filteredLevel?: RiskLevel | null
  onFilterLevel?: (level: RiskLevel | null) => void
}

const LIKELIHOODS = [4, 3, 2, 1]
const IMPACTS = [1, 2, 3, 4]

const LEVEL_TO_PRIORITY: Record<RiskLevel, string> = {
  Intolerable: 'High',
  Substantial:  'High',
  Moderate:     'Medium',
  Tolerable:    'Low',
}

export default function RiskMatrix({
  selectedImpact, selectedLikelihood, onSelect,
  compact, filteredLevel, onFilterLevel,
}: RiskMatrixProps) {
  const interactive = !!onSelect
  const filterMode  = !!onFilterLevel
  const cellSize    = compact ? 64 : 90
  const headerColor = '#2c3e50'

  return (
    <div className="risk-matrix-wrapper">
      {!compact && (
        <div className="risk-matrix-title">
          Scoring for all Corporate Risk and Project RAID Log
        </div>
      )}

      <div className="risk-matrix-container" style={{ overflowX: 'auto' }}>
        <table
          className="risk-matrix-table"
          style={{ borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: compact ? 11 : 13 }}
        >
          <colgroup>
            <col style={{ width: compact ? 80 : 110 }} />
            {IMPACTS.map(i => <col key={i} style={{ width: cellSize }} />)}
          </colgroup>

          <thead>
            <tr>
              <th style={thStyle(headerColor, compact)}>
                Impact /<br />Likelihood
              </th>
              {IMPACTS.map(impact => (
                <th key={impact} style={thStyle(headerColor, compact)}>
                  {IMPACT_LABELS[impact]}<br />
                  <span style={{ fontWeight: 400, fontSize: '0.85em', opacity: 0.85 }}>({impact})</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {LIKELIHOODS.map(likelihood => (
              <tr key={likelihood}>
                <th style={thStyle(headerColor, compact)}>
                  {LIKELIHOOD_LABELS[likelihood]}<br />
                  <span style={{ fontWeight: 400, fontSize: '0.85em', opacity: 0.85 }}>({likelihood})</span>
                </th>

                {IMPACTS.map(impact => {
                  const score      = getRiskScore(impact, likelihood)
                  const level      = getRiskLevel(score)
                  const bg         = riskLevelToColor(level)
                  const isSelected = selectedImpact === impact && selectedLikelihood === likelihood

                  return (
                    <td
                      key={impact}
                      onClick={() => onSelect?.(impact, likelihood)}
                      style={{
                        background: bg,
                        color: '#fff',
                        border: isSelected ? '3px solid #1a1a1a' : '2px solid #fff',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        height: compact ? 44 : 60,
                        cursor: interactive ? 'pointer' : 'default',
                        fontWeight: isSelected ? 700 : 500,
                        boxShadow: isSelected ? 'inset 0 0 0 2px rgba(255,255,255,0.8)' : 'none',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                        transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                        position: 'relative',
                        userSelect: 'none',
                      }}
                      title={`${LIKELIHOOD_LABELS[likelihood]} × ${IMPACT_LABELS[impact]} = Score ${score} → ${level}`}
                    >
                      <div style={{ fontSize: compact ? '0.75em' : '0.85em', fontWeight: 600 }}>
                        {level}
                      </div>
                      <div style={{
                        fontSize: compact ? '0.7em' : '0.78em',
                        opacity: 0.9,
                        background: 'rgba(0,0,0,0.18)',
                        borderRadius: 10,
                        display: 'inline-block',
                        padding: '1px 6px',
                        marginTop: 2,
                      }}>
                        Score: {score}
                      </div>
                      {isSelected && (
                        <div style={{ position: 'absolute', top: 3, right: 4, fontSize: 14, lineHeight: 1 }}>✓</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend — clickable in filter mode */}
      <div className="risk-matrix-legend" style={{ flexWrap: 'wrap', gap: 6 }}>
        {(['Tolerable', 'Moderate', 'Substantial', 'Intolerable'] as const).map(level => {
          const isActive = filteredLevel === level
          const isDimmed = filterMode && filteredLevel != null && !isActive
          const color    = riskLevelToColor(level)
          const priLabel = LEVEL_TO_PRIORITY[level]
          return (
            <div
              key={level}
              className="risk-matrix-legend-item"
              onClick={() => onFilterLevel?.(isActive ? null : level)}
              style={{
                cursor: filterMode ? 'pointer' : 'default',
                opacity: isDimmed ? 0.35 : 1,
                borderRadius: 6,
                padding: filterMode ? '3px 10px 3px 6px' : '2px 4px',
                border: isActive ? `2px solid ${color}` : '2px solid transparent',
                background: isActive ? `${color}18` : undefined,
                transition: 'opacity 0.15s, border-color 0.1s, background 0.1s',
                fontWeight: isActive ? 700 : undefined,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title={filterMode ? (isActive ? 'Click to clear filter' : `Filter table — ${level} → ${priLabel} Priority & Urgency`) : undefined}
            >
              <span className="risk-matrix-legend-dot" style={{ background: color }} />
              <span>{level}</span>
              {filterMode && (
                <span style={{
                  fontSize: compact ? 10 : 11,
                  color: isActive ? color : '#999',
                  marginLeft: 2,
                  fontWeight: isActive ? 700 : 400,
                }}>
                  → {priLabel}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Mapping hint */}
      {filterMode && (
        <div style={{
          marginTop: 6,
          fontSize: 11,
          color: '#888',
          fontStyle: 'italic',
          paddingLeft: 2,
        }}>
          {filteredLevel
            ? `Filtering: ${filteredLevel} → Priority & Urgency = ${LEVEL_TO_PRIORITY[filteredLevel]} · Click legend to clear`
            : 'Click a legend item to filter the table by Priority & Urgency'}
        </div>
      )}
      {interactive && (
        <div style={{ marginTop: 6, fontSize: 11, color: '#888', fontStyle: 'italic' }}>
          Click a cell to select risk score
        </div>
      )}
    </div>
  )
}

function thStyle(bg: string, compact?: boolean): React.CSSProperties {
  return {
    background: bg,
    color: '#fff',
    padding: compact ? '6px 6px' : '10px 10px',
    border: '2px solid #fff',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontWeight: 600,
    lineHeight: 1.3,
  }
}
