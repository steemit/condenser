import React from 'react';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Icon from 'app/components/elements/Icon';
import { connect } from 'react-redux';
import user from 'app/redux/User';
import Voting from 'app/components/elements/Voting';
import Tooltip from 'app/components/elements/Tooltip';
import {immutableAccessor} from 'app/utils/Accessors';
import extractContent from 'app/utils/ExtractContent';
import { browserHistory } from 'react-router';
import VotesAndComments from 'app/components/elements/VotesAndComments';
import TagList from 'app/components/elements/TagList';
import {List} from 'immutable';
import {Long} from 'bytebuffer'

function TimeAuthorCategory({post, links}) {
    return (
        <span className="vcard">
            <Tooltip t={new Date(post.created).toLocaleString()}>
                <span className="TimeAgo"><TimeAgoWrapper date={post.created} /></span>
            </Tooltip>
            <span> by&nbsp;<span itemProp="author" itemScope itemType="http://schema.org/Person">
                    {links ? <Link to={post.author_link}>{post.author}</Link> : <strong>{post.author}</strong>}
            </span>
            </span>
            <span> in&nbsp;{links ? <TagList post={post} /> : <strong>{post.category}</strong>}</span>
        </span>
    );
}

export default class PostSummary extends React.Component {
    static propTypes = {
        post: React.PropTypes.string.isRequired,
        pending_payout: React.PropTypes.string.isRequired,
        total_payout: React.PropTypes.string.isRequired,
        content: React.PropTypes.object.isRequired,
        currentCategory: React.PropTypes.string,
        thumbSize: React.PropTypes.string,
    };

    shouldComponentUpdate(props) {
        return props.thumbSize !== this.props.thumbSize ||
               props.pending_payout !== this.props.pending_payout ||
               props.total_payout !== this.props.total_payout;
    }

    render() {
        const {currentCategory, thumbSize} = this.props;
        const {post, content, pending_payout, total_payout, cashout_time, ignore, netVoteSign} = this.props;
        if (!content) return null;
        const p = extractContent(immutableAccessor, content);
        let desc = p.desc
        if(p.image_link)// image link is already shown in the preview
            desc = desc.replace(p.image_link, '')
        let title_link;
        let title_text = p.title;
        let comments_link;
        let is_comment = false;

        if( content.get( 'parent_author') !== "" ) {
           title_text = "Re: " + content.get('root_title');
           title_link = content.get( 'url' );
           comments_link = title_link;
           is_comment = true;
        } else {
           title_link = p.link;
           comments_link = p.link + '#comments';
        }

        const title_link_url = title_link;
        if (p.external_link && p.desc_complete && !is_comment) {
            const domain = p.external_link.match(/:\/\/(www\.)?([\.\d\w-]+)/);
            title_link = <span>
                <a target="_blank" href={p.external_link}><Icon name="extlink" /></a>&nbsp;
                <Link to={title_link}>{title_text}</Link>&nbsp;
                <span className="domain">{domain ? domain[2] : ''}</span>
            </span>
        } else {
            title_link = <Link to={title_link}>{title_text}</Link>;
        }

        if(p.net_rshares < 0) desc = "";

        let content_body = <div className="PostSummary__body entry-content" onClick={() => browserHistory.push(title_link_url)}>{desc}</div>;
        let content_title = <h1 className="entry-title">{title_link}</h1>;

        if( !currentCategory || (currentCategory && !currentCategory.match( /nsfw/ )) )
        {
           if (currentCategory !== '-' && currentCategory !== p.category && p.category.match(/nsfw/) ) {
               return null;
           }
        }

        let thumb = null;
        if(p.net_rshares >= 0 && p.image_link) {
          const prox = $STM_Config.img_proxy_prefix
          //const size = (thumbSize == 'mobile') ? '640x640' : '120x240'
          const size = '0x0' // until scaling resolved
          const url = (prox ? prox + size + '/' : '') + p.image_link
          if(thumbSize == 'mobile') {
            thumb = <Link to={p.link} className="PostSummary__image-mobile"><img src={url} /></Link>
          } else {
            thumb = <Link to={p.link} className="PostSummary__image" style={{backgroundImage: 'url(' + url + ')'}}></Link>
          }
        }
        const commentClasses = []
        if(ignore) commentClasses.push('downvoted')
        return (
            <article className={'PostSummary hentry' + (thumb ? ' with-image ' : ' ') + commentClasses.join(' ')} itemScope itemType ="http://schema.org/blogPost">
                <div className="float-right"><Voting post={post} flag /></div>
                <div className="PostSummary__header show-for-small-only">
                    {content_title}
                </div>
                <div className="PostSummary__time_author_category_small show-for-small-only">
                    <Link to={title_link_url}><TimeAuthorCategory post={p} links={false} /></Link>
                </div>
                {thumb}
                <div className="PostSummary__content">
                    <div className="PostSummary__header show-for-medium">
                        {content_title}
                    </div>
                    {content_body}
                    <div className="PostSummary__footer">
                        <Voting post={post} pending_payout={pending_payout} total_payout={total_payout} showList={false} cashout_time={cashout_time} />
                        <span className="PostSummary__time_author_category show-for-medium">
                            <TimeAuthorCategory post={p} links />
                        </span>
                        <VotesAndComments post={post} commentsLink={comments_link} />
                    </div>
                </div>
            </article>
        )
    }
}
import {parsePayoutAmount} from 'app/utils/ParsersAndFormatters';

export default connect(
    (state, props) => {
        const post = props.post;
        const content = state.global.get('content').get(post);
        let pending_payout = 0;
        let total_payout = 0;
        let cashout_time = null;
        let votes = Long.ZERO
        if (content) {
            pending_payout = content.get('pending_payout_value');
            total_payout = content.get('total_payout_value');
            cashout_time = content.get('cashout_time');
            content.get('active_votes').forEach(v => {
                votes = votes.add(Long.fromString('' + v.get('rshares')))
            })
        }
        const netVoteSign = votes.compare(Long.ZERO)
        const hasPayout = parsePayoutAmount(pending_payout) > 0.02 || parsePayoutAmount(total_payout) > 0.02
        const current = state.user.get('current')
        const username = current ? current.get('username') : null
        const ignore = !hasPayout && username ? state.global.getIn(['follow', 'get_following', username, 'result', content.get('author')], List()).contains('ignore') : false
        return {post, content, pending_payout, total_payout, cashout_time, ignore, netVoteSign};
    },

    (dispatch) => ({
        dispatchSubmit: data => { dispatch(user.actions.usernamePasswordLogin({...data})) },
        clearError: () => { dispatch(user.actions.loginError({error: null})) }
    })
)(PostSummary)
