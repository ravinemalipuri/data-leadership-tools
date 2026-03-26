/**
 * SliderRow — one dimension of the Teasing ↔ Pleasing scale.
 * Left (0) = Teasing (green), Right (1) = Pleasing (red).
 */

interface Props {
  teasingLabel:  string
  pleasingLabel: string
  value:         number          // 0.0 – 1.0
  onChange?:     (v: number) => void
  readOnly?:     boolean
}

export default function SliderRow({ teasingLabel, pleasingLabel, value, onChange, readOnly = false }: Props) {
  const pct = Math.round(value * 100)

  // Track color: interpolate green → amber → red
  const trackStyle = {
    background: `linear-gradient(to right,
      #16a34a 0%,
      #16a34a ${pct}%,
      #e2e8f0 ${pct}%,
      #e2e8f0 100%)`,
  }

  return (
    <div className="slider-row">
      <span className="slider-label teasing">{teasingLabel}</span>

      <div className="slider-track-wrap">
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          disabled={readOnly}
          onChange={e => onChange?.(Number(e.target.value) / 100)}
          className="slider-input"
          style={trackStyle}
        />
        <div className="slider-markers">
          <span>Teasing</span>
          <span className="marker-mid">Balanced</span>
          <span>Pleasing</span>
        </div>
      </div>

      <span className="slider-label pleasing">{pleasingLabel}</span>
    </div>
  )
}
