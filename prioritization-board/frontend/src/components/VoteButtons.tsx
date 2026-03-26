import { useState } from 'react'
import { api } from '../api/client'
import type { Identity, Vote } from '../types'

interface Props {
  ideaId: number
  identity: Identity
  existingVote: Vote | null
  onVoteCast: () => void
}

export default function VoteButtons({ ideaId, identity, existingVote, onVoteCast }: Props) {
  const [selected, setSelected] = useState<'up' | 'down' | null>(
    existingVote ? existingVote.vote : null
  )
  const [comment, setComment] = useState(existingVote?.comment ?? '')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const submit = async () => {
    if (!selected) return
    setSaving(true)
    setStatus('idle')
    try {
      await api.votes.cast({
        idea_id: ideaId,
        voter_name: identity.name,
        role: identity.role,
        team: identity.team,
        vote: selected,
        comment: comment.trim() || undefined,
      })
      setStatus('saved')
      onVoteCast()
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="vote-section">
      <h3>Cast your vote</h3>

      <div className="vote-buttons-row">
        <button
          className={`btn btn-up ${selected === 'up' ? 'active' : ''}`}
          onClick={() => setSelected('up')}
        >
          👍 Up
        </button>
        <button
          className={`btn btn-down ${selected === 'down' ? 'active' : ''}`}
          onClick={() => setSelected('down')}
        >
          👎 Down
        </button>
        {existingVote && (
          <span className="vote-status">
            You voted {existingVote.vote === 'up' ? '👍' : '👎'} — you can change it
          </span>
        )}
      </div>

      {selected && (
        <div className="vote-comment">
          <textarea
            placeholder="Optional comment (visible to team without your name)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={saving}
          >
            {saving ? 'Saving…' : existingVote ? 'Update vote' : 'Submit vote'}
          </button>
          {status === 'saved' && (
            <span className="vote-status success" style={{ marginLeft: '0.75rem' }}>
              Vote saved.
            </span>
          )}
          {status === 'error' && (
            <span className="vote-status" style={{ marginLeft: '0.75rem', color: '#dc2626' }}>
              Something went wrong.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
