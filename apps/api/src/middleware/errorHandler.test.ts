import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import type { Request, Response } from 'express';
import request from 'supertest';
import { errorHandler } from './errorHandler';

describe('errorHandler middleware', () => {
  it('formats uncaught errors as 500 ApiResponse envelope', async () => {
    const app = express();
    // Spy on console.error to keep test output clean
    vi.spyOn(console, 'error').mockImplementation(() => {});

    app.get('/error', (_req: Request, _res: Response) => {
      throw new Error('Database connection failed');
    });

    app.use(errorHandler);

    const res = await request(app).get('/error');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      },
    });
  });
});
