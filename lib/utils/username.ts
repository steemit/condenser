/**
 * Username utility functions
 * Handles normalization of usernames (removing @ prefix, etc.)
 */

/**
 * Normalize username by removing @ prefix if present
 * Also handles URL-encoded @ (%40)
 * @param username - Username that may or may not have @ prefix or %40 encoding
 * @returns Username without @ prefix
 */
export function normalizeUsername(username: string): string {
  if (!username) return '';
  // Handle URL-encoded @ (%40)
  let normalized = username;
  if (normalized.startsWith('%40')) {
    normalized = normalized.slice(3);
  } else if (normalized.startsWith('@')) {
    normalized = normalized.slice(1);
  }
  // Decode any remaining URL encoding
  try {
    normalized = decodeURIComponent(normalized);
  } catch (e) {
    // If decoding fails, use as-is
  }
  return normalized;
}

/**
 * Format username with @ prefix for display
 * @param username - Username without @ prefix
 * @returns Username with @ prefix
 */
export function formatUsername(username: string): string {
  if (!username) return '';
  return username.startsWith('@') ? username : `@${username}`;
}

