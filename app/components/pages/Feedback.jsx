import React from 'react';
import { browserHistory } from 'react-router';
import ReplyEditor from 'app/components/elements/ReplyEditor'

const formId = 'feedback'
const SubmitReplyEditor = ReplyEditor(formId)

class Feedback extends React.Component {
    constructor() {
        super()
        this.success = () => {
            localStorage.removeItem('replyEditorData-' + formId)
            browserHistory.push('/created/ru--obratnaya-svyazx')
        }
        this.error = err => console.error(err)
    }
    render() {
        const {success, error} = this
        return (
            <div className="SubmitPost">
               <SubmitReplyEditor type="submit_story" successCallback={success} errorCallback={error} category="обратная-связь" categoryDisabled />
            </div>
        );
    }
}

module.exports = {
    path: 'feedback',
    component: Feedback
};
