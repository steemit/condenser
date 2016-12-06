import React from 'react';
import { translate } from 'app/Translator';

const email_regex = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;

export default class AddToWaitingList extends React.Component {
    constructor() {
        super();
        this.state = {email: '', submitted: false, email_error: ''};
        this.onEmailChange = this.onEmailChange.bind(this);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const email = this.state.email;
        if (!email) return;
        fetch('/api/v1/update_email', {
            method: 'post',
            mode: 'no-cors',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({csrf: $STM_csrf, email})
        }).then(r => r.json()).then(res => {
            if (res.error || res.status !== 'ok') {
                console.error('CreateAccount server error', res.error);
            } else {
                // TODO: process errors
            }
            this.setState({submitted: true});
        }).catch(error => {
            console.error('Caught CreateAccount server error', error);
            this.setState({submitted: true});
        });
    };

    onEmailChange(e) {
        const email = e.target.value.trim().toLowerCase();
        let email_error = '';
        if (!email_regex.test(email.toLowerCase())) email_error = translate('not_valid_email');
        this.setState({email, email_error});
    }

    render() {
        const {email, email_error, submitted} = this.state;
        if (submitted) {
            return <div className="callout success">
                {translate('thank_you_for_being_an_early_visitor_to_APP_NAME')}
            </div>
        }
        return <form onSubmit={this.onSubmit}>
            <div>
                <label>{translate('email')}
                    <input ref="email" type="text" name="name" autoComplete="off" value={email} onChange={this.onEmailChange} />
                </label>
                <p className="error">{email_error}</p>
            </div>
            <br />
            <input type="submit" className="button secondary" value="Submit" />
        </form>;
    }
}
