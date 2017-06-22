import React from 'react';
import {connect} from 'react-redux'
import user from 'app/redux/User';
import {translate} from 'app/Translator';
import {ALLOWED_CURRENCIES} from 'config/client_config'
import {ALLOWED_THEMES} from 'app/components/elements/Themes'
import store from 'store';
import transaction from 'app/redux/Transaction'
import o2j from 'shared/clash/object2json'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import Userpic from 'app/components/elements/Userpic';
import reactForm from 'app/utils/ReactForm'
import UserList from 'app/components/elements/UserList';

class Settings extends React.Component {

    constructor(props) {
        super()
        this.initForm(props)
        this.onNsfwPrefChange = this.onNsfwPrefChange.bind(this)
    }

    state = {
        errorMessage: '',
        successMessage: '',
    }

    initForm(props) {
        reactForm({
            instance: this,
            name: 'accountSettings',
            fields: ['profile_image', 'name', 'about', 'location', 'website'],
            initialValues: props.profile,
            validation: values => ({
                profile_image: values.profile_image && !/^https?:\/\//.test(values.profile_image) ? translate('invalid_url') : null,
                name: values.name && values.name.length > 20 ? translate('name_is_too_long') : values.name && /^\s*@/.test(values.name) ? translate('') : null,
                about: values.about && values.about.length > 160 ? translate('about_is_too_long') : null,
                location: values.location && values.location.length > 30 ? translate('location_is_too_long') : null,
                website: values.website && values.website.length > 100 ? translate('url_is_too_long') : values.website && !/^https?:\/\//.test(values.website) ? translate('invalid_url') : null,
            })
        })
        this.handleSubmitForm =
            this.state.accountSettings.handleSubmit(args => this.handleSubmit(args))
    }

    componentWillMount() {
        const {accountname} = this.props
        const nsfwPref = (process.env.BROWSER ? localStorage.getItem('nsfwPref-' + accountname) : null) || 'warn'
        this.setState({nsfwPref})
    }

    handleCurrencyChange(event) {
        store.set('currency', event.target.value)
    }

