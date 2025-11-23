'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = exports.icons = undefined;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var icons = exports.icons = ['user', 'share', 'chevron-up-circle', 'chevron-down-circle', 'chevron-left', 'chatboxes', 'chatbox', 'close', 'facebook', 'twitter', 'reddit', 'linkedin', 'link', 'logo', 'logotype', 'clock', 'extlink', 'steem', 'steempower', 'ether', 'bitcoin', 'bitshares', 'dropdown-arrow', 'printer', 'search', 'menu', 'voter', 'voters', 'empty', 'flag1', 'flag2', 'reblog', 'photo', 'line', 'video', 'eye', 'location', 'calendar', 'chain', 'wallet', 'cog', 'quill', 'key', 'enter', 'profile', 'replies', 'home', 'reply', '100', 'pencil2', 'pin', 'pin-disabled', 'account-group', 'account-heart', 'account-settings-variant', 'library-books', 'wallet_2', 'compass-outline', 'currency-usd', 'person'];
var icons_map = {};
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
    for (var _iterator = (0, _getIterator3.default)(icons), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var i = _step.value;
        icons_map[i] = require('assets/icons/' + i + '.svg');
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

var rem_sizes = {
    '0_8x': '0.8',
    '1x': '1.12',
    '1_5x': '1.5',
    '2x': '2',
    '3x': '3.45',
    '4x': '4.60',
    '5x': '5.75',
    '10x': '10.0'
};

var Icon = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Icon, _React$Component);

    function Icon() {
        (0, _classCallCheck3.default)(this, Icon);
        return (0, _possibleConstructorReturn3.default)(this, (Icon.__proto__ || (0, _getPrototypeOf2.default)(Icon)).apply(this, arguments));
    }

    (0, _createClass3.default)(Icon, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                name = _props.name,
                size = _props.size,
                className = _props.className;

            var classes = 'Icon ' + name;
            var style = {
                display: 'inline-block',
                width: rem_sizes['1x'] + 'rem',
                height: rem_sizes['1x'] + 'rem'
            };
            if (size) {
                classes += ' Icon_' + size;
                style = {
                    display: 'inline-block',
                    width: rem_sizes[size] + 'rem',
                    height: rem_sizes[size] + 'rem'
                };
            }
            if (className) {
                classes += ' ' + className;
            }

            return _react2.default.createElement('span', {
                className: classes,
                style: style,
                dangerouslySetInnerHTML: { __html: icons_map[name] }
            });
        }
    }]);
    return Icon;
}(_react2.default.Component), _class.propTypes = {
    name: _propTypes2.default.string.isRequired,
    size: _propTypes2.default.oneOf(['0_8x', '1x', '1_5x', '2x', '3x', '4x', '5x', '10x']),
    inverse: _propTypes2.default.bool,
    className: _propTypes2.default.string
}, _temp);
exports.default = Icon;