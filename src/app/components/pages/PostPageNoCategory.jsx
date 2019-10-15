import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import SvgImage from 'app/components/elements/SvgImage';

class PostWrapper extends React.Component {
    componentWillMount() {
        const { redirectUrl, loading, author, permlink } = this.props;
        if (redirectUrl) {
            if (browserHistory) browserHistory.replace(redirectUrl);
        } else if (loading) {
            this.props.getPostHeader({ author, permlink });
        }
    }

    componentDidUpdate(prevProps) {
        const { redirectUrl } = this.props;
        if (redirectUrl && redirectUrl != prevProps.redirectUrl) {
            if (browserHistory) browserHistory.replace(redirectUrl);
        }
    }

    render() {
        return (
            <div>
                {this.props.loading ? (
                    <center>
                        <LoadingIndicator type="circle" />
                    </center>
                ) : (
                    <div className="NotFound float-center">
                        <a href="/">
                            <SvgImage name="404" width="640px" height="480px" />
                        </a>
                    </div>
                )}
            </div>
        );
    }
}

const StoreWrapped = connect(
    (state, props) => {
        // read route
        const { routeParams } = props;
        const author = routeParams.username;
        const permlink = routeParams.slug;

        // check for category
        const postref = routeParams.username + '/' + routeParams.slug;
        const category = state.global.getIn(
            ['content', postref, 'category'],
            state.global.getIn(['headers', postref, 'category'])
        );

        return {
            author,
            permlink,
            redirectUrl: category ? `/${category}/@${postref}` : null,
            loading: typeof category === 'undefined',
        };
    },
    dispatch => ({
        getPostHeader: payload =>
            dispatch(fetchDataSagaActions.getPostHeader(payload)),
    })
)(PostWrapper);

module.exports = {
    path: '/@:username/:slug',
    component: StoreWrapped,
};
