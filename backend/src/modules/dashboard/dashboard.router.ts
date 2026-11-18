import { Router, Response, NextFunction } from 'express';
import { getCloudProvider } from '../../providers/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

router.get('/summary', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = getCloudProvider();
    const summary = await provider.getAccountSummary();
    res.json({ data: summary });
  } catch (err) {
    next(err);
  }
});

router.get('/trends', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = getCloudProvider();
    const trends = await provider.getDashboardTrends();
    res.json({ data: trends });
  } catch (err) {
    next(err);
  }
});

router.get('/events', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = getCloudProvider();
    const events = await provider.getOperationalEvents(10);
    res.json({ data: events });
  } catch (err) {
    next(err);
  }
});

export const dashboardRouter = router;
