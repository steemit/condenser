import SubmitPostClient from './SubmitPostClient';

/**
 * Submit post page (server wrapper).
 * Route: /submit?category=hive-x
 * Equivalent to old route: SubmitPost /submit.html?category=…
 *
 * searchParams is a Promise on Next 15+; awaiting it here keeps the client
 * body free of useSearchParams (no Suspense boundary needed).
 */
export default async function SubmitPostPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.category;
  const category = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  // Steem categories are ≤32 chars ([a-z0-9-]); anything longer cannot be a
  // valid prefill, so drop it rather than feeding the editor garbage.
  const initialCategory =
    category && category.length <= 32 ? category : undefined;

  return <SubmitPostClient initialCategory={initialCategory} />;
}
