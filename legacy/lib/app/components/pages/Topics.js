'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _NativeSelect = require('app/components/elements/NativeSelect');

var _NativeSelect2 = _interopRequireDefault(_NativeSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Topics = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(Topics, _Component);

    function Topics() {
        (0, _classCallCheck3.default)(this, Topics);
        return (0, _possibleConstructorReturn3.default)(this, (Topics.__proto__ || (0, _getPrototypeOf2.default)(Topics)).apply(this, arguments));
    }

    (0, _createClass3.default)(Topics, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                current = _props.current,
                compact = _props.compact,
                username = _props.username,
                topics = _props.topics,
                subscriptions = _props.subscriptions,
                communities = _props.communities;


            if (compact) {
                var opt = function opt(tag) {
                    var label = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

                    if (tag && tag[0] === '@') return {
                        value: '/@' + username + '/feed',
                        label: 'My Friends' || 'tt(\'g.my_feed\')'
                    };
                    if (tag === 'my') return { value: '/trending/my', label: 'My communities' };
                    if (tag == 'explore') return {
                        value: '/communities',
                        label: 'Explore Communities...'
                    };
                    if (tag) return {
                        value: '/trending/' + tag,
                        label: label || '#' + tag
                    };
                    return { value: '/', label: (0, _counterpart2.default)('g.all_tags') };
                };

                var options = [];
                // Add 'All Posts' link.
                options.push(opt(null));
                if (username && subscriptions) {
                    // Add 'My Friends' Link
                    options.push(opt('@' + username));
                    // Add 'My Communities' Link
                    options.push(opt('my'));
                    var subscriptionOptions = subscriptions.toJS().map(function (cat) {
                        return opt(cat[0], cat[1]);
                    });
                    options.push({
                        value: 'Subscriptions',
                        label: 'Community Subscriptions',
                        disabled: true
                    });
                    options.push.apply(options, (0, _toConsumableArray3.default)(subscriptionOptions));
                }
                if (topics) {
                    var topicsOptions = topics.toJS().map(function (cat) {
                        return opt(cat[0], cat[1]);
                    });
                    options.push({
                        value: 'Topics',
                        label: 'Trending Communities',
                        disabled: true
                    });
                    options.push.apply(options, (0, _toConsumableArray3.default)(topicsOptions));
                }

                options.push(opt('explore'));
                var currOpt = opt(current);
                if (!options.find(function (opt) {
                    return opt.value == currOpt.value;
                })) {
                    options.push(opt(current, communities.getIn([current, 'title'])));
                }

                return _react2.default.createElement(_NativeSelect2.default, {
                    options: options,
                    currentlySelected: currOpt.value,
                    onChange: function onChange(opt) {
                        _reactRouter.browserHistory.push(opt.value);
                    }
                });
            }

            var link = function link(url, label) {
                var className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
                return _react2.default.createElement(
                    'div',
                    { className: className },
                    _react2.default.createElement(
                        _reactRouter.Link,
                        {
                            to: url,
                            className: 'c-sidebar__link',
                            activeClassName: 'active'
                        },
                        label
                    )
                );
            };

            var moreLabel = _react2.default.createElement(
                'span',
                null,
                (0, _counterpart2.default)('g.show_more_topics'),
                '\u2026'
            );

            var list = _react2.default.createElement(
                'span',
                null,
                (subscriptions || topics).size > 0,
                username && subscriptions && subscriptions.toJS().map(function (cat) {
                    return _react2.default.createElement(
                        'li',
                        { key: cat[0] },
                        link('/trending/' + cat[0], cat[1], '')
                    );
                }),
                (!username || !subscriptions) && topics.toJS().map(function (cat) {
                    return _react2.default.createElement(
                        'li',
                        { key: cat[0] },
                        link('/trending/' + cat[0], cat[1], '')
                    );
                }),
                _react2.default.createElement(
                    'li',
                    null,
                    link('/communities', moreLabel, 'c-sidebar__link--emphasis')
                )
            );

            return _react2.default.createElement(
                'ul',
                { id: 'Subscriptions', className: 'MySubscriptions' },
                list
            );
        }
    }]);
    return Topics;
}(_react.Component), _class.propTypes = {
    topics: _propTypes2.default.object.isRequired,
    subscriptions: _propTypes2.default.object,
    current: _propTypes2.default.string,
    compact: _propTypes2.default.bool.isRequired
}, _class.defaultProps = {
    current: ''
}, _temp);
exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    return (0, _extends3.default)({}, ownProps, {
        communities: state.global.get('community')
    });
})(Topics);