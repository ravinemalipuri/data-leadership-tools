import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Board from './pages/Board'
import SubmitIdea from './pages/SubmitIdea'
import IdeaDetail from './pages/IdeaDetail'
import Admin from './pages/Admin'
import PreviousQuarters from './pages/PreviousQuarters'
import IdentityModal from './components/IdentityModal'
import type { Identity } from './types'

export default function App() {
  const [identity, setIdentity] = useState<Identity | null>(() => {
    try {
      const stored = localStorage.getItem('pb_identity')
      return stored ? (JSON.parse(stored) as Identity) : null
    } catch {
      return null
    }
  })
  const [showModal, setShowModal] = useState(!identity)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('pb_theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('pb_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const saveIdentity = (id: Identity) => {
    localStorage.setItem('pb_identity', JSON.stringify(id))
    setIdentity(id)
    setShowModal(false)
  }

  return (
    <BrowserRouter>
      {showModal && (
        <IdentityModal onSave={saveIdentity} current={identity} />
      )}
      <nav className="nav">
        <div className="nav-brand">
          <img
            src="/Logo.jpg"
            alt="Logo"
            className="nav-logo"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          Data &amp; Analytics Prioritization Board
        </div>
        <NavLink to="/">Board</NavLink>
        <NavLink to="/submit">Submit Idea</NavLink>
        <NavLink to="/previous-quarters">Previous Quarters</NavLink>
        <NavLink to="/admin">Admin</NavLink>
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(d => !d)}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀' : '🌙'}
        </button>
        <span className="nav-right" onClick={() => setShowModal(true)}>
          {identity
            ? <><span className="nav-identity-name">{identity.name}</span><span className="nav-identity-email">{identity.email}</span></>
            : 'Set identity'}
        </span>
      </nav>
      <Routes>
        <Route path="/" element={<Board identity={identity} />} />
        <Route path="/submit" element={<SubmitIdea identity={identity} />} />
        <Route path="/idea/:id" element={<IdeaDetail identity={identity} />} />
        <Route path="/admin" element={<Admin identity={identity} />} />
        <Route path="/previous-quarters" element={<PreviousQuarters />} />
      </Routes>
    </BrowserRouter>
  )
}
