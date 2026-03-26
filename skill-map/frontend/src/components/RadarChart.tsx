/**
 * RadarChart.tsx
 *
 * Interactive radar/spider chart built with D3.
 * - Each axis has a distinct color (line, dot, label)
 * - Labels are fully visible — never clipped
 * - Drag each dot along its axis to set skill value (0 = center, 1 = tip)
 * - onChange fires on drag END to avoid mid-drag React re-renders
 * - readOnly disables drag (shared / history views)
 */

import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'

const W  = 720
const H  = 720
const CX = W / 2
const CY = H / 2
const R          = 200   // axis radius
const LR         = 248   // label placement radius
const MIN_RADIUS = 0.10  // dots never collapse closer than 10% of R to centre
const LEVELS = 4

// 12 distinct, accessible colors — one per axis
const AXIS_COLORS = [
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ec4899', // pink
]

interface Skill   { id: number; name: string }
interface Overlay { label: string; color: string; values: Record<number, number> }

interface RadarChartProps {
  skills:    Skill[]
  values:    Record<number, number>
  onChange?: (skillId: number, value: number) => void
  readOnly?: boolean
  overlays?: Overlay[]
}

/** Split a label into 1-2 lines for SVG rendering */
function splitLabel(name: string): [string, string | null] {
  const words = name.split(' ')
  if (words.length === 1) return [name, null]
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

export default function RadarChart({
  skills,
  values,
  onChange,
  readOnly = false,
  overlays = [],
}: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || skills.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const n     = skills.length
    const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2
    const color = (i: number) => AXIS_COLORS[i % AXIS_COLORS.length]

    // ── Grid rings ─────────────────────────────────────────────────────────
    for (let l = 1; l <= LEVELS; l++) {
      const r   = (l / LEVELS) * R
      const pts = skills.map((_, i) =>
        [CX + r * Math.cos(angle(i)), CY + r * Math.sin(angle(i))].join(',')
      ).join(' ')

      svg.append('polygon')
        .attr('points', pts)
        .attr('fill', l % 2 === 0 ? 'rgba(100,116,139,0.05)' : 'none')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
    }

    // ── Axis lines (each in its own color) ─────────────────────────────────
    skills.forEach((_, i) => {
      svg.append('line')
        .attr('x1', CX).attr('y1', CY)
        .attr('x2', CX + R * Math.cos(angle(i)))
        .attr('y2', CY + R * Math.sin(angle(i)))
        .attr('stroke', color(i))
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.4)
    })

    // ── Skill labels (colored, never clipped) ──────────────────────────────
    skills.forEach((s, i) => {
      const a      = angle(i)
      const tx     = CX + LR * Math.cos(a)
      const ty     = CY + LR * Math.sin(a)
      const anchor = Math.abs(Math.cos(a)) < 0.12
        ? 'middle'
        : (Math.cos(a) > 0 ? 'start' : 'end')

      const [line1, line2] = splitLabel(s.name)

      const text = svg.append('text')
        .attr('x', tx)
        .attr('y', ty)
        .attr('text-anchor', anchor)
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .attr('font-family', 'system-ui, sans-serif')
        .attr('fill', color(i))

      if (line2) {
        text.append('tspan')
          .attr('x', tx).attr('dy', '-0.6em')
          .text(line1)
        text.append('tspan')
          .attr('x', tx).attr('dy', '1.3em')
          .text(line2)
      } else {
        text.attr('dominant-baseline', 'middle').text(line1)
      }
    })

    // ── Overlays ───────────────────────────────────────────────────────────
    overlays.forEach(overlay => {
      const pts = skills.map((s, i) => {
        const v = overlay.values[s.id] ?? 0
        const a = angle(i)
        return [CX + v * R * Math.cos(a), CY + v * R * Math.sin(a)].join(',')
      }).join(' ')

      svg.append('polygon')
        .attr('points', pts)
        .attr('fill', overlay.color + '30')
        .attr('stroke', overlay.color)
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.75)
    })

    // ── Value polygon ──────────────────────────────────────────────────────
    const localValues: Record<number, number> = { ...values }

    const polyPts = () =>
      skills.map((s, i) => {
        const v = localValues[s.id] ?? 0
        const a = angle(i)
        return [CX + v * R * Math.cos(a), CY + v * R * Math.sin(a)].join(',')
      }).join(' ')

    const polygon = svg.append('polygon')
      .attr('points', polyPts())
      .attr('fill', 'rgba(99,102,241,0.12)')
      .attr('stroke', 'rgba(99,102,241,0.5)')
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')

    // ── Draggable dots (each in its axis color) ────────────────────────────
    // dotR: visual display radius — never below MIN_RADIUS so dots stay spread
    const dotR = (v: number) => Math.max(v, MIN_RADIUS)

    skills.forEach((s, i) => {
      const a  = angle(i)
      const v0 = values[s.id] ?? 0

      const dot = svg.append('circle')
        .attr('cx', CX + dotR(v0) * R * Math.cos(a))
        .attr('cy', CY + dotR(v0) * R * Math.sin(a))
        .attr('r', 9)
        .attr('fill', color(i))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2.5)
        .attr('cursor', readOnly ? 'default' : 'grab')

      if (!readOnly && onChange) {
        const drag = d3.drag<SVGCircleElement, unknown>()
          .on('start', function () {
            d3.select(this).attr('cursor', 'grabbing').raise()
          })
          .on('drag', function (event) {
            const dx   = event.x - CX
            const dy   = event.y - CY
            const proj = dx * Math.cos(a) + dy * Math.sin(a)
            const val  = Math.max(0, Math.min(1, proj / R))

            localValues[s.id] = val

            d3.select(this)
              .attr('cx', CX + dotR(val) * R * Math.cos(a))
              .attr('cy', CY + dotR(val) * R * Math.sin(a))

            polygon.attr('points', polyPts())
          })
          .on('end', function () {
            d3.select(this).attr('cursor', 'grab')
            onChange(s.id, localValues[s.id])
          })

        dot.call(drag)
      }
    })

  }, [skills, values, readOnly, onChange, overlays])

  return (
    <svg
      ref={svgRef}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}
