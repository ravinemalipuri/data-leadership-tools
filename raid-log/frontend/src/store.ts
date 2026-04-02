import * as XLSX from 'xlsx'
import type { RaidEntry, RaidType, RaidStatus, Priority, Urgency, RiskLevel } from './types'
import { getRiskScore, getRiskLevel, riskLevelToPriority } from './types'

// ─── ID Generation ─────────────────────────────────────────────────────────────
export function generateId(): string {
  return `RAID-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

// ─── API Client ────────────────────────────────────────────────────────────────
function getAuthHeader(): Record<string, string> {
  try {
    const raw = localStorage.getItem('raid_auth')
    if (raw) {
      const { token } = JSON.parse(raw)
      if (token) return { Authorization: `Bearer ${token}` }
    }
  } catch { /* ignore */ }
  return {}
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(), ...options?.headers },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ─── API shape mirrors RaidEntry but dates come as strings from JSON ───────────
type ApiEntry = Omit<RaidEntry, 'created_at' | 'updated_at'> & {
  created_at: string
  updated_at: string
}

function normalise(e: ApiEntry): RaidEntry {
  return { ...e }
}

// ─── CRUD ──────────────────────────────────────────────────────────────────────
export async function loadEntries(): Promise<RaidEntry[]> {
  const data = await request<ApiEntry[]>('/api/raids/')
  return data.map(normalise)
}

export async function getEntry(id: string): Promise<RaidEntry | null> {
  try {
    const data = await request<ApiEntry>(`/api/raids/${id}`)
    return normalise(data)
  } catch {
    return null
  }
}

export async function createEntry(
  data: Omit<RaidEntry, 'id' | 'created_at' | 'updated_at'>
): Promise<RaidEntry> {
  // ID is generated server-side as R1, A2, I3, D4 …
  const result = await request<ApiEntry>('/api/raids/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return normalise(result)
}

export async function updateEntry(
  id: string,
  data: Partial<Omit<RaidEntry, 'id' | 'created_at' | 'updated_at'>>
): Promise<RaidEntry | null> {
  try {
    const current = await getEntry(id)
    if (!current) return null
    const payload = { ...current, ...data }
    // Remove server-managed fields
    const { id: _id, created_at: _c, updated_at: _u, ...body } = payload as RaidEntry
    const result = await request<ApiEntry>(`/api/raids/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    return normalise(result)
  } catch {
    return null
  }
}

export async function deleteEntry(id: string): Promise<void> {
  await request<void>(`/api/raids/${id}`, { method: 'DELETE' })
}

// ─── Excel Export ──────────────────────────────────────────────────────────────
const EXCEL_COLUMNS = [
  'ID', 'Type', 'Title', 'Description', 'Status', 'Priority',
  'Urgency', 'Owner', 'Mitigation / Response', 'Due Date', 'Project',
  'Impact (1-4)', 'Likelihood (1-4)', 'Risk Score', 'Risk Level',
  'Created At', 'Updated At',
]

