import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import SizeBadge from '../components/SizeBadge'
import VoteButtons from '../components/VoteButtons'
import type { Idea, Vote, Identity } from '../types'

interface Props {
  identity: Identity | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function IdeaDetail({ identity }: Props) {
  const { id } = useParams<{ id: string }>()
  const ideaId = Number(id)

  const [idea, setIdea] = useState<Idea | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const [ideaData, votesData] = await Promise.all([
        api.ideas.get(ideaId),
        api.votes.get(ideaId),
      ])
      setIdea(ideaData)
      setVotes(votesData)
    } catch {
      setError('Could not load idea.')
    } finally {
      setLoading(false)
    }
  }, [ideaId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="page"><p className="loading">Loading…</p></div>
  if (error || !idea) return <div className="page"><p className="error-msg">{error || 'Idea not found.'}</p></div>

  const myVote = identity
    ? votes.find((v) => v.role === identity.role && v.team === identity.team) ?? null
    : null

  const comments = votes.filter((v) => v.comment?.trim())

  return (
    <div className="page">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: '#6b7280', fontSize: '0.85rem' }}>← Back to board</Link>
      </div>

      <div className="card">
        <div className="idea-detail-header">
          <h1 className="idea-detail-title">{idea.title}</h1>
          <div className="idea-detail-meta">
            Submitted by {idea.submitted_by_role} · {idea.submitted_by_team} · {formatDate(idea.created_at)}
          </div>
          <div className="idea-detail-badges">
            <SizeBadge size={idea.size} />
            {idea.category && <span className="category-badge">{idea.category}</span>}
          </div>
        </div>

        <p className="idea-detail-description">{idea.description}</p>

        {/* Vote breakdown */}
        <div className="vote-breakdown" style={{ marginTop: '1.5rem' }}>
          <h4>Vote breakdown</h4>
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>👍 Up</th>
                <th>👎 Down</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Developer</td>
                <td className="td-up">{idea.dev_votes_up}</td>
                <td className="td-down">
                  {votes.filter((v) => v.role === 'Developer' && v.vote === 'down').length}
                </td>
              </tr>
              <tr>
                <td>Manager</td>
                <td className="td-up">{idea.mgr_votes_up}</td>
                <td className="td-down">
                  {votes.filter((v) => v.role === 'Manager' && v.vote === 'down').length}
                </td>
              </tr>
              <tr>
                <td>Leader</td>
                <td className="td-up">{idea.ldr_votes_up}</td>
                <td className="td-down">
                  {votes.filter((v) => v.role === 'Leader' && v.vote === 'down').length}
                </td>
              </tr>
              <tr style={{ fontWeight: 600, borderTop: '2px solid #e5e7eb' }}>
                <td>Total</td>
                <td className="td-up">{idea.votes_up}</td>
                <td className="td-down">{idea.votes_down}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Vote buttons */}
        {identity ? (
          <VoteButtons
            ideaId={ideaId}
            identity={identity}
            existingVote={myVote}
            onVoteCast={load}
          />
        ) : (
          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
            Set your identity in the nav bar to vote.
          </p>
        )}
      </div>

      {/* Comments */}
      {comments.length > 0 && (
        <div className="comments">
          <h3 className="section-title">Comments ({comments.length})</h3>
          {comments.map((v, i) => (
            <div
              key={i}
              className={`comment ${v.vote === 'up' ? 'vote-up-comment' : 'vote-down-comment'}`}
            >
              <div className="comment-header">
                {v.role} · {v.team} · {v.vote === 'up' ? '👍' : '👎'} · {formatDate(v.updated_at)}
              </div>
              <div className="comment-text">{v.comment}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
