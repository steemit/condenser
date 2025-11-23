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

var _immutable = require('immutable');

var _Community = require('app/utils/Community');

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _Reveal = require('app/components/elements/Reveal');

var _Reveal2 = _interopRequireDefault(_Reveal);

var _CloseButton = require('app/components/elements/CloseButton');

var _CloseButton2 = _interopRequireDefault(_CloseButton);

var _UserTitleEditor = require('app/components/modules/UserTitleEditor');

var _UserTitleEditor2 = _interopRequireDefault(_UserTitleEditor);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserTitle = function (_React$Component) {
    (0, _inherits3.default)(UserTitle, _React$Component);

    function UserTitle(props) {
        (0, _classCallCheck3.default)(this, UserTitle);

        var _this = (0, _possibleConstructorReturn3.default)(this, (UserTitle.__proto__ || (0, _getPrototypeOf2.default)(UserTitle)).call(this, props));

        _this.onToggleDialog = function () {
            _this.setState({ showDialog: !_this.state.showDialog });
        };

        _this.onSave = function (newTitle) {
            var community = _this.props.community.get('name');
            //-- Simulate a "receiveState" action to feed new title into post state
            var newstate = { content: {}, simulation: true };
            var content_key = _this.props.author + '/' + _this.props.permlink;
            newstate['content'][content_key] = { author_title: newTitle };
            _this.props.pushState(newstate);

            _this.props.saveTitle(_this.props.username, _this.props.author, community, newTitle);
            _this.props.onEditSubmit();
            _this.setState({
                newTitle: newTitle
            });
        };

        _this.state = {
            showDialog: false,
            newTitle: ''
        };
        return _this;
    }

    (0, _createClass3.default)(UserTitle, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                role = _props.role,
                viewer_role = _props.viewer_role,
                hideEdit = _props.hideEdit;
            var newTitle = this.state.newTitle;

            var title = newTitle.length > 0 ? newTitle : this.props.title || '';
            var isMod = _Community.Role.atLeast(viewer_role, 'mod');
            var showRole = role && role != 'guest';
            var showEdit = isMod && !hideEdit;
            var showTitle = title != '';

            if (!showRole && !showEdit && !showTitle) return null;

            var editor = void 0;
            if (showEdit) {
                var _props2 = this.props,
                    author = _props2.author,
                    community = _props2.community,
                    username = _props2.username;
                var showDialog = this.state.showDialog;

                editor = _react2.default.createElement(
                    'span',
                    { className: 'affiliation-edit' },
                    _react2.default.createElement(
                        'a',
                        { onClick: this.onToggleDialog, title: 'Edit Title' },
                        _react2.default.createElement(_Icon2.default, { name: 'pencil2', size: '0_8x' })
                    ),
                    showDialog && _react2.default.createElement(
                        _Reveal2.default,
                        { onHide: function onHide() {
                                return null;
                            }, show: true },
                        _react2.default.createElement(_CloseButton2.default, {
                            onClick: function onClick() {
                                return _this2.onToggleDialog();
                            }
                        }),
                        _react2.default.createElement(_UserTitleEditor2.default, {
                            title: title,
                            username: author,
                            community: community.get('title'),
                            onSubmit: function onSubmit(newTitle) {
                                _this2.onToggleDialog();
                                _this2.onSave(newTitle);
                            }
                        })
                    )
                );
            }

            return _react2.default.createElement(
                'span',
                null,
                showRole && _react2.default.createElement(
                    'span',
                    { className: 'user_role' },
                    role
                ),
                showTitle && _react2.default.createElement(
                    'span',
                    { className: 'affiliation' },
                    title,
                    editor
                ),
                !showTitle && showEdit && editor
            );
        }
    }]);
    return UserTitle;
}(_react2.default.Component);

UserTitle.propTypes = {
    username: _propTypes2.default.string, // edit only
    community: _propTypes2.default.object.isRequired, // edit only
    author: _propTypes2.default.string.isRequired, // edit only
    permlink: _propTypes2.default.string.isRequired, // edit only
    title: _propTypes2.default.string,
    onEditSubmit: _propTypes2.default.func
};

UserTitle.defaultProps = {
    onEditSubmit: function onEditSubmit() {}
};

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var community = state.global.getIn(['community', ownProps.community], (0, _immutable.Map)());
    var viewer_role = community.getIn(['context', 'role'], 'guest');
    var author = ownProps.author,
        permlink = ownProps.permlink,
        title = ownProps.title;

    return {
        author: author,
        permlink: permlink,
        title: title,
        username: state.user.getIn(['current', 'username']),
        community: community,
        viewer_role: viewer_role
    };
}, function (dispatch) {
    return {
        pushState: function pushState(state) {
            return dispatch(globalActions.receiveState(state));
        },
        saveTitle: function saveTitle(username, account, community, title, successCallback, errorCallback) {
            var action = 'setUserTitle';

            var payload = [action, {
                community: community,
                account: account,
                title: title
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
})(UserTitle);