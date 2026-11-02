import Link from 'next/link';
import { Search, Heart, ShoppingBag, Menu } from 'lucide-react';
import styles from './Header.module.css';

/**
 * Site-wide header.
 * Server Component — no auth state yet (Phase 1).
 * Auth-aware nav items will be added in M1.4 (Supabase Auth).
 */
export function Header() {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        {/* Brand */}
        <Link href="/" className={styles.brand} aria-label="CraftSure AI — Go to homepage">
          <span className={styles.brandName}>CraftSure</span>
          <span className={styles.brandAi} aria-hidden="true">
            AI
          </span>
        </Link>

        {/* Primary navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/browse" className={styles.navLink}>
            Browse
          </Link>
          <Link href="/districts" className={styles.navLink}>
            Districts
          </Link>
          <Link href="/crafts" className={styles.navLink}>
            Crafts
          </Link>
          <Link href="/artisan/apply" className={styles.navLink}>
            Sell with Us
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/search" className={styles.iconButton} aria-label="Search products">
            <Search size={20} aria-hidden="true" />
          </Link>
          <Link href="/saved" className={styles.iconButton} aria-label="Saved items">
            <Heart size={20} aria-hidden="true" />
          </Link>
          <Link href="/cart" className={styles.iconButton} aria-label="Shopping cart">
            <ShoppingBag size={20} aria-hidden="true" />
          </Link>
          <Link href="/auth/sign-in" className={styles.signIn}>
            Sign in
          </Link>
        </div>

        {/* Mobile menu trigger — behaviour wired up in Phase 1 polish */}
        <button
          className={styles.menuButton}
          aria-label="Open navigation menu"
          aria-expanded="false"
          aria-controls="mobile-nav"
          type="button"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
