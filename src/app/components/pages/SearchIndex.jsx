import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import debounce from 'lodash.debounce';
import { search } from 'app/redux/SearchReducer';
import Callout from 'app/components/elements/Callout';
import ElasticSearchInput from 'app/components/elements/ElasticSearchInput';
import PostsList from 'app/components/cards/PostsList';
import { List, Map, fromJS } from 'immutable';

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

        const normalize = post => {
            post.created = post.created_at;
            post.author_reputation = post.author_rep;
            post.stats = { total_votes: post.total_votes };
            return fromJS(post);
        };

        const searchResults = (
            <PostsList
                ref="list"
                post_objects={result.map(normalize)}
                loading={loading}
                loadMore={null}
            />
        );

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
                        searchResults
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
