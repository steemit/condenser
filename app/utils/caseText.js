/**
 * use this function like base for other words
 *
 * @param {string} text - test with incline
 * @param {case} incline
 * @returns {string}
 */

let commonCaseText = (text, incline = '') => {
    return text + incline;
};

/**
 * case for "Сила Голоса"
 *
 * @see VESTING_TOKEN value
 * @param {string} incline
 * @returns {string}
 */
const VESTING_TOKEN_CASE = (incline = 'a') => {
    return `${commonCaseText('Сил', incline)} Голоса`;
};

/**
 * case for "Золотой"
 *
 * @see DEBT_TOKEN value
 * @param incline
 * @returns {string}
 */
const DEBT_TOKEN_CASE = (incline = 'ой') => {
    return commonCaseText('Золот', incline);
};

export {
    commonCaseText,
    VESTING_TOKEN_CASE,
    DEBT_TOKEN_CASE
}