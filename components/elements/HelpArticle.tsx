'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import MarkdownViewer from '@/components/elements/MarkdownViewer';
import { cn } from '@/lib/utils';

function replaceIconTags(text: string): string {
  // Legacy help .md files embed <Icon name="..." /> tags that HelpContent.jsx
  // rendered server-side via react-dom/server. This rewrite has no equivalent
  // server Icon here, so emit a neutral bullet that survives sanitization.
  return text.replace(
    /<Icon\s+name="[A-Za-z0-9_-]+"\s*\/?>/g,
    '<span aria-hidden="true">&middot;</span>'
  );
}

/** Anchor ids declared in the doc via <span id="..."> (legacy help convention). */
function extractAnchorIds(text: string): string[] {
  const ids: string[] = [];
  for (const m of text.matchAll(/<span\s+id="([^"]+)"\s*>/g)) {
    ids.push(m[1]);
  }
  return ids;
}

interface HelpArticleProps {
  /** Help document key under public/help (e.g. "welcome", "faq", "tos"). */
  doc: string;
  /** Optional heading shown above the article (legacy HelpContent title). */
  title?: string;
  /** Extra classes for the outer container. */
  className?: string;
}

/**
 * HelpArticle — renders a static help document (markdown, from public/help)
 * through the same MarkdownViewer pipeline used for post bodies, so link
 * hardening, image proxying and XSS filtering apply identically.
 *
 * Ported from legacy HelpContent.jsx + its `help/<locale>/*.md` require.context
 * (legacy pinned locale 'en' for these pages; the rewrite serves the same
 * English documents).
 *
 * Anchors: the sanitize layer strips `id` attributes from post bodies (DOM
 * clobbering hardening), so in-document TOC links would dangle. This component
 * restores them client-side — after render it re-attaches the known anchor ids
 * from the doc's own <span id="..."> markers and intercepts same-page anchor
 * clicks with a smooth scroll. Safe because this content is our own static
 * docs; post bodies never get this treatment.
 */
export default function HelpArticle({ doc, title, className }: HelpArticleProps) {
  const t = useTranslations();
  const [raw, setRaw] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const anchorIds = useMemo(() => (raw ? extractAnchorIds(raw) : []), [raw]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/help/${doc}.md`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setRaw(text);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [doc]);

  const body = useMemo(() => replaceIconTags(raw ?? ''), [raw]);

  // Re-attach anchor ids to the rendered heading spans, then handle anchor clicks.
  useEffect(() => {
    const root = containerRef.current;
    if (!root || anchorIds.length === 0) return;

    // The rendered span keeps its text content; sanitize only dropped the id
    // attribute. Match on text to re-label each span with its original id.
    const byText = new Map<string, HTMLElement>();
    root.querySelectorAll<HTMLElement>('span').forEach((el) => {
      const key = el.textContent?.trim();
      if (key && !byText.has(key)) byText.set(key, el);
    });
    // The doc itself maps id -> visible text via <span id="X">text</span>;
    // recover that mapping from the raw markdown.
    for (const m of raw?.matchAll(/<span\s+id="([^"]+)"\s*>([\s\S]*?)<\/span>/g) ?? []) {
      const [, id, inner] = m;
      const text = inner.replace(/<[^>]+>/g, '').trim();
      const el = byText.get(text);
      if (el && !el.id) el.id = id;
    }

    // Delegated click handling for same-page anchor links (smooth scroll).
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!a) return;
      const id = decodeURIComponent(a.getAttribute('href')!.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
      }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [anchorIds, raw, body]);

  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
  }, []);

  if (failed) {
    return (
      <div className={cn('py-8 text-center text-muted-foreground', className)}>
        {t('help_article.load_failed')}
      </div>
    );
  }

  if (raw === null) {
    return (
      <div className={cn('py-8 text-center text-muted-foreground', className)}>
        {t('help_article.loading')}
      </div>
    );
  }

  return (
    <div className={cn('mx-auto w-full max-w-3xl px-4 py-6', className)}>
      {title && <h1 className="mb-4 text-2xl font-bold">{title}</h1>}
      <div ref={setContainerRef}>
        <MarkdownViewer text={body} className="HelpContent" />
      </div>
    </div>
  );
}
