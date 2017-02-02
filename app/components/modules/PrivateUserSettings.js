import React from 'react';
import {connect} from 'react-redux'
import reactForm from 'app/utils/ReactForm'

class PrivateUserSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.initForm(props);
    }

    initForm(props) {
        console.log('-- PrivateUserSettings.initForm -->', this.props.user_settings);
        reactForm({
            name: 'form',
            instance: this,
            initialValues: this.props.user_settings,
            fields: ['nsfwPref:select'],
            // validation: values => ({}),
        });
        this.handleSubmitForm = this.state.form.handleSubmit(args => this.handleSubmit(args))
    }


    handleSubmit = ({updateInitialValues, data}) => {
        console.log('data', data)
        this.props.updateUserSettings(data);
        return new Promise((resolve, reject) => {
            resolve(); updateInitialValues()
            // reject({nsfwPref: 'I see you, you are at work'})
            // reject('Connection error, try again')
        })
    }

    render() {
        const {nsfwPref, form} = this.state;
        const disabled = !form.touched || form.submitting || !form.valid;

        return <form onSubmit={this.handleSubmitForm} className="PrivateUserSettings">
            <h3>Private Settings</h3>
            <div>
                Not safe for work (NSFW) content
            </div>
            <select {...nsfwPref.props}>
                <option value="hide">Always hide</option>
                <option value="warn">Always warn</option>
                <option value="show">Always show</option>
            </select>
            {nsfwPref.error ? <div className="error">{nsfwPref.error}&nbsp;</div> : null}
            <br /><br />
            <input type="submit" className="button" value="Update" disabled={disabled} />
            {form.error ? <div className="error">{form.error}&nbsp;</div> : null}
        </form>;
    }
}

export default connect(
    (state) => {
        return {
            user_settings: state.app.get('user_settings').toJS(),
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

