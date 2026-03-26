import axios from 'axios'

// In Docker: nginx proxies /api/* → backend:8000/*
// In dev:    Vite proxy does the same (see vite.config.ts)
const http = axios.create({ baseURL: '/api' })

export interface Skill {
  id: number
  name: string
  category: string
}

export interface SkillRating {
  skill_id: number
  value: number
}

export interface Snapshot {
  snapshot_id: number
  label: string | null
  created_at: string
  ratings: SkillRating[]
}

export interface SnapshotSummary {
  snapshot_id: number
  label: string | null
  created_at: string
}

export interface User {
  id: number
  username: string
  display_name: string
}

export const api = {
  getMe: () =>
    http.get<User>('/users/me').then(r => r.data),

  getSkills: () =>
    http.get<Skill[]>('/skills').then(r => r.data),

  listSnapshots: (userId: number) =>
    http.get<SnapshotSummary[]>(`/users/${userId}/snapshots`).then(r => r.data),

  getSnapshot: (id: number) =>
    http.get<Snapshot>(`/snapshots/${id}`).then(r => r.data),

  createSnapshot: (userId: number, label: string | null, ratings: SkillRating[]) =>
    http.post<Snapshot>('/snapshots', { user_id: userId, label, ratings }).then(r => r.data),

  createShareToken: (snapshotId: number) =>
    http.post<{ token: string; share_url: string; expires_at: null }>('/share', { snapshot_id: snapshotId }).then(r => r.data),

  getSharedSnapshot: (token: string) =>
    http.get<Snapshot>(`/share/${token}`).then(r => r.data),
}

// ── Perception API ───────────────────────────────────────────────────────────

export interface PerceptionDimension {
  id: number
  position: number
  teasing_label: string
  pleasing_label: string
}

export interface PerceptionSurvey {
  id: number
  label: string
  anonymous: boolean
  created_at: string
}

export interface DimensionRating {
  dimension_id: number
  value: number
}

export interface PerceptionResponse {
  id: number
  respondent_type: 'self' | 'xfn'
  respondent_name: string | null
  respondent_team: string | null
  submitted_at: string
  ratings: DimensionRating[]
}

export interface DimensionSummary {
  dimension_id: number
  position: number
  teasing_label: string
  pleasing_label: string
  avg_value: number
  response_count: number
}

export const perceptionApi = {
  getDimensions: () =>
    http.get<PerceptionDimension[]>('/perception/dimensions').then(r => r.data),

  listSurveys: () =>
    http.get<PerceptionSurvey[]>('/perception/surveys').then(r => r.data),

  createSurvey: (label: string, anonymous: boolean) =>
    http.post<PerceptionSurvey>('/perception/surveys', { label, anonymous }).then(r => r.data),

  getSurvey: (id: number) =>
    http.get<PerceptionSurvey>(`/perception/surveys/${id}`).then(r => r.data),

  setAnonymous: (surveyId: number, anonymous: boolean) =>
    http.patch(`/perception/surveys/${surveyId}/anonymous?anonymous=${anonymous}`).then(r => r.data),

  submitResponse: (surveyId: number, respondentType: 'self' | 'xfn', respondentName: string | null, respondentTeam: string | null, ratings: DimensionRating[]) =>
    http.post(`/perception/surveys/${surveyId}/responses`, {
      respondent_type: respondentType, respondent_name: respondentName,
      respondent_team: respondentTeam, ratings,
    }).then(r => r.data),

  listResponses: (surveyId: number, admin = false) =>
    http.get<PerceptionResponse[]>(`/perception/surveys/${surveyId}/responses?admin=${admin}`).then(r => r.data),

  getSummary: (surveyId: number) =>
    http.get<DimensionSummary[]>(`/perception/surveys/${surveyId}/summary`).then(r => r.data),

  createToken: (surveyId: number, label?: string) =>
    http.post<{ token: string; respond_url: string; label: string | null }>('/perception/tokens', { survey_id: surveyId, label }).then(r => r.data),

  resolveToken: (token: string) =>
    http.get<{ survey_id: number; survey_label: string; anonymous: boolean }>(`/perception/tokens/${token}`).then(r => r.data),
}
