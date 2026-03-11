'use client';

import { useTranslations } from 'next-intl';
import { useConsent } from './CookieConsent';

interface CookieConsentButtonProps {
  className?: string;
}

export default function CookieConsentButton({ className }: CookieConsentButtonProps) {
  const { openBanner } = useConsent();
  const t = useTranslations('cookies');

  return (
    <button
      type="button"
      className={className}
      onClick={openBanner}
    >
      {t('cookieSettings')}
    </button>
  );
}
