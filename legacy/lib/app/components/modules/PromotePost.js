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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _client_config = require('app/client_config');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PromotePost = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(PromotePost, _Component);

    function PromotePost(props) {
        (0, _classCallCheck3.default)(this, PromotePost);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PromotePost.__proto__ || (0, _getPrototypeOf2.default)(PromotePost)).call(this, props));

        _this.state = {
            amount: '1.0',
            asset: '',
            loading: false,
            amountError: '',
            trxError: ''
        };
        _this.onSubmit = _this.onSubmit.bind(_this);
        _this.errorCallback = _this.errorCallback.bind(_this);
        _this.amountChange = _this.amountChange.bind(_this);
        // this.assetChange = this.assetChange.bind(this);
        return _this;
    }

    (0, _createClass3.default)(PromotePost, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            setTimeout(function () {
                _reactDom2.default.findDOMNode(_this2.refs.amount).focus();
            }, 300);
        }
    }, {
        key: 'errorCallback',
        value: function errorCallback(estr) {
            this.setState({ trxError: estr, loading: false });
        }
    }, {
        key: 'onSubmit',
        value: function onSubmit(e) {
            e.preventDefault();
            var _props = this.props,
                author = _props.author,
                permlink = _props.permlink,
                onClose = _props.onClose;
            var amount = this.state.amount;

            this.setState({ loading: true });
            console.log('-- PromotePost.onSubmit -->');
            this.props.dispatchSubmit({
                amount: amount,
                asset: _client_config.DEBT_TICKER,
                author: author,
                permlink: permlink,
                onClose: onClose,
                currentUser: this.props.currentUser,
                errorCallback: this.errorCallback
            });
        }
    }, {
        key: 'amountChange',
        value: function amountChange(e) {
            var amount = e.target.value;
            // console.log('-- PromotePost.amountChange -->', amount);
            this.setState({ amount: amount });
        }

        // assetChange(e) {
        //     const asset = e.target.value;
        //     console.log('-- PromotePost.assetChange -->', e.target.value);
        //     this.setState({asset});
        // }

    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _state = this.state,
                amount = _state.amount,
                loading = _state.loading,
                amountError = _state.amountError,
                trxError = _state.trxError;
            var currentAccount = this.props.currentAccount;

            var balanceValue = currentAccount.get('sbd_balance');
            var balance = balanceValue ? balanceValue.split(' ')[0] : 0.0;
            var submitDisabled = !amount;

            return _react2.default.createElement(
                'div',
                { className: 'PromotePost row' },
                _react2.default.createElement(
                    'div',
                    { className: 'column small-12' },
                    _react2.default.createElement(
                        'form',
                        {
                            onSubmit: this.onSubmit,
                            onChange: function onChange() {
                                return _this3.setState({ trxError: '' });
                            }
                        },
                        _react2.default.createElement(
                            'h4',
                            null,
                            (0, _counterpart2.default)('promote_post_jsx.promote_post')
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            (0, _counterpart2.default)('promote_post_jsx.spend_your_DEBT_TOKEN_to_advertise_this_post', { DEBT_TOKEN: _client_config.DEBT_TOKEN }),
                            '.'
                        ),
                        _react2.default.createElement('hr', null),
                        _react2.default.createElement(
                            'div',
                            { className: 'row' },
                            _react2.default.createElement(
                                'div',
                                { className: 'column small-7 medium-5 large-4' },
                                _react2.default.createElement(
                                    'label',
                                    null,
                                    (0, _counterpart2.default)('g.amount')
                                ),
                                _react2.default.createElement(
                                    'div',
                                    { className: 'input-group' },
                                    _react2.default.createElement('input', {
                                        className: 'input-group-field',
                                        type: 'text',
                                        placeholder: (0, _counterpart2.default)('g.amount'),
                                        value: amount,
                                        ref: 'amount',
                                        autoComplete: 'off',
                                        disabled: loading,
                                        onChange: this.amountChange
                                    }),
                                    _react2.default.createElement(
                                        'span',
                                        { className: 'input-group-label' },
                                        _client_config.DEBT_TOKEN_SHORT + ' ',
                                        ' (',
                                        _client_config.CURRENCY_SIGN,
                                        ')'
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { className: 'error' },
                                        amountError
                                    )
                                )
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            null,
                            (0, _counterpart2.default)('g.balance', {
                                balanceValue: balance + ' ' + _client_config.DEBT_TOKEN_SHORT + ' (' + _client_config.CURRENCY_SIGN + ')'
                            })
                        ),
                        _react2.default.createElement('br', null),
                        loading && _react2.default.createElement(
                            'span',
                            null,
                            _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle' }),
                            _react2.default.createElement('br', null)
                        ),
                        !loading && _react2.default.createElement(
                            'span',
                            null,
                            trxError && _react2.default.createElement(
                                'div',
                                { className: 'error' },
                                trxError
                            ),
                            _react2.default.createElement(
                                'button',
                                {
                                    type: 'submit',
                                    className: 'button',
                                    disabled: submitDisabled
                                },
                                (0, _counterpart2.default)('g.promote')
                            )
                        )
                    )
                )
            );
        }
    }]);
    return PromotePost;
}(_react.Component), _class.propTypes = {
    author: _propTypes2.default.string.isRequired,
    permlink: _propTypes2.default.string.isRequired
}, _temp);

// const AssetBalance = ({onClick, balanceValue}) =>
//     <a onClick={onClick} style={{borderBottom: '#A09F9F 1px dotted', cursor: 'pointer'}}>Balance: {balanceValue}</a>

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var currentUser = state.user.getIn(['current']);
    var currentAccount = state.global.getIn(['accounts', currentUser.get('username')]);
    return (0, _extends3.default)({}, ownProps, { currentAccount: currentAccount, currentUser: currentUser });
},

// mapDispatchToProps
function (dispatch) {
    return {
        dispatchSubmit: function dispatchSubmit(_ref) {
            var amount = _ref.amount,
                asset = _ref.asset,
                author = _ref.author,
                permlink = _ref.permlink,
                currentUser = _ref.currentUser,
                onClose = _ref.onClose,
                errorCallback = _ref.errorCallback;

            var username = currentUser.get('username');
            alert('Promoted posts are currently disabled');
            //window.location.replace($STM_config.wallet_url + `/transfer?to=null&memo=@${author}/${permlink}&amount=`+parseFloat(amount, 10).toFixed(3) + ' ' + asset)

            var operation = {
                from: username,
                to: 'null',
                amount: parseFloat(amount, 10).toFixed(3) + ' ' + asset,
                memo: '@' + author + '/' + permlink,
                __config: {
                    successMessage: (0, _counterpart2.default)('promote_post_jsx.you_successfully_promoted_this_post') + '.'
                }
            };
        }
    };
})(PromotePost);