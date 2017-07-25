import React from 'react';
import ChangePassword from 'app/components/elements/ChangePassword';
import { translate } from 'app/Translator';

class ChangePasswordPage extends React.Component {

    render() {
        if (!process.env.BROWSER) { // don't render this page on the server
            return <div className="row">
                <div className="column">
                    {translate('loading')}..
                </div>
            </div>;
        }

        return (
            <div className="ChangePasswordPage row">
                <div className="column large-7 small-10">
                    <h2>{translate('change_password')}</h2>
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
