/**
 * Sanitization schema for the site: hast-util-sanitize's default schema with
 * the site's restrictions and additions applied.
 *
 * bytemd builds every processor on a private copy of the default schema, adds
 * a blanket `className` allowance, and then hands the schema to the `sanitize`
 * callback {@link siteSanitize} before rehype-sanitize runs (see
 * `getProcessor` in bytemd's `dist/index.mjs`). That callback is the only hook
 * the pipeline has, so this module owns three things:
 *
 * 1. which attributes may appear on any element (`'*'`);
 * 2. which `class` values survive on a `<div>`;
 * 3. which URL schemes links and images may use.
 *
 * `hast-util-sanitize` itself is not a direct dependency of this repository:
 * the `Schema` type below is read off bytemd's public `ViewerProps`, and the
 * base schema is captured from bytemd rather than imported.
 */
import { getProcessor, type ViewerProps } from 'bytemd';

import { SITE_DIV_CLASS_WHITELIST } from '@/lib/markdown/constants';

/** A sanitize schema, typed exactly as bytemd passes it to the `sanitize` callback. */
export type SanitizeSchema = Parameters<NonNullable<ViewerProps['sanitize']>>[0];

/** Allowed-attribute table of a schema: tag name (or `'*'`) to property rules. */
type AttributeTable = NonNullable<SanitizeSchema['attributes']>;

/**
 * Attributes allowed on every element.
 *
 * Principle: the global list carries only what the markdown pipeline itself
 * emits, so that markdown an author writes renders correctly; everything else
 * has to be allowed on a specific element by a specific rule, or not at all.
 * When in doubt a property is left out. A missing attribute degrades to
 * plainer markup; a wrongly allowed one is an XSS or UI-redress surface.
 *
 * The default global list has about seventy entries, far too generous for
 * untrusted markup: it mixes form, table, accessibility and scripting-related
 * properties. The names below are hast property names, i.e. the camelCase
 * spellings of the HTML attributes.
 *
 * Kept, because the pipeline produces them and dropping them would break
 * markdown an author wrote:
 *
 * - `align`: cell alignment of a GFM table (`| :--: |`) is emitted by
 *   remark-rehype as `align` on `th`/`td`.
 * - `alt`: the alt text of a markdown image (`![alt](src)`). The default schema
 *   allows it only through `'*'`; the `img` rule alone lists `src`.
 * - `checked`: the state of a checked task-list box. It is only meaningful on
 *   `<input>`, and the default `input` rule pins those to a disabled checkbox.
 * - `start`: the first number of an ordered list that does not start at 1.
 *
 * Everything else in the default list is removed. By hazard:
 *
 * - DOM clobbering and fragment navigation: `id`, `name`. Both would otherwise
 *   survive with a `user-content-` prefix, which is still enough to collide
 *   with page-level ids and named lookups.
 * - Link behaviour: `target`, `rel`, `rev`, `noHref`. Author-supplied values let
 *   a link opt out of `noopener` or force a new tab; link attributes are
 *   rebuilt from constants by the hardening step instead.
 * - Forms and their controls: `action`, `method`, `encType`, `accept`,
 *   `acceptCharset`, `htmlFor`, `useMap`, `isMap`, `prompt`, `multiple`,
 *   `maxLength`, `readOnly`, `selected`, `size`, `value`, `label`, `type`,
 *   `disabled`.
 * - Keyboard and focus hijacking: `accessKey`, `tabIndex`.
 * - Styling and class hooks: `className` (bytemd's blanket allowance; classes
 *   are allowed per element through single-value rules), `color`, `vAlign`,
 *   `hSpace`, `vSpace`, `border`, `frame`, `rules`, and the deprecated table
 *   attributes (`axis`, `char`, `charOff`, `cellPadding`, `cellSpacing`,
 *   `clear`, `compact`, `noShade`, `noWrap`, `scope`, `summary`).
 * - Metadata that is inert but author-controlled and unused by the site:
 *   `abbr`, the `aria*` properties, `charSet`, `coords`, `dateTime`, `dir`,
 *   `headers`, `hrefLang`, `itemProp`, `lang`, `media`, `open`, `span`.
 *
 * `title`, `width`, `height`, `colSpan` and `rowSpan` do come from honest
 * markdown and raw HTML. They are deliberately absent here and will be allowed
 * on the elements where they belong (`a`, `img`, `iframe`, `td`/`th`) together
 * with the hardening rules that constrain them. The complete removed set is
 * pinned by __tests__/lib/markdown/schema.test.ts and the committed snapshot,
 * so an upstream addition to the default list cannot slip through unnoticed.
 */
