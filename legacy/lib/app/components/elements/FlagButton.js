'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _Reveal = require('app/components/elements/Reveal');

var _Reveal2 = _interopRequireDefault(_Reveal);

var _CloseButton = require('app/components/elements/CloseButton');

var _CloseButton2 = _interopRequireDefault(_CloseButton);

var _FlagCommunityPost = require('../modules/FlagCommunityPost');

var _FlagCommunityPost2 = _interopRequireDefault(_FlagCommunityPost);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FlagButton = function (_React$Component) {
    (0, _inherits3.default)(FlagButton, _React$Component);

    function FlagButton(props) {
        (0, _classCallCheck3.default)(this, FlagButton);

        var _this = (0, _possibleConstructorReturn3.default)(this, (FlagButton.__proto__ || (0, _getPrototypeOf2.default)(FlagButton)).call(this, props));

        _this.showDialog = function () {
            _this.setState({ showDialog: true });
        };

        _this.hideDialog = function () {
            _this.setState({ showDialog: false });
        };

        _this.onSubmit = function (notes) {
            var _this$props = _this.props,
                account = _this$props.account,
                community = _this$props.community,
                username = _this$props.username,
                permlink = _this$props.permlink,
                flagPost = _this$props.flagPost;

            if (!notes || !community || !username) return false; // Fail Fast
            flagPost(username, community, account, notes, permlink);
        };

        _this.state = { showDialog: false };
        return _this;
    }

    (0, _createClass3.default)(FlagButton, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'span',
                {
                    className: ' flag__button ' + (this.props.isComment ? 'flag__button--comment' : 'flag__button--post') + ' '
                },
                _react2.default.createElement(
                    'a',
                    { onClick: function onClick() {
                            return _this2.showDialog();
                        } },
                    _react2.default.createElement(_Icon2.default, { name: 'flag1' }),
                    _react2.default.createElement(_Icon2.default, { name: 'flag2' })
                ),
                this.state.showDialog && _react2.default.createElement(
                    _Reveal2.default,
                    { onHide: function onHide() {
                            return null;
                        }, show: true },
                    _react2.default.createElement(_CloseButton2.default, { onClick: function onClick() {
                            return _this2.hideDialog();
                        } }),
                    _react2.default.createElement(_FlagCommunityPost2.default, {
                        onSubmit: function onSubmit(notes) {
                            _this2.hideDialog();
                            _this2.onSubmit(notes);
                        },
                        flagText: this.props.flagText,
                        isComment: this.props.isComment
                    })
                )
            );
        }
    }]);
    return FlagButton;
}(_react2.default.Component);

FlagButton.propTypes = {
    account: _propTypes2.default.string.isRequired,
    permlink: _propTypes2.default.string.isRequired,
    username: _propTypes2.default.string.isRequired,
    community: _propTypes2.default.string.isRequired, //TODO: Define shape
    flagText: _propTypes2.default.string.isRequired,
    isComment: _propTypes2.default.bool
};

FlagButton.defaultProps = {
    isComment: false
};

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var post = ownProps.post;

    var account = post.get('author');
    var permlink = post.get('permlink');
    var community = post.get('category');
    var flagText = state.global.getIn(['community', community, 'flag_text']);
    return {
        account: account,
        permlink: permlink,
        community: community,
        username: state.user.getIn(['current', 'username']),
        flagText: flagText
    };
}, function (dispatch) {
    return {
        stateSet: function stateSet(key, value) {
            dispatch(globalActions.set({ key: key, value: value }));
        },
        flagPost: function flagPost(username, community, account, notes, permlink, successCallback, errorCallback) {
            var action = 'flagPost';
            var payload = [action, {
                community: community,
                account: account,
                permlink: permlink,
                notes: notes
            }];

            return dispatch(transactionActions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'community',
                    required_posting_auths: [username],
                    json: (0, _stringify2.default)(payload)
                },
                successCallback: successCallback,
                errorCallback: errorCallback
            }));
        }
    };
})(FlagButton);