import React from 'react';
import { Link } from 'react-router';
import tt from 'counterpart';

class Witnesses extends React.Component {
    render() {
        // TODO: set witness voting URL
        return (
            <div className="Witnesses">
                <div className="row">
                    <div className="column">
                        <h2><Link to="https://steemit.com">{tt('navigation.vote_for_witnesses')}</Link></h2>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: '/~witnesses(/:witness)',
    component: Witnesses,
};
