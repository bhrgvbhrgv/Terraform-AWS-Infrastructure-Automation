import { app } from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = config.PORT;

app.listen(PORT, () => {
  logger.info(`CloudOps Command Center API running on port ${PORT} [Mode: ${config.CLOUD_PROVIDER}]`);
});
