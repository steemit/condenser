import React from 'react';

class Hardfork extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column large-8 medium-10 small-12">
                    <h1>Hardfork</h1>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'hardfork',
    component: Hardfork
};