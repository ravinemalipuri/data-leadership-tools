-- ============================================================
-- Prioritization Board — Database Schema
-- PostgreSQL (also compatible with Azure Database for PostgreSQL)
-- ============================================================

-- Ideas submitted by team members
CREATE TABLE IF NOT EXISTS ideas (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            NOT NULL,
    size            VARCHAR(2)      NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL')),
    category        VARCHAR(50),                          -- e.g. Tech Debt, New Feature, Improvement
    submitted_by    VARCHAR(100)    NOT NULL,             -- display name (no email stored)
    role            VARCHAR(50)     NOT NULL,             -- Developer, Manager, Leader
    team            VARCHAR(100)    NOT NULL,             -- from roles.json
    status          VARCHAR(20)     NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Votes — thumbs up or thumbs down per idea
-- One vote per user per idea, changeable
CREATE TABLE IF NOT EXISTS votes (
    id              SERIAL PRIMARY KEY,
    idea_id         INTEGER         NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    voter_name      VARCHAR(100)    NOT NULL,
    role            VARCHAR(50)     NOT NULL,             -- Developer, Manager, Leader
    team            VARCHAR(100)    NOT NULL,
    vote            VARCHAR(4)      NOT NULL CHECK (vote IN ('up', 'down')),
    comment         TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (idea_id, voter_name)                         -- one vote per user per idea
);

-- Admin action log
CREATE TABLE IF NOT EXISTS admin_log (
    id              SERIAL PRIMARY KEY,
    action          VARCHAR(50)     NOT NULL,             -- archive, restore, delete
    idea_id         INTEGER         NOT NULL,
    performed_by    VARCHAR(100)    NOT NULL,
    reason          TEXT,
    performed_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Views — used by the frontend
-- ============================================================

-- Summary view: idea + vote counts by role and team
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
    COUNT(v.id)                                          AS total_votes,
    SUM(CASE WHEN v.vote = 'up'   THEN 1 ELSE 0 END)   AS votes_up,
    SUM(CASE WHEN v.vote = 'down' THEN 1 ELSE 0 END)   AS votes_down,
    -- vote breakdown by role
    SUM(CASE WHEN v.vote = 'up' AND v.role = 'Developer' THEN 1 ELSE 0 END) AS dev_votes_up,
    SUM(CASE WHEN v.vote = 'up' AND v.role = 'Manager'   THEN 1 ELSE 0 END) AS mgr_votes_up,
    SUM(CASE WHEN v.vote = 'up' AND v.role = 'Leader'    THEN 1 ELSE 0 END) AS ldr_votes_up
FROM ideas i
LEFT JOIN votes v ON v.idea_id = i.id
WHERE i.status = 'active'
GROUP BY i.id, i.title, i.description, i.size, i.category,
         i.role, i.team, i.status, i.created_at;
