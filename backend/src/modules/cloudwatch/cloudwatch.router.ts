import { Router, Response, NextFunction } from 'express';
import { getCloudProvider } from '../../providers/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

router.get('/alarms', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { state, search } = req.query;
    const provider = getCloudProvider();
    const alarms = await provider.listAlarms({
      state: state ? String(state) : undefined,
      search: search ? String(search) : undefined
    });

    res.json({
      data: alarms,
      meta: {
        total: alarms.length
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/alarms/:alarmName', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { alarmName } = req.params;
    const provider = getCloudProvider();
    const alarm = await provider.getAlarm(alarmName);

    if (!alarm) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Alarm ${alarmName} not found`
        }
      });
      return;
    }

    res.json({ data: alarm });
  } catch (err) {
    next(err);
  }
});

export const cloudwatchRouter = router;
