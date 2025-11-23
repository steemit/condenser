'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

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

var _reactRedux = require('react-redux');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

var _object2json = require('shared/clash/object2json');

var _object2json2 = _interopRequireDefault(_object2json);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _ReactForm = require('app/utils/ReactForm');

var _ReactForm2 = _interopRequireDefault(_ReactForm);

var _reactDropzone = require('react-dropzone');

var _reactDropzone2 = _interopRequireDefault(_reactDropzone);

var _MuteList = require('app/components/elements/MuteList');

var _MuteList2 = _interopRequireDefault(_MuteList);

var _UserUtil = require('app/utils/UserUtil');

var _ServerApiClient = require('app/utils/ServerApiClient');

var _steemJs = require('@steemit/steem-js');

var steem = _interopRequireWildcard(_steemJs);

var _RPCNode = require('app/utils/RPCNode');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Settings = function (_React$Component) {
    (0, _inherits3.default)(Settings, _React$Component);

    function Settings(props) {
        (0, _classCallCheck3.default)(this, Settings);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Settings.__proto__ || (0, _getPrototypeOf2.default)(Settings)).call(this, props));

        _this.onDrop = function (acceptedFiles, rejectedFiles) {
            if (!acceptedFiles.length) {
                if (rejectedFiles.length) {
                    _this.setState({
                        progress: { error: 'Please insert only image files.' }
                    });
                    console.log('onDrop Rejected files: ', rejectedFiles);
                }
                return;
            }
            var file = acceptedFiles[0];
            _this.upload(file, file.name);
        };

        _this.onOpenClick = function (imageName) {
            _this.setState({
                imageInProgress: imageName
            });
            _this.dropzone.open();
        };

        _this.upload = function (file) {
            var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
            var uploadImage = _this.props.uploadImage;

            _this.setState({
                progress: { message: (0, _counterpart2.default)('settings_jsx.uploading_image') + '...' }
            });
            uploadImage(file, function (progress) {
                if (progress.url) {
                    _this.setState({ progress: {} });
                    var url = progress.url;

                    var image_md = '' + url;
                    var field = void 0;
                    if (_this.state.imageInProgress === 'profile_image') {
                        field = _this.state.profile_image;
                    } else if (_this.state.imageInProgress === 'cover_image') {
                        field = _this.state.cover_image;
                    } else {
                        return;
                    }
                    field.props.onChange(image_md);
                } else {
                    _this.setState({ progress: progress });
                }
                setTimeout(function () {
                    _this.setState({ progress: {} });
                }, 4000); // clear message
            });
        };

        _this.handleSubmit = function (_ref) {
            var updateInitialValues = _ref.updateInitialValues;
            var metaData = _this.props.metaData;

            if (!metaData) metaData = {};
            if (!metaData.profile) metaData.profile = {};
            delete metaData.user_image; // old field... cleanup

            var _this$state = _this.state,
                profile_image = _this$state.profile_image,
                cover_image = _this$state.cover_image,
                name = _this$state.name,
                about = _this$state.about,
                location = _this$state.location,
                website = _this$state.website;

            // Update relevant fields

            metaData.profile.profile_image = profile_image.value;
            metaData.profile.cover_image = cover_image.value;
            metaData.profile.name = name.value;
            metaData.profile.about = about.value;
            metaData.profile.location = location.value;
            metaData.profile.website = website.value;
            metaData.profile.version = 2; // signal upgrade to posting_json_metadata

            // Remove empty keys
            if (!metaData.profile.profile_image) delete metaData.profile.profile_image;
            if (!metaData.profile.cover_image) delete metaData.profile.cover_image;
            if (!metaData.profile.name) delete metaData.profile.name;
            if (!metaData.profile.about) delete metaData.profile.about;
            if (!metaData.profile.location) delete metaData.profile.location;
            if (!metaData.profile.website) delete metaData.profile.website;

            var _this$props = _this.props,
                account = _this$props.account,
                updateAccount = _this$props.updateAccount;

            _this.setState({ loading: true });
            updateAccount({
                account: account.get('name'),
                json_metadata: '',
                posting_json_metadata: (0, _stringify2.default)(metaData),
                errorCallback: function errorCallback(e) {
                    if (e === 'Canceled') {
                        _this.setState({
                            loading: false,
                            errorMessage: ''
                        });
                    } else {
                        console.log('updateAccount ERROR', e);
                        _this.setState({
                            loading: false,
                            changed: false,
                            errorMessage: (0, _counterpart2.default)('g.server_returned_error')
                        });
                    }
                },
                successCallback: function successCallback() {
                    (0, _ServerApiClient.userActionRecord)('update_account', {
                        username: account.get('name')
                    });
                    _this.setState({
                        loading: false,
                        changed: false,
                        errorMessage: '',
                        successMessage: (0, _counterpart2.default)('settings_jsx.saved')
                    });
                    // remove successMessage after a while
                    setTimeout(function () {
                        return _this.setState({ successMessage: '' });
                    }, 4000);
                    updateInitialValues();
                }
            });
        };

        _this.handleDefaultBlogPayoutChange = function (event) {
            _this.props.setUserPreferences((0, _extends4.default)({}, _this.props.user_preferences, {
                defaultBlogPayout: event.target.value
            }));
        };

        _this.handleDefaultCommentPayoutChange = function (event) {
            _this.props.setUserPreferences((0, _extends4.default)({}, _this.props.user_preferences, {
                defaultCommentPayout: event.target.value
            }));
        };

        _this.handleSelectRPCNode = function (event) {
            var selectedUrl = event.target.value;

            if (_this.validateUrlFormat(selectedUrl) === false) {
                _this.setState({
                    rpcError: (0, _counterpart2.default)('settings_jsx.invalid_url')
                });
                return;
            } else {
                _this.setState({
                    rpcNode: selectedUrl,
                    rpcError: ''
                });
            }

            (0, _RPCNode.changeRPCNodeToDefault)(selectedUrl);
        };

        _this.handleLanguageChange = function (event) {
            var locale = event.target.value;
            var userPreferences = (0, _extends4.default)({}, _this.props.user_preferences, { locale: locale });
            _this.props.setUserPreferences(userPreferences);
        };

        _this.state = {
            errorMessage: '',
            successMessage: '',
            progress: {},
            rpcNode: (0, _RPCNode.getCurrentRPCNode)() || $STM_Config.steemd_connection_client,
            rpcError: ''
        };
        _this.initForm(props);
        _this.onNsfwPrefChange = _this.onNsfwPrefChange.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(Settings, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var account = this.props.account;

            if (account) {
                this.initForm(this.props);
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var account = this.props.account;

            if (prevProps.account !== account && account) {
                this.initForm(this.props);
            }
        }
    }, {
        key: 'initForm',
        value: function initForm(props) {
            var _this2 = this;

            (0, _ReactForm2.default)({
                instance: this,
                name: 'accountSettings',
                fields: ['profile_image', 'cover_image', 'name', 'about', 'location', 'website'],
                initialValues: props.profile,
                validation: function validation(values) {
                    return {
                        profile_image: values.profile_image && !/^https?:\/\//.test(values.profile_image) ? (0, _counterpart2.default)('settings_jsx.invalid_url') : null,
                        cover_image: values.cover_image && !/^https?:\/\//.test(values.cover_image) ? (0, _counterpart2.default)('settings_jsx.invalid_url') : null,
                        name: values.name && values.name.length > 20 ? (0, _counterpart2.default)('settings_jsx.name_is_too_long') : values.name && /^\s*@/.test(values.name) ? (0, _counterpart2.default)('settings_jsx.name_must_not_begin_with') : null,
                        about: values.about && values.about.length > 160 ? (0, _counterpart2.default)('settings_jsx.about_is_too_long') : null,
                        location: values.location && values.location.length > 30 ? (0, _counterpart2.default)('settings_jsx.location_is_too_long') : null,
                        website: values.website && values.website.length > 100 ? (0, _counterpart2.default)('settings_jsx.website_url_is_too_long') : values.website && !/^https?:\/\//.test(values.website) ? (0, _counterpart2.default)('settings_jsx.invalid_url') : null
                    };
                }
            });
            this.handleSubmitForm = this.state.accountSettings.handleSubmit(function (args) {
                return _this2.handleSubmit(args);
            });
        }
    }, {
        key: 'onNsfwPrefChange',
        value: function onNsfwPrefChange(e) {
            this.props.setUserPreferences((0, _extends4.default)({}, this.props.user_preferences, {
                nsfwPref: e.currentTarget.value
            }));
        }
    }, {
        key: 'validateUrlFormat',
        value: function validateUrlFormat(url) {
            if (!url) return false;
            if (!/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/.test(url)) return false;

            return true;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var state = this.state,
                props = this.props;
            var _props = this.props,
                walletUrl = _props.walletUrl,
                ignores = _props.ignores,
                accountname = _props.accountname,
                isOwnAccount = _props.isOwnAccount,
                user_preferences = _props.user_preferences,
                follow = _props.follow;
            var _state$accountSetting = this.state.accountSettings,
                submitting = _state$accountSetting.submitting,
                valid = _state$accountSetting.valid,
                touched = _state$accountSetting.touched;

            var disabled = !props.isOwnAccount || state.loading || submitting || !valid || !touched;

            var _state = this.state,
                profile_image = _state.profile_image,
                cover_image = _state.cover_image,
                name = _state.name,
                about = _state.about,
                location = _state.location,
                website = _state.website,
                progress = _state.progress,
                rpcNode = _state.rpcNode,
                rpcError = _state.rpcError;


            return _react2.default.createElement(
                'div',
                { className: 'Settings' },
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'small-12 medium-4 large-4 columns' },
                        _react2.default.createElement('br', null),
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'h4',
                            null,
                            (0, _counterpart2.default)('settings_jsx.rpc_title')
                        ),
                        _react2.default.createElement(
                            'label',
                            null,
                            (0, _counterpart2.default)('settings_jsx.rpc_select')
                        ),
                        _react2.default.createElement(
                            'select',
                            {
                                defaultValue: rpcNode,
                                onChange: this.handleSelectRPCNode
                            },
                            $STM_Config.steemd_rpc_list.map(function (rpc, idx) {
                                return _react2.default.createElement(
                                    'option',
                                    { key: idx, value: rpc },
                                    rpc
                                );
                            })
                        ),
                        _react2.default.createElement(
                            'label',
                            null,
                            rpcError || (0, _counterpart2.default)('settings_jsx.selected_rpc', {
                                rpc: rpcNode
                            })
                        ),
                        _react2.default.createElement('br', null),
                        _react2.default.createElement('br', null)
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    (0, _UserUtil.isLoggedIn)() && isOwnAccount && _react2.default.createElement(
                        'form',
                        {
                            onSubmit: this.handleSubmitForm,
                            className: 'small-12 medium-6 large-4 columns'
                        },
                        _react2.default.createElement(
                            'h4',
                            null,
                            (0, _counterpart2.default)('settings_jsx.public_profile_settings')
                        ),
                        progress.message && _react2.default.createElement(
                            'div',
                            { className: 'info' },
                            progress.message
                        ),
                        progress.error && _react2.default.createElement(
                            'div',
                            { className: 'error' },
                            (0, _counterpart2.default)('reply_editor.image_upload'),
                            ': ',
                            progress.error
                        ),
                        _react2.default.createElement(
                            'label',
                            null,
                            (0, _counterpart2.default)('settings_jsx.profile_image_url'),
                            _react2.default.createElement(
                                _reactDropzone2.default,
                                {
                                    onDrop: this.onDrop,
                                    className: 'none',
                                    disableClick: true,
                                    multiple: false,
                                    accept: 'image/*',
                                    ref: function ref(node) {
                                        _this3.dropzone = node;
                                    }
                                },
                                _react2.default.createElement('input', (0, _extends4.default)({
                                    type: 'url'
                                }, profile_image.props, {
                                    autoComplete: 'off'
                                }))
                            ),
                            _react2.default.createElement(
                                'a',
                                {
                                    onClick: function onClick() {
                                        return _this3.onOpenClick('profile_image');
                                    }
                                },
                                (0, _counterpart2.default)('settings_jsx.upload_image')
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'error' },
                            profile_image.blur && profile_image.touched && profile_image.error
                        ),
                        _react2.default.createElement(
                            'label',
                            null,
                            (0, _counterpart2.default)('settings_jsx.cover_image_url'),
                            ' ',
                            _react2.default.createElement(
                                'small',
                                null,
                                '(Optimal: 2048 x 512 pixels)'
                            ),
                            _react2.default.createElement('input', (0, _extends4.default)({
                                type: 'url'
                            }, cover_image.props, {
                                autoComplete: 'off'
                            })),
                            _react2.default.createElement(
                                'a',
                                {
                                    onClick: function onClick() {
                                        return _this3.onOpenClick('cover_image');
                                    }
                                },
                                (0, _counterpart2.default)('settings_jsx.upload_image')
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'error' },
                            cover_image.blur && cover_image.touched && cover_image.error
                        ),
                        _react2.default.createElement(
                            'label',
                            null,
                            (0, _counterpart2.default)('settings_jsx.profile_name'),
                            _react2.default.createElement('input', (0, _extends4.default)({
                                type: 'text'
                            }, name.props, {
                                maxLength: '20',
                                autoComplete: 'off'
                            }))
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'error' },
                            name.touched && name.error
                        ),
                        _react2.default.createElement(
                            'label',
                            null,
                            (0, _counterpart2.default)('settings_jsx.profile_about'),
                            _react2.default.createElement('input', (0, _extends4.default)({
                                type: 'text'
                            }, about.props, {
                                maxLength: '160',
                                autoComplete: 'off'
                            }))
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'error' },
                            about.touched && about.error
                        ),
                        _react2.default.createElement(
                            'label',
                            null,
                            (0, _counterpart2.default)('settings_jsx.profile_location'),
                            _react2.default.createElement('input', (0, _extends4.default)({
                                type: 'text'
                            }, location.props, {
                                maxLength: '30',
                                autoComplete: 'off'
                            }))
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'error' },
                            location.touched && location.error
                        ),
                        _react2.default.createElement(
                            'label',
                            null,
                            (0, _counterpart2.default)('settings_jsx.profile_website'),
                            _react2.default.createElement('input', (0, _extends4.default)({
                                type: 'url'
                            }, website.props, {
                                maxLength: '100',
                                autoComplete: 'off'
                            }))
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'error' },
                            website.blur && website.touched && website.error
                        ),
                        state.loading && _react2.default.createElement(
                            'span',
                            null,
                            _react2.default.createElement('br', null),
                            _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle' }),
                            _react2.default.createElement('br', null)
                        ),
                        !state.loading && _react2.default.createElement('input', {
                            type: 'submit',
                            className: 'button slim',
                            value: (0, _counterpart2.default)('settings_jsx.update'),
                            disabled: disabled
                        }),
                        ' ',
                        state.errorMessage ? _react2.default.createElement(
                            'small',
                            { className: 'error' },
                            state.errorMessage
                        ) : state.successMessage ? _react2.default.createElement(
                            'small',
                            { className: 'success uppercase' },
                            state.successMessage
                        ) : null
                    )
                ),
                isOwnAccount && _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'small-12 medium-4 large-4 columns' },
                        _react2.default.createElement('br', null),
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'h4',
                            null,
                            (0, _counterpart2.default)('settings_jsx.preferences')
                        ),
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'label',
                            null,
                            (0, _counterpart2.default)('settings_jsx.not_safe_for_work_nsfw_content')
                        ),
                        _react2.default.createElement(
                            'select',
                            {
                                value: user_preferences.nsfwPref,
                                onChange: this.onNsfwPrefChange
                            },
                            _react2.default.createElement(
                                'option',
                                { value: 'hide' },
                                (0, _counterpart2.default)('settings_jsx.always_hide')
                            ),
                            _react2.default.createElement(
                                'option',
                                { value: 'warn' },
                                (0, _counterpart2.default)('settings_jsx.always_warn')
                            ),
                            _react2.default.createElement(
                                'option',
                                { value: 'show' },
                                (0, _counterpart2.default)('settings_jsx.always_show')
                            )
                        ),
                        _react2.default.createElement('br', null),
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'label',
                            null,
                            (0, _counterpart2.default)('settings_jsx.choose_default_blog_payout'),
                            _react2.default.createElement(
                                'select',
                                {
                                    defaultValue: user_preferences.defaultBlogPayout || '50%',
                                    onChange: this.handleDefaultBlogPayoutChange
                                },
                                _react2.default.createElement(
                                    'option',
                                    { value: '0%' },
                                    (0, _counterpart2.default)('reply_editor.decline_payout')
                                ),
                                _react2.default.createElement(
                                    'option',
                                    { value: '50%' },
                                    (0, _counterpart2.default)('reply_editor.default_50_50')
                                ),
                                _react2.default.createElement(
                                    'option',
                                    { value: '100%' },
                                    (0, _counterpart2.default)('reply_editor.power_up_100')
                                )
                            )
                        ),
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'label',
                            null,
                            (0, _counterpart2.default)('settings_jsx.choose_default_comment_payout'),
                            _react2.default.createElement(
                                'select',
                                {
                                    defaultValue: user_preferences.defaultCommentPayout || '50%',
                                    onChange: this.handleDefaultCommentPayoutChange
                                },
                                _react2.default.createElement(
                                    'option',
                                    { value: '0%' },
                                    (0, _counterpart2.default)('reply_editor.decline_payout')
                                ),
                                _react2.default.createElement(
                                    'option',
                                    { value: '50%' },
                                    (0, _counterpart2.default)('reply_editor.default_50_50')
                                ),
                                _react2.default.createElement(
                                    'option',
                                    { value: '100%' },
                                    (0, _counterpart2.default)('reply_editor.power_up_100')
                                )
                            )
                        ),
                        _react2.default.createElement('br', null)
                    )
                ),
                ignores && ignores.size > 0 && _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'small-12 medium-6 large-6 columns' },
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'h4',
                            null,
                            'Muted Users'
                        ),
                        _react2.default.createElement(_MuteList2.default, {
                            account: accountname,
                            users: ignores
                        })
                    )
                )
            );
        }
    }]);
    return Settings;
}(_react2.default.Component);

