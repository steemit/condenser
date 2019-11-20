import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import debounce from 'lodash.debounce';
import { search } from 'app/redux/SearchReducer';
import Callout from 'app/components/elements/Callout';
import Userpic, { SIZE_SMALL } from 'app/components/elements/Userpic';
import Icon from 'app/components/elements/Icon';
import Reputation from 'app/components/elements/Reputation';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import { extractBodySummary } from 'app/utils/ExtractContent';
import FormattedAsset from 'app/components/elements/FormattedAsset';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import ElasticSearchInput from 'app/components/elements/ElasticSearchInput';

class SearchIndex extends React.Component {
    static propTypes = {
        loading: PropTypes.bool.isRequired,
        performSearch: PropTypes.func.isRequired,
        params: PropTypes.shape({
            q: PropTypes.string,
            s: PropTypes.string,
        }).isRequired,
        scrollId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
            .isRequired,
        result: PropTypes.arrayOf(
            PropTypes.shape({
                app: PropTypes.string,
                author: PropTypes.string,
                author_rep: PropTypes.number,
                body: PropTypes.string,
                body_marked: PropTypes.string,
                category: PropTypes.string,
                children: PropTypes.number,
                created_at: PropTypes.string,
                depth: PropTypes.number,
                id: PropTypes.number,
                img_url: PropTypes.string,
                payout: PropTypes.number,
                permlink: PropTypes.string,
                title: PropTypes.string,
                title_marked: PropTypes.string,
                total_votes: PropTypes.number,
                up_votes: PropTypes.number,
            })
        ).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {};
        this.fetchMoreResults = this.fetchMoreResults.bind(this);
    }

    componentDidMount() {
        const { performSearch, params } = this.props;
        if (!params.s) {
            params.s = undefined;
        }
        if (params.q) {
            performSearch(params);
        }
        window.onscroll = debounce(() => {
            if (
                window.innerHeight + document.documentElement.scrollTop ===
                document.documentElement.offsetHeight
            ) {
                this.fetchMoreResults();
            }
        }, 300);
    }

    componentDidUpdate(prevProps) {
        const { performSearch, params } = this.props;
        if (prevProps.params !== params) {
            performSearch(params);
        }
    }

    fetchMoreResults() {
        const { params, performSearch, scrollId } = this.props;
        const updatedParams = {
            ...params,
            scroll_id: scrollId,
        };
        performSearch(updatedParams);
    }

    render() {
        const { result, loading, params, performSearch } = this.props;
        const searchResults = result.map(r => {
            const path = `/@${r.author}/${r.permlink}`;

            const summary = extractBodySummary(r.body);

            const content_body = (
                <div className="PostSummary__body entry-content">
                    <Link to={path}> {summary}</Link>
                </div>
            );
            const summary_header = (
                <div className="articles__summary-header">
                    <div className="user">
                        <div className="user__col user__col--left">
                            <a className="user__link" href={'/@' + r.author}>
                                <Userpic account={r.author} size={SIZE_SMALL} />
                            </a>
                        </div>
                        <div className="user__col user__col--right">
                            <span className="user__name">
                                <span className="Author">
                                    <span
                                        itemProp="author"
                                        itemScope
                                        itemType="http://schema.org/Person"
                                    >
                                        <strong>
                                            <Link to={'/@' + r.author}>
                                                {r.author}{' '}
                                                <Reputation
                                                    value={r.author_rep}
                                                />
                                                <Icon name="dropdown-arrow" />
                                            </Link>
                                        </strong>
                                    </span>
                                </span>
                            </span>
                            <Link className="timestamp__link" to={path}>
                                <span className="timestamp__time">
                                    <TimeAgoWrapper
                                        date={r.created_at}
                                        className="updated"
                                    />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            );

            const summary_footer = (
                <div className="articles__summary-footer">
                    <span className="Voting">
                        <span className="Voting__inner">
                            <span>
                                <FormattedAsset amount={r.payout} asset="$" />
                            </span>
                        </span>
                    </span>
                    <span className="VotesAndComments">
                        <span
                            className="VotesAndComments__votes"
                            title={tt('votesandcomments_jsx.vote_count', {
                                count: r.total_votes,
                            })}
                        >
                            <Icon size="1x" name="chevron-up-circle" />
                            &nbsp;{r.total_votes}
                        </span>
                        <span
                            className={
                                'VotesAndComments__comments' +
                                (r.children === 0 ? ' no-comments' : '')
                            }
                        >
                            <Link to={path} title={'comments'}>
                                <Icon
                                    name={
                                        r.children > 1 ? 'chatboxes' : 'chatbox'
                                    }
                                />
                                &nbsp;{r.children}
                            </Link>
                        </span>
                    </span>
                </div>
            );

            return (
                <li key={path}>
                    <div className="articles__summary">
                        {summary_header}
                        <div
                            className={
                                'articles__content hentry' +
                                (r.img_url ? ' with-image ' : ' ')
                            }
                            itemScope
                            itemType="http://schema.org/blogPost"
                        >
                            {r.img_url && (
                                <div className="articles__content-block articles__content-block--img">
                                    <Link className="articles__link" to={path}>
                                        <span className="articles__feature-img-container">
                                            <picture className="articles__feature-img">
                                                <source
                                                    srcSet={r.img_url}
                                                    media="(min-width: 1000px)"
                                                />
                                                <img srcSet={r.img_url} />
                                            </picture>
                                        </span>
                                    </Link>
                                </div>
                            )}
                            <div className="articles__content-block articles__content-block--text">
                                {r.title}
                                {content_body}
                                {summary_footer}
                            </div>
                        </div>
                    </div>
                </li>
            );
        });
        return (
            <div className={'PostsIndex row ' + 'layout-list'}>
                <article className="articles">
                    <div className="articles__header row">
                        <div className="small-12 medium-12 large-12 column">
                            <ElasticSearchInput
                                initValue={params.q}
                                expanded={true}
                                handleSubmit={q => {
                                    performSearch({ q, s: undefined });
                                }}
                            />
                        </div>
                    </div>
                    {!loading && !result.length === 0 ? (
                        <Callout>{'Nothing was found.'}</Callout>
                    ) : (
                        <div id="posts_list" className="PostsList">
                            <ul className="PostsList__summaries hfeed">
                                {searchResults}
                            </ul>
                            <div>
                                {loading && (
                                    <center>
                                        <LoadingIndicator
                                            style={{ marginBottom: '2rem' }}
                                            type="circle"
                                        />
                                    </center>
                                )}
                            </div>
                        </div>
                    )}
                </article>
            </div>
        );
    }
}

module.exports = {
    path: 'search',
    component: connect(
        (state, ownProps) => {
            const params = ownProps.location.query;
            return {
                loading: state.search.get('pending'),
                result: state.search.get('result').toJS(),
                scrollId: state.search.get('scrollId'),
                isBrowser: process.env.BROWSER,
                params,
            };
        },
        dispatch => ({
            performSearch: args => dispatch(search(args)),
        })
    )(SearchIndex),
};
