'use client';

import { useState, useEffect, useRef } from 'react';

interface PostEditorProps {
  type: 'submit_story' | 'submit_comment' | 'edit';
  category?: string;
  title?: string;
  body?: string;
  tags?: string[];
  onSuccess?: (category?: string) => void;
  onCancel?: () => void;
}

/**
 * PostEditor component
 * Handles post creation and editing
 * Simplified version migrated from legacy/src/app/components/elements/ReplyEditor.jsx
 */
export default function PostEditor({
  type,
  category: initialCategory,
  title: initialTitle,
  body: initialBody,
  tags: initialTags,
  onSuccess,
  onCancel,
}: PostEditorProps) {
  const [title, setTitle] = useState(initialTitle || '');
  const [body, setBody] = useState(initialBody || '');
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [category, setCategory] = useState(initialCategory || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = 'submit';
  const isStory = type === 'submit_story';

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
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [formId, initialTitle, initialBody]);

  // Save draft to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!title && !body) return;

    const draftData = JSON.stringify({ title, body, tags, category });
    localStorage.setItem(`replyEditorData-${formId}`, draftData);
  }, [title, body, tags, category, formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (isStory && !title.trim()) {
      setError('Title is required');
      return;
    }
    if (!body.trim()) {
      setError('Body is required');
      return;
    }
    if (isStory && !category.trim()) {
      setError('Category is required');
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Implement actual post submission
      // This should dispatch a Redux action to broadcast the post
      console.log('Submitting post:', {
        type,
        title,
        body,
        category,
        tags,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear draft
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`replyEditorData-${formId}`);
      }

      if (onSuccess) {
        onSuccess(category);
      }
    } catch (err) {
      console.error('Error submitting post:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const tag = input.value.trim().replace(/^#/, '').toLowerCase();
      
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        input.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isStory && (
        <>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter post title"
              maxLength={255}
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category (e.g., technology, art)"
              required
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
          Content *
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={15}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Write your post content here (Markdown supported)"
          required
        />
        <p className="mt-2 text-sm text-gray-500">
          Markdown is supported. Use **bold**, *italic*, [links](url), etc.
        </p>
      </div>

      {isStory && (
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags (up to 5)
          </label>
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
            placeholder="Add tags (press Enter or comma to add, max 5)"
            disabled={tags.length >= 5}
          />
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : isStory ? 'Publish Post' : 'Submit'}
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

        <span className="text-sm text-gray-500 ml-auto">
          Draft saved automatically
        </span>
      </div>
    </form>
  );
}

