import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import {
    search,
    searchReset,
    searchDepth,
    searchSort,
    searchUser,
    searchTotal,
} from 'app/redux/SearchReducer';
import Callout from 'app/components/elements/Callout';
import ElasticSearchInput from 'app/components/elements/ElasticSearchInput';
import SearchTabs from 'app/components/elements/SearchTabs';
import PostsList from 'app/components/cards/PostsList';
import PostsIndexLayout from 'app/components/pages/PostsIndexLayout';
import { List, Map, fromJS } from 'immutable';
import { emit } from 'app/utils/emit';

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
        const {
            searchReset,
            performSearch,
            params,
            searchDepth,
            searchSort,
            searchUser,
        } = this.props;
        if (!params.s) {
            params.s = undefined;
        }
        if (params.q) {
            searchDepth(0);
            searchSort('created_at');
            performSearch({ ...params, depth: 0, sort: 'created_at' });
        }
        // searchUser()
        emit.on('query_change', query => {
            if (params.q !== query) {
                //console.log('query_change', query)
                params.q = query;
                searchReset();
                if (query.trim() === '') return;
                performSearch({
                    ...params,
                    depth: this.props.depth,
                    sort: this.props.sort,
                });
            }
        }); //监听搜索文本改变事件
    }

    componentDidUpdate(prevProps, prevState) {
        //console.log('componentDidUpdate')
    }

    componentWillUnmount() {
        const { searchReset, searchDepth, searchSort } = this.props;

        searchReset();
        searchDepth(0);
        searchSort('created_at');
        emit.removeAllListeners();
    }

    getQueryString = name => {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        let url = window.location.search.split('?')[1] || '';
        var r = url.match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };

    fetchMoreResults() {
        const { params, performSearch, scrollId, depth, sort } = this.props;
        performSearch({ ...params, scroll_id: scrollId, depth, sort });
    }

    render() {
        const {
            result,
            loading,
            params,
            performSearch,
            searchReset,
            depth,
            searchDepth,
            sort,
            searchSort,
            total_result,
        } = this.props;

        const searchResults = (
            <PostsList
                ref="list"
                posts={fromJS(result)}
                loading={loading}
                loadMore={this.fetchMoreResults}
                query={params.q}
                depth={depth}
                total_result={total_result}
            />
        );

        return (
            <PostsIndexLayout
                category={null}
                enableAds={false}
                blogmode={false}
            >
                <div className={'PostsIndex row ' + 'layout-list'}>
                    <article className="articles">
                        <div className="articles__header row search-diplay">
                            <div className="small-12 medium-12 large-12 column">
                                <ElasticSearchInput
                                    initValue={params.q}
                                    expanded
                                    handleSubmit={q => {
                                        searchReset();
                                        if (q.trim() === '') return;
                                        performSearch({
                                            q,
                                            s: undefined,
                                            depth,
                                            sort,
                                        });
                                    }}
                                    redirect
                                />
                            </div>
                        </div>
                        <SearchTabs
                            params={params}
                            depth={depth}
                            searchDepth={searchDepth}
                            sort={sort}
                            searchSort={searchSort}
                            handleTabChange={params => {
                                searchReset();
                                if (
                                    !params ||
                                    !params.q ||
                                    params.q.trim() === ''
                                )
                                    return;
                                performSearch(params);
                            }}
                        />
                        {!loading && result.length === 0 ? (
                            <Callout>{'Nothing was found.'}</Callout>
                        ) : (
                            searchResults
                        )}
                    </article>
                </div>
            </PostsIndexLayout>
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
                depth: state.search.get('depth'),
                sort: state.search.get('sort'),
                total_result: state.search.get('total_result'),
                params,
            };
        },
        dispatch => ({
            performSearch: args => dispatch(search(args)),
            searchReset: args => dispatch(searchReset(args)),
            searchDepth: args => dispatch(searchDepth(args)),
            searchSort: args => dispatch(searchSort(args)),
            searchUser: args => dispatch(searchUser(args)),
            searchTotal: args => dispatch(searchTotal(args)),
        })
    )(SearchIndex),
};
