'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Links = require('app/utils/Links');

var _Links2 = _interopRequireDefault(_Links);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Iframe = function (_React$Component) {
    (0, _inherits3.default)(Iframe, _React$Component);

    function Iframe() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, Iframe);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Iframe.__proto__ || (0, _getPrototypeOf2.default)(Iframe)).call.apply(_ref, [this].concat(args))), _this), _this.normalizeEmbedUrl = function (url) {
            var match = void 0;

            // Detect youtube URLs
            match = url.match(_Links2.default.youTubeId);
            if (match && match.length >= 2) {
                return 'https://www.youtube.com/embed/' + match[1];
            }

            // Detect vimeo
            match = url.match(_Links2.default.vimeoId);
            if (match && match.length >= 2) {
                return 'https://player.vimeo.com/video/' + match[1];
            }

            // Detect twitch stream
            match = url.match(_Links2.default.twitch);
            if (match && match.length >= 3) {
                if (match[1] === undefined) {
                    return 'https://player.twitch.tv/?autoplay=false&channel=' + match[2];
                } else {
                    return 'https://player.twitch.tv/?autoplay=false&video=' + match[1];
                }
            }

            // Detect dtube
            match = url.match(_Links2.default.dtubeId);
            if (match && match.length >= 2) {
                return 'https://emb.d.tube/#!/' + match[1];
            }

            // Detect 3Speak
            match = url.match(_Links2.default.threespeak);
            if (match && match.length >= 2) {
                return 'https://3speak.online/embed?v=' + match[1];
            }

            console.log('unable to auto-detect embed url', url);
            return null;
        }, _this.onChange = function (e) {
            var _this$props = _this.props,
                node = _this$props.node,
                state = _this$props.state,
                editor = _this$props.editor;

            var value = e.target.value;

            var src = _this.normalizeEmbedUrl(value) || value;

            var next = editor.getState().transform().setNodeByKey(node.key, { data: { src: src } }).apply();

            editor.onChange(next);
        }, _this.onClick = function (e) {
            // stop propagation so that the void node itself isn't focused, since that would unfocus the input.
            e.stopPropagation();
        }, _this.render = function () {
            var _this$props2 = _this.props,
                node = _this$props2.node,
                state = _this$props2.state,
                attributes = _this$props2.attributes;

            var isFocused = state.selection.hasEdgeIn(node);
            var className = isFocused ? 'active' : null;

            var lockStyle = {
                position: 'absolute',
                top: '0px',
                left: '0px',
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.1)'
            };

            return _react2.default.createElement(
                'div',
                (0, _extends3.default)({}, attributes, { className: className }),
                _react2.default.createElement(
                    'div',
                    { className: 'videoWrapper' },
                    _this.renderFrame(),
                    _react2.default.createElement(
                        'div',
                        { style: lockStyle },
                        isFocused && _react2.default.createElement(
                            'span',
                            null,
                            _this.renderInput()
                        )
                    )
                )
            );
        }, _this.renderFrame = function () {
            var src = _this.props.node.data.get('src');
            src = _this.normalizeEmbedUrl(src) || src;

            return _react2.default.createElement('iframe', {
                type: 'text/html',
                width: '640',
                height: '360',
                src: src,
                frameBorder: '0',
                webkitallowfullscreen: true,
                mozallowfullscreen: true,
                allowfullscreen: true
            });
        }, _this.renderInput = function () {
            var src = _this.props.node.data.get('src');

            var style = {
                fontFamily: 'Arial',
                margin: '200px auto',
                width: '90%',
                padding: '1rem 0.5rem',
                background: 'rgba(255,255,255,0.9)',
                display: 'block',
                textAlign: 'center',
                color: 'black',
                borderRadius: '5px'
            };

            return _react2.default.createElement('input', {
                value: src,
                onChange: _this.onChange,
                onClick: _this.onClick,
                placeholder: 'Enter a YouTube or Vimeo URL...',
                style: style
            });
        }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    return Iframe;
}(_react2.default.Component);

exports.default = Iframe;