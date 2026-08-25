'use client';

import Link from 'next/link';
import { Clock, Link2, MessageSquare } from 'lucide-react';

import { Post } from '@/lib/api/steem';
import { reputation } from '@/lib/extract-content';
import MarkdownViewer from '@/components/elements/MarkdownViewer';
import Voting from '@/components/elements/Voting';
import Reblog from '@/components/elements/Reblog';
import ShareMenu from '@/components/elements/ShareMenu';
import TagList from '@/components/elements/TagList';
import Userpic from '@/components/elements/Userpic';
import TimeAgo from '@/components/elements/TimeAgo';
import Reputation from '@/components/elements/Reputation';

interface PostFullProps {
  post: Post;
}

/**
 * PostFull — legacy full post card (cards/PostFull.jsx + PostFull.scss):
 * bordered card, 40rem centered header/body, 48px avatar author row,
 * tags below the body, legacy footer (Voting | Reblog | Reply | responses
 * | share icons | link).
 */
export default function PostFull({ post }: PostFullProps) {
  const tags = post.json_metadata?.tags || [];
  const postUrl = `/${post.category}/@${post.author}/${post.permlink}`;
  const rep = reputation(post.author_reputation);
  const edited = post.last_update && post.last_update !== post.created;
  const powerUp100 = post.percent_steem_dollars === 0;
  const payout =
    typeof post.payout === 'number'
      ? post.payout
      : Number.parseFloat(post.pending_payout_value || '0') || 0;
  const highQualityPost = payout > 10.0;
  const noImage = Boolean(post.stats?.gray);

  const copyLink = () => {
    if (typeof window === 'undefined') return;
    const full = `${window.location.origin}${postUrl}`;
    void navigator.clipboard?.writeText(full);
  };

  return (
    <article
      className="PostFull relative rounded-[6px] border border-border bg-card px-4 pb-4 pt-8"
      itemScope
      itemType="http://schema.org/Article"
    >
      <div className="PostFull__header mx-auto max-w-[40rem] border-b border-border">
        <h1
          className="font-sans font-extrabold leading-[1.1] [overflow-wrap:break-word] text-[240%]"
          itemProp="headline"
        >
          {post.title || 'Untitled'}
          {powerUp100 && (
            <span title="100% Steem Power payout" className="ml-2 align-middle text-[50%]">
              ⚡
            </span>
          )}
        </h1>

        {/* TimeAuthorCategoryLarge: 48px avatar + author/time rows */}
        <div className="PostFull__time_author_category_large my-4 flex items-center text-[120%] text-muted-foreground">
          <Link href={`/@${post.author}`} className="shrink-0">
            <Userpic account={post.author} />
          </Link>
          <span className="right-side ml-3 leading-[1.2]">
            <span className="block">
              <Clock className="mr-1 inline size-4 align-[-2px]" aria-hidden />
              in{' '}
              <Link
                href={`/trending/${post.category}`}
                className="text-muted-foreground hover:text-accent-foreground"
              >
                #{post.community_title && post.category?.startsWith('hive-')
                  ? post.community_title
                  : post.category}
              </Link>{' '}
              •{' '}
              <TimeAgo date={post.created} />
              {edited && (
                <span
                  className="ml-1"
                  title={`Last updated ${new Date(
                    (post.last_update || '') + 'Z'
                  ).toLocaleString()}`}
                >
                  (edited)
                </span>
              )}
            </span>
            <span className="block">
              by{' '}
              <Link
                href={`/@${post.author}`}
                className="font-bold text-foreground hover:text-accent-foreground"
                itemProp="author"
              >
                {post.author}
              </Link>{' '}
              {rep !== null && <Reputation value={rep} />}
            </span>
          </span>
        </div>
      </div>

      <div className="PostFull__body mx-auto max-w-[40rem] py-4" itemProp="articleBody">
        <MarkdownViewer
          text={post.body || ''}
          large
          highQualityPost={highQualityPost}
          noImage={noImage}
        />
      </div>

      <TagList tags={tags} category={post.category} />

      <div className="PostFull__footer mx-auto flex max-w-[40rem] flex-wrap items-center justify-between gap-2 text-[94%] leading-[2rem]">
        <div>
          <Voting post={post} />
        </div>
        <div className="RightShare__Menu flex items-center">
          <span className="mr-[0.4rem] border-r border-border pr-[0.4rem]">
            <Reblog author={post.author} permlink={post.permlink} iconOnly />
          </span>
          <span className="PostFull__reply mr-[0.4rem] border-r border-border pr-[0.4rem]">
            <a
              href="#comments"
              className="mx-[0.15rem] text-foreground hover:text-accent-foreground"
            >
              Reply
            </a>
          </span>
          <span className="PostFull__responses pr-[0.4rem]">
            <Link
              href={`${postUrl}#comments`}
              title={`${post.children ?? 0} responses`}
              className="inline-flex items-center gap-1 text-foreground hover:text-accent-foreground"
            >
              <MessageSquare className="size-4" aria-hidden />
              {post.children ?? 0}
            </Link>
          </span>
          <ShareMenu url={postUrl} title={post.title || 'Untitled'} />
          <button
            type="button"
            className="explore-post p-[2px] text-muted-foreground hover:text-accent-foreground"
            title="Share this post"
            aria-label="Copy post link"
            onClick={copyLink}
          >
            <Link2 className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
