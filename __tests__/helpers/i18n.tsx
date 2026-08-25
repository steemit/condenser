import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';

import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { enMessages, getMergedMessages } from '@/lib/i18n/messages';

/**
 * Wrap a component in a NextIntlClientProvider for tests. Defaults to
 * English; pass a locale + its merged messages to render translations.
 */
export function IntlWrapper({
  children,
  locale = DEFAULT_LOCALE,
  messages = enMessages,
}: {
  children: ReactNode;
  locale?: Locale;
  messages?: typeof enMessages;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export { getMergedMessages };
