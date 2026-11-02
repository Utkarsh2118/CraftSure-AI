import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@craftsure/shared-types';

/**
 * Global error handler middleware.
 * Must have 4 parameters for Express to recognise it as an error handler.
 *
 * In production, stack traces are never sent to the client.
 * All errors log to stderr for aggregation by the logging infrastructure.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  console.error('[API Error]', {
    message: err.message,
    stack: process.env['NODE_ENV'] === 'development' ? err.stack : undefined,
  });

  const body: ApiResponse<never> = {
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    },
  };

  res.status(500).json(body);
}
