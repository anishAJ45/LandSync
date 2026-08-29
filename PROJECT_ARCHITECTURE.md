# LandSync Architecture Documentation (Phase 1: Project Foundation)

**Smart India Hackathon 2026 – Problem Statement SIH26014**  
*An Integrated GIS-based Digital Public Infrastructure for Land Governance*

**Tagline**: *One Parcel. One Connected View. Complete Trust.*

---

## 1. Executive Overview

LandSync is an integrated Digital Public Infrastructure (DPI) designed to resolve fragmentation in India's land administration systems. Phase 1 establishes the rock-solid foundational architecture, featuring a modular Python FastAPI backend, SQLite database layer (designed for straightforward future migration to PostgreSQL + PostGIS), Bcrypt password hashing, JWT-based Role-Based Access Control (RBAC), pre-seeded demo accounts, and a government-grade React frontend.

---

## 2. System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                        LANDSYNC CLIENT (React + Vite)                  |
|                                                                         |
|  [ Landing Page ]     [ 1-Click Login / Register ]     [ Unauthorized ] |
|         |                           |                         |         |
|         v                           v                         v         |
|  +---------------+       +---------------------+   +-----------------+  |
|  | Citizen View  |       | Land Officer Console|   | Admin Dashboard |  |
|  +---------------+       +---------------------+   +-----------------+  |
|         |                           |                         |         |
|         +---------------------------+-------------------------+         |
|                                     | (JWT Bearer Auth Interceptor)     |
+-------------------------------------|-----------------------------------+
                                      |
                                      v (HTTP / REST API)
+-------------------------------------------------------------------------+
|                    FASTAPI APPLICATION BACKEND                          |
|                                                                         |
|  [ API Router Layer ]                                                   |
|    ├── /api/auth       (POST /register, POST /login, GET /me)           |
|    ├── /api/users      (GET /users, GET /users/{id}, PUT /users/{id})   |
|    ├── /api/dashboard  (GET /citizen, GET /officer, GET /admin)         |
|    └── /health & /     (System metadata & container health)             |
|                                                                         |
|  [ Security & Authorization Layer ]                                     |
|    ├── JWT HS256 Token Encoding / Decoding                             |
|    ├── Bcrypt Password Hashing Service                                  |
|    └── get_current_user & require_role Dependency Injections           |
|                                                                         |
|  [ ORM & Data Layer ]                                                   |
|    ├── SQLAlchemy SessionLocal Engine                                   |
|    ├── User Model (id, full_name, email, password_hash, role, ...)      |
|    └── Seed Logic (Auto-provisions demo Citizen, Officer, Admin)        |
+-------------------------------------|-----------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------+
|                    ZERO-COST LOCAL DATABASE                             |
|                                                                         |
|  SQLite (Phase 1) ───[ Future Migration Ready ]───> PostgreSQL + PostGIS|
+-------------------------------------------------------------------------+
```

---

## 3. Database Schema

### `users` Table

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Autoincrement | Unique internal user ID |
| `full_name` | `VARCHAR(255)` | NOT NULL | User's legal full name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE, Indexed | Login email address |
| `password_hash`| `VARCHAR(255)` | NOT NULL | Bcrypt salted password hash |
| `role` | `VARCHAR(50)` | NOT NULL, Default: 'citizen'| One of: `citizen`, `officer`, `admin` |
| `is_active` | `BOOLEAN` | NOT NULL, Default: TRUE | Account operational status |
| `created_at` | `DATETIME` | NOT NULL, Default: UTC NOW | Timestamp of account registration |
| `updated_at` | `DATETIME` | NOT NULL, Default: UTC NOW | Timestamp of last profile update |

---

## 4. Role-Based Access Control Matrix

| Endpoint | HTTP Method | Citizen | Land Officer | System Admin |
| :--- | :---: | :---: | :---: | :---: |
| `POST /api/auth/register` | POST | Permitted | Permitted | Permitted |
| `POST /api/auth/login` | POST | Permitted | Permitted | Permitted |
| `GET /api/auth/me` | GET | Self Profile | Self Profile | Self Profile |
| `GET /api/users` | GET | **Forbidden (403)** | Allowed | Allowed |
| `GET /api/users/{id}` | GET | Self Only | Allowed | Allowed |
| `PUT /api/users/{id}` | PUT | Self (Name/Email) | Self (Name/Email) | Full Control |
| `GET /api/dashboard/citizen` | GET | Allowed | **Forbidden (403)** | Allowed |
| `GET /api/dashboard/officer` | GET | **Forbidden (403)** | Allowed | Allowed |
| `GET /api/dashboard/admin` | GET | **Forbidden (403)** | **Forbidden (403)** | Allowed |
| `GET /health` | GET | Public | Public | Public |

---

## 5. Seed Demo Accounts

1. **Citizen**:
   - **Email**: `citizen@landsync.demo`
   - **Password**: `Citizen@123`
   - **Role**: `citizen`
2. **Land Officer**:
   - **Email**: `officer@landsync.demo`
   - **Password**: `Officer@123`
   - **Role**: `officer`
3. **System Admin**:
   - **Email**: `admin@landsync.demo`
   - **Password**: `Admin@123`
   - **Role**: `admin`

---

## 6. Phase 2 Roadmap & Extension Points

- **PostGIS Extension**: Replace SQLite engine string with `postgresql+asyncpg://...` and add `geoalchemy2` geometry column `geometry(Polygon, 4326)` on `parcels`.
- **OCR Engine**: Add Tesseract / Google Document AI pipeline for vernacular patta document parsing.
- **Land DNA Engine**: Build chronological hash-chain temporal timeline of land transactions.
