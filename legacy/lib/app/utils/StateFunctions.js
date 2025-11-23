'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.numberWithCommas = undefined;
exports.isFetchingOrRecentlyUpdated = isFetchingOrRecentlyUpdated;
exports.allowDelete = allowDelete;
exports.normalizeTags = normalizeTags;
exports.parseJsonTags = parseJsonTags;
exports.hasNsfwTag = hasNsfwTag;
exports.filterTags = filterTags;
exports.pricePerSteem = pricePerSteem;

var _constants = require('app/redux/constants');

var _constants2 = _interopRequireDefault(_constants);

var _steemJs = require('@steemit/steem-js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var numberWithCommas = exports.numberWithCommas = function numberWithCommas(x) {
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

function isFetchingOrRecentlyUpdated(global_status, order, category) {
    var status = global_status ? global_status.getIn([category || '', order]) : null;
    if (!status) return false;
    if (status.fetching) return true;
    if (status.last_fetch) {
        var res = new Date() - status.last_fetch < _constants2.default.FETCH_DATA_EXPIRE_SEC * 1000;
        return res;
    }
    return false;
}

function allowDelete(comment) {
    var rshares = String(comment.get('net_rshares'));
    var hasPayout = !(rshares[0] == '0' || rshares[0] == '-');
    var hasChildren = comment.get('children') !== 0;
    var archived = comment.get('is_paidout');
    return !(hasPayout || hasChildren) && !archived;
}

function normalizeTags(metadata, category) {
    var tags = [];

    try {
        tags = metadata && metadata.toJS().tags || [];
        //if (typeof tags == 'string') tags = [tags];
        if (!Array.isArray(tags)) tags = [];
    } catch (e) {
        tags = [];
    }

    tags.unshift(category);

    return filterTags(tags);
}

function parseJsonTags(post) {
    return normalizeTags(post.get('json_metadata'), post.get('category'));
}

function hasNsfwTag(content) {
    return parseJsonTags(content).filter(function (t) {
        return t.match(/^nsfw$/i);
    }).length > 0;
}

function filterTags(tags) {
    return tags.filter(function (tag) {
        return typeof tag === 'string';
    }).filter(function (value, index, self) {
        return value && self.indexOf(value) === index;
    });
}

function pricePerSteem(state) {
    var feed_price = state.global.get('feed_price');
    if (feed_price && feed_price.has('base') && feed_price.has('quote')) {
        return _steemJs.formatter.pricePerSteem(feed_price.toJS());
    }
    return undefined;
}