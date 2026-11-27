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
  User,
  AlertCircle,
} from 'lucide-react';

import { Header } from '@/components/layout/Header/Header';
import { GoogleButton } from '@/components/auth/GoogleButton';
import type { UserRole } from '@craftsure/shared-types';
import styles from './page.module.css';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [error, setError] = useState<string | null>(null);

  const [signedUpUser, setSignedUpUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSignedUpUser({
      name: name.trim() || 'Valued User',
      email: email.trim() || 'demo@craftsure.ai',
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
                  Join the movement
                  <br />
                  preserving <span>heritage.</span>
                </h1>

                <p className={styles.brandDescription}>
                  Discover authentic Indian handicrafts, connect directly
                  with skilled artisans, and champion the beauty of
                  centuries-old handmade traditions.
                </p>

                <div className={styles.brandDivider} />

                <div className={styles.brandFeatures}>
                  <div className={styles.brandFeature}>
                    <div className={styles.featureIcon}>
                      <ShieldCheck size={19} />
                    </div>

                    <div>
                      <h3>Authentic GI-Tagged Crafts</h3>
                      <p>Every craft is verified for genuine regional provenance.</p>
                    </div>
                  </div>

                  <div className={styles.brandFeature}>
                    <div className={styles.featureIcon}>
                      <UserCheck size={19} />
                    </div>

                    <div>
                      <h3>Direct Artisan Empowerment</h3>
                      <p>Supporting traditional craft clusters and master makers.</p>
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
              {!signedUpUser ? (
                <>
                  <div className={styles.formHeader}>
                    <span className={styles.formEyebrow}>
                      JOIN CRAFTSURE AI
                    </span>

                    <h2 className={styles.formTitle}>
                      Create your account
                    </h2>

                    <p className={styles.formSubtitle}>
                      Sign up to explore authentic crafts and connect with creators.
                    </p>
                  </div>

                  {error && (
                    <div className={styles.errorMessage} role="alert">
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <GoogleButton
                    label="Sign up with Google"
                    returnUrl="/browse"
                    onError={(err) => setError(err)}
                  />

                  <div className={styles.divider}>
                    <span>or sign up with email</span>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                  >
                    {/* FULL NAME */}
                    <div className={styles.fieldGroup}>
                      <label
                        htmlFor="name"
                        className={styles.label}
                      >
                        Full name
                      </label>

                      <div className={styles.inputWrapper}>
                        <User
                          size={18}
                          className={styles.inputIcon}
                        />

                        <input
                          id="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className={styles.input}
                        />
                      </div>
                    </div>

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
                      <label
                        htmlFor="password"
                        className={styles.label}
                      >
                        Password
                      </label>

                      <div className={styles.inputWrapper}>
                        <LockKeyhole
                          size={18}
                          className={styles.inputIcon}
                        />

                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password (min. 6 characters)"
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

                    {/* CONFIRM PASSWORD */}
                    <div className={styles.fieldGroup}>
                      <label
                        htmlFor="confirmPassword"
                        className={styles.label}
                      >
                        Confirm password
                      </label>

                      <div className={styles.inputWrapper}>
                        <LockKeyhole
                          size={18}
                          className={styles.inputIcon}
                        />

                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className={styles.input}
                        />

                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={
                            showConfirmPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showConfirmPassword ? (
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
                          I want to join as
                        </label>

                        <span className={styles.roleHint}>
                          Select account type
                        </span>
                      </div>

                      <div className={styles.roleGrid}>
                        {(
                          [
                            'buyer',
                            'artisan',
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
                            {role === 'buyer' ? 'Craft Buyer' : 'Artisan / Maker'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SUBMIT */}
                    <button
                      type="submit"
                      className={styles.submitBtn}
                    >
                      <span>Create account</span>
                      <ArrowRight size={18} />
                    </button>

                    <div className={styles.secureNote}>
                      <ShieldCheck size={16} />
                      <span>
                        Your account and personal data are strictly protected.
                      </span>
                    </div>
                  </form>

                  <div className={styles.bottomText}>
                    Already have an account?{' '}
                    <Link href="/auth/sign-in" className={styles.signupLink}>
                      Sign in
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
                    REGISTRATION SUCCESSFUL
                  </span>

                  <h2 className={styles.formTitle}>
                    Welcome to CraftSure AI!
                  </h2>

                  <p className={styles.successText}>
                    Your account has been created for:
                  </p>

                  <div className={styles.userInfo}>
                    <span className={styles.userEmail}>
                      {signedUpUser.name} ({signedUpUser.email})
                    </span>

                    <span className={styles.roleBadge}>
                      {signedUpUser.role === 'buyer' ? 'Craft Buyer' : 'Artisan'}
                    </span>
                  </div>

                  <div className={styles.rbacNotice}>
                    <ShieldCheck size={19} />

                    <p>
                      Welcome to the verified handicraft network. You can now explore
                      curated regional craft collections or register artisan workshops.
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

                    {signedUpUser.role === 'artisan' ? (
                      <Link
                        href="/artisan/apply"
                        className={styles.secondaryBtn}
                      >
                        Artisan Onboarding
                      </Link>
                    ) : (
                      <Link
                        href="/auth/sign-in"
                        className={styles.secondaryBtn}
                      >
                        Go to Sign In
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
