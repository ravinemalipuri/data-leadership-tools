-- ============================================================
-- Team Perception — Teasing vs Pleasing
-- ============================================================

-- The 8 fixed dimensions (seeded separately)
CREATE TABLE IF NOT EXISTS perception_dimensions (
    id          SERIAL PRIMARY KEY,
    position    INTEGER NOT NULL,              -- display order
    teasing_label  VARCHAR(150) NOT NULL,      -- left / green label
    pleasing_label VARCHAR(150) NOT NULL,      -- right / red label
    active      BOOLEAN NOT NULL DEFAULT TRUE
);

-- A survey round — created by the team, covers a time period
CREATE TABLE IF NOT EXISTS perception_surveys (
    id          SERIAL PRIMARY KEY,
    label       VARCHAR(100) NOT NULL,         -- e.g. "Q1 2025"
    anonymous   BOOLEAN NOT NULL DEFAULT TRUE, -- hides XFN respondent names from team
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- One response = one person / one team rating the team
CREATE TABLE IF NOT EXISTS perception_responses (
    id                SERIAL PRIMARY KEY,
    survey_id         INTEGER NOT NULL REFERENCES perception_surveys(id) ON DELETE CASCADE,
    respondent_type   VARCHAR(10) NOT NULL CHECK (respondent_type IN ('self', 'xfn')),
    respondent_name   VARCHAR(100),            -- individual name (hidden to team when anonymous)
    respondent_team   VARCHAR(100),            -- team name (always visible)
    submitted_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Individual slider value per dimension per response (0 = teasing, 1 = pleasing)
CREATE TABLE IF NOT EXISTS perception_ratings (
    id            SERIAL PRIMARY KEY,
    response_id   INTEGER NOT NULL REFERENCES perception_responses(id) ON DELETE CASCADE,
    dimension_id  INTEGER NOT NULL REFERENCES perception_dimensions(id),
    value         NUMERIC(4,3) NOT NULL CHECK (value >= 0 AND value <= 1),
    UNIQUE (response_id, dimension_id)
);

-- Share tokens for XFN partners to submit without logging in
CREATE TABLE IF NOT EXISTS perception_tokens (
    id          SERIAL PRIMARY KEY,
    survey_id   INTEGER NOT NULL REFERENCES perception_surveys(id) ON DELETE CASCADE,
    token       VARCHAR(64) NOT NULL UNIQUE,
    label       VARCHAR(100),                  -- e.g. "Link for Platform team"
    expires_at  TIMESTAMP,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Views ───────────────────────────────────────────────────────────────────

-- Per-dimension averages across all XFN responses for a survey
CREATE OR REPLACE VIEW vw_perception_xfn_summary AS
SELECT
    pr.survey_id,
    pd.id           AS dimension_id,
    pd.position,
    pd.teasing_label,
    pd.pleasing_label,
    ROUND(AVG(rat.value)::NUMERIC, 3) AS avg_value,
    COUNT(rat.id)                     AS response_count
FROM perception_ratings rat
JOIN perception_responses pr ON pr.id  = rat.response_id
JOIN perception_dimensions pd ON pd.id = rat.dimension_id
WHERE pr.respondent_type = 'xfn'
GROUP BY pr.survey_id, pd.id, pd.position, pd.teasing_label, pd.pleasing_label;