export function exportToExcel(entries: RaidEntry[]): void {
  const rows = entries.map(e => ({
    'ID': e.id,
    'Type': e.type,
    'Title': e.title,
    'Description': e.description,
    'Status': e.status,
    'Priority': e.priority,
    'Urgency': e.urgency,
    'Owner': e.owner,
    'Mitigation / Response': e.mitigation,
    'Due Date': e.due_date,
    'Project': e.project,
    'Impact (1-4)': e.impact ?? '',
    'Likelihood (1-4)': e.likelihood ?? '',
    'Risk Score': e.risk_score ?? '',
    'Risk Level': e.risk_level ?? '',
    'Created At': e.created_at ? new Date(e.created_at).toLocaleString() : '',
    'Updated At': e.updated_at ? new Date(e.updated_at).toLocaleString() : '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows, { header: EXCEL_COLUMNS })
  ws['!cols'] = [
    { wch: 22 }, { wch: 12 }, { wch: 36 }, { wch: 50 },
    { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 20 },
    { wch: 50 }, { wch: 14 }, { wch: 20 },
    { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 14 },
    { wch: 22 }, { wch: 22 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'RAID Log')
  XLSX.utils.book_append_sheet(wb, buildSummarySheet(entries), 'Summary')

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `RAID_Log_${date}.xlsx`)
}

function buildSummarySheet(entries: RaidEntry[]) {
  const types = ['R', 'A', 'I', 'D'] as RaidType[]
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'] as RaidStatus[]
  const priorities = ['High', 'Medium', 'Low'] as Priority[]
  const urgencies = ['High', 'Medium', 'Low'] as Urgency[]

  const rows: Record<string, string | number>[] = []
  rows.push({ Category: '=== BY TYPE ===' })
  for (const t of types) rows.push({ Category: `Type: ${t}`, Count: entries.filter(e => e.type === t).length })
  rows.push({ Category: '' })
  rows.push({ Category: '=== BY STATUS ===' })
  for (const s of statuses) rows.push({ Category: `Status: ${s}`, Count: entries.filter(e => e.status === s).length })
  rows.push({ Category: '' })
  rows.push({ Category: '=== BY PRIORITY ===' })
  for (const p of priorities) rows.push({ Category: `Priority: ${p}`, Count: entries.filter(e => e.priority === p).length })
  rows.push({ Category: '' })
  rows.push({ Category: '=== BY URGENCY ===' })
  for (const u of urgencies) rows.push({ Category: `Urgency: ${u}`, Count: entries.filter(e => e.urgency === u).length })
  return XLSX.utils.json_to_sheet(rows, { header: ['Category', 'Count'] })
}

// ─── Excel Import ──────────────────────────────────────────────────────────────
export type ImportResult = { added: number; updated: number; skipped: number; errors: string[] }

export async function importFromExcel(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

  const result: ImportResult = { added: 0, updated: 0, skipped: 0, errors: [] }

  for (const row of rows) {
    try {
      const rawType = String(row['Type'] ?? '').trim().toUpperCase()
      if (!['R', 'A', 'I', 'D'].includes(rawType)) {
        result.errors.push(`Skipped row: invalid Type "${row['Type']}"`)
        result.skipped++
        continue
      }
      const type = rawType as RaidType

      const title = String(row['Title'] ?? '').trim()
      if (!title) { result.errors.push('Skipped row: missing Title'); result.skipped++; continue }

      const rawStatus = String(row['Status'] ?? 'Open').trim()
      const status = (['Open', 'In Progress', 'Resolved', 'Closed'].includes(rawStatus) ? rawStatus : 'Open') as RaidStatus

      const rawPriority = String(row['Priority'] ?? 'Medium').trim()
      const priority = (['High', 'Medium', 'Low'].includes(rawPriority) ? rawPriority : 'Medium') as Priority

      const rawUrgency = String(row['Urgency'] ?? 'Medium').trim()
      const urgency = (['High', 'Medium', 'Low'].includes(rawUrgency) ? rawUrgency : 'Medium') as Urgency

      const impact = row['Impact (1-4)'] ? Number(row['Impact (1-4)']) : undefined
      const likelihood = row['Likelihood (1-4)'] ? Number(row['Likelihood (1-4)']) : undefined
      const risk_score = (impact && likelihood) ? getRiskScore(impact, likelihood) : undefined
      const risk_level: RiskLevel | undefined = risk_score ? getRiskLevel(risk_score) : undefined

      const entryData = {
        type, title,
        description: String(row['Description'] ?? ''),
        status,
        priority: (type === 'R' && risk_level) ? riskLevelToPriority(risk_level) : priority,
        urgency,
        owner: String(row['Owner'] ?? ''),
        mitigation: String(row['Mitigation / Response'] ?? ''),
        due_date: String(row['Due Date'] ?? ''),
        project: String(row['Project'] ?? ''),
        impact, likelihood, risk_score, risk_level,
      }

      const existingId = String(row['ID'] ?? '').trim()

      if (existingId && existingId.startsWith('RAID-')) {
        const updated = await updateEntry(existingId, entryData)
        if (updated) { result.updated++ } else {
          await createEntry(entryData)
          result.added++
        }
      } else {
        await createEntry(entryData)
        result.added++
      }
    } catch (err) {
      result.errors.push(`Row error: ${err}`)
      result.skipped++
    }
  }

  return result
}
