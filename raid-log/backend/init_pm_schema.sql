-- RAID Log schema initialisation
-- Database: proj-tech-debt
-- Schema  : PM

-- ENUMs -------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "PM".raid_type AS ENUM ('R', 'A', 'I', 'D');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PM".raid_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PM".raid_priority AS ENUM ('High', 'Medium', 'Low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PM".raid_urgency AS ENUM ('High', 'Medium', 'Low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PM".risk_level AS ENUM ('Intolerable', 'Substantial', 'Moderate', 'Tolerable');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "PM".raid_entries (
  id           VARCHAR(64)            PRIMARY KEY,
  type         "PM".raid_type         NOT NULL,
  title        VARCHAR(512)           NOT NULL,
  description  TEXT                   NOT NULL DEFAULT '',
  status       "PM".raid_status       NOT NULL DEFAULT 'Open',
  priority     "PM".raid_priority     NOT NULL DEFAULT 'Medium',
  urgency      "PM".raid_urgency      NOT NULL DEFAULT 'Medium',
  owner        VARCHAR(256)           NOT NULL DEFAULT '',
  mitigation   TEXT                   NOT NULL DEFAULT '',
  due_date     VARCHAR(20)            NOT NULL DEFAULT '',
  project      VARCHAR(256)           NOT NULL DEFAULT '',
  impact       INTEGER,
  likelihood   INTEGER,
  risk_score   INTEGER,
  risk_level   "PM".risk_level,
  created_at   TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ            NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  "PM".raid_entries             IS 'RAID Log — Risks, Assumptions, Issues, Dependencies';
COMMENT ON COLUMN "PM".raid_entries.type        IS 'R=Risk  A=Assumption  I=Issue  D=Dependency';
COMMENT ON COLUMN "PM".raid_entries.risk_score  IS 'impact × likelihood (1-16), Risks only';
COMMENT ON COLUMN "PM".raid_entries.risk_level  IS 'Tolerable ≤4  Moderate 5-8  Substantial 9-12  Intolerable ≥13';

-- Trigger: keep updated_at current -----------------------------------------
CREATE OR REPLACE FUNCTION "PM".set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_raid_updated_at ON "PM".raid_entries;
CREATE TRIGGER trg_raid_updated_at
  BEFORE UPDATE ON "PM".raid_entries
  FOR EACH ROW EXECUTE FUNCTION "PM".set_updated_at();

-- Useful indexes -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_raid_type     ON "PM".raid_entries (type);
CREATE INDEX IF NOT EXISTS idx_raid_status   ON "PM".raid_entries (status);
CREATE INDEX IF NOT EXISTS idx_raid_priority ON "PM".raid_entries (priority);
CREATE INDEX IF NOT EXISTS idx_raid_project  ON "PM".raid_entries (project);
