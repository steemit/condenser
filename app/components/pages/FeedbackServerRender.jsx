import React from 'react';
import { translate } from 'app/Translator';

class FeedbackServerRender extends React.Component {
    render() {
        return (
            <div className="text-center">
                {translate('loading')}...
            </div>
        );
    }
}

module.exports = {
    path: 'feedback',
    component: FeedbackServerRender
};
