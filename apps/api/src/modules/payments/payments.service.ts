import crypto from 'crypto';
import Razorpay from 'razorpay';
import { eq } from 'drizzle-orm';
import type {
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  Order,
  OrderLineItem,
} from '@craftsure/shared-types';
import { env } from '../../config/env';
import { db, ordersTable, orderItemsTable, productsTable } from '../../database';
import { ordersMap } from '../orders/orders.router';
import { DEMO_PRODUCTS } from '../products/products.router';

export class PaymentError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'PAYMENT_ERROR', status = 400, details?: unknown) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Initializes Razorpay instance or provides test-mode mock when keys are absent.
 */
function initRazorpayClient(): Razorpay | null {
  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    try {
      return new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
    } catch (err) {
      console.warn('[Razorpay Init Warning] Failed to initialize official SDK, falling back to mock:', err);
    }
  }
  return null;
}

export const razorpayClient = initRazorpayClient();

export class PaymentsService {
  /**
   * Resolves authoritative product pricing strictly from backend data.
   * Rejects client-supplied prices or forged totals.
   */
  public async getAuthoritativeProduct(productId: string): Promise<{
    id: string;
    title: string;
    priceInPaise: number;
    imageUrl: string | null;
  }> {
    // 1. Check PostgreSQL database first
    try {
      const [dbProduct] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, productId));

