# CloudOps Deployment & Operational Guide

## 1. Local Quickstart (Docker Compose)

The fastest way to run the entire CloudOps stack locally with PostgreSQL and Nginx is using Docker Compose:

```bash
# 1. Create development environment variables
cp .env.example .env

# 2. Build and run containers
docker compose up --build
```

### Accessing the Services
- **Web UI**: [http://localhost:3000](http://localhost:3000) or [http://localhost:80](http://localhost:80)
- **API Health**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- **Default Demo Credentials**:
  - **Email**: `admin@cloudops.internal`
  - **Password**: `Password123!`

---

## 2. Local Manual Development (npm)

Run the backend and frontend services directly on your host:

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 3. Production Deployment with AWS EC2 & Nginx

1. **Provision EC2 Host**: Launch an Ubuntu LTS EC2 instance with the IAM role attached (as detailed in `docs/aws-iam-policy.md`).
2. **Container Registry**: Push Docker images to Amazon ECR.
3. **Nginx Reverse Proxy**: Route external HTTPS traffic on port 443 with TLS certificates (e.g. AWS ACM or Let's Encrypt) to the frontend container on port 80 and backend API on port 4000.
