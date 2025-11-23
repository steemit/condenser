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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _SvgImage = require('app/components/elements/SvgImage');

var _SvgImage2 = _interopRequireDefault(_SvgImage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PostWrapper = function (_React$Component) {
    (0, _inherits3.default)(PostWrapper, _React$Component);

    function PostWrapper() {
        (0, _classCallCheck3.default)(this, PostWrapper);
        return (0, _possibleConstructorReturn3.default)(this, (PostWrapper.__proto__ || (0, _getPrototypeOf2.default)(PostWrapper)).apply(this, arguments));
    }

    (0, _createClass3.default)(PostWrapper, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                redirectUrl = _props.redirectUrl,
                loading = _props.loading,
                author = _props.author,
                permlink = _props.permlink;

            if (redirectUrl) {
                if (_reactRouter.browserHistory) _reactRouter.browserHistory.replace(redirectUrl);
            } else if (loading) {
                this.props.getPostHeader({ author: author, permlink: permlink });
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var redirectUrl = this.props.redirectUrl;

            if (redirectUrl && redirectUrl != prevProps.redirectUrl) {
                if (_reactRouter.browserHistory) _reactRouter.browserHistory.replace(redirectUrl);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                this.props.loading ? _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle' })
                ) : _react2.default.createElement(
                    'div',
                    { className: 'NotFound float-center' },
                    _react2.default.createElement(
                        'a',
                        { href: '/' },
                        _react2.default.createElement(_SvgImage2.default, { name: '404', width: '640px', height: '480px' })
                    )
                )
            );
        }
    }]);
    return PostWrapper;
}(_react2.default.Component);

var StoreWrapped = (0, _reactRedux.connect)(function (state, props) {
    // read route
    var routeParams = props.routeParams;

    var author = routeParams.username;
    var permlink = routeParams.slug;
    var postref = author + '/' + permlink;

    // check for category (undefined: loading; null: not found)
    var category = state.global.getIn(['content', postref, 'category']);
    if (typeof category === 'undefined') {
        if (state.global.hasIn(['headers', postref])) {
            category = state.global.getIn(['headers', postref, 'category'], null);
        }
    }

    return {
        author: author,
        permlink: permlink,
        redirectUrl: category ? '/' + category + '/@' + postref : null,
        loading: typeof category === 'undefined'
    };
}, function (dispatch) {
    return {
        getPostHeader: function getPostHeader(payload) {
            return dispatch(_FetchDataSaga.actions.getPostHeader(payload));
        }
    };
})(PostWrapper);

module.exports = {
    path: '/@:username/:slug',
    component: StoreWrapped
};