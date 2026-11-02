'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { useCartStore } from '@/lib/store/cart';
import { formatPaise } from '@/lib/utils/currency';
import styles from './page.module.css';

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const subtotalPaise = useCartStore((state) => state.subtotalPaise());
  const deliveryPaise = useCartStore((state) => state.deliveryPaise());
  const grandTotalPaise = useCartStore((state) => state.grandTotalPaise());
  const clearCart = useCartStore((state) => state.clearCart);

  // Form State
  const [fullName, setFullName] = useState('Ananya Sharma');
  const [email, setEmail] = useState('ananya.sharma@example.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [addressLine, setAddressLine] = useState('14, Civil Lines, Near High Court');
  const [city, setCity] = useState('Prayagraj');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('211001');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');

  // Confirmation state
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    totalPaid: number;
    itemCount: number;
    shippingAddress: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `CS-UP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedOrder({
      orderId,
      totalPaid: grandTotalPaise,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      shippingAddress: `${addressLine}, ${city}, ${state} - ${pincode}`,
    });
    clearCart();
  };

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.header}>
            <h1 className={styles.title}>
              {confirmedOrder ? 'Order Confirmed!' : 'Artisan Marketplace Checkout'}
            </h1>
          </header>

          {confirmedOrder ? (
            <div className={styles.successBox}>
              <div className={styles.successIcon}>
                <CheckCircle2 size={36} aria-hidden="true" />
              </div>
              <h2 className={styles.successTitle}>Thank You for Supporting UP Artisans!</h2>
              <div className={styles.orderIdBadge}>Order Ref: {confirmedOrder.orderId}</div>

              <div className={styles.receiptCard}>
                <div>
                  <strong>Total Amount Paid:</strong> {formatPaise(confirmedOrder.totalPaid)}
                </div>
                <div>
                  <strong>Items Ordered:</strong> {confirmedOrder.itemCount} handcrafted piece(s)
                </div>
                <div>
                  <strong>Delivery To:</strong> {confirmedOrder.shippingAddress}
                </div>
                <div>
                  <strong>Artisan Dispatch:</strong> 2–4 business days via UP Handloom Logistics
                </div>
              </div>

              <Link href="/browse" className={styles.continueBtn}>
                Explore More Crafts
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                Your cart is empty. Please add items before checking out.
              </p>
              <Link href="/browse" className={styles.continueBtn}>
                Browse Catalogue
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.layout}>
              {/* Form columns */}
              <div>
                <div className={styles.formSection}>
                  <h2 className={styles.sectionTitle}>1. Buyer Details</h2>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="full-name" className={styles.label}>
                        Full Name
                      </label>
                      <input
                        id="full-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="phone" className={styles.label}>
                        Mobile Number (+91)
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.inputGroupFull}>
                      <label htmlFor="email" className={styles.label}>
                        Email Address (for invoice & tracking)
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h2 className={styles.sectionTitle}>2. Shipping Address</h2>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroupFull}>
                      <label htmlFor="address-line" className={styles.label}>
                        Street Address / Landmark
                      </label>
                      <input
                        id="address-line"
                        type="text"
                        required
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="city" className={styles.label}>
                        City / District
                      </label>
                      <input
                        id="city"
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="state" className={styles.label}>
                        State
                      </label>
                      <input
                        id="state"
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="pincode" className={styles.label}>
                        PIN Code
                      </label>
                      <input
                        id="pincode"
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h2 className={styles.sectionTitle}>3. Payment Method (Demo)</h2>
                  <div className={styles.radioGroup}>
                    <label
                      className={`${styles.radioLabel} ${paymentMethod === 'upi' ? styles.selectedRadio : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                      />
                      <span>UPI (Instant QR / VPA — Google Pay, PhonePe, Paytm, BHIM)</span>
                    </label>

                    <label
                      className={`${styles.radioLabel} ${paymentMethod === 'card' ? styles.selectedRadio : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <span>Credit / Debit Card / RuPay (Domestic & International)</span>
                    </label>

                    <label
                      className={`${styles.radioLabel} ${paymentMethod === 'cod' ? styles.selectedRadio : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <span>Cash on Delivery (Verified Domestic Addresses)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sidebar Summary */}
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Order Review</h2>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className={styles.orderItemRow}>
                      <span>
                        {quantity}x {product.title}
                      </span>
                      <span>{formatPaise(product.priceInPaise * quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatPaise(subtotalPaise)}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span>Delivery</span>
                  <span>{deliveryPaise === 0 ? 'FREE' : formatPaise(deliveryPaise)}</span>
                </div>

                <div className={styles.summaryTotal}>
                  <span>Grand Total</span>
                  <span>{formatPaise(grandTotalPaise)}</span>
                </div>

                <button type="submit" className={styles.placeOrderBtn}>
                  Complete Demo Order ({formatPaise(grandTotalPaise)})
                </button>

                <p className={styles.disclaimer}>
                  <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Demo Mode: Prices calculated strictly in integer paise. No real payment charge is made.
                </p>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

