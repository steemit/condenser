import React from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';
import * as userActions from 'app/redux/UserReducer';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as appActions from 'app/redux/AppReducer';
import o2j from 'shared/clash/object2json';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import reactForm from 'app/utils/ReactForm';
import Dropzone from 'react-dropzone';
import MuteList from 'app/components/elements/MuteList';
import { isLoggedIn } from 'app/utils/UserUtil';
import { userActionRecord } from 'app/utils/ServerApiClient';
import * as steem from '@steemit/steem-js';
import { getCurrentRPCNode, changeRPCNodeToDefault } from 'app/utils/RPCNode';

class Settings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errorMessage: '',
            successMessage: '',
            progress: {},
            rpcNode:
                getCurrentRPCNode() || $STM_Config.steemd_connection_client,
            rpcError: '',
        };
        this.initForm(props);
        this.onNsfwPrefChange = this.onNsfwPrefChange.bind(this);
    }

    componentWillMount() {
        const { account } = this.props;
        if (account) {
            this.initForm(this.props);
        }
    }

    componentDidUpdate(prevProps) {
        const { account } = this.props;
        if (prevProps.account !== account && account) {
            this.initForm(this.props);
        }
    }

    initForm(props) {
        reactForm({
            instance: this,
            name: 'accountSettings',
            fields: [
                'profile_image',
                'cover_image',
                'name',
                'about',
                'location',
                'website',
            ],
            initialValues: props.profile,
            validation: values => ({
                profile_image:
                    values.profile_image &&
                    !/^https?:\/\//.test(values.profile_image)
                        ? tt('settings_jsx.invalid_url')
                        : null,
                cover_image:
                    values.cover_image &&
                    !/^https?:\/\//.test(values.cover_image)
                        ? tt('settings_jsx.invalid_url')
                        : null,
                name:
                    values.name && values.name.length > 20
                        ? tt('settings_jsx.name_is_too_long')
                        : values.name && /^\s*@/.test(values.name)
                          ? tt('settings_jsx.name_must_not_begin_with')
                          : null,
                about:
                    values.about && values.about.length > 160
                        ? tt('settings_jsx.about_is_too_long')
                        : null,
                location:
                    values.location && values.location.length > 30
                        ? tt('settings_jsx.location_is_too_long')
                        : null,
                website:
                    values.website && values.website.length > 100
                        ? tt('settings_jsx.website_url_is_too_long')
                        : values.website && !/^https?:\/\//.test(values.website)
                          ? tt('settings_jsx.invalid_url')
                          : null,
            }),
        });
        this.handleSubmitForm = this.state.accountSettings.handleSubmit(args =>
            this.handleSubmit(args)
        );
    }

    onDrop = (acceptedFiles, rejectedFiles) => {
        if (!acceptedFiles.length) {
            if (rejectedFiles.length) {
                this.setState({
                    progress: { error: 'Please insert only image files.' },
                });
                console.log('onDrop Rejected files: ', rejectedFiles);
            }
            return;
        }
        const file = acceptedFiles[0];
        this.upload(file, file.name);
    };

    onOpenClick = imageName => {
        this.setState({
            imageInProgress: imageName,
        });
        this.dropzone.open();
    };

    upload = (file, name = '') => {
        const { uploadImage } = this.props;
        this.setState({
            progress: { message: tt('settings_jsx.uploading_image') + '...' },
        });
        uploadImage(file, progress => {
            if (progress.url) {
                this.setState({ progress: {} });
                const { url } = progress;
                const image_md = `${url}`;
                let field;
                if (this.state.imageInProgress === 'profile_image') {
                    field = this.state.profile_image;
                } else if (this.state.imageInProgress === 'cover_image') {
                    field = this.state.cover_image;
                } else {
                    return;
                }
                field.props.onChange(image_md);
            } else {
                this.setState({ progress });
            }
            setTimeout(() => {
                this.setState({ progress: {} });
            }, 4000); // clear message
        });
    };

    handleSubmit = ({ updateInitialValues }) => {
        let { metaData } = this.props;
        if (!metaData) metaData = {};
        if (!metaData.profile) metaData.profile = {};
        delete metaData.user_image; // old field... cleanup

        const {
            profile_image,
            cover_image,
            name,
            about,
            location,
            website,
        } = this.state;

        // Update relevant fields
        metaData.profile.profile_image = profile_image.value;
        metaData.profile.cover_image = cover_image.value;
        metaData.profile.name = name.value;
        metaData.profile.about = about.value;
        metaData.profile.location = location.value;
        metaData.profile.website = website.value;
        metaData.profile.version = 2; // signal upgrade to posting_json_metadata

        // Remove empty keys
        if (!metaData.profile.profile_image)
            delete metaData.profile.profile_image;
        if (!metaData.profile.cover_image) delete metaData.profile.cover_image;
        if (!metaData.profile.name) delete metaData.profile.name;
        if (!metaData.profile.about) delete metaData.profile.about;
        if (!metaData.profile.location) delete metaData.profile.location;
        if (!metaData.profile.website) delete metaData.profile.website;

        const { account, updateAccount } = this.props;
        this.setState({ loading: true });
        updateAccount({
            account: account.get('name'),
            json_metadata: '',
            posting_json_metadata: JSON.stringify(metaData),
            errorCallback: e => {
                if (e === 'Canceled') {
                    this.setState({
                        loading: false,
                        errorMessage: '',
                    });
                } else {
                    console.log('updateAccount ERROR', e);
                    this.setState({
                        loading: false,
                        changed: false,
                        errorMessage: tt('g.server_returned_error'),
                    });
                }
            },
            successCallback: () => {
                userActionRecord('update_account', {
                    username: account.get('name'),
                });
                this.setState({
                    loading: false,
                    changed: false,
                    errorMessage: '',
                    successMessage: tt('settings_jsx.saved'),
                });
                // remove successMessage after a while
                setTimeout(() => this.setState({ successMessage: '' }), 4000);
                updateInitialValues();
            },
        });
    };

    onNsfwPrefChange(e) {
        this.props.setUserPreferences({
            ...this.props.user_preferences,
            nsfwPref: e.currentTarget.value,
        });
    }

    validateUrlFormat(url) {
        if (!url) return false;
        if (
            !/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/.test(
                url
            )
        )
            return false;

        return true;
    }

    handleDefaultBlogPayoutChange = event => {
        this.props.setUserPreferences({
            ...this.props.user_preferences,
            defaultBlogPayout: event.target.value,
        });
    };

    handleDefaultCommentPayoutChange = event => {
        this.props.setUserPreferences({
            ...this.props.user_preferences,
            defaultCommentPayout: event.target.value,
        });
    };

    handleSelectRPCNode = event => {
        const selectedUrl = event.target.value;

        if (this.validateUrlFormat(selectedUrl) === false) {
            this.setState({
                rpcError: tt('settings_jsx.invalid_url'),
            });
            return;
        } else {
            this.setState({
                rpcNode: selectedUrl,
                rpcError: '',
            });
        }

        changeRPCNodeToDefault(selectedUrl);
    };

    handleLanguageChange = event => {
        const locale = event.target.value;
        const userPreferences = { ...this.props.user_preferences, locale };
        this.props.setUserPreferences(userPreferences);
    };

    render() {
        const { state, props } = this;
        const {
            walletUrl,
            ignores,
            accountname,
            isOwnAccount,
            user_preferences,
            follow,
        } = this.props;

        const { submitting, valid, touched } = this.state.accountSettings;
        const disabled =
            !props.isOwnAccount ||
            state.loading ||
            submitting ||
            !valid ||
            !touched;

        const {
            profile_image,
            cover_image,
            name,
            about,
            location,
            website,
            progress,
            rpcNode,
            rpcError,
        } = this.state;

        return (
            <div className="Settings">
                <div className="row">
                    <div className="small-12 medium-4 large-4 columns">
                        <br />
                        <br />
                        <h4>{tt('settings_jsx.rpc_title')}</h4>

                        <label>{tt('settings_jsx.rpc_select')}</label>

                        <input
                            list="rpcNodes"
                            defaultValue={rpcNode}
                            onChange={this.handleSelectRPCNode}
                            className="rpc-input"
                        />
                        <datalist id="rpcNodes">
                            {$STM_Config.steemd_rpc_list.map((rpc, idx) => (
                                <option key={idx} value={rpc} />
                            ))}
                        </datalist>

                        <label>
                            {rpcError ||
                                tt('settings_jsx.selected_rpc', {
                                    rpc: rpcNode,
                                })}
                        </label>

                        <br />
                        <br />
                    </div>
                </div>
                <div className="row">
                    {isLoggedIn() &&
                        isOwnAccount && (
                            <form
                                onSubmit={this.handleSubmitForm}
                                className="small-12 medium-6 large-4 columns"
                            >
                                <h4>
                                    {tt('settings_jsx.public_profile_settings')}
                                </h4>
                                {progress.message && (
                                    <div className="info">
                                        {progress.message}
                                    </div>
                                )}
                                {progress.error && (
                                    <div className="error">
                                        {tt('reply_editor.image_upload')}
                                        {': '}
                                        {progress.error}
                                    </div>
                                )}
                                <label>
                                    {tt('settings_jsx.profile_image_url')}
                                    <Dropzone
                                        onDrop={this.onDrop}
                                        className={'none'}
                                        disableClick
                                        multiple={false}
                                        accept="image/*"
                                        ref={node => {
                                            this.dropzone = node;
                                        }}
                                    >
                                        <input
                                            type="url"
                                            {...profile_image.props}
                                            autoComplete="off"
                                        />
                                    </Dropzone>
                                    <a
                                        onClick={() =>
                                            this.onOpenClick('profile_image')
                                        }
                                    >
                                        {tt('settings_jsx.upload_image')}
                                    </a>
                                </label>
                                <div className="error">
                                    {profile_image.blur &&
                                        profile_image.touched &&
                                        profile_image.error}
                                </div>
                                <label>
                                    {tt('settings_jsx.cover_image_url')}{' '}
                                    <small>(Optimal: 2048 x 512 pixels)</small>
                                    <input
                                        type="url"
                                        {...cover_image.props}
                                        autoComplete="off"
                                    />
                                    <a
                                        onClick={() =>
                                            this.onOpenClick('cover_image')
                                        }
                                    >
                                        {tt('settings_jsx.upload_image')}
                                    </a>
                                </label>
                                <div className="error">
                                    {cover_image.blur &&
                                        cover_image.touched &&
                                        cover_image.error}
                                </div>
                                <label>
                                    {tt('settings_jsx.profile_name')}
                                    <input
                                        type="text"
                                        {...name.props}
                                        maxLength="20"
                                        autoComplete="off"
                                    />
                                </label>
                                <div className="error">
                                    {name.touched && name.error}
                                </div>
                                <label>
                                    {tt('settings_jsx.profile_about')}
                                    <input
                                        type="text"
                                        {...about.props}
                                        maxLength="160"
                                        autoComplete="off"
                                    />
                                </label>
                                <div className="error">
                                    {about.touched && about.error}
                                </div>
                                <label>
                                    {tt('settings_jsx.profile_location')}
                                    <input
                                        type="text"
                                        {...location.props}
                                        maxLength="30"
                                        autoComplete="off"
                                    />
                                </label>
                                <div className="error">
                                    {location.touched && location.error}
                                </div>
                                <label>
                                    {tt('settings_jsx.profile_website')}
                                    <input
                                        type="url"
                                        {...website.props}
                                        maxLength="100"
                                        autoComplete="off"
                                    />
                                </label>
                                <div className="error">
                                    {website.blur &&
                                        website.touched &&
                                        website.error}
                                </div>
                                {state.loading && (
                                    <span>
                                        <br />
                                        <LoadingIndicator type="circle" />
                                        <br />
                                    </span>
                                )}
                                {!state.loading && (
                                    <input
                                        type="submit"
                                        className="button slim"
                                        value={tt('settings_jsx.update')}
                                        disabled={disabled}
                                    />
                                )}{' '}
                                {state.errorMessage ? (
                                    <small className="error">
                                        {state.errorMessage}
                                    </small>
                                ) : state.successMessage ? (
                                    <small className="success uppercase">
                                        {state.successMessage}
                                    </small>
                                ) : null}
                            </form>
                        )}
                </div>

                {isOwnAccount && (
                    <div className="row">
                        <div className="small-12 medium-4 large-4 columns">
                            <br />
                            <br />
                            <h4>{tt('settings_jsx.preferences')}</h4>

                            {/*<label>
                                {tt('g.choose_language')}
                                <select
                                    defaultValue={user_preferences.locale}
                                    onChange={this.handleLanguageChange}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish Español</option>
                                    <option value="ru">Russian русский</option>
                                    <option value="fr">French français</option>
                                    <option value="it">Italian italiano</option>
                                    <option value="ko">Korean 한국어</option>
                                    <option value="ja">Japanese 日本語</option>
                                    <option value="pl">Polish</option>
                                    <option value="zh">Chinese 简体中文</option>
                                </select>
                            </label>*/}
                            <br />

                            <label>
                                {tt(
                                    'settings_jsx.not_safe_for_work_nsfw_content'
                                )}
                            </label>
                            <select
                                value={user_preferences.nsfwPref}
                                onChange={this.onNsfwPrefChange}
                            >
                                <option value="hide">
                                    {tt('settings_jsx.always_hide')}
                                </option>
                                <option value="warn">
                                    {tt('settings_jsx.always_warn')}
                                </option>
                                <option value="show">
                                    {tt('settings_jsx.always_show')}
                                </option>
                            </select>
                            <br />
                            <br />

                            <label>
                                {tt('settings_jsx.choose_default_blog_payout')}
                                <select
                                    defaultValue={
                                        user_preferences.defaultBlogPayout ||
                                        '50%'
                                    }
                                    onChange={
                                        this.handleDefaultBlogPayoutChange
                                    }
                                >
                                    <option value="0%">
                                        {tt('reply_editor.decline_payout')}
                                    </option>
                                    <option value="50%">
                                        {tt('reply_editor.default_50_50')}
                                    </option>
                                    <option value="100%">
                                        {tt('reply_editor.power_up_100')}
                                    </option>
                                </select>
                            </label>
                            <br />

                            <label>
                                {tt(
                                    'settings_jsx.choose_default_comment_payout'
                                )}
                                <select
                                    defaultValue={
                                        user_preferences.defaultCommentPayout ||
                                        '50%'
                                    }
                                    onChange={
                                        this.handleDefaultCommentPayoutChange
                                    }
                                >
                                    <option value="0%">
                                        {tt('reply_editor.decline_payout')}
                                    </option>
                                    <option value="50%">
                                        {tt('reply_editor.default_50_50')}
                                    </option>
                                    <option value="100%">
                                        {tt('reply_editor.power_up_100')}
                                    </option>
                                </select>
                            </label>
                            <br />
                        </div>
                    </div>
                )}
                {ignores &&
                    ignores.size > 0 && (
                        <div className="row">
                            <div className="small-12 medium-6 large-6 columns">
                                <br />
                                <h4>Muted Users</h4>
                                <MuteList
                                    account={accountname}
                                    users={ignores}
                                />
                            </div>
                        </div>
                    )}
            </div>
        );
    }
}

