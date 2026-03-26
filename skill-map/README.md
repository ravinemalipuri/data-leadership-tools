# Skill Map — We All Have Our Shape

A personal skill growth tracker and team perception tool for data & analytics leaders.
Rate your skills, watch yourself grow, and understand how your team shows up to the business.

---

## Screenshots

### My Shape — radar chart
<!-- Add screenshot: drag dots on each skill axis to rate confidence -->
![My Shape](docs/screenshot-my-shape.png)

### History — growth over time
<!-- Add screenshot: snapshots animating from first to latest -->
![History](docs/screenshot-history.png)

### Team Perception — Teasing vs Pleasing
<!-- Add screenshot: self-rate tab with sliders -->
![Team Perception - Self Rate](docs/screenshot-perception-rate.png)

<!-- Add screenshot: XFN summary tab with averaged bars -->
![Team Perception - XFN Summary](docs/screenshot-perception-summary.png)

> **To add screenshots:** take a screenshot, save it to `skill-map/docs/` with the filename above, then commit.

---

## The idea behind it

Everyone has a different shape. Some people are deep in technical skills but light on strategic thinking.
Others are strong communicators but newer to business context. Neither is wrong — they're just different shapes.

This tool makes that visible. Not as a performance review. Not for your manager. For you, so you can see where you are and where you want to go.

Team peridocially do self asseemnt : 
<img width="1166" height="884" alt="image" src="https://github.com/user-attachments/assets/4bff8087-2c98-41b4-ac2c-414be95b3b43" />

We understand teams self perception and XFN teams personal if there any gap as leadership we can take access to minimise gap. 

<img width="1186" height="897" alt="image" src="https://github.com/user-attachments/assets/504068f8-99a2-4b4b-8863-aee7e1bd5468" />



## Features

### My Shape (personal skill radar)
- Drag each dot outward to rate your confidence on that skill
- Save a named snapshot ("After Q1", "Post leadership course")
- History animates your shape from first snapshot to latest
- Generate a share link to let others view your shape

### Team Perception (Teasing vs Pleasing)
Rate how your team shows up across 8 dimensions — from fully *Teasing* (strategic, assertive, valued) to fully *Pleasing* (reactive, overlooked, compliant).

| Dimension | Teasing | Pleasing |
|-----------|---------|----------|
| Saying NO | Good at saying NO | Bad at saying NO |
| Initiatives | Prioritise own initiatives | Deprioritise own initiatives |
| Posture | Proactive | Reactive |
| Presence | Seat at the table | Lack a seat at the table |
| Voice | Listened to | Ignored |
| Timing | Involved early | Involved late |
| Headcount | Stakeholders ask to grow the team | Stakeholders question team size |
| Context | Great business understanding | Lack business understanding |

**How it works:**
- Create a survey round (e.g. "Q1 2025")
- Self-rate your team on each dimension
- Generate a share link for XFN partners (Product, Engineering, Finance, etc.)
- XFN partners submit anonymously — you see team name, not individual names
- View averaged XFN scores per dimension
- Track the journey quarter-over-quarter

---

## Quick start (Docker)

```bash
# 1. Copy env file
cp .env.example .env

# 2. Run
docker-compose up

# App        → http://localhost:3001
# API docs   → http://localhost:8001/docs
```

### Using pre-built images from GitHub Container Registry

```yaml
# docker-compose.yml — swap build: for image:
services:
  backend:
    image: ghcr.io/ravinemalipuri/skill-map-backend:latest
  frontend:
    image: ghcr.io/ravinemalipuri/skill-map-frontend:latest
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, D3.js (radar chart + drag), Vite |
| Backend | FastAPI (Python 3.12), SQLAlchemy async, asyncpg |
| Database | PostgreSQL 16 |
| Deploy | Docker Compose |

---

## Repo structure

```
skill-map/
├── backend/
│   └── app/
│       ├── db.py                      # Async SQLAlchemy engine
│       ├── main.py                    # FastAPI app, router registration
│       ├── models/
│       │   └── perception.py          # Pydantic models for perception
│       └── routes/
│           ├── snapshots.py           # Skill snapshot endpoints
│           ├── share.py               # Share token endpoints
│           ├── skills.py              # Skills list endpoint
│           └── perception.py          # Team perception endpoints
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── RadarChart.tsx         # D3 radar chart with drag
│       │   ├── SliderRow.tsx          # Teasing/Pleasing slider
│       │   └── SummaryBar.tsx         # Averaged XFN score bar
│       └── pages/
│           ├── SkillMapPage.tsx       # My Shape page
│           ├── HistoryPage.tsx        # Growth history
│           ├── PerceptionPage.tsx     # Team Perception (admin)
│           └── RespondPage.tsx        # XFN partner response page
├── db/
│   ├── schema.sql                     # Skill map tables
│   ├── seed_skills.sql                # Default 12 skills
│   ├── perception_schema.sql          # Perception tables + view
│   └── seed_perception.sql            # 8 perception dimensions
├── docker-compose.yml
└── .env.example
```

---

Part of the [data-leadership-tools](../README.md) collection.

