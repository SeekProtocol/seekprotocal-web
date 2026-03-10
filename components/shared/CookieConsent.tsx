'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import styles from './CookieConsent.module.css';

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentContextValue {
  preferences: CookiePreferences | null;
  hasConsented: boolean;
  openBanner: () => void;
}

const COOKIE_NAME = 'cookie_consent';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

const defaultPreferences: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

const ConsentContext = createContext<ConsentContextValue>({
  preferences: null,
  hasConsented: false,
  openBanner: () => {},
});

export function useConsent() {
  return useContext(ConsentContext);
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax;Secure`;
}

function getSavedPreferences(): CookiePreferences | null {
  const raw = getCookie(COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      functional: !!parsed.functional,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
    };
  } catch {
    return null;
  }
}

function savePreferences(prefs: CookiePreferences) {
  setCookie(COOKIE_NAME, JSON.stringify(prefs), COOKIE_MAX_AGE);
}

function updateGoogleConsent(prefs: CookiePreferences) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  function gtag(...args: unknown[]) {
    w.dataLayer.push(args);
  }
  gtag('consent', 'update', {
    ad_storage: prefs.marketing ? 'granted' : 'denied',
    ad_user_data: prefs.marketing ? 'granted' : 'denied',
    ad_personalization: prefs.marketing ? 'granted' : 'denied',
    analytics_storage: prefs.analytics ? 'granted' : 'denied',
    functionality_storage: prefs.functional ? 'granted' : 'denied',
    personalization_storage: prefs.functional ? 'granted' : 'denied',
  });
}

function loadGoogleAnalytics() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const GA_ID = typeof window !== 'undefined' ? (window as any).__GA_MEASUREMENT_ID : null;
  if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') return;

  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`)) return;

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  function gtag(...args: unknown[]) {
    w.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });
}

function removeNonEssentialCookies() {
  const essentialPrefixes = [COOKIE_NAME, 'next', '__Host', '__Secure'];
  document.cookie.split(';').forEach((c) => {
    const name = c.trim().split('=')[0];
    if (!essentialPrefixes.some((p) => name.startsWith(p))) {
      document.cookie = `${name}=;path=/;max-age=0`;
      document.cookie = `${name}=;path=/;max-age=0;domain=${window.location.hostname}`;
      document.cookie = `${name}=;path=/;max-age=0;domain=.${window.location.hostname}`;
    }
  });
}

