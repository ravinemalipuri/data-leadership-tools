import type { Idea, Vote, IdeaCreate, VoteCreate, AppConfig, AdminLogEntry } from '../types'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  config: {
    get: () => request<AppConfig>('/api/config/'),
  },

  ideas: {
    list: () => request<Idea[]>('/api/ideas/'),
    get: (id: number) => request<Idea>(`/api/ideas/${id}`),
    create: (data: IdeaCreate) =>
      request<{ status: string }>('/api/ideas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    setFlag: (id: number, flag: boolean, performed_by: string, role: string, is_admin: boolean) =>
      request<{ status: string }>(`/api/ideas/${id}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag, performed_by, role, is_admin }),
      }),
  },

  votes: {
    cast: (data: VoteCreate) =>
      request<{ status: string }>('/api/votes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    get: (ideaId: number) => request<Vote[]>(`/api/votes/${ideaId}`),
  },

  admin: {
    archived: () => request<Idea[]>('/api/admin/archived'),
    log: () => request<AdminLogEntry[]>('/api/admin/log'),
    archive: (id: number, performed_by: string, reason?: string) =>
      request<{ status: string }>(`/api/admin/archive/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performed_by, reason }),
      }),
    restore: (id: number, performed_by: string) =>
      request<{ status: string }>(`/api/admin/restore/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performed_by }),
      }),
  },
}
