'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import styles from './Header.module.css';

/**
 * Site-wide header with responsive navigation and accessible interaction.
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();

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
          {profile ? (
            <div className={styles.userProfile}>
              <span className={styles.userName}>{profile.displayName.split(' ')[0]}</span>
              <button
                type="button"
                onClick={() => void signOut()}
                className={styles.signOutBtn}
                aria-label="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/auth/sign-in" className={styles.signIn}>
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          className={styles.menuButton}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav id="mobile-nav" className={styles.mobileMenu} aria-label="Mobile navigation">
          <Link
            href="/browse"
            className={styles.navLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse
          </Link>
          <Link
            href="/districts"
            className={styles.navLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Districts
          </Link>
          <Link
            href="/crafts"
            className={styles.navLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Crafts
          </Link>
          <Link
            href="/artisan/apply"
            className={styles.navLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Sell with Us
          </Link>
          <Link
            href="/about"
            className={styles.navLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          {profile ? (
            <button
              type="button"
              className={styles.navLink}
              style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              onClick={() => {
                void signOut();
                setMobileMenuOpen(false);
              }}
            >
              Sign out ({profile.displayName.split(' ')[0]})
            </button>
          ) : (
            <Link
              href="/auth/sign-in"
              className={styles.navLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
