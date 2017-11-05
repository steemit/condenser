import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Icon from 'app/components/elements/Icon';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import tt from 'counterpart';

class VotesAndComments extends React.Component {

    static propTypes = {
        // HTML properties
        post: React.PropTypes.string.isRequired,
        commentsLink: React.PropTypes.string.isRequired,

        // Redux connect properties
        votes: React.PropTypes.number,
        comments: React.PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'VotesAndComments');
    }

    render() {
        const {votes, comments, commentsLink} = this.props;
        let comments_tooltip = tt('votesandcomments_jsx.no_responses_yet_click_to_respond');
        if (comments > 0) comments_tooltip = tt('votesandcomments_jsx.response_count_tooltip', {count: comments});

        return (
            <span className="VotesAndComments">
                <span className="VotesAndComments__votes" title={tt('votesandcomments_jsx.vote_count', {count: votes})}>
                    <Icon size="1x" name="chevron-up-circle" />&nbsp;{votes}
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
        const post = state.getIn(['global', 'content', props.post]);
        if (!post) return props;
        return {
            ...props,
            votes: post.get('net_votes'),
            comments: post.get('children')
        };
    }
)(VotesAndComments);
