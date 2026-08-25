/**
 * build-messages.mjs — generate messages/{locale}.json for next-intl from the
 * legacy condenser locale sources.
 *
 * Merge order matches legacy src/app/Translator.js: the counterpart layer is
 * registered first, then the top-level JSON overrides it (later wins). The
 * counterpart layer is `counterpart/locales/en` for English and
 * `src/app/locales/counterpart/{locale}.js` for the rest.
 *
 * Counterpart uses `%%` as an escaped literal percent; next-intl (ICU) has no
 * such escape, so `%%` is decoded to `%` during generation. The legacy
 * `%(...)s` interpolation placeholders are left untouched — components either
 * avoid interpolated legacy keys or use new ICU keys from
 * `messages/overlays/{locale}.json`, which are merged last.
 *
 * Usage: node scripts/build-messages.mjs [path-to-condenser-legacy]
 */

import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const legacyRoot =
  process.argv[2] || path.resolve(repoRoot, '..', 'condenser-legacy');
const legacyLocales = path.join(legacyRoot, 'src', 'app', 'locales');

// Locales registered in legacy Translator.js (zh was dropped there).
const LOCALES = ['en', 'es', 'ru', 'fr', 'it', 'ko', 'pl', 'ja', 'uk'];

// Resolve requires of the legacy counterpart/*.js files (date-names,
// pluralizers) against the legacy repo's own node_modules.
const legacyRequire = createRequire(path.join(legacyRoot, 'package.json'));

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function deepMerge(base, override) {
  const out = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = isPlainObject(v) && isPlainObject(out[k]) ? deepMerge(out[k], v) : v;
  }
  return out;
}

// Decode counterpart's %% escape; functions (pluralizers) are dropped — they
// were counterpart's pluralization engine, replaced by ICU in next-intl.
function convert(value) {
  if (typeof value === 'string') return value.replace(/%%/g, '%');
  if (Array.isArray(value)) return value.map(convert);
  if (isPlainObject(value)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === 'function') continue;
      out[k] = convert(v);
    }
    return out;
  }
  return value;
}

function loadCounterpartLayer(locale) {
  // Legacy registers the counterpart package's own locale data for en and
  // ru; the other locales have per-locale files under locales/counterpart/.
  const layer =
    locale === 'en' || locale === 'ru'
      ? legacyRequire(`counterpart/locales/${locale}`)
      : existsSync(path.join(legacyLocales, 'counterpart', `${locale}.js`))
        ? legacyRequire(path.join(legacyLocales, 'counterpart', `${locale}.js`))
        : {};
  // counterpart.names holds day/month name arrays used by counterpart's own
  // date formatting. next-intl (ICU + Intl.DateTimeFormat) cannot store
  // arrays in messages and does not need them, so they are dropped; the
  // counterpart.formats date/time patterns are kept for parity.
  if (layer.counterpart) delete layer.counterpart.names;
  return layer;
}

mkdirSync(path.join(repoRoot, 'messages'), { recursive: true });

for (const locale of LOCALES) {
  const counterpartLayer = convert(loadCounterpartLayer(locale));
  // The %% escape appears in the JSON layer too (all sources were authored
  // for counterpart), so decode every layer the same way.
  const jsonLayer = convert(
    JSON.parse(readFileSync(path.join(legacyLocales, `${locale}.json`), 'utf8'))
  );
  const overlayFile = path.join(repoRoot, 'messages', 'overlays', `${locale}.json`);
  const overlay = existsSync(overlayFile)
    ? JSON.parse(readFileSync(overlayFile, 'utf8'))
    : {};
  const merged = deepMerge(deepMerge(counterpartLayer, jsonLayer), overlay);
  const out = path.join(repoRoot, 'messages', `${locale}.json`);
  writeFileSync(out, JSON.stringify(merged, null, 2) + '\n');
  console.log(`wrote ${path.relative(repoRoot, out)}`);
}
