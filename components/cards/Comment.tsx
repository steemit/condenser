'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import MarkdownViewer from '@/components/elements/MarkdownViewer';
import Voting from '@/components/elements/Voting';
import PostEditor, { PostEditorResult } from '@/components/elements/PostEditor';
import Userpic from '@/components/elements/Userpic';
import TimeAgo from '@/components/elements/TimeAgo';
import Reputation from '@/components/elements/Reputation';
import { reputation } from '@/lib/extract-content';
import { Post } from '@/lib/api/steem';
import { cn } from '@/lib/utils';

export interface Comment extends Post {
  depth?: number;
  replies?: string[]; // Array of comment keys (author/permlink)
  /** Nested child comments (built by CommentsList). */
  repliesData?: Comment[];
  parent_author?: string;
  parent_permlink?: string;
  children?: number;
}

interface CommentProps {
  comment: Comment;
  depth?: number;
  sortOrder?: 'votes' | 'new' | 'trending';
  /** Called after a reply to this comment was broadcast successfully. */
  onReply?: (result: PostEditorResult) => void;
  onEdit?: (author: string, permlink: string, body: string) => void;
  onDelete?: (author: string, permlink: string) => void;
  replies?: Comment[];
}

const MAX_DEPTH = 7;

/**
 * Comment — legacy three-part card (cards/Comment.jsx + Comment.scss):
 * 48px avatar column, bordered header/body/footer blocks with a 62px
 * indent, dotted reply tree lines, collapse [+]/[-], gray-comment reveal.
 */
export default function Comment({
  comment,
  depth = 1,
  sortOrder = 'trending',
  onReply,
  onEdit,
  onDelete,
  replies = [],
}: CommentProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  // legacy: gray comments render with the body hidden behind a reveal link
  const [revealGray, setRevealGray] = useState(false);
  const username = useAppSelector((state) => state.user.current?.username);

  const isMyComment = username === comment.author;
  const gray = Boolean(comment.stats?.gray) && !isMyComment;
  const hideBody = gray && !revealGray;

  const rep = reputation(comment.author_reputation);
  const edited = comment.last_update && comment.last_update !== comment.created;

  const commentUrl = `/${comment.category}/@${comment.author}/${comment.permlink}`;

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.author, comment.permlink);
    }
  };

  // Sort replies
  const sortedReplies = [...replies].sort((a, b) => {
    if (sortOrder === 'new') {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    } else if (sortOrder === 'votes') {
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
  sortedReplies.sort((a, b) => Number(Boolean(a.stats?.gray)) - Number(Boolean(b.stats?.gray)));

  return (
    <div
      className={cn('Comment mb-5', depth === 1 ? 'root' : 'reply')}
      id={`@${comment.author}/${comment.permlink}`}
    >
      <div className="Comment__block">
        {/* avatar column (48px desktop / 16px mobile) */}
        <Link href={`/@${comment.author}`} className="float-left">
          <Userpic
            account={comment.author}
            className="!size-4 min-[640px]:!size-12"
          />
        </Link>

        <div className="ml-[26px] min-[640px]:ml-[62px]">
          {/* header */}
          <div className="Comment__header rounded-t-[6px] border border-border bg-card px-[5px] py-[3px] text-[90%]">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="float-right tracking-[0.1rem] text-muted-foreground hover:text-foreground"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? '[+]' : '[-]'}
            </button>
            <Link
              href={`/@${comment.author}`}
              className="font-bold text-foreground hover:text-accent-foreground"
            >
              {comment.author}
            </Link>{' '}
            {rep !== null && <Reputation value={rep} />}{' '}
            <Link
              href={commentUrl}
              className="text-muted-foreground hover:text-accent-foreground"
            >
              <TimeAgo date={comment.created} />
            </Link>
            {edited && (
              <span
                className="ml-1 text-muted-foreground"
                title={`Last updated ${new Date(
                  (comment.last_update || '') + 'Z'
                ).toLocaleString()}`}
              >
                (edited)
              </span>
            )}
            {gray && hideBody && (
              <button
                type="button"
                onClick={() => setRevealGray(true)}
                className="ml-2 text-accent-foreground hover:underline"
              >
                reveal comment
              </button>
            )}
            {collapsed && (comment.children ?? sortedReplies.length) > 0 && (
              <span className="ml-2 text-muted-foreground">
                ({comment.children ?? sortedReplies.length}{' '}
                {(comment.children ?? sortedReplies.length) === 1
                  ? 'reply'
                  : 'replies'}
                )
              </span>
            )}
          </div>

          {!collapsed && (
            <>
              {/* body */}
              <div className="Comment__body border-x border-border bg-card px-[5px] py-1 text-[90%]">
                {hideBody ? (
                  <pre className="whitespace-pre-wrap font-sans opacity-50">
                    {comment.body}
                  </pre>
                ) : (
                  <MarkdownViewer text={comment.body || ''} />
                )}
                {gray && (
                  <p className="text-[85%] text-muted-foreground">
                    This comment will be hidden due to low ratings.
                  </p>
                )}
              </div>

              {/* footer */}
              <div className="Comment__footer flex flex-wrap items-center gap-x-3 gap-y-1 rounded-b-[6px] border border-border bg-card px-[10px] pb-[5px] pt-[3px] text-[90%]">
                <Voting post={comment} isComment />
                <button
                  type="button"
                  onClick={() => {
                    setShowReply(!showReply);
                    setShowEdit(false);
                  }}
                  className="text-foreground hover:text-accent-foreground"
                >
                  Reply
                </button>
                {isMyComment && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEdit(!showEdit);
                        setShowReply(false);
                      }}
                      className="text-foreground hover:text-accent-foreground"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="text-foreground hover:text-accent-foreground"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

              {/* reply/edit editor — PostEditor broadcasts itself; here we
                  only propagate the result up for the optimistic update */}
              {(showReply || showEdit) && (
                <div className="comment__editor my-4">
                  <PostEditor
                    type={showReply ? 'submit_comment' : 'edit'}
                    parentAuthor={
                      showReply ? comment.author : comment.parent_author
                    }
                    parentPermlink={
                      showReply ? comment.permlink : comment.parent_permlink
                    }
                    commentPermlink={showEdit ? comment.permlink : undefined}
                    body={showEdit ? comment.body : undefined}
                    onSuccess={(result) => {
                      if (showReply) {
                        onReply?.(result);
                        setShowReply(false);
                      } else {
                        onEdit?.(result.author, result.permlink, result.body);
                        setShowEdit(false);
                      }
                    }}
                    onCancel={() => {
                      setShowReply(false);
                      setShowEdit(false);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* nested replies — dotted tree line, recursive */}
        {sortedReplies.length > 0 && (
          <div className="Comment__replies ml-[10px] mt-[1.4rem] border-l border-dotted border-[#788187] pl-2 min-[640px]:ml-[62px]">
            {depth >= MAX_DEPTH ? (
              <Link
                href={commentUrl}
                className="text-accent-foreground hover:underline"
              >
                Show {comment.children || sortedReplies.length} more{' '}
                {(comment.children || sortedReplies.length) === 1
                  ? 'reply'
                  : 'replies'}
              </Link>
            ) : (
              sortedReplies.map((reply) => (
                <Comment
                  key={`${reply.author}/${reply.permlink}`}
                  comment={reply}
                  depth={depth + 1}
                  sortOrder={sortOrder}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  replies={reply.repliesData ?? []}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
