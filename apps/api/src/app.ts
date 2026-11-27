import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@craftsure/shared-types';
import { districtsRouter } from './modules/districts';
import { craftsRouter } from './modules/crafts';
import { productsRouter } from './modules/products';
import { aiRouter } from './modules/ai';
import { authRouter } from './modules/auth';
import { ordersRouter } from './modules/orders';
import { artisansRouter } from './modules/artisans';
import { adminRouter } from './modules/admin';
import { authenticateToken } from './middleware/authenticate';

export function createApp(): express.Express {
  const app = express();

  // ── Middleware ───────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Basic CORS for dev — tighten in production via environment config
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (_req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Extract authentication token (if present)
  app.use(authenticateToken);

  // ── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    const body: ApiResponse<{ status: string; timestamp: string }> = {
      ok: true,
      data: { status: 'ok', timestamp: new Date().toISOString() },
    };
    res.json(body);
  });

  // ── API routes ───────────────────────────────────────────────────────────
  app.use('/api/districts', districtsRouter);
  app.use('/api/crafts', craftsRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/artisans', artisansRouter);
  app.use('/api/admin', adminRouter);

  // ── 404 handler ──────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    const body: ApiResponse<never> = {
      ok: false,
      error: { code: 'NOT_FOUND', message: 'The requested resource does not exist.' },
    };
    res.status(404).json(body);
  });

  // ── Global error handler ─────────────────────────────────────────────────
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[API Error]', err);
    const body: ApiResponse<never> = {
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    };
    res.status(500).json(body);
  });

  return app;
}
