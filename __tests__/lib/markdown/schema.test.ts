// @vitest-environment node
/**
 * Site sanitization schema.
 *
 * Two layers:
 *
 * 1. `siteSanitize` as a pure transformation: every rule is checked on a small
 *    hand-built schema, so each assertion says exactly which rule it is about.
 * 2. The schema the pipeline really runs with (`getSiteSchema()`): bytemd's
 *    base schema with the site rules applied. Its tag, attribute and protocol
 *    tables are committed as snapshots, so an upstream change to hast-util-
 *    sanitize's default schema shows up in review instead of shipping silently.
 */
import { describe, expect, it } from 'vitest';

import { renderClean } from '../../helpers/markdown';
import { SITE_DIV_CLASS_WHITELIST } from '@/lib/markdown/constants';
import {
  SITE_GLOBAL_ATTRIBUTES,
  SITE_PROTOCOLS,
  getSiteSchema,
  siteSanitize,
  type SanitizeSchema,
} from '@/lib/markdown/schema';

/**
 * A stand-in for bytemd's base schema: the same keys, a few rules of each
 * kind. Deliberately not the upstream default (which is what the snapshot
 * layer below is for), so a failure here points at one rule of the transform.
 */
function makeBaseSchema(): SanitizeSchema {
  return {
    strip: ['script'],
    clobberPrefix: 'user-content-',
    clobber: ['name', 'id'],
    ancestors: { td: ['table'], tr: ['table'] },
    protocols: {
      href: ['http', 'https', 'mailto'],
      src: ['http', 'https'],
      cite: ['http', 'https'],
      longDesc: ['http', 'https'],
    },
    tagNames: ['p', 'a', 'div', 'td', 'tr', 'input', 'li'],
    attributes: {
      a: ['href'],
      img: ['src', 'longDesc'],
      input: [
        ['type', 'checkbox'],
        ['disabled', true],
      ],
      li: [['className', 'task-list-item']],
      div: ['itemScope', 'itemType'],
      '*': [
        ...SITE_GLOBAL_ATTRIBUTES,
        'className',
        'abbr',
        'accept',
        'accessKey',
        'action',
        'ariaLabel',
        'border',
        'cellPadding',
        'colSpan',
        'disabled',
        'encType',
        'height',
        'hrefLang',
        'htmlFor',
        'id',
        'isMap',
        'itemProp',
        'label',
        'lang',
        'method',
        'name',
        'prompt',
        'rel',
        'rowSpan',
        'tabIndex',
        'target',
        'title',
        'type',
        'useMap',
        'value',
        'width',
      ],
    },
    required: { input: { type: 'checkbox', disabled: true } },
  };
}

/** Attributes the global list must never carry again, whatever else changes. */
const FORBIDDEN_GLOBAL_ATTRIBUTES = [
  'className',
  'id',
  'name',
  'target',
  'rel',
  'action',
  'method',
  'encType',
  'htmlFor',
  'useMap',
  'isMap',
  'prompt',
  'accessKey',
  'tabIndex',
];

