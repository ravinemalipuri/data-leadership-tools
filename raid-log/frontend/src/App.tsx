import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import RaidForm from './pages/RaidForm'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('raid_theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('raid_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <BrowserRouter>
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
            <div className="nav-subtitle">Corporate Risk &amp; Project Management</div>
          </div>
        </div>

        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          <NavLink to="/raid/new" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            + New RAID
          </NavLink>
        </div>

        <button
          className="theme-toggle"
          onClick={() => setDarkMode(d => !d)}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀' : '🌙'}
        </button>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/raid/new" element={<RaidForm />} />
          <Route path="/raid/:id/edit" element={<RaidForm />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
