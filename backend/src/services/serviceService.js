const db = require('../db');

const VALID_STATUSES = ['operational', 'degraded', 'offline'];

/**
 * Service business logic using parameterized queries
 */
class ServiceService {
  /**
   * Get all services ordered by id
   */
  async getAllServices() {
    const result = await db.query(
      `SELECT id, name, description, status, created_at, updated_at
       FROM services
       ORDER BY id ASC`
    );
    return result.rows;
  }

  /**
   * Get service by ID along with recent status history
   */
  async getServiceById(id) {
    const serviceResult = await db.query(
      `SELECT id, name, description, status, created_at, updated_at
       FROM services
       WHERE id = $1`,
      [id]
    );

    if (serviceResult.rows.length === 0) {
      return null;
    }

    const service = serviceResult.rows[0];

    const historyResult = await db.query(
      `SELECT id, service_id, status, changed_at
       FROM status_history
       WHERE service_id = $1
       ORDER BY changed_at DESC
       LIMIT 50`,
      [id]
    );

    return {
      ...service,
      history: historyResult.rows,
    };
  }

  /**
   * Update service status and record history
   */
  async updateStatus(id, newStatus) {
    const normalizedStatus = typeof newStatus === 'string' ? newStatus.trim().toLowerCase() : '';
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    // Check if service exists
    const checkResult = await db.query(
      `SELECT id, status FROM services WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return null;
    }

    // Update service
    const updateResult = await db.query(
      `UPDATE services
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, description, status, created_at, updated_at`,
      [normalizedStatus, id]
    );

    // Record change in status_history
    await db.query(
      `INSERT INTO status_history (service_id, status, changed_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)`,
      [id, normalizedStatus]
    );

    return updateResult.rows[0];
  }
}

module.exports = new ServiceService();
module.exports.VALID_STATUSES = VALID_STATUSES;

