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

var _CloseButton = require('app/components/elements/CloseButton');

var _CloseButton2 = _interopRequireDefault(_CloseButton);

var _Reveal = require('app/components/elements/Reveal');

var _Reveal2 = _interopRequireDefault(_Reveal);

var _immutable = require('immutable');

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _QrReader = require('app/components/elements/QrReader');

var _QrReader2 = _interopRequireDefault(_QrReader);

var _CheckLoginOwner = require('app/components/elements/CheckLoginOwner');

var _CheckLoginOwner2 = _interopRequireDefault(_CheckLoginOwner);

var _PromotePost = require('app/components/modules/PromotePost');

var _PromotePost2 = _interopRequireDefault(_PromotePost);

var _ExplorePost = require('app/components/modules/ExplorePost');

var _ExplorePost2 = _interopRequireDefault(_ExplorePost);

var _CommunitySubscriberList = require('./CommunitySubscriberList');

var _CommunitySubscriberList2 = _interopRequireDefault(_CommunitySubscriberList);

var _NotificationsList = require('../cards/NotificationsList');

var _NotificationsList2 = _interopRequireDefault(_NotificationsList);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Dialogs = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Dialogs, _React$Component);

    function Dialogs() {
        (0, _classCallCheck3.default)(this, Dialogs);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Dialogs.__proto__ || (0, _getPrototypeOf2.default)(Dialogs)).call(this));

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'Dialogs');
        _this.hide = function (name) {
            _this.props.hide(name);
        };
        return _this;
    }

    (0, _createClass3.default)(Dialogs, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this2 = this;

            var active_dialogs = nextProps.active_dialogs,
                hide = nextProps.hide;

            active_dialogs.forEach(function (v, k) {
                if (!_this2['hide_' + k]) _this2['hide_' + k] = function () {
                    return hide(k);
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var active_dialogs = this.props.active_dialogs;

            var idx = 0;
            var dialogs = active_dialogs.reduce(function (r, v, k) {
                var cmp = k === 'qr_reader' ? _react2.default.createElement(
                    'span',
                    { key: 'dialog-' + k },
                    _react2.default.createElement(
                        _Reveal2.default,
                        {
                            onHide: _this3['hide_' + k],
                            show: true,
                            revealStyle: { width: '355px' }
                        },
                        _react2.default.createElement(_CloseButton2.default, { onClick: _this3['hide_' + k] }),
                        _react2.default.createElement(_QrReader2.default, (0, _extends3.default)({
                            onClose: _this3['hide_' + k]
                        }, v.get('params').toJS()))
                    )
                ) : k === 'promotePost' ? _react2.default.createElement(
                    'span',
                    { key: 'dialog-' + k },
                    _react2.default.createElement(
                        _Reveal2.default,
                        { onHide: _this3['hide_' + k], show: true },
                        _react2.default.createElement(_CloseButton2.default, { onClick: _this3['hide_' + k] }),
                        _react2.default.createElement(_PromotePost2.default, (0, _extends3.default)({
                            onClose: _this3['hide_' + k]
                        }, v.get('params').toJS()))
                    )
                ) : k === 'explorePost' ? _react2.default.createElement(
                    'span',
                    { key: 'dialog-' + k },
                    _react2.default.createElement(
                        _Reveal2.default,
                        { onHide: _this3['hide_' + k], show: true },
                        _react2.default.createElement(_CloseButton2.default, { onClick: _this3['hide_' + k] }),
                        _react2.default.createElement(_ExplorePost2.default, (0, _extends3.default)({
                            onClick: _this3['hide_' + k]
                        }, v.get('params').toJS()))
                    )
                ) : k === 'communitySubscribers' ? _react2.default.createElement(
                    'span',
                    { key: 'dialog-' + k },
                    _react2.default.createElement(
                        _Reveal2.default,
                        { onHide: _this3['hide_' + k], show: true },
                        _react2.default.createElement(_CloseButton2.default, { onClick: _this3['hide_' + k] }),
                        _react2.default.createElement(_CommunitySubscriberList2.default, (0, _extends3.default)({
                            onClick: _this3['hide_' + k]
                        }, v.get('params').toJS()))
                    )
                ) : k === 'communityModerationLog' ? _react2.default.createElement(
                    'span',
                    { key: 'dialog-' + k },
                    _react2.default.createElement(
                        _Reveal2.default,
                        { onHide: _this3['hide_' + k], show: true },
                        _react2.default.createElement(_CloseButton2.default, { onClick: _this3['hide_' + k] }),
                        _react2.default.createElement(_NotificationsList2.default, {
                            username: v.getIn(['params', 'community', 'name']),
                            isLastPage: false
                        })
                    )
                ) : null;
                return cmp ? r.push(cmp) : r;
            }, (0, _immutable.List)());
            return _react2.default.createElement(
                'div',
                null,
                dialogs.toJS(),
                _react2.default.createElement(_CheckLoginOwner2.default, null)
            );
        }
    }]);
    return Dialogs;
}(_react2.default.Component), _class.propTypes = {
    active_dialogs: _propTypes2.default.object,
    hide: _propTypes2.default.func.isRequired
}, _temp);


var emptyMap = (0, _immutable.Map)();

exports.default = (0, _reactRedux.connect)(function (state) {
    return {
        active_dialogs: state.global.get('active_dialogs') || emptyMap
    };
}, function (dispatch) {
    return {
        hide: function hide(name) {
            dispatch(globalActions.hideDialog({ name: name }));
        }
    };
})(Dialogs);