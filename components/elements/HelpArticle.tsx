'use client';

import { useMemo, useState, useEffect } from 'react';
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
 */
export default function HelpArticle({ doc, title, className }: HelpArticleProps) {
  const t = useTranslations();
  const [raw, setRaw] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

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
      <MarkdownViewer text={body} className="HelpContent" />
    </div>
  );
}
