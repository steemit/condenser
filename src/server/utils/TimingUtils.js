/**
 * Timing utility module
 * Control whether timing is enabled through the TIME_LOG environment variable
 */

const ENABLE_TIMING = process.env.TIME_LOG === 'true';

/**
 * Safe console.time wrapper
 * @param {string} label - Timer label
 */
export function safeConsoleTime(label) {
    if (ENABLE_TIMING) {
        console.time(label);
    }
}

/**
 * Safe console.timeEnd wrapper
 * @param {string} label - Timer label
 */
export function safeConsoleTimeEnd(label) {
    if (ENABLE_TIMING) {
        console.timeEnd(label);
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

export default {
    safeConsoleTime,
    safeConsoleTimeEnd,
    safeStartTimer,
    safeStopTimer,
    isTimingEnabled,
};
