const request = require('supertest');

// Mock db module before loading app
jest.mock('../src/db', () => ({
  query: jest.fn(),
  pool: { end: jest.fn() },
}));

const db = require('../src/db');
const app = require('../src/app');

describe('Backend API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('returns status 200 and healthy status without database interaction', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('cloudops-status-api');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/services', () => {
    it('returns all services with 200 OK', async () => {
      const mockServices = [
        {
          id: 1,
          name: 'Web Frontend',
          description: 'Frontend SPA',
          status: 'operational',
          created_at: '2026-10-28T00:00:00.000Z',
          updated_at: '2026-10-28T00:00:00.000Z',
        },
        {
          id: 2,
          name: 'REST API',
          description: 'API Service',
          status: 'operational',
          created_at: '2026-10-28T00:00:00.000Z',
          updated_at: '2026-10-28T00:00:00.000Z',
        },
      ];

      db.query.mockResolvedValueOnce({ rows: mockServices });

      const res = await request(app).get('/api/services');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].name).toBe('Web Frontend');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT\s+id,\s*name,\s*description,\s*status,\s*created_at,\s*updated_at\s+FROM\s+services/i)
      );
    });

    it('returns 500 when database query fails', async () => {
      db.query.mockRejectedValueOnce(new Error('DB Connection Failed'));

      const res = await request(app).get('/api/services');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('DB Connection Failed');
    });
  });

  describe('GET /api/services/:id', () => {
    it('returns 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/services/abc');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Invalid service ID/);
    });

    it('returns 404 if service does not exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/api/services/999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not found');
    });

    it('returns service and history for existing service', async () => {
      const mockService = {
        id: 1,
        name: 'Web Frontend',
        description: 'Frontend SPA',
        status: 'operational',
        created_at: '2026-10-28T00:00:00.000Z',
        updated_at: '2026-10-28T00:00:00.000Z',
      };
      const mockHistory = [
        {
          id: 1,
          service_id: 1,
          status: 'operational',
          changed_at: '2026-10-28T00:00:00.000Z',
        },
      ];

      db.query
        .mockResolvedValueOnce({ rows: [mockService] })
        .mockResolvedValueOnce({ rows: mockHistory });

      const res = await request(app).get('/api/services/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Web Frontend');
      expect(res.body.data.history).toHaveLength(1);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), [1]);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE service_id = $1'), [1]);
    });
  });

  describe('PATCH /api/services/:id/status', () => {
    it('returns 400 for invalid service ID', async () => {
      const res = await request(app)
        .patch('/api/services/xyz/status')
        .send({ status: 'operational' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid service ID/);
    });

    it('returns 400 for invalid status value', async () => {
      const res = await request(app)
        .patch('/api/services/1/status')
        .send({ status: 'broken' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid status');
    });

    it('returns 400 for missing status value', async () => {
      const res = await request(app)
        .patch('/api/services/1/status')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Status is required');
    });

    it('returns 404 when updating non-existent service', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .patch('/api/services/999/status')
        .send({ status: 'degraded' });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found');
    });

    it('successfully updates service status and records history', async () => {
      // 1. check query
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, status: 'operational' }] });
      // 2. update query
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: 'Web Frontend',
            description: 'Frontend SPA',
            status: 'degraded',
            created_at: '2026-10-28T00:00:00.000Z',
            updated_at: '2026-10-28T01:00:00.000Z',
          },
        ],
      });
      // 3. insert history
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .patch('/api/services/1/status')
        .send({ status: 'degraded' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('degraded');
      expect(db.query).toHaveBeenCalledTimes(3);
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('UPDATE services'),
        ['degraded', 1]
      );
      expect(db.query).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('INSERT INTO status_history'),
        [1, 'degraded']
      );
    });
  });

  describe('404 Route handling', () => {
    it('returns 404 for unknown route', async () => {
      const res = await request(app).get('/api/unknown-route');
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Endpoint not found');
    });
  });
});
