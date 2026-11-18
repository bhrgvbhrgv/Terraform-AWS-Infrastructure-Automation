# CloudOps Dashboard — Master Build Instructions

> **Purpose:** Give an AI coding agent a complete, implementation-ready specification for building a production-style CloudOps dashboard. Build the application first, make it run locally, test it, document it, and only then prepare it for cloud deployment.
>
> **Important:** This file is the project specification. Do not deploy real AWS resources, incur cloud costs, or access an AWS account unless the owner explicitly asks and provides the required configuration.

---

## 1. Role and working rules for the AI coding agent

Act as a senior full-stack engineer with strong AWS, CloudOps, DevOps, security, and UX experience.

Build a clean, maintainable, realistic CloudOps dashboard that could be demonstrated in a DevOps/Cloud Engineer interview. The dashboard should help an engineer understand the health of an AWS environment from one place.

Follow these rules:

1. First inspect the existing repository and identify its current structure, framework, conventions, and files. Do not overwrite working code blindly.
2. If the repository is empty, scaffold the project using the architecture in this document.
3. Work in small, logical milestones. At the end of each milestone, run relevant tests/builds and report what changed.
4. Do not claim an AWS integration works unless it has been tested against AWS or clearly label it as a mock/demo integration.
5. The application must run locally without AWS credentials using realistic seeded demo data.
6. Never put AWS credentials, secret keys, database passwords, JWT secrets, or other secrets in frontend code, source control, logs, or committed `.env` files.
7. Use environment variables and provide `.env.example` with placeholders only.
8. Prefer simple, understandable code over unnecessary abstractions or microservices.
9. Add loading, empty, success, and error states to the UI. Handle API failures gracefully.
10. Do not leave core buttons as decorative placeholders. Implement them or clearly mark them as not yet available.
11. Keep README and architecture documentation aligned with the actual implementation.
12. Do not create AWS resources or run commands that can incur charges without explicit approval.

---

## 2. Product vision

### Product name
**CloudOps Command Center**

### Problem
Cloud engineers often need to visit several AWS services to understand whether an environment is healthy. They may need to inspect EC2 instances, CloudWatch metrics, alarms, logs, and recent infrastructure events separately.

### Solution
Build a central web dashboard that presents a clear operational overview of an AWS environment:

- Infrastructure inventory and resource status.
- EC2 instance health and key utilization metrics.
- CloudWatch metrics and alarms.
- Recent operational events and log summaries.
- Service health and environment-level status.
- Search, filtering, and resource detail views.

### Intended users
- DevOps engineers.
- Cloud engineers.
- Site Reliability Engineers (SREs).
- Technical interviewers evaluating a practical CloudOps project.

### Primary design goal
Make the interface look like a polished cloud operations product: clear information hierarchy, professional typography, readable charts, useful status indicators, responsive layouts, and minimal visual clutter.

---

## 3. Scope and delivery strategy

Build the project in three stages.

### Stage A — Local working product (mandatory first milestone)
- Full frontend and backend.
- PostgreSQL database.
- Authentication.
- Dashboard with seeded demo AWS data.
- EC2 inventory and details.
- Metrics charts.
- CloudWatch alarm list.
- Logs/events view.
- Search, filters, pagination, and responsive UI.
- Tests, Docker, Docker Compose, and documentation.

### Stage B — Real AWS integration
- Connect backend to AWS using the AWS SDK for JavaScript v3.
- Read EC2 inventory.
- Read CloudWatch metrics and alarms.
- Read CloudWatch log events from explicitly configured log groups.
- Use least-privilege IAM permissions.
- Keep demo mode available as a fallback.

### Stage C — Cloud deployment and DevOps
- Containerize frontend and backend.
- Build and publish images to Amazon ECR.
- Deploy to AWS EC2 (or another explicitly selected hosting platform).
- Use Nginx as a reverse proxy.
- Configure HTTPS, secrets, logging, health checks, and backups.
- Add CI/CD with GitHub Actions.
- Infrastructure as Code can be a later enhancement; do not make Terraform a prerequisite for the initial local product.

Do not attempt all stages at once. Finish and verify Stage A before beginning Stage B.

---

## 4. Recommended technology stack

