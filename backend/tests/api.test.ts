import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { DEMO_USER } from '../src/modules/auth/auth.router.js';

describe('CloudOps Command Center API Tests', () => {
  let authToken = '';

  it('GET /api/v1/health returns healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.mode).toBeDefined();
  });

  it('POST /api/v1/auth/login fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'wrong@example.com', password: 'badpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /api/v1/auth/login succeeds with demo credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: DEMO_USER.email, password: DEMO_USER.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(DEMO_USER.email);
    authToken = res.body.data.token;
  });

  it('GET /api/v1/dashboard/summary fails without auth', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/dashboard/summary succeeds with valid JWT', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.environmentHealth).toBeDefined();
    expect(res.body.data.instances.total).toBeGreaterThan(0);
  });

  it('GET /api/v1/ec2/instances returns paginated instances and respects filters', async () => {
    const res = await request(app)
      .get('/api/v1/ec2/instances?state=running')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeGreaterThan(0);
    expect(res.body.data.every((i: any) => i.state === 'running')).toBe(true);
  });

  it('GET /api/v1/ec2/instances/:instanceId returns details', async () => {
    const res = await request(app)
      .get('/api/v1/ec2/instances/i-0a1b2c3d4e5f00001')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.instanceId).toBe('i-0a1b2c3d4e5f00001');
    expect(res.body.data.name).toBe('prod-api-primary');
  });

  it('GET /api/v1/cloudwatch/alarms returns alarm list and filters', async () => {
    const res = await request(app)
      .get('/api/v1/cloudwatch/alarms?state=ALARM')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].state).toBe('ALARM');
  });

  it('GET /api/v1/logs/groups returns configured log groups', async () => {
    const res = await request(app)
      .get('/api/v1/logs/groups')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
