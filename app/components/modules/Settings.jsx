import React from 'react';
import {connect} from 'react-redux'
import user from 'app/redux/User';
import g from 'app/redux/GlobalReducer';
import tt from 'counterpart';
import { CURRENCIES, DEFAULT_CURRENCY, CURRENCY_COOKIE_KEY, LANGUAGES, DEFAULT_LANGUAGE, LOCALE_COOKIE_KEY, THEMES, DEFAULT_THEME, USER_GENDER, FRACTION_DIGITS, FRACTION_DIGITS_MARKET, MIN_VESTING_SHARES } from 'app/client_config'
import transaction from 'app/redux/Transaction'
import o2j from 'shared/clash/object2json'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import Userpic from 'app/components/elements/Userpic';
import reactForm from 'app/utils/ReactForm'
import UserList from 'app/components/elements/UserList';
import cookie from "react-cookie";
import Dropzone from 'react-dropzone'

class Settings extends React.Component {

    constructor(props) {
        super()
        this.initForm(props)
        this.onNsfwPrefChange = this.onNsfwPrefChange.bind(this)
        this.onNsfwPrefSubmit = this.onNsfwPrefSubmit.bind(this)
        this.onRoundingNumbersChange = this.onRoundingNumbersChange.bind(this)
    }

    state = {
        errorMessage: '',
        successMessage: '',
        pImageUploading: false,
        cImageUploading: false,
    }

