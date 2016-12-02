import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Icon from 'app/components/elements/Icon';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import { translate } from 'app/Translator';

class VotesAndComments extends React.Component {

    static propTypes = {
        // HTML properties
        post: React.PropTypes.string.isRequired,
        commentsLink: React.PropTypes.string.isRequired,

        // Redux connect properties
        votes: React.PropTypes.object,
        comments: React.PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'VotesAndComments');
    }

    render() {
        const {votes, comments, commentsLink} = this.props;
        const voters_count = votes.reduce((value, vote) => {
            return value + Math.sign(vote.get('percent'));
        }, 0);
        let comments_tooltip = translate('no_responses_yet_click_to_respond');
        if (comments > 0) comments_tooltip = `${translate('response_count', {responseCount: comments})}. ${translate('click_to_respond')}.`

        return (
            <span className="VotesAndComments">
                <span className="VotesAndComments__votes" title={translate('vote_count', {voteCount: voters_count})}>
                    <Icon name={voters_count > 1 ? 'voters' : 'voter'} />&nbsp;{voters_count}
                </span>
                <span className={'VotesAndComments__comments' + (comments === 0 ? ' no-comments' : '')}>
                     <Link to={commentsLink} title={comments_tooltip}>
                        <Icon name={comments > 1 ? 'chatboxes' : 'chatbox'} />&nbsp;{comments}
                     </Link>
                 </span>
            </span>
        );
    }
}

export default connect(
    (state, props) => {
        const post = state.global.getIn(['content', props.post]);
        if (!post) return props;
        return {
            ...props,
            votes: post.get('active_votes'),
            comments: post.get('children')
        };
    }
)(VotesAndComments);
