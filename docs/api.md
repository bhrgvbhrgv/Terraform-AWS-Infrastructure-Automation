# CloudOps Command Center REST API Specification

Base URL: `/api/v1`

## 1. Authentication

### `POST /api/v1/auth/login`
Authenticates an administrator with credentials and returns a signed JWT.

**Request Body:**
```json
{
  "email": "admin@cloudops.internal",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "usr_demo_admin_001",
      "email": "admin@cloudops.internal"
    }
  }
}
```

### `GET /api/v1/auth/me`
Returns current user context from `Authorization: Bearer <token>`.

---

## 2. Dashboard & Telemetry

### `GET /api/v1/dashboard/summary`
Returns top-level environment health, fleet instance breakdown, and active alarms.

### `GET /api/v1/dashboard/trends`
Returns aggregate time-series data for CPU and Network utilization over the past hour.

### `GET /api/v1/dashboard/events`
Returns recent operational events and alarm state transitions.

---

## 3. EC2 Fleet Inventory

### `GET /api/v1/ec2/instances`
List instances with optional query filtering (`state`, `search`, `az`, `page`, `pageSize`).

### `GET /api/v1/ec2/instances/:instanceId`
Returns detailed metadata for a single EC2 instance.

### `GET /api/v1/ec2/instances/:instanceId/metrics`
Queries CloudWatch metrics (`CPUUtilization`, `NetworkIn`, `NetworkOut`) for a target instance.

---

## 4. CloudWatch Alarms

### `GET /api/v1/cloudwatch/alarms`
Returns configured alarms with query filters for `state` (`OK`, `ALARM`, `INSUFFICIENT_DATA`) and `search`.

---

## 5. Logs & Streams

### `GET /api/v1/logs/groups`
Returns configured CloudWatch log groups.

### `GET /api/v1/logs/events?logGroupName=...&limit=50`
Streams log events within a bounded time window.
