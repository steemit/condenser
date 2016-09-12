import React from 'react';
import { translate } from 'app/Translator';

class Support extends React.Component {
    render() {
        return (
            <div className="row">
                <div>
                    <h2>{translate('APP_NAME_support')}</h2>
                    <p>
                        {translate('please_email_questions_to')} <a href="mailto:support@steemit.com">support@steemit.com</a>.
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
