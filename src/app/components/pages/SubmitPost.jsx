import React from 'react';
import { browserHistory } from 'react-router';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import { SUBMIT_FORM_ID } from 'shared/constants';

const formId = SUBMIT_FORM_ID;
// const richTextEditor = process.env.BROWSER ? require('react-rte-image').default : null;
// const SubmitReplyEditor = ReplyEditor(formId, richTextEditor);
const SubmitReplyEditor = ReplyEditor(formId);

class SubmitPost extends React.Component {
    // static propTypes = {
    //     routeParams: PropTypes.object.isRequired,
    // }
    constructor() {
        super();
        this.success = (/*operation*/) => {
            // const { category } = operation
            localStorage.removeItem('replyEditorData-' + formId);
            browserHistory.push('/created'); //'/category/' + category)
        };
    }
    render() {
        const { success } = this;
        return (
            <div className="SubmitPost">
                <SubmitReplyEditor
                    type="submit_story"
                    successCallback={success}
                />
            </div>
        );
    }
}

module.exports = {
    path: 'submit.html',
    component: SubmitPost, // connect(state => ({ global: state.global }))(SubmitPost)
};
