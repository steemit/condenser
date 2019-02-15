import React from 'react';
import { Link } from 'react-router';
import tt from 'counterpart';

class Witnesses extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column">
                    {tt('g.external_link_message')}
                    {': '}
                    <Link to={`${$STM_Config.wallet_url}/~witnesses`}>
                        {tt('navigation.vote_for_witnesses')}
                    </Link>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: '/~witnesses(/:witness)',
    component: Witnesses,
};
