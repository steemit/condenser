import React from 'react';
import { browserHistory } from 'react-router';
import ReplyEditor from 'app/components/elements/ReplyEditor'
import {linkBuilder} from 'app/Routes';

const formId = 'submitStory';
// const richTextEditor = process.env.BROWSER ? require('react-rte-image').default : null;
// const SubmitReplyEditor = ReplyEditor(formId, richTextEditor);
const SubmitReplyEditor = ReplyEditor(formId);

class SubmitPost extends React.Component {
    // static propTypes = {
    //     routeParams: React.PropTypes.object.isRequired,
    // }
    constructor() {
        super()
        this.success = (/*operation*/) => {
            // const { category } = operation
            localStorage.removeItem('replyEditorData-' + formId)
            browserHistory.push(linkBuilder.indexPage('all', 'created'))
        }
    }
    render() {
        const {success} = this
        return (
            <div className="SubmitPost">
               <SubmitReplyEditor type="submit_story" successCallback={success} />
            </div>
        );
    }
}

module.exports = {
    path: '/c/submit',
    component: SubmitPost // connect(state => ({ global: state.global }))(SubmitPost)
};
