import React from 'react';
import ChangePassword from 'app/components/elements/ChangePassword';

class ChangePasswordPage extends React.Component {

    render() {
        if (!process.env.BROWSER) { // don't render this page on the server
            return <div className="row">
                <div className="column">
                    Loading..
                </div>
            </div>;
        }

        return (
            <div className="ChangePasswordPage row">
                <div className="column large-7 small-10">
                    <h2>Change Password</h2>
                    <ChangePassword />
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'change_password',
    component: ChangePasswordPage
};
