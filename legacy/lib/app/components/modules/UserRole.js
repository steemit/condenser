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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserRole = function (_Component) {
    (0, _inherits3.default)(UserRole, _Component);

    function UserRole(props) {
        (0, _classCallCheck3.default)(this, UserRole);

        var _this = (0, _possibleConstructorReturn3.default)(this, (UserRole.__proto__ || (0, _getPrototypeOf2.default)(UserRole)).call(this, props));

        _this.onInput = function (event) {
            event && event.preventDefault();
            _this.setState({
                newUsername: event.target.value
            });
        };

        _this.onSelect = function (event) {
            event && event.preventDefault();
            _this.setState({
                newRole: event.target.value
            });
        };

        _this.onSubmit = function () {
            if (_this.props.addUser) {
                if (_this.state.newUsername === '') {
                    _this.setState({
                        message: 'Please enter a valid username.'
                    });
                    return;
                }
                if (_this.state.newUsername[0] === '@') {
                    _this.setState({
                        message: 'Please enter a username without "@".'
                    });
                    return;
                }
                _this.props.onSubmit(_this.state.newUsername.trim(), _this.state.newRole.trim());
            } else {
                if (_this.props.role === _this.state.newRole) {
                    _this.setState({
                        message: 'The user already has that role.'
                    });
                    return;
                }
                _this.props.onSubmit(_this.state.newRole.trim());
            }
        };

        _this.state = {
            newUsername: '',
            newRole: _this.props.role,
            message: ''
        };
        return _this;
    }

    (0, _createClass3.default)(UserRole, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state,
                newRole = _state.newRole,
                message = _state.message,
                newUsername = _state.newUsername;
            var _props = this.props,
                username = _props.username,
                community = _props.community,
                role = _props.role,
                availableRoles = _props.availableRoles,
                addUser = _props.addUser;


            var roleSelector = availableRoles.map(function (role) {
                return _react2.default.createElement(
                    'option',
                    { value: role },
                    role
                );
            });
            var editUserModalHeader = _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'h4',
                    null,
                    (0, _counterpart2.default)('g.community_user_role_edit_header')
                ),
                _react2.default.createElement('hr', null)
            );
            var addUserModalHeader = _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'h4',
                    null,
                    (0, _counterpart2.default)('g.community_user_role_add_header')
                ),
                _react2.default.createElement(
                    'p',
                    null,
                    (0, _counterpart2.default)('g.community_user_role_add_description', {
                        community: community
                    })
                )
            );

            return _react2.default.createElement(
                'span',
                null,
                addUser ? addUserModalHeader : editUserModalHeader,
                _react2.default.createElement(
                    'div',
                    { className: 'input-group' },
                    _react2.default.createElement(
                        'span',
                        { className: 'input-group-label' },
                        'Username'
                    ),
                    _react2.default.createElement('input', {
                        className: 'input-group-field',
                        type: 'text',
                        maxLength: 32,
                        name: 'username',
                        value: addUser ? newUsername : username,
                        onChange: function onChange(e) {
                            return _this2.onInput(e);
                        },
                        disabled: !addUser
                    })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'input-group' },
                    _react2.default.createElement(
                        'span',
                        { className: 'input-group-label' },
                        'Role'
                    ),
                    _react2.default.createElement(
                        'select',
                        { value: newRole, onChange: this.onSelect, required: true },
                        roleSelector
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'text-right' },
                    _react2.default.createElement(
                        'button',
                        {
                            className: 'button',
                            type: 'submit',
                            onClick: function onClick() {
                                return _this2.onSubmit();
                            }
                        },
                        'Save'
                    )
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    message.length > 0 && message
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'h5',
                        null,
                        'Role Permissions'
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Owner'
                        ),
                        ' - assign admins',
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Admin'
                        ),
                        ' - edit settings, assign mods',
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Moderator'
                        ),
                        ' - mute, pin, set user titles',
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Member'
                        ),
                        ' - listed on leadership team',
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Guest'
                        ),
                        ' - default; can post and comment',
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Muted'
                        ),
                        ' - new posts automatically muted'
                    )
                )
            );
        }
    }]);
    return UserRole;
}(_react.Component);

UserRole.propTypes = {
    onSubmit: _propTypes2.default.func.isRequired,
    username: _propTypes2.default.string.isRequired,
    community: _propTypes2.default.string.isRequired,
    role: _propTypes2.default.string.isRequired,
    availableRoles: _propTypes2.default.arrayOf(_propTypes2.default.string).isRequired,
    addUser: _propTypes2.default.bool.isRequired
};

exports.default = UserRole;