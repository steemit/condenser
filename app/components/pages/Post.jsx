import React from 'react';
// import ReactMarkdown from 'react-markdown';
import Comment from 'app/components/cards/Comment';
import PostFull from 'app/components/cards/PostFull';
import {connect} from 'react-redux';
import { Link } from 'react-router';

import {sortComments} from 'app/components/cards/Comment';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import user from 'app/redux/User'
// import { Link } from 'react-router';
import FoundationDropdownMenu from 'app/components/elements/FoundationDropdownMenu';
import SvgImage from 'app/components/elements/SvgImage';
import {List} from 'immutable'

class Post extends React.Component {

    static propTypes = {
        global: React.PropTypes.object.isRequired,
        post: React.PropTypes.string,
        routeParams: React.PropTypes.object,
        location: React.PropTypes.object,
        showSignUp: React.PropTypes.func.isRequired,
        signup_bonus: React.PropTypes.string,
        current_user: React.PropTypes.object,
    };
    constructor() {
        super();
        this.state = {
            showNegativeComments: false
        }
        this.showSignUp = () => {this.props.showSignUp()}
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
        const {current_user, following, signup_bonus} = this.props
        const {showNegativeComments, commentHidden, showAnyway} = this.state
        let g = this.props.global;
        let post = this.props.post;
        if (!post) {
            const route_params = this.props.routeParams;
            post = route_params.username + '/' + route_params.slug;
        }
        const dis = g.get('content').get(post);
        if (!dis) return null;

        if(!showAnyway) {
            const {authorRepLog10, netVoteSign} = dis.get('stats').toJS()
            if(authorRepLog10 < 1 || netVoteSign < 0) {
                return (
                    <div className="Post">
                        <div className="row">
                            <div className="column">
                                <div className="PostFull">
                                    <p onClick={this.showAnywayClick}>This post was hidden due to low ratings. <button style={{marginBottom: 0}} className="button hollow tiny float-right" onClick={this.showAnywayClick}>Show</button></p>
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

        sortComments( g, replies, sort_order );
        const keep = a => {
            const c = g.getIn(['content', a])
            const hide = c.getIn(['stats', 'hide'])
            let ignore = false
            if(following) {
                ignore = following.get(c.get('author'), List()).contains('ignore')
            }
            return !hide && !ignore
        }
        const positiveComments = replies.filter(a => keep(a))
            .map(reply => <Comment root key={post + reply} content={reply} global={g}
                sort_order={sort_order} showNegativeComments={showNegativeComments} onHide={this.onHideComment} />);

        // Not the complete hidding logic, just move to the bottom, the rest hide in-place
        const negativeReplies = replies.filter(a => !keep(a));
        const stuffHidden = negativeReplies.length > 0 || commentHidden

        const negativeComments =
            negativeReplies.map(reply => <Comment root key={post + reply} content={reply} global={g} sort_order={sort_order} showNegativeComments onHide={this.onHideComment} noImage />);

        const negativeGroup = !stuffHidden ? null :
            (<div className="hentry Comment root Comment__negative_group">
                {this.state.showNegativeComments ?
                    <p onClick={this.toggleNegativeReplies}>Now showing comments with low ratings: <button style={{marginBottom: 0}} className="button hollow tiny float-right" onClick={this.toggleNegativeReplies}>Hide</button></p> :
                    <p onClick={this.toggleNegativeReplies}>Comments were hidden due to low ratings. <button style={{marginBottom: 0}} className="button hollow tiny float-right" onClick={this.toggleNegativeReplies}>Show</button></p>
                }
            </div>
        );


        let sort_orders = [ 'trending', 'active', 'created', 'updated' ];
        let sort_labels = [ 'trending', 'active', 'new', 'updated' ];
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
                        <PostFull post={post} global={g} />
                    </div>
                </div>
                {!current_user && <div className="row">
                    <div className="column">
                      <div className="Post__promo">
                          Authors get paid when people like you upvote their post. <br/>
                          If you enjoyed what you read here, earn {signup_bonus} of Steem Power <br />
                          when you <a onClick={showSignUp}>sign up</a> and vote for it.
                      </div>
                    </div>
                </div>}
                <div id="comments" className="Post_comments row hfeed">
                    <div className="column large-12">
                        <div className="Post_comments__content">
                            {positiveComments.length ?
                            (<div className="Post__comments_sort_order float-right">
                                Sort Order: &nbsp;
                                <FoundationDropdownMenu menu={sort_menu} label={sort_order} dropdownPosition="bottom" dropdownAlignment="right" />
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

export default connect(state => {
    const current_user = state.user.get('current')
    let following
    if(current_user) {
        const key = ['follow', 'get_following', current_user.get('username'), 'result']
        following = state.global.getIn(key, List())
    }
    return {
        global: state.global,
        signup_bonus: state.offchain.get('signup_bonus'),
        current_user,
        following,
    }
},
dispatch => ({
    showSignUp: () => {
        localStorage.setItem('redirect', window.location.pathname);
        dispatch(user.actions.showSignUp())
    }
})
)(Post);
