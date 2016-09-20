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

function TimeAuthorCategory({post, links, authorRepLog10, gray}) {
    const author = <strong>{post.author}</strong>;

    return (
        <span className="vcard">
            <Tooltip t={new Date(post.created).toLocaleString()}>
                <span className="TimeAgo"><TimeAgoWrapper date={post.created} /></span>
            </Tooltip>
            <span> by&nbsp;
                <span itemProp="author" itemScope itemType="http://schema.org/Person">
                    {links ? <Link to={post.author_link}>{author}</Link> :
                        <strong>{author}</strong>}
                    <Reputation value={authorRepLog10} />
                </span>
            </span>
            <span> in&nbsp;{links ? <TagList post={post} /> : <strong>{post.category}</strong>}</span>
        </span>
    );
}

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

export default class PostSummary extends React.Component {
    static propTypes = {
        post: React.PropTypes.string.isRequired,
        pending_payout: React.PropTypes.string.isRequired,
        total_payout: React.PropTypes.string.isRequired,
        content: React.PropTypes.object.isRequired,
        netVoteSign: React.PropTypes.number,
        currentCategory: React.PropTypes.string,
        thumbSize: React.PropTypes.string,
        onClick: React.PropTypes.func
    };

    shouldComponentUpdate(props) {
        return props.thumbSize !== this.props.thumbSize ||
               props.pending_payout !== this.props.pending_payout ||
               props.total_payout !== this.props.total_payout;
    }

    render() {
        const {currentCategory, thumbSize, ignore, onClick} = this.props;
        const {post, content, pending_payout, total_payout} = this.props;
        if (!content) return null;

        const archived = content.get('mode') === 'archived'

        let reblogged_by = content.get('first_reblogged_by')
        if(reblogged_by) {
          reblogged_by = <div className="PostSummary__reblogged_by">
                             <Icon name="reblog" /> Resteemed by <Link to={'/@'+reblogged_by}>{reblogged_by}</Link>
                         </div>
        }

        const {gray, pictures, authorRepLog10, hasFlag} = content.get('stats', Map()).toJS()
        const p = extractContent(immutableAccessor, content);
        let desc = p.desc
        if(p.image_link)// image link is already shown in the preview
            desc = desc.replace(p.image_link, '')
        let title_link_url;
        let title_text = p.title;
        let comments_link;
        let is_comment = false;

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
        let content_title = <h1 className="entry-title">
            <a href={title_link_url} onClick={e => navigate(e, onClick, post, title_link_url)}>{title_text}</a>
        </h1>;

        if( !(currentCategory && currentCategory.match( /nsfw/ )) ) {
           if (currentCategory !== '-' && currentCategory !== p.category && p.category.match(/nsfw/) ) {
               return null;
           }
        }

        let thumb = null;
        if(pictures && p.image_link) {
          const prox = $STM_Config.img_proxy_prefix
          const size = (thumbSize == 'mobile') ? '640x480' : '128x256'
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
                <div className={hasFlag ? '' : 'PostSummary__collapse'}>
                    <div className="float-right"><Voting post={post} flag /></div>
                </div>
                {reblogged_by}
                <div className="PostSummary__header show-for-small-only">
                    {content_title}
                </div>
                <div className="PostSummary__time_author_category_small show-for-small-only">
                    <a href={title_link_url} onClick={e => navigate(e, onClick, post, title_link_url)}><TimeAuthorCategory post={p} links={false} authorRepLog10={authorRepLog10} gray={gray} /></a>
                </div>
                {thumb}
                <div className="PostSummary__content">
                    <div className="PostSummary__header show-for-medium">
                        {content_title}
                    </div>
                    {content_body}
                    <div className="PostSummary__footer">
                        <Voting post={post} showList={false} />
                        <span className="PostSummary__time_author_category show-for-medium">
                            <TimeAuthorCategory post={p} links authorRepLog10={authorRepLog10} />
                            {!archived && <Reblog author={p.author} permlink={p.permlink} />}
                        </span>
                        <VotesAndComments post={post} commentsLink={comments_link} />
                    </div>
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
        return {post, content, pending_payout, total_payout};
    },

    (dispatch) => ({
        dispatchSubmit: data => { dispatch(user.actions.usernamePasswordLogin({...data})) },
        clearError: () => { dispatch(user.actions.loginError({error: null})) }
    })
)(PostSummary)