Use this stack unless the existing repository already has a sound equivalent.

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React + TypeScript + Vite | Dashboard UI |
| Styling | Tailwind CSS | Responsive design and consistent UI |
| Components | shadcn/ui or accessible reusable components | Forms, cards, dialogs, tables |
| Charts | Recharts | CPU, network, status and trend charts |
| Routing | React Router | Application navigation |
| Server state | TanStack Query | API requests, caching, refetching |
| Backend | Node.js + Express + TypeScript | REST API and business logic |
| Validation | Zod | Validate request bodies, params and environment |
| Database | PostgreSQL | Users, preferences, audit events and optional snapshots |
| ORM | Prisma | Database schema, migrations and queries |
| Authentication | JWT + bcrypt | Login and password hashing |
| AWS integration | AWS SDK for JavaScript v3 | EC2 and CloudWatch read operations |
| Logging | Pino | Structured backend logs |
| Testing | Vitest, Supertest, React Testing Library | Unit, API and UI tests |
| Containers | Docker + Docker Compose | Local and production packaging |
| Reverse proxy | Nginx | Routing and static frontend delivery |
| CI/CD | GitHub Actions | Automated checks and image build/publish |

Use compatible stable versions and commit the lockfile. Avoid adding libraries without a clear need.

---

## 5. High-level architecture

```text
                         Engineer / Browser
                                 |
                              HTTPS
                                 |
                         Nginx (reverse proxy)
                           /             \
                          /               \
                 React Frontend       /api/* routes
                 (TypeScript)              |
                                      Express API
                                           |
                  +------------------------+----------------------+
                  |                        |                      |
             Auth module              CloudOps modules        Audit module
                  |                        |                      |
             PostgreSQL             AWS integration              |
                  |                        |                      |
             Users/settings       AWS SDK v3 (server-side)        |
                                           |
                             +-------------+-------------+
                             |             |             |
                           EC2         CloudWatch       CloudWatch
                         inventory      metrics          alarms/logs
                             |
                         AWS account
```

### Local Docker Compose architecture

```text
Browser
  |
  v
Frontend container (React served by Nginx)
  |
  | /api reverse proxy (or configured API base URL)
  v
Backend container (Express)
  |                         |
  v                         v
PostgreSQL container     Demo data provider
                            |
                       Demo AWS resources

Optional real AWS mode:
Backend container -> AWS SDK -> AWS APIs using an IAM role or local AWS profile
```

### Architecture principles
- The browser must never call AWS APIs directly with long-lived credentials.
- All AWS API calls happen in the backend.
- The backend exposes a normalized API so the frontend does not depend on AWS response shapes.
- A provider/interface separates demo data from real AWS data.
- PostgreSQL stores application data, not a duplicate of every AWS metric datapoint.
- CloudWatch remains the source of truth for AWS metrics, alarms, and logs.
- Use timeouts, pagination, bounded query ranges, and sensible caching for AWS calls.

---

## 6. Repository structure

Use a monorepo with this suggested structure:

```text
cloudops-command-center/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   ├── charts/
│   │   │   └── common/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── overview/
│   │   │   ├── compute/
│   │   │   ├── monitoring/
│   │   │   ├── logs/
│   │   │   └── settings/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── ec2/
│   │   │   ├── cloudwatch/
│   │   │   ├── logs/
│   │   │   └── audit/
│   │   ├── providers/
│   │   │   ├── cloud-provider.ts
│   │   │   ├── demo-provider.ts
│   │   │   └── aws-provider.ts
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── default.conf
├── docs/
│   ├── architecture.md
│   ├── aws-iam-policy.md
│   ├── api.md
│   └── deployment.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── INSTRUCTIONS.md
```

Keep the structure pragmatic. Do not create empty folders just to match the diagram.

---

## 7. Application pages and functionality

### 7.1 Authentication
- Login page with email and password.
- Optional registration or seeded demo account for local use.
- Hash passwords with bcrypt; never store plaintext passwords.
- Use short-lived access tokens and a sensible refresh/session strategy.
- Protect private routes.
- Logout must clear the client session.
- Rate-limit login attempts.
- Validate all input on the backend.
- Do not expose whether a specific email exists in authentication error messages.

Provide a documented local demo account. Its password must be clearly identified as development-only and must not be reused in production.

### 7.2 Overview dashboard
Display:
- Total EC2 instances.
- Running instances.
- Stopped instances.
- Instances in pending/stopping/other states.
- Active CloudWatch alarms.
- Critical alarms.
- Overall environment health summary.
- CPU utilization trend.
- Network in/out trend.
- Recent operational events.
- Last data refresh timestamp.
- AWS account alias/account ID only when available and safe to display.

Use clear status colors and labels, but do not rely on color alone.

