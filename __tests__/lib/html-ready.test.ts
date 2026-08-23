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
});
