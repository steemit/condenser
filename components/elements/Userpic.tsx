/**
 * Userpic — account avatar via the image proxy, as a background-image div.
 * Ported from legacy src/app/components/elements/Userpic.jsx.
 * Size variants map to the proxy's avatar sizes: '' / '/small' / '/medium' / '/large'.
 */

import { imageProxy } from '@/lib/media/proxify-url';

export const SIZE_SMALL = 'small';
export const SIZE_MED = 'medium';
export const SIZE_LARGE = 'large';

const sizeList = [SIZE_SMALL, SIZE_MED, SIZE_LARGE] as const;

interface UserpicProps {
  account: string;
  size?: string;
  hide?: boolean;
}

export default function Userpic({ account, size, hide = false }: UserpicProps) {
  if (hide) return null;
  const name = account === 'steemitblog' ? 'steemitdev' : account;
  const sizeSuffix = size && (sizeList as readonly string[]).includes(size) ? `/${size}` : '';
  const url = `${imageProxy()}u/${name}/avatar${sizeSuffix}`;
  return (
    <div
      className="Userpic"
      style={{ backgroundImage: `url(${url})` }}
      role="img"
      aria-label={name}
    />
  );
}
