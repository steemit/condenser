/**
 * Timing utility module
 * Control whether timing is enabled through the TIME_LOG environment variable
 * Provides thread-safe timing utilities for concurrent server requests
 */

const ENABLE_TIMING = process.env.TIME_LOG === 'true';

// Thread-safe timer storage using Map to avoid conflicts between concurrent requests
const activeTimers = new Map();

/**
 * Generate unique timer label for concurrent safety
 * @param {string} baseLabel - Base timer label
 * @param {string} requestId - Unique request identifier (optional)
 * @returns {string} Unique timer label
 */
function generateUniqueLabel(baseLabel, requestId = null) {
    if (requestId) {
        return `${baseLabel}_${requestId}`;
    }
    // Fallback to timestamp + random for uniqueness
    return `${baseLabel}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
}

/**
 * Thread-safe console.time wrapper
 * @param {string} label - Timer label
 * @param {string} requestId - Unique request identifier (optional)
 */
export function safeConsoleTime(label, requestId = null) {
    if (ENABLE_TIMING) {
        const uniqueLabel = generateUniqueLabel(label, requestId);
        activeTimers.set(uniqueLabel, process.hrtime());
        console.time(uniqueLabel);
        return uniqueLabel; // Return the unique label for later use
    }
    return null;
}

/**
 * Thread-safe console.timeEnd wrapper
 * @param {string} label - Timer label (original or unique)
 * @param {string} requestId - Unique request identifier (optional)
 */
export function safeConsoleTimeEnd(label, requestId = null) {
    if (ENABLE_TIMING) {
        let uniqueLabel = label;

        // If it's not already a unique label, generate one
        if (!activeTimers.has(label)) {
            uniqueLabel = generateUniqueLabel(label, requestId);
        }

        if (activeTimers.has(uniqueLabel)) {
            console.timeEnd(uniqueLabel);
            activeTimers.delete(uniqueLabel);
        } else {
            console.warn(`Timer ${uniqueLabel} not found or already ended`);
        }
    }
}

/**
 * Thread-safe timing with automatic cleanup
 * @param {string} label - Timer label
 * @param {Function} fn - Function to time
 * @param {string} requestId - Unique request identifier (optional)
 * @returns {*} Result of the function
 */
export async function safeTimedExecution(label, fn, requestId = null) {
    if (!ENABLE_TIMING) {
        return await fn();
    }

    const uniqueLabel = safeConsoleTime(label, requestId);
    try {
        const result = await fn();
        return result;
    } finally {
        safeConsoleTimeEnd(uniqueLabel);
    }
}

/**
 * Safe RequestTimer startTimer wrapper
 * @param {Object} requestTimer - RequestTimer instance
 * @param {string} name - Timer name
 */
export function safeStartTimer(requestTimer, name) {
    if (ENABLE_TIMING && requestTimer) {
        requestTimer.startTimer(name);
    }
}

/**
 * Safe RequestTimer stopTimer wrapper
 * @param {Object} requestTimer - RequestTimer instance
 * @param {string} name - Timer name
 */
export function safeStopTimer(requestTimer, name) {
    if (ENABLE_TIMING && requestTimer) {
        requestTimer.stopTimer(name);
    }
}

/**
 * Check if timing is enabled
 * @returns {boolean}
 */
export function isTimingEnabled() {
    return ENABLE_TIMING;
}

/**
 * Get active timer count (for debugging)
 * @returns {number} Number of active timers
 */
export function getActiveTimerCount() {
    return activeTimers.size;
}

/**
 * Clear all active timers (for cleanup)
 */
export function clearAllTimers() {
    activeTimers.clear();
}

export default {
    safeConsoleTime,
    safeConsoleTimeEnd,
    safeTimedExecution,
    safeStartTimer,
    safeStopTimer,
    isTimingEnabled,
    getActiveTimerCount,
    clearAllTimers,
};
