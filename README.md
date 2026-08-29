# LandSync – Integrated Land Intelligence Platform

**Smart India Hackathon 2026 – Problem Statement SIH26014**  
*An Integrated GIS-based Digital Public Infrastructure for Land Governance*

**Tagline**: *One Parcel. One Connected View. Complete Trust.*

---

## Phase 1: Project Foundation

This repository contains the complete Phase 1 foundation for the LandSync platform:
1. Full backend architecture using Python FastAPI, SQLAlchemy, and SQLite (zero-cost local execution).
2. JWT-based authentication with Bcrypt password hashing.
3. Role-Based Access Control (RBAC) with three distinct roles: `Citizen`, `Land Officer`, and `System Admin`.
4. Automated database table creation and demo user seeding on startup.
5. Modern, responsive Government Technology React frontend with Tailwind CSS and React Router.
6. Centralized Axios client with automatic JWT token injection and 401 error interceptors.

---

## Demo Credentials (Pre-seeded in Phase 1)

| Stakeholder Role | Email Address | Password | Landing Route |
| :--- | :--- | :--- | :--- |
| **Citizen (Land Owner)** | `citizen@landsync.demo` | `Citizen@123` | `/citizen/dashboard` |
| **Land Revenue Officer** | `officer@landsync.demo` | `Officer@123` | `/officer/dashboard` |
| **System Administrator** | `admin@landsync.demo` | `Admin@123` | `/admin/dashboard` |

---

## Project Structure

```
landsync/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Sidebar, Topbar, DashboardLayout
│   │   │   ├── common/       # StatCard, DataTable, LoadingSpinner, ErrorMessage
│   │   │   └── auth/         # ProtectedRoute, RoleProtectedRoute, LogoutButton
│   │   ├── pages/
│   │   │   ├── auth/         # LoginPage, RegisterPage, UnauthorizedPage
│   │   │   ├── citizen/      # CitizenDashboard, CitizenLandRecords, CitizenApplications
│   │   │   ├── officer/      # OfficerDashboard, OfficerVerificationCases
│   │   │   └── admin/        # AdminDashboard, AdminUsers, AdminSystemOverview
│   │   ├── services/         # api.ts (Axios + JWT interceptor)
│   │   ├── context/          # AuthContext.tsx
│   │   ├── types/            # index.ts (TypeScript data models)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/              # auth.py, users.py, dashboard.py
│   │   ├── models/           # user.py
│   │   ├── schemas/          # auth.py, user.py
│   │   ├── services/         # auth_service.py
│   │   ├── core/             # config.py, security.py
│   │   ├── database/         # database.py, seed.py
│   │   └── main.py           # FastAPI entry point & lifespan
│   ├── requirements.txt
│   └── .env.example
│
├── README.md
├── PROJECT_ARCHITECTURE.md
└── server.ts
```

---

## How to Run Locally

### 1. Backend (FastAPI + SQLite)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

---

### 2. Frontend (React + Vite)

```bash
# In the project root or frontend/
npm install
npm run dev
```
Open browser at: `http://localhost:3000` (or `http://localhost:5173`)

---

## API Endpoints List

### Authentication
- `POST /api/auth/register` – Register new citizen or officer account
- `POST /api/auth/login` – Authenticate with email & password, returns JWT token
- `GET /api/auth/me` – Retrieve currently logged in user profile

### Users Management
- `GET /api/users` – List all users (Officers & Admins only)
- `GET /api/users/{id}` – Get user by ID (Self or Officer/Admin)
- `PUT /api/users/{id}` – Update user profile / status (Self or Admin)

### Role Dashboards
- `GET /api/dashboard/citizen` – Citizen parcels, mutations, and activity trail
- `GET /api/dashboard/officer` – Officer inspection queue & high-priority cases
- `GET /api/dashboard/admin` – System stats, department integration health, audit logs

### System
- `GET /` – Project metadata & API identity
- `GET /health` – Container health probe