describe('siteSanitize (pure transformation)', () => {
  it('returns a new object and leaves the argument untouched', () => {
    const base = makeBaseSchema();
    const before = JSON.parse(JSON.stringify(base)) as unknown;

    const result = siteSanitize(base);

    expect(result).not.toBe(base);
    expect(result.attributes).not.toBe(base.attributes);
    expect(result.tagNames).not.toBe(base.tagNames);
    expect(result.protocols).not.toBe(base.protocols);
    expect(JSON.parse(JSON.stringify(base))).toEqual(before);
  });

  describe("the global attribute list ('*')", () => {
    it('is exactly the explicit site list', () => {
      expect(siteSanitize(makeBaseSchema()).attributes?.['*']).toEqual([...SITE_GLOBAL_ATTRIBUTES]);
    });

    it.each(FORBIDDEN_GLOBAL_ATTRIBUTES)('drops the dangerous %s', (attribute) => {
      expect(siteSanitize(makeBaseSchema()).attributes?.['*']).not.toContain(attribute);
    });

    it('keeps only what the markdown pipeline itself emits', () => {
      // alt: image alt text; align: table cell alignment;
      // checked: task-list box state; start: ordered-list start number.
      expect([...SITE_GLOBAL_ATTRIBUTES]).toEqual(['align', 'alt', 'checked', 'start']);
    });

    it('replaces the incoming global list outright', () => {
      const base = makeBaseSchema();
      base.attributes!['*'] = ['data-anything', 'style', 'srcdoc'];
      expect(siteSanitize(base).attributes?.['*']).toEqual([...SITE_GLOBAL_ATTRIBUTES]);
    });
  });

  describe("the <div> class whitelist", () => {
    it('is a single definition listing every accepted class', () => {
      expect(siteSanitize(makeBaseSchema()).attributes?.div).toEqual([
        ['className', ...SITE_DIV_CLASS_WHITELIST],
      ]);
    });

    it('does not keep the default div attributes (microdata)', () => {
      const div = siteSanitize(makeBaseSchema()).attributes?.div ?? [];
      expect(div.flat()).not.toContain('itemScope');
      expect(div.flat()).not.toContain('itemType');
    });

    it('is registered once, not once per class', () => {
      // Several `['className', …]` entries in a row do not add up: the
      // sanitizer keeps only the last one, which would drop every class but
      // one. One entry with every value is the only correct shape.
      const div = siteSanitize(makeBaseSchema()).attributes?.div ?? [];
      const classNameDefinitions = div.filter((rule) => Array.isArray(rule) && rule[0] === 'className');
      expect(classNameDefinitions).toHaveLength(1);
    });
  });

  describe('tag names', () => {
    it('allows <center>', () => {
      expect(siteSanitize(makeBaseSchema()).tagNames).toContain('center');
    });

    it('does not list center twice when the input already has it', () => {
      const base = makeBaseSchema();
      base.tagNames = ['p', 'center'];
      expect(siteSanitize(base).tagNames).toEqual(['p', 'center']);
    });

    it('does not allow <iframe> (left to the hardening rules)', () => {
      expect(siteSanitize(makeBaseSchema()).tagNames).not.toContain('iframe');
    });
  });

  describe('URL protocols', () => {
    it('restricts links and images to the site schemes', () => {
      const protocols = siteSanitize(makeBaseSchema()).protocols;
      expect(protocols?.href).toEqual([...SITE_PROTOCOLS]);
      expect(protocols?.src).toEqual([...SITE_PROTOCOLS]);
    });

    it('aligns every other URL-bearing property instead of leaving it wider', () => {
      const protocols = siteSanitize(makeBaseSchema()).protocols;
      expect(protocols?.cite).toEqual([...SITE_PROTOCOLS]);
      expect(protocols?.longDesc).toEqual([...SITE_PROTOCOLS]);
      // The default schemes are gone: a link to a mail address is not a
      // feature of the site, and neither are the chat schemes.
      expect(protocols?.href).not.toContain('mailto');
    });

    it('aligns URL properties the input adds', () => {
      const base = makeBaseSchema();
      base.protocols!.poster = ['javascript'];
      expect(siteSanitize(base).protocols?.poster).toEqual([...SITE_PROTOCOLS]);
    });

    it('hands out fresh protocol lists, so callers cannot mutate the shared constant', () => {
      const first = siteSanitize(makeBaseSchema()).protocols!;
      first.href.push('javascript');
      expect(siteSanitize(makeBaseSchema()).protocols?.href).toEqual([...SITE_PROTOCOLS]);
      expect(SITE_PROTOCOLS).not.toContain('javascript');
    });
  });

  describe('rules it must leave alone', () => {
    it('keeps the task-list rules of the base schema', () => {
      const base = makeBaseSchema();
      const result = siteSanitize(base);

      expect(result.attributes?.li).toBe(base.attributes?.li);
      expect(result.attributes?.input).toBe(base.attributes?.input);
      expect(result.required).toBe(base.required);
    });

    it('carries the structural rules over unchanged', () => {
      const base = makeBaseSchema();
      const result = siteSanitize(base);

      expect(result.strip).toBe(base.strip);
      expect(result.ancestors).toBe(base.ancestors);
      expect(result.clobber).toBe(base.clobber);
      expect(result.clobberPrefix).toBe(base.clobberPrefix);
    });
  });
});

describe('the schema the pipeline runs with', () => {
  const schema = getSiteSchema();

  it('is derived from bytemd\'s base schema, not from a copy of it', () => {
    // Properties this module never sets must still be the upstream ones.
    expect(schema.strip).toEqual(['script']);
    expect(schema.clobberPrefix).toBe('user-content-');
    expect(schema.ancestors?.td).toEqual(['table']);
    expect(schema.required?.input).toEqual({ type: 'checkbox', disabled: true });
  });

  it('returns a new object on every call', () => {
    const again = getSiteSchema();
    expect(again).not.toBe(schema);
    expect(again).toEqual(schema);
  });

  it('applies the site rules', () => {
    expect(schema.attributes?.['*']).toEqual([...SITE_GLOBAL_ATTRIBUTES]);
    expect(schema.attributes?.div).toEqual([['className', ...SITE_DIV_CLASS_WHITELIST]]);
    expect(schema.tagNames).toContain('center');
    expect(schema.tagNames).not.toContain('iframe');
    expect(schema.protocols?.href).toEqual([...SITE_PROTOCOLS]);
    expect(schema.protocols?.src).toEqual([...SITE_PROTOCOLS]);
    expect(Object.values(schema.protocols ?? {}).flat()).not.toContain('mailto');
  });

  it('matches the committed tagNames snapshot', () => {
    expect(schema.tagNames).toMatchSnapshot();
  });

  it('matches the committed attributes snapshot', () => {
    expect(schema.attributes).toMatchSnapshot();
  });

  it('matches the committed protocols snapshot', () => {
    expect(schema.protocols).toMatchSnapshot();
  });
});

