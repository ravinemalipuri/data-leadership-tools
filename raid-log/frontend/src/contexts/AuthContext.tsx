import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type Role = 'leadership' | 'contributor' | 'tpm'

export interface AuthUser {
  username: string
  display:  string
  role:     Role
  token:    string
}

interface AuthContextValue {
  user:    AuthUser | null
  login:   (username: string, password: string) => Promise<void>
  logout:  () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('raid_auth')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  const login = useCallback(async (username: string, password: string) => {
    const form = new URLSearchParams({ username, password })
    const res = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.detail ?? 'Login failed')
    }
    const data = await res.json()
    const authUser: AuthUser = {
      username: data.username,
      display:  data.display,
      role:     data.role as Role,
      token:    data.access_token,
    }
    setUser(authUser)
    localStorage.setItem('raid_auth', JSON.stringify(authUser))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('raid_auth')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

/** Convenience hooks */
export function useRole(): Role | null {
  return useAuth().user?.role ?? null
}
export function canCreate(role: Role | null) { return role === 'contributor' || role === 'tpm' }
export function canDelete(role: Role | null) { return role === 'tpm' }
