import React from 'react';
import {connect} from 'react-redux'
import user from 'app/redux/User';
// import { translate } from 'app/Translator';
import { ALLOWED_CURRENCIES } from 'config/client_config'
import store from 'store';

class Settings extends React.Component {

    handleCurrencyChange(event) { store.set('currency', event.target.value) }

    handleLanguageChange = (event) => {
        const language = event.target.value
        store.set('language', language)
        this.props.changeLanguage(language)
    }

    render() {
        return <div className="Settings">
                    <div className="row">
                        {/* currently language chooser is completely broken */}
                        {/* <div className="small-12 medium-6 large-3 columns">
                            <label>Выберите язык
                              <select defaultValue={store.get('language')} onChange={this.handleLanguageChange}>
                                <option value="ru">русский</option>
                                <option value="en">english</option>
                              </select>
                            </label>
                        </div> */}
                        <div className="small-12 medium-6 large-3 columns">
                            {/* TODO add currencies */}
                            <label>Выберите валюту
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
                </div>
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => { return {...ownProps} },
    // mapDispatchToProps
    dispatch => ({
        changeLanguage: (language) => {
            dispatch(user.actions.changeLanguage(language))
        }
    })
)(Settings)
