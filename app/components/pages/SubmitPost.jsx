import React from 'react';
// import {connect} from 'react-redux';
import { browserHistory } from 'react-router';
import MediumEditor from 'app/components/elements/MediumEditor'

const formId = 'submitStory'
const SubmitReplyEditor = MediumEditor(formId)

class SubmitPost extends React.Component {
    // static propTypes = {
    //     routeParams: React.PropTypes.object.isRequired,
    // }
    constructor() {
        super()
        this.success = (/*operation*/) => {
            // const { category } = operation
            localStorage.removeItem('replyEditorData-' + formId)
            browserHistory.push('/created')//'/category/' + category)
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
    path: 'submit.html',
    component: SubmitPost // connect(state => ({ global: state.global }))(SubmitPost)
};
