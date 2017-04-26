import React from 'react';
import HelpContent from 'app/components/elements/HelpContent';

class About extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column large-8 medium-10 small-12">
                    <HelpContent path="about"/>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'about.html',
    component: About
};
