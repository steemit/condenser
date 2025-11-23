'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.extractImageLink = extractImageLink;
exports.extractBodySummary = extractBodySummary;
exports.highlightKeyword = highlightKeyword;

var _RemarkableStripper = require('app/utils/RemarkableStripper');

var _RemarkableStripper2 = _interopRequireDefault(_RemarkableStripper);

var _Links = require('app/utils/Links');

var _Links2 = _interopRequireDefault(_Links);

var _sanitizeHtml = require('sanitize-html');

var _sanitizeHtml2 = _interopRequireDefault(_sanitizeHtml);

var _Html = require('app/utils/Html');

var _HtmlReady = require('shared/HtmlReady');

var _HtmlReady2 = _interopRequireDefault(_HtmlReady);

var _remarkable = require('remarkable');

var _remarkable2 = _interopRequireDefault(_remarkable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remarkable = new _remarkable2.default({ html: true, linkify: false });

var getValidImage = function getValidImage(array) {
    return array && Array.isArray(array) && array.length >= 1 && typeof array[0] === 'string' ? array[0] : null;
};

function extractImageLink(json_metadata) {
    var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    var json = json_metadata || {};
    var image_link = void 0;

    try {
        image_link = json && json.image ? getValidImage(json.image) : null;
    } catch (error) {}

    // If nothing found in json metadata, parse body and check images/links
    if (!image_link) {
        var rtags = void 0;
        {
            var isHtml = /^<html>([\S\s]*)<\/html>$/.test(body);
            var htmlText = isHtml ? body : remarkable.render(body ? body.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)') : null);
            rtags = (0, _HtmlReady2.default)(htmlText, { mutate: false });
        }

        var _Array$from = (0, _from2.default)(rtags.images);

        var _Array$from2 = (0, _slicedToArray3.default)(_Array$from, 1);

        image_link = _Array$from2[0];
    }

    // Was causing broken thumnails.  IPFS was not finding images uploaded to another server until a restart.
    // if(config.ipfs_prefix && image_link) // allow localhost nodes to see ipfs images
    //     image_link = image_link.replace(links.ipfsPrefix, config.ipfs_prefix)

    return image_link;
}

/**
 * Short description - remove bold and header, links with titles.
 *
 * if `strip_quotes`, try to remove any block quotes at beginning of body.
 */
function extractBodySummary(body) {
    var strip_quotes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var desc = body;
    if (strip_quotes) desc = desc.replace(/(^(\n|\r|\s)*)>([\s\S]*?).*\s*/g, '');
    desc = _RemarkableStripper2.default.render(desc); // render markdown to html
    desc = (0, _sanitizeHtml2.default)(desc, { allowedTags: [] }); // remove all html, leaving text
    desc = (0, _Html.htmlDecode)(desc);

    // Strip any raw URLs from preview text
    desc = desc.replace(/https?:\/\/[^\s]+/g, '');

    // Grab only the first line (not working as expected. does rendering/sanitizing strip newlines?)
    desc = desc.trim().split('\n')[0];

    if (desc.length > 140) {
        desc = desc.substring(0, 140).trim();

        // Truncate, remove the last (likely partial) word (along with random punctuation), and add ellipses
        desc = desc.substring(0, 120).trim().replace(/[,!\?]?\s+[^\s]+$/, '…');
    }

    return desc;
}

function highlightKeyword(text, keyword, color) {
    if (!text) return '';
    var content = text.split(keyword);
    var newText = content.join('<span style="background: ' + color + ';">' + keyword + '</span>');
    return newText;
}