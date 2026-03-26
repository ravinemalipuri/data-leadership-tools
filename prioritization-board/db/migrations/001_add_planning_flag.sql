-- Migration 001: Add planning_flag to ideas
-- Allows Leadership / admins to mark ideas as considered for upcoming planning

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS planning_flag BOOLEAN NOT NULL DEFAULT FALSE;

-- Recreate view to expose planning_flag
CREATE OR REPLACE VIEW vw_idea_summary AS
SELECT
    i.id,
    i.title,
    i.description,
    i.size,
    i.category,
    i.role            AS submitted_by_role,
    i.team            AS submitted_by_team,
    i.status,
    i.created_at,
    i.planning_flag,
    COUNT(v.id)                                                                    AS total_votes,
    COALESCE(SUM(CASE WHEN v.vote = 'up'   THEN 1 ELSE 0 END), 0)                AS votes_up,
    COALESCE(SUM(CASE WHEN v.vote = 'down' THEN 1 ELSE 0 END), 0)                AS votes_down,
    COALESCE(SUM(CASE WHEN v.vote = 'up' AND v.role = 'Developer' THEN 1 ELSE 0 END), 0) AS dev_votes_up,
    COALESCE(SUM(CASE WHEN v.vote = 'up' AND v.role = 'Manager'   THEN 1 ELSE 0 END), 0) AS mgr_votes_up,
    COALESCE(SUM(CASE WHEN v.vote = 'up' AND v.role = 'Leader'    THEN 1 ELSE 0 END), 0) AS ldr_votes_up
FROM ideas i
LEFT JOIN votes v ON v.idea_id = i.id
WHERE i.status = 'active'
GROUP BY i.id, i.title, i.description, i.size, i.category,
         i.role, i.team, i.status, i.created_at, i.planning_flag;
