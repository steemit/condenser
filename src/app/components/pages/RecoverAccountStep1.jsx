import React from 'react';
import tt from 'counterpart';
import { APP_DOMAIN, APP_NAME } from 'app/client_config';
import { Link } from 'react-router';

class RecoverAccountStep1 extends React.Component {
    render() {
        return (
            <div className="RestoreAccount">
                <div className="row">
                    <div className="column large-4">
                        <h2>{tt('navigation.stolen_account_recovery')}</h2>
                        <p>
                            {tt(
                                'recoveraccountstep1_jsx.recover_account_intro',
                                { APP_URL: APP_DOMAIN, APP_NAME }
                            )}
                        </p>

                        <p>
                            {tt('g.external_link_message')}
                            {': '}
                            <Link
                                to={`${
                                    $STM_Config.wallet_url
                                }/recover_account_step_1`}
                            >
                                {tt('navigation.stolen_account_recovery')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'recover_account_step_1',
    component: RecoverAccountStep1,
};
