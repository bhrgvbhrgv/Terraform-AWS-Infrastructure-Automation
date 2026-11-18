import { Router, Response, NextFunction } from 'express';
import { getCloudProvider } from '../../providers/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

router.get('/groups', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = getCloudProvider();
    const groups = await provider.listConfiguredLogGroups();
    res.json({ data: groups });
  } catch (err) {
    next(err);
  }
});

router.get('/events', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { logGroupName, limit } = req.query;
    if (!logGroupName) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'logGroupName query parameter is required'
        }
      });
      return;
    }

    const provider = getCloudProvider();
    const parsedLimit = limit ? parseInt(String(limit), 10) : 50;
    const events = await provider.getLogEvents(String(logGroupName), undefined, undefined, parsedLimit);
    res.json({ data: events });
  } catch (err) {
    next(err);
  }
});

export const logsRouter = router;
