import { serverApiRecordEvent } from 'app/utils/ServerApiClient';

/**
 * Handles window error events by logging to overseer.
 *
 * This function relies on these globals:
 * - process.env.VERSION
 * - window.location.href
 *
 * @param {ErrorEvent} event
 */
export default function frontendLogger(event) {
    if (window.$STM_csrf) {
        const report = formatEventReport(
            event,
            window.location.href,
            process.env.VERSION
        );
        serverApiRecordEvent('client_error', report);
    }
}

/**
 * Format a browser error event report
 *
 * @param {ErrorEvent} event
 * @param {string} href
 * @param {string} version
 *
 * @return {object}
 */
export function formatEventReport(event, href, version) {
    const trace =
        typeof event.error === 'object' &&
        event.error !== null &&
        typeof event.error.stack === 'string'
            ? event.error.stack
            : false;
    return {
        trace,
        message: event.message,
        href,
        version,
    };
}