export default function CookieConsent({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [tempPrefs, setTempPrefs] = useState<CookiePreferences>({ ...defaultPreferences });

  useEffect(() => {
    const saved = getSavedPreferences();
    if (saved) {
      setPreferences(saved);
      updateGoogleConsent(saved);
      if (saved.analytics) loadGoogleAnalytics();
    } else {
      const t = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const applyPreferences = useCallback((prefs: CookiePreferences) => {
    const final = { ...prefs, necessary: true };
    savePreferences(final);
    setPreferences(final);
    updateGoogleConsent(final);
    setShowBanner(false);
    setShowDetails(false);

    if (final.analytics) {
      loadGoogleAnalytics();
    }
    if (!final.analytics && !final.marketing) {
      removeNonEssentialCookies();
    }
  }, []);

  const acceptAll = useCallback(() => {
    applyPreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  }, [applyPreferences]);

  const rejectAll = useCallback(() => {
    applyPreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
    removeNonEssentialCookies();
  }, [applyPreferences]);

  const saveCustom = useCallback(() => {
    applyPreferences(tempPrefs);
  }, [applyPreferences, tempPrefs]);

  const openBanner = useCallback(() => {
    const saved = getSavedPreferences();
    if (saved) {
      setTempPrefs(saved);
    } else {
      setTempPrefs({ ...defaultPreferences });
    }
    setShowDetails(true);
    setShowBanner(true);
  }, []);

  const togglePref = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return;
    setTempPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ConsentContext.Provider
      value={{
        preferences,
        hasConsented: preferences !== null,
        openBanner,
      }}
    >
      {children}

      {showBanner && (
        <div className={styles.overlay}>
          <div className={`${styles.banner} ${showDetails ? styles.bannerLarge : ''}`}>
            <div className={styles.header}>
              <div className={styles.iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="9" r="1.5" fill="currentColor" />
                  <circle cx="15" cy="8" r="1" fill="currentColor" />
                  <circle cx="10" cy="14" r="1" fill="currentColor" />
                  <circle cx="16" cy="13" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="11" r="0.75" fill="currentColor" />
                </svg>
              </div>
              <div>
                <h3 className={styles.title}>Cookie Preferences</h3>
                <p className={styles.subtitle}>Manage your privacy settings</p>
              </div>
            </div>

            {!showDetails && (
              <div className={styles.body}>
                <p>
                  We use cookies to enhance your browsing experience, serve personalized
                  content, and analyze our traffic. By clicking &quot;Accept All&quot;, you
                  consent to our use of cookies.
                </p>
                <p className={styles.privacyLink}>
                  Read more in our{' '}
                  <a href="/privacy-policy">Privacy Policy</a>.
                </p>
              </div>
            )}

            {showDetails && (
              <div className={styles.details}>
                <div className={styles.category}>
                  <div className={styles.catHeader}>
                    <div className={styles.catInfo}>
                      <span className={styles.catName}>Necessary</span>
                      <span className={styles.catDesc}>
                        Required for the website to function properly. Cannot be disabled.
                      </span>
                    </div>
                    <div className={`${styles.toggle} ${styles.toggleOn} ${styles.toggleDisabled}`}>
                      <div className={styles.toggleDot} />
                    </div>
                  </div>
                </div>

                <div className={styles.category}>
                  <div className={styles.catHeader}>
                    <div className={styles.catInfo}>
                      <span className={styles.catName}>Functional</span>
                      <span className={styles.catDesc}>
                        Enable enhanced functionality and personalization.
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`${styles.toggle} ${tempPrefs.functional ? styles.toggleOn : ''}`}
                      onClick={() => togglePref('functional')}
                      aria-label="Toggle functional cookies"
                    >
                      <div className={styles.toggleDot} />
                    </button>
                  </div>
                </div>

                <div className={styles.category}>
                  <div className={styles.catHeader}>
                    <div className={styles.catInfo}>
                      <span className={styles.catName}>Analytics</span>
                      <span className={styles.catDesc}>
                        Help us understand how visitors interact with our website.
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`${styles.toggle} ${tempPrefs.analytics ? styles.toggleOn : ''}`}
                      onClick={() => togglePref('analytics')}
                      aria-label="Toggle analytics cookies"
                    >
                      <div className={styles.toggleDot} />
                    </button>
                  </div>
                </div>

                <div className={styles.category}>
                  <div className={styles.catHeader}>
                    <div className={styles.catInfo}>
                      <span className={styles.catName}>Marketing</span>
                      <span className={styles.catDesc}>
                        Used to deliver relevant advertisements and track campaigns.
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`${styles.toggle} ${tempPrefs.marketing ? styles.toggleOn : ''}`}
                      onClick={() => togglePref('marketing')}
                      aria-label="Toggle marketing cookies"
                    >
                      <div className={styles.toggleDot} />
                    </button>
                  </div>
                </div>

                <p className={styles.privacyLink}>
                  Read more in our{' '}
                  <a href="/privacy-policy">Privacy Policy</a>.
                </p>
              </div>
            )}

            <div className={styles.actions}>
              {!showDetails ? (
                <>
                  <button type="button" className={styles.btnReject} onClick={rejectAll}>
                    Reject All
                  </button>
                  <button
                    type="button"
                    className={styles.btnCustomize}
                    onClick={() => {
                      setTempPrefs(preferences || { ...defaultPreferences });
                      setShowDetails(true);
                    }}
                  >
                    Customize
                  </button>
                  <button type="button" className={styles.btnAccept} onClick={acceptAll}>
                    Accept All
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className={styles.btnReject} onClick={rejectAll}>
                    Reject All
                  </button>
                  <button type="button" className={styles.btnAccept} onClick={saveCustom}>
                    Save Preferences
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </ConsentContext.Provider>
  );
}
