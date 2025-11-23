'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchTabs = function (_Component) {
    (0, _inherits3.default)(SearchTabs, _Component);

    function SearchTabs(props) {
        (0, _classCallCheck3.default)(this, SearchTabs);
        return (0, _possibleConstructorReturn3.default)(this, (SearchTabs.__proto__ || (0, _getPrototypeOf2.default)(SearchTabs)).call(this));
    }

    (0, _createClass3.default)(SearchTabs, [{
        key: 'handleClick',
        value: function handleClick(currentTab) {
            var _props = this.props,
                depth = _props.depth,
                sort = _props.sort,
                searchDepth = _props.searchDepth;

            if (currentTab === depth) return;
            searchDepth(currentTab);
            this.searchAgain(currentTab, sort);
        }
    }, {
        key: 'handleSortChange',
        value: function handleSortChange(e) {
            var _props2 = this.props,
                depth = _props2.depth,
                searchSort = _props2.searchSort;

            searchSort(e.target.value);
            this.searchAgain(depth, e.target.value);
        }
    }, {
        key: 'searchAgain',
        value: function searchAgain(depth, sort) {
            var _props3 = this.props,
                params = _props3.params,
                handleTabChange = _props3.handleTabChange;

            handleTabChange((0, _extends3.default)({}, params, {
                depth: depth,
                sort: sort
            }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var depth = this.props.depth;

            return _react2.default.createElement(
                'div',
                { className: 'search-nav' },
                _react2.default.createElement(
                    'ul',
                    { className: 'search-tabs' },
                    _react2.default.createElement(
                        'li',
                        {
                            className: depth === 0 ? 'active' : '',
                            onClick: function onClick() {
                                return _this2.handleClick(0);
                            }
                        },
                        (0, _counterpart2.default)('g.tiezi')
                    ),
                    _react2.default.createElement(
                        'li',
                        {
                            className: depth === 1 ? 'active' : '',
                            onClick: function onClick() {
                                return _this2.handleClick(1);
                            }
                        },
                        (0, _counterpart2.default)('g.replies_to')
                    ),
                    _react2.default.createElement(
                        'li',
                        {
                            className: depth === 2 ? 'active' : '',
                            onClick: function onClick() {
                                return _this2.handleClick(2);
                            }
                        },
                        (0, _counterpart2.default)('g.user')
                    ),
                    _react2.default.createElement(
                        'li',
                        {
                            className: 'li-right',
                            style: depth === 2 ? { display: 'none' } : null
                        },
                        _react2.default.createElement(
                            'select',
                            {
                                className: 'search-sort',
                                onChange: function onChange(e) {
                                    return _this2.handleSortChange(e);
                                }
                            },
                            _react2.default.createElement(
                                'option',
                                { value: 'created_at' },
                                (0, _counterpart2.default)('g.sort_by_time')
                            ),
                            _react2.default.createElement(
                                'option',
                                { value: 'payout' },
                                (0, _counterpart2.default)('g.sort_by_reward')
                            )
                        )
                    )
                )
            );
        }
    }]);
    return SearchTabs;
}(_react.Component);

exports.default = SearchTabs;