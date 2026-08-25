'use client';

import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { useEffect, useState } from 'react';

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from '@/lib/i18n/config';
import { enMessages, getMergedMessages } from '@/lib/i18n/messages';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLocale } from '@/store/slices/appSlice';

function readLocaleCookie(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

/**
 * Locale bridge between Redux (user_preferences.locale, like legacy
 * state.app) and next-intl.
 *
 * URLs stay locale-less (legacy behavior), so the choice persists in the
 * NEXT_LOCALE cookie. SSR and the first client render always use English
 * (also legacy behavior — the locale lived in client-side user
 * preferences); the cookie value is applied right after mount. Switching
 * language is a pure client-side state change: messages for the new locale
 * are loaded on demand and swapped in without a navigation.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const preference = useAppSelector((s) => s.app.user_preferences.locale);

  // The bundle actually rendered; updated only once the new locale's
  // messages have loaded so locale and messages never go out of sync.
  const [bundle, setBundle] = useState<{ locale: Locale; messages: AbstractIntlMessages }>({
    locale: DEFAULT_LOCALE,
    messages: enMessages as AbstractIntlMessages,
  });

  // Hydrate the Redux preference from the cookie on first mount.
  useEffect(() => {
    if (!isLocale(preference)) {
      dispatch(setLocale(readLocaleCookie()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const target: Locale = isLocale(preference) ? preference : DEFAULT_LOCALE;

  useEffect(() => {
    let cancelled = false;
    void getMergedMessages(target).then((messages) => {
      if (!cancelled) setBundle({ locale: target, messages });
    });
    writeLocaleCookie(target);
    document.documentElement.lang = target;
    return () => {
      cancelled = true;
    };
  }, [target]);

  return (
    <NextIntlClientProvider locale={bundle.locale} messages={bundle.messages}>
      {children}
    </NextIntlClientProvider>
  );
}
