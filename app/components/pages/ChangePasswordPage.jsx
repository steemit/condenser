import React from 'react';
import ChangePassword from '@elements/ChangePassword';
import tt from 'counterpart';

class ChangePasswordPage extends React.Component {

    render() {
        if (!process.env.BROWSER) { // don't render this page on the server
            return <div className="row">
                <div className="column">
                    {tt('g.loading')}...
                </div>
            </div>;
        }

        return (
            <div className="ChangePasswordPage row">
                <div className="column large-7 small-10">
                    <h2>{tt('g.change_password')}</h2>
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
