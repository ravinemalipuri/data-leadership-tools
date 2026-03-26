#!/usr/bin/env python3
"""
Test data: 5-quarter Team Perception journey for a Data & Analytics team.

Story:
  Q1 2024 — Team is deep in Pleasing territory. Reactive, ignored, bad at saying no.
  Q2 2024 — Leadership notices. Team starts a coaching programme.
  Q3 2024 — Team begins pushing back on low-value requests. XFN partners notice.
  Q4 2024 — Significant shift. Team has a seat at the table on major decisions.
  Q1 2025 — Team is now a strategic partner. Stakeholders ask to grow the team.

Run:
  python db/seed_test_perception.py | psql -U postgres -d skillmap
"""

import random
import sys

random.seed(42)   # reproducible — same data every run

# ── Quarter baselines ─────────────────────────────────────────────────────────
# 8 dimensions in order (matches seed_perception.sql):
# 1 Saying NO    2 Own initiatives    3 Proactive    4 Seat at table
# 5 Listened to  6 Involved early     7 Team size    8 Business understanding
# Value: 0 = fully Teasing (green/good), 1 = fully Pleasing (red/bad)

QUARTERS = [
    {
        "label": "Q1 2024",
        "date":  "2024-03-28",
        "note":  "Team is reactive and overlooked — starting baseline",
        "base":  [0.80, 0.75, 0.78, 0.80, 0.74, 0.79, 0.72, 0.48],
    },
    {
        "label": "Q2 2024",
        "date":  "2024-06-27",
        "note":  "Leadership coaching starts — marginal improvement",
        "base":  [0.70, 0.66, 0.68, 0.70, 0.64, 0.69, 0.64, 0.42],
    },
    {
        "label": "Q3 2024",
        "date":  "2024-09-26",
        "note":  "Team saying no to low-value work — XFN partners notice shift",
        "base":  [0.55, 0.52, 0.54, 0.56, 0.50, 0.55, 0.54, 0.36],
    },
    {
        "label": "Q4 2024",
        "date":  "2024-12-19",
        "note":  "Seat at the table on roadmap planning — strong momentum",
        "base":  [0.38, 0.37, 0.39, 0.40, 0.35, 0.40, 0.42, 0.28],
    },
    {
        "label": "Q1 2025",
        "date":  "2025-03-20",
        "note":  "Strategic partner — stakeholders asking to grow the team",
        "base":  [0.24, 0.26, 0.28, 0.30, 0.25, 0.29, 0.35, 0.20],
    },
]

# ── Internal (self) respondents ───────────────────────────────────────────────
# bias: positive = they rate themselves slightly more Pleasing (self-critical)
#       negative = more optimistic about how Teasing they are
SELF = [
    {"team": "Data Governance",   "name": "Sarah Chen",        "bias":  0.04, "var": 0.04},
    {"team": "Data Engineering",  "name": "Marcus Williams",   "bias": -0.03, "var": 0.05},
    {"team": "Data Analysts",     "name": "Priya Patel",       "bias":  0.05, "var": 0.04},
    {"team": "Data Stewards",     "name": "James OBrien",      "bias": -0.02, "var": 0.03},
]

# ── XFN (external) respondents ────────────────────────────────────────────────
# XFN teams generally perceive the data team as more Pleasing than self-view
# Finance tends to be the toughest critic; Leadership is most favorable
XFN = [
    {"team": "Product",                "name": "Elena Rodriguez",  "bias":  0.08, "var": 0.06},
    {"team": "Engineering",            "name": "David Kim",        "bias":  0.06, "var": 0.05},
    {"team": "Finance",                "name": "Rachel Thompson",  "bias":  0.11, "var": 0.07},
    {"team": "Marketing",              "name": "Alex Johnson",     "bias":  0.07, "var": 0.06},
    {"team": "Leadership & Executive", "name": "Michael Chen",     "bias":  0.03, "var": 0.04},
]

DIM_IDS = list(range(1, 9))

def clamp(v):
    return round(max(0.001, min(0.999, v)), 3)

def ratings(base, bias, var):
    return [clamp(b + bias + random.uniform(-var, var)) for b in base]

# ── Generate SQL ──────────────────────────────────────────────────────────────
out = []
W   = out.append

W("BEGIN;")
W("")
W("-- ============================================================")
W("-- Team Perception — 5-quarter test data")
W("-- Data & Analytics team journey from Pleasing to Teasing")
W("-- ============================================================")
W("")

survey_id   = 0
response_id = 0
rating_id   = 0

for q in QUARTERS:
    survey_id += 1
    W(f"-- -- {q['label']}: {q['note']} --")
    W(f"INSERT INTO perception_surveys (id, label, anonymous, created_at)")
    W(f"  VALUES ({survey_id}, '{q['label']}', true, '{q['date']}');")
    W("")

    for respondent, rtype in [(r, 'self') for r in SELF] + [(r, 'xfn') for r in XFN]:
        response_id += 1
        vals = ratings(q['base'], respondent['bias'], respondent['var'])

        W(f"INSERT INTO perception_responses")
        W(f"  (id, survey_id, respondent_type, respondent_name, respondent_team, submitted_at)")
        W(f"  VALUES ({response_id}, {survey_id}, '{rtype}',")
        W(f"          '{respondent['name']}', '{respondent['team']}', '{q['date']}');")

        rating_rows = []
        for dim_id, val in zip(DIM_IDS, vals):
            rating_id += 1
            rating_rows.append(f"  ({rating_id}, {response_id}, {dim_id}, {val})")

        W(f"INSERT INTO perception_ratings (id, response_id, dimension_id, value) VALUES")
        W(",\n".join(rating_rows) + ";")
        W("")

W("-- Reset sequences")
W(f"SELECT setval('perception_surveys_id_seq',   {survey_id});")
W(f"SELECT setval('perception_responses_id_seq', {response_id});")
W(f"SELECT setval('perception_ratings_id_seq',   {rating_id});")
W("")
W("COMMIT;")
W("")
W(f"-- Inserted: {survey_id} surveys, {response_id} responses, {rating_id} ratings")

print('\n'.join(out))
