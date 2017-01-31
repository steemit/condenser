import React from 'react';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Icon from 'app/components/elements/Icon';
import { connect } from 'react-redux';
import user from 'app/redux/User';
import Reblog from 'app/components/elements/Reblog';
import Voting from 'app/components/elements/Voting';
import {immutableAccessor} from 'app/utils/Accessors';
import extractContent from 'app/utils/ExtractContent';
import { browserHistory } from 'react-router';
import VotesAndComments from 'app/components/elements/VotesAndComments';
import {authorNameAndRep} from 'app/utils/ComponentFormatters';
import {Map} from 'immutable';
import Reputation from 'app/components/elements/Reputation';
import Author from 'app/components/elements/Author';
import TagList from 'app/components/elements/TagList';
import UserNames from 'app/components/elements/UserNames';

function isLeftClickEvent(event) {
    return event.button === 0
}

function isModifiedEvent(event) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}

function navigate(e, onClick, post, url) {
    if (isModifiedEvent(e) || !isLeftClickEvent(e)) return;
    e.preventDefault();
    if (onClick) onClick(post, url);
    else browserHistory.push(url);
}

class PostSummary extends React.Component {
    static propTypes = {
        post: React.PropTypes.string.isRequired,
        pending_payout: React.PropTypes.string.isRequired,
        total_payout: React.PropTypes.string.isRequired,
        content: React.PropTypes.object.isRequired,
        currentCategory: React.PropTypes.string,
        thumbSize: React.PropTypes.string,
        nsfwPref: React.PropTypes.string,
        onClick: React.PropTypes.func
    };

    constructor() {
        super();
        this.state = {revealNsfw: false}
        this.onRevealNsfw = this.onRevealNsfw.bind(this)
    }

    shouldComponentUpdate(props, state) {
        return props.thumbSize !== this.props.thumbSize ||
               props.pending_payout !== this.props.pending_payout ||
               props.total_payout !== this.props.total_payout ||
               props.username !== this.props.username ||
               props.nsfwPref !== this.props.nsfwPref ||
               state.revealNsfw !== this.state.revealNsfw;
    }

    onRevealNsfw(e) {
        e.preventDefault();
        this.setState({revealNsfw: true})
    }

