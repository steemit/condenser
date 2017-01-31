import React from 'react';
import {connect} from 'react-redux'

class PrivateUserSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nsfwPref: 'hide',
            oldNsfwPref: 'hide'
        }
        this.submitUserSettings = this.submitUserSettings.bind(this);
    }

    onNsfwPrefChange(e) {
        const nsfwPref = e.currentTarget.value;
        this.setState({nsfwPref})
    }

    // onNsfwPrefSubmit(e) {
    //     this.setState({oldNsfwPref: nsfwPref})
    // }

    submitUserSettings(e) {
        e.preventDefault();
        this.props.updateUserSettings({s1: 'test1'});
    }

    render() {
        return <form onSubmit={this.submitUserSettings} className="PrivateUserSettings">
            <h3>Private Settings</h3>
            <div>
                Not safe for work (NSFW) content
            </div>
            <select value={this.state.nsfwPref} onChange={this.onNsfwPrefChange}>
                <option value="hide">Always hide</option>
                <option value="warn">Always warn</option>
                <option value="show">Always show</option>
            </select>
            <br /><br />
            <input type="submit" className="button" value="Update" disabled={this.state.nsfwPref == this.state.oldNsfwPref} />
        </form>;
    }
}

export default connect(
    (state, ownProps) => {
        return {
            user_settings: state.app.get('user_settings'),
        }
    },
    dispatch => ({
        updateUserSettings: (settings) => {
            dispatch({type: 'UPDATE_USER_SETTINGS', payload: settings});
        }
    })
)(PrivateUserSettings)

/*<div className="row">
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
 </div>*/

