import React from 'react';
import {connect} from 'react-redux'
import user from 'app/redux/User';
import {translate} from 'app/Translator';
import {ALLOWED_CURRENCIES} from 'config/client_config'
import store from 'store';
import transaction from 'app/redux/Transaction'
import o2j from 'shared/clash/object2json'

class Settings extends React.Component {

    state = {
        errorMessage: '',
        succesMessage: '',
        userImage: this.props.userImage || '',
        changed: false
    }

    handleCurrencyChange(event) { store.set('currency', event.target.value) }

    handleLanguageChange = (event) => {
        const language = event.target.value
        store.set('language', language)
        this.props.changeLanguage(language)
    }

    handleUrlChange = event => {
        this.setState({userImage: event.target.value, changed: true})
    }

    handleUserImageSubmit = event => {
        event.preventDefault()
        this.setState({loading: true})

        const {account, updateAccount} = this.props
        let {metaData} = this.props

        if (!metaData) metaData = {}
        if (metaData == '{created_at: \'GENESIS\'}') metaData = {created_at: "GENESIS"}
        metaData.user_image = this.state.userImage
        metaData = JSON.stringify(metaData);

        updateAccount({
            json_metadata: metaData,
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
                    succesMessage: translate('saved') + '!',
                })
                // remove succesMessage after a while
                setTimeout(() => this.setState({succesMessage: ''}), 2000)
            }
        })
    }

    render() {
        const {state, props} = this
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
                <form onSubmit={this.handleUserImageSubmit} className="small-12 medium-6 large-4 columns">
                    <label>{translate('add_image_url')}
                        <input type="url" onChange={this.handleUrlChange} value={state.userImage} disabled={!props.isOwnAccount || state.loading} required />
                        {
                            state.errorMessage
                                ? <small className="error">{state.errorMessage}</small>
                                : state.succesMessage
                                ? <small className="success text-uppercase">{state.succesMessage}</small>
                                : null
                        }
                    </label>
                    <br />
                    <input type="submit" className="button" value="Update" disabled={!state.userImage || !state.changed} />
                </form>
            </div>
        </div>
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const {accountname} =    ownProps.routeParams
        const account = state.global.getIn(['accounts', accountname]).toJS()
        const current_user = state.user.get('current')
        const username = current_user ? current_user.get('username') : ''
        const metaData = account ? o2j.ifStringParseJSON(account.json_metadata) : {}
        const userImage = metaData ? metaData.user_image : ''

        return {
            account,
            metaData,
            userImage,
            isOwnAccount: username == accountname,
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
