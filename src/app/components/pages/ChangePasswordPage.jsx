import React from 'react';
import ChangePassword from 'app/components/elements/ChangePassword';
import tt from 'counterpart';

class ChangePasswordPage extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column">
                    <ChangePassword />
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'change_password',
    component: ChangePasswordPage,
};
