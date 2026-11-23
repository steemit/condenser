// @vitest-environment node
/**
 * The constants both pipelines share.
 *
 * `lib/sanitize-config.ts` (legacy sanitize-html path, also the rollback path)
 * and `lib/markdown/**` (bytemd path) import the same module. This suite pins
 * the values to the legacy ones and checks that rewiring the legacy module to
 * the shared constants did not change what it does.
 */
import sanitizeHtml from 'sanitize-html';
import { describe, expect, it } from 'vitest';

import {
  EXTERNAL_LINK_MESSAGE,
  INTERNAL_IMAGE_MESSAGE,
  PHISHY_MESSAGE,
  SITE_DIV_CLASS_WHITELIST,
  noImageText,
} from '@/lib/markdown/constants';
import sanitizeConfig, {
  getExternalLinkWarningMessage,
  getInternalImageMessage,
  getPhishingWarningMessage,
} from '@/lib/sanitize-config';

const render = (html: string) => sanitizeHtml(html, sanitizeConfig());

describe('shared constants', () => {
  it('keeps the legacy message texts, character for character', () => {
    expect(PHISHY_MESSAGE).toBe('(Warning: link is a possible phishing attempt)');
    expect(EXTERNAL_LINK_MESSAGE).toBe('This link will take you away from Steemit');
    expect(INTERNAL_IMAGE_MESSAGE).toBe('');
    expect(noImageText).toBe('(Image not shown due to low ratings)');
  });

  it('keeps the legacy div class list, in order', () => {
    expect([...SITE_DIV_CLASS_WHITELIST]).toEqual([
      'pull-right',
      'pull-left',
      'text-justify',
      'text-rtl',
      'text-center',
      'text-right',
      'videoWrapper',
      'phishy',
    ]);
  });
});

describe('lib/sanitize-config reads the shared constants', () => {
  it('answers with them', () => {
    expect(getPhishingWarningMessage()).toBe(PHISHY_MESSAGE);
    expect(getExternalLinkWarningMessage()).toBe(EXTERNAL_LINK_MESSAGE);
    expect(getInternalImageMessage()).toBe(INTERNAL_IMAGE_MESSAGE);
  });

  it('still exports noImageText under its own name', () => {
    // The legacy module re-exports the same binding, so existing imports keep
    // working and both pipelines compare against the same text.
    expect(noImageText).toBe('(Image not shown due to low ratings)');
    const clean = sanitizeHtml('<img src="https://a.b/x.png">', sanitizeConfig({ noImage: true }));
    expect(clean).toContain(noImageText);
  });

  it.each([...SITE_DIV_CLASS_WHITELIST])('still keeps the class %s on a div', (className) => {
    expect(render(`<div class="${className}">a</div>`)).toContain(`class="${className}"`);
  });

  it.each(['fixed', 'inset-0', 'pull-right fixed', '.Pull-Right', ''])(
    'still drops the class %j from a div',
    (className) => {
      expect(render(`<div class="${className}">a</div>`)).toBe('<div>a</div>');
    },
  );

  it('still keeps the phishing title only on a phishy div', () => {
    const title = `title="${PHISHY_MESSAGE}"`;
    expect(render(`<div class="phishy" ${title}>a</div>`)).toContain(title);
    expect(render(`<div class="pull-right" ${title}>a</div>`)).not.toContain('title=');
  });
});
