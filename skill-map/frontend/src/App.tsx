import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import SkillMapPage    from './pages/SkillMapPage'
import HistoryPage     from './pages/HistoryPage'
import SharePage       from './pages/SharePage'
import PerceptionPage  from './pages/PerceptionPage'
import RespondPage     from './pages/RespondPage'
import IdentityModal, { Identity, loadIdentity } from './components/IdentityModal'

export default function App() {
  const [darkMode,     setDarkMode]     = useState(() => localStorage.getItem('sm_theme') === 'dark')
  const [identity,     setIdentity]     = useState<Identity | null>(() => loadIdentity())
  const [showIdentity, setShowIdentity] = useState(false)

  // Persist dark mode and apply to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('sm_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Prompt for identity on first visit
  useEffect(() => {
    if (!identity) setShowIdentity(true)
  }, [])

  return (
    <BrowserRouter>
      <nav className="nav">
        {/* Brand */}
        <div className="nav-brand">
          <img
            src="/Logo.jpg"
            alt="Logo"
            className="nav-logo"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
          Skill Map
        </div>

        {/* Page links */}
        <NavLink to="/" end>My Shape</NavLink>
        <NavLink to="/history">History</NavLink>
        <NavLink to="/perception">Team Perception</NavLink>

        {/* Dark mode toggle */}
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(d => !d)}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀' : '🌙'}
        </button>

        {/* Identity / login */}
        <span className="nav-right" onClick={() => setShowIdentity(true)}>
          {identity ? (
            <>
              <span className="nav-identity-name">{identity.name}</span>
              <span className="nav-identity-email">{identity.email}</span>
            </>
          ) : (
            <span className="nav-identity-name">Sign in</span>
          )}
        </span>
      </nav>

      <Routes>
        <Route path="/"              element={<SkillMapPage identity={identity} />} />
        <Route path="/history"       element={<HistoryPage />} />
        <Route path="/share/:token"              element={<SharePage />} />
        <Route path="/perception"               element={<PerceptionPage identity={identity} />} />
        <Route path="/perception/respond/:token" element={<RespondPage />} />
      </Routes>

      {showIdentity && (
        <IdentityModal
          current={identity}
          onSave={id => { setIdentity(id); setShowIdentity(false) }}
          onClose={() => { if (identity) setShowIdentity(false) }}
        />
      )}
    </BrowserRouter>
  )
}
