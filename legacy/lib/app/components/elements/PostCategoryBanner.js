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

var _reactRedux = require('react-redux');

var _Userpic = require('app/components/elements/Userpic');

var _Userpic2 = _interopRequireDefault(_Userpic);

var _reactRouter = require('react-router');

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PostCategoryBanner = function (_React$Component) {
    (0, _inherits3.default)(PostCategoryBanner, _React$Component);

    function PostCategoryBanner() {
        (0, _classCallCheck3.default)(this, PostCategoryBanner);
        return (0, _possibleConstructorReturn3.default)(this, (PostCategoryBanner.__proto__ || (0, _getPrototypeOf2.default)(PostCategoryBanner)).apply(this, arguments));
    }

    (0, _createClass3.default)(PostCategoryBanner, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                communityName = _props.communityName,
                getCommunity = _props.getCommunity,
                community = _props.community;

            if (communityName && !community) getCommunity(communityName);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var _props2 = this.props,
                communityName = _props2.communityName,
                getCommunity = _props2.getCommunity,
                community = _props2.community;

            if (prevProps.communityName != communityName) {
                if (communityName && !community) getCommunity(communityName);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props3 = this.props,
                username = _props3.username,
                community = _props3.community,
                disabledCommunity = _props3.disabledCommunity;

            var url = community ? '/trending/' + community.get('name') : null;
            var label = community ? _react2.default.createElement(
                _reactRouter.Link,
                { to: url },
                community.get('title')
            ) : '@' + username + '\'s blog';
            var onClick = function onClick(e) {
                e.preventDefault();
                _this2.props.onCancel();
            };
            var onUndo = function onUndo(e) {
                e.preventDefault();
                _this2.props.onUndo(disabledCommunity);
            };

            return _react2.default.createElement(
                'div',
                { className: 'PostCategoryBanner column small-12 ' },
                community && _react2.default.createElement(
                    'a',
                    { href: '#', onClick: onClick, style: { float: 'right' } },
                    '[Post to blog]'
                ),
                disabledCommunity && _react2.default.createElement(
                    'a',
                    { href: '#', onClick: onUndo, style: { float: 'right' } },
                    '[Post to Community]'
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'postTo' },
                    _react2.default.createElement(
                        'small',
                        null,
                        'Posting to ',
                        community ? 'Community: ' : '',
                        _react2.default.createElement(
                            'span',
                            { className: 'smallLabel' },
                            label
                        )
                    )
                )
            );
        }
    }]);
    return PostCategoryBanner;
}(_react2.default.Component);

PostCategoryBanner.propTypes = {
    username: _propTypes2.default.string.isRequired,
    communityName: _propTypes2.default.string,
    community: _propTypes2.default.object, // TODO: define shape
    onCancel: _propTypes2.default.func
};

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var username = state.user.getIn(['current', 'username'], null);
    return (0, _extends3.default)({}, ownProps, {
        community: state.global.getIn(['community', ownProps.communityName], null),
        username: username
    });
}, function (dispatch) {
    return {
        getCommunity: function getCommunity(communityName) {
            return dispatch(_FetchDataSaga.actions.getCommunity(communityName));
        }
    };
})(PostCategoryBanner);