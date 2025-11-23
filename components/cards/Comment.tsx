'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import MarkdownViewer from '@/components/elements/MarkdownViewer';
import Voting from '@/components/elements/Voting';
import PostEditor from '@/components/elements/PostEditor';
import { Post } from '@/lib/api/steem';

export interface Comment extends Post {
  depth?: number;
  replies?: string[]; // Array of comment keys (author/permlink)
  parent_author?: string;
  parent_permlink?: string;
  children?: number;
}

interface CommentProps {
  comment: Comment;
  depth?: number;
  sortOrder?: 'votes' | 'new' | 'trending';
  showNegativeComments?: boolean;
  onReply?: (parentAuthor: string, parentPermlink: string, body: string) => void;
  onEdit?: (author: string, permlink: string, body: string) => void;
  onDelete?: (author: string, permlink: string) => void;
  replies?: Comment[];
}

/**
 * Comment component
 * Displays a comment with nested replies support
 * Migrated from legacy/src/app/components/cards/Comment.jsx
 */
export default function Comment({
  comment,
  depth = 1,
  sortOrder = 'trending',
  showNegativeComments = false,
  onReply,
  onEdit,
  onDelete,
  replies = [],
}: CommentProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [hideBody, setHideBody] = useState(false);
  const username = useAppSelector((state) => state.user.current?.username);

  const isMyComment = username === comment.author;
  const canReply = depth < 255;
  const canEdit = isMyComment;
  const canDelete = isMyComment;
  const maxDepth = 7;

  // Check if comment should be hidden (negative reputation)
  useEffect(() => {
    const gray = comment.stats?.gray || false;
    const notOwn = username !== comment.author;
    if (notOwn && gray) {
      setHideBody(true);
    }
  }, [comment, username]);

  const handleReplySubmit = (body: string) => {
    if (onReply) {
      onReply(comment.author, comment.permlink, body);
      setShowReply(false);
    }
  };

  const handleEditSubmit = (body: string) => {
    if (onEdit) {
      onEdit(comment.author, comment.permlink, body);
      setShowEdit(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.author, comment.permlink);
    }
  };

  const commentUrl = `/${comment.category}/@${comment.author}/${comment.permlink}`;
  const createdDate = new Date(comment.created);

  // Sort replies
  const sortedReplies = [...replies].sort((a, b) => {
    if (sortOrder === 'new') {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    } else if (sortOrder === 'votes') {
      const aVotes = a.active_votes?.filter((v) => v.weight > 0).length || 0;
      const bVotes = b.active_votes?.filter((v) => v.weight > 0).length || 0;
      return bVotes - aVotes;
    } else {
      // trending: sort by payout or net_rshares
      const aPayout = parseFloat(a.pending_payout_value || '0');
      const bPayout = parseFloat(b.pending_payout_value || '0');
      if (aPayout !== bPayout) return bPayout - aPayout;
      const aRshares = parseFloat(a.net_rshares || '0');
      const bRshares = parseFloat(b.net_rshares || '0');
      return bRshares - aRshares;
    }
  });

  if (!showNegativeComments && comment.stats?.gray && !isMyComment) {
    return null;
  }

  return (
    <div
      className={`comment ${depth === 1 ? 'root' : 'reply'} ${
        collapsed ? 'collapsed' : ''
      } ${hideBody ? 'downvoted' : ''}`}
      id={`@${comment.author}/${comment.permlink}`}
    >
      <div className="comment__block border-l-2 border-gray-200 pl-4 py-2">
        {/* Comment header */}
        <div className="comment__header flex items-center gap-2 text-sm text-gray-600 mb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-gray-600"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '[+]' : '[-]'}
          </button>

          <Link
            href={`/@${comment.author}`}
            className="font-medium text-blue-600 hover:underline"
          >
            @{comment.author}
          </Link>

          <span>•</span>

          <Link href={commentUrl} className="text-gray-500 hover:text-gray-700">
            <time dateTime={comment.created}>
              {createdDate.toLocaleDateString()} {createdDate.toLocaleTimeString()}
            </time>
          </Link>

          {!collapsed && (
            <div className="ml-auto flex items-center gap-2">
              <Voting post={comment} />
            </div>
          )}
        </div>

        {/* Comment body */}
        {!collapsed && (
          <>
            {hideBody ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-2">
                <p className="text-yellow-800 text-sm mb-2">
                  This comment has been hidden due to low ratings.
                </p>
                <button
                  onClick={() => setHideBody(false)}
                  className="text-sm text-yellow-700 hover:text-yellow-900 underline"
                >
                  Show anyway
                </button>
              </div>
            ) : (
              <div className="comment__body mb-3">
                <MarkdownViewer text={comment.body || ''} />
              </div>
            )}

            {/* Comment actions */}
            <div className="comment__actions flex items-center gap-4 text-sm mb-3">
              {canReply && (
                <button
                  onClick={() => {
                    setShowReply(!showReply);
                    setShowEdit(false);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Reply
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => {
                    setShowEdit(!showEdit);
                    setShowReply(false);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Reply/Edit editor */}
            {(showReply || showEdit) && (
              <div className="comment__editor mb-4">
                <PostEditor
                  type={showReply ? 'submit_comment' : 'edit'}
                  body={showEdit ? comment.body : undefined}
                  onSuccess={(category, body) => {
                    if (showReply && body) {
                      handleReplySubmit(body);
                    } else if (showEdit && body) {
                      handleEditSubmit(body);
                    }
                  }}
                  onCancel={() => {
                    setShowReply(false);
                    setShowEdit(false);
                  }}
                />
              </div>
            )}

            {/* Nested replies */}
            {sortedReplies.length > 0 && (
              <div className="comment__replies ml-6 mt-4 space-y-2">
                {depth >= maxDepth ? (
                  <Link
                    href={commentUrl}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Show {comment.children || sortedReplies.length} more{' '}
                    {comment.children === 1 ? 'reply' : 'replies'}
                  </Link>
                ) : (
                  sortedReplies.map((reply) => (
                    <Comment
                      key={`${reply.author}/${reply.permlink}`}
                      comment={reply}
                      depth={depth + 1}
                      sortOrder={sortOrder}
                      showNegativeComments={showNegativeComments}
                      onReply={onReply}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

