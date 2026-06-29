# Barnabas Dental

Dental clinic management system — Django REST API and React (Vite) frontend.

## Project layout

```
FDeployment/          ← repo root (dito ka magsisimula sa terminal)
├── backend/          ← Django API
└── frontend/         ← React app (Vite)
```

| Component | Folder |
|-----------|--------|
| Backend (Django) | [`backend/`](backend/) |
| Frontend (React) | [`frontend/`](frontend/) |

---

## Terminal guide — saan mag-`cd`

Palaging buksan ang terminal sa **repo root** muna, o gamitin ang buong path sa ibaba.

**Repo root (full path):**
```
d:\barnabas-dental-system\FDeployment
```

### Backend (Django)

```powershell
# Option 1 — mula sa kahit saan
cd d:\barnabas-dental-system\FDeployment\backend

# Option 2 — kung nasa repo root ka na
cd backend
```

Importanteng files sa `backend/`:

| File / folder | Purpose |
|---------------|---------|
| `manage.py` | Django commands (migrate, runserver, etc.) |
| `.env` | Local config (copy from `.env.example`) |
| `.venv/` | Python virtual environment |
| `requirements.txt` | Python dependencies |

Common commands (dapat nasa `backend/` folder ka):

```powershell
.\.venv\Scripts\Activate.ps1          # i-activate ang venv
python manage.py runserver            # start API → http://127.0.0.1:8000
python manage.py migrate              # database migrations
python manage.py createsuperuser      # gumawa ng admin account
```

### Frontend (React + Vite)

```powershell
# Option 1 — mula sa kahit saan
cd d:\barnabas-dental-system\FDeployment\frontend

# Option 2 — kung nasa repo root ka na
cd frontend
```

Importanteng files sa `frontend/`:

| File / folder | Purpose |
|---------------|---------|
| `package.json` | npm scripts at dependencies |
| `.env` | Optional; local dev uses Vite proxy (hindi kailangan ng `VITE_API_URL`) |
| `src/` | React source code |
| `node_modules/` | Installed packages (auto after `npm install`) |

Common commands (dapat nasa `frontend/` folder ka):

```powershell
npm install        # first time lang (o pag may bagong dependency)
npm run dev        # start dev server → http://localhost:5173
npm run build      # production build
```

### Dalawang terminal — local dev

**Terminal 1 (backend):**
```powershell
cd d:\barnabas-dental-system\FDeployment\backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```

**Terminal 2 (frontend):**
```powershell
cd d:\barnabas-dental-system\FDeployment\frontend
npm run dev
```

Buksan sa browser: **http://localhost:5173** (frontend proxy ang `/api` papunta sa backend port 8000).

---

## Getting started

1. Copy `backend/.env.example` → `backend/.env` at i-set ang PostgreSQL credentials.
2. Copy `frontend/.env.example` → `frontend/.env` (optional for local dev).
3. Backend: `pip install -r requirements.txt` sa venv, then `python manage.py migrate`.
4. Frontend: `npm install`.

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for Render, Vercel, Aiven, and production deploy.

## Automated backups (REQ024)

Production PostgreSQL runs on **Aiven**. Daily automated backups are configured in the **Aiven console** (Backups tab on the database service) — not in this application. See [DEPLOYMENT.md — Automated backups via Aiven PostgreSQL](DEPLOYMENT.md#automated-backups-via-aiven-postgresql-req024).

## Authentication note (REQ003)

Patient and staff login use the JWT token endpoint (`POST /api/users/token/`). The `email` field accepts **either email address or username** for convenience. Email remains the primary identifier for registration and password reset.
