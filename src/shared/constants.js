export const PARAM_VIEW_MODE = 'view_mode';
export const VIEW_MODE_WHISTLE = 'whistle';
export const WHISTLE_SIGNUP_COMPLETE = 'whistle_signup_complete';
let signupUrl = 'https://signup.steemit.com';
if (typeof window !== 'undefined') {
    signupUrl =
        window.location.hostname.indexOf('steemitdev.com') === -1
            ? 'https://signup.steemit.com'
            : 'https://signup.steemitdev.com';
} else if (process.env.SERVER_NAME) {
    signupUrl = `https://signup.${process.env.SERVER_NAME}`;
}
export const SIGNUP_URL = signupUrl;
export const SUBMIT_FORM_ID = 'submitStory';
