import type { AbstractIntlMessages } from 'next-intl';

import { DEFAULT_LOCALE, isLocale, type Locale } from './config';
import enMessages from '@/messages/en.json';

export { enMessages };

type Messages = AbstractIntlMessages;

// Dynamic import per locale so only the active language ships to the client.
// English is statically imported: it is both the SSR default and the
// fallback base for every other locale.
const localeLoaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: () => Promise.resolve({ default: enMessages as Messages }),
  es: () => import('@/messages/es.json'),
  ru: () => import('@/messages/ru.json'),
  fr: () => import('@/messages/fr.json'),
  it: () => import('@/messages/it.json'),
  ko: () => import('@/messages/ko.json'),
  pl: () => import('@/messages/pl.json'),
  ja: () => import('@/messages/ja.json'),
  uk: () => import('@/messages/uk.json'),
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge(base: Messages, override: Messages): Messages {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    const b = out[k];
    out[k] =
      isPlainObject(v) && isPlainObject(b)
        ? deepMerge(b as Messages, v as Messages)
        : v;
  }
  return out as Messages;
}

const cache = new Map<Locale, Promise<Messages>>();

/**
 * Load the messages for a locale, deep-merged over English so keys missing
 * from a translation fall back to en (legacy production behavior:
 * tt.setFallbackLocale('en')).
 */
export function getMergedMessages(locale: string): Promise<Messages> {
  const target: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  if (target === DEFAULT_LOCALE) {
    return Promise.resolve(enMessages as Messages);
  }
  let cached = cache.get(target);
  if (!cached) {
    cached = localeLoaders[target]().then(
      (m) => deepMerge(enMessages as Messages, m.default),
      // A locale that fails to load degrades to English rather than
      // breaking the UI.
      () => enMessages as Messages
    );
    cache.set(target, cached);
  }
  return cached;
}
