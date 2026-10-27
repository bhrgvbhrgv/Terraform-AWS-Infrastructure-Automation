# AI Application Build Specification
## Project: CloudOps Status Dashboard

### 1. Project Goal
Build a small, professional web application that can be deployed as part of a DevOps portfolio project focused on AWS VPC design and Terraform infrastructure automation.

The application should provide a simple dashboard showing the health and availability of a few fictional services. It is a demonstration application—not a real monitoring system and not connected to AWS APIs.

### 2. Responsibility Boundary
**AI should build only the local application code.**

Do not create or modify:
- Terraform files or AWS infrastructure
- Dockerfiles, Docker Compose, or container configuration
- GitHub Actions workflows or other CI/CD pipelines
- Nginx configuration
- Kubernetes manifests
- Shell scripts for infrastructure or deployment
- AWS IAM policies, monitoring configuration, or cloud resources

Those DevOps components will be implemented separately by the project owner.

### 3. Technology Stack
Use:
- Frontend: React with Vite and JavaScript (no TypeScript)
- Backend: Node.js with Express
- Database: PostgreSQL
- Database access: `pg` package with parameterized SQL; no ORM
- API format: REST
- Testing: Vitest and React Testing Library for frontend; Jest and Supertest for backend

Keep the application straightforward and beginner-friendly.

### 4. Application Features

#### Dashboard
Create a dashboard landing page that displays:
- A summary of total services
- Count of services marked operational, degraded, or offline
- A list of service cards
- Each service's name, status, description, and last-updated timestamp
- A simple visual indicator for each status

Use fictional services such as:
- Web Frontend
- REST API
- Database
- Background Worker

#### Service Details
Allow a user to select a service and view:
- Service name
- Status
- Description
- Recent status history
- Last-updated timestamp

#### Status Updates
Provide a simple form to update a service's status to:
- Operational
- Degraded
- Offline

Record each status change in the database with a timestamp.

#### Refresh
Provide a refresh button to fetch the latest data from the backend API.

### 5. Backend API
Implement these REST endpoints:

- `GET /api/health`
  - Returns a basic application health response.
  - This endpoint must not require database access.

- `GET /api/services`
  - Returns all services and their current status.

- `GET /api/services/:id`
  - Returns one service and its recent status history.

- `PATCH /api/services/:id/status`
  - Updates the service status.
  - Validates the requested status.
  - Records the change in the status-history table.

Use appropriate HTTP status codes and return clear error messages.

### 6. Database
Use PostgreSQL with a simple schema.

#### `services`
- `id`
- `name`
- `description`
- `status`
- `created_at`
- `updated_at`

#### `status_history`
- `id`
- `service_id`
- `status`
- `changed_at`

Requirements:
- Use foreign keys.
- Use parameterized SQL for all queries.
- Include a seed script or initialization logic to insert the fictional services.
- Avoid inserting duplicate seed records on repeated initialization.

### 7. Frontend Requirements
- Clean, responsive layout suitable for desktop and mobile.
- Professional DevOps/cloud dashboard style.
- Use accessible labels and semantic HTML.
- Include loading, empty, and error states.
- Show clear confirmation or feedback after a status update.
- Keep components organized and reusable.
- Do not hardcode service data in the frontend; fetch it from the backend.

### 8. Security and Quality
- Validate all backend input.
- Do not expose database credentials in frontend code.
- Read database connection settings from environment variables.
- Include an `.env.example` containing placeholder values only.
- Do not commit actual secrets.
- Use safe error handling; do not return stack traces to users.
- Add tests for core API routes and key UI behavior.

### 9. Suggested Project Structure
```text
cloudops-status-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
││   └── ...
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── db/
│   │   └── ...
│   ├── tests/
│   └── ...
├── .env.example
├── README.md
└── MASTER.md
```

### 10. Deliverables
Create:
1. Complete frontend source code
2. Complete backend source code
3. PostgreSQL schema and seed/init logic
4. `.env.example`
5. Tests for important functionality
6. A README explaining local setup, environment variables, running the app, and running tests

Do not create deployment or infrastructure files.

### 11. Implementation Approach
Build in small, verifiable stages:
1. Scaffold the frontend and backend.
2. Implement the database schema and seed data.
3. Implement and test the API.
4. Connect the frontend to the API.
5. Add loading/error/empty states.
6. Run tests and fix issues.
7. Update the README with accurate commands.

Before finishing, summarize:
- What was implemented
- Files created
- How to run it locally
- Tests executed and their results
- Any known limitations
