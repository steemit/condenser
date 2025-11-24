/**
 * Username utility functions
 * Handles normalization of usernames (removing @ prefix, etc.)
 */

/**
 * Normalize username by removing @ prefix if present
 * @param username - Username that may or may not have @ prefix
 * @returns Username without @ prefix
 */
export function normalizeUsername(username: string): string {
  if (!username) return '';
  return username.startsWith('@') ? username.slice(1) : username;
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

