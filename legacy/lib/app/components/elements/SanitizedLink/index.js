'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

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

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _Phishing = require('app/utils/Phishing');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SanitizedLink = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(SanitizedLink, _React$Component);

    function SanitizedLink() {
        (0, _classCallCheck3.default)(this, SanitizedLink);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SanitizedLink.__proto__ || (0, _getPrototypeOf2.default)(SanitizedLink)).call(this));

        _this.onRevealPhishyLink = function (e) {
            e.preventDefault();
            _this.setState({ revealPhishyLink: true });
        };

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'SanitizedLink');
        _this.state = {
            revealPhishyLink: false
        };
        return _this;
    }

    (0, _createClass3.default)(SanitizedLink, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                text = _props.text,
                url = _props.url;


            var isPhishy = (0, _Phishing.looksPhishy)(url);

            var classes = (0, _classnames2.default)({
                SanitizedLink: true,
                'SanitizedLink--phishyLink': isPhishy
            });

            if (!isPhishy) {
                return _react2.default.createElement(
                    'a',
                    {
                        className: classes,
                        href: url,
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    },
                    text
                );
            }

            if (this.state.revealPhishyLink) {
                return _react2.default.createElement(
                    'span',
                    {
                        className: classes,
                        title: (0, _counterpart2.default)('sanitizedlink_jsx.phishylink_caution')
                    },
                    text
                );
            }

            return _react2.default.createElement(
                'span',
                { className: classes },
                _react2.default.createElement(
                    'span',
                    { className: 'phishylink-caution' },
                    (0, _counterpart2.default)('sanitizedlink_jsx.phishylink_caution')
                ),
                _react2.default.createElement(
                    'span',
                    {
                        className: 'phishylink-reveal-link',
                        role: 'button',
                        onClick: this.onRevealPhishyLink
                    },
                    (0, _counterpart2.default)('sanitizedlink_jsx.phishylink_reveal')
                )
            );
        }
    }]);
    return SanitizedLink;
}(_react2.default.Component), _class.propTypes = {
    url: _propTypes2.default.string,
    text: _propTypes2.default.string
}, _temp);
exports.default = SanitizedLink;