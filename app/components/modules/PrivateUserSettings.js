import React from 'react';
import {connect} from 'react-redux'
import reactForm from 'app/utils/ReactForm'

const emailRegex = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;

class PrivateUserSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.initForm(props);
    }

    initForm() {
        reactForm({
            name: 'form',
            instance: this,
            initialValues: this.props.user_settings,
            fields: ['email', 'nsfwPref:select'],
            validation: values => ({
                email: !values.email || !emailRegex.test(values.email) ? 'Invalid Email' : null,
            }),
        });
        this.handleSubmitForm = this.state.form.handleSubmit(args => this.handleSubmit(args))
    }


    handleSubmit = ({data}) => {
        console.log('data', data)
        this.props.updateUserSettings(data);
        return true
        // return new Promise((resolve, reject) => {
        //     resolve(true);
        //     // reject({nsfwPref: 'I see you, you are at work'})
        //     // reject('Connection error, try again')
        // })
    }

    render() {
        const {email, nsfwPref, form} = this.state;
        const disabled = !form.touched || form.submitting || !form.valid;

        return <form onSubmit={this.handleSubmitForm} className="PrivateUserSettings">
            <h3>Private Settings</h3>
            <label>
                Email
                <input type="email" {...email.props} placeholder="name@example.com" />
            </label>
            {email.touched && email.error ? <div className="error help-text">{email.touched && email.error}</div>
                : <div className="help-text">Maybe used to notify about account password changes</div>}
            <label>
                NSFW content
                <select {...nsfwPref.props}>
                    <option value="hide">Always hide</option>
                    <option value="warn">Always warn</option>
                    <option value="show">Always show</option>
                </select>
            </label>
            {nsfwPref.error ? <div className="error">{nsfwPref.error}&nbsp;</div> : null}
            <br />
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

