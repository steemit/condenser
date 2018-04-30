import React from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';
import * as userActions from 'app/redux/UserReducer';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as appActions from 'app/redux/AppReducer';
import o2j from 'shared/clash/object2json';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import reactForm from 'app/utils/ReactForm';
import UserList from 'app/components/elements/UserList';
import Dropzone from 'react-dropzone';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            successMessage: '',
            progress: {},
        };
        this.initForm(props);
        this.onNsfwPrefChange = this.onNsfwPrefChange.bind(this);
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

    componentWillMount() {
        const { accountname } = this.props;
        const nsfwPref =
            (process.env.BROWSER
                ? localStorage.getItem('nsfwPref-' + accountname)
                : null) || 'warn';
        this.setState({ nsfwPref, oldNsfwPref: nsfwPref });
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

    onNsfwPrefChange(e) {
        const nsfwPref = e.currentTarget.value;
        const userPreferences = { ...this.props.user_preferences, nsfwPref };
        this.props.setUserPreferences(userPreferences);
    }

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
            json_metadata: JSON.stringify(metaData),
            account: account.name,
            memo_key: account.memo_key,
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

    handleLanguageChange = event => {
        const locale = event.target.value;
        const userPreferences = { ...this.props.user_preferences, locale };
        this.props.setUserPreferences(userPreferences);
    };

    render() {
        const { state, props } = this;

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
        } = this.state;

        const { follow, account, isOwnAccount, user_preferences } = this.props;
        const following =
            follow && follow.getIn(['getFollowingAsync', account.name]);
        const ignores =
            isOwnAccount && following && following.get('ignore_result');

        return (
            <div className="Settings">
                <div className="row">
                    <form
                        onSubmit={this.handleSubmitForm}
                        className="small-12 medium-6 large-4 columns"
                    >
                        <h4>{tt('settings_jsx.public_profile_settings')}</h4>
                        {progress.message && (
                            <div className="info">{progress.message}</div>
                        )}
                        {progress.error && (
                            <div className="error">
                                {tt('reply_editor.image_upload')}{': '}
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
                            {tt('settings_jsx.cover_image_url')}
                            <input
                                type="url"
                                {...cover_image.props}
                                autoComplete="off"
                            />
                            <a onClick={() => this.onOpenClick('cover_image')}>
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
                            {website.blur && website.touched && website.error}
                        </div>
                        <br />
                        {state.loading && (
                            <span>
                                <LoadingIndicator type="circle" />
                                <br />
                            </span>
                        )}
                        {!state.loading && (
                            <input
                                type="submit"
                                className="button"
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
                </div>

                {isOwnAccount && (
                    <div className="row">
                        <div className="small-12 medium-6 large-4 columns">
                            <br />
                            <br />
                            <h4>{tt('settings_jsx.preferences')}</h4>
                            <div className="row">
                                <div className="small-12 medium-6 large-12 columns">
                                    <label>
                                        {tt('g.choose_language')}
                                        <select
                                            defaultValue={
                                                user_preferences.locale
                                            }
                                            onChange={this.handleLanguageChange}
                                        >
                                            <option value="en">English</option>
                                            <option value="es">
                                                Spanish Español
                                            </option>
                                            <option value="ru">
                                                Russian русский
                                            </option>
                                            <option value="fr">
                                                French français
                                            </option>
                                            <option value="it">
                                                Italian italiano
                                            </option>
                                            <option value="ko">
                                                Korean 한국어
                                            </option>
                                            <option value="ja">
                                                Japanese 日本語
                                            </option>
                                            <option value="pl">Polish</option>
                                            <option value="zh">
                                                Chinese 简体中文
                                            </option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                            <br />
                            <div>
                                <label>
                                    {tt(
                                        'settings_jsx.not_safe_for_work_nsfw_content'
                                    )}
                                </label>
                            </div>
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
                            <div>&nbsp;</div>
                        </div>
                    </div>
                )}
                {ignores &&
                    ignores.size > 0 && (
                        <div className="row">
                            <div className="small-12 medium-6 large-4 columns">
                                <br />
                                <br />
                                <UserList
                                    title={tt('settings_jsx.muted_users')}
                                    account={account}
                                    users={ignores}
                                />
                            </div>
                        </div>
                    )}
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const { accountname } = ownProps.routeParams;
        const account = state.global.getIn(['accounts', accountname]).toJS();
        const current_user = state.user.get('current');
        const username = current_user ? current_user.get('username') : '';
        let metaData = account
            ? o2j.ifStringParseJSON(account.json_metadata)
            : {};
        if (typeof metaData === 'string')
            metaData = o2j.ifStringParseJSON(metaData); // issue #1237
        const profile = metaData && metaData.profile ? metaData.profile : {};
        const user_preferences = state.app.get('user_preferences').toJS();

        return {
            account,
            metaData,
            accountname,
            isOwnAccount: username == accountname,
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
                type: 'account_update',
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
