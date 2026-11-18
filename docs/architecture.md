# CloudOps Command Center — Architecture Specification

## 1. Overview
The **CloudOps Command Center** is a production-grade operations console designed to provide DevOps, Cloud, and SRE engineers with real-time operational visibility into an AWS cloud environment. It eliminates the need to traverse disconnected AWS console screens by uniting EC2 inventory, CloudWatch metrics, alarms, and log streams into a single responsive pane.

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

## 2. Core Principles
1. **Zero Credential Exposure in Browser**: The frontend never receives, stores, or transmits long-lived cloud credentials. All telemetry is aggregated server-side.
2. **Provider Pluggability**: The backend communicates through an abstract `CloudProvider` interface. In local or testing environments, `DemoCloudProvider` returns rich, deterministic data without cloud dependencies. In AWS environments, `AwsCloudProvider` calls AWS SDK v3.
3. **Least Privilege**: The AWS read provider only requires read-only IAM permissions (`ec2:Describe*`, `cloudwatch:GetMetricData`, `cloudwatch:DescribeAlarms`, `logs:FilterLogEvents`).
4. **Resilient Data Storage**: PostgreSQL stores users, authentication credentials (salted bcrypt hashes), preferences, and security audit events. Time-series metrics are fetched on-demand.
