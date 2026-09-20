import type { Metadata } from 'next';
import HelpArticle from '@/components/elements/HelpArticle';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Steemit Terms of Service.',
};

/**
 * /tos.html — legacy Tos page: HelpContent "tos" with an explicit
 * "Terms of Service" H1, in an 8/10/12-column row. Route lives at /tos.
 */
export default function TosPage() {
  return (
    <div className="mx-auto w-full px-4 py-6">
      <div className="lg:w-2/3 md:w-5/6">
        <HelpArticle doc="tos" title="Terms of Service" />
      </div>
    </div>
  );
}