    render() {
        const {currentCategory, thumbSize, ignore, onClick} = this.props;
        const {post, content, pending_payout, total_payout} = this.props;
        const {account} = this.props;
        if (!content) return null;

        const archived = content.get('mode') === 'archived'

        let reblogged_by;
        if(content.get('reblogged_by') && content.get('reblogged_by').size > 0) {
            reblogged_by = content.get('reblogged_by').toJS()
        } else if(content.get('first_reblogged_by')) {
            // TODO: this case is backwards-compat for 0.16.1. remove after upgrading.
            reblogged_by = [content.get('first_reblogged_by')]
        }

        if(reblogged_by) {
          reblogged_by = <div className="PostSummary__reblogged_by">
                             <Icon name="reblog" /> Resteemed by <UserNames names={reblogged_by} />
                         </div>
        }

        if(account && account != content.get('author')) {
          reblogged_by = <div className="PostSummary__reblogged_by">
                             <Icon name="reblog" /> Resteemed
                         </div>
        }

        const {gray, pictures, authorRepLog10, flagWeight, isNsfw} = content.get('stats', Map()).toJS()
        const p = extractContent(immutableAccessor, content);
        let desc = p.desc
        if(p.image_link)// image link is already shown in the preview
            desc = desc.replace(p.image_link, '')
        let title_link_url;
        let title_text = p.title;
        let comments_link;
        let is_comment = false;
        let full_power = content.get('percent_steem_dollars') === 0;

        if( content.get( 'parent_author') !== "" ) {
           title_text = "Re: " + content.get('root_title');
           title_link_url = content.get( 'url' );
           comments_link = title_link_url;
           is_comment = true;
        } else {
           title_link_url = p.link;
           comments_link = p.link + '#comments';
        }

        let content_body = <div className="PostSummary__body entry-content">
            <a href={title_link_url} onClick={e => navigate(e, onClick, post, title_link_url)}>{desc}</a>
        </div>;
        let content_title = <h3 className="entry-title">
            <a href={title_link_url} onClick={e => navigate(e, onClick, post, title_link_url)}>
                {isNsfw && <span className="nsfw-flag">nsfw</span>}
                {title_text}
                {full_power && <span title="Powered Up 100%"><Icon name="steem" /></span>}
            </a>
        </h3>;

        // author and category
        let author_category = <span className="vcard">
            <a href={title_link_url} onClick={e => navigate(e, onClick, post, title_link_url)}><TimeAgoWrapper date={p.created} className="updated" /></a>
            {} by <Author author={p.author} authorRepLog10={authorRepLog10} follow={false} mute={false} />
            {} in <TagList post={p} single />
        </span>

        const content_footer = <div className="PostSummary__footer">
            <Voting post={post} showList={false} />
            <VotesAndComments post={post} commentsLink={comments_link} />
            <span className="PostSummary__time_author_category">
                {!archived && <Reblog author={p.author} permlink={p.permlink} />}
                <span className="show-for-medium">
                    {author_category}
                </span>
            </span>
        </div>

        const {nsfwPref, username} = this.props
        const {revealNsfw} = this.state

        if(isNsfw) {
            if(nsfwPref === 'hide') {
                // user wishes to hide these posts entirely
                return null;
            } else if(nsfwPref === 'warn' && !revealNsfw) {
                // user wishes to be warned, and has not revealed this post
                return (
                    <article className={'PostSummary hentry'} itemScope itemType ="http://schema.org/blogPost">
                        <div className="PostSummary__nsfw-warning">
                            <div className="PostSummary__time_author_category_small show-for-small-only">
                                {author_category}
                            </div>
                            This post is <span className="nsfw-flag">nsfw</span>.
                            You can <a href="#" onClick={this.onRevealNsfw}>reveal it</a> or{' '}
                            {username ? <span>adjust your <Link to={`/@${username}/settings`}>display preferences</Link>.</span>
                                      : <span><Link to="/enter_email">create an account</Link> to save your preferences.</span>}
                            {content_footer}
                        </div>
                    </article>
                )
            }
        }

        let thumb = null;
        if(pictures && p.image_link) {
          const prox = $STM_Config.img_proxy_prefix
          const size = (thumbSize == 'mobile') ? '640x480' : '256x512';
          const url = (prox ? prox + size + '/' : '') + p.image_link
          if(thumbSize == 'mobile') {
            thumb = <a href={p.link} onClick={e => navigate(e, onClick, post, p.link)} className="PostSummary__image-mobile"><img src={url} /></a>
          } else {
            thumb = <a href={p.link} onClick={e => navigate(e, onClick, post, p.link)} className="PostSummary__image" style={{backgroundImage: 'url(' + url + ')'}}></a>
          }
        }
        const commentClasses = []
        if(gray || ignore) commentClasses.push('downvoted') // rephide

        return (
            <article className={'PostSummary hentry' + (thumb ? ' with-image ' : ' ') + commentClasses.join(' ')} itemScope itemType ="http://schema.org/blogPost">
                <div className={flagWeight > 0 ? '' : 'PostSummary__collapse'}>
                    <div className="float-right"><Voting post={post} flag /></div>
                </div>
                {reblogged_by}
                <div className="PostSummary__header show-for-small-only">
                    {content_title}
                </div>
                <div className="PostSummary__time_author_category_small show-for-small-only">
                    {author_category}
                </div>
                {thumb}
                <div className="PostSummary__content">
                    <div className="PostSummary__header show-for-medium">
                        {content_title}
                    </div>
                    {content_body}
                    {content_footer}
                </div>
            </article>
        )
    }
}

export default connect(
    (state, props) => {
        const {post} = props;
        const content = state.global.get('content').get(post);
        let pending_payout = 0;
        let total_payout = 0;
        if (content) {
            pending_payout = content.get('pending_payout_value');
            total_payout = content.get('total_payout_value');
        }
        return {
            post, content, pending_payout, total_payout,
            username: state.user.getIn(['current', 'username']) || state.offchain.get('account')
        };
    },

    (dispatch) => ({
        dispatchSubmit: data => { dispatch(user.actions.usernamePasswordLogin({...data})) },
        clearError: () => { dispatch(user.actions.loginError({error: null})) }
    })
)(PostSummary)
