import React from 'react';
// import ReactMarkdown from 'react-markdown';
import Comment from 'app/components/cards/Comment';
import PostFull from 'app/components/cards/PostFull';
import {connect} from 'react-redux';

import {sortComments} from 'app/components/cards/Comment';
// import { Link } from 'react-router';
import FoundationDropdownMenu from 'app/components/elements/FoundationDropdownMenu';
import {Set} from 'immutable'
import tt from 'counterpart';
import { localizedCurrency } from 'app/components/elements/LocalizedCurrency';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';

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
        };
        this.showSignUp = () => {
            serverApiRecordEvent('SignUp', 'Post Promo');
            window.location = '/enter_email';
        };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Post')
    }

    componentDidMount() {
        if (window.location.hash.indexOf('comments') !== -1) {
            const comments_el = document.getElementById('comments');
            if (comments_el) comments_el.scrollIntoView();
        }
    }

    toggleNegativeReplies = (e) => {
        this.setState({
            showNegativeComments: !this.state.showNegativeComments
        });
        e.preventDefault();
    };

    onHideComment = () => {
        this.setState({commentHidden: true})
    }

    showAnywayClick = () => {
        this.setState({showAnyway: true})
    }

    render() {
        const {showSignUp} = this
        const {current_user, signup_bonus, content} = this.props
        const {showNegativeComments, commentHidden, showAnyway} = this.state
        let post = this.props.post;
        if (!post) {
            const route_params = this.props.routeParams;
            post = route_params.username + '/' + route_params.slug;
        }
        const dis = content.get(post);

        if (!dis) return null;

        if(!showAnyway) {
            const {gray} = dis.get('stats').toJS()
            if(gray) {
                return (
                    <div className="Post">
                        <div className="row">
                            <div className="column">
                                <div className="PostFull">
                                    <p onClick={this.showAnywayClick}>{tt('this_post_was_hidden_due_to_low_ratings')}.{' '}
                                    <button style={{marginBottom: 0}} className="button hollow tiny float-right" onClick={this.showAnywayClick}>{translate('show')}</button></p>
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
        const positiveComments = replies
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

        const negativeGroup = commentHidden &&
            (<div className="hentry Comment root Comment__negative_group">
                <p>
                    {tt(showNegativeComments ? 'now_showing_comments_with_low_ratings' : 'comments_were_hidden_due_to_low_ratings')}.{' '}
                    <button className="button hollow tiny float-right" onClick={e => this.toggleNegativeReplies(e)}>
                        {tt(showNegativeComments ? 'hide' :'show')}
                    </button>
                </p>
            </div>);


        let sort_orders = [ 'trending', 'votes', 'new'];
        let sort_labels = [ tt('trending'), tt('votes'), tt('age') ];
        let sort_menu = [];
        let sort_label;

        let selflink = `/${dis.get('category')}/@${post}`;
        for( let o = 0; o < sort_orders.length; ++o ){
            if(sort_orders[o] == sort_order) sort_label = sort_labels[o];
            sort_menu.push({
                value: sort_orders[o],
                label: sort_labels[o],
                link: selflink + '?sort=' + sort_orders[o] + '#comments'
            });
        }
        const emptyPost = dis.get('created') === '1970-01-01T00:00:00' && dis.get('body') === ''
        if(emptyPost)
            return <center>
                <div className="NotFound float-center">
                    <div>
                        <h4 className="NotFound__header">Sorry! This page doesn't exist.</h4>
                        <p>Not to worry. You can head back to <a style={{fontWeight: 800}} href="/">our homepage</a>,
                            or check out some great posts.
                        </p>
                        <ul className="NotFound__menu">
                            <li><a href="/created">new posts</a></li>
                            <li><a href="/hot">hot posts</a></li>
                            <li><a href="/trending">trending posts</a></li>
                            <li><a href="/promoted">promoted posts</a></li>
                            <li><a href="/active">active posts</a></li>
                        </ul>
                    </div>
                </div>
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
                            {tt('authors_get_paid_when_people_like_you_upvote_their_post')}.
                            <br /> {// remove '$' from signup_bonus before parsing it into local currency
                                    tt('if_you_enjoyed_what_you_read_earn_amount', {amount: '$'+localizedCurrency(signup_bonus.substring(1))})}
                            <br />
                            <button type="button" className="button sign-up" onClick={showSignUp}>Sign up now to receive <span className="free-money">FREE STEEM!</span></button>
                        </div>
                    </div>
                </div>}
                <div id="comments" className="Post_comments row hfeed">
                    <div className="column large-12">
                        <div className="Post_comments__content">
                            {positiveComments.length ?
                            (<div className="Post__comments_sort_order float-right">
                                {tt('sort_order')}: &nbsp;
                                <FoundationDropdownMenu menu={sort_menu} label={sort_label} dropdownPosition="bottom" dropdownAlignment="right" />
                            </div>) : null}
                            {positiveComments}
                            {negativeGroup}
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
