import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth, canCreate, canDelete } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import RaidForm from './pages/RaidForm'
import Login from './pages/Login'

function AppShell() {
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('raid_theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('raid_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  if (!user) return <Login />

  const role = user.role
  const roleColor = role === 'tpm' ? '#c0392b' : role === 'contributor' ? '#16a085' : '#2980b9'
  const roleLabel = role === 'tpm' ? 'TPM Admin' : role === 'contributor' ? 'Contributor' : 'Leadership'

  return (
    <>
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-logo-box">
            <span className="nav-logo-r">R</span>
            <span className="nav-logo-a">A</span>
            <span className="nav-logo-i">I</span>
            <span className="nav-logo-d">D</span>
          </div>
          <div>
            <div className="nav-title">RAID Log</div>
            <div className="nav-subtitle">Corporate Risk &amp; Decision Management</div>
          </div>
        </div>

        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          {canCreate(role) && (
            <NavLink to="/raid/new" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              + New Entry
            </NavLink>
          )}
        </div>

        {/* User badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <div className="nav-user-badge">
            <span className="nav-user-name">{user.display}</span>
            <span className="nav-user-role" style={{ background: roleColor }}>{roleLabel}</span>
          </div>
          <button className="theme-toggle" onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode ? '☀' : '🌙'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={logout} title="Sign out">
            ⏏ Sign out
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard canCreate={canCreate(role)} canDelete={canDelete(role)} />} />
          {canCreate(role) && (
            <>
              <Route path="/raid/new" element={<RaidForm />} />
              <Route path="/raid/:id/edit" element={<RaidForm />} />
            </>
          )}
          <Route path="*" element={<Dashboard canCreate={canCreate(role)} canDelete={canDelete(role)} />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}
