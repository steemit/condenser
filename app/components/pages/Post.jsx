import React from 'react';
// import ReactMarkdown from 'react-markdown';
import Comment from 'app/components/cards/Comment';
import PostFull from 'app/components/cards/PostFull';
import {connect} from 'react-redux';

import {sortComments} from 'app/components/cards/Comment';
// import { Link } from 'react-router';
import FoundationDropdownMenu from 'app/components/elements/FoundationDropdownMenu';
import SvgImage from 'app/components/elements/SvgImage';
import {Set} from 'immutable'
import { translate } from 'app/Translator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';

class Post extends React.Component {

    static propTypes = {
        content: React.PropTypes.object.isRequired,
        post: React.PropTypes.string,
        routeParams: React.PropTypes.object,
        location: React.PropTypes.object,
        signup_bonus: React.PropTypes.string,
        current_user: React.PropTypes.object,
    };
    constructor() {
        super();
        this.state = {
            showNegativeComments: false
        }
        this.showSignUp = () => {
            window.location = '/enter_email';
        }
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Post')
    }

    componentDidMount() {
        if (window.location.hash.indexOf('comments') !== -1) {
            const comments_el = document.getElementById('comments');
            if (comments_el) comments_el.scrollIntoView();
        }
    }

    toggleNegativeReplies = () => {
        this.setState({
            showNegativeComments: !this.state.showNegativeComments
        });
    }

    onHideComment = () => {
        this.setState({commentHidden: true})
    }

    showAnywayClick = () => {
        this.setState({showAnyway: true})
    }

    render() {
        const {showSignUp} = this
        const {current_user, ignoring, signup_bonus, content} = this.props
        const {showNegativeComments, commentHidden, showAnyway} = this.state
        let post = this.props.post;
        if (!post) {
            const route_params = this.props.routeParams;
            post = route_params.username + '/' + route_params.slug;
        }
        const dis = content.get(post);

        if (!dis) return null;

        if(!showAnyway) {
            const {authorRepLog10, netVoteSign} = dis.get('stats').toJS()
            if(authorRepLog10 < 1 || netVoteSign < 0) {
                return (
                    <div className="Post">
                        <div className="row">
                            <div className="column">
                                <div className="PostFull">
                                    <p onClick={this.showAnywayClick}>{translate('this_post_was_hidden_due_to_low_ratings')}. <button style={{marginBottom: 0}} className="button hollow tiny float-right" onClick={this.showAnywayClick}>{translate('show')}</button></p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        }

        const replies = dis.get('replies').toJS();

        let sort_order = 'trending';
        if( this.props.location && this.props.location.query.sort )
           sort_order = this.props.location.query.sort;

        sortComments( content, replies, sort_order );
        const keep = a => {
            const c = content.get(a);
            const hide = c.getIn(['stats', 'hide'])
            let ignore = false
            if(ignoring) {
                ignore = ignoring.has(c.get('author'))
                // if(ignore) console.log(current_user && current_user.get('username'), 'is ignoring post author', c.get('author'), '\t', a)
            }
            return !hide && !ignore
        }
        const positiveComments = replies.filter(a => keep(a))
            .map(reply => (
                <Comment
                    root
                    key={post + reply}
                    content={reply}
                    cont={content}
                    sort_order={sort_order}
                    showNegativeComments={showNegativeComments}
                    onHide={this.onHideComment}
                />)
            );

        // Not the complete hidding logic, just move to the bottom, the rest hide in-place
        const negativeReplies = replies.filter(a => !keep(a));
        const stuffHidden = negativeReplies.length > 0 || commentHidden

        const negativeComments =
            negativeReplies.map(reply => (
                <Comment
                    root
                    key={post + reply}
                    content={reply}
                    cont={content}
                    sort_order={sort_order}
                    showNegativeComments
                    onHide={this.onHideComment}
                    noImage
                />)
            );

        const negativeGroup = !stuffHidden ? null :
            (<div className="hentry Comment root Comment__negative_group">
                {this.state.showNegativeComments ?
                    <p onClick={this.toggleNegativeReplies}>{translate('now_showing_comments_with_low_ratings')}: <button style={{marginBottom: 0}} className="button hollow tiny float-right" onClick={this.toggleNegativeReplies}>{translate('hide')}</button></p> :
                    <p onClick={this.toggleNegativeReplies}>{translate('comments_were_hidden_due_to_low_ratings')}. <button style={{marginBottom: 0}} className="button hollow tiny float-right" onClick={this.toggleNegativeReplies}>{translate('show')}</button></p>
                }
            </div>
        );


        let sort_orders = [ 'trending', 'votes', 'new'];
        let sort_labels = [ translate('trending'), translate('votes'), translate('new') ];
        let sort_menu = [];

        let selflink = `/${dis.get('category')}/@${post}`;
        for( let o = 0; o < sort_orders.length; ++o ){
            sort_menu.push({
                value: sort_orders[o],
                label: sort_labels[o],
                link: selflink + '?sort=' + sort_orders[o] + '#comments'
            });
        }
        const emptyPost = dis.get('created') === '1970-01-01T00:00:00' && dis.get('body') === ''
        if(emptyPost)
            return <center>
                <SvgImage name="404" width="640px" height="480px" />
            </center>

        return (
            <div className="Post">
                <div className="row">
                    <div className="column">
                        <PostFull post={post} cont={content} />
                    </div>
                </div>
                {!current_user && <div className="row">
                    <div className="column">
                        <div className="Post__promo">
                            {translate('authors_get_paid_when_people_like_you_upvote_their_post')}.
                            <br /> {// remove '$' from signup_bonus before parsing it into local currency
                                    translate('if_you_enjoyed_what_you_read_earn_amount')}
                            <br /> {translate('when_you') + ' '}
                            <a onClick={showSignUp}>{translate('when_you_link_text')}</a>
                            {' ' + translate('and_vote_for_it') + '.'}
                        </div>
                    </div>
                </div>}
                <div id="comments" className="Post_comments row hfeed">
                    <div className="column large-12">
                        <div className="Post_comments__content">
                            {positiveComments.length ?
                            (<div className="Post__comments_sort_order float-right">
                                {translate('sort_order')}: &nbsp;
                                <FoundationDropdownMenu menu={sort_menu} label={translate(sort_order)} dropdownPosition="bottom" dropdownAlignment="right" />
                            </div>) : null}
                            {positiveComments}
                            {negativeGroup}
                            {showNegativeComments && negativeComments}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const emptySet = Set()

export default connect(state => {
    const current_user = state.user.get('current')
    let ignoring
    if(current_user) {
        const key = ['follow', 'get_following', current_user.get('username'), 'ignore_result']
        ignoring = state.global.getIn(key, emptySet)
    }
    return {
        content: state.global.get('content'),
        signup_bonus: state.offchain.get('signup_bonus'),
        current_user,
        ignoring,
    }
}
)(Post);
