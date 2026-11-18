import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgresql://cloudops:cloudops_dev_password@localhost:5432/cloudops'),
  JWT_SECRET: z.string().default('development_jwt_secret_change_in_production_min32chars!'),
  AUTH_TOKEN_TTL: z.string().default('15m'),
  CLOUD_PROVIDER: z.enum(['demo', 'aws']).default('demo'),
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_LOG_GROUPS: z.string().default('/aws/ec2/prod-api-gateway,/aws/ec2/prod-worker-batch'),
  DASHBOARD_REFRESH_SECONDS: z.coerce.number().default(60)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
