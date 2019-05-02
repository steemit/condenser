import React from 'react';
import LoginForm from 'app/components/modules/LoginForm';
import tt from 'counterpart';

class Login extends React.Component {
    render() {
        if (!process.env.BROWSER) {
            // don't render this page on the server
            return (
                <div className="row">
                    <div className="column">{tt('g.loading')}..</div>
                </div>
            );
        }
        return (
            <div className="Login row">
                <div className="column">
                    <LoginForm afterLoginRedirectToWelcome />
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'login.html',
    component: Login,
};
