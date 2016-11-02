import React from 'react';
import {connect} from 'react-redux'
import user from 'app/redux/User';
import { translate } from 'app/Translator';
import { ALLOWED_CURRENCIES } from 'config/client_config'
import store from 'store';
import transaction from 'app/redux/Transaction'
import o2j from 'shared/clash/object2json'

class Settings extends React.Component {

    state = {
        userImage: '',
        loading: false
    }

    handleCurrencyChange(event) { store.set('currency', event.target.value) }

    handleLanguageChange = (event) => {
        const language = event.target.value
        store.set('language', language)
        this.props.changeLanguage(language)
    }

    handleUrlChange = event => {
        this.setState({userImage: event.target.value})
    }

    handleUserImageSubmit = event => {
        event.preventDefault()

        const {account} = this.props
        let metaData =	this.props

        this.setState({loading: false})

        console.log('this.state.userImage', this.state.userImage)
        console.log('metaData', metaData)
        if (metaData == '{created_at: \'GENESIS\'}') metaData = {created_at: "GENESIS"}
        // TODO check if this is normal in BuyGolos
        if (typeof metaData === 'string') metaData = {}
        metaData.user_image = this.state.user_image
        metaData = o2j.ifObjectToJSON(metaData)
        this.props.updateAccount({
                json_metadata: metaData,
                account: account.name,
                memo_key: account.memo_key,
                onError: () => this.setState({
                    loading: false,
                    error: 'server returned error'
                }),
                onSuccess: () => this.setState({loading: false})
        })
    }

    render() {
        return <div className="Settings">
                    <div className="row">
                        {/* currently language chooser is completely broken */}
                        <div className="small-12 medium-6 large-4 columns">
                            <label>{translate('choose_language')}
                              <select defaultValue={store.get('language')} onChange={this.handleLanguageChange}>
                                <option value="ru">русский</option>
                                <option value="en">english</option>
                                {/* in react-intl they use 'uk' instead of 'ua' */}
                                <option value="uk">українська</option>
                              </select>
                            </label>
                        </div>
                    </div>
                    <div className="row">
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
                    </div>
                    <div className="row">
                        <form onSubmit={this.handleUserImageSubmit} className="small-12 medium-6 large-4 columns">
                            <label>Добавьте юрл вашего изображения
                            {/* {translate('choose_currency')} */}
                                <input type="url" onChange={this.handleUrlChange} />
                            </label>
                        </form>
                    </div>
                </div>
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const {accountname} = 	ownProps.routeParams
        const account 		= 	state.global.getIn(['accounts', accountname]).toJS()
        const metaData 		=	account ? o2j.ifStringParseJSON(account.json_metadata) : {}
        const userImage     =   metaData ? metaData.user_image : ''

        return {
            // TODO check this
            loading: state.app.get('loading'),
            account,
            metaData,
            userImage,
            ...ownProps
        }
    },
    // mapDispatchToProps
    dispatch => ({
        changeLanguage: (language) => {
            dispatch(user.actions.changeLanguage(language))
        },
        updateAccount: (operation) => {
			const options = {type: 'account_update', operation}
			dispatch(transaction.actions.broadcastOperation(options))
        }
    })
)(Settings)
