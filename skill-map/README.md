# Skill Map — We All Have Our Shape

A personal skill growth tracker built around a radar chart. You drag a dot on each skill axis, your shape forms, and you save it. Come back in 3 months, update it, and watch yourself grow.

---

## The idea behind it

Everyone has a different shape. Some people are deep in technical skills but light on strategic thinking. Others are strong communicators but newer to business context. Neither is wrong — they're just different shapes.

This tool makes that visible. Not as a performance review. Not for your manager. For you, so you can see where you are and where you want to go.

---

## How it works

**Personal view**
- You log in, see your radar chart with all skill axes
- Drag each dot outward to rate your confidence on that skill (freely, no fixed scale)
- Save the snapshot — optionally label it ("After Q1", "Post leadership course")
- Each save is stored — you build a history over time
- Skills only grow. If you add a new skill later, it starts at zero and you rate it from there

**Growth animation**
- Open your history to see your shape animate from your first snapshot to your latest
- Watch the star expand as you develop

**Team view (opt-in sharing)**
- Generate a share link for any snapshot
- Anyone with the link can view your shape
- If you share with your manager, they can overlay multiple team members' shapes
- Nothing is visible unless you choose to share

---

## Skills

Default skills match the "We all have our shape" framework:

| Skill | Category |
|-------|---------|
| Relationship Building | Leadership |
| Product Thinking | Leadership |
| Organisation Skills | Leadership |
| Communication | Leadership |
| Business Context | Business |
| Project Management | Business |
| Technical Skills | Technical |
| Writing | Communication |
| Strategic Thinking | Leadership |
| Influence | Leadership |
| Team Building | Leadership |
| Analytical Skills | Technical |

Skills are configurable. Add your own in `db/seed_skills.sql` before first run.

---

## Running locally

```bash
cp .env.example .env
docker-compose up

# App → http://localhost:3001
# API → http://localhost:8001
# API docs → http://localhost:8001/docs
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, D3.js (radar chart + drag + animation) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL 16 |
| Local run | Docker Compose |
| Azure deployment | Bicep (Azure Container Apps) |

---

## What's in this repo

```
skill-map/
├── backend/
│   └── app/
│       ├── models/snapshot.py   # Pydantic models — snapshots, ratings, share tokens
│       └── routes/              # users, snapshots, share endpoints
├── frontend/
│   └── src/components/
│       └── RadarChart.tsx       # D3 radar chart with drag interaction
├── db/
│   ├── schema.sql               # Tables: users, skills, snapshots, share_tokens
│   └── seed_skills.sql          # Default skill set
├── docker-compose.yml
└── README.md
```

---

Part of the [data-leadership-tools](../README.md) collection.
