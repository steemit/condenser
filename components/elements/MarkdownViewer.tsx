'use client';

import { useEffect, useRef } from 'react';

interface MarkdownViewerProps {
  text: string;
  className?: string;
  large?: boolean;
  hideImages?: boolean;
}

/**
 * MarkdownViewer component
 * Renders markdown content as HTML
 * Simplified version migrated from legacy/src/app/components/cards/MarkdownViewer.jsx
 * TODO: Add full markdown rendering with remarkable, HtmlReady, and sanitize-html
 */
export default function MarkdownViewer({
  text,
  className = '',
  large = false,
  hideImages = false,
}: MarkdownViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    // Basic markdown to HTML conversion
    // TODO: Replace with proper markdown renderer (remarkable)
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/__(.*?)__/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/_(.*?)_/gim, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }

    // Handle images
    if (hideImages) {
      html = html.replace(/<img[^>]*>/gi, (match) => {
        const srcMatch = match.match(/src="([^"]+)"/);
        return srcMatch ? `<span>[Image: ${srcMatch[1]}]</span>` : match;
      });
    }

    containerRef.current.innerHTML = html;
  }, [text, hideImages]);

  const cn = `MarkdownViewer ${className} ${large ? '' : 'MarkdownViewer--small'}`;

  return (
    <div
      ref={containerRef}
      className={cn}
      style={{ wordBreak: 'break-word' }}
    />
  );
}

