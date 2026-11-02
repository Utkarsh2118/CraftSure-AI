import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

// ── Fonts ─────────────────────────────────────────────────────────────────────
// Fraunces: display/heading font — evocative of craft heritage
// Variable weight allows expressive headings without extra font files
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  // Only the weights we actually use
  weight: ['400', '500', '600', '700'],
});

// Inter: body font — clean, legible at small sizes
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// ── Metadata ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'CraftSure AI — Discover Authentic Uttar Pradesh Handicrafts & Handloom',
    template: '%s | CraftSure AI',
  },
  description:
    'Discover, explore and support authentic artisanal crafts across Uttar Pradesh. From Lucknow Chikankari and Banarasi Silk to Moradabad Brass and Gorakhpur Terracotta — browse by district, craft category, and technique.',
  keywords: [
    'Uttar Pradesh handicrafts',
    'ODOP Uttar Pradesh',
    'Chikankari',
    'Banarasi Silk',
    'Moradabad brassware',
    'Gorakhpur terracotta',
    'Saharanpur wood carving',
    'GI tagged crafts',
    'Indian handloom',
    'artisan marketplace',
  ],
  authors: [{ name: 'CraftSure AI' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'CraftSure AI',
  },
};

// ── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
