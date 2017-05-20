import React from 'react';
import { translate } from 'app/Translator';
import { SUPPORT_EMAIL } from 'config/client_config';

class Support extends React.Component {
    render() {
        return (
            <div className="row">
                <div>
                    <h2>{translate('APP_NAME_support')}</h2>
                    <p>
                        {translate('please_email_questions_to')} <a href={'mailto:' + SUPPORT_EMAIL}>{SUPPORT_EMAIL}</a>.
                    </p>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'support.html',
    component: Support
};
