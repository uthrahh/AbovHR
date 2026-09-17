export const CONSENT_COOKIE_NAME = "abov-consent";
export const CONSENT_POLICY_VERSION = "2026-09-18";

export type ConsentPreferences = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  version: string;
  decidedAt: string;
};

export const CONSENT_DEFAULTS: Omit<ConsentPreferences, "decidedAt"> = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
  version: CONSENT_POLICY_VERSION,
};

export function parseConsentCookie(raw: string | undefined): ConsentPreferences | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === CONSENT_POLICY_VERSION) {
      return parsed as ConsentPreferences;
    }
    return null;
  } catch {
    return null;
  }
}
