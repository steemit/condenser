import { OrderedSet } from 'immutable';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';

/**
 * Creates a Redux Middleware which listens for ERROR-ish events
 * and reports them to our scribe, The Overseer.
 *
 * @param {Object} options
 * @param {Function} options.includeActionInCrumbs
 * @param {Function} options.actionIsError
 * @param {Function} options.sanitizeAction
 * @param {Function} options.sanitizeState
 */
const createLoggerMiddleware = (options) => {
    return (store) => {
        let crumbs = OrderedSet();

        const getSanitizedStore = () => options.sanitizeState(store.getState());

        return next => (action) => {
            // Add to our crumbles...
            if (options.includeActionInCrumbs(action)) {
                crumbs = crumbs.add(options.sanitizeAction(action));
            }

            //  Log if error
            if (options.actionIsError(action)) {
                if (window.$STM_csrf) {
                    serverApiRecordEvent('redux_error', {
                        actions: crumbs.toJS(),
                        state: getSanitizedStore(),
                    });
                }
            }

            return next(action);
        };
    };
};

export default createLoggerMiddleware;