'use strict';

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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _SearchReducer = require('app/redux/SearchReducer');

var _Callout = require('app/components/elements/Callout');

var _Callout2 = _interopRequireDefault(_Callout);

var _ElasticSearchInput = require('app/components/elements/ElasticSearchInput');

var _ElasticSearchInput2 = _interopRequireDefault(_ElasticSearchInput);

var _SearchTabs = require('app/components/elements/SearchTabs');

var _SearchTabs2 = _interopRequireDefault(_SearchTabs);

var _PostsList = require('app/components/cards/PostsList');

var _PostsList2 = _interopRequireDefault(_PostsList);

var _PostsIndexLayout = require('app/components/pages/PostsIndexLayout');

var _PostsIndexLayout2 = _interopRequireDefault(_PostsIndexLayout);

var _immutable = require('immutable');

var _emit = require('app/utils/emit');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchIndex = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(SearchIndex, _React$Component);

    function SearchIndex(props) {
        (0, _classCallCheck3.default)(this, SearchIndex);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SearchIndex.__proto__ || (0, _getPrototypeOf2.default)(SearchIndex)).call(this, props));

        _this.getQueryString = function (name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var url = window.location.search.split('?')[1] || '';
            var r = url.match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        };

        _this.state = {};
        _this.fetchMoreResults = _this.fetchMoreResults.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(SearchIndex, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props = this.props,
                searchReset = _props.searchReset,
                performSearch = _props.performSearch,
                params = _props.params,
                searchDepth = _props.searchDepth,
                searchSort = _props.searchSort,
                searchUser = _props.searchUser;

            if (!params.s) {
                params.s = undefined;
            }
            if (params.q) {
                searchDepth(0);
                searchSort('created_at');
                performSearch((0, _extends3.default)({}, params, { depth: 0, sort: 'created_at' }));
            }
            // searchUser()
            _emit.emit.on('query_change', function (query) {
                if (params.q !== query) {
                    //console.log('query_change', query)
                    params.q = query;
                    searchReset();
                    if (query.trim() === '') return;
                    performSearch((0, _extends3.default)({}, params, {
                        depth: _this2.props.depth,
                        sort: _this2.props.sort
                    }));
                }
            }); //监听搜索文本改变事件
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            //console.log('componentDidUpdate')
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var _props2 = this.props,
                searchReset = _props2.searchReset,
                searchDepth = _props2.searchDepth,
                searchSort = _props2.searchSort;


            searchReset();
            searchDepth(0);
            searchSort('created_at');
            _emit.emit.removeAllListeners();
        }
    }, {
        key: 'fetchMoreResults',
        value: function fetchMoreResults() {
            var _props3 = this.props,
                params = _props3.params,
                performSearch = _props3.performSearch,
                scrollId = _props3.scrollId,
                depth = _props3.depth,
                sort = _props3.sort;

            performSearch((0, _extends3.default)({}, params, { scroll_id: scrollId, depth: depth, sort: sort }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _props4 = this.props,
                result = _props4.result,
                loading = _props4.loading,
                params = _props4.params,
                performSearch = _props4.performSearch,
                searchReset = _props4.searchReset,
                depth = _props4.depth,
                searchDepth = _props4.searchDepth,
                sort = _props4.sort,
                searchSort = _props4.searchSort,
                total_result = _props4.total_result;


            var searchResults = _react2.default.createElement(_PostsList2.default, {
                ref: 'list',
                posts: (0, _immutable.fromJS)(result),
                loading: loading,
                loadMore: this.fetchMoreResults,
                query: params.q,
                depth: depth,
                total_result: total_result
            });

            return _react2.default.createElement(
                _PostsIndexLayout2.default,
                {
                    category: null,
                    enableAds: false,
                    blogmode: false
                },
                _react2.default.createElement(
                    'div',
                    { className: 'PostsIndex row ' + 'layout-list' },
                    _react2.default.createElement(
                        'article',
                        { className: 'articles' },
                        _react2.default.createElement(
                            'div',
                            { className: 'articles__header row search-diplay' },
                            _react2.default.createElement(
                                'div',
                                { className: 'small-12 medium-12 large-12 column' },
                                _react2.default.createElement(_ElasticSearchInput2.default, {
                                    initValue: params.q,
                                    expanded: true,
                                    handleSubmit: function handleSubmit(q) {
                                        searchReset();
                                        if (q.trim() === '') return;
                                        performSearch({
                                            q: q,
                                            s: undefined,
                                            depth: depth,
                                            sort: sort
                                        });
                                    },
                                    redirect: true
                                })
                            )
                        ),
                        _react2.default.createElement(_SearchTabs2.default, {
                            params: params,
                            depth: depth,
                            searchDepth: searchDepth,
                            sort: sort,
                            searchSort: searchSort,
                            handleTabChange: function handleTabChange(params) {
                                searchReset();
                                if (!params || !params.q || params.q.trim() === '') return;
                                performSearch(params);
                            }
                        }),
                        !loading && result.length === 0 ? _react2.default.createElement(
                            _Callout2.default,
                            null,
                            'Nothing was found.'
                        ) : searchResults
                    )
                )
            );
        }
    }]);
    return SearchIndex;
}(_react2.default.Component), _class.propTypes = {
    loading: _propTypes2.default.bool.isRequired,
    performSearch: _propTypes2.default.func.isRequired,
    params: _propTypes2.default.shape({
        q: _propTypes2.default.string,
        s: _propTypes2.default.string
    }).isRequired,
    scrollId: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.bool]).isRequired,
    result: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        app: _propTypes2.default.string,
        author: _propTypes2.default.string,
        author_rep: _propTypes2.default.number,
        body: _propTypes2.default.string,
        body_marked: _propTypes2.default.string,
        category: _propTypes2.default.string,
        children: _propTypes2.default.number,
        created_at: _propTypes2.default.string,
        depth: _propTypes2.default.number,
        id: _propTypes2.default.number,
        img_url: _propTypes2.default.string,
        payout: _propTypes2.default.number,
        permlink: _propTypes2.default.string,
        title: _propTypes2.default.string,
        title_marked: _propTypes2.default.string,
        total_votes: _propTypes2.default.number,
        up_votes: _propTypes2.default.number
    })).isRequired
}, _temp);


module.exports = {
    path: 'search',
    component: (0, _reactRedux.connect)(function (state, ownProps) {
        var params = ownProps.location.query;
        return {
            loading: state.search.get('pending'),
            result: state.search.get('result').toJS(),
            scrollId: state.search.get('scrollId'),
            isBrowser: process.env.BROWSER,
            depth: state.search.get('depth'),
            sort: state.search.get('sort'),
            total_result: state.search.get('total_result'),
            params: params
        };
    }, function (dispatch) {
        return {
            performSearch: function performSearch(args) {
                return dispatch((0, _SearchReducer.search)(args));
            },
            searchReset: function searchReset(args) {
                return dispatch((0, _SearchReducer.searchReset)(args));
            },
            searchDepth: function searchDepth(args) {
                return dispatch((0, _SearchReducer.searchDepth)(args));
            },
            searchSort: function searchSort(args) {
                return dispatch((0, _SearchReducer.searchSort)(args));
            },
            searchUser: function searchUser(args) {
                return dispatch((0, _SearchReducer.searchUser)(args));
            },
            searchTotal: function searchTotal(args) {
                return dispatch((0, _SearchReducer.searchTotal)(args));
            }
        };
    })(SearchIndex)
};