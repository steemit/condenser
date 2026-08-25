/**
 * i18n configuration.
 *
 * Locales match the set registered by legacy src/app/Translator.js (zh was
 * dropped by legacy and is not supported here). URLs stay locale-less like
 * legacy, so the active locale is stored in a cookie instead of the path.
 */

export const LOCALES = ['en', 'es', 'ru', 'fr', 'it', 'ko', 'pl', 'ja', 'uk'] as const;

export type Locale = (typeof LOCALES)[number];

/** Legacy DEFAULT_LANGUAGE (client_config.js). */
export const DEFAULT_LOCALE: Locale = 'en';

/** Cookie persisting the locale choice (legacy kept it in user_preferences). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Display labels, same pairing style as the legacy Settings language list. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Spanish Español',
  ru: 'Russian русский',
  fr: 'French français',
  it: 'Italian italiano',
  ko: 'Korean 한국어',
  pl: 'Polish',
  ja: 'Japanese 日本語',
  uk: 'Ukrainian українська',
};
