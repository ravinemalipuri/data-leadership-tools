# Prioritization Board

A lightweight tool for data platform teams to surface, vote on, and collectively prioritize projects and tech debt — before roadmap planning season, not after.

---

## The problem it solves

Roadmaps are usually built top-down. By the time ICs get to weigh in, priorities are already set. The result: tech debt stays invisible, high-impact small projects never get scheduled, and team buy-in is low because nobody asked.

This tool flips that. Anyone on the team — developer, manager, or leader — can submit an idea and see what others think about it before it ever reaches a planning meeting.

---

## How it works

- Anyone submits an idea with a title, description, and size (S / M / L / XL)
- Others vote thumbs up or down, and can leave a comment
- Votes are visible by role (Developer / Manager / Leader) and team — not by name
- Admin can archive old or completed ideas to keep the board clean
- Results give leadership a real signal on what the team actually wants prioritized

---

## Running locally

```bash
# 1. Copy and configure roles
cp config/roles.json.example config/roles.json
# Edit roles.json with your teams and roles

# 2. Start everything
docker-compose up

# Frontend → http://localhost:3000
# Backend API → http://localhost:8000
# API docs → http://localhost:8000/docs
```

That's it. No cloud account needed for local use.

---

## Deploying to Azure

```bash
# Login and set subscription
az login
az account set --subscription "your-subscription-id"

# Create resource group
az group create --name rg-priboard-dev --location australiaeast

# Deploy infrastructure
az deployment group create \
  --resource-group rg-priboard-dev \
  --template-file infra/main.bicep \
  --parameters @infra/parameters.json
```

Deploys to Azure Container Apps + Azure Database for PostgreSQL (Flexible Server).

---

## Roles and teams configuration

Edit `config/roles.json` to match your organisation:

```json
{
  "roles": ["Developer", "Manager", "Leader"],
  "teams": ["Data Engineering", "Analytics", "Platform", "Business"],
  "admin_users": ["your-admin-name"]
}
```

In larger organisations this can be replaced with an SSO/Outlook integration — the backend reads from `roles.json` by default, but the structure is designed to swap in an identity provider.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript |
| Backend | FastAPI (Python) |
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
│   │   ├── models/          # Pydantic request/response models
│   │   └── routes/          # ideas, votes, admin endpoints
│   └── requirements.txt
├── frontend/
│   └── src/                 # React app
├── db/
│   └── schema.sql           # PostgreSQL schema + views
├── config/
│   └── roles.json.example   # Roles and teams config template
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
