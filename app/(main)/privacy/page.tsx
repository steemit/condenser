import type { Metadata } from 'next';
import HelpArticle from '@/components/elements/HelpArticle';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Steemit, Inc Privacy Policy.',
};

/**
 * /privacy — same HelpArticle pipeline as /welcome /faq /tos (public/help/
 * privacy.md), so all four legal/help pages share one layout and typography.
 * Legacy served this at /privacy.html with hard-coded JSX; the content was
 * converted to the help markdown doc (legacy .html URL still redirects).
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full px-4 py-6">
      <div className="lg:w-2/3 md:w-5/6">
        <HelpArticle doc="privacy" />
      </div>
    </div>
  );
}
