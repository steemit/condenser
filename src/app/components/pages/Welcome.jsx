import React from 'react';
import HelpContent from 'app/components/elements/HelpContent';

class Welcome extends React.Component {
    render() {
        return (
            <div className="row content-page">
                <HelpContent path="welcome" />
            </div>
        );
    }
}

module.exports = {
    path: 'welcome',
    component: Welcome,
};
