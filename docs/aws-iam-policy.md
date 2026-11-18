# AWS IAM Least-Privilege Read-Only Policy

This document defines the strict, least-privilege IAM policy required for the CloudOps Command Center backend when operating in `CLOUD_PROVIDER=aws` mode.

## 1. IAM Policy Document

Attach this policy to the IAM Role assigned to the EC2 instance profile or ECS task definition:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudOpsEC2ReadOnly",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeTags"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudOpsCloudWatchMetricsReadOnly",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:GetMetricData",
        "cloudwatch:ListMetrics",
        "cloudwatch:DescribeAlarms"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudOpsLogsFilterReadOnly",
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups",
        "logs:FilterLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:*:*:log-group:/aws/ec2/*:*",
        "arn:aws:logs:*:*:log-group:/aws/system/*:*"
      ]
    },
    {
      "Sid": "CloudOpsSTSIdentityCheck",
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

## 2. Security Notes
- **No Mutation Rights**: The policy does not allow `ec2:StartInstances`, `ec2:StopInstances`, `ec2:TerminateInstances`, or any `Put`/`Delete` actions.
- **Resource Constraints**: Log filtering permissions are restricted to the application's configured log groups rather than allowing wildcard access across all AWS services.
