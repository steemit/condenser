'use strict';

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

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _immutable = require('immutable');

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _squarify = require('squarify');

var _squarify2 = _interopRequireDefault(_squarify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function normalizeRewards(rewards) {
    var items = rewards.items,
        total = rewards.total,
        blogs = rewards.blogs;

    var comms = total - blogs;

    var remainder = total;
    var out = items.map(function (item, idx) {
        var _item = (0, _slicedToArray3.default)(item, 5),
            url = _item[0],
            title = _item[1],
            payout = _item[2],
            posts = _item[3],
            authors = _item[4];

        var rank = idx + 1;
        remainder -= payout;
        var is_blog = url.substring(0, 5) != 'hive-';
        url = '/' + (is_blog ? url + '/payout' : 'payout/' + url);
        title = title[0] == '@' ? title.substring(1) : title;
        return { url: url, title: title, payout: payout, posts: posts, authors: authors, is_blog: is_blog, rank: rank };
    });

    return { items: out, total: total, blogs: blogs, comms: comms, remainder: remainder };
}

function generateTreemap(items, total, xscale) {
    var data = items.map(function (item) {
        return { item: item, value: item.payout };
    });
    data.sort(function (a, b) {
        return a.value > b.value;
    });

    var container = { x0: 0, y0: 0, x1: 100 * xscale, y1: 100 };

    return (0, _squarify2.default)(data, container).map(function (box) {
        var x0 = box.x0,
            y0 = box.y0,
            x1 = box.x1,
            y1 = box.y1,
            item = box.item;

        var pct = (100 * item.payout / total).toFixed(2);
        return (0, _extends3.default)({}, item, {
            pct: pct,
            shape: {
                left: x0 / xscale + '%',
                top: y0 + '%',
                width: (x1 - x0) / xscale + '%',
                height: y1 - y0 + '%'
            }
        });
    });
}

var Rewards = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(Rewards, _Component);

    function Rewards() {
        (0, _classCallCheck3.default)(this, Rewards);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Rewards.__proto__ || (0, _getPrototypeOf2.default)(Rewards)).call(this));

        _this.state = { width: null, height: null };
        _this.resizeListener = _this.resizeListener.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(Rewards, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.props.fetchRewardsData();

            window.addEventListener('resize', this.resizeListener, {
                capture: false,
                passive: true
            });
            this.resizeListener();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.resizeListener);
        }
    }, {
        key: 'resizeListener',
        value: function resizeListener() {
            var el = window.document.getElementById('reward_container');
            if (!el) return;
            this.setState({
                width: el.offsetWidth,
                height: window.innerHeight - el.offsetTop - 50
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _state = this.state,
                width = _state.width,
                height = _state.height;
            var _props = this.props,
                rewards = _props.rewards,
                loading = _props.loading;


            var body = void 0;

            if (loading || !rewards.items) {
                body = _react2.default.createElement(
                    'div',
                    null,
                    'Loading...'
                );
            } else if (!width) {
                console.error('chart is loaded w/o viewport data');
                body = _react2.default.createElement(
                    'div',
                    null,
                    'Error'
                );
            } else {
                body = this.renderChart(normalizeRewards(rewards), width, height);
            }

            return _react2.default.createElement(
                'div',
                { className: 'row' },
                _react2.default.createElement(
                    'div',
                    { className: 'column Rewards__chart', id: 'reward_container' },
                    body
                )
            );
        }
    }, {
        key: 'renderChart',
        value: function renderChart(rewards, width, height) {
            var items = rewards.items,
                total = rewards.total,
                blogs = rewards.blogs,
                comms = rewards.comms,
                remainder = rewards.remainder;
            //items.push({ url: 'payout', title: 'other', payout: remainder, is_blog: true });

            var xscale = 0.5 * (width / height); // 2:1 bias
            var boxes = generateTreemap(items, total, xscale);

            var shown = (100 * (total - remainder) / total).toFixed(2);
            return _react2.default.createElement(
                'div',
                { id: 'reward_wrap' },
                _react2.default.createElement(
                    'div',
                    { className: 'head' },
                    'Showing top ',
                    items.length,
                    ' payout buckets, representing',
                    ' ',
                    _react2.default.createElement(
                        'strong',
                        null,
                        shown,
                        '%'
                    ),
                    ' of all pending payouts. This report does not account for burned rewards.'
                ),
                _react2.default.createElement(
                    'div',
                    { id: 'reward_chart', style: { height: height + 'px' } },
                    boxes.map(this.renderBox)
                )
            );
        }
    }, {
        key: 'renderBox',
        value: function renderBox(item) {
            var payout = item.payout,
                posts = item.posts,
                title = item.title,
                url = item.url,
                authors = item.authors,
                is_blog = item.is_blog,
                shape = item.shape,
                pct = item.pct,
                rank = item.rank;

            var summary = '$' + Math.round(payout) + ' in ' + posts + ' posts';
            var link = _react2.default.createElement(
                _reactRouter.Link,
                { to: url, className: 'box-inner' },
                _react2.default.createElement(
                    'span',
                    { className: 'title' },
                    title
                ),
                _react2.default.createElement(
                    'span',
                    { className: 'detail' },
                    _react2.default.createElement(
                        'strong',
                        null,
                        title
                    ),
                    _react2.default.createElement('br', null),
                    _react2.default.createElement(
                        'i',
                        null,
                        is_blog ? 'Blogger' : 'Community'
                    ),
                    _react2.default.createElement('br', null),
                    summary,
                    _react2.default.createElement('br', null),
                    'Rank: ',
                    rank ? '#' + rank : 'unknown',
                    authors && _react2.default.createElement(
                        'span',
                        null,
                        _react2.default.createElement('br', null),
                        authors,
                        ' authors'
                    ),
                    _react2.default.createElement('br', null),
                    pct,
                    '% of all payouts'
                )
            );

            var bg = function bg(row) {
                var posts = row.posts,
                    payout = row.payout,
                    is_blog = row.is_blog;

                var per_post = posts ? payout / posts : null;
                var alpha = per_post ? Math.min(per_post / 15 + 0.1, 1) : 0.5;
                var color = is_blog ? '155,155,255' : '220,90,255';
                return 'rgba(' + color + ',' + alpha + ')';
            };

            var className = is_blog ? 'box box-a' : 'box box-c';
            var style = (0, _extends3.default)({}, shape, { background: bg(item) });
            return _react2.default.createElement(
                'div',
                { key: url, style: style, className: className },
                link
            );
        }
    }]);
    return Rewards;
}(_react.Component), _class.propTypes = {
    loading: _propTypes2.default.bool.isRequired,
    fetchRewardsData: _propTypes2.default.func.isRequired,
    rewards: _propTypes2.default.shape({
        total: _propTypes2.default.number,
        blogs: _propTypes2.default.number,
        items: _propTypes2.default.arrayOf(_propTypes2.default.array)
    }).isRequired
}, _class.defaultProps = {
    loading: true
}, _temp);


module.exports = {
    path: 'rewards',
    component: (0, _reactRedux.connect)(
    // mapStateToProps
    function (state, ownProps) {
        var rewards = (0, _immutable.Map)({});
        if (state.global.hasIn(['rewards'])) {
            rewards = state.global.getIn(['rewards'], null);
        }
        return {
            rewards: rewards.toJS(),
            loading: state.app.get('loading')
        };
    },
    // mapDispatchToProps
    function (dispatch) {
        return {
            fetchRewardsData: function fetchRewardsData(payload) {
                return dispatch(_FetchDataSaga.actions.getRewardsData());
            }
        };
    })(Rewards)
};