### 7.3 Compute / EC2 inventory
Create a searchable and filterable table with:
- Instance ID.
- Name tag.
- Instance type.
- State.
- Availability Zone.
- Private IP.
- Public IP (if present).
- Launch time.
- Monitoring status.

Required interactions:
- Search by instance ID or name.
- Filter by state and Availability Zone.
- Sort columns.
- Paginate results.
- Open an instance detail page or drawer.
- Show a useful empty state when no instances match.

Instance detail view:
- Basic instance metadata.
- CPU utilization chart.
- Network in/out charts.
- Status checks when available.
- Recent related alarms/events where available.

The first release is read-only. Do not add start, stop, reboot, terminate, or resize controls unless a later scope explicitly authorizes them and includes confirmation, authorization, audit logging, and safeguards.

### 7.4 Monitoring / CloudWatch
Show:
- Alarm name.
- Alarm state: OK, ALARM, INSUFFICIENT_DATA.
- Metric name and namespace.
- Threshold and comparison operator.
- Evaluation period.
- Last state change.
- Associated resource/dimensions where available.

Add filters for alarm state and search by alarm name. Provide an alarm detail view with its configuration and metric history where supported.

Metrics to support initially:
- EC2 CPUUtilization.
- NetworkIn.
- NetworkOut.
- StatusCheckFailed.
- StatusCheckFailed_Instance.
- StatusCheckFailed_System.

For every metric, show its unit, selected time range, period, and timestamp. Never invent or silently interpolate missing datapoints. Display gaps honestly.

### 7.5 Logs and events
- List configured CloudWatch log groups in real AWS mode.
- Allow the user to select a configured log group and a bounded time range.
- Display log events with timestamp and message.
- Support basic text search within the fetched result set.
- Include pagination/continuation handling where supported.
- Do not allow arbitrary unbounded log queries.
- Redact or avoid displaying secrets and sensitive values where feasible.
- In demo mode, show clearly labelled sample log events.

### 7.6 Settings
- User profile basics.
- Preferred AWS region.
- Dashboard refresh interval.
- Demo/real integration mode indicator.
- Connection status and last successful AWS sync.
- Do not provide a UI field for storing raw AWS secret access keys.

---

## 8. Backend API design

Use versioned REST routes under `/api/v1`.

