import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import { SUBMIT_FORM_ID } from 'shared/constants';
import Callout from 'app/components/elements/Callout';
import { AccessLocalStorage } from 'app/utils/AccessLocalStorage';

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
            AccessLocalStorage(() => {
                localStorage.removeItem('replyEditorData-' + formId);
            });
            browserHistory.push(_redirect_url(operations));
        };
    }
    render() {
        if (!this.props.username) {
            return <Callout>Log in to make a post.</Callout>;
        }

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
    component: connect((state, ownProps) => ({
        username: state.user.getIn(['current', 'username']),
    }))(SubmitPost),
};
