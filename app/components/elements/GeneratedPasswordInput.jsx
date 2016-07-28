import React from 'react';
import {key_utils} from 'shared/ecc'

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
            generatedPassword: 'P' + key_utils.get_random_key().toWif(),
            confirmPassword: '',
            confirmPasswordError: '',
            confirmCheckboxes: {box1: false, box2: false},
        };
        this.confirmPasswordChange = this.confirmPasswordChange.bind(this);
        this.confirmCheckChange = this.confirmCheckChange.bind(this);
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
        if (confirmPassword && confirmPassword !== generatedPassword) confirmPasswordError = 'Passwords do not match';
        this.setState({confirmPassword, confirmPasswordError});
        this.props.onChange(confirmPassword, confirmPassword && confirmPassword === generatedPassword && allChecked(confirmCheckboxes));
    }

    render() {
        const {disabled, showPasswordString} = this.props;
        const {generatedPassword, confirmPassword, confirmPasswordError, confirmCheckboxes} = this.state;
        return (
            <div className="GeneratedPasswordInput">
                <div className="GeneratedPasswordInput__field">
                    <label>GENERATED PASSWORD<br />
                        <code className="GeneratedPasswordInput__generated_password">{showPasswordString ? generatedPassword : '-'}</code>
                        <center><span style={{fontWeight: 'bold'}}>Back it up by storing in your password manager or a text file</span></center>
                    </label>
                </div>
                <div className="GeneratedPasswordInput__field">
                    <label>RE-ENTER GENERATED PASSWORD
                        <input type="password" name="confirmPassword" autoComplete="off" onChange={this.confirmPasswordChange} value={confirmPassword} disabled={disabled} />
                    </label>
                    <div className="error">{confirmPasswordError}</div>
                </div>
                <div className="GeneratedPasswordInput__checkboxes">
                    <label><input type="checkbox" name="box1" onChange={this.confirmCheckChange} checked={confirmCheckboxes.box1} />
                        I understand that Steemit cannot recover lost passwords.
                    </label>
                    <label><input type="checkbox" name="box2" onChange={this.confirmCheckChange} checked={confirmCheckboxes.box2} />
                        I have securely saved my generated password.
                    </label>
                </div>
            </div>
        );
    }
}