export const SITE_GLOBAL_ATTRIBUTES = ['align', 'alt', 'checked', 'start'] as const;

/**
 * URL schemes the site accepts. Links and images are restricted to the web
 * schemes plus the two Steem wallet schemes; the default schema's `mailto`,
 * `xmpp`, `irc` and `ircs` are not used by the site and are not accepted.
 */
export const SITE_PROTOCOLS = ['http', 'https', 'steem', 'esteem'] as const;

/**
 * URL-bearing properties known to the default schema.
 *
 * `hast-util-sanitize` only protocol-checks a property that has an entry in
 * `protocols`; a property without one accepts any scheme. Every URL-bearing
 * property that can be allowed must therefore be listed here or be removed
 * from the attribute table altogether. The per-element rules that mention
 * these properties are the default schema's (`a`, `img`, `blockquote`,
 * `del`, `ins`, `q`).
 */
const URL_PROPERTIES = ['cite', 'href', 'longDesc', 'src'] as const;

/**
 * Apply the site rules to `schema` and return the result as a new object.
 *
 * The argument is never modified: bytemd creates a fresh base schema for every
 * processor, but the function also has to be safe to call on a long-lived
 * object (see {@link getSiteSchema}).
 *
 * Lists the function does not touch (`strip`, `ancestors`, `required`,
 * `clobber`, `clobberPrefix`) are carried over by reference from `schema`.
 */
export function siteSanitize(schema: SanitizeSchema): SanitizeSchema {
  const attributes: AttributeTable = { ...schema.attributes };
  attributes['*'] = [...SITE_GLOBAL_ATTRIBUTES];

  // One definition, listing every accepted value. hast-util-sanitize filters
  // an array-valued property such as `className` value by value against a
  // single definition: when the same property is defined several times only
  // the last definition survives, which would silently turn a whitelist into
  // "only the last class".
  attributes.div = [['className', ...SITE_DIV_CLASS_WHITELIST]];

  const tagNames = [...(schema.tagNames ?? [])];
  if (!tagNames.includes('center')) tagNames.push('center');

  const protocolKeys = new Set<string>([
    ...Object.keys(schema.protocols ?? {}),
    ...URL_PROPERTIES,
  ]);
  const protocols: Record<string, string[]> = {};
  for (const key of protocolKeys) protocols[key] = [...SITE_PROTOCOLS];

  return { ...schema, attributes, tagNames, protocols };
}

let baseSchema: SanitizeSchema | undefined;

/**
 * The base schema bytemd really runs with, captured instead of imported.
 *
 * bytemd keeps it as a private string constant inside `getProcessor`, and its
 * own dependency `hast-util-sanitize` is not resolvable from this package under
 * pnpm's strict layout. Passing a `sanitize` callback and returning the schema
 * unchanged exposes exactly the object rehype-sanitize would otherwise have
 * received, with no dependency added and no copy of the upstream list to keep
 * in sync.
 */
function bytemdBaseSchema(): SanitizeSchema {
  if (baseSchema) return baseSchema;

  let captured: SanitizeSchema | undefined;
  getProcessor({
    sanitize: (schema) => {
      captured = schema;
      return schema;
    },
  });
  if (!captured) {
    throw new Error('bytemd did not pass a base schema to the sanitize callback');
  }
  baseSchema = captured;
  return baseSchema;
}

/**
 * The schema the site pipeline ends up running with: bytemd's base schema plus
 * the rules in {@link siteSanitize}. A new object on every call.
 *
 * This is the anchor for the schema snapshots and for any code that needs to
 * sanitize a tree outside the processor; it must not be used to bypass
 * {@link siteSanitize} as the `sanitize` option of bytemd.
 */
export function getSiteSchema(): SanitizeSchema {
  return siteSanitize(bytemdBaseSchema());
}
