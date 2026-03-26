import { Link } from 'react-router-dom'
import type { Idea } from '../types'
import SizeBadge from './SizeBadge'

interface Props {
  idea: Idea
}

export default function IdeaCard({ idea }: Props) {
  return (
    <div className="card idea-card">
      <div className="idea-card-header">
        <h3 className="idea-card-title">
          <Link to={`/idea/${idea.id}`}>{idea.title}</Link>
        </h3>
        <div className="idea-card-badges">
          <SizeBadge size={idea.size} />
          {idea.category && (
            <span className="category-badge">{idea.category}</span>
          )}
        </div>
      </div>

      <div className="idea-card-meta">
        {idea.submitted_by_role} · {idea.submitted_by_team}
      </div>

      <p className="idea-card-description">{idea.description}</p>

      <div className="idea-card-footer">
        <div className="vote-counts">
          <span className="vote-up">👍 {idea.votes_up}</span>
          <span className="vote-down">👎 {idea.votes_down}</span>
        </div>
        {idea.votes_up > 0 && (
          <span className="vote-role-breakdown">
            Dev {idea.dev_votes_up} · Mgr {idea.mgr_votes_up} · Ldr {idea.ldr_votes_up}
          </span>
        )}
      </div>
    </div>
  )
}
