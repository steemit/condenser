import { connect } from 'react-redux';
import PostsList from './PostsList';

export default connect(
    (state, props) => ({
        globalStatus: state.global.get('status'),
        layout: state.ui.profile && state.ui.profile.get('layout') || 'list',
        posts: state.global.getIn(['accounts', props.pageAccountName, props.category]),
    }),
    dispatch => ({
        loadMore(params) {
            dispatch({ type: 'REQUEST_DATA', payload: params });
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
    })
)(PostsList);
