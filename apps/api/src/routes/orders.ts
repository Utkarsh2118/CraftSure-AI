import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse, Order, OrderLineItem } from '@craftsure/shared-types';

export const ordersRouter: Router = Router();

// In-memory order ledger for fast execution and offline demo capability
const ordersMap = new Map<string, Order>();

const addressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().default('Uttar Pradesh'),
  pincode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit Indian PIN code'),
  country: z.string().default('India'),
});

const lineItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  snapshotPriceInPaise: z.number().int().nonnegative(),
  snapshotTitle: z.string().min(1),
  snapshotImageUrl: z.string().nullable().optional(),
});

const createOrderSchema = z.object({
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().min(10),
  shippingAddress: addressSchema,
  lineItems: z.array(lineItemSchema).min(1, 'Order must contain at least one item'),
  paymentMethod: z.enum(['upi', 'card', 'cod']).default('upi'),
});

/**
 * POST /api/orders
 * Creates an immutable order in the ledger with integer paise snapshot pricing.
 */
ordersRouter.post('/', (req: Request, res: Response) => {
  const parseResult = createOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid order creation payload.',
        details: parseResult.error.flatten().fieldErrors,
      },
    };
    res.status(400).json(errorBody);
    return;
  }

  const data = parseResult.data;

  // Strict integer paise calculations (Non-negotiable Rule 1)
  const subtotalPaise = data.lineItems.reduce(
    (sum, item) => sum + Math.round(item.snapshotPriceInPaise) * item.quantity,
    0,
  );
  // Free delivery above ₹2,000 (200,000 paise), else ₹120 (12,000 paise)
  const deliveryPaise = subtotalPaise >= 200000 ? 0 : 12000;
  const totalInPaise = subtotalPaise + deliveryPaise;

  const orderId = `CS-UP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const orderLineItems: OrderLineItem[] = data.lineItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    snapshotPriceInPaise: Math.round(item.snapshotPriceInPaise),
    snapshotTitle: item.snapshotTitle,
    snapshotImageUrl: item.snapshotImageUrl ?? null,
  }));

  const order: Order = {
    id: orderId,
    buyerId: req.user?.id ?? 'guest-buyer',
    lineItems: orderLineItems,
    status: 'confirmed',
    shippingAddress: {
      line1: data.shippingAddress.line1,
      line2: data.shippingAddress.line2,
      city: data.shippingAddress.city,
      state: data.shippingAddress.state,
      pincode: data.shippingAddress.pincode,
      country: data.shippingAddress.country,
    },
    totalInPaise,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ordersMap.set(orderId, order);

  const responseBody: ApiResponse<Order> = {
    ok: true,
    data: order,
  };

  res.status(201).json(responseBody);
});

/**
 * GET /api/orders/:id
 * Retrieves an order from the ledger by its ID.
 */
ordersRouter.get('/:id', (req: Request, res: Response) => {
  const id = typeof req.params['id'] === 'string' ? req.params['id'] : '';
  const order = ordersMap.get(id);

  if (!order) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'ORDER_NOT_FOUND',
        message: `Order with ID "${id}" was not found.`,
      },
    };
    res.status(404).json(errorBody);
    return;
  }

  const responseBody: ApiResponse<Order> = {
    ok: true,
    data: order,
  };

  res.json(responseBody);
});