function read_profile_v2(account) {
    if (!account) return {};

    // use new `posting_json_md` if {version: 2} is present
    let md = o2j.ifStringParseJSON(account.get('posting_json_metadata'));
    if (md && md.profile && md.profile.version) return md;

    // otherwise, fall back to `json_metadata`
    md = o2j.ifStringParseJSON(account.get('json_metadata'));
    if (typeof md === 'string') md = o2j.ifStringParseJSON(md); // issue #1237, double-encoded
    return md;
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const { accountname } = ownProps.routeParams;

        const isOwnAccount =
            state.user.getIn(['current', 'username'], '') == accountname;
        const ignores =
            isOwnAccount &&
            state.global.getIn([
                'follow',
                'getFollowingAsync',
                accountname,
                'ignore_result',
            ]);
        const account = state.global.getIn(['accounts', accountname]);
        const current_user = state.user.get('current');
        const username = current_user ? current_user.get('username') : '';

        const metaData = read_profile_v2(account);
        const profile = metaData && metaData.profile ? metaData.profile : {};
        const user_preferences = state.app.get('user_preferences').toJS();

        return {
            account,
            metaData,
            accountname,
            isOwnAccount,
            ignores,
            user_preferences: state.app.get('user_preferences').toJS(),
            walletUrl: state.app.get('walletUrl'),
            profile,
            follow: state.global.get('follow'),
            user_preferences,
            ...ownProps,
        };
    },
    // mapDispatchToProps
    dispatch => ({
        changeLanguage: language => {
            dispatch(userActions.changeLanguage(language));
        },
        uploadImage: (file, progress) =>
            dispatch(userActions.uploadImage({ file, progress })),
        updateAccount: ({ successCallback, errorCallback, ...operation }) => {
            const options = {
                type: 'account_update2',
                operation,
                successCallback,
                errorCallback,
            };
            dispatch(transactionActions.broadcastOperation(options));
        },
        setUserPreferences: payload => {
            dispatch(appActions.setUserPreferences(payload));
        },
    })
)(Settings);
