import React from 'react';
import { translate } from 'app/Translator';

function validatePassword(value, new_password) {
    if (!new_password) return '';
    const length = 32;
    return value && value.length < length ? translate('password_must_be_characters_or_more', {amount: length}) : '';
}

export default class PasswordInput extends React.Component {

    static propTypes = {
        inputNewPassword: React.PropTypes.bool,
        inputConfirmPassword: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        onChange: React.PropTypes.func.isRequired,
        passwordLabel: React.PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        const passwd = {value: '', error: ''};
        this.state = {
            oldPassword: passwd,
            newPassword: passwd,
            confirmPassword: passwd
        };
        this.oldPasswordChange = this.oldPasswordChange.bind(this);
        this.newPasswordChange = this.newPasswordChange.bind(this);
        this.confirmPasswordChange = this.confirmPasswordChange.bind(this);
    }

    validatePasswords(oldPassword, newPassword, confirmPassword) {
        let valid = oldPassword.value.length > 0 && oldPassword.error === '';
        if (this.props.inputNewPassword) {
            valid = valid && newPassword.value.length > 0 && newPassword.error === '';
        }
        if (this.props.inputConfirmPassword) {
            valid = valid && confirmPassword.value === newPassword.value;
        }
        return valid;
    }

    onChange(value) {
        let {oldPassword, newPassword, confirmPassword} = this.state;
        if (value.oldPassword) oldPassword = value.oldPassword;
        if (value.newPassword) newPassword = value.newPassword;
        if (value.confirmPassword) confirmPassword = value.confirmPassword;
        const res = {
            oldPassword: oldPassword.value,
            newPassword: newPassword.value,
            confirmPassword: confirmPassword.value
        };
        res.valid = this.validatePasswords(oldPassword, newPassword, confirmPassword);
        this.props.onChange(res);
    }

    oldPasswordChange(e) {
        const value = e.target.value.trim();
        const error = validatePassword(value, false);
        const res = {oldPassword: {value, error}};
        this.setState(res);
        this.onChange(res);
    }

    newPasswordChange(e) {
        const value = e.target.value.trim();
        const error = validatePassword(value, true);
        const res = {newPassword: {value, error}};
        if (value !== this.state.confirmPassword.value) {
            res.confirmPassword = this.state.confirmPassword;
            res.confirmPassword.error = translate('passwords_do_not_match');
        }
        this.setState(res);
        this.onChange(res);
    }

    confirmPasswordChange(e) {
        const value = e.target.value.trim();
        let error = '';
        if (value !== this.state.newPassword.value) error = translate('passwords_do_not_match');
        const res = {confirmPassword: {value, error}};
        this.setState(res);
        this.onChange(res);
    }

    render() {
        const {inputNewPassword, inputConfirmPassword, disabled, passwordLabel} = this.props;
        const {oldPassword, newPassword, confirmPassword} = this.state;
        return (
            <div className="PasswordInput">
                <div><label>{passwordLabel}
                    <input type="password" name="oldPassword" autoComplete="off" onChange={this.oldPasswordChange} value={oldPassword.value} disabled={disabled} />
                    </label><div className="error">{oldPassword.error}</div>
                </div>
                {inputNewPassword && <div>
                    <label>{translate('new_password')}
                        <input type="password" name="oldPassword" autoComplete="off" onChange={this.newPasswordChange} value={newPassword.value} disabled={disabled} />
                    </label>
                    <div className="error">{newPassword.error}</div>
                </div>}
                {inputNewPassword && inputConfirmPassword && <div>
                    <label>{translate('confirm_password')}
                        <input type="password" name="confirmPassword" autoComplete="off" onChange={this.confirmPasswordChange} value={confirmPassword.value} disabled={disabled} />
                    </label>
                    <div className="error">{confirmPassword.error}</div>
                </div>}
            </div>
        );
    }
}
