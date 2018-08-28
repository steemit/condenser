import { connect } from 'react-redux';
import PostsList from './PostsList';
import { favoritesLoadNextPageAction } from 'src/app/redux/actions/favorites';
import { fetchCurrentStateAction } from 'src/app/redux/actions/fetch';

export default connect(
    state => {
        const { isLoading, isPageLoading, showList } = state.data.favorites;

        const layout = state.ui.profile && state.ui.profile.get('layout') || 'list';

        return {
            isFavorite: true,
            layout,
            isLoading: isLoading || isPageLoading,
            posts: showList,
        };
    },
    dispatch => ({
        loadMore() {
            dispatch(favoritesLoadNextPageAction());
        },
        loadContent(permLink) {
            return new Promise((resolve, reject) => {
                const [author, permlink] = permLink.split('/');

                dispatch({
                    type: 'GET_CONTENT',
                    payload: {
                        author,
                        permlink,
                        resolve,
                        reject,
                    },
                });
            });
        },
        fetchState() {
            dispatch(fetchCurrentStateAction());
        },
    })
)(PostsList);
