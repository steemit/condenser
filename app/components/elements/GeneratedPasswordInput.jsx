import React from 'react';
import { translate } from 'app/Translator';
import {key_utils} from 'steem/lib/auth/ecc';

function allChecked(confirmCheckboxes) {
    return confirmCheckboxes.box1 && confirmCheckboxes.box2;
}

export default class GeneratedPasswordInput extends React.Component {

    static propTypes = {
        disabled: React.PropTypes.bool,
        onChange: React.PropTypes.func.isRequired,
        showPasswordString: React.PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            generatedPassword: props.showPasswordString ? 'P' + key_utils.get_random_key().toWif() : null, // Only generate a password if it should be shown already here
            confirmPassword: '',
            confirmPasswordError: '',
            confirmCheckboxes: {box1: false, box2: false},
        };
        this.confirmPasswordChange = this.confirmPasswordChange.bind(this);
        this.confirmCheckChange = this.confirmCheckChange.bind(this);
    }

    componentWillReceiveProps(np) {
        /*
        * By delaying the password generation until the user enters an account
        * name (making showPasswordString = true), we allow more time for
        * entropy collection via the App.jsx mousemove event listener
        */
        if (!this.state.generatedPassword && np.showPasswordString) {
            this.setState({
                generatedPassword: 'P' + key_utils.get_random_key().toWif()
            });
        }
    }

    confirmCheckChange(e) {
        const confirmCheckboxes = this.state.confirmCheckboxes;
        confirmCheckboxes[e.target.name] = e.target.checked;
        this.setState({confirmCheckboxes});
        const {confirmPassword, generatedPassword} = this.state;
        this.props.onChange(confirmPassword, confirmPassword && confirmPassword === generatedPassword && allChecked(confirmCheckboxes));
    }

    confirmPasswordChange(e) {
        const confirmPassword = e.target.value.trim();
        const {generatedPassword, confirmCheckboxes} = this.state;
        let confirmPasswordError = '';
        if (confirmPassword && confirmPassword !== generatedPassword) confirmPasswordError = translate('passwords_do_not_match');
        this.setState({confirmPassword, confirmPasswordError});
        this.props.onChange(confirmPassword, confirmPassword && confirmPassword === generatedPassword && allChecked(confirmCheckboxes));
    }

    render() {
        const {disabled, showPasswordString} = this.props;
        const {generatedPassword, confirmPassword, confirmPasswordError, confirmCheckboxes} = this.state;
        return (
            <div className="GeneratedPasswordInput">
                <div className="GeneratedPasswordInput__field">
                    <label className="uppercase">{translate('generated_password')}<br />
                        <code className="GeneratedPasswordInput__generated_password">{showPasswordString ? generatedPassword : '-'}</code>
                        <div className="GeneratedPasswordInput__backup_text">
                            {showPasswordString ? translate('backup_password_by_storing_it') : translate('enter_account_show_password')}
                        </div>
                    </label>
                </div>
                <div className="GeneratedPasswordInput__field">
                    <label className="uppercase">
                        {translate('re_enter_generate_password')}
                        <input type="password" name="confirmPassword" autoComplete="off" onChange={this.confirmPasswordChange} value={confirmPassword} disabled={disabled} />
                    </label>
                    <div className="error">{confirmPasswordError}</div>
                </div>
                <div className="GeneratedPasswordInput__checkboxes">
                    <label><input type="checkbox" name="box1" onChange={this.confirmCheckChange} checked={confirmCheckboxes.box1} />
                        {translate('understand_that_APP_NAME_cannot_recover_password')}.
                    </label>
                    <label><input type="checkbox" name="box2" onChange={this.confirmCheckChange} checked={confirmCheckboxes.box2} />
                        {translate('i_saved_password')}.
                    </label>
                </div>
            </div>
        );
    }
}
