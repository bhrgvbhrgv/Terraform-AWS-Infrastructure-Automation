import { CloudProvider } from './cloud-provider.js';
import { DemoCloudProvider } from './demo-provider.js';
import { AwsCloudProvider } from './aws-provider.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

let providerInstance: CloudProvider;

export function getCloudProvider(): CloudProvider {
  if (!providerInstance) {
    if (config.CLOUD_PROVIDER === 'aws') {
      logger.info({ region: config.AWS_REGION }, 'Initializing AWS Cloud Provider');
      providerInstance = new AwsCloudProvider(config.AWS_REGION);
    } else {
      logger.info('Initializing Demo Cloud Provider (offline mock data)');
      providerInstance = new DemoCloudProvider();
    }
  }
  return providerInstance;
}
