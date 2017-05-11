import React from 'react';
import {connect} from 'react-redux'
import user from 'app/redux/User';
import tt from 'counterpart';
import {ALLOWED_CURRENCIES, DEFAULT_LANGUAGE, LANGUAGES} from 'app/client_config'
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
        this.onNsfwPrefSubmit = this.onNsfwPrefSubmit.bind(this)
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
                profile_image: values.profile_image && !/^https?:\/\//.test(values.profile_image) ? tt('settings_jsx.invalid_url') : null,
                name: values.name && values.name.length > 20 ? tt('settings_jsx.name_is_too_long') : values.name && /^\s*@/.test(values.name) ? tt('settings_jsx.name_must_not_begin_with') : null,
                about: values.about && values.about.length > 160 ? tt('settings_jsx.about_is_too_long') : null,
                location: values.location && values.location.length > 30 ? tt('settings_jsx.location_is_too_long') : null,
                website: values.website && values.website.length > 100 ? tt('settings_jsx.website_url_is_too_long') : values.website && !/^https?:\/\//.test(values.website) ? tt('settings_jsx.invalid_url') : null,
            })
        })
        this.handleSubmitForm =
            this.state.accountSettings.handleSubmit(args => this.handleSubmit(args))
    }

    componentWillMount() {
        const {accountname} = this.props
        const nsfwPref = (process.env.BROWSER ? localStorage.getItem('nsfwPref-' + accountname) : null) || 'warn'
        this.setState({nsfwPref, oldNsfwPref: nsfwPref})
    }

    onNsfwPrefChange(e) {
        const nsfwPref = e.currentTarget.value;
        this.setState({nsfwPref: nsfwPref})
    }

    onNsfwPrefSubmit(e) {
        const {accountname} = this.props;
        const {nsfwPref} = this.state;
        localStorage.setItem('nsfwPref-'+accountname, nsfwPref)
        this.setState({oldNsfwPref: nsfwPref})
    }

    onCurrencyChange(event) {
        store.set('currency', event.target.value)
    }

    onLanguageChange = (event) => {
        const language = event.target.value
        store.set('language', language)
        this.props.changeLanguage(language)
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
                        errorMessage: tt('g.server_returned_error')
                    })
                }
            },
            successCallback: () => {
                this.setState({
                    loading: false,
                    changed: false,
                    errorMessage: '',
                    successMessage: tt('g.saved') + '!',
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

        const languageSelectBox = <select defaultValue={store.get('language')} onChange={this.onLanguageChange}>
          {Object.keys(LANGUAGES).map(key => {
            return <option key={key} value={key}>{LANGUAGES[key]}</option>
          })}
        </select>;

        return <div className="Settings">

            <div className="row">
                <form onSubmit={this.handleSubmitForm} className="small-12 medium-6 large-4 columns">
                    <h3>{tt('settings_jsx.public_profile_settings')}</h3>
                    {/* CHOOSE LANGUAGE */}
                    <label>
                        {tt('settings_jsx.choose_language')}
                        {languageSelectBox}
                    </label>
                    <div className="error"></div>
                    {/* CHOOSE CURRENCY */}
                    <label>{tt('settings_jsx.choose_currency')}
                        <select defaultValue={store.get('currency')} onChange={this.onCurrencyChange}>
                            {
                                ALLOWED_CURRENCIES.map(i => {
                                    return <option key={i} value={i}>{i}</option>
                                })
                            }
                        </select>
                    </label>
                    <div className="error"></div>
                    <label>
                        {tt('settings_jsx.profile_image_url')}
                        <input type="url" {...profile_image.props} autoComplete="off" />
                    </label>
                    <div className="error">{profile_image.blur && profile_image.touched && profile_image.error}</div>

                    <label>
                        {tt('settings_jsx.profile_name')}
                        <input type="text" {...name.props} maxLength="20" autoComplete="off" />
                    </label>
                    <div className="error">{name.touched && name.error}</div>

                    <label>
                        {tt('settings_jsx.profile_about')}
                        <input type="text" {...about.props} maxLength="160" autoComplete="off" />
                    </label>
                    <div className="error">{about.touched && about.error}</div>

                    <label>
                        {tt('settings_jsx.profile_location')}
                        <input type="text" {...location.props} maxLength="30" autoComplete="off" />
                    </label>
                    <div className="error">{location.touched && location.error}</div>

                    <label>
                        {tt('settings_jsx.profile_website')}
                        <input type="url" {...website.props} maxLength="100" autoComplete="off" />
                    </label>
                    <div className="error">{website.blur && website.touched && website.error}</div>

                    <br />
                    {state.loading && <span><LoadingIndicator type="circle" /><br /></span>}
                    {!state.loading && <input type="submit" className="button" value={tt('settings_jsx.update')} disabled={disabled} />}
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
                    <div className="small-12 columns">
                        <br /><br />
                        <h3>{tt('settings_jsx.private_post_display_settings')}</h3>
                        <div>
                            {tt('settings_jsx.not_safe_for_work_nsfw_content')}
                        </div>
                        <select value={this.state.nsfwPref} onChange={this.onNsfwPrefChange}>
                            <option value="hide">{tt('settings_jsx.always_hide')}</option>
                            <option value="warn">{tt('settings_jsx.always_warn')}</option>
                            <option value="show">{tt('settings_jsx.always_show')}</option>
                        </select>
                        <br /><br />
                        <input type="submit" onClick={this.onNsfwPrefSubmit} className="button" value={tt('settings_jsx.update')} disabled={this.state.nsfwPref == this.state.oldNsfwPref} />
                    </div>
                </div>}
            {ignores && ignores.size > 0 &&
                <div className="row">
                    <div className="small-12 columns">
                        <br /><br />
                        <UserList title={tt('settings_jsx.muted_users')} account={account} users={ignores} />
                    </div>
                </div>}
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
        let metaData = account ? o2j.ifStringParseJSON(account.json_metadata) : {}
        if (typeof metaData === 'string') metaData = o2j.ifStringParseJSON(metaData); // issue #1237
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
