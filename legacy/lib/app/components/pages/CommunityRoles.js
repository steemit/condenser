'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

var _CommunityReducer = require('app/redux/CommunityReducer');

var communityActions = _interopRequireWildcard(_CommunityReducer);

var _immutable = require('immutable');

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _Reveal = require('app/components/elements/Reveal');

var _Reveal2 = _interopRequireDefault(_Reveal);

var _CloseButton = require('app/components/elements/CloseButton');

var _CloseButton2 = _interopRequireDefault(_CloseButton);

var _UserRole = require('app/components/modules/UserRole');

var _UserRole2 = _interopRequireDefault(_UserRole);

var _reactRouter = require('react-router');

var _PostsIndexLayout = require('app/components/pages/PostsIndexLayout');

var _PostsIndexLayout2 = _interopRequireDefault(_PostsIndexLayout);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CommunityRoles = function (_React$Component) {
    (0, _inherits3.default)(CommunityRoles, _React$Component);

    function CommunityRoles(props) {
        (0, _classCallCheck3.default)(this, CommunityRoles);

        var _this = (0, _possibleConstructorReturn3.default)(this, (CommunityRoles.__proto__ || (0, _getPrototypeOf2.default)(CommunityRoles)).call(this, props));

        _this.state = {
            account: '',
            role: 'member',
            title: '',
            updateRoleModal: false,
            addUserToCommunityModal: false,
            updatedRole: ''
        };
        _this.onAccountChange = _this.onAccountChange.bind(_this);
        _this.onRoleChange = _this.onRoleChange.bind(_this);
        _this.onSubmit = _this.onSubmit.bind(_this);
        _this.onEditUserRoleSelect = _this.onEditUserRoleSelect.bind(_this);
        _this.toggleUpdateRoleModal = _this.toggleUpdateRoleModal.bind(_this);
        _this.toggleAddUserToCommunityModal = _this.toggleAddUserToCommunityModal.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(CommunityRoles, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.props.getCommunityRoles(this.props.community);
        }
    }, {
        key: 'toggleUpdateRoleModal',
        value: function toggleUpdateRoleModal(showModal) {
            this.setState({
                updateRoleModal: showModal
            });
        }
    }, {
        key: 'toggleAddUserToCommunityModal',
        value: function toggleAddUserToCommunityModal(showModal) {
            this.setState({
                addUserToCommunityModal: showModal
            });
        }
    }, {
        key: 'onEditUserRoleSelect',
        value: function onEditUserRoleSelect(name, role, title) {
            this.setState({
                account: name,
                role: role,
                title: title
            });
        }
    }, {
        key: 'onAccountChange',
        value: function onAccountChange(event) {
            this.setState({ account: event.target.value });
        }
    }, {
        key: 'onRoleChange',
        value: function onRoleChange(event) {
            this.setState({ role: event.target.value });
        }
    }, {
        key: 'onSubmit',
        value: function onSubmit(event) {
            event.preventDefault();
            var params = {
                community: this.props.community,
                account: this.state.account,
                role: this.state.role
            };
            this.props.updateUser(params);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                community = _props.community,
                loading = _props.loading,
                updating = _props.updating,
                roles = _props.roles,
                communityMetadata = _props.communityMetadata;


            var canEdit = {
                owner: ['admin', 'mod', 'member', 'guest', 'muted'],
                admin: ['mod', 'member', 'guest', 'muted'],
                mod: ['member', 'guest', 'muted'],
                member: ['guest', 'muted'],
                guest: ['muted']
            };

            var availableRoles = [];

            if (communityMetadata && communityMetadata.context && (0, _keys2.default)(communityMetadata.context).length > 0) {
                availableRoles = canEdit[communityMetadata.context.role];
            }

            var tableRows = roles.toJS().map(function (tuple, index) {
                var name = tuple[0];
                var title = tuple[2];
                var role = tuple[1];
                if (availableRoles && availableRoles.includes(tuple[1])) {
                    role = _react2.default.createElement(
                        'a',
                        {
                            className: 'community-user--role',
                            'aria-labelledby': 'Community User Role',
                            onClick: function onClick(e) {
                                e.preventDefault();
                                _this2.onEditUserRoleSelect(name, tuple[1], title);
                                _this2.toggleUpdateRoleModal(true);
                            }
                        },
                        tuple[1]
                    );
                }
                return _react2.default.createElement(
                    'tr',
                    { key: name },
                    _react2.default.createElement(
                        'td',
                        null,
                        _react2.default.createElement(
                            _reactRouter.Link,
                            { to: '/@' + name },
                            '@',
                            name
                        )
                    ),
                    _react2.default.createElement(
                        'td',
                        null,
                        role
                    ),
                    _react2.default.createElement(
                        'td',
                        null,
                        title
                    )
                );
            });

            var table = _react2.default.createElement(
                'table',
                null,
                _react2.default.createElement(
                    'thead',
                    null,
                    _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'th',
                            null,
                            'Account'
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            'Role'
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            'Title'
                        )
                    )
                ),
                _react2.default.createElement(
                    'tbody',
                    null,
                    tableRows
                )
            );

            var editUserModal = _react2.default.createElement(
                _Reveal2.default,
                { onHide: function onHide() {
                        return null;
                    }, show: true },
                _react2.default.createElement(_CloseButton2.default, {
                    onClick: function onClick() {
                        return _this2.toggleUpdateRoleModal(false);
                    }
                }),
                _react2.default.createElement(_UserRole2.default, {
                    title: this.state.title,
                    username: this.state.account,
                    community: this.props.community,
                    role: this.state.role,
                    onSubmit: function onSubmit(newRole) {
                        var params = {
                            community: _this2.props.community,
                            account: _this2.state.account,
                            role: newRole
                        };
                        _this2.props.updateUser(params);
                        _this2.toggleUpdateRoleModal(false);
                    },
                    availableRoles: availableRoles,
                    addUser: false
                })
            );

            var addUserModal = _react2.default.createElement(
                _Reveal2.default,
                { onHide: function onHide() {
                        return null;
                    }, show: true },
                _react2.default.createElement(_CloseButton2.default, {
                    onClick: function onClick() {
                        return _this2.toggleAddUserToCommunityModal(false);
                    }
                }),
                _react2.default.createElement(_UserRole2.default, {
                    title: this.state.title,
                    username: this.state.account,
                    community: this.props.community,
                    role: this.state.role,
                    onSubmit: function onSubmit(newUsername, newUserRole) {
                        var params = {
                            community: _this2.props.community,
                            account: newUsername,
                            role: newUserRole
                        };
                        _this2.props.updateUser(params);
                        _this2.toggleAddUserToCommunityModal(false);
                    },
                    availableRoles: availableRoles,
                    addUser: true
                })
            );

            var commName = communityMetadata && communityMetadata.title || null;

            var body = void 0;
            if (loading) {
                body = _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle' })
                );
            } else {
                body = _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'h1',
                        { className: 'articles__h1' },
                        _react2.default.createElement(
                            _reactRouter.Link,
                            { to: '/trending/' + community },
                            commName || community
                        )
                    ),
                    _react2.default.createElement('br', null),
                    _react2.default.createElement(
                        'div',
                        { className: 'c-sidebar__module' },
                        _react2.default.createElement(
                            'h4',
                            null,
                            'User Roles'
                        ),
                        updating && _react2.default.createElement(
                            'div',
                            null,
                            'Updating User...'
                        ),
                        this.state.updateRoleModal && editUserModal,
                        this.state.addUserToCommunityModal && addUserModal,
                        _react2.default.createElement(
                            'div',
                            null,
                            table,
                            _react2.default.createElement(
                                'button',
                                {
                                    onClick: function onClick() {
                                        _this2.toggleAddUserToCommunityModal(true);
                                    },
                                    className: 'button slim hollow secondary'
                                },
                                'Add User'
                            )
                        )
                    )
                );
            }

            return _react2.default.createElement(
                _PostsIndexLayout2.default,
                {
                    category: community,
                    enableAds: false,
                    blogmode: false
                },
                _react2.default.createElement(
                    'div',
                    { className: 'CommunityRoles' },
                    _react2.default.createElement(
                        'div',
                        { className: 'row' },
                        _react2.default.createElement(
                            'div',
                            { className: 'column large-9 medium-12 small-12' },
                            body
                        )
                    )
                )
            );
        }
    }]);
    return CommunityRoles;
}(_react2.default.Component);

var CommunityRolesWrapped = (0, _reactRedux.connect)(function (state, ownProps) {
    var community = ownProps.params.community;

    var tree = state.community.get(community, (0, _immutable.Map)());
    var roles = tree.get('roles', (0, _immutable.List)());
    var loading = roles.size == 0;
    var updating = tree.get('updatePending', false);
    var communityMetadata = state.global.getIn(['community', community]);
    return {
        community: community,
        roles: roles,
        loading: loading,
        updating: updating,
        communityMetadata: communityMetadata && communityMetadata.toJS()
    };
}, function (dispatch) {
    return {
        getCommunityRoles: function getCommunityRoles(community) {
            dispatch(communityActions.getCommunityRoles(community));
        },
        updateUser: function updateUser(params) {
            dispatch(communityActions.updateUserRole(params));
        }
    };
})(CommunityRoles);

module.exports = {
    path: 'roles(/:community)',
    component: CommunityRolesWrapped
};