import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { config } from '../../config/env.js';

const router = Router();

router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let pref: any = null;
    try {
      pref = await prisma.userPreference.findUnique({
        where: { userId: req.user?.userId }
      });
    } catch (e) {
      // In demo mode without DB
    }

    res.json({
      data: {
        userId: req.user?.userId,
        email: req.user?.email,
        defaultRegion: pref?.defaultRegion || config.AWS_REGION,
        refreshIntervalSeconds: pref?.refreshIntervalSeconds || config.DASHBOARD_REFRESH_SECONDS,
        cloudProvider: config.CLOUD_PROVIDER,
        isDemoMode: config.CLOUD_PROVIDER === 'demo'
      }
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { defaultRegion, refreshIntervalSeconds } = req.body;
    let pref: any = {
      defaultRegion: defaultRegion || config.AWS_REGION,
      refreshIntervalSeconds: refreshIntervalSeconds || config.DASHBOARD_REFRESH_SECONDS
    };

    try {
      pref = await prisma.userPreference.upsert({
        where: { userId: req.user?.userId },
        create: {
          userId: req.user!.userId,
          defaultRegion: defaultRegion || config.AWS_REGION,
          refreshIntervalSeconds: refreshIntervalSeconds || config.DASHBOARD_REFRESH_SECONDS
        },
        update: {
          defaultRegion: defaultRegion !== undefined ? defaultRegion : undefined,
          refreshIntervalSeconds: refreshIntervalSeconds !== undefined ? refreshIntervalSeconds : undefined
        }
      });
    } catch (e) {
      // ignore in demo
    }

    res.json({ data: pref });
  } catch (err) {
    next(err);
  }
});

export const settingsRouter = router;
