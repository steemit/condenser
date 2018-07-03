import React from 'react';
import { browserHistory } from 'react-router';
import PostFormLoader from 'app/components/modules/PostForm/loader';
import ReplyEditor from 'app/components/elements/ReplyEditor';

class SubmitPost extends React.PureComponent {
    constructor(props) {
        super(props);

        this.SubmitReplyEditor = ReplyEditor('submitStory');
    }

    componentWillMount() {
        document.body.classList.add('submit-page');
    }

    componentWillUnmount() {
        document.body.classList.remove('submit-page');
    }

    render() {
        const { query } = this.props.location;

        if (window.IS_MOBILE) {
            return (
                <div className="SubmitPost">
                    <this.SubmitReplyEditor
                        type={query.type || 'submit_story'}
                        successCallback={this._onSuccess}
                    />
                </div>
            );
        } else {
            return <PostFormLoader onSuccess={this._onSuccess} />;
        }
    }

    _onSuccess = () => {
        browserHistory.push('/created');
    };
}

module.exports = {
    path: 'submit',
    component: SubmitPost,
};
