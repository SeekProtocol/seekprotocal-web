'use client';

import { useConsent } from './CookieConsent';

interface CookieConsentButtonProps {
  className?: string;
}

export default function CookieConsentButton({ className }: CookieConsentButtonProps) {
  const { openBanner } = useConsent();

  return (
    <button
      type="button"
      className={className}
      onClick={openBanner}
    >
      Cookie Settings
    </button>
  );
}
