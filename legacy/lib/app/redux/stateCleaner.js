'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends5 = require('babel-runtime/helpers/extends');

var _extends6 = _interopRequireDefault(_extends5);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = stateCleaner;

var _GDPRUserList = require('../utils/GDPRUserList');

var _GDPRUserList2 = _interopRequireDefault(_GDPRUserList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var accountsToRemove = _GDPRUserList2.default;

var gdprFilterAccounts = function gdprFilterAccounts(stateAccounts) {
    if (stateAccounts === undefined) {
        return [];
    }
    return (0, _keys2.default)(stateAccounts).filter(function (name) {
        return !accountsToRemove.includes(name);
    }).reduce(function (acc, cur) {
        return (0, _extends6.default)({}, acc, (0, _defineProperty3.default)({}, cur, stateAccounts[cur]));
    }, {});
};

var gdprFilterContent = function gdprFilterContent(stateContent) {
    if (stateContent === undefined) {
        return [];
    }
    var contentToRemove = (0, _keys2.default)(stateContent).filter(function (key) {
        return accountsToRemove.includes(stateContent[key].author);
    });

    var contentToKeep = (0, _keys2.default)(stateContent).filter(function (key) {
        return !accountsToRemove.includes(stateContent[key].author);
    });

    // First, remove content authored by GDPR users.
    var removedByAuthor = contentToKeep.reduce(function (acc, cur) {
        return (0, _extends6.default)({}, acc, (0, _defineProperty3.default)({}, cur, stateContent[cur]));
    }, {});

    // Finally, remove GDPR-authored replies referenced in other content.
    return (0, _keys2.default)(removedByAuthor).reduce(function (acc, cur) {
        return (0, _extends6.default)({}, acc, (0, _defineProperty3.default)({}, cur, (0, _extends6.default)({}, removedByAuthor[cur], {
            replies: removedByAuthor[cur].replies.filter(function (url) {
                return !contentToRemove.includes(url);
            })
        })));
    }, {});
};

function stateCleaner(state) {
    return (0, _extends6.default)({}, state, {
        accounts: gdprFilterAccounts(state.accounts),
        content: gdprFilterContent(state.content)
    });
}