Suggested endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Liveness/health response |
| POST | `/api/v1/auth/login` | Authenticate |
| POST | `/api/v1/auth/logout` | Logout/session invalidation if implemented |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/dashboard/summary` | Overview KPI data |
| GET | `/api/v1/dashboard/trends` | Dashboard chart series |
| GET | `/api/v1/ec2/instances` | List/filter instances |
| GET | `/api/v1/ec2/instances/:instanceId` | Instance detail |
| GET | `/api/v1/ec2/instances/:instanceId/metrics` | Instance metrics |
| GET | `/api/v1/cloudwatch/alarms` | List alarms |
| GET | `/api/v1/cloudwatch/alarms/:alarmName` | Alarm detail |
| GET | `/api/v1/logs/groups` | Configured log groups |
| GET | `/api/v1/logs/events` | Events for selected group/time range |
| GET | `/api/v1/settings` | User settings |
| PATCH | `/api/v1/settings` | Update allowed settings |

API requirements:
- Validate query parameters and path parameters.
- Use consistent response envelopes and HTTP status codes.
- Return safe, actionable error messages.
- Add request IDs and structured logs.
- Add pagination and maximum page sizes.
- Enforce authentication on private routes.
- Add authorization checks before accessing account-scoped data.
- Never return raw AWS SDK exceptions or stack traces to clients.

Example response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

Example error:

```json
{
  "error": {
    "code": "AWS_INTEGRATION_UNAVAILABLE",
    "message": "Cloud data is temporarily unavailable.",
    "requestId": "request-id"
  }
}
```

---

## 9. Data model

Keep the database small and purposeful.

Suggested Prisma models:

### User
- `id`
- `email` (unique)
- `passwordHash`
- `createdAt`
- `updatedAt`

### UserPreference
- `id`
- `userId`
- `defaultRegion`
- `refreshIntervalSeconds`
- `createdAt`
- `updatedAt`

### AuditEvent
- `id`
- `userId` (nullable for system events)
- `action`
- `resourceType`
- `resourceId` (nullable)
- `metadata` (JSON, sanitized)
- `createdAt`

Optional later:
- `CloudAccount` for metadata about configured accounts/assumed roles. Never store long-lived AWS secret keys.
- `ResourceSnapshot` for explicitly designed inventory snapshots, with retention limits.

Do not store every CloudWatch datapoint in PostgreSQL. Query CloudWatch for time-series data and cache only when there is a clear performance need.

---

## 10. AWS integration design

### 10.1 Provider abstraction

Define a `CloudProvider` interface for operations such as:
- `getAccountSummary()`
- `listInstances(filters)`
- `getInstance(instanceId)`
- `getInstanceMetrics(instanceId, range, period)`
- `listAlarms(filters)`
- `getAlarm(alarmName)`
- `listConfiguredLogGroups()`
- `getLogEvents(logGroup, range, paginationToken)`

Implement:
- `DemoCloudProvider`: returns realistic deterministic fixtures.
- `AwsCloudProvider`: calls AWS APIs using AWS SDK v3.

The rest of the backend must depend on the interface, not on the concrete AWS SDK implementation.

### 10.2 AWS services
Use:
- Amazon EC2 APIs for instance inventory and metadata.
- Amazon CloudWatch APIs for metrics and alarms.
- Amazon CloudWatch Logs APIs for configured log groups and log events.
- IAM roles/STS role assumption for secure identity and cross-account access if added later.

### 10.3 Authentication to AWS
Preferred order:
1. IAM role attached to the compute environment (for example, EC2 instance profile).
2. IAM Identity Center / AWS profile for local development.
3. Explicit temporary credentials only when required and never committed.

Do not hardcode credentials. Do not put credentials in Vite variables or any `VITE_*` variable. Frontend environment variables are public.

### 10.4 Least-privilege IAM
Create a documented read-only policy scoped as narrowly as practical. Start with only the actions required by implemented features, such as:
- `ec2:DescribeInstances`
- `ec2:DescribeInstanceStatus`
- `cloudwatch:GetMetricData`
- `cloudwatch:ListMetrics` only if actually needed
- `cloudwatch:DescribeAlarms`
- `logs:DescribeLogGroups`
- `logs:FilterLogEvents` or the specific read action used by the implementation
- `sts:GetCallerIdentity`

Restrict log group resources and other resource-level permissions where the AWS service supports it. Some describe/list APIs require `"Resource": "*"`. Explain these exceptions in `docs/aws-iam-policy.md`. Do not grant `AdministratorAccess`, write permissions, or wildcard access without a documented technical reason.

### 10.5 Regions and accounts
- Region must be configurable.
- Show the active region in the UI.
- Do not imply that one region represents every AWS region.
- If multi-account support is added, make the active account explicit and isolate account data carefully.

### 10.6 Cost and API efficiency
- Use a configurable refresh interval with a sensible default (for example, 60 seconds).
- Avoid calling AWS on every component render.
- Cache inventory and alarm responses briefly.
- Bound metric time ranges and datapoint counts.
- Respect AWS pagination and throttling.
- Implement retry with backoff only for retryable errors.
- Show the last refresh time and stale-data state.
- Document that AWS API calls and deployed infrastructure may incur charges.

---

## 11. Security requirements

- Store passwords with bcrypt.
- Use secure HTTP-only cookies for session tokens where practical; otherwise document the chosen token-storage trade-off and mitigate XSS risks.
- Configure CORS narrowly.
- Add Helmet security headers.
- Add authentication and login rate limits.
- Validate and sanitize user input.
- Use parameterized database queries through Prisma.
- Keep secrets in environment variables or a managed secrets service.
- Do not log passwords, tokens, authorization headers, or AWS credentials.
- Use TLS in deployed environments.
- Use least-privilege IAM.
- Keep the AWS integration read-only for the first release.
- Add audit events for security-relevant actions.
- Set reasonable request, payload, and query timeouts.
- Add dependency and container image scanning in CI when practical.
- Provide a `.gitignore` that excludes `.env`, `.env.*` except `.env.example`, build outputs, `node_modules`, logs, coverage, and local database files.

---

## 12. UI/UX direction

Create a professional CloudOps console, not a generic admin template.

### Layout
- Persistent left sidebar with Overview, Compute, Monitoring, Logs, and Settings.
- Top bar with page title, selected region, connection status, last refresh, and user menu.
- Main content area with responsive cards and tables.

### Visual direction
- Dark navy/charcoal base or a clean light theme; choose one coherent theme.
- High-contrast text and accessible status indicators.
- Restrained accent colors.
- Consistent spacing, border radius, and typography.
- Charts with readable axes, legends, tooltips, and time ranges.
- Skeleton loaders and clear error/retry states.
- Responsive behavior for laptop, tablet, and mobile.

### Dashboard components
- KPI cards.
- Environment health badge.
- CPU and network time-series charts.
- Alarm summary.
- EC2 state distribution.
- Recent events table.
- Last-synced indicator.

Do not overcrowd the first screen. Prioritize operational decisions over decoration.

---

## 13. Demo data requirements

The application must be useful without an AWS account.

Create realistic fixtures with:
- At least 8 EC2 instances across multiple states and instance types.
- Multiple Availability Zones.
- Different CPU utilization patterns.
- Network traffic data.
- At least 5 CloudWatch alarms covering OK, ALARM, and INSUFFICIENT_DATA.
- Recent log events with INFO, WARN, and ERROR examples.
- Recent operational events.

Use clearly fictional account identifiers and resource IDs where possible. Display a persistent **Demo Data** label whenever demo mode is active. Demo data must be deterministic so tests and screenshots remain stable.

---

## 14. Environment variables

Create `.env.example` with documented placeholders, such as:

```dotenv
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://cloudops:cloudops_dev_password@localhost:5432/cloudops
JWT_SECRET=replace_with_a_long_random_development_secret
AUTH_TOKEN_TTL=15m
CLOUD_PROVIDER=demo
AWS_REGION=ap-south-1
AWS_LOG_GROUPS=/aws/ec2/example-app
DASHBOARD_REFRESH_SECONDS=60
```

Adapt names to the implementation. Never put real values in this file. Validate required variables at startup and fail with a clear message when configuration is invalid.

For local development, document how to create a secure random JWT secret. In production, use a managed secret store or protected deployment environment variables.

---

## 15. Docker and local development

Provide:
- A Dockerfile for the frontend.
- A Dockerfile for the backend.
- A `docker-compose.yml` with frontend, backend, and PostgreSQL.
- Health checks for services.
- Persistent PostgreSQL volume.
- Correct startup dependency handling.
- Non-root containers where practical.
- Production-oriented multi-stage builds.
- No secrets baked into images.

Document two ways to run:
1. Docker Compose (recommended).
2. Local development using npm scripts.

Expected developer experience should be straightforward:

```bash
cp .env.example .env
docker compose up --build
```

Then document the exact local URLs, demo login, migration/seed behavior, and how to stop the stack. Ensure the documented commands actually work.

---

## 16. Testing and quality gates

### Backend tests
- Health endpoint.
- Login success and failure.
- Protected route behavior.
- Input validation.
- Demo provider behavior.
- EC2 filtering and pagination.
- CloudWatch alarm filtering.
- AWS provider error mapping using mocked AWS SDK clients.

### Frontend tests
- Login form validation.
- Protected route behavior.
- Dashboard loading, success, empty, and error states.
- EC2 table filtering.
- Alarm status display.
- Charts render with valid and missing data.

### Quality gates
- TypeScript typecheck.
- Lint.
- Unit/integration tests.
- Production frontend build.
- Backend build.
- Docker image build.

Do not claim tests pass unless they were actually run. Fix failures before moving to the next milestone.

---

## 17. CI/CD

Create a GitHub Actions workflow for pull requests and pushes to the default branch.

Minimum CI:
1. Checkout repository.
2. Set up supported Node.js version.
3. Install dependencies using lockfiles.
4. Lint frontend and backend.
5. Run type checks.
6. Run tests.
7. Build frontend and backend.
8. Optionally build Docker images.

Later CD enhancement:
- Authenticate to AWS using GitHub OIDC (preferred over long-lived AWS keys).
- Build and tag backend/frontend images.
- Push images to Amazon ECR.
- Deploy to the chosen runtime.
- Run a health check after deployment.
- Support rollback to the previous known-good image.

Do not add AWS deployment secrets or enable production deployment by default. CI should work without AWS credentials.

---

## 18. Deployment architecture (later stage)

Suggested single-environment deployment:

```text
Users
  |
  v