    initForm(props) {
        reactForm({
            instance: this,
            name: 'accountSettings',
            fields: ['profile_image', 'cover_image', 'name', 'gender', 'about', 'location', 'website'],
            initialValues: props.profile,
            validation: values => ({
                profile_image: values.profile_image && !/^https?:\/\//.test(values.profile_image) ? tt('settings_jsx.invalid_url') : null,
                cover_image: values.cover_image && !/^https?:\/\//.test(values.cover_image) ? tt('settings_jsx.invalid_url') : null,
                name: values.name && values.name.length > 20 ? tt('settings_jsx.name_is_too_long') : values.name && /^\s*@/.test(values.name) ? tt('settings_jsx.name_must_not_begin_with') : null,
                gender: values.gender && values.gender.length > 20 ? tt('settings_jsx.name_is_too_long') : values.gender && /^\s*@/.test(values.gender) ? tt('settings_jsx.name_must_not_begin_with') : null,
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
        const {vesting_shares} = this.props.account
        
        let rounding, nsfwPref;

        nsfwPref = (process.env.BROWSER ? localStorage.getItem('nsfwPref-' + accountname) : null) || 'warn'
        this.setState({nsfwPref, oldNsfwPref: nsfwPref})

        if(process.env.BROWSER){
            rounding = localStorage.getItem('xchange.rounding')
            if(!rounding){
                if(vesting_shares > MIN_VESTING_SHARES)
                    rounding = FRACTION_DIGITS
                else 
                    rounding = FRACTION_DIGITS_MARKET
              }
            this.setState({rounding : rounding})
        }
    }

    onDrop = (acceptedFiles, rejectedFiles) => {
      if(!acceptedFiles.length) {
        if(rejectedFiles.length) {
        this.setState({progress: {error: tt('reply_editor.please_insert_only_image_files')}})
        console.log('onDrop Rejected files: ', rejectedFiles);
      }
      return
      }
      const file = acceptedFiles[0]
      this.upload(file, file.name)
    }


    // fixme remove all the code duplication below

    onDropCover = (acceptedFiles, rejectedFiles) => {
    if(!acceptedFiles.length) {
      if(rejectedFiles.length) {
        this.setState({progress: {error: tt('reply_editor.please_insert_only_image_files')}})
        console.log('onDrop Rejected files: ', rejectedFiles);
      }
      return
    }
    const file = acceptedFiles[0]
    this.uploadCover(file, file.name)
  }

    onOpenClick = () => {
      this.dropzone.open();
    }

    onOpenCoverClick = () => {
      this.dropzoneCover.open();
    }

    upload = (file, name = '') => {
      const {notify} = this.props;
      const {uploadImage} = this.props
      this.setState({pImageUploading: true})
      uploadImage(file, progress => {
        if(progress.url) {
          const {profile_image: {props: {onChange}}} = this.state;
          // ok. change input url
          onChange(progress.url)
        }
        if(progress.error) {
          // error
          const { error } = progress;
          // show error notification
          notify(error, 10000)
        }
        this.setState({pImageUploading: false})
      })
    }

    uploadCover = (file, name = '') => {
      const {notify} = this.props;
      const {uploadImage} = this.props
      this.setState({cImageUploading: true})
      uploadImage(file, progress => {
        if(progress.url) {
          const {cover_image: {props: {onChange}}} = this.state;
          // ok. change input url
          onChange(progress.url)
        }
        if(progress.error) {
          // error
          const { error } = progress;
          // show error notification
          notify(error, 10000)
        }
      this.setState({cImageUploading: false})
      })
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

    notify = () => {
        this.props.notify(tt('g.saved'))
    }

    onCurrencyChange = (event) => {
        localStorage.setItem('xchange.created', 0);
        localStorage.setItem('xchange.picked', event.target.value);
        this.props.reloadExchangeRates()
        this.notify()
    }

    onRoundingNumbersChange = (event) => {
        localStorage.setItem('xchange.rounding', event.target.value)
        this.setState({rounding : event.target.value})
        this.notify()
    }

    onLanguageChange = (event) => {
        const language = event.target.value
        cookie.save(LOCALE_COOKIE_KEY, language, {path: "/", expires: new Date(Date.now() + 60 * 60 * 24 * 365 * 10 * 1000)});
        localStorage.setItem('language', language)
        this.props.changeLanguage(language)
        this.notify()
    }

    onThemeChange = (event) => {
        const theme = event.target.value
        localStorage.setItem('theme', theme)
        this.props.changeTheme(theme)
        this.notify()
    }

    handleSubmit = ({updateInitialValues}) => {
        let {metaData} = this.props
        if (!metaData) metaData = {}

        //fix https://github.com/GolosChain/tolstoy/issues/450
        if (typeof metaData === 'string' && metaData.localeCompare("{created_at: 'GENESIS'}") == 0) {
            metaData = {}
            metaData.created_at = 'GENESIS'
        }

        if(!metaData.profile) metaData.profile = {}
        delete metaData.user_image; // old field... cleanup

        const {profile_image, cover_image, name, gender, about, location, website} = this.state

        // Update relevant fields
        metaData.profile.profile_image = profile_image.value
        metaData.profile.cover_image = cover_image.value
        metaData.profile.name = name.value
        metaData.profile.gender = gender.value
        metaData.profile.about = about.value
        metaData.profile.location = location.value
        metaData.profile.website = website.value

        // Remove empty keys
        if(!metaData.profile.profile_image) delete metaData.profile.profile_image;
        if(!metaData.profile.cover_image) delete metaData.profile.cover_image;
        if(!metaData.profile.name) delete metaData.profile.name;
        if(!metaData.profile.gender) delete metaData.profile.gender;
        if(!metaData.profile.about) delete metaData.profile.about;
        if(!metaData.profile.location) delete metaData.profile.location;
        if(!metaData.profile.website) delete metaData.profile.website;

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

        const {profile_image, cover_image, name, about, gender, location, website, rounding} = this.state

        const {follow, account, isOwnAccount} = this.props
        const following = follow && follow.getIn(['getFollowingAsync', account.name]);
        const ignores = isOwnAccount && following && following.get('ignore_result')

        const {pImageUploading, cImageUploading} = this.state;

        const languageSelectBox = <select defaultValue={process.env.BROWSER ? cookie.load(LOCALE_COOKIE_KEY) : DEFAULT_LANGUAGE} onChange={this.onLanguageChange}>
          {Object.keys(LANGUAGES).map(key => {
            return <option key={key} value={key}>{LANGUAGES[key]}</option>
          })}
        </select>;

        const themeSelectBox = <select defaultValue={process.env.BROWSER ? localStorage.getItem('theme') : DEFAULT_THEME} onChange={this.onThemeChange}>
            {THEMES.map(i => {
                return <option key={i} value={i}>{i}</option>
            })}
        </select>;

        const selectorStyle = pImageUploading ?
          {
            whiteSpace: `nowrap`,
            display: `flex`,
            alignItems: `center`,
            padding: `0 6px`,
            pointerEvents: `none`,
            cursor: `default`,
            opacity: `0.6`
          } :
          {
            display: `flex`,
            alignItems: `center`,
            padding: `0 6px`
          };

          const selectorStyleCover = cImageUploading ?
            {
              whiteSpace: `nowrap`,
              display: `flex`,
              alignItems: `center`,
              padding: `0 6px`,
              pointerEvents: `none`,
              cursor: `default`,
              opacity: `0.6`
            } :
            {
              display: `flex`,
              alignItems: `center`,
              padding: `0 6px`
            };
        
        return <div className="Settings">

            <div className="row">
                <form onSubmit={this.handleSubmitForm} className="small-12 medium-8 large-6 columns">
                    <h3>{tt('settings_jsx.public_profile_settings')}</h3>

                    <label>
                        {tt('settings_jsx.choose_language')}
                        {languageSelectBox}
                    </label>
                    <div className="error"></div>

                    <label>{tt('settings_jsx.choose_currency')}
                        <select defaultValue={process.env.BROWSER ? localStorage.getItem('xchange.picked') : DEFAULT_CURRENCY} onChange={this.onCurrencyChange}>
                            {CURRENCIES.map(i => {
                                    return <option key={i} value={i}>{i}</option>
                                })
                            }
                        </select>
                    </label>

                    <label>{tt('settings_jsx.rounding_numbers.info_message')}
                        <select defaultValue={process.env.BROWSER ? rounding : FRACTION_DIGITS} onChange={this.onRoundingNumbersChange}>
                            <option value="0">{tt('settings_jsx.rounding_numbers.integer')}</option>
                            <option value="1">{tt('settings_jsx.rounding_numbers.one_decimal')}</option>
                            <option value="2">{tt('settings_jsx.rounding_numbers.two_decimal')}</option>
                            <option value="3">{tt('settings_jsx.rounding_numbers.three_decimal')}</option>
                        </select>
                    </label>

                    <label>
                        {tt('settings_jsx.choose_theme')}
                        {themeSelectBox}
                    </label>
                    <div className="error"></div>

                    <label>
                        {tt('settings_jsx.profile_image_url')}
                        <div style={{display: `flex`, alignItems: `stretch`, alignContent: `stretch`}}>
                          <Dropzone style={{width: `100%`}}
                                    onDrop={this.onDrop}
                                    className={'none'}
                                    disableClick multiple={false} accept="image/*"
                                    ref={(node) => { this.dropzone = node; }}>
                              <input ref={(r) => this.pImageUrlInput = r}
                                     type="url" {...profile_image.props}
                                     autoComplete="off"
                                     disabled={pImageUploading}
                              />
                          </Dropzone>
                          <a onClick={this.onOpenClick}
                             style={selectorStyle}>
                                {pImageUploading ? `${tt(`user_saga_js.imageUpload.uploading`)} ...` : tt(`g.upload`)}
                          </a>
                        </div>
                    </label>
                    <div className="error">{profile_image.blur && profile_image.touched && profile_image.error}</div>

                    <label>
                    {tt('settings_jsx.cover_image_url')}
                    <div style={{display: `flex`, alignItems: `stretch`, alignContent: `stretch`}}>
                      <Dropzone style={{width: `100%`}}
                                onDrop={this.onDropCover}
                                className={'none'}
                                disableClick multiple={false} accept="image/*"
                                ref={(node) => { this.dropzoneCover = node; }}>
                        <input ref={(r) => this.pCoverImageUrlInput = r}
                               type="url" {...cover_image.props}
                               autoComplete="off"
                               disabled={cImageUploading}
                        />
                      </Dropzone>
                      <a onClick={this.onOpenCoverClick}
                         style={selectorStyleCover}>
                        {cImageUploading ? `${tt(`user_saga_js.imageUpload.uploading`)} ...` : tt(`g.upload`)}
                      </a>
                    </div>
                  </label>

                    {/*<label>*/}
                        {/*{tt('settings_jsx.cover_image_url')}*/}
                        {/*<input type="url" {...cover_image.props} autoComplete="off" />*/}
                    {/*</label>*/}

                    <div className="error">{cover_image.blur && cover_image.touched && cover_image.error}</div>

                    <label>
                        {tt('settings_jsx.profile_name')}
                        <input type="text" {...name.props} maxLength="20" autoComplete="off" />
                    </label>
                    <div className="error">{name.touched && name.error}</div>

                    <label>
                        {tt('settings_jsx.profile_gender.title')}
                        <select {...gender.props}>
                            {USER_GENDER.map(i => {
                                return <option key={i} value={i}>{tt('settings_jsx.profile_gender.genders.' + i)}</option>
                                })
                            }
                        </select>
                    </label>
                    <div className="error">{gender.touched && gender.error}</div>

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
                    <div className="small-12 medium-8 large-6 columns">
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
                        <input
                            type="submit"
                            onClick={this.onNsfwPrefSubmit}
                            className="button"
                            value={tt('settings_jsx.update')}
                            disabled={this.state.nsfwPref == this.state.oldNsfwPref}
                        />
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
        uploadImage: (file, progress) => {
        dispatch({
          type: 'user/UPLOAD_IMAGE',
          payload: {file, progress},
        })
      },
        changeLanguage: (language) => {
            dispatch(user.actions.changeLanguage(language))
        },
        reloadExchangeRates: () => {
          dispatch(g.actions.fetchExchangeRates())
        },
        changeTheme: (theme) => {
            dispatch(user.actions.changeTheme(theme))
        },
        updateAccount: ({successCallback, errorCallback, ...operation}) => {
            const options = {type: 'account_update', operation, successCallback, errorCallback}
            dispatch(transaction.actions.broadcastOperation(options))
        },
        notify: (message, dismiss = 3000) => {
            dispatch({type: 'ADD_NOTIFICATION', payload: {
                key: "settings_" + Date.now(),
                message,
                dismissAfter: dismiss}
            });
        }
    })
)(Settings)
