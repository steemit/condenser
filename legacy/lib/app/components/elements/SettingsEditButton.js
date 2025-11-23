'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _Reveal = require('app/components/elements/Reveal');

var _Reveal2 = _interopRequireDefault(_Reveal);

var _CloseButton = require('app/components/elements/CloseButton');

var _CloseButton2 = _interopRequireDefault(_CloseButton);

var _CommunitySettings = require('app/components/modules/CommunitySettings');

var _CommunitySettings2 = _interopRequireDefault(_CommunitySettings);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SettingsEditButton = function (_React$Component) {
    (0, _inherits3.default)(SettingsEditButton, _React$Component);

    function SettingsEditButton(props) {
        (0, _classCallCheck3.default)(this, SettingsEditButton);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SettingsEditButton.__proto__ || (0, _getPrototypeOf2.default)(SettingsEditButton)).call(this, props));

        _this.onToggleDialog = function (e) {
            if (e) e.preventDefault();
            _this.setState({ showDialog: !_this.state.showDialog });
        };

        _this.onSave = function (newSettings) {
            var community = _this.props.community.get('name');
            _this.setState({ loading: true });
            _this.props.saveSettings(_this.props.username, community, newSettings, function () {
                _this.setState({ loading: false, settings: newSettings });
            }, function () {
                _this.setState({ loading: false });
            });

            //-- Simulate a "receiveState" action to feed new title into post state
            var newstate = { community: {}, simulation: true };
            newstate['community'][community] = newSettings;
            _this.props.pushState(newstate);
        };

        _this.state = {
            showDialog: false,
            loading: false,
            settings: _this.props.settings
        };
        return _this;
    }

    (0, _createClass3.default)(SettingsEditButton, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state,
                showDialog = _state.showDialog,
                loading = _state.loading,
                settings = _state.settings;


            if (loading) {
                return _react2.default.createElement(
                    'span',
                    null,
                    'Saving...'
                );
            }

            return _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                    'a',
                    { href: '#', onClick: this.onToggleDialog },
                    this.props.children
                ),
                showDialog && _react2.default.createElement(
                    _Reveal2.default,
                    { onHide: function onHide() {
                            return null;
                        }, show: true },
                    _react2.default.createElement(_CloseButton2.default, { onClick: function onClick() {
                            return _this2.onToggleDialog();
                        } }),
                    _react2.default.createElement(_CommunitySettings2.default, (0, _extends3.default)({}, settings, {
                        onSubmit: function onSubmit(newSettings) {
                            _this2.onToggleDialog();
                            _this2.onSave(newSettings);
                        }
                    }))
                )
            );
        }
    }]);
    return SettingsEditButton;
}(_react2.default.Component);

SettingsEditButton.propTypes = {
    username: _propTypes2.default.string,
    community: _propTypes2.default.object.isRequired, //TODO: Define this shape
    settings: _propTypes2.default.object.isRequired //TODO: Define this shape
};

SettingsEditButton.defaultProps = {
    username: undefined
};

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var community = state.global.getIn(['community', ownProps.community], {});
    var settings = {
        title: community.get('title'),
        about: community.get('about'),
        is_nsfw: community.get('is_nsfw'),
        lang: community.get('lang'),
        description: community.get('description'),
        flag_text: community.get('flag_text', '')
    };

    return (0, _extends3.default)({}, ownProps, {
        username: state.user.getIn(['current', 'username']),
        community: community,
        settings: settings
    });
}, function (dispatch) {
    return {
        saveSettings: function saveSettings(account, community, settings, successCallback, errorCallback) {
            var action = 'updateProps';

            var payload = [action, {
                community: community,
                props: settings
            }];

            return dispatch(transactionActions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'community',
                    required_posting_auths: [account],
                    json: (0, _stringify2.default)(payload)
                },
                successCallback: successCallback,
                errorCallback: errorCallback
            }));
        },
        pushState: function pushState(state) {
            dispatch(globalActions.receiveState(state));
        }
    };
})(SettingsEditButton);