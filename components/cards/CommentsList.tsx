'use client';

import { useState } from 'react';
import Comment, { Comment as CommentType } from './Comment';
import PostEditor from '@/components/elements/PostEditor';

interface CommentsListProps {
  comments: CommentType[];
  postAuthor: string;
  postPermlink: string;
  postCategory: string;
  sortOrder?: 'votes' | 'new' | 'trending';
  onReply?: (parentAuthor: string, parentPermlink: string, body: string) => void;
  onEdit?: (author: string, permlink: string, body: string) => void;
  onDelete?: (author: string, permlink: string) => void;
}

/**
 * CommentsList component
 * Displays a list of comments with sorting and reply functionality
 */
export default function CommentsList({
  comments,
  postAuthor,
  postPermlink,
  postCategory,
  sortOrder = 'trending',
  onReply,
  onEdit,
  onDelete,
}: CommentsListProps) {
  const [showNewComment, setShowNewComment] = useState(false);
  const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);

  // Build reply tree structure
  const buildCommentTree = (allComments: CommentType[]): CommentType[] => {
    const commentMap = new Map<string, CommentType>();
    const rootComments: CommentType[] = [];

    // First pass: create map of all comments
    allComments.forEach((comment) => {
      commentMap.set(`${comment.author}/${comment.permlink}`, {
        ...comment,
        replies: [],
      });
    });

    // Second pass: build tree structure
    allComments.forEach((comment) => {
      const commentKey = `${comment.author}/${comment.permlink}`;
      const commentWithReplies = commentMap.get(commentKey)!;

      if (comment.parent_author && comment.parent_permlink) {
        const parentKey = `${comment.parent_author}/${comment.parent_permlink}`;
        const parent = commentMap.get(parentKey);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(commentKey);
        }
      } else {
        // Root comment
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const rootComments = buildCommentTree(comments);

  // Sort root comments
  const sortedRootComments = [...rootComments].sort((a, b) => {
    if (currentSortOrder === 'new') {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    } else if (currentSortOrder === 'votes') {
      const aVotes = a.active_votes?.filter((v) => v.weight > 0).length || 0;
      const bVotes = b.active_votes?.filter((v) => v.weight > 0).length || 0;
      return bVotes - aVotes;
    } else {
      // trending
      const aPayout = parseFloat(a.pending_payout_value || '0');
      const bPayout = parseFloat(b.pending_payout_value || '0');
      if (aPayout !== bPayout) return bPayout - aPayout;
      const aRshares = parseFloat(a.net_rshares || '0');
      const bRshares = parseFloat(b.net_rshares || '0');
      return bRshares - aRshares;
    }
  });

  const getRepliesForComment = (comment: CommentType): CommentType[] => {
    if (!comment.replies || comment.replies.length === 0) return [];
    return comments.filter((c) =>
      comment.replies!.includes(`${c.author}/${c.permlink}`)
    );
  };

  const handleNewComment = (category?: string, body?: string) => {
    if (onReply && body) {
      onReply(postAuthor, postPermlink, body);
      setShowNewComment(false);
    }
  };

  return (
    <div className="comments-list mt-8 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Comments ({comments.length})
        </h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={currentSortOrder}
              onChange={(e) =>
                setCurrentSortOrder(e.target.value as 'votes' | 'new' | 'trending')
              }
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="trending">Trending</option>
              <option value="votes">Votes</option>
              <option value="new">New</option>
            </select>
          </div>

          <button
            onClick={() => setShowNewComment(!showNewComment)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showNewComment ? 'Cancel' : 'Add Comment'}
          </button>
        </div>
      </div>

      {/* New comment editor */}
      {showNewComment && (
        <div className="mb-6">
          <PostEditor
            type="submit_comment"
            onSuccess={handleNewComment}
            onCancel={() => setShowNewComment(false)}
          />
        </div>
      )}

      {/* Comments list */}
      {sortedRootComments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRootComments.map((comment) => (
            <Comment
              key={`${comment.author}/${comment.permlink}`}
              comment={comment}
              depth={1}
              sortOrder={currentSortOrder}
              replies={getRepliesForComment(comment)}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

