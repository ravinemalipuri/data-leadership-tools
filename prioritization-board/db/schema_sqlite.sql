-- ============================================================
-- Prioritization Board — SQLite Schema
-- Used for the desktop (standalone executable) build
-- ============================================================

CREATE TABLE IF NOT EXISTS ideas (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    title           TEXT     NOT NULL,
    description     TEXT     NOT NULL,
    size            TEXT     NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL')),
    category        TEXT,
    submitted_by    TEXT     NOT NULL,
    role            TEXT     NOT NULL,
    team            TEXT     NOT NULL,
    status          TEXT     NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    planning_flag   INTEGER  NOT NULL DEFAULT 0,
    created_at      TEXT     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TEXT     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    idea_id         INTEGER  NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    voter_name      TEXT     NOT NULL,
    role            TEXT     NOT NULL,
    team            TEXT     NOT NULL,
    vote            TEXT     NOT NULL CHECK (vote IN ('up', 'down')),
    comment         TEXT,
    created_at      TEXT     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TEXT     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (idea_id, voter_name)
);

CREATE TABLE IF NOT EXISTS admin_log (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    action          TEXT     NOT NULL,
    idea_id         INTEGER  NOT NULL,
    performed_by    TEXT     NOT NULL,
    reason          TEXT,
    performed_at    TEXT     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- View — idea summary with vote counts by role
-- ============================================================

CREATE VIEW IF NOT EXISTS vw_idea_summary AS
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
    COALESCE(COUNT(v.id), 0)                                                                    AS total_votes,
    COALESCE(SUM(CASE WHEN v.vote = 'up'   THEN 1 ELSE 0 END), 0)                              AS votes_up,
    COALESCE(SUM(CASE WHEN v.vote = 'down' THEN 1 ELSE 0 END), 0)                              AS votes_down,
    COALESCE(SUM(CASE WHEN v.vote = 'up' AND v.role = 'Developer' THEN 1 ELSE 0 END), 0)       AS dev_votes_up,
    COALESCE(SUM(CASE WHEN v.vote = 'up' AND v.role = 'Manager'   THEN 1 ELSE 0 END), 0)       AS mgr_votes_up,
    COALESCE(SUM(CASE WHEN v.vote = 'up' AND v.role = 'Leader'    THEN 1 ELSE 0 END), 0)       AS ldr_votes_up
FROM ideas i
LEFT JOIN votes v ON v.idea_id = i.id
WHERE i.status = 'active'
GROUP BY i.id, i.title, i.description, i.size, i.category,
         i.role, i.team, i.status, i.created_at, i.planning_flag;
