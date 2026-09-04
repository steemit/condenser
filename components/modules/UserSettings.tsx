'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLocale } from '@/store/slices/appSlice';
import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n/config';
import { broadcastAccountUpdate } from '@/lib/api/broadcast';
import { fetchAccount } from '@/lib/api/steem';
import { userActionRecord } from '@/lib/analytics/overseer';

/** Legacy o2j.ifStringParseJSON. */
function ifStringParseJSON(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/** Legacy Settings.jsx read_profile_v2: prefer posting_json_metadata when it
 *  carries profile.version, else fall back to (possibly double-encoded,
 *  issue #1237) json_metadata. */
function readProfileV2(account: Record<string, unknown> | null): Record<string, unknown> {
  if (!account) return {};
  let md = ifStringParseJSON(account.posting_json_metadata);
  if (md && typeof md === 'object') {
    const profile = (md as Record<string, unknown>).profile;
    if (profile && typeof profile === 'object' && (profile as Record<string, unknown>).version) {
      return md as Record<string, unknown>;
    }
  }
  md = ifStringParseJSON(account.json_metadata);
  if (typeof md === 'string') md = ifStringParseJSON(md);
  return md && typeof md === 'object' ? (md as Record<string, unknown>) : {};
}

interface UserProfile {
  name?: string;
  about?: string;
  location?: string;
  website?: string;
  profile_image?: string;
  cover_image?: string;
  [key: string]: unknown;
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
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const localePref = useAppSelector((state) => state.app.user_preferences.locale);
  
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
  // Language is a real preference: it lives in Redux user_preferences.locale
  // (like legacy) and switching it updates the UI immediately — the
  // I18nProvider observes the Redux value, loads the locale's messages and
  // persists the choice in a cookie.
  const language: Locale = isLocale(localePref) ? localePref : DEFAULT_LOCALE;

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
      newErrors.profile_image = t('settings_jsx.profile_image_invalid_url');
    }

    if (formData.cover_image && !/^https?:\/\//.test(formData.cover_image)) {
      newErrors.cover_image = t('settings_jsx.cover_image_invalid_url');
    }

    if (formData.name && formData.name.length > 20) {
      newErrors.name = t('settings_jsx.name_too_long', { max: 20 });
    }

    if (formData.name && /^\s*@/.test(formData.name)) {
      newErrors.name = t('settings_jsx.name_must_not_begin_with');
    }

    if (formData.about && formData.about.length > 160) {
      newErrors.about = t('settings_jsx.about_too_long', { max: 160 });
    }

    if (formData.location && formData.location.length > 30) {
      newErrors.location = t('settings_jsx.location_too_long', { max: 30 });
    }

    if (formData.website && formData.website.length > 100) {
      newErrors.website = t('settings_jsx.website_too_long', { max: 100 });
    }

    if (formData.website && formData.website && !/^https?:\/\//.test(formData.website)) {
      newErrors.website = t('settings_jsx.website_invalid_url');
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
      // Legacy Settings.jsx handleSubmit + read_profile_v2: merge into the
      // RAW account metadata (bridge get_profile only returns the sanitized
      // profile sub-object — merging into it would drop arbitrary top-level
      // keys written by other apps), drop legacy user_image and empty
      // fields, mark profile version 2, then broadcast account_update2.
      const account = await fetchAccount(accountname);
      const metaData: Record<string, unknown> = { ...readProfileV2(account) };
      delete metaData.user_image;
      const profileData: Record<string, unknown> = {
        ...((metaData.profile as Record<string, unknown>) ?? {}),
      };
      for (const field of ['profile_image', 'cover_image', 'name', 'about', 'location', 'website']) {
        const value = formData[field];
        if (value) profileData[field] = value;
        else delete profileData[field];
      }
      profileData.version = 2;
      metaData.profile = profileData;

      await broadcastAccountUpdate({
        account: accountname,
        jsonMetadata: '',
        postingJsonMetadata: JSON.stringify(metaData),
      });

      // Legacy update_account tracking.
      userActionRecord('update_account', { username: accountname });

      setSuccessMessage(t('settings_jsx.profile_updated'));

      if (onProfileUpdate) {
        onProfileUpdate(profileData);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: t('settings_jsx.update_failed') });
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user can edit (only own account)
  const canEdit = currentUser === accountname;

  if (!canEdit) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">{t('settings_jsx.only_own_profile')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">{t('settings_jsx.account_settings')}</h2>
        
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
              {t('settings_jsx.profile_image_url')}
            </label>
            <input
              type="url"
              value={formData.profile_image}
              onChange={(e) => handleInputChange('profile_image', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06D6A9] ${
                errors.profile_image ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('settings_jsx.profile_image_placeholder')}
            />
            {errors.profile_image && (
              <p className="mt-1 text-sm text-red-600">{errors.profile_image}</p>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings_jsx.cover_image_url')}
            </label>
            <input
              type="url"
              value={formData.cover_image}
              onChange={(e) => handleInputChange('cover_image', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06D6A9] ${
                errors.cover_image ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('settings_jsx.cover_image_placeholder')}
            />
            {errors.cover_image && (
              <p className="mt-1 text-sm text-red-600">{errors.cover_image}</p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings_jsx.profile_name')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06D6A9] ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('settings_jsx.display_name_placeholder')}
              maxLength={20}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {t('settings_jsx.characters_used', { count: (formData.name ?? '').length, max: 20 })}
            </p>
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings_jsx.profile_about')}
            </label>
            <textarea
              value={formData.about}
              onChange={(e) => handleInputChange('about', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06D6A9] ${
                errors.about ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('settings_jsx.about_placeholder')}
              rows={3}
              maxLength={160}
            />
            {errors.about && (
              <p className="mt-1 text-sm text-red-600">{errors.about}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {t('settings_jsx.characters_used', { count: (formData.about ?? '').length, max: 160 })}
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings_jsx.profile_location')}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06D6A9] ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('settings_jsx.location_placeholder')}
              maxLength={30}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {t('settings_jsx.characters_used', { count: (formData.location ?? '').length, max: 30 })}
            </p>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings_jsx.profile_website')}
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06D6A9] ${
                errors.website ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('settings_jsx.website_placeholder')}
              maxLength={100}
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {t('settings_jsx.characters_used', { count: (formData.website ?? '').length, max: 100 })}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#06D6A9] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? t('settings_jsx.updating') : t('settings_jsx.update_profile')}
            </button>
          </div>
        </form>
      </div>

      {/* Preferences Section */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold mb-4">{t('settings_jsx.preferences')}</h3>
        
        <div className="space-y-4">
          {/* NSFW Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings_jsx.not_safe_for_work_nsfw_content')}
            </label>
            <select
              value={nsfwPref}
              onChange={(e) => setNsfwPref(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06D6A9]"
            >
              <option value="hide">{t('settings_jsx.always_hide')}</option>
              <option value="warn">{t('settings_jsx.always_warn')}</option>
              <option value="show">{t('settings_jsx.always_show')}</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('g.language')}
            </label>
            <select
              value={language}
              onChange={(e) => dispatch(setLocale(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06D6A9]"
            >
              {LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {LOCALE_LABELS[locale]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            onClick={() => {
              // TODO: Save preferences
              console.log('Saving preferences:', { nsfwPref });
            }}
          >
            {t('settings_jsx.save_preferences')}
          </button>
        </div>
      </div>
    </div>
  );
}
