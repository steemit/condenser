import React from 'react';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Icon from 'app/components/elements/Icon';
import { connect } from 'react-redux';
import user from 'app/redux/User';
import Reblog from 'app/components/elements/Reblog';
import Voting from 'app/components/elements/Voting';
import Tooltip from 'app/components/elements/Tooltip';
import {immutableAccessor} from 'app/utils/Accessors';
import extractContent from 'app/utils/ExtractContent';
import { browserHistory } from 'react-router';
import VotesAndComments from 'app/components/elements/VotesAndComments';
import TagList from 'app/components/elements/TagList';
import {authorNameAndRep} from 'app/utils/ComponentFormatters';
import {Map} from 'immutable';
import Reputation from 'app/components/elements/Reputation';
import Author from 'app/components/elements/Author';
import UserNames from 'app/components/elements/UserNames';
import tt from 'counterpart';
import { APP_ICON } from 'app/client_config';
import { detransliterate } from 'app/utils/ParsersAndFormatters';


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
        onClick: React.PropTypes.func,
        visited: React.PropTypes.bool
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
               state.revealNsfw !== this.state.revealNsfw ||
               props.visited !== this.props.visited;
    }

    onRevealNsfw(e) {
        e.preventDefault();
        this.setState({revealNsfw: true})
    }

    render() {
        const {currentCategory, thumbSize, ignore, onClick} = this.props;
        const {post, content, pending_payout, total_payout, cashout_time} = this.props;
        const {account} = this.props;
        if (!content) return null;

        const archived = content.get('cashout_time') === '1969-12-31T23:59:59' // TODO: audit after HF17. #1259

        let reblogged_by;
        if(content.get('reblogged_by') && content.get('reblogged_by').size > 0) {
            reblogged_by = content.get('reblogged_by').toJS()
        } else if(content.get('first_reblogged_by')) {
            // TODO: this case is backwards-compat for 0.16.1. remove after upgrading.
            reblogged_by = [content.get('first_reblogged_by')]
        }

        if(reblogged_by) {
          reblogged_by = <div className="PostSummary__reblogged_by">
                             <Icon name="reblog" /> {tt('postsummary_jsx.resteemed_by')} <UserNames names={reblogged_by} />
                         </div>
        }

        if(account && account != content.get('author')) {
          reblogged_by = <div className="PostSummary__reblogged_by">
                             <Icon name="reblog" /> {tt('postsummary_jsx.resteemed')}
                         </div>
        }

        const {gray, pictures, authorRepLog10, flagWeight, isNsfw} = content.get('stats', Map()).toJS()
        const p = extractContent(immutableAccessor, content);
        const nsfwTags = ['nsfw', 'ru--mat', '18+']
        let nsfwTitle = nsfwTags[0]
        let currentNsfw = []
        if (isNsfw && p.json_metadata && p.json_metadata.tags)
            currentNsfw = p.json_metadata.tags.filter(function(n) { return nsfwTags.indexOf(n) >= 0 })
        if (currentNsfw && currentNsfw.length)
            nsfwTitle = currentNsfw[0]
        let desc = p.desc
        if(p.image_link)// image link is already shown in the preview
            desc = desc.replace(p.image_link, '')
        let title_link_url;
        let title_text = p.title;
        let comments_link;
        let is_comment = false;
        let full_power = content.get('percent_steem_dollars') === 0;

        if( content.get( 'parent_author') !== "" ) {
           title_text = tt('g.re') + ": " + content.get('root_title');
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
                {isNsfw && <span className="nsfw-flag">{detransliterate(nsfwTitle)}</span>}
                {title_text}
                {full_power && <span title={tt('g.powered_up_100')}><Icon name={APP_ICON} /></span>}
            </a>
        </h3>;

        // author and category
        let author_category = <span className="vcard">
            <a href={title_link_url} onClick={e => navigate(e, onClick, post, title_link_url)}><TimeAgoWrapper date={p.created} className="updated" /></a>
            {} {tt('g.by')} <Author author={p.author} authorRepLog10={authorRepLog10} follow={false} mute={false} />
            {} {tt('g.in')} <TagList post={p} single />
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
                            tt('postsummary_jsx.this_post_is') <span className="nsfw-flag">{detransliterate(nsfwTitle)}</span>.
                            tt('postsummary_jsx.you_can') <a href="#" onClick={this.onRevealNsfw}>tt('postsummary_jsx.reveal_it')</a> {tt('g.or') + ' '}
                            {username ? <span>{tt('postsummary_jsx.adjust_your')} <Link to={`/@${username}/settings`}>{tt('postsummary_jsx.display_preferences')}</Link>.</span>
                                      : <span><Link to="/enter_email">{tt('postsummary_jsx.create_an_account')}</Link> {tt('postsummary_jsx.to_save_your_preferences')}.</span>}
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
          const visitedClassName = this.props.visited ? 'PostSummary__image-visited ' : '';
          if(thumbSize == 'mobile') {
            thumb = <a href={p.link} onClick={e => navigate(e, onClick, post, p.link)} className={'PostSummary__image-mobile ' + visitedClassName}><img src={url} /></a>
          } else {
            thumb = <a href={p.link} onClick={e => navigate(e, onClick, post, p.link)} className={'PostSummary__image ' + visitedClassName} style={{backgroundImage: 'url(' + url + ')'}}></a>
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
