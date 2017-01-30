import React from 'react';
import { translate } from 'app/Translator';

class SubmitPostServerRender extends React.Component {
    render() {
        return (
            <div className="text-center">
                {translate('loading')}...
            </div>
        );
    }
}

module.exports = {
    path: 'submit.html',
    component: SubmitPostServerRender
};