    handleThemeChange(event) {
        const theme = event.target.value
        store.set('theme', theme)
        if (document) {
            document.body.setAttribute("data-theme", theme.replace(/"/g,'').toLowerCase());
        }
    }

    handleLanguageChange = (event) => {
        const language = event.target.value
        store.set('language', language)
        this.props.changeLanguage(language)
    }

    onNsfwPrefChange(e) {
        const nsfwPref = e.currentTarget.value;
        const {accountname} = this.props;
        localStorage.setItem('nsfwPref-'+accountname, nsfwPref)
        this.setState({nsfwPref})
    }

    handleSubmit = ({updateInitialValues}) => {
        let {metaData} = this.props
        if (!metaData) metaData = {}
        if(!metaData.profile) metaData.profile = {}
        delete metaData.user_image; // old field... cleanup

        const {profile_image, name, about, location, website} = this.state

        // Update relevant fields
        metaData.profile.profile_image = profile_image.value
        metaData.profile.name = name.value
        metaData.profile.about = about.value
        metaData.profile.location = location.value
        metaData.profile.website = website.value

        // Remove empty keys
        if(!metaData.profile.profile_image) delete metaData.profile.profile_image;
        if(!metaData.profile.name) delete metaData.profile.name;
        if(!metaData.profile.about) delete metaData.profile.about;
        if(!metaData.profile.location) delete metaData.profile.location;
        if(!metaData.profile.website) delete metaData.profile.website;

        // TODO: Update language & currency
        //store.set('language', language)
        //this.props.changeLanguage(language)
        //store.set('currency', event.target.value)

        const {account, updateAccount} = this.props
        this.setState({loading: true})
        updateAccount({
            json_metadata: JSON.stringify(metaData),
            account: account.name,
            memo_key: account.memo_key,
            errorCallback: (e) => {
                if (e === 'Canceled') {
                    this.setState({
                        loading: false,
                        errorMessage: ''
                    })
                } else {
                    console.log('updateAccount ERROR', e)
                    this.setState({
                        loading: false,
                        changed: false,
                        errorMessage: translate('server_returned_error')
                    })
                }
            },
            successCallback: () => {
                this.setState({
                    loading: false,
                    changed: false,
                    errorMessage: '',
                    successMessage: translate('saved') + '!',
                })
                // remove successMessage after a while
                setTimeout(() => this.setState({successMessage: ''}), 4000)
                updateInitialValues()
            }
        })
    }

    render() {
        const {state, props} = this

        const {submitting, valid, touched} = this.state.accountSettings
        const disabled = !props.isOwnAccount || state.loading || submitting || !valid || !touched

        const {profile_image, name, about, location, website} = this.state

        const {follow, account, isOwnAccount} = this.props
        const following = follow && follow.getIn(['get_following', account.name]);
        const ignores = isOwnAccount && following && following.get('ignore_result')

        return <div className="Settings">

            {/*<div className="row">
                <div className="small-12 medium-6 large-4 columns">
                    <label>{translate('choose_language')}
                        <select defaultValue={store.get('language')} onChange={this.handleLanguageChange}>
                            <option value="en">English</option>
                            <option value="ru">Russian</option>
                            <option value="es">Spanish</option>
                            <option value="es-AR">Spanish (Argentina)</option>
                            <option value="fr">French</option>
                            <option value="it">Italian</option>
                            <option value="jp">Japanese</option>
                        </select>
                    </label>
                </div>
            </div>*/}
            {/*<div className="row">
                <div className="small-12 medium-6 large-4 columns">
                    <label>{translate('choose_currency')}
                        <select defaultValue={store.get('currency')} onChange={this.handleCurrencyChange}>
                            {
                                ALLOWED_CURRENCIES.map(i => {
                                    return <option key={i} value={i}>{i}</option>
                                })
                            }
                        </select>
                    </label>
                </div>
            </div>*/}
            <div className="row">
                <form onSubmit={this.handleSubmitForm} className="small-12 medium-6 large-4 columns">
                    <h3>{translate('profile')}</h3>
                    {/* CHOOSE LANGUAGE */}
                    <label>
                        {translate('choose_language')}
                            <select defaultValue={store.get('language')} onChange={this.handleLanguageChange}>
                                <option value="ru">Русский</option>
                                <option value="en">English</option>
                                {/* in react-intl they use 'uk' instead of 'ua' */}
                                <option value="uk">Українська</option>
                                <option value="sr">Srpski</option>
                            </select>
                    </label>
                    <div className="error"></div>
                    {/* CHOOSE CURRENCY */}
                    <label>{translate('choose_currency')}
                        <select defaultValue={store.get('currency')} onChange={this.handleCurrencyChange}>
                            {
                                ALLOWED_CURRENCIES.map(i => {
                                    return <option key={i} value={i}>{i}</option>
                                })
                            }
                        </select>
                    </label>
                    <div className="error"></div>
                    <label>
                        {translate('profile_image_url')}
                        <input type="url" {...profile_image.props} autoComplete="off" />
                    </label>
                    <div className="error">{profile_image.blur && profile_image.touched && profile_image.error}</div>

                    <label>
                        {translate('profile_name')}
                        <input type="text" {...name.props} maxLength="20" autoComplete="off" />
                    </label>
                    <div className="error">{name.touched && name.error}</div>

                    <label>
                        {translate('profile_about')}
                        <input type="text" {...about.props} maxLength="160" autoComplete="off" />
                    </label>
                    <div className="error">{about.touched && about.error}</div>

                    <label>
                        {translate('profile_location')}
                        <input type="text" {...location.props} maxLength="30" autoComplete="off" />
                    </label>
                    <div className="error">{location.touched && location.error}</div>

                    <label>
                        {translate('profile_website')}
                        <input type="url" {...website.props} maxLength="100" autoComplete="off" />
                    </label>
                    <div className="error">{website.blur && website.touched && website.error}</div>

                    {/* CHOOSE THEME */}
                    <label>{translate('choose_theme')}
                        <select defaultValue={store.get('theme')} onChange={this.handleThemeChange}>
                            {
                                ALLOWED_THEMES.map(i => {
                                    return <option key={i} value={i}>{i}</option>
                                })
                            }
                        </select>
                    </label>
                    <div className="error"></div>

                    <br />
                    {state.loading && <span><LoadingIndicator type="circle" /><br /></span>}
                    {!state.loading && <input type="submit" className="button" value={translate('update')} disabled={disabled} />}
                    {' '}{
                            state.errorMessage
                                ? <small className="error">{state.errorMessage}</small>
                                : state.successMessage
                                ? <small className="success uppercase">{state.successMessage}</small>
                                : null
                        }
                </form>
            </div>

            {isOwnAccount &&
                <div className="row">
                    <div className="small-12 medium-6 large-4 columns">
                        <br /><br />
                        <h3>{translate('content_preferences')}</h3>
                        <div>
                            {translate('not_safe_for_work')}
                        </div>
                        <select value={this.state.nsfwPref} onChange={this.onNsfwPrefChange}>
                            <option value="hide">{translate('always_hide')}</option>
                            <option value="warn">{translate('always_warn')}</option>
                            <option value="show">{translate('always_show')}</option>
                        </select>
                    </div>
                </div>}
            {ignores && ignores.size > 0 &&
                <div className="row">
                    <div className="small-12 columns">
                        <br /><br />
                        <UserList title={translate('muted_users')} account={account} users={ignores} />
                    </div>
                </div>}
                <br /><br />
        </div>
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const {accountname} = ownProps.routeParams
        const account = state.global.getIn(['accounts', accountname]).toJS()
        const current_user = state.user.get('current')
        const username = current_user ? current_user.get('username') : ''
        const metaData = account ? o2j.ifStringParseJSON(account.json_metadata) : {}
        const profile = metaData && metaData.profile ? metaData.profile : {}

        return {
            account,
            metaData,
            accountname,
            isOwnAccount: username == accountname,
            profile,
            follow: state.global.get('follow'),
            ...ownProps
        }
    },
    // mapDispatchToProps
    dispatch => ({
        changeLanguage: (language) => {
            dispatch(user.actions.changeLanguage(language))
        },
        updateAccount: ({successCallback, errorCallback, ...operation}) => {
            const options = {type: 'account_update', operation, successCallback, errorCallback}
            dispatch(transaction.actions.broadcastOperation(options))
        }
    })
)(Settings)
