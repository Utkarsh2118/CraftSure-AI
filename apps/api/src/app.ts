import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@craftsure/shared-types';
import { districtsRouter } from './routes/districts';
import { craftsRouter } from './routes/crafts';
import { productsRouter } from './routes/products';
import { aiRouter } from './routes/ai';

export function createApp() {
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

  // ── 404 handler ──────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    const body: ApiResponse<never> = {
      ok: false,
      error: { code: 'NOT_FOUND', message: 'The requested resource does not exist.' },
    };
    res.status(404).json(body);
  });

  // ── Global error handler ─────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
