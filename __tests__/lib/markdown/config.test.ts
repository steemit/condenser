// @vitest-environment node
/**
 * The single configuration source: which plugins, in which order, and what
 * the editor preview and the post page both pass as `sanitize`.
 */
import { getProcessor, type BytemdPlugin } from 'bytemd';
import breaks from '@bytemd/plugin-breaks';
import type { Processor } from 'unified';
import { describe, expect, it, vi } from 'vitest';

import { createSitePlugins, siteSanitize } from '@/lib/markdown/config';
import { remarkSiteGfm } from '@/lib/markdown/gfm';
import { remarkRawHtmlPosts } from '@/lib/markdown/raw-html-post';
import { siteSanitize as siteSanitizeFromSchema } from '@/lib/markdown/schema';

/** Record what a plugin's `remark` hook registers on a processor. */
function registeredBy(plugin: BytemdPlugin | undefined): unknown[] {
  const use = vi.fn();
  plugin?.remark?.({ use } as unknown as Processor);
  return use.mock.calls.map((call) => call[0]);
}

describe('createSitePlugins', () => {
  it('returns a new array on every call', () => {
    const first = createSitePlugins();
    const second = createSitePlugins();

    expect(first).not.toBe(second);
    // Fresh plugin objects too: bytemd keys its processor cache on identity.
    expect(first[1]).not.toBe(second[1]);
  });

  it('accepts the five reading-time options', () => {
    const plugins = createSitePlugins({
      large: true,
      highQualityPost: false,
      noImage: true,
      hideImages: true,
      isProxifyImages: true,
    });
    expect(plugins).toHaveLength(3);
  });

  it('does not let the options change the plugin list yet', () => {
    // No plugin reads the options until link handling and image hardening
    // land; every option set must produce the same list.
    const names = (plugins: ReturnType<typeof createSitePlugins>) =>
      plugins.map((plugin) => Object.keys(plugin).sort().join(','));
    expect(names(createSitePlugins({ large: true }))).toEqual(names(createSitePlugins()));
  });

  describe('order and content', () => {
    const plugins = createSitePlugins();

    it('has exactly three plugins, all remark-only', () => {
      expect(plugins).toHaveLength(3);
      for (const plugin of plugins) {
        expect(typeof plugin.remark).toBe('function');
        // Nothing else is registered in this feature point: no rehype hook
        // (hardening), no toolbar action, no viewer or editor effect.
        expect(plugin.rehype).toBeUndefined();
        expect(plugin.actions).toBeUndefined();
        expect(plugin.viewerEffect).toBeUndefined();
        expect(plugin.editorEffect).toBeUndefined();
      }
    });

    it('registers raw-HTML post detection first', () => {
      // It replaces the parsed tree, so nothing may run before it.
      expect(registeredBy(plugins[0])).toEqual([remarkRawHtmlPosts]);
    });

    it('registers soft line breaks second', () => {
      expect(registeredBy(plugins[1])).toEqual(registeredBy(breaks()));
      expect(plugins[1]).not.toEqual(breaks());
    });

    it('registers the site GFM subset last', () => {
      expect(registeredBy(plugins[2])).toEqual([remarkSiteGfm]);
    });
  });

  it('produces a list bytemd accepts', () => {
    const processor = getProcessor({ plugins: createSitePlugins(), sanitize: siteSanitize });
    expect(String(processor.processSync('| a |\n| - |\nrow'))).toContain('<table>');
  });
});

describe('siteSanitize re-export', () => {
  it('is the schema module\'s function', () => {
    expect(siteSanitize).toBe(siteSanitizeFromSchema);
  });
});
