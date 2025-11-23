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

var _reactRedux = require('react-redux');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nothingToClaim = 'No rewards pending redemption.';

var getRewardsString = function getRewardsString(account) {
    var reward_steem = parseFloat(account.get('reward_steem_balance').split(' ')[0]) > 0 ? account.get('reward_steem_balance') : null;
    var reward_sbd = parseFloat(account.get('reward_sbd_balance').split(' ')[0]) > 0 ? account.get('reward_sbd_balance') : null;
    var reward_sp = parseFloat(account.get('reward_vesting_steem').split(' ')[0]) > 0 ? account.get('reward_vesting_steem').replace('STEEM', 'SP') : null;

    var rewards = [];
    if (reward_steem) rewards.push(reward_steem);
    if (reward_sbd) rewards.push(reward_sbd);
    if (reward_sp) rewards.push(reward_sp);

    var rewards_str = void 0;
    switch (rewards.length) {
        case 3:
            rewards_str = rewards[0] + ', ' + rewards[1] + ' and ' + rewards[2];
            break;
        case 2:
            rewards_str = rewards[0] + ' and ' + rewards[1];
            break;
        case 1:
            rewards_str = '' + rewards[0];
            break;
        default:
            rewards_str = nothingToClaim;
    }
    return rewards_str;
};

var ClaimBox = function (_React$Component) {
    (0, _inherits3.default)(ClaimBox, _React$Component);

    function ClaimBox(props) {
        (0, _classCallCheck3.default)(this, ClaimBox);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ClaimBox.__proto__ || (0, _getPrototypeOf2.default)(ClaimBox)).call(this, props));

        _this.claimRewardsSuccess = function () {
            _this.setState({
                claimInProgress: false,
                claimed: true
            });
        };

        _this.handleClaimRewards = function (account) {
            _this.setState({
                claimInProgress: true
            }); // disable the claim button
            _this.props.claimRewards(account, _this.claimRewardsSuccess);
        };

        _this.state = {
            claimed: false,
            empty: true,
            claimInProgress: false,
            rewards_str: props.account ? getRewardsString(props.account) : 'Loading...'
        };
        return _this;
    }

    (0, _createClass3.default)(ClaimBox, [{
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            if (this.props.account !== prevProps.account) {
                var rewards_str = this.props.account ? getRewardsString(this.props.account) : 'Loading...';
                this.setState({
                    rewards_str: rewards_str,
                    empty: rewards_str == nothingToClaim
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var account = this.props.account;
            var rewards_str = this.state.rewards_str;

            if (!account) return null;
            if (this.state.empty) return null;

            if (this.state.claimed) {
                return _react2.default.createElement(
                    'div',
                    { className: 'UserWallet__claimbox' },
                    _react2.default.createElement(
                        'strong',
                        null,
                        'Claim successful.'
                    )
                );
            }

            return _react2.default.createElement(
                'div',
                { className: 'UserWallet__claimbox' },
                _react2.default.createElement(
                    'strong',
                    null,
                    'Unclaimed rewards: ',
                    rewards_str
                ),
                _react2.default.createElement(
                    'button',
                    {
                        disabled: this.state.claimInProgress,
                        className: 'button',
                        onClick: function onClick(e) {
                            e.preventDefault();
                            _this2.handleClaimRewards(account);
                        }
                    },
                    'Redeem'
                )
            );
        }
    }]);
    return ClaimBox;
}(_react2.default.Component);

var mapStateToProps = function mapStateToProps(state, ownProps) {
    var accountName = ownProps.accountName;
    var currentUser = state.user.get('current');
    var account = state.global.getIn(['accounts', accountName]);
    var isOwnAccount = state.user.getIn(['current', 'username'], '') == accountName;
    return {
        account: account,
        currentUser: currentUser,
        isOwnAccount: isOwnAccount
    };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        claimRewards: function claimRewards(account, successCB) {
            var username = account.get('name');
            var successCallback = function successCallback() {
                // TODO: do something here...
                successCB();
            };
            var operation = {
                account: username,
                reward_steem: account.get('reward_steem_balance'),
                reward_sbd: account.get('reward_sbd_balance'),
                reward_vests: account.get('reward_vesting_balance')
            };

            dispatch(transactionActions.broadcastOperation({
                type: 'claim_reward_balance',
                operation: operation,
                successCallback: successCallback
            }));
        }
    };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ClaimBox);