      if (dbProduct) {
        return {
          id: dbProduct.id,
          title: dbProduct.title,
          priceInPaise: dbProduct.priceInPaise,
          imageUrl: null,
        };
      }
    } catch {
      // Offline fallback
    }

    // 2. Check in-memory demo catalogue
    const demoProd = DEMO_PRODUCTS.find((p) => p.id === productId);
    if (demoProd) {
      return {
        id: demoProd.id,
        title: demoProd.title,
        priceInPaise: demoProd.priceInPaise,
        imageUrl: demoProd.images[0]?.url ?? null,
      };
    }

    throw new PaymentError(
      `Product with ID "${productId}" does not exist in the catalogue.`,
      'PRODUCT_NOT_FOUND',
      404,
    );
  }

  /**
   * Creates a Razorpay order with server-calculated price and registers a pending order in the ledger.
   */
  public async createPaymentOrder(
    payload: CreatePaymentOrderRequest,
    buyerId = 'guest-buyer',
  ): Promise<CreatePaymentOrderResponse> {
    if (!payload.lineItems || payload.lineItems.length === 0) {
      throw new PaymentError('Order must contain at least one line item.', 'EMPTY_ORDER', 400);
    }

    // Authoritative server-side calculation (Rule: Never trust frontend price)
    const lineItemDetails: OrderLineItem[] = [];
    let subtotalPaise = 0;

    for (const item of payload.lineItems) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new PaymentError(
          `Invalid quantity for product ${item.productId}. Must be a positive integer.`,
          'INVALID_QUANTITY',
          400,
        );
      }

      const product = await this.getAuthoritativeProduct(item.productId);
      const itemSubtotal = product.priceInPaise * item.quantity;
      subtotalPaise += itemSubtotal;

      lineItemDetails.push({
        productId: product.id,
        quantity: item.quantity,
        snapshotPriceInPaise: product.priceInPaise,
        snapshotTitle: product.title,
        snapshotImageUrl: product.imageUrl,
      });
    }

    // Delivery fee rule: Free above ₹2,000 (200,000 paise), else ₹120 (12,000 paise)
    const deliveryPaise = subtotalPaise >= 200000 ? 0 : 12000;
    const totalInPaise = subtotalPaise + deliveryPaise;

    const orderId = `CS-UP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    let razorpayOrderId = '';
    if (razorpayClient) {
      try {
        const rzpOrder = await razorpayClient.orders.create({
          amount: totalInPaise,
          currency: 'INR',
          receipt: orderId,
          notes: {
            orderId,
            buyerEmail: payload.buyerEmail,
            buyerPhone: payload.buyerPhone,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        throw new PaymentError(
          `Razorpay gateway error: ${(err as Error).message}`,
          'GATEWAY_ERROR',
          502,
        );
      }
    } else {
      // Deterministic test-mode mock order ID
      razorpayOrderId = `order_mock_${Math.random().toString(36).substring(2, 12)}`;
    }

    const pendingOrder: Order = {
      id: orderId,
      buyerId,
      lineItems: lineItemDetails,
      status: 'pending',
      shippingAddress: {
        line1: payload.shippingAddress.line1,
        line2: payload.shippingAddress.line2,
        city: payload.shippingAddress.city,
        state: payload.shippingAddress.state,
        pincode: payload.shippingAddress.pincode,
        country: payload.shippingAddress.country ?? 'India',
      },
      totalInPaise,
      paymentMethod: payload.paymentMethod ?? 'razorpay',
      paymentStatus: 'pending',
      razorpayOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in fallback memory ledger
    ordersMap.set(orderId, pendingOrder);

    // Persist to PostgreSQL if available
    try {
      await db
        .insert(ordersTable)
        .values({
          id: pendingOrder.id,
          buyerId: null,
          buyerName: payload.buyerName,
          buyerEmail: payload.buyerEmail,
          buyerPhone: payload.buyerPhone,
          status: 'pending',
          shippingAddressLine1: payload.shippingAddress.line1,
          shippingAddressLine2: payload.shippingAddress.line2 ?? null,
          shippingCity: payload.shippingAddress.city,
          shippingState: payload.shippingAddress.state,
          shippingPincode: payload.shippingAddress.pincode,
          shippingCountry: payload.shippingAddress.country ?? 'India',
          subtotalInPaise: subtotalPaise,
          deliveryInPaise: deliveryPaise,
          totalInPaise,
          paymentMethod: 'razorpay',
          paymentStatus: 'pending',
          razorpayOrderId,
        })
        .onConflictDoNothing();

      for (const item of lineItemDetails) {
        await db.insert(orderItemsTable).values({
          orderId: pendingOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          snapshotPriceInPaise: item.snapshotPriceInPaise,
          snapshotTitle: item.snapshotTitle,
          snapshotImageUrl: item.snapshotImageUrl,
        });
      }
    } catch {
      // Persistence warning - in-memory fallback already registered
    }

    return {
      orderId,
      razorpayOrderId,
      amountInPaise: totalInPaise,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
      buyerName: payload.buyerName,
      buyerEmail: payload.buyerEmail,
      buyerPhone: payload.buyerPhone,
    };
  }

  /**
   * Verifies Razorpay HMAC SHA256 payment signature using timing-safe comparison.
   * Updates order payment status idempotently.
   */
  public async verifyPayment(payload: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new PaymentError('Missing required payment verification parameters.', 'INVALID_PARAMETERS', 400);
    }

    // Retrieve order from memory ledger or database
    let existingOrder: Order | undefined = ordersMap.get(orderId);
    if (!existingOrder) {
      try {
        const [dbRow] = await db
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.id, orderId));

        if (dbRow) {
          existingOrder = {
            id: dbRow.id,
            buyerId: dbRow.buyerId ?? 'guest-buyer',
            lineItems: [],
            status: dbRow.status,
            shippingAddress: {
              line1: dbRow.shippingAddressLine1,
              line2: dbRow.shippingAddressLine2 ?? undefined,
              city: dbRow.shippingCity,
              state: dbRow.shippingState,
              pincode: dbRow.shippingPincode,
              country: dbRow.shippingCountry,
            },
            totalInPaise: dbRow.totalInPaise,
            paymentMethod: dbRow.paymentMethod,
            paymentStatus: dbRow.paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
            razorpayOrderId: dbRow.razorpayOrderId,
            razorpayPaymentId: dbRow.razorpayPaymentId,
            paymentVerifiedAt: dbRow.paymentVerifiedAt ? dbRow.paymentVerifiedAt.toISOString() : undefined,
            createdAt: dbRow.createdAt.toISOString(),
            updatedAt: dbRow.updatedAt.toISOString(),
          };
          ordersMap.set(orderId, existingOrder);
        }
      } catch {
        // DB lookup failure
      }
    }

    if (!existingOrder) {
      throw new PaymentError(`Order "${orderId}" not found.`, 'ORDER_NOT_FOUND', 404);
    }

    // Idempotency: If order is already paid, return confirmed success immediately
    if (existingOrder.paymentStatus === 'paid') {
      return {
        success: true,
        orderId,
        status: 'confirmed',
        paymentStatus: 'paid',
      };
    }

    // Verify HMAC SHA256 signature
    const secret = env.RAZORPAY_KEY_SECRET || 'test_secret_12345';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(razorpaySignature, 'utf8');

    const isValidSignature =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValidSignature) {
      throw new PaymentError(
        'Payment signature verification failed. Untrusted payment response.',
        'INVALID_SIGNATURE',
        400,
      );
    }

    // Update order status
    const verifiedTimestamp = new Date().toISOString();
    const updatedOrder: Order = {
      ...existingOrder,
      status: 'confirmed',
      paymentStatus: 'paid',
      razorpayPaymentId,
      paymentVerifiedAt: verifiedTimestamp,
      updatedAt: verifiedTimestamp,
    };

    ordersMap.set(orderId, updatedOrder);

    try {
      await db
        .update(ordersTable)
        .set({
          status: 'confirmed',
          paymentStatus: 'paid',
          razorpayPaymentId,
          razorpaySignature,
          paymentVerifiedAt: new Date(verifiedTimestamp),
          updatedAt: new Date(),
        })
        .where(eq(ordersTable.id, orderId));
    } catch {
      // Ledger updated
    }

    return {
      success: true,
      orderId,
      status: 'confirmed',
      paymentStatus: 'paid',
    };
  }

  /**
   * Processes Razorpay webhooks idempotently using raw body HMAC SHA256 signature validation.
   */
  public async handleWebhook(
    rawBody: Buffer | string,
    signature: string | undefined,
    payload: Record<string, unknown>,
  ): Promise<{ processed: boolean; reason?: string }> {
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret_12345';

    if (!signature) {
      throw new PaymentError('Missing Razorpay webhook signature header.', 'MISSING_SIGNATURE', 400);
    }

    const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyBuffer)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');

    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      throw new PaymentError('Invalid webhook signature.', 'INVALID_WEBHOOK_SIGNATURE', 400);
    }

    const event = payload['event'] as string | undefined;
    const paymentEntity = (payload['payload'] as Record<string, unknown> | undefined)?.[
      'payment'
    ] as Record<string, unknown> | undefined;
    const entity = (paymentEntity?.['entity'] as Record<string, unknown> | undefined) ?? {};

    const razorpayOrderId = entity['order_id'] as string | undefined;
    const razorpayPaymentId = entity['id'] as string | undefined;

    if (!razorpayOrderId) {
      return { processed: false, reason: 'No order_id in webhook payload' };
    }

    // Locate matching order by razorpayOrderId
    let targetOrder: Order | undefined;
    for (const order of ordersMap.values()) {
      if (order.razorpayOrderId === razorpayOrderId) {
        targetOrder = order;
        break;
      }
    }

    if (!targetOrder) {
      try {
        const [dbRow] = await db
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.razorpayOrderId, razorpayOrderId));

        if (dbRow) {
          targetOrder = {
            id: dbRow.id,
            buyerId: dbRow.buyerId ?? 'guest-buyer',
            lineItems: [],
            status: dbRow.status,
            shippingAddress: {
              line1: dbRow.shippingAddressLine1,
              city: dbRow.shippingCity,
              state: dbRow.shippingState,
              pincode: dbRow.shippingPincode,
              country: dbRow.shippingCountry,
            },
            totalInPaise: dbRow.totalInPaise,
            paymentMethod: dbRow.paymentMethod,
            paymentStatus: dbRow.paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
            razorpayOrderId: dbRow.razorpayOrderId,
            razorpayPaymentId: dbRow.razorpayPaymentId,
            createdAt: dbRow.createdAt.toISOString(),
            updatedAt: dbRow.updatedAt.toISOString(),
          };
          ordersMap.set(dbRow.id, targetOrder);
        }
      } catch {
        // Ignore
      }
    }

    if (!targetOrder) {
      return { processed: false, reason: `Order matching ${razorpayOrderId} not found` };
    }

    // Idempotent handling
    if (event === 'payment.captured' || event === 'order.paid') {
      if (targetOrder.paymentStatus === 'paid') {
        return { processed: true, reason: 'Already paid' };
      }

      const verifiedTimestamp = new Date().toISOString();
      const updatedOrder: Order = {
        ...targetOrder,
        status: 'confirmed',
        paymentStatus: 'paid',
        razorpayPaymentId: razorpayPaymentId ?? targetOrder.razorpayPaymentId,
        paymentVerifiedAt: verifiedTimestamp,
        updatedAt: verifiedTimestamp,
      };

      ordersMap.set(targetOrder.id, updatedOrder);

      try {
        await db
          .update(ordersTable)
          .set({
            status: 'confirmed',
            paymentStatus: 'paid',
            razorpayPaymentId: razorpayPaymentId ?? null,
            paymentVerifiedAt: new Date(verifiedTimestamp),
            updatedAt: new Date(),
          })
          .where(eq(ordersTable.id, targetOrder.id));
      } catch {
        // Fallback
      }

      return { processed: true, reason: 'Payment captured and order confirmed' };
    }

    if (event === 'payment.failed') {
      const updatedOrder: Order = {
        ...targetOrder,
        status: 'pending',
        paymentStatus: 'failed',
        updatedAt: new Date().toISOString(),
      };

      ordersMap.set(targetOrder.id, updatedOrder);
      return { processed: true, reason: 'Payment marked as failed' };
    }

    return { processed: true, reason: `Event ${event} ignored` };
  }
}

export const paymentsService = new PaymentsService();
