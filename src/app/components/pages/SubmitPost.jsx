import React from 'react';
import { browserHistory } from 'react-router';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import { SUBMIT_FORM_ID } from 'shared/constants';

const formId = SUBMIT_FORM_ID;
const SubmitReplyEditor = ReplyEditor(formId);

function _redirect_url(operations) {
    try {
        const { category } = operations[0][0][1];
        return '/created/' + category;
    } catch (e) {
        console.error('redirect_url', e);
    }
    return '/created';
}

class SubmitPost extends React.Component {
    constructor() {
        super();
        this.success = operations => {
            localStorage.removeItem('replyEditorData-' + formId);
            browserHistory.push(_redirect_url(operations));
        };
    }
    render() {
        return (
            <SubmitReplyEditor
                type="submit_story"
                successCallback={this.success}
            />
        );
    }
}

module.exports = {
    path: 'submit.html',
    component: SubmitPost,
};