function read_profile_v2(account) {
    if (!account) return {};

    // use new `posting_json_md` if {version: 2} is present
    var md = _object2json2.default.ifStringParseJSON(account.get('posting_json_metadata'));
    if (md && md.profile && md.profile.version) return md;

    // otherwise, fall back to `json_metadata`
    md = _object2json2.default.ifStringParseJSON(account.get('json_metadata'));
    if (typeof md === 'string') md = _object2json2.default.ifStringParseJSON(md); // issue #1237, double-encoded
    return md;
}

exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    var accountname = ownProps.routeParams.accountname;


    var isOwnAccount = state.user.getIn(['current', 'username'], '') == accountname;
    var ignores = isOwnAccount && state.global.getIn(['follow', 'getFollowingAsync', accountname, 'ignore_result']);
    var account = state.global.getIn(['accounts', accountname]);
    var current_user = state.user.get('current');
    var username = current_user ? current_user.get('username') : '';

    var metaData = read_profile_v2(account);
    var profile = metaData && metaData.profile ? metaData.profile : {};
    var user_preferences = state.app.get('user_preferences').toJS();

    return (0, _extends4.default)((0, _defineProperty3.default)({
        account: account,
        metaData: metaData,
        accountname: accountname,
        isOwnAccount: isOwnAccount,
        ignores: ignores,
        user_preferences: state.app.get('user_preferences').toJS(),
        walletUrl: state.app.get('walletUrl'),
        profile: profile,
        follow: state.global.get('follow')
    }, 'user_preferences', user_preferences), ownProps);
},
// mapDispatchToProps
function (dispatch) {
    return {
        changeLanguage: function changeLanguage(language) {
            dispatch(userActions.changeLanguage(language));
        },
        uploadImage: function uploadImage(file, progress) {
            return dispatch(userActions.uploadImage({ file: file, progress: progress }));
        },
        updateAccount: function updateAccount(_ref2) {
            var successCallback = _ref2.successCallback,
                errorCallback = _ref2.errorCallback,
                operation = (0, _objectWithoutProperties3.default)(_ref2, ['successCallback', 'errorCallback']);

            var options = {
                type: 'account_update2',
                operation: operation,
                successCallback: successCallback,
                errorCallback: errorCallback
            };
            dispatch(transactionActions.broadcastOperation(options));
        },
        setUserPreferences: function setUserPreferences(payload) {
            dispatch(appActions.setUserPreferences(payload));
        }
    };
})(Settings);