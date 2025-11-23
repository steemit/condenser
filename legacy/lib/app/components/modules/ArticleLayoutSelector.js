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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint react/prop-types: 0 */
var ArticleLayoutSelector = function (_React$Component) {
    (0, _inherits3.default)(ArticleLayoutSelector, _React$Component);

    function ArticleLayoutSelector() {
        (0, _classCallCheck3.default)(this, ArticleLayoutSelector);
        return (0, _possibleConstructorReturn3.default)(this, (ArticleLayoutSelector.__proto__ || (0, _getPrototypeOf2.default)(ArticleLayoutSelector)).apply(this, arguments));
    }

    (0, _createClass3.default)(ArticleLayoutSelector, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'articles__layout-selector' },
                _react2.default.createElement(
                    'svg',
                    {
                        className: 'articles__icon--layout',
                        onClick: this.props.toggleBlogmode
                    },
                    _react2.default.createElement(
                        'g',
                        {
                            id: 'svg-icon-symbol-layout',
                            viewBox: '0 0 24 24',
                            stroke: 'none',
                            strokeWidth: 1,
                            fill: 'none',
                            fillRule: 'evenodd'
                        },
                        _react2.default.createElement('rect', {
                            className: 'icon-svg icon-svg--accent icon-svg--layout-line1',
                            x: 6,
                            y: 16,
                            width: 12,
                            height: 2
                        }),
                        _react2.default.createElement('rect', {
                            className: 'icon-svg icon-svg--accent icon-svg--layout-line2',
                            x: 6,
                            y: 11,
                            width: 12,
                            height: 2
                        }),
                        _react2.default.createElement('rect', {
                            className: 'icon-svg icon-svg--accent icon-svg--layout-line3',
                            x: 6,
                            y: 6,
                            width: 12,
                            height: 2
                        }),
                        _react2.default.createElement('path', {
                            d: 'M2,2 L2,22 L22,22 L22,2 L2,2 Z M1,1 L23,1 L23,23 L1,23 L1,1 Z',
                            id: 'icon-svg__border',
                            className: 'icon-svg icon-svg--accent',
                            fillRule: 'nonzero'
                        })
                    )
                )
            );
        }
    }]);
    return ArticleLayoutSelector;
}(_react2.default.Component);

exports.default = (0, _reactRedux.connect)(function (state) {
    return {
        blogmode: state.app.getIn(['user_preferences', 'blogmode'])
    };
}, function (dispatch) {
    return {
        toggleBlogmode: function toggleBlogmode() {
            dispatch(appActions.toggleBlogmode());
        }
    };
})(ArticleLayoutSelector);