'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var LoadingIndicator = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(LoadingIndicator, _React$Component);

    function LoadingIndicator(props) {
        (0, _classCallCheck3.default)(this, LoadingIndicator);

        var _this = (0, _possibleConstructorReturn3.default)(this, (LoadingIndicator.__proto__ || (0, _getPrototypeOf2.default)(LoadingIndicator)).call(this, props));

        _this.state = { progress: 0 };
        return _this;
    }

    (0, _createClass3.default)(LoadingIndicator, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                type = _props.type,
                inline = _props.inline,
                style = _props.style;

            switch (type) {
                case 'dots':
                    return _react2.default.createElement(
                        'div',
                        {
                            style: style,
                            className: 'LoadingIndicator three-bounce'
                        },
                        _react2.default.createElement('div', { className: 'bounce1' }),
                        _react2.default.createElement('div', { className: 'bounce2' }),
                        _react2.default.createElement('div', { className: 'bounce3' })
                    );
                case 'circle':
                    return _react2.default.createElement(
                        'div',
                        {
                            style: style,
                            className: 'LoadingIndicator circle' + (inline ? ' inline' : '')
                        },
                        _react2.default.createElement('div', null)
                    );
                //'strong' may be an evolving load indicator.
                case 'circle-strong':
                    return _react2.default.createElement(
                        'div',
                        {
                            style: style,
                            className: 'LoadingIndicator circle circle-strong'
                        },
                        _react2.default.createElement('div', null)
                    );
                default:
                    return _react2.default.createElement(
                        'div',
                        {
                            className: 'LoadingIndicator loading-overlay' + (this.progress > 0 ? ' with-progress' : ''),
                            style: style
                        },
                        _react2.default.createElement(
                            'div',
                            { className: 'loading-panel' },
                            _react2.default.createElement(
                                'div',
                                { className: 'spinner' },
                                _react2.default.createElement('div', { className: 'bounce1' }),
                                _react2.default.createElement('div', { className: 'bounce2' }),
                                _react2.default.createElement('div', { className: 'bounce3' })
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'progress-indicator' },
                                _react2.default.createElement(
                                    'span',
                                    null,
                                    this.state.progress
                                )
                            )
                        )
                    );
            }
        }
    }]);
    return LoadingIndicator;
}(_react2.default.Component), _class.propTypes = {
    // html component attributes
    type: _propTypes2.default.oneOf(['dots', 'circle', 'circle-strong']),
    inline: _propTypes2.default.bool,
    style: _propTypes2.default.object
}, _class.defaultProps = {
    style: {}
}, _temp);
exports.default = LoadingIndicator;