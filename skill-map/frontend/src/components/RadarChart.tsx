/**
 * RadarChart.tsx
 *
 * Interactive radar/spider chart for the skill map.
 * Built with D3.js — user drags dots along each axis to set skill values.
 *
 * Props:
 *   skills       — array of { id, name } for each axis
 *   values       — map of skill_id → value (0.0 to 1.0)
 *   onChange     — called when user drags a dot: (skill_id, newValue) => void
 *   readOnly     — if true, no drag interaction (for viewing shared shapes)
 *   overlays     — optional array of shapes to overlay (for team view)
 *                  each overlay: { label, color, values: Map<skill_id, value> }
 *
 * TODO: implement drag interaction using d3-drag
 * TODO: implement animation between snapshots using d3-transition
 * TODO: implement overlay rendering for team view
 */

import React from 'react';

interface Skill {
  id:   number;
  name: string;
}

interface Overlay {
  label:  string;
  color:  string;
  values: Record<number, number>;
}

interface RadarChartProps {
  skills:    Skill[];
  values:    Record<number, number>;
  onChange?: (skillId: number, value: number) => void;
  readOnly?: boolean;
  overlays?: Overlay[];
}

const RadarChart: React.FC<RadarChartProps> = ({
  skills,
  values,
  onChange,
  readOnly = false,
  overlays = [],
}) => {
  // TODO: replace with D3 implementation
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p>Radar chart renders here.</p>
      <p>Skills: {skills.map(s => s.name).join(', ')}</p>
      {/* D3 SVG mounts here */}
    </div>
  );
};

export default RadarChart;
