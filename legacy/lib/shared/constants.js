'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var PARAM_VIEW_MODE = exports.PARAM_VIEW_MODE = 'view_mode';
var VIEW_MODE_WHISTLE = exports.VIEW_MODE_WHISTLE = 'whistle';
var WHISTLE_SIGNUP_COMPLETE = exports.WHISTLE_SIGNUP_COMPLETE = 'whistle_signup_complete';
var signupUrl = 'https://signup.steemit.com';
if (typeof window !== 'undefined') {
    signupUrl = window.location.hostname.indexOf('steemitdev.com') === -1 ? 'https://signup.steemit.com' : 'https://signup.steemitdev.com';
} else if (process.env.SERVER_NAME) {
    signupUrl = 'https://signup.' + process.env.SERVER_NAME;
}
var SIGNUP_URL = exports.SIGNUP_URL = signupUrl;
var SUBMIT_FORM_ID = exports.SUBMIT_FORM_ID = 'submitStory';