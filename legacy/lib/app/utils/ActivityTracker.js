'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = function (tagName, trackingId) {
    console.log('cookie tagname:', tagName, trackingId);
    // white list
    var tagList = window.activityTag ? window.activityTag : [];
    if (tagList.indexOf(tagName) === -1) {
        return;
    }

    // location info
    var hostname = window.location.hostname;
    var host = window.location.host;
    var locationInfo = hostname.split('.').reverse();
    var domain = ['localhost', '127.0.0.1'].indexOf(hostname) === -1 ? '.' + locationInfo[1] + '.' + locationInfo[0] : hostname;
    var pathname = window.location.pathname;
    var referrer = document.referrer;

    // if (referrer === '' || referrer.indexOf(host) !== -1) {
    //     console.log('referrer: not_from_outside', referrer, hostname);
    //     return;
    // }
    console.log('cookie location info:', domain, referrer);

    // get cookie
    var activityTag = _jsCookie2.default.getJSON(cookieName);

    // check if exist cookie
    if (activityTag === undefined) {
        var data = {};
        data[tagName] = { isVisit: 0, isReg: 0 };
        _jsCookie2.default.set(cookieName, data, { expires: expiresTime, domain: domain });
    } else if ((0, _keys2.default)(activityTag).indexOf(tagName) === -1) {
        activityTag[tagName] = { isVisit: 0, isReg: 0 };
        _jsCookie2.default.set(cookieName, activityTag, { expires: expiresTime, domain: domain });
    }

    // record
    (0, _ServerApiClient.recordActivityTracker)({
        trackingId: trackingId,
        activityTag: tagName,
        pathname: pathname,
        referrer: referrer
    });
};

var _jsCookie = require('js-cookie');

var _jsCookie2 = _interopRequireDefault(_jsCookie);

var _ServerApiClient = require('app/utils/ServerApiClient');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cookieName = 'activity_tag';
var expiresTime = 30;