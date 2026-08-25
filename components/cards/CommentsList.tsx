'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/store/hooks';
import Comment, { Comment as CommentType } from './Comment';
import PostEditor, { PostEditorResult } from '@/components/elements/PostEditor';
import { ChevronDown } from 'lucide-react';

interface CommentsListProps {
  comments: CommentType[];
  postAuthor: string;
  postPermlink: string;
  postCategory: string;
  sortOrder?: 'votes' | 'new' | 'trending';
  /** Called after a reply (at any depth) was broadcast successfully. */
  onReply?: (result: PostEditorResult) => void;
  onEdit?: (author: string, permlink: string, body: string) => void;
  onDelete?: (author: string, permlink: string) => void;
}

const PAGE_SIZE = 10;

/** Legacy comment ordering (trending = payout desc, then rshares; gray sinks). */
function sortComments(list: CommentType[], order: 'votes' | 'new' | 'trending') {
  const sorted = [...list].sort((a, b) => {
    if (order === 'new') {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    } else if (order === 'votes') {
      const aVotes = a.active_votes?.filter((v) => v.weight > 0).length || 0;
      const bVotes = b.active_votes?.filter((v) => v.weight > 0).length || 0;
      return bVotes - aVotes;
    }
    const aPayout = parseFloat(a.pending_payout_value || '0');
    const bPayout = parseFloat(b.pending_payout_value || '0');
    if (aPayout !== bPayout) return bPayout - aPayout;
    const aRshares = parseFloat(a.net_rshares || '0');
    const bRshares = parseFloat(b.net_rshares || '0');
    return bRshares - aRshares;
  });
  // Gray comments sink to the bottom (legacy behavior).
  return sorted.sort(
    (a, b) => Number(Boolean(a.stats?.gray)) - Number(Boolean(b.stats?.gray))
  );
}

/** Build the nested comment tree (repliesData on every level). */
function buildCommentTree(allComments: CommentType[]): CommentType[] {
  const map = new Map<string, CommentType>();
  const roots: CommentType[] = [];

  allComments.forEach((c) => {
    map.set(`${c.author}/${c.permlink}`, { ...c, repliesData: [] });
  });

  allComments.forEach((c) => {
    const node = map.get(`${c.author}/${c.permlink}`)!;
    if (c.parent_author && c.parent_permlink) {
      const parent = map.get(`${c.parent_author}/${c.parent_permlink}`);
      if (parent) {
        parent.repliesData!.push(node);
        return;
      }
    }
    roots.push(node);
  });

  return roots;
}

/**
 * CommentsList — legacy Post comments section: sort dropdown at top-right,
 * first 10 comments with a green "LOAD MORE COMMENTS" button, reply editor
 * at the top when logged in.
 */
export default function CommentsList({
  comments,
  postAuthor,
  postPermlink,
  sortOrder = 'trending',
  onReply,
  onEdit,
  onDelete,
}: CommentsListProps) {
  const username = useAppSelector((s) => s.user.current?.username);
  const t = useTranslations();
  const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const rootComments = sortComments(buildCommentTree(comments), currentSortOrder);
  const visibleRoots = rootComments.slice(0, visibleCount);

  return (
    <div
      className="Post_comments__content mx-auto mb-14 mt-8 max-w-[54rem] text-[92%]"
      id="comments"
    >
      {/* sort control (legacy: top-right, "Sort by: <bold>") */}
      <div className="Post__comments_sort_order mb-2 flex items-center justify-end gap-1 text-[94%]">
        <span className="text-muted-foreground">{t('post_jsx.sort_order')}:</span>
        <span className="relative inline-flex items-center">
          <select
            value={currentSortOrder}
            onChange={(e) =>
              setCurrentSortOrder(e.target.value as 'votes' | 'new' | 'trending')
            }
            aria-label={t('post_jsx.sort_order')}
            className="cursor-pointer appearance-none bg-transparent pr-4 font-bold text-foreground outline-none"
          >
            {/* legacy maps the 'new' sort to the 'age' label */}
            <option value="trending">{t('post_jsx.comment_sort_order.trending')}</option>
            <option value="votes">{t('post_jsx.comment_sort_order.votes')}</option>
            <option value="new">{t('post_jsx.comment_sort_order.age')}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 size-3.5" aria-hidden />
        </span>
      </div>

      {/* top-level reply editor (legacy shows it when logged in) */}
      {username && (
        <div className="mb-6">
          <PostEditor
            type="submit_comment"
            parentAuthor={postAuthor}
            parentPermlink={postPermlink}
            onSuccess={onReply}
          />
        </div>
      )}

      {visibleRoots.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>{t('comments.no_comments_yet')}</p>
        </div>
      ) : (
        <>
          {visibleRoots.map((comment) => (
            <Comment
              key={`${comment.author}/${comment.permlink}`}
              comment={comment}
              depth={1}
              sortOrder={currentSortOrder}
              replies={comment.repliesData ?? []}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {rootComments.length > visibleCount && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="comment-button rounded-[10px] bg-[#06d6a9] px-8 py-[15px] font-bold text-white"
              >
                {t('comments.load_more_comments')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
