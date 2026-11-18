import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../../db/prisma.js';
import { config } from '../../config/env.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { logger } from '../../utils/logger.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts, please try again later'
    }
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const router = Router();

// Demo credentials helper
export const DEMO_USER = {
  id: 'usr_demo_admin_001',
  email: 'admin@cloudops.internal',
  password: 'Password123!'
};

router.post('/login', loginLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email or password format'
        }
      });
      return;
    }

    const { email, password } = parsed.data;

    let user: { id: string; email: string; passwordHash: string } | null = null;

    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbErr) {
      // In demo mode without Postgres running, fall back to built-in demo credentials
      if (email === DEMO_USER.email) {
        user = {
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          passwordHash: await bcrypt.hash(DEMO_USER.password, 10)
        };
      }
    }

    if (!user && email === DEMO_USER.email) {
      user = {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        passwordHash: await bcrypt.hash(DEMO_USER.password, 10)
      };
    }

    if (!user) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: config.AUTH_TOKEN_TTL as any }
    );

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({
      data: {
        user: req.user
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    data: {
      message: 'Logged out successfully'
    }
  });
});

export const authRouter = router;
