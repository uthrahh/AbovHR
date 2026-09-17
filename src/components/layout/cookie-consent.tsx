"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_DEFAULTS,
  CONSENT_POLICY_VERSION,
  parseConsentCookie,
  type ConsentPreferences,
} from "@/lib/consent";

function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeConsentCookie(prefs: ConsentPreferences) {
  const maxAge = 60 * 60 * 24 * 180; // 180 days
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(prefs))}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft] = useState({ preferences: false, analytics: false, marketing: false });
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // Reads document.cookie, which doesn't exist during SSR — this has to run
    // client-side, post-hydration, to avoid a server/client markup mismatch.
    const existing = parseConsentCookie(readCookie(CONSENT_COOKIE_NAME));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!existing) setVisible(true);
  }, []);

  useEffect(() => {
    if (panelOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [panelOpen]);

  async function persist(prefs: Omit<ConsentPreferences, "decidedAt">) {
    const withTimestamp: ConsentPreferences = { ...prefs, decidedAt: new Date().toISOString() };
    writeConsentCookie(withTimestamp);
    setVisible(false);
    setPanelOpen(false);
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: prefs.preferences,
          analytics: prefs.analytics,
          marketing: prefs.marketing,
        }),
      });
    } catch {
      // Non-fatal: the cookie is the source of truth for gating scripts client-side.
      // The audit log entry can be missing without blocking the user.
    }
  }

  if (!visible) return null;

  return (
    <>
      <div
        role="region"
        aria-label="Cookie consent"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-lg)]"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--color-text-secondary)] sm:max-w-2xl">
            We use necessary cookies to run Abov. With your permission, we&apos;d also like to use
            optional cookies for preferences and analytics. Read our{" "}
            <Link href="/legal/cookie-policy" className="underline">
              cookie policy
            </Link>{" "}
            for details.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => persist({ ...CONSENT_DEFAULTS })}
            >
              Reject non-essential
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft({ preferences: false, analytics: false, marketing: false });
                setPanelOpen(true);
              }}
            >
              Customize
            </Button>
            <Button
              size="sm"
              onClick={() =>
                persist({ necessary: true, preferences: true, analytics: true, marketing: true, version: CONSENT_POLICY_VERSION })
              }
            >
              Accept all
            </Button>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Cookie preferences"
        onClose={() => setPanelOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setPanelOpen(false);
        }}
        className="m-auto w-[min(480px,92vw)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 backdrop:bg-black/50"
      >
        <h2 className="font-display text-xl">Cookie preferences</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Choose which optional cookie categories you allow. Necessary cookies are always on — they keep you
          signed in and remember basic settings.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <ConsentRow label="Necessary" description="Required for sign-in, security, and core site function. Always on." checked disabled />
          <ConsentRow
            label="Preferences"
            description="Remembers choices like saved filters across visits."
            checked={draft.preferences}
            onChange={(v) => setDraft((d) => ({ ...d, preferences: v }))}
          />
          <ConsentRow
            label="Analytics"
            description="Helps us understand product usage in aggregate. No analytics provider is connected in this build."
            checked={draft.analytics}
            onChange={(v) => setDraft((d) => ({ ...d, analytics: v }))}
          />
          <ConsentRow
            label="Marketing"
            description="Would personalize marketing communications. Not used by this build."
            checked={draft.marketing}
            onChange={(v) => setDraft((d) => ({ ...d, marketing: v }))}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPanelOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => persist({ necessary: true, ...draft, version: CONSENT_POLICY_VERSION })}
          >
            Save preferences
          </Button>
        </div>
      </dialog>
    </>
  );
}

function ConsentRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 accent-[var(--color-accent-text)]"
      />
      <span>
        <span className="block text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
        <span className="block text-xs text-[var(--color-text-muted)]">{description}</span>
      </span>
    </label>
  );
}
