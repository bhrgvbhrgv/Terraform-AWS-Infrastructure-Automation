# CloudOps Command Center

[![CloudOps CI](https://github.com/bhargav/cloudops-command-center/actions/workflows/ci.yml/badge.svg)](https://github.com/bhargav/cloudops-command-center/actions)

A production-ready Cloud Operations and Infrastructure Dashboard engineered to provide real-time operational visibility into an AWS cloud environment. It unifies EC2 fleet inventory, CloudWatch metrics, operational alarms, and live log streams into an intuitive, high-performance console.

---

## Architecture Overview

```text
                     DevOps Engineer / Browser
                                |
                              HTTPS
                                |
                        Nginx Reverse Proxy
                         /             \
                        /               \
                React Frontend      /api/v1/* routes
                 (TypeScript)             |
                                     Express API (Node.js)
                                          |
                 +------------------------+----------------------+
                 |                        |                      |
            Auth Module           CloudOps Provider         Audit Module
                 |                        |                      |
            PostgreSQL               CloudProvider               |
                 |                     Interface                 |
          Users & Preferences       /             \              |
                                   /               \             |
                        Demo Provider          AWS Provider      |
                     (Deterministic Mocks)   (AWS SDK v3 Read)   |
                                                     |
                                            AWS Account Services
                                            - EC2 Inventory
                                            - CloudWatch Metrics
                                            - CloudWatch Alarms
                                            - CloudWatch Logs
```

---

## Key Features

- **Unified Operations Console**: Real-time fleet health status (`HEALTHY`, `DEGRADED`, `CRITICAL`), reachability checks, and state distribution.
- **Pluggable Cloud Provider Layer**: Zero AWS credential dependencies for local demo and automated testing, with seamless switching to live AWS SDK v3.
- **Searchable EC2 Fleet Inventory**: Filter instances by state (`running`, `stopped`, `pending`), search by tags or IP addresses, and inspect CPU and network telemetry drawers.
- **CloudWatch Alarms & Monitoring**: Real-time status reporting (`OK`, `ALARM`, `INSUFFICIENT_DATA`), evaluation periods, and metric thresholds.
- **Bounded Log Streaming**: Stream and filter CloudWatch logs from pre-configured log groups with client-side keyword filtering.
- **Security & Least-Privilege Architecture**: Read-only server-side AWS access, bcrypt password hashing, JWT authentication, rate limiting, and structured Pino logging.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | Single Page Application (SPA) |
| **Styling** | Tailwind CSS | Dark-themed, high-contrast operations UI |
| **Icons & Charts** | Lucide React, Recharts | Telemetry charts & operational icons |
| **State Management** | TanStack Query (React Query) | Server caching, polling & refetching |
| **Backend API** | Node.js, Express, TypeScript | Modular REST API under `/api/v1` |
| **Validation** | Zod | Runtime validation for env and requests |
| **Database & ORM** | PostgreSQL, Prisma ORM | Users, preferences & audit logs |
| **Authentication** | JWT, bcryptjs | Stateless session security & password hashing |
| **Cloud Integration** | AWS SDK for JavaScript v3 | Server-side read-only EC2 & CloudWatch APIs |
| **Containers & Proxy** | Docker, Docker Compose, Nginx | Multi-stage builds & reverse proxy |
| **Testing** | Vitest, Supertest, RTL | Unit, integration & UI test suites |
| **CI/CD** | GitHub Actions | Automated checks, linting & builds |

---

## Quickstart (Local Docker Compose)

The recommended way to run the full application locally:

```bash
# 1. Setup environment file
cp .env.example .env

# 2. Build and start all services
docker compose up --build
```

### Access URLs:
- **Frontend Console**: [http://localhost:3000](http://localhost:3000) or [http://localhost:80](http://localhost:80)
- **Backend API Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

### Default Demo Credentials:
- **Email**: `admin@cloudops.internal`
- **Password**: `Password123!`

---

## Local Development (Without Docker)

You can also run backend and frontend independently on your host machine:

### 1. Backend Service
```bash
cd backend
npm install
npm run dev
```
API runs on `http://localhost:4000`.

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Development server runs on `http://localhost:5173`.

---

## Testing & Quality Gates

Run all backend and frontend unit and integration tests:

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

Build production artifacts:

```bash
# Build backend TypeScript
cd backend && npm run build

# Build frontend bundle
cd frontend && npm run build
```

---

## Documentation & Learning Resources

- **[STUDY_GUIDE.md](file:///STUDY_GUIDE.md)**: Deep dive into the system architecture, request lifecycles, AWS services, and DevOps interview Q&As.
- **[docs/architecture.md](file:///docs/architecture.md)**: System design and provider pattern breakdown.
- **[docs/aws-iam-policy.md](file:///docs/aws-iam-policy.md)**: Least-privilege IAM policy reference for live AWS integration.
- **[docs/api.md](file:///docs/api.md)**: Complete REST API endpoint reference.
- **[docs/deployment.md](file:///docs/deployment.md)**: Production deployment guide with Docker and Nginx.
