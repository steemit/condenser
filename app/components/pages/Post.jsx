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
import { translate } from 'app/Translator';
import { localizedCurrency } from 'app/components/elements/LocalizedCurrency';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';

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
                    <p onClick={this.toggleNegativeReplies}>{translate('now_showing_comments_with_low_ratings')}: <button style={{marginBottom: 0}} className="button hollow tiny float-right" onClick={this.toggleNegativeReplies}>{translate('hide')}</button></p> :
                    <p onClick={this.toggleNegativeReplies}>{translate('comments_were_hidden_due_to_low_ratings')}. <button style={{marginBottom: 0}} className="button hollow tiny float-right" onClick={this.toggleNegativeReplies}>{translate('show')}</button></p>
                }
            </div>
        );


        let sort_orders = [ 'trending', 'active', 'created', 'updated' ];
        // https://github.com/GolosChain/tulupchik/issues/27
        // возможно решение здесь. Вставить функцию translate к каждому из элементов
        // проверить пока возможности нет, поэтому добавляю лишь коммент
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
                            {translate('authors_get_paid_when_people_like_you_upvote_their_post')}.
                            <br /> {// remove '$' from signup_bonus before parsing it into local currency
                                    translate('if_you_enjoyed_what_you_read_earn_amount', {amount: localizedCurrency(signup_bonus.substring(1))})}
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
