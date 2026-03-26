# Data & Analytics Prioritization Board

A lightweight tool for data platform teams to surface, vote on, and collectively prioritize projects and tech debt — before roadmap planning season, not after.

---

## Screenshots

### Board

![Board](docs/screenshots/board.png)

### Submit Idea

![Submit Idea](docs/screenshots/submit-idea.png)

### Previous Quarters

![Previous Quarters](docs/screenshots/previous-quarters.png)

---

## The problem it solves

Roadmaps are usually built top-down. By the time ICs get to weigh in, priorities are already set. The result: tech debt stays invisible, high-impact small projects never get scheduled, and team buy-in is low because nobody asked.

This tool flips that. Anyone on the team — developer, manager, or leader — can submit an idea and see what others think about it before it ever reaches a planning meeting.

---

## Features

- Submit ideas with title, description, size (S / M / L / XL), and category
- Vote thumbs up or down with an optional comment
- Vote breakdown visible by role (Developer / Manager / Leader) — never by name
- Sort the board by votes, net score, team, or size
- Filter by team
- Planning flag (Y/N) — Leaders and admins can mark ideas for upcoming planning
- Previous Quarters page showing delivered, carried-over, and cancelled items
- Admin panel for archiving and restoring ideas
- Dark mode toggle
- Fully configurable roles, teams, and admin users via `config/roles.json`

---

## Quick start with Docker

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# 1. Clone the repo
git clone <repo-url>
cd prioritization-board

# 2. Copy config and set your teams/roles/admins
cp config/roles.json.example config/roles.json
# Edit config/roles.json — see "Configuration" below

# 3. (Optional) Add your logo — see "Adding your logo" below

# 4. Start everything
docker-compose up --build

# Frontend  → http://localhost:3000
# API docs  → http://localhost:8000/docs
```

To run with a custom DB password:

```bash
DB_PASSWORD=mysecretpw docker-compose up --build
```

To stop and remove containers:

```bash
docker-compose down
```

To wipe the database and start fresh:

```bash
docker-compose down -v
```

---

## Adding your logo

Place your logo file at:

```
frontend/public/Logo.jpg
```

It will appear in the top-left of the navigation bar. Any common image format works — rename it to `Logo.jpg` or update the `src` in `frontend/src/App.tsx` line 42 to match your filename.

If no logo file is present, the nav bar displays cleanly without it.

---

## Configuration

Edit `config/roles.json` to match your organisation:

```json
{
  "roles": ["Developer", "Manager", "Leader"],
  "teams": [
    "Data Engineering",
    "Data Analytics",
    "Data Architecture",
    "Business Intelligence",
    "Platform Engineering",
    "Business"
  ],
  "admin_users": ["Your Name Here"]
}
```

- **roles** — available roles in the identity modal
- **teams** — available teams in the identity modal and team filter
- **admin_users** — display names (must match exactly) that get admin and planning-flag access

---

## Running locally without Docker

**Prerequisites:** Python 3.11+, Node.js 18+, PostgreSQL

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL in your environment or edit backend/app/database.py
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Apply the schema to your database:

```bash
psql -U postgres -d your_database -f db/schema.sql
```

Load sample data (optional):

```bash
psql -U postgres -d your_database -f db/seed_test_data.sql
```

---

## Deploying to Azure

```bash
az login
az account set --subscription "your-subscription-id"

az group create --name rg-priboard-dev --location australiaeast

az deployment group create \
  --resource-group rg-priboard-dev \
  --template-file infra/main.bicep \
  --parameters @infra/parameters.json
```

Deploys to Azure Container Apps + Azure Database for PostgreSQL (Flexible Server).

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL 16 |
| Local deployment | Docker Compose |
| Azure deployment | Azure Container Apps + Azure Database for PostgreSQL |
| Infrastructure as code | Bicep |

---

## What's in this repo

```
prioritization-board/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── database.py      # Async SQLAlchemy connection
│   │   ├── models/          # Pydantic request/response models
│   │   └── routes/          # ideas, votes, admin, config endpoints
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── Logo.jpg         # ← place your logo here
│   ├── src/
│   │   ├── pages/           # Board, SubmitIdea, IdeaDetail, Admin, PreviousQuarters
│   │   ├── components/      # IdentityModal, SizeBadge, VoteButtons, IdeaCard
│   │   ├── api/client.ts    # Typed API wrapper
│   │   └── types.ts         # Shared TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
├── db/
│   ├── schema.sql           # PostgreSQL schema + views
│   ├── seed_test_data.sql   # Realistic sample data (15 ideas, ~279 votes)
│   └── migrations/          # Incremental migration scripts
├── config/
│   ├── roles.json           # Your org's roles, teams, admin users
│   └── roles.json.example   # Template
├── docs/
│   └── screenshots/         # UI screenshots used in this README
├── infra/
│   ├── main.bicep           # Azure infrastructure
│   └── parameters.json      # Deployment parameters template
└── docker-compose.yml
```
Tech Debt & Ideas Board:
<img width="1772" height="896" alt="image" src="https://github.com/user-attachments/assets/5ecbe55f-662b-4062-b36d-cca18fbdc911" />
Prioritized work & Status
<img width="1603" height="862" alt="image" src="https://github.com/user-attachments/assets/a83857e0-dce7-4c64-a80f-e6de580dd9ea" />
Idea Submission Page 
<img width="694" height="876" alt="image" src="https://github.com/user-attachments/assets/4278ce9c-8f56-478b-8ed0-18291dc4b660" />





Part of the [data-leadership-tools](../README.md) collection.
