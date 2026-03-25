-- ============================================================
-- Skill Map — Database Schema
-- PostgreSQL / Azure Database for PostgreSQL
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id           SERIAL PRIMARY KEY,
    username     VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    role         VARCHAR(50),
    team         VARCHAR(100),
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Skills catalog — admin adds skills, users never lose old ones
-- Skills can be added over time but are never deleted (preserves history)
CREATE TABLE IF NOT EXISTS skills (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    category    VARCHAR(50),               -- e.g. Technical, Leadership, Communication
    added_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    active      BOOLEAN NOT NULL DEFAULT TRUE
);

-- Snapshots — a point-in-time save of a user's full shape
-- Each time a user saves, a new snapshot is created
CREATE TABLE IF NOT EXISTS snapshots (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label        VARCHAR(100),             -- optional label e.g. "Q1 2025", "After leadership course"
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Individual skill ratings within a snapshot
-- Value is 0.0 to 1.0 (position on axis — 0 = center, 1 = tip)
CREATE TABLE IF NOT EXISTS snapshot_skills (
    id          SERIAL PRIMARY KEY,
    snapshot_id INTEGER NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
    skill_id    INTEGER NOT NULL REFERENCES skills(id),
    value       NUMERIC(4,3) NOT NULL CHECK (value >= 0 AND value <= 1),
    UNIQUE (snapshot_id, skill_id)
);

-- Share tokens — user explicitly generates a share link
-- A share link exposes one snapshot to anyone with the token
CREATE TABLE IF NOT EXISTS share_tokens (
    id          SERIAL PRIMARY KEY,
    snapshot_id INTEGER NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
    token       VARCHAR(64) NOT NULL UNIQUE,
    label       VARCHAR(100),             -- e.g. "Shared with my manager"
    expires_at  TIMESTAMP,               -- null = never expires
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Views
-- ============================================================

-- Latest snapshot per user
CREATE OR REPLACE VIEW vw_latest_snapshot AS
SELECT DISTINCT ON (s.user_id)
    s.id          AS snapshot_id,
    s.user_id,
    u.display_name,
    u.role,
    u.team,
    s.label,
    s.created_at
FROM snapshots s
JOIN users u ON u.id = s.user_id
ORDER BY s.user_id, s.created_at DESC;

-- Full skill shape for any snapshot
CREATE OR REPLACE VIEW vw_snapshot_shape AS
SELECT
    ss.snapshot_id,
    s.user_id,
    u.display_name,
    sk.name       AS skill_name,
    sk.category   AS skill_category,
    ss.value,
    sn.created_at AS snapshot_date,
    sn.label      AS snapshot_label
FROM snapshot_skills ss
JOIN snapshots    sn ON sn.id    = ss.snapshot_id
JOIN skills       sk ON sk.id   = ss.skill_id
JOIN users         s ON  s.id   = sn.user_id
JOIN users         u ON  u.id   = sn.user_id;
