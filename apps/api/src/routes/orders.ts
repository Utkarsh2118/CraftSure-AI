import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import type { ApiResponse, Order, OrderLineItem, OrderStatus } from '@craftsure/shared-types';
import { db } from '../db/client';
import { orders as ordersTable, orderItems as orderItemsTable, users as usersTable } from '../db/schema';

export const ordersRouter: Router = Router();

// Fallback in-memory order ledger for offline dev & test isolation
export const ordersMap = new Map<string, Order>();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUuid = (id?: string): id is string => typeof id === 'string' && UUID_REGEX.test(id);

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
 * Persists to PostgreSQL via Drizzle ORM transactions with fallback resilience.
 */
ordersRouter.post('/', async (req: Request, res: Response) => {
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

  // Attempt Drizzle PostgreSQL persistence inside database transaction
  let persistedInDb = false;
  try {
    const validBuyerId = isValidUuid(req.user?.id) ? req.user.id : null;

    await db.transaction(async (tx) => {
      // Ensure user record exists if buyerId is provided to satisfy foreign key
      if (validBuyerId) {
        await tx
          .insert(usersTable)
          .values({
            id: validBuyerId,
            email: data.buyerEmail,
            displayName: data.buyerName,
            role: 'buyer',
          })
          .onConflictDoNothing();
      }

      await tx.insert(ordersTable).values({
        id: orderId,
        buyerId: validBuyerId,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone,
        status: 'confirmed',
        shippingAddressLine1: data.shippingAddress.line1,
        shippingAddressLine2: data.shippingAddress.line2 ?? null,
        shippingCity: data.shippingAddress.city,
        shippingState: data.shippingAddress.state,
        shippingPincode: data.shippingAddress.pincode,
        shippingCountry: data.shippingAddress.country,
        subtotalInPaise: subtotalPaise,
        deliveryInPaise: deliveryPaise,
        totalInPaise: totalInPaise,
        paymentMethod: data.paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      for (const item of data.lineItems) {
        await tx.insert(orderItemsTable).values({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          snapshotPriceInPaise: Math.round(item.snapshotPriceInPaise),
          snapshotTitle: item.snapshotTitle,
          snapshotImageUrl: item.snapshotImageUrl ?? null,
          createdAt: new Date(),
        });
      }
    });

    persistedInDb = true;
  } catch (dbErr) {
    // Log persistence warning and maintain offline resilience
    console.warn(
      '[Orders DB Persistence Warning] PostgreSQL storage failed; utilizing resilient ledger:',
      (dbErr as Error).message,
    );
  }

  // Always sync to cache ledger for ultra-fast reading and test isolation
  ordersMap.set(orderId, order);

  const responseBody: ApiResponse<Order & { persistedInDb?: boolean }> = {
    ok: true,
    data: {
      ...order,
      persistedInDb,
    },
  };

  res.status(201).json(responseBody);
});

/**
 * GET /api/orders
 * Retrieves all orders for the current authenticated user or returns recent orders.
 */
ordersRouter.get('/', async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const dbOrders = isValidUuid(userId)
      ? await db
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.buyerId, userId))
          .orderBy(desc(ordersTable.createdAt))
      : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

    if (dbOrders && dbOrders.length > 0) {
      const allOrders: Order[] = [];
      for (const o of dbOrders) {
        const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
        allOrders.push({
          id: o.id,
          buyerId: o.buyerId ?? 'guest-buyer',
          status: o.status as OrderStatus,
          lineItems: items.map((i) => ({
            productId: i.productId ?? '',
            quantity: i.quantity,
            snapshotPriceInPaise: i.snapshotPriceInPaise,
            snapshotTitle: i.snapshotTitle,
            snapshotImageUrl: i.snapshotImageUrl,
          })),
          shippingAddress: {
            line1: o.shippingAddressLine1,
            line2: o.shippingAddressLine2 ?? undefined,
            city: o.shippingCity,
            state: o.shippingState,
            pincode: o.shippingPincode,
            country: o.shippingCountry,
          },
          totalInPaise: o.totalInPaise,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        });
      }

      res.json({ ok: true, data: allOrders });
      return;
    }
  } catch (err) {
    console.warn('[Orders DB Query Warning]', (err as Error).message);
  }

  // Fallback to in-memory ledger
  const ordersList = Array.from(ordersMap.values());
  const filtered = userId ? ordersList.filter((o) => o.buyerId === userId) : ordersList;

  res.json({
    ok: true,
    data: filtered,
  });
});

/**
 * GET /api/orders/:id
 * Retrieves an order by its ID from PostgreSQL or resilient ledger.
 */
ordersRouter.get('/:id', async (req: Request, res: Response) => {
  const id = typeof req.params['id'] === 'string' ? req.params['id'] : '';

  // Attempt database retrieval
  try {
    const [dbOrder] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (dbOrder) {
      const dbItems = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
      const order: Order = {
        id: dbOrder.id,
        buyerId: dbOrder.buyerId ?? 'guest-buyer',
        status: dbOrder.status as OrderStatus,
        lineItems: dbItems.map((item) => ({
          productId: item.productId ?? '',
          quantity: item.quantity,
          snapshotPriceInPaise: item.snapshotPriceInPaise,
          snapshotTitle: item.snapshotTitle,
          snapshotImageUrl: item.snapshotImageUrl,
        })),
        shippingAddress: {
          line1: dbOrder.shippingAddressLine1,
          line2: dbOrder.shippingAddressLine2 ?? undefined,
          city: dbOrder.shippingCity,
          state: dbOrder.shippingState,
          pincode: dbOrder.shippingPincode,
          country: dbOrder.shippingCountry,
        },
        totalInPaise: dbOrder.totalInPaise,
        createdAt: dbOrder.createdAt.toISOString(),
        updatedAt: dbOrder.updatedAt.toISOString(),
      };

      res.json({ ok: true, data: order });
      return;
    }
  } catch (err) {
    console.warn('[Orders DB Query Warning]', (err as Error).message);
  }

  // Fallback to in-memory ledger
  const cachedOrder = ordersMap.get(id);
  if (!cachedOrder) {
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
    data: cachedOrder,
  };

  res.json(responseBody);
});
