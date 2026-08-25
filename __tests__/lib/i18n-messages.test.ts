import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALES, isLocale } from '@/lib/i18n/config';
import { enMessages, getMergedMessages } from '@/lib/i18n/messages';

type Messages = Record<string, unknown>;

function flatten(obj: Messages, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Messages, key));
    } else if (typeof v === 'string') {
      out[key] = v;
    }
  }
  return out;
}

function get(messages: Messages, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (node, part) =>
      node !== null && typeof node === 'object'
        ? (node as Messages)[part]
        : undefined,
    messages
  );
}

describe('i18n messages', () => {
  it('generated files cover every supported locale', async () => {
    for (const locale of LOCALES) {
      const messages = (await import(`@/messages/${locale}.json`)).default;
      expect(get(messages as Messages, 'g.login')).toBeTruthy();
    }
  });

  it('keeps the counterpart layer merged underneath the JSON layer', async () => {
    // Legacy Translator.js registered counterpart locale data first, then
    // the JSON translations. The merged output must carry both.
    const ru = await getMergedMessages('ru');
    expect(get(ru as Messages, 'counterpart.formats.date.default')).toBeTruthy();
    expect(get(ru as Messages, 'g.login')).toBe('Войти');
  });

  it('returns the English base untouched for en', async () => {
    const messages = await getMergedMessages('en');
    expect(messages).toBe(enMessages);
  });

  it('falls back to English for keys missing from a locale', async () => {
    // es.json has legacy gaps (e.g. g.administrator); the merged bundle must
    // fill them from en like tt.setFallbackLocale('en') did in production.
    const es = await getMergedMessages('es');
    const enFlat = flatten(enMessages as Messages);
    const esRaw = (await import('@/messages/es.json')).default as Messages;
    const esRawFlat = flatten(esRaw);
    const missing = Object.keys(enFlat).filter((k) => !(k in esRawFlat));
    expect(missing.length).toBeGreaterThan(0);
    for (const key of missing.slice(0, 10)) {
      expect(get(es as Messages, key)).toBe(enFlat[key]);
    }
  });

  it('uses the locale translation when it exists', async () => {
    const es = await getMergedMessages('es');
    expect(get(es as Messages, 'g.login')).toBe('Iniciar sesión');
    expect(get(es as Messages, 'g.sign_up')).toBe('Inscribirse');
  });

  it('falls back to en entirely for unknown locales', async () => {
    const messages = await getMergedMessages('de');
    expect(messages).toBe(enMessages);
  });

  it('decodes the counterpart %% escape during generation', () => {
    // Legacy values were authored for counterpart, where %% is a literal %.
    expect(get(enMessages as Messages, 'reply_editor.default_50_50')).toBe(
      '50% SBD / 50% SP'
    );
  });

  it('isLocale guards the supported set', () => {
    expect(isLocale(DEFAULT_LOCALE)).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});
