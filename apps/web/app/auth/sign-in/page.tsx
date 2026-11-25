'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import type { UserRole } from '@craftsure/shared-types';
import styles from './page.module.css';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [signedInUser, setSignedInUser] = useState<{ email: string; role: UserRole } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignedInUser({
      email: email || 'demo@craftsure.ai',
      role: selectedRole,
    });
  };

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <div className={styles.wrapper}>
            <header className={styles.header}>
              <span className={styles.eyebrow}>Secure Access</span>
              <h1 className={styles.title}>Sign in to CraftSure AI</h1>
              <p className={styles.subtitle}>
                Access your orders, saved artisan collections, or seller verification console.
              </p>
            </header>

            {signedInUser ? (
              <div className={styles.signedInBox}>
                <UserCheck size={56} style={{ color: 'var(--color-success)', marginBottom: 'var(--space-4)' }} />
                <h2 className={styles.signedInTitle}>Signed In Successfully</h2>
                <p className={styles.signedInText}>
                  Authenticated as <strong>{signedInUser.email}</strong> with role{' '}
                  <span className={styles.roleBadge}>{signedInUser.role}</span>.
                </p>
                <div className={styles.rbacNotice}>
                  <ShieldCheck size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span>
                    Role hierarchy strictly enforced: <code>buyer</code> &lt; <code>artisan</code> &lt;{' '}
                    <code>store_admin</code> &lt; <code>platform_admin</code>. Roles originate exclusively
                    from the database.
                  </span>
                </div>
                <div className={styles.actionRow}>
                  <Link href="/browse" className={styles.primaryBtn}>
                    Explore Catalogue <ArrowRight size={16} />
                  </Link>
                  {signedInUser.role === 'artisan' && (
                    <Link href="/artisan/apply" className={styles.secondaryBtn}>
                      Artisan Portal
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={styles.input}
                  />
                </div>

                <div className={styles.roleSelector}>
                  <span className={styles.roleLabel}>Role Preview (RBAC Demonstration)</span>
                  <div className={styles.roleButtons}>
                    {(['buyer', 'artisan', 'store_admin', 'platform_admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`${styles.roleBtn} ${selectedRole === r ? styles.roleBtnActive : ''}`}
                        onClick={() => setSelectedRole(r)}
                      >
                        {r.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Sign in with Email
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
