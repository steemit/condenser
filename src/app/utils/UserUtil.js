/**
 *
 * @returns {boolean}
 */
export const isLoggedIn = () =>
    typeof localStorage !== 'undefined' && !!localStorage.getItem('autopost2');

export default {
    isLoggedIn,
};
