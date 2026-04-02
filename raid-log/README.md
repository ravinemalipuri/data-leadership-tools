# RAID Log — Data Leadership Tools

> **Status: v1.0 — Workable & Production-Ready**

A full-stack RAID Log management tool built for Technical Program Managers and Data Architects. Tracks **Risks, Assumptions, Issues, and Dependencies** across enterprise data programmes (Data Mesh, MDM, SAP/Salesforce integrations, and more).

---

## Features

- **RAID entry management** — Create, update, and delete R/A/I/D entries with auto-generated sequential IDs (R1, A2, I3, D4...)
- **Risk scoring matrix** — Interactive Impact × Likelihood grid with automatic Priority assignment
- **Smart dashboard** — Filter by Type, Status, Priority, Urgency, Project, Owner, and Risk Level
- **Risk level filter** — Click the matrix legend to filter the table by Tolerable / Moderate / Substantial / Intolerable
- **Sortable columns** — Priority, Urgency, Due Date
- **Excel import / export** — Bulk load or extract entries via `.xlsx`
- **Dark / Light mode** — Persisted per browser
- **Status support** — Open, In Progress, Blocked, Deferred, Deferred (Future), Resolved, Closed
- **Overdue highlighting** — Automatically flags past-due open entries

---
## Sample Screens

RAID Dashboard

<img width="1711" height="894" alt="image" src="https://github.com/user-attachments/assets/2505cbd2-0b30-4e6e-b812-e457b74ce179" />

RAID Registraiton
<img width="836" height="758" alt="image" src="https://github.com/user-attachments/assets/61a1d577-5b08-4e04-9612-b0aeda552d63" />


## Quick Start — Docker (Recommended)

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# Clone the repo
git clone https://github.com/ravinemalipuri/data-leadership-tools.git
cd data-leadership-tools/raid-log

# Start all services (PostgreSQL + FastAPI backend + React frontend)
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| App (UI) | http://localhost:3000      |
| API docs | http://localhost:8000/docs |
| Database | localhost:5432             |

To stop:
```bash
docker compose down
```

To wipe data and start fresh:
```bash
docker compose down -v
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Browser  →  React + Vite (nginx :3000)         │
│              ↓ /api/*                           │
│  Backend  →  FastAPI + SQLAlchemy (:8000)       │
│              ↓                                  │
│  Database →  PostgreSQL 15 — schema: PM         │
│              table: PM.raid_entries             │
└─────────────────────────────────────────────────┘
```

**Stack:**
- Frontend: React 18, TypeScript, Vite, React Router, SheetJS (xlsx)
- Backend: FastAPI, SQLAlchemy (async), asyncpg, Pydantic v2
- Database: PostgreSQL 15 — database `proj-tech-debt`, schema `PM`

---

## Manual Setup (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15 running locally

### 1. Database

```sql
CREATE DATABASE "proj-tech-debt";
```

The backend auto-creates the `PM` schema and `raid_entries` table on first run.

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Optional: override database URL
export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost/proj-tech-debt

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API available at http://localhost:8000  
Swagger docs at http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at http://localhost:3002

---

## Seeding Sample Data

A ready-made seed script loads 70 entries (20 Risks, 15 Assumptions, 20 Issues, 15 Dependencies) for a **Customer360 Data Mesh & Reltio MDM** programme across SAP, Salesforce, and local system integrations.

```bash
cd backend
python seed_customer360.py
```

---

## API Reference

| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| GET    | `/api/raids/`        | List all entries (filterable) |
| POST   | `/api/raids/`        | Create new entry         |
| GET    | `/api/raids/{id}`    | Get single entry         |
| PUT    | `/api/raids/{id}`    | Update entry             |
| DELETE | `/api/raids/{id}`    | Delete entry             |
| GET    | `/health`            | Health check             |

### Query Parameters (GET /api/raids/)
- `type` — R, A, I, D
- `status` — Open, In Progress, Blocked, Deferred, Deferred (Future), Resolved, Closed
- `priority` — High, Medium, Low
- `urgency` — High, Medium, Low

---

## Risk Scoring

Risk entries (type = R) use a **4×4 Impact × Likelihood matrix**:

| Score | Level        | Priority |
|-------|--------------|----------|
| 13–16 | Intolerable  | High     |
| 9–12  | Substantial  | High     |
| 5–8   | Moderate     | Medium   |
| 1–4   | Tolerable    | Low      |

Selecting a cell in the form automatically sets Priority and Urgency.

---

## Environment Variables

| Variable       | Default                                                    | Description              |
|----------------|------------------------------------------------------------|--------------------------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres@localhost/proj-tech-debt`   | PostgreSQL connection string |

---

## Roadmap

- [ ] Authentication & multi-user support
- [ ] Email / Slack notifications for overdue items
- [ ] PDF export (executive summary)
- [ ] Audit log / change history
- [ ] Programme-level rollup view

---

## Part of Data Leadership Tools

This tool is part of the [`data-leadership-tools`](https://github.com/ravinemalipuri/data-leadership-tools) suite — a collection of open-source tools for Data Architects and Technical Programme Managers.

---

*Built by [Ravine Malipuri](https://github.com/ravinemalipuri) — Data Architect & TPM*
