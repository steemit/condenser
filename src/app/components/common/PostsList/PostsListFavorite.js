import { connect } from 'react-redux';
import PostsList from './PostsList';

export default connect(
    state => {
        const { isLoading, list } = state.data.favorite;

        const layout = state.ui.profile && state.ui.profile.get('layout') || 'list';

        return {
            isFavorite: true,
            layout,
            isLoading,
            posts: list,
        };
    },
    dispatch => ({
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
    })
)(PostsList);
