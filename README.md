# CloudOps Status Dashboard

A modern, responsive web application built for a DevOps portfolio demonstration focused on AWS VPC design, Terraform infrastructure automation, and multi-tier service monitoring.

The dashboard displays the health and availability of fictional infrastructure components (Web Frontend, REST API, Database, Background Worker), supports real-time status updates, and records historic status changes in PostgreSQL.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:**
  - React 18 with Vite (Pure JavaScript, no TypeScript)
  - Semantic HTML5, accessible labels, responsive DevOps dark-theme UI
  - Loading, empty, and error state handling
  - Vitest + React Testing Library for frontend component and integration tests
- **Backend:**
  - Node.js & Express REST API
  - Raw parameterized SQL queries via `pg` (no ORM)
  - Input validation, CORS configuration, centralized error handling
  - Jest + Supertest for API endpoint testing
- **Database:**
  - PostgreSQL schema with relational tables (`services`, `status_history`)
  - Foreign keys, cascaded deletions, and indexed query optimizations
  - Seed initialization script avoiding duplicate inserts

---

## 📂 Project Structure

```text
.
├── .env.example
├── MASTER.md
├── README.md
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   │   └── serviceController.js
│   │   ├── db/
│   │   │   ├── index.js
│   │   │   ├── init.js
│   │   │   └── schema.sql
│   │   ├── routes/
│   │   │   └── services.js
│   │   └── services/
│   │       └── serviceService.js
│   └── tests/
│       └── services.test.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── components/
        │   ├── ServiceCard.jsx
        │   ├── ServiceDetailModal.jsx
        │   ├── StatusBadge.jsx
        │   └── SummaryCards.jsx
        ├── pages/
        │   └── Dashboard.jsx
        ├── services/
        │   └── api.js
        └── tests/
            ├── Dashboard.test.jsx
            └── setup.js
```

---

## ⚙️ Environment Variables

Copy `.env.example` to create your local backend configuration:

```bash
cp .env.example backend/.env
```

### Environment Keys

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DB_HOST` | PostgreSQL hostname | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | PostgreSQL database name | `cloudops_status` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

For the frontend, you can optionally configure `frontend/.env`:
```bash
VITE_API_URL=http://localhost:5000/api
```
*(By default, Vite proxies `/api` requests to `http://localhost:5000`)*.

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js**: v18+ (tested on v24)
- **PostgreSQL**: v14+ (tested on v18)

### 1. Database Setup
Create the PostgreSQL database:
```bash
createdb cloudops_status -U postgres
# Or via psql:
# CREATE DATABASE cloudops_status;
```

Run schema initialization and seed default fictional services:
```bash
cd backend
npm run db:init
```

### 2. Backend Setup & Run
From the `backend/` directory:
```bash
# Install dependencies
npm install

# Start in development mode (with hot-reload)
npm run dev

# Or start in standard mode
npm start
```
The backend will be available at `http://localhost:5000`.
- Health check: `http://localhost:5000/api/health`
- Services list: `http://localhost:5000/api/services`

### 3. Frontend Setup & Run
Open a new terminal window and navigate to `frontend/`:
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend dashboard will be available at `http://localhost:5173`.

---

## 🧪 Running Tests

### Backend Tests
Uses **Jest** and **Supertest** with mocked database queries to verify all API routes, edge cases, input validation, and HTTP status codes:
```bash
cd backend
npm test
```

### Frontend Tests
Uses **Vitest** and **React Testing Library** to verify dashboard rendering, summary cards, loading states, error banners, and modal status updates:
```bash
cd frontend
npm test
```

### Frontend Production Build
To verify production bundle compilation:
```bash
cd frontend
npm run build
```

---

## 🌐 API Specification

### `GET /api/health`
Application health check (does not require database access).
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-10-28T01:30:00.000Z",
  "uptime": 12.34,
  "service": "cloudops-status-api"
}
```

### `GET /api/services`
Retrieves all monitored services and their current status.
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Web Frontend",
      "description": "User-facing Single Page Application...",
      "status": "operational",
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

### `GET /api/services/:id`
Retrieves a specific service along with its recent 50 status history transitions.
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Web Frontend",
    "description": "...",
    "status": "operational",
    "history": [
      {
        "id": 1,
        "service_id": 1,
        "status": "operational",
        "changed_at": "..."
      }
    ]
  }
}
```

### `PATCH /api/services/:id/status`
Updates service status and appends a transition record to `status_history`.
- **Request Body**:
```json
{
  "status": "degraded"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Status updated successfully to degraded.",
  "data": { ... }
}
```
- **Validation**: Accepts only `'operational'`, `'degraded'`, or `'offline'`.