Internet / DNS
  |
HTTPS (TLS certificate)
  |
Nginx reverse proxy on EC2
  |                         \
  v                          v
React static files        Express API container
                               |
                       PostgreSQL (managed DB
                       or separately secured host)
                               |
                         AWS APIs via EC2
                         instance IAM role
```

Deployment considerations:
- Put the EC2 instance in a suitable VPC/subnet.
- Restrict inbound security group rules to required ports.
- Expose HTTPS publicly; do not expose PostgreSQL to the internet.
- Use an IAM instance profile for AWS read access.
- Store secrets outside the image and repository.
- Configure Nginx reverse proxy and TLS.
- Configure log rotation and monitoring.
- Use persistent/managed database storage and backups.
- Document deployment and rollback.
- Prefer a managed PostgreSQL service for production if budget and requirements permit.

This is a reference architecture, not permission to create resources.

---

## 19. Documentation deliverables

Create and maintain:

### README.md
Include:
- Project overview and feature list.
- Architecture diagram.
- Technology stack.
- Screenshots section (add real screenshots after UI exists).
- Prerequisites.
- Local setup.
- Demo login.
- Environment variables.
- API overview.
- Tests and build commands.
- Demo mode versus AWS mode.
- Security notes.
- Roadmap.

### docs/architecture.md
Explain components, request flow, provider abstraction, data flow, and design decisions.

### docs/aws-iam-policy.md
Document required AWS permissions, least-privilege considerations, and how to configure the role/profile.

### docs/api.md
Document endpoints, parameters, authentication, and example responses.

### docs/deployment.md
Document Docker deployment, Nginx, environment configuration, health checks, and rollback.

---

## 20. Implementation milestones

Follow this sequence and do not skip ahead.

### Milestone 1 — Repository inspection and plan
- Inspect repository.
- Confirm stack and existing files.
- Produce a short implementation plan.
- Identify any conflicts with this specification.

### Milestone 2 — Scaffold and backend foundation
- Create monorepo structure.
- Configure TypeScript and linting.
- Create Express app and health endpoint.
- Configure Prisma and PostgreSQL.
- Add environment validation and structured logging.

### Milestone 3 — Demo provider and API
- Define CloudProvider interface.
- Implement deterministic DemoCloudProvider.
- Implement summary, EC2, metrics, alarms, logs endpoints.
- Add API tests.

### Milestone 4 — Authentication
- Implement user model, password hashing, login, protected routes, and demo seed.
- Add authentication tests.

### Milestone 5 — Frontend shell
- Build responsive layout, sidebar, top bar, routing, reusable components, and API client.

### Milestone 6 — Dashboard and operational pages
- Implement overview, EC2 inventory/detail, monitoring, logs, and settings.
- Add loading, error, empty, and success states.
- Add frontend tests.

### Milestone 7 — Docker and local end-to-end
- Add Dockerfiles, Compose, health checks, migrations, and seed.
- Run the complete application locally.
- Verify every primary user journey.

### Milestone 8 — CI and documentation
- Add GitHub Actions CI.
- Complete README and docs.
- Run all quality gates.

### Milestone 9 — Real AWS read integration
- Add AWS SDK provider.
- Configure read-only IAM.
- Test in a non-production AWS environment only when credentials and explicit approval are supplied.
- Keep demo mode working.

### Milestone 10 — Deployment preparation
- Add Nginx production config.
- Document ECR and EC2 deployment.
- Add OIDC-based CI/CD only after the deployment target is confirmed.

At the end of each milestone, report:
- Files created/changed.
- What works.
- Commands run and their actual results.
- Known limitations.
- Next milestone.

---

## 21. Definition of done

Stage A is complete only when:

- A new developer can clone the repository and follow the README.
- The application starts locally using Docker Compose.
- The dashboard works without AWS credentials.
- Demo mode is visibly labelled.
- Login and protected routes work.
- Overview, EC2, Monitoring, Logs, and Settings pages work.
- Search and filters work where specified.
- API validation and error handling are implemented.
- PostgreSQL migrations and seed process work.
- Backend and frontend tests pass.
- Type checks, lint, and production builds pass.
- No secrets are committed.
- Docker images build successfully.
- Documentation matches the actual behavior.

Stage B is complete only when real AWS read operations have been tested and their IAM permissions documented.

Stage C is complete only when deployment, HTTPS, health checks, logging, and rollback have been verified in the selected environment.

---

## 22. Final instruction to the coding agent

Start with **Milestone 1 only**. Inspect the repository and report the existing state and implementation plan. Then proceed milestone by milestone.

Do not generate a giant untested code dump. Build a working, coherent application incrementally. Use demo mode first, keep AWS access server-side and read-only, and never create billable AWS resources without explicit approval.

The result should be understandable enough that a junior DevOps engineer can explain the architecture, trace a request from the browser to the backend and AWS, describe the IAM permissions, run the application locally, and demonstrate the monitoring workflows in an interview.
