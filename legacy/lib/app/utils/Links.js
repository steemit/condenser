'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.determineActivityTag = exports.determineViewMode = exports.makeParams = exports.addToParams = exports.imageFile = exports.image = exports.youTube = exports.remote = exports.local = exports.any = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _constants = require('../../shared/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var urlChar = '[^\\s"<>\\]\\[\\(\\)]'; /* eslint-disable no-useless-escape */
/* eslint-disable no-plusplus */
/* eslint-disable arrow-parens */

var urlCharEnd = urlChar.replace(/\]$/, ".,']"); // insert bad chars to end on
var imagePath = '(?:(?:\\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs/[a-z\\d]{40,}))';
var domainPath = '(?:[-a-zA-Z0-9\\._]*[-a-zA-Z0-9])';
var urlChars = '(?:' + urlChar + '*' + urlCharEnd + ')?';

var urlSet = function urlSet() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$domain = _ref.domain,
        domain = _ref$domain === undefined ? domainPath : _ref$domain,
        path = _ref.path;

    // urlChars is everything but html or markdown stop chars
    return 'https?://' + domain + '(?::\\d{2,5})?(?:[/\\?#]' + urlChars + (path ? path : '') + ')' + (path ? '' : '?');
};

/**
    Unless your using a 'g' (glob) flag you can store and re-use your regular expression.  Use the cache below.  If your using a glob (for example: replace all), the regex object becomes stateful and continues where it left off when called with the same string so naturally the regexp object can't be cached for long.
*/
var any = exports.any = function any() {
    var flags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'i';
    return new RegExp(urlSet(), flags);
};
var local = exports.local = function local() {
    var flags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'i';
    return new RegExp(urlSet({ domain: '(?:localhost|(?:.*\\.)?steemit.com)' }), flags);
};
var remote = exports.remote = function remote() {
    var flags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'i';
    return new RegExp(urlSet({ domain: '(?!localhost|(?:.*\\.)?steemit.com)' + domainPath }), flags);
};
var youTube = exports.youTube = function youTube() {
    var flags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'i';
    return new RegExp(urlSet({ domain: '(?:(?:.*.)?youtube.com|youtu.be)' }), flags);
};
var image = exports.image = function image() {
    var flags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'i';
    return new RegExp(urlSet({ path: imagePath }), flags);
};
var imageFile = exports.imageFile = function imageFile() {
    var flags = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'i';
    return new RegExp(imagePath, flags);
};
// export const nonImage = (flags = 'i') => new RegExp(urlSet({path: '!' + imageFile}), flags)
// export const markDownImageRegExp = (flags = 'i') => new RegExp('\!\[[\w\s]*\]\(([^\)]+)\)', flags);

exports.default = {
    any: any(),
    local: local(),
    remote: remote(),
    image: image(),
    imageFile: imageFile(),
    youTube: youTube(),
    youTubeId: /(?:(?:youtube.com\/watch\?v=)|(?:youtu.be\/)|(?:youtube.com\/embed\/))([A-Za-z0-9\_\-]+)/i,
    vimeo: /https?:\/\/(?:vimeo.com\/|player.vimeo.com\/video\/)([0-9]+)\/?(#t=((\d+)s?))?\/?/,
    vimeoId: /(?:vimeo.com\/|player.vimeo.com\/video\/)([0-9]+)/,
    // simpleLink: new RegExp(`<a href="(.*)">(.*)<\/a>`, 'ig'),
    ipfsPrefix: /(https?:\/\/.*)?\/ipfs/i,
    twitch: /https?:\/\/(?:www.)?twitch.tv\/(?:(videos)\/)?([a-zA-Z0-9][\w]{3,24})/i,
    dtube: /https:\/\/(?:emb\.)?(?:d.tube\/\#\!\/(?:v\/)?)([a-zA-Z0-9\-\.\/]*)/,
    dtubeId: /(?:d\.tube\/#!\/(?:v\/)?([a-zA-Z0-9\-\.\/]*))+/,
    threespeak: /(?:https?:\/\/(?:(?:3speak.online\/watch\?v=)|(?:3speak.online\/embed\?v=)))([A-Za-z0-9\_\-\/]+)(&.*)?/i,
    threespeakImageLink: /<a href="(https?:\/\/3speak.online\/watch\?v=([A-Za-z0-9\_\-\/]+))".*<img.*?><\/a>/i
};

//TODO: possible this should go somewhere else.
/**
 * Returns a new object extended from outputParams with [key] == inputParams[key] if the value is in allowedValues
 * @param outputParams
 * @param inputParams
 * @param key
 * @param allowedValues
 * @returns {*}
 */

var addToParams = exports.addToParams = function addToParams(outputParams, inputParams, key, allowedValues) {
    var respParams = (0, _assign2.default)({}, outputParams);
    if (inputParams[key] && allowedValues.indexOf(inputParams[key]) > -1) {
        respParams[key] = inputParams[key];
    }
    return respParams;
};

//TODO: possible this should go somewhere else.
var makeParams = exports.makeParams = function makeParams(params, prefix) {
    var paramsList = [];
    if (params.constructor === Array) {
        paramsList = params;
    } else {
        (0, _entries2.default)(params).forEach(function (_ref2) {
            var _ref3 = (0, _slicedToArray3.default)(_ref2, 2),
                key = _ref3[0],
                value = _ref3[1];

            paramsList.push(key + '=' + value);
        });
    }
    if (paramsList.length > 0) {
        return (prefix !== false ? typeof prefix === 'string' ? prefix : '?' : '') + paramsList.join('&');
    }
    return '';
};

/**
 *
 * @param {string} search - window.location.search formatted string (may omit '?')
 * @returns {string}
 */
var determineViewMode = exports.determineViewMode = function determineViewMode(search) {
    var searchList = search.indexOf('?') === 0 ? search.substr(1).split('&') : search.split('&');
    for (var i = 0; i < searchList.length; i++) {
        if (searchList[i].indexOf(_constants.PARAM_VIEW_MODE) === 0) {
            if (searchList[i] == _constants.PARAM_VIEW_MODE + '=' + _constants.VIEW_MODE_WHISTLE) {
                //we only want to support known view modes.
                return _constants.VIEW_MODE_WHISTLE;
            }
            return '';
        }
    }
    return '';
};

var determineActivityTag = exports.determineActivityTag = function determineActivityTag(hash) {
    var tagList = window.activityTag ? window.activityTag : [];
    var originHash = hash.substr(1);
    if (tagList.indexOf(originHash) !== -1) {
        return originHash;
    }
    return false;
};

// Original regex
// const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';

// About performance
// Using exec on the same regex object requires a new regex to be created and compile for each text (ex: post).  Instead replace can be used `body.replace(remoteRe, l => {` discarding the result for better performance`}).  Re-compiling is a chrome bottleneck but did not effect nodejs.