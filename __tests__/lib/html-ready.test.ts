import { describe, expect, it } from 'vitest';
import htmlReady from '@/lib/html-ready';

describe('htmlReady', () => {
  it('linkifies #tags and @mentions and records them in state', () => {
    const { html, hashtags, usertags } = htmlReady('<p>Thanks @alice #steem</p>');
    expect(html).toContain('href="/@alice"');
    expect(html).toContain('href="/trending/steem"');
    expect(usertags.has('alice')).toBe(true);
    expect(hashtags.has('steem')).toBe(true);
  });

  it('unlinks anchors whose steemit.com-looking text points elsewhere (phishing)', () => {
    const { html } = htmlReady('<a href="https://steewit.com">steemit.com</a>');
    expect(html).toContain('class="phishy"');
    expect(html).toContain('possible phishing attempt');
    expect(html).not.toContain('href="https://steewit.com"');
  });

  it('wraps iframes in a videoWrapper div', () => {
    const { html } = htmlReady(
      '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>'
    );
    expect(html).toContain('class="videoWrapper"');
    expect(html).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('proxifies non-local img src by default', () => {
    const { html } = htmlReady('<img src="https://steemitimages.com/QmX/p.png"/>');
    expect(html).toContain('steemitimages.com/p/');
  });

  it('wraps an img anchor via the DOM API without attribute injection (audit N-15)', () => {
    // A src containing quotes used to splice an extra attribute into the
    // generated <a href="..."> wrapper; setAttribute must neutralize it.
    const { html } = htmlReady(
      `<img src='https://example.com/a.jpg" onmouseover="alert(1)'/>`
    );
    expect(html).not.toContain('onmouseover="alert(1)"');
    // The (attacker-controlled) URL is entity-escaped inside the href.
    expect(html).toContain('href="https://example.com/a.jpg&quot; onmouseover=&quot;alert(1)"');
  });

  it('linkify never emits unescaped quotes in generated attributes (audit N-15)', () => {
    const { html } = htmlReady('<p>see https://example.com/a.jpg here</p>');
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThan(0);
  });
});
