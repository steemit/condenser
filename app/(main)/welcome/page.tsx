import type { Metadata } from 'next';
import HelpArticle from '@/components/elements/HelpArticle';

export const metadata: Metadata = {
  title: 'Welcome',
  description: 'Welcome to Steemit — getting started guide.',
};

/**
 * /welcome — legacy Welcome page: HelpContent "welcome" rendered in an
 * 8/10/12-column row (large-8/medium-10/small-12 → 2/3 width on large).
 */
export default function WelcomePage() {
  return (
    <div className="mx-auto w-full px-4 py-6">
      <div className="lg:w-2/3 md:w-5/6">
        <HelpArticle doc="welcome" />
      </div>
    </div>
  );
}
