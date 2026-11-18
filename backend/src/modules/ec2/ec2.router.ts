import { Router, Response, NextFunction } from 'express';
import { getCloudProvider } from '../../providers/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

router.get('/instances', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { state, search, az, page = '1', pageSize = '20' } = req.query;
    const provider = getCloudProvider();
    const instances = await provider.listInstances({
      state: state ? String(state) : undefined,
      search: search ? String(search) : undefined,
      az: az ? String(az) : undefined
    });

    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const size = Math.max(1, Math.min(100, parseInt(String(pageSize), 10) || 20));
    const start = (p - 1) * size;
    const paginated = instances.slice(start, start + size);

    res.json({
      data: paginated,
      meta: {
        page: p,
        pageSize: size,
        total: instances.length
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/instances/:instanceId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { instanceId } = req.params;
    const provider = getCloudProvider();
    const instance = await provider.getInstance(instanceId);

    if (!instance) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Instance ${instanceId} not found`
        }
      });
      return;
    }

    res.json({ data: instance });
  } catch (err) {
    next(err);
  }
});

router.get('/instances/:instanceId/metrics', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { instanceId } = req.params;
    const metricName = (req.query.metric as string) || 'CPUUtilization';
    const range = parseInt((req.query.range as string) || '60', 10);

    const provider = getCloudProvider();
    const metrics = await provider.getInstanceMetrics(instanceId, metricName, range);
    res.json({ data: metrics });
  } catch (err) {
    next(err);
  }
});

export const ec2Router = router;
