export interface Idea {
  id: number
  title: string
  description: string
  size: 'S' | 'M' | 'L' | 'XL'
  category: string | null
  submitted_by_role: string
  submitted_by_team: string
  status: string
  created_at: string
  planning_flag: boolean
  total_votes: number
  votes_up: number
  votes_down: number
  dev_votes_up: number
  mgr_votes_up: number
  ldr_votes_up: number
}

export interface Vote {
  role: string
  team: string
  vote: 'up' | 'down'
  comment: string | null
  updated_at: string
}

export interface Identity {
  name: string
  email: string
  role: string
  team: string
}

export interface AppConfig {
  roles: string[]
  teams: string[]
  admin_users: string[]
}

export interface AdminLogEntry {
  id: number
  action: string
  idea_id: number
  idea_title: string
  performed_by: string
  reason: string | null
  performed_at: string
}

export interface IdeaCreate {
  title: string
  description: string
  size: string
  category: string
  submitted_by: string
  role: string
  team: string
}

export interface VoteCreate {
  idea_id: number
  voter_name: string
  role: string
  team: string
  vote: 'up' | 'down'
  comment?: string
}
