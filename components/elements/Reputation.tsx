'use client';

import { useTranslations } from 'next-intl';

/**
 * Reputation — "(73)" style reputation number after an author name.
 * Ported from legacy src/app/components/elements/Reputation.jsx.
 */
export default function Reputation({ value }: { value: number }) {
  const t = useTranslations();
  if (Number.isNaN(value)) {
    console.log('Unexpected rep value:', value);
    return null;
  }
  return (
    <span className="Reputation" title={t('g.reputation')}>
      ({Math.floor(value)})
    </span>
  );
}
