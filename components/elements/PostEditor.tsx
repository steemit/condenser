'use client';

import { useState, useEffect } from 'react';
import MarkdownIt from 'markdown-it';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showLogin } from '@/store/slices/userSlice';
import { broadcastComment } from '@/lib/api/broadcast';
import htmlReady from '@/lib/html-ready';
import {
  generateCommentPermlink,
  generateStoryPermlink,
} from '@/lib/utils/permlink';
import {
  buildCommentOptionsConfig,
  validateBeneficiaries,
  DEFAULT_PAYOUT_TYPE,
  MAX_BENEFICIARIES,
  type BeneficiaryEntry,
  type PayoutType,
} from '@/lib/utils/comment-options';

/** Result passed to onSuccess after a successful broadcast. */
export interface PostEditorResult {
  /** Story category (first tag); undefined for comments. */
  category?: string;
  author: string;
  permlink: string;
  title: string;
  body: string;
  parentAuthor: string;
  parentPermlink: string;
  transactionId?: string;
}

interface PostEditorProps {
  type: 'submit_story' | 'submit_comment' | 'edit';
  /** Parent comment/post author (submit_comment and edit). */
  parentAuthor?: string;
  /** Parent comment/post permlink (submit_comment and edit). */
  parentPermlink?: string;
  /** Existing permlink (edit only — edits reuse the original permlink). */
  commentPermlink?: string;
  category?: string;
  title?: string;
  body?: string;
  tags?: string[];
  /** Override the localStorage draft key (defaults are per-type/per-parent). */
  formId?: string;
  onSuccess?: (result: PostEditorResult) => void;
  onCancel?: () => void;
}

// Legacy ReplyEditor.jsx:32
const MAX_TAGS = 8;
// Legacy ReplyEditor.jsx:250,261-267 — body byte limits (UTF-8), with the
// same 256-byte headroom legacy leaves for the permlink/title overhead.
const MAX_BODY_BYTES_STORY = 64 * 1024 - 256;
const MAX_BODY_BYTES_COMMENT = 16 * 1024 - 256;

// Same options surface as components/elements/MarkdownViewer.tsx so the tags/
// users/images/links extracted here match what the reader pipeline sees.
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
  quotes: '“”‘’',
});

/**
 * Build json_metadata like legacy ReplyEditor.jsx:1390-1432:
 * render the body, run HtmlReady without mutating, and record extracted
 * hashtags/users/images/links plus app + format.
 */
function buildJsonMetadata(opts: {
  isStory: boolean;
  tags: string[];
  category: string;
  body: string;
}): string {
  const rtags = htmlReady(md.render(opts.body), { mutate: false });

  // legacy allTags(): user-entered tags first, then body hashtags until the
  // MAX_TAGS limit is reached.
  const metaTags: string[] = [];
  const pushTag = (tag: string) => {
    if (metaTags.length < MAX_TAGS && !metaTags.includes(tag)) {
      metaTags.push(tag);
    }
  };
  if (opts.isStory && opts.category) pushTag(opts.category);
  opts.tags.forEach(pushTag);
  rtags.hashtags.forEach(pushTag);

  const meta: Record<string, unknown> = {};
  if (metaTags.length) meta.tags = metaTags;
  if (rtags.usertags.size) meta.users = Array.from(rtags.usertags);
  if (rtags.images.size) meta.image = Array.from(rtags.images);
  if (rtags.links.size) meta.links = Array.from(rtags.links);
  meta.app = 'condenser/0.1';
  if (opts.isStory) meta.format = 'markdown';
  return JSON.stringify(meta);
}

