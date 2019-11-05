import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import { search } from 'app/redux/SearchReducer';
import Callout from 'app/components/elements/Callout';
import Userpic, { SIZE_SMALL } from 'app/components/elements/Userpic';
import Icon from 'app/components/elements/Icon';
import Reputation from 'app/components/elements/Reputation';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import { extractBodySummary } from 'app/utils/ExtractContent';

class SearchIndex extends React.Component {
    static propTypes = {
        loading: PropTypes.bool.isRequired,
        performSearch: PropTypes.func.isRequired,
        params: PropTypes.shape({
            order: PropTypes.string,
            category: PropTypes.string,
        }).isRequired,
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
                tags: PropTypes.arrayOf(PropTypes.string),
                title: PropTypes.string,
                title_marked: PropTypes.string,
                total_votes: PropTypes.number,
                up_votes: PropTypes.number,
            })
        ).isRequired, // TODO: Proptype for search result shape.
    };

    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        const { performSearch, params } = this.props;
        performSearch(params);
    }

    render() {
        const { result, loading, params } = this.props;

        const page_title = tt('g.all_tags');

        const layoutClass = 'layout-list';

        const searchResults = result.map(r => {
            const id = `${r.author}/${r.permlink}`;

            const summary = extractBodySummary(r.body);
            const content_body = (
                <div className="PostSummary__body entry-content">
                    <Link to={id}>{summary}</Link>
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
                            <Link className="timestamp__link" to={'/notsure'}>
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

            return (
                <li key={id}>
                    <div className="articles__summary">
                        {summary_header}
                        <div
                            className={
                                'articles__content hentry' +
                                (r.image_url ? ' with-image ' : ' ')
                            }
                            itemScope
                            itemType="http://schema.org/blogPost"
                        >
                            <div className="articles__content-block articles__content-block--img">
                                <Link
                                    className="articles__link"
                                    to={'SORTTHISOUT!'}
                                >
                                    ww{' '}
                                    <img
                                        className="articles__feature-img"
                                        src={r.img_url}
                                    />;
                                </Link>
                            </div>
                            <div className="articles__content-block articles__content-block--text">
                                {r.title}
                                {content_body}
                                {/*this.props.blogmode ? null : summary_footer*/}
                            </div>
                        </div>
                    </div>
                </li>
            );
        });
        return (
            <div
                className={
                    'SearchIndex row' +
                    (loading ? ' fetching' : '') +
                    layoutClass
                }
            >
                <article className="articles">
                    <div className="articles__header row">
                        <div className="small-8 medium-7 large-8 column">
                            <h1 className="articles__h1 show-for-mq-large articles__h1--no-wrap">
                                {page_title}
                            </h1>
                            <div className="show-for-mq-large">
                                <div
                                    style={{
                                        fontSize: '80%',
                                        color: 'gray',
                                    }}
                                >
                                    Search Results
                                </div>
                            </div>
                        </div>
                        <div className="small-4 medium-4 large-3 column hide-for-largeX articles__header-select">
                            {/*TODO: SortOrder component for search can go here*/}
                        </div>
                    </div>
                    <hr className="articles__hr" />
                    {!loading && !result.length === 0 ? (
                        <Callout>{'Nothing was found.'}</Callout>
                    ) : (
                        <div>{searchResults}</div>
                    )}
                </article>
            </div>
        );
    }
}

module.exports = {
    path: 'search(/:order)(/:category)',
    component: connect(
        (state, ownProps) => {
            return {
                loading: state.search.get('pending'),
                result: state.search.get('result').toJS(),
                isBrowser: process.env.BROWSER,
                params: ownProps.routeParams,
            };
        },
        dispatch => ({
            performSearch: args => dispatch(search(args)),
        })
    )(SearchIndex),
};
