'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Memo = undefined;

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

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _steemJs = require('@steemit/steem-js');

var _BadActorList = require('app/utils/BadActorList');

var _BadActorList2 = _interopRequireDefault(_BadActorList);

var _ParsersAndFormatters = require('app/utils/ParsersAndFormatters');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MINIMUM_REPUTATION = 15;

var Memo = exports.Memo = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Memo, _React$Component);

    function Memo() {
        (0, _classCallCheck3.default)(this, Memo);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Memo.__proto__ || (0, _getPrototypeOf2.default)(Memo)).call(this));

        _this.onRevealMemo = function (e) {
            e.preventDefault();
            _this.setState({ revealMemo: true });
        };

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'Memo');
        _this.state = {
            revealMemo: false
        };
        return _this;
    }

    (0, _createClass3.default)(Memo, [{
        key: 'decodeMemo',
        value: function decodeMemo(memo_private, text) {
            try {
                return _steemJs.memo.decode(memo_private, text);
            } catch (e) {
                console.error('memo decryption error', text, e);
                return 'Invalid memo';
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var decodeMemo = this.decodeMemo;
            var _props = this.props,
                memo_private = _props.memo_private,
                text = _props.text,
                myAccount = _props.myAccount,
                fromAccount = _props.fromAccount,
                fromNegativeRepUser = _props.fromNegativeRepUser;

            var isEncoded = /^#/.test(text);

            var isFromBadActor = _BadActorList2.default.indexOf(fromAccount) > -1;

            if (!text || text.length < 1) return _react2.default.createElement('span', null);

            var classes = (0, _classnames2.default)({
                Memo: true,
                'Memo--badActor': isFromBadActor,
                'Memo--fromNegativeRepUser': fromNegativeRepUser,
                'Memo--private': memo_private
            });

            var renderText = '';

            if (!isEncoded) {
                renderText = text;
            } else if (memo_private) {
                renderText = myAccount ? decodeMemo(memo_private, text) : (0, _counterpart2.default)('g.login_to_see_memo');
            }

            return _react2.default.createElement(
                'span',
                { className: classes },
                renderText
            );
        }
    }]);
    return Memo;
}(_react2.default.Component), _class.propTypes = {
    text: _propTypes2.default.string,
    username: _propTypes2.default.string,
    fromAccount: _propTypes2.default.string,
    // redux props
    myAccount: _propTypes2.default.bool,
    memo_private: _propTypes2.default.object,
    fromNegativeRepUser: _propTypes2.default.bool.isRequired
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var currentUser = state.user.get('current');
    var myAccount = currentUser && ownProps.username === currentUser.get('username');
    var memo_private = myAccount && currentUser ? currentUser.getIn(['private_keys', 'memo_private']) : null;
    var fromNegativeRepUser = (0, _ParsersAndFormatters.repLog10)(state.global.getIn(['accounts', ownProps.fromAccount, 'reputation'])) < MINIMUM_REPUTATION;
    return (0, _extends3.default)({}, ownProps, { memo_private: memo_private, myAccount: myAccount, fromNegativeRepUser: fromNegativeRepUser });
})(Memo);