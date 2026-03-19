'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

interface UserProfile {
  name?: string;
  about?: string;
  location?: string;
  website?: string;
  profile_image?: string;
  cover_image?: string;
  [key: string]: any;
}

interface UserSettingsProps {
  accountname: string;
  profile: UserProfile | null;
  onProfileUpdate?: (profile: UserProfile) => void;
}

/**
 * UserSettings component
 * Allows users to edit their profile information and preferences
 * Migrated from legacy/src/app/components/modules/Settings.jsx
 */
export default function UserSettings({ 
  accountname, 
  profile, 
  onProfileUpdate 
}: UserSettingsProps) {
  const currentUser = useAppSelector((state) => state.user.current?.username);
  
  // Form state
  const [formData, setFormData] = useState<UserProfile>({
    name: profile?.name || '',
    about: profile?.about || '',
    location: profile?.location || '',
    website: profile?.website || '',
    profile_image: profile?.profile_image || '',
    cover_image: profile?.cover_image || '',
  });

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // User preferences
  const [nsfwPref, setNsfwPref] = useState('warn');
  const [language, setLanguage] = useState('en');

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        about: profile.about || '',
        location: profile.location || '',
        website: profile.website || '',
        profile_image: profile.profile_image || '',
        cover_image: profile.cover_image || '',
      });
    }
  }, [profile]);

  // Validation
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (formData.profile_image && !/^https?:\/\//.test(formData.profile_image)) {
      newErrors.profile_image = 'Profile image must be a valid URL';
    }

    if (formData.cover_image && !/^https?:\/\//.test(formData.cover_image)) {
      newErrors.cover_image = 'Cover image must be a valid URL';
    }

    if (formData.name && formData.name.length > 20) {
      newErrors.name = 'Name is too long (max 20 characters)';
    }

    if (formData.name && /^\s*@/.test(formData.name)) {
      newErrors.name = 'Name must not begin with @';
    }

    if (formData.about && formData.about.length > 160) {
      newErrors.about = 'About is too long (max 160 characters)';
    }

    if (formData.location && formData.location.length > 30) {
      newErrors.location = 'Location is too long (max 30 characters)';
    }

    if (formData.website && formData.website.length > 100) {
      newErrors.website = 'Website URL is too long (max 100 characters)';
    }

    if (formData.website && formData.website && !/^https?:\/\//.test(formData.website)) {
      newErrors.website = 'Website must be a valid URL';
    }

    return newErrors;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // TODO: Implement actual profile update via blockchain
      // This would involve creating a account_update operation
      console.log('Updating profile:', formData);

      // For now, simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Profile updated successfully!');
      
      if (onProfileUpdate) {
        onProfileUpdate(formData);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user can edit (only own account)
  const canEdit = currentUser === accountname;

  if (!canEdit) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">You can only edit your own profile settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
        
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* General error */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image URL
            </label>
            <input
              type="url"
              value={formData.profile_image}
              onChange={(e) => handleInputChange('profile_image', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.profile_image ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com/image.jpg"
            />
            {errors.profile_image && (
              <p className="mt-1 text-sm text-red-600">{errors.profile_image}</p>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.cover_image}
              onChange={(e) => handleInputChange('cover_image', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cover_image ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com/cover.jpg"
            />
            {errors.cover_image && (
              <p className="mt-1 text-sm text-red-600">{errors.cover_image}</p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your display name"
              maxLength={20}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {(formData.name ?? '').length}/20 characters
            </p>
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About
            </label>
            <textarea
              value={formData.about}
              onChange={(e) => handleInputChange('about', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.about ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={160}
            />
            {errors.about && (
              <p className="mt-1 text-sm text-red-600">{errors.about}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {(formData.about ?? '').length}/160 characters
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your location"
              maxLength={30}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {(formData.location ?? '').length}/30 characters
            </p>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.website ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://yourwebsite.com"
              maxLength={100}
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {(formData.website ?? '').length}/100 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Preferences Section */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold mb-4">Preferences</h3>
        
        <div className="space-y-4">
          {/* NSFW Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NSFW Content
            </label>
            <select
              value={nsfwPref}
              onChange={(e) => setNsfwPref(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hide">Hide NSFW content</option>
              <option value="warn">Warn before showing NSFW content</option>
              <option value="show">Always show NSFW content</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            onClick={() => {
              // TODO: Save preferences
              console.log('Saving preferences:', { nsfwPref, language });
            }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
