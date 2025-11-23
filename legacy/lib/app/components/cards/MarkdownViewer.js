'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _remarkable = require('remarkable');

var _remarkable2 = _interopRequireDefault(_remarkable);

var _YoutubePreview = require('app/components/elements/YoutubePreview');

var _YoutubePreview2 = _interopRequireDefault(_YoutubePreview);

var _SanitizeConfig = require('app/utils/SanitizeConfig');

var _SanitizeConfig2 = _interopRequireDefault(_SanitizeConfig);

var _sanitizeHtml = require('sanitize-html');

var _sanitizeHtml2 = _interopRequireDefault(_sanitizeHtml);

var _HtmlReady = require('shared/HtmlReady');

var _HtmlReady2 = _interopRequireDefault(_HtmlReady);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remarkable = new _remarkable2.default({
    html: true, // remarkable renders first then sanitize runs...
    breaks: true,
    linkify: false, // linkify is done locally
    typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
    quotes: '“”‘’'
});

var remarkableToSpec = new _remarkable2.default({
    html: true,
    breaks: false, // real markdown uses \n\n for paragraph breaks
    linkify: false,
    typographer: false,
    quotes: '“”‘’'
});

var MarkdownViewer = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(MarkdownViewer, _Component);

    function MarkdownViewer() {
        (0, _classCallCheck3.default)(this, MarkdownViewer);

        var _this = (0, _possibleConstructorReturn3.default)(this, (MarkdownViewer.__proto__ || (0, _getPrototypeOf2.default)(MarkdownViewer)).call(this));

        _this.onAllowNoImage = function () {
            _this.setState({ allowNoImage: false });
        };

        _this.state = { allowNoImage: true };
        return _this;
    }

    (0, _createClass3.default)(MarkdownViewer, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(np, ns) {
            return np.text !== this.props.text || np.large !== this.props.large || ns.allowNoImage !== this.state.allowNoImage;
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                noImage = _props.noImage,
                hideImages = _props.hideImages,
                isProxifyImages = _props.isProxifyImages;
            var allowNoImage = this.state.allowNoImage;
            var text = this.props.text;

            if (!text) text = ''; // text can be empty, still view the link meta data
            var _props2 = this.props,
                large = _props2.large,
                highQualityPost = _props2.highQualityPost;


            var html = false;
            // See also ReplyEditor isHtmlTest
            var m = text.match(/^<html>([\S\s]*)<\/html>$/);
            if (m && m.length === 2) {
                html = true;
                text = m[1];
            } else {
                // See also ReplyEditor isHtmlTest
                html = /^<p>[\S\s]*<\/p>/.test(text);
            }

            // Strip out HTML comments. "JS-DOS" bug.
            text = text.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)');

            var renderer = remarkableToSpec;
            if (this.props.breaks === true) {
                renderer = remarkable;
            }

            var renderedText = html ? text : renderer.render(text);
            // If content isn't wrapped with an html element at this point, add it.
            if (!renderedText.indexOf('<html>') !== 0) {
                renderedText = '<html>' + renderedText + '</html>';
            }

            // Embed videos, link mentions and hashtags, etc...
            if (renderedText) renderedText = (0, _HtmlReady2.default)(renderedText, {
                hideImages: hideImages,
                isProxifyImages: isProxifyImages
            }).html;

            // Complete removal of javascript and other dangerous tags..
            // The must remain as close as possible to dangerouslySetInnerHTML
            var cleanText = renderedText;
            if (this.props.allowDangerousHTML === true) {
                console.log('WARN\tMarkdownViewer rendering unsanitized content');
            } else {
                cleanText = (0, _sanitizeHtml2.default)(renderedText, (0, _SanitizeConfig2.default)({
                    large: large,
                    highQualityPost: highQualityPost,
                    noImage: noImage && allowNoImage
                }));
            }

            if (/<\s*script/gi.test(cleanText)) {
                // Not meant to be complete checking, just a secondary trap and red flag (code can change)
                console.error('Refusing to render script tag in post text', cleanText);
                return _react2.default.createElement('div', null);
            }

            var noImageActive = cleanText.indexOf(_SanitizeConfig.noImageText) !== -1;

            // In addition to inserting the youtube component, this allows
            // react to compare separately preventing excessive re-rendering.
            var idx = 0;
            var sections = [];

            // HtmlReady inserts ~~~ embed:${id} type ~~~
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(cleanText.split('~~~ embed:')), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var section = _step.value;

                    var match = section.match(/^([A-Za-z0-9\?\=\_\-\/\.]+) (youtube|vimeo|twitch|dtube|threespeak)\s?(\d+)? ~~~/);
                    if (match && match.length >= 3) {
                        var id = match[1];
                        var type = match[2];
                        var startTime = match[3] ? parseInt(match[3]) : 0;
                        var w = large ? 640 : 480,
                            h = large ? 360 : 270;

                        if (type === 'youtube') {
                            sections.push(_react2.default.createElement(_YoutubePreview2.default, {
                                key: id,
                                width: w,
                                height: h,
                                youTubeId: id,
                                startTime: startTime,
                                frameBorder: '0',
                                allowFullScreen: 'true'
                            }));
                        } else if (type === 'threespeak') {
                            var url = 'https://3speak.online/embed?v=' + id;
                            sections.push(_react2.default.createElement(
                                'div',
                                { className: 'videoWrapper', key: id },
                                _react2.default.createElement('iframe', {
                                    src: url,
                                    width: w,
                                    height: h,
                                    frameBorder: '0',
                                    webkitallowfullscreen: 'true',
                                    mozallowfullscreen: 'true',
                                    allowFullScreen: true,
                                    title: 'ThreeSpeak video ' + id
                                })
                            ));
                        } else if (type === 'vimeo') {
                            var _url = 'https://player.vimeo.com/video/' + id + '#t=' + startTime + 's';
                            sections.push(_react2.default.createElement(
                                'div',
                                { className: 'videoWrapper', key: id },
                                _react2.default.createElement('iframe', {
                                    src: _url,
                                    width: w,
                                    height: h,
                                    frameBorder: '0',
                                    webkitallowfullscreen: 'true',
                                    mozallowfullscreen: 'true',
                                    allowFullScreen: true,
                                    title: 'Vimeo video ' + id
                                })
                            ));
                        } else if (type === 'twitch') {
                            var _url2 = 'https://player.twitch.tv/' + id;
                            sections.push(_react2.default.createElement(
                                'div',
                                { className: 'videoWrapper', key: id },
                                _react2.default.createElement('iframe', {
                                    src: _url2,
                                    width: w,
                                    height: h,
                                    frameBorder: '0',
                                    webkitallowfullscreen: 'true',
                                    mozallowfullscreen: 'true',
                                    allowFullScreen: true,
                                    title: 'Twitch video ' + id
                                })
                            ));
                        } else if (type === 'dtube') {
                            var _url3 = 'https://emb.d.tube/#!/' + id;
                            sections.push(_react2.default.createElement(
                                'div',
                                { className: 'videoWrapper', key: id },
                                _react2.default.createElement('iframe', {
                                    src: _url3,
                                    width: w,
                                    height: h,
                                    frameBorder: '0',
                                    webkitallowfullscreen: 'true',
                                    mozallowfullscreen: 'true',
                                    allowFullScreen: true,
                                    title: 'DTube video ' + id
                                })
                            ));
                        } else {
                            console.error('MarkdownViewer unknown embed type', type);
                        }
                        if (match[3]) {
                            section = section.substring((id + ' ' + type + ' ' + startTime + ' ~~~').length);
                        } else {
                            section = section.substring((id + ' ' + type + ' ~~~').length);
                        }
                        if (section === '') continue;
                    }
                    sections.push(_react2.default.createElement('div', {
                        key: idx++,
                        dangerouslySetInnerHTML: { __html: section }
                    }));
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var cn = 'Markdown' + (this.props.className ? ' ' + this.props.className : '') + (html ? ' html' : '') + (large ? '' : ' MarkdownViewer--small');
            return _react2.default.createElement(
                'div',
                { className: 'MarkdownViewer ' + cn },
                sections,
                noImageActive && allowNoImage && _react2.default.createElement(
                    'div',
                    {
                        onClick: this.onAllowNoImage,
                        className: 'MarkdownViewer__negative_group'
                    },
                    (0, _counterpart2.default)('markdownviewer_jsx.images_were_hidden_due_to_low_ratings'),
                    _react2.default.createElement(
                        'button',
                        {
                            style: { marginBottom: 0 },
                            className: 'button hollow tiny float-right'
                        },
                        (0, _counterpart2.default)('g.show')
                    )
                )
            );
        }
    }]);
    return MarkdownViewer;
}(_react.Component), _class.propTypes = {
    // HTML properties
    text: _propTypes2.default.string,
    className: _propTypes2.default.string,
    large: _propTypes2.default.bool,
    highQualityPost: _propTypes2.default.bool,
    noImage: _propTypes2.default.bool,
    allowDangerousHTML: _propTypes2.default.bool,
    hideImages: _propTypes2.default.bool, // whether to replace images with just a span containing the src url
    breaks: _propTypes2.default.bool // true to use bastardized markdown that cares about newlines
    // used for the ImageUserBlockList
}, _class.defaultProps = {
    allowDangerousHTML: false,
    breaks: true,
    className: '',
    hideImages: false,
    large: false
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    return (0, _extends3.default)({}, ownProps);
})(MarkdownViewer);