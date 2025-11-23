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

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _StateFunctions = require('app/utils/StateFunctions');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TagsIndex = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(TagsIndex, _React$Component);

    function TagsIndex(props) {
        (0, _classCallCheck3.default)(this, TagsIndex);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TagsIndex.__proto__ || (0, _getPrototypeOf2.default)(TagsIndex)).call(this, props));

        _this.onChangeSort = function (e, order) {
            e.preventDefault();
            _this.setState({ order: order });
        };

        _this.compareTags = function (a, b, type) {
            switch (type) {
                case 'name':
                    return a.get('name').localeCompare(b.get('name'));
                case 'posts':
                    return parseInt(a.get('top_posts')) <= parseInt(b.get('top_posts')) ? 1 : -1;
                case 'comments':
                    return parseInt(a.get('comments')) <= parseInt(b.get('comments')) ? 1 : -1;
                case 'payouts':
                    return parseInt(a.get('total_payouts')) <= parseInt(b.get('total_payouts')) ? 1 : -1;
            }
        };

        _this.state = { order: props.order || 'name' };
        _this.onChangeSort = _this.onChangeSort.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(TagsIndex, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            var res = this.props.tagsAll !== nextProps.tagsAll || this.state !== nextState;
            return res;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var tagsAll = this.props.tagsAll;
            var order = this.state.order;

            var tags = tagsAll;

            var rows = tags.filter(
            // there is a blank tag present, as well as some starting with #. filter them out.
            function (tag) {
                return (/^[a-z]/.test(tag.get('name'))
                );
            }).sort(function (a, b) {
                return _this2.compareTags(a, b, order);
            }).map(function (tag) {
                var name = tag.get('name');
                var link = '/trending/' + name;
                return _react2.default.createElement(
                    'tr',
                    { key: name },
                    _react2.default.createElement(
                        'td',
                        null,
                        _react2.default.createElement(
                            _reactRouter.Link,
                            { to: link, activeClassName: 'active' },
                            name
                        )
                    ),
                    _react2.default.createElement(
                        'td',
                        null,
                        (0, _StateFunctions.numberWithCommas)(tag.get('top_posts').toString())
                    ),
                    _react2.default.createElement(
                        'td',
                        null,
                        (0, _StateFunctions.numberWithCommas)(tag.get('comments').toString())
                    ),
                    _react2.default.createElement(
                        'td',
                        null,
                        (0, _StateFunctions.numberWithCommas)(tag.get('total_payouts'))
                    )
                );
            }).toArray();

            var cols = [['name', (0, _counterpart2.default)('g.tag')], ['posts', (0, _counterpart2.default)('g.posts')], ['comments', (0, _counterpart2.default)('g.comments')], ['payouts', (0, _counterpart2.default)('g.payouts')]].map(function (col) {
                return _react2.default.createElement(
                    'th',
                    { key: col[0] },
                    order === col[0] ? _react2.default.createElement(
                        'strong',
                        null,
                        col[1]
                    ) : _react2.default.createElement(
                        _reactRouter.Link,
                        {
                            to: '#',
                            onClick: function onClick(e) {
                                return _this2.onChangeSort(e, col[0]);
                            }
                        },
                        col[1]
                    )
                );
            });

            return _react2.default.createElement(
                'div',
                { className: 'TagsIndex row' },
                _react2.default.createElement(
                    'div',
                    { className: 'column' },
                    _react2.default.createElement('br', null),
                    _react2.default.createElement(
                        'h4',
                        null,
                        (0, _counterpart2.default)('g.trending_topics')
                    ),
                    _react2.default.createElement(
                        'table',
                        null,
                        _react2.default.createElement(
                            'thead',
                            null,
                            _react2.default.createElement(
                                'tr',
                                null,
                                cols
                            )
                        ),
                        _react2.default.createElement(
                            'tbody',
                            null,
                            rows
                        )
                    )
                )
            );
        }
    }]);
    return TagsIndex;
}(_react2.default.Component), _class.propTypes = {
    tagsAll: _propTypes2.default.object.isRequired
}, _temp);
exports.default = TagsIndex;


module.exports = {
    path: 'tags(/:order)',
    component: (0, _reactRedux.connect)(function (state) {
        return {
            tagsAll: state.global.get('tags', (0, _immutable.Map)())
        };
    })(TagsIndex)
};