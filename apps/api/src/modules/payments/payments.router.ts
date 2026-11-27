import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '@craftsure/shared-types';
import { paymentsService, PaymentError } from './payments.service';

export const paymentsRouter: Router = Router();

const addressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().default('Uttar Pradesh'),
  pincode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit Indian PIN code'),
  country: z.string().default('India'),
});

const lineItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const createPaymentOrderSchema = z.object({
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().min(10),
  shippingAddress: addressSchema,
  lineItems: z.array(lineItemSchema).min(1, 'Order must contain at least one item'),
  paymentMethod: z.string().optional().default('razorpay'),
});

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

/**
 * POST /api/payments/create-order
 * Creates an authoritative Razorpay order with server-calculated price verification.
 */
paymentsRouter.post('/create-order', async (req: Request, res: Response) => {
  const parseResult = createPaymentOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid payment order creation payload.',
        details: parseResult.error.flatten().fieldErrors,
      },
    };
    res.status(400).json(errorBody);
    return;
  }

  try {
    const buyerId = req.user?.id ?? 'guest-buyer';
    const result = await paymentsService.createPaymentOrder(parseResult.data, buyerId);

    const responseBody: ApiResponse<typeof result> = {
      ok: true,
      data: result,
    };
    res.status(201).json(responseBody);
  } catch (err) {
    if (err instanceof PaymentError) {
      const errorBody: ApiResponse<never> = {
        ok: false,
        error: { code: err.code, message: err.message },
      };
      res.status(err.status).json(errorBody);
      return;
    }

    const errorBody: ApiResponse<never> = {
      ok: false,
      error: { code: 'PAYMENT_CREATION_FAILED', message: (err as Error).message },
    };
    res.status(500).json(errorBody);
  }
});

/**
 * POST /api/payments/verify
 * Cryptographically verifies Razorpay payment signature and transitions order status to confirmed.
 */
paymentsRouter.post('/verify', async (req: Request, res: Response) => {
  const parseResult = verifyPaymentSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid payment verification payload.',
        details: parseResult.error.flatten().fieldErrors,
      },
    };
    res.status(400).json(errorBody);
    return;
  }

  try {
    const result = await paymentsService.verifyPayment(parseResult.data);
    const responseBody: ApiResponse<typeof result> = {
      ok: true,
      data: result,
    };
    res.status(200).json(responseBody);
  } catch (err) {
    if (err instanceof PaymentError) {
      const errorBody: ApiResponse<never> = {
        ok: false,
        error: { code: err.code, message: err.message },
      };
      res.status(err.status).json(errorBody);
      return;
    }

    const errorBody: ApiResponse<never> = {
      ok: false,
      error: { code: 'VERIFICATION_FAILED', message: (err as Error).message },
    };
    res.status(500).json(errorBody);
  }
});

/**
 * POST /api/payments/webhook
 * Receives Razorpay webhook events, validates raw body signature, and handles events idempotently.
 */
paymentsRouter.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody ?? JSON.stringify(req.body);

  try {
    const result = await paymentsService.handleWebhook(
      rawBody,
      signature,
      req.body as Record<string, unknown>,
    );

    const responseBody: ApiResponse<typeof result> = {
      ok: true,
      data: result,
    };
    res.status(200).json(responseBody);
  } catch (err) {
    if (err instanceof PaymentError) {
      const errorBody: ApiResponse<never> = {
        ok: false,
        error: { code: err.code, message: err.message },
      };
      res.status(err.status).json(errorBody);
      return;
    }

    const errorBody: ApiResponse<never> = {
      ok: false,
      error: { code: 'WEBHOOK_FAILED', message: (err as Error).message },
    };
    res.status(500).json(errorBody);
  }
});
