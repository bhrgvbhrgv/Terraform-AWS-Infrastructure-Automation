require('dotenv').config();
const app = require('./app');

const PORT = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, () => {
  console.log(`CloudOps Status API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Services endpoint: http://localhost:${PORT}/api/services`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