describe('the schema as applied by the pipeline', () => {
  it('keeps a whitelisted div class', () => {
    expect(renderClean('<div class="pull-right">a</div>')).toBe('<div class="pull-right">a</div>');
  });

  it.each([...SITE_DIV_CLASS_WHITELIST])('keeps the class %s', (className) => {
    expect(renderClean(`<div class="${className}">a</div>`)).toContain(`class="${className}"`);
  });

  it('filters div classes value by value', () => {
    expect(renderClean('<div class="pull-right fixed inset-0">a</div>')).toBe(
      '<div class="pull-right">a</div>',
    );
  });

  it('empties a div class that has no whitelisted value', () => {
    expect(renderClean('<div class="fixed inset-0">a</div>')).toBe('<div class="">a</div>');
  });

  it('does not take the class from another element: only div may carry one', () => {
    expect(renderClean('<span class="hidden">a</span>')).toBe('<p><span>a</span></p>');
    expect(renderClean('<p class="pull-right">a</p>')).toBe('<p>a</p>');
  });

  it('keeps <center>', () => {
    expect(renderClean('<center>a</center>')).toBe('<center>a</center>');
  });

  it('strips the author-supplied link attributes the hardening step rebuilds', () => {
    expect(
      renderClean('<a id="i" name="n" target="_blank" rel="opener" href="https://a.b/">x</a>'),
    ).toBe('<p><a href="https://a.b/">x</a></p>');
  });

  it('removes an id instead of prefixing it', () => {
    expect(renderClean('<div id="x">a</div>')).toBe('<div>a</div>');
    expect(renderClean('<a name="x">a</a>')).toBe('<p><a>a</a></p>');
    // hast-util-sanitize would keep these with a `user-content-` prefix.
    expect(renderClean('<h2 id="t">a</h2><span name="s">b</span>')).not.toContain('user-content-');
  });

  it('drops a javascript: link', () => {
    expect(renderClean('[x](javascript:alert(1))')).toBe('<p><a>x</a></p>');
  });

  it('protocol-checks every URL-bearing property it allows', () => {
    expect(renderClean('<blockquote cite="javascript:alert(1)">a</blockquote>')).toBe(
      '<blockquote>a</blockquote>',
    );
    expect(renderClean('<img src="javascript:alert(1)" alt="a">')).toBe('<img alt="a">');
  });

  it('accepts the site schemes and rejects the default-only ones', () => {
    const html = renderClean(
      '[s](steem://witnesses) [e](esteem://x) [m](mailto:a@b.c) [i](irc://x) [x](https://a.b/)',
    );
    expect(html).toContain('href="steem://witnesses"');
    expect(html).toContain('href="esteem://x"');
    expect(html).toContain('href="https://a.b/"');
    expect(html).toContain('<a>m</a>');
    expect(html).toContain('<a>i</a>');
  });

  it('does not render iframes yet', () => {
    expect(renderClean('<iframe src="https://www.youtube.com/embed/x"></iframe>')).toBe('');
  });

  it.each([
    // An author cannot create a text box: every input is forced into the
    // disabled task-list checkbox shape, whatever type and value they gave.
    ['form control', '<input type="text" value="x">', '<input type="checkbox" disabled>'],
    ['form', '<form action="https://evil.example"><input type="checkbox"></form>', '<input type="checkbox" disabled>'],
    ['keyboard shortcut', '<a href="https://a.b/" accesskey="a">x</a>', '<p><a href="https://a.b/">x</a></p>'],
    ['inline style', '<div style="position:fixed;inset:0">a</div>', '<div>a</div>'],
    ['data attributes', '<div data-site-embed="youtube" data-id="x">a</div>', '<div>a</div>'],
  ])('gives an author no %s', (_label, body, expected) => {
    expect(renderClean(body)).toBe(expected);
  });
});
