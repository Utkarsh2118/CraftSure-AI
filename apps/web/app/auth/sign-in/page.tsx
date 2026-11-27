'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

import { Header } from '@/components/layout/Header/Header';
import { GoogleButton } from '@/components/auth/GoogleButton';
import type { UserRole } from '@craftsure/shared-types';
import styles from './page.module.css';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [oauthError, setOauthError] = useState<string | null>(null);

  const [signedInUser, setSignedInUser] = useState<{
    email: string;
    role: UserRole;
  } | null>(null);

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
        <div className={styles.pageContainer}>
          <div className={styles.signInCard}>

            {/* LEFT BRAND PANEL */}
            <section className={styles.brandPanel}>
              <div className={styles.brandContent}>
                <div className={styles.brandBadge}>
                  <Sparkles size={15} />
                  <span>CRAFTED WITH HERITAGE</span>
                </div>

                <h1 className={styles.brandTitle}>
                  Where tradition
                  <br />
                  meets <span>trust.</span>
                </h1>

                <p className={styles.brandDescription}>
                  Discover authentic Indian handicrafts, connect
                  with skilled artisans, and celebrate the beauty
                  of handmade traditions.
                </p>

                <div className={styles.brandDivider} />

                <div className={styles.brandFeatures}>
                  <div className={styles.brandFeature}>
                    <div className={styles.featureIcon}>
                      <ShieldCheck size={19} />
                    </div>

                    <div>
                      <h3>Authentic Craftsmanship</h3>
                      <p>Every craft has a story worth preserving.</p>
                    </div>
                  </div>

                  <div className={styles.brandFeature}>
                    <div className={styles.featureIcon}>
                      <UserCheck size={19} />
                    </div>

                    <div>
                      <h3>Trusted Artisan Community</h3>
                      <p>Supporting the people behind every creation.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.brandFooter}>
                <span>CRAFTSURE AI</span>
                <span>India&apos;s heritage, reimagined.</span>
              </div>
            </section>

            {/* RIGHT FORM PANEL */}
            <section className={styles.formPanel}>
              {!signedInUser ? (
                <>
                  <div className={styles.formHeader}>
                    <span className={styles.formEyebrow}>
                      WELCOME BACK
                    </span>

                    <h2 className={styles.formTitle}>
                      Sign in to your account
                    </h2>

                    <p className={styles.formSubtitle}>
                      Enter your details to continue your journey.
                    </p>
                  </div>

                  {oauthError && (
                    <div className={styles.errorMessage} role="alert">
                      <AlertCircle size={18} />
                      <span>{oauthError}</span>
                    </div>
                  )}

                  <GoogleButton
                    label="Continue with Google"
                    returnUrl="/browse"
                    onError={(err) => setOauthError(err)}
                  />

                  <div className={styles.divider}>
                    <span>or continue with email</span>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                  >
                    {/* EMAIL */}
                    <div className={styles.fieldGroup}>
                      <label
                        htmlFor="email"
                        className={styles.label}
                      >
                        Email address
                      </label>

                      <div className={styles.inputWrapper}>
                        <Mail
                          size={18}
                          className={styles.inputIcon}
                        />

                        <input
                          id="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    {/* PASSWORD */}
                    <div className={styles.fieldGroup}>
                      <div className={styles.labelRow}>
                        <label
                          htmlFor="password"
                          className={styles.label}
                        >
                          Password
                        </label>

                        <Link
                          href="/forgot-password"
                          className={styles.forgotLink}
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <div className={styles.inputWrapper}>
                        <LockKeyhole
                          size={18}
                          className={styles.inputIcon}
                        />

                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className={styles.input}
                        />

                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ROLE SELECTOR */}
                    <div className={styles.roleSelector}>
                      <div className={styles.roleHeader}>
                        <label className={styles.label}>
                          Continue as
                        </label>

                        <span className={styles.roleHint}>
                          Demo preview
                        </span>
                      </div>

                      <div className={styles.roleGrid}>
                        {(
                          [
                            'buyer',
                            'artisan',
                            'store_admin',
                            'platform_admin',
                          ] as UserRole[]
                        ).map((role) => (
                          <button
                            key={role}
                            type="button"
                            className={`${styles.roleBtn} ${
                              selectedRole === role
                                ? styles.roleBtnActive
                                : ''
                            }`}
                            onClick={() => setSelectedRole(role)}
                          >
                            {role.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SUBMIT */}
                    <button
                      type="submit"
                      className={styles.submitBtn}
                    >
                      <span>Sign in</span>
                      <ArrowRight size={18} />
                    </button>

                    <div className={styles.secureNote}>
                      <ShieldCheck size={16} />
                      <span>
                        Your account and information are protected.
                      </span>
                    </div>
                  </form>

                  <div className={styles.bottomText}>
                    New to CraftSure AI?{' '}
                    <Link href="/signup" className={styles.signupLink}>
                      Create an account
                    </Link>
                  </div>
                </>
              ) : (
                /* SUCCESS STATE */
                <div className={styles.successBox}>
                  <div className={styles.successIcon}>
                    <UserCheck size={35} />
                  </div>

                  <span className={styles.formEyebrow}>
                    LOGIN PREVIEW
                  </span>

                  <h2 className={styles.formTitle}>
                    Signed in successfully!
                  </h2>

                  <p className={styles.successText}>
                    You are signed in as:
                  </p>

                  <div className={styles.userInfo}>
                    <span className={styles.userEmail}>
                      {signedInUser.email}
                    </span>

                    <span className={styles.roleBadge}>
                      {signedInUser.role.replace('_', ' ')}
                    </span>
                  </div>

                  <div className={styles.rbacNotice}>
                    <ShieldCheck size={19} />

                    <p>
                      Role hierarchy strictly enforced: buyer,
                      artisan, store admin and platform admin.
                      Roles originate exclusively from the database.
                    </p>
                  </div>

                  <div className={styles.successActions}>
                    <Link
                      href="/browse"
                      className={styles.submitBtn}
                    >
                      Explore Catalogue
                      <ArrowRight size={18} />
                    </Link>

                    {signedInUser.role === 'artisan' && (
                      <Link
                        href="/artisan/apply"
                        className={styles.secondaryBtn}
                      >
                        Artisan Portal
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </section>

          </div>

          <p className={styles.copyright}>
            © 2026 CraftSure AI. Celebrating India&apos;s craftsmanship.
          </p>
        </div>
      </main>
    </>
  );
}
