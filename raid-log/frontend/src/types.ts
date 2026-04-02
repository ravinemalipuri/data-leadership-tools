export type RaidType = 'R' | 'A' | 'I' | 'D' | 'DC'
export type RaidStatus =
  | 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  | 'Blocked' | 'Deferred' | 'Deferred (Future)'
  | 'Proposed' | 'Accepted' | 'Superseded' | 'Deprecated'
export type Urgency    = 'High' | 'Medium' | 'Low'
export type Priority   = 'High' | 'Medium' | 'Low'
export type RiskLevel  = 'Intolerable' | 'Substantial' | 'Moderate' | 'Tolerable'

export const RAID_TYPE_LABELS: Record<RaidType, string> = {
  R: 'Risk', A: 'Assumption', I: 'Issue', D: 'Dependency', DC: 'Decision',
}

export const IMPACT_LABELS: Record<number, string> = {
  1: 'Moderate', 2: 'Significant', 3: 'Serious', 4: 'Critical',
}

export const LIKELIHOOD_LABELS: Record<number, string> = {
  1: 'Unlikely', 2: 'Low', 3: 'Very Likely', 4: 'Certain / High',
}

export function getRiskScore(impact: number, likelihood: number): number {
  return impact * likelihood
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 13) return 'Intolerable'
  if (score >= 9)  return 'Substantial'
  if (score >= 5)  return 'Moderate'
  return 'Tolerable'
}

export function riskLevelToColor(level: RiskLevel): string {
  switch (level) {
    case 'Intolerable': return '#7b3f8c'
    case 'Substantial': return '#e05c2a'
    case 'Moderate':    return '#f0a500'
    case 'Tolerable':   return '#3a9e6e'
  }
}

export function riskLevelToPriority(level: RiskLevel): Priority {
  if (level === 'Intolerable' || level === 'Substantial') return 'High'
  if (level === 'Moderate') return 'Medium'
  return 'Low'
}

export interface RaidEntry {
  id:          string
  type:        RaidType
  title:       string
  description: string
  status:      RaidStatus
  priority:    Priority
  urgency:     Urgency
  owner:       string
  mitigation:  string
  due_date:    string
  project:     string
  impact?:     number
  likelihood?: number
  risk_score?: number
  risk_level?: RiskLevel
  // Decision-only
  options_considered?: string
  decision_rationale?: string
  made_by?:            string
  review_date?:        string
  created_at:  string
  updated_at:  string
}
