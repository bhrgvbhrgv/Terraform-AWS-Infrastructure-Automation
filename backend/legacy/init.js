const fs = require('fs');
const path = require('path');
const db = require('./index');

const INITIAL_SERVICES = [
  {
    name: 'Web Frontend',
    description: 'User-facing Single Page Application hosted via CloudFront & S3 distribution.',
    status: 'operational',
  },
  {
    name: 'REST API',
    description: 'Core microservices and backend API layer running on containerized clusters.',
    status: 'operational',
  },
  {
    name: 'Database',
    description: 'PostgreSQL primary and read-replica relational database cluster.',
    status: 'operational',
  },
  {
    name: 'Background Worker',
    description: 'Asynchronous event consumer and batch task processing service.',
    status: 'degraded',
  },
];

async function initializeDatabase() {
  console.log('Initializing database tables...');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await db.query(schemaSql);
  console.log('Schema applied successfully.');

  console.log('Seeding initial services...');
  for (const service of INITIAL_SERVICES) {
    const existing = await db.query(
      'SELECT id, status FROM services WHERE name = $1',
      [service.name]
    );

    if (existing.rows.length === 0) {
      const insertResult = await db.query(
        `INSERT INTO services (name, description, status, created_at, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [service.name, service.description, service.status]
      );
      const serviceId = insertResult.rows[0].id;

      // Seed initial history entry
      await db.query(
        `INSERT INTO status_history (service_id, status, changed_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [serviceId, service.status]
      );
      console.log(`Inserted service: ${service.name} (id: ${serviceId})`);
    } else {
      console.log(`Service already exists: ${service.name}`);
    }
  }

  console.log('Database initialization completed.');
}

if (require.main === module) {
  initializeDatabase()
    .then(async () => {
      await db.pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Database initialization failed:', err);
      try {
        await db.pool.end();
      } catch (e) {
        // ignore
      }
      process.exit(1);
    });
}

module.exports = {
  initializeDatabase,
  INITIAL_SERVICES,
};

