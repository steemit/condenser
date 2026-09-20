import type { Metadata } from 'next';
import HelpArticle from '@/components/elements/HelpArticle';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Steemit frequently asked questions.',
};

/**
 * /faq.html — legacy Faq page: HelpContent "faq" in an 8/10/12-column row.
 * Route lives at /faq (no .html); the legacy path is redirected in proxy.ts.
 */
export default function FaqPage() {
  return (
    <div className="mx-auto w-full px-4 py-6">
      <div className="lg:w-2/3 md:w-5/6">
        <HelpArticle doc="faq" />
      </div>
    </div>
  );
}
