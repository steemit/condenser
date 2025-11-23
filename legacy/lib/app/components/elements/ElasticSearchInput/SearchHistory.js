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

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchHistory = function (_React$Component) {
    (0, _inherits3.default)(SearchHistory, _React$Component);

    function SearchHistory() {
        (0, _classCallCheck3.default)(this, SearchHistory);
        return (0, _possibleConstructorReturn3.default)(this, (SearchHistory.__proto__ || (0, _getPrototypeOf2.default)(SearchHistory)).apply(this, arguments));
    }

    (0, _createClass3.default)(SearchHistory, [{
        key: 'handleClick',
        value: function handleClick(text) {
            this.props.setSearchText(text);
            this.props.changeHistory(false);
        }
    }, {
        key: 'clearHistory',
        value: function clearHistory() {
            if (process.env.BROWSER) {
                window.localStorage.removeItem('steemit_search');
            }
            this.props.changeHistory(false);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var history = process.env.BROWSER ? window.localStorage.getItem('steemit_search') : null;
            if (!history) return null;
            return _react2.default.createElement(
                'ul',
                {
                    className: 'search-history',
                    style: { display: '' + (this.props.show ? 'block' : 'none') }
                },
                _react2.default.createElement(
                    'li',
                    { className: 'search-history-first' },
                    _react2.default.createElement(
                        'span',
                        null,
                        (0, _counterpart2.default)('g.search_history')
                    ),
                    _react2.default.createElement(
                        'span',
                        {
                            className: 'search-history-clear',
                            onClick: function onClick() {
                                return _this2.clearHistory();
                            }
                        },
                        (0, _counterpart2.default)('g.clear')
                    )
                ),
                history.split(',').map(function (item, index) {
                    if (index > 7) return;
                    return _react2.default.createElement(
                        'li',
                        { key: index, onClick: function onClick() {
                                return _this2.handleClick(item);
                            } },
                        item
                    );
                })
            );
        }
    }]);
    return SearchHistory;
}(_react2.default.Component);

exports.default = SearchHistory;