/** Chain check used to keep story permlinks unique (legacy get_post_header). */
async function isStoryPermlinkTaken(
  author: string,
  permlink: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/steem/post?author=${encodeURIComponent(author)}&permlink=${encodeURIComponent(permlink)}`
    );
    return res.ok;
  } catch {
    // If the check fails, optimistically assume the permlink is free.
    return false;
  }
}

/**
 * PostEditor component
 * Handles post creation and editing
 * Simplified version migrated from legacy/src/app/components/elements/ReplyEditor.jsx
 *
 * Signing happens client-side via lib/api/broadcast.ts (broadcastComment);
 * private keys never leave the browser.
 */
export default function PostEditor({
  type,
  parentAuthor: parentAuthorProp,
  parentPermlink: parentPermlinkProp,
  commentPermlink,
  category: initialCategory,
  title: initialTitle,
  body: initialBody,
  tags: initialTags,
  formId: formIdProp,
  onSuccess,
  onCancel,
}: PostEditorProps) {
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.user.current?.username);
  const [title, setTitle] = useState(initialTitle || '');
  const [body, setBody] = useState(initialBody || '');
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [category, setCategory] = useState(initialCategory || '');
  // Payout options + beneficiaries apply to root posts only (legacy
  // ReplyEditor gates them behind PostAdvancedSettings, shown for stories,
  // and skips them entirely on edits — #735).
  const [payoutType, setPayoutType] = useState<PayoutType>(DEFAULT_PAYOUT_TYPE);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Per-editor draft key so story/comment/edit drafts never clobber each
  // other (legacy used a unique formId per editor instance).
  const formId =
    formIdProp ||
    (type === 'submit_story'
      ? 'submit'
      : type === 'edit'
        ? `edit-${commentPermlink || 'draft'}`
        : `comment-${parentAuthorProp || ''}-${parentPermlinkProp || 'root'}`);
  const isStory = type === 'submit_story';
  const isEdit = type === 'edit';

  // Load draft from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const draftData = localStorage.getItem(`replyEditorData-${formId}`);
    if (draftData && !initialTitle && !initialBody) {
      try {
        const draft = JSON.parse(draftData);
        if (draft.title) setTitle(draft.title);
        if (draft.body) setBody(draft.body);
        if (draft.tags) setTags(draft.tags);
        if (draft.category) setCategory(draft.category);
        // Legacy persists payoutType/beneficiaries in the same draft
        // (ReplyEditor.jsx:203-245).
        if (draft.payoutType) setPayoutType(draft.payoutType);
        if (draft.beneficiaries) setBeneficiaries(draft.beneficiaries);
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [formId, initialTitle, initialBody]);

  // Save draft to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!title && !body) return;

    const draftData = JSON.stringify({ title, body, tags, category, payoutType, beneficiaries });
    localStorage.setItem(`replyEditorData-${formId}`, draftData);
  }, [title, body, tags, category, payoutType, beneficiaries, formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // The author comes from the logged-in session; the signing key comes
    // from the client-side key cache (lib/crypto/key-storage.ts).
    if (!username) {
      setError('Please log in to post.');
      dispatch(showLogin({}));
      return;
    }

    // Validation
    if (isStory && !title.trim()) {
      setError('Title is required');
      return;
    }
    if (!body.trim()) {
      setError('Body is required');
      return;
    }
    // Legacy ReplyEditor.jsx:261-267 — byte length, not char length.
    const maxBodyBytes = isStory ? MAX_BODY_BYTES_STORY : MAX_BODY_BYTES_COMMENT;
    const bodyBytes = new TextEncoder().encode(body).length;
    if (bodyBytes >= maxBodyBytes) {
      setError(`Post body exceeds ${maxBodyBytes} bytes.`);
      return;
    }
    // Category = first tag (legacy ReplyEditor), unless a community
    // category was forced by the caller.
    const cat = (initialCategory || tags[0] || '').trim();
    if (isStory && !cat) {
      setError('At least one tag is required (the first tag is the category)');
      return;
    }
    // Beneficiaries are validated with legacy required=true semantics
    // (PostAdvancedSettings.jsx submit handler).
    if (isStory) {
      const beneficiaryError = validateBeneficiaries(username, beneficiaries, true);
      if (beneficiaryError) {
        setError(beneficiaryError);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Wire up author/permlink/parents like legacy ReplyEditor linkProps
      // (ReplyEditor.jsx:1365-1378).
      const parentAuthor = isStory ? '' : parentAuthorProp || '';
      const parentPermlink = isStory ? cat : parentPermlinkProp || '';
      const trimmedTitle = isStory ? title.trim() : '';
      const trimmedBody = body.trim();

      let permlink: string;
      if (isEdit) {
        // Edits keep the original permlink.
        permlink = commentPermlink || '';
      } else if (isStory) {
        permlink = await generateStoryPermlink(trimmedTitle, (candidate) =>
          isStoryPermlinkTaken(username, candidate)
        );
      } else {
        permlink = generateCommentPermlink();
      }

      const jsonMetadata = buildJsonMetadata({
        isStory,
        tags,
        category: cat,
        body: trimmedBody,
      });

      const result = await broadcastComment({
        parentAuthor,
        parentPermlink,
        author: username,
        permlink,
        title: trimmedTitle,
        body: trimmedBody,
        jsonMetadata,
        // Root posts only: legacy never attaches comment_options to comments
        // or edits.
        commentOptions: isStory
          ? buildCommentOptionsConfig(payoutType, beneficiaries)
          : undefined,
      });

      // Clear draft
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`replyEditorData-${formId}`);
      }

      if (onSuccess) {
        onSuccess({
          category: isStory ? cat : undefined,
          author: username,
          permlink,
          title: trimmedTitle,
          body: trimmedBody,
          parentAuthor,
          parentPermlink,
          transactionId: result.transactionId,
        });
      }
    } catch (err) {
      console.error('Error submitting post:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit post';
      if (message.includes('Private key not available')) {
        // Session hydration restores identity but not the signing key (e.g.
        // after a page reload) — ask the user to log in again.
        setError('Your signing key has expired. Please log in again to post.');
        dispatch(showLogin({}));
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const tag = input.value.trim().replace(/^#/, '').toLowerCase();

      if (tag && !tags.includes(tag) && tags.length < MAX_TAGS) {
        setTags([...tags, tag]);
        input.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Beneficiary row editing, mirroring legacy BeneficiarySelector handlers.
  const addBeneficiary = () => {
    if (beneficiaries.length < MAX_BENEFICIARIES) {
      setBeneficiaries([...beneficiaries, { username: '', percent: '' }]);
    }
  };

  const removeBeneficiary = (idx: number) => {
    setBeneficiaries(beneficiaries.filter((_, bidx) => idx !== bidx));
  };

  const updateBeneficiary = (
    idx: number,
    field: keyof BeneficiaryEntry,
    value: string
  ) => {
    setBeneficiaries(
      beneficiaries.map((b, bidx) => (idx === bidx ? { ...b, [field]: value } : b))
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isStory && (
        <div>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-none border-0 border-b border-gray-300 px-2 py-2 text-[1rem] font-bold focus:border-gray-500 focus:outline-none"
            placeholder="Title"
            maxLength={255}
            required
          />
        </div>
      )}

      <div>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={15}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Write your story..."
          required
        />
        <p className="mt-1 border-l border-[#ccc] bg-[#fafafa] px-2 py-[3px] text-[85%] text-[#767676]">
          Markdown is supported. Use **bold**, *italic*, [links](url), etc.
        </p>
      </div>

      {isStory && (
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            id="tags"
            type="text"
            onKeyDown={handleTagInput}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Add up to ${MAX_TAGS} tags (the first tag is the category)`}
            disabled={tags.length >= MAX_TAGS}
          />
        </div>
      )}

      {isStory && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <div>
            <label
              htmlFor="payout-type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Author rewards
            </label>
            {/* Labels from legacy locales/en.json reply_editor.* */}
            <select
              id="payout-type"
              value={payoutType}
              onChange={(e) => setPayoutType(e.target.value as PayoutType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="50%">50% SBD / 50% SP</option>
              <option value="100%">Power Up 100%</option>
              <option value="0%">Decline Payout</option>
            </select>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Who should receive any rewards?
            </span>
            {beneficiaries.map((beneficiary, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={beneficiary.username}
                  onChange={(e) => updateBeneficiary(idx, 'username', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Account"
                  aria-label={`Beneficiary account ${idx + 1}`}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={beneficiary.percent}
                  onChange={(e) => updateBeneficiary(idx, 'percent', e.target.value)}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Percent"
                  aria-label={`Beneficiary percent ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeBeneficiary(idx)}
                  className="px-2 text-gray-500 hover:text-red-600"
                  aria-label={`Remove beneficiary ${idx + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
            {beneficiaries.length < MAX_BENEFICIARIES && (
              <button
                type="button"
                onClick={addBeneficiary}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Add account
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : isStory ? 'Post' : 'Submit'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setTitle('');
            setBody('');
            setTags([]);
            setPayoutType(DEFAULT_PAYOUT_TYPE);
            setBeneficiaries([]);
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`replyEditorData-${formId}`);
            }
          }}
          className="px-6 py-2 text-gray-700 hover:text-black transition-colors"
        >
          Clear
        </button>

        <span className="text-sm text-gray-500 ml-auto">
          Draft saved automatically
        </span>
      </div>
    </form>
  );
}
