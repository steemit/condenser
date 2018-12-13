import React from 'react';
import HelpContent from 'app/components/elements/HelpContent';

class Tos extends React.Component {
    render() {
        return (
            <div className="row content-page">
                <HelpContent path="tos" title="Terms of Service" />
            </div>
        );
    }
}

module.exports = {
    component: Tos,
    path: 'tos.html',
};
