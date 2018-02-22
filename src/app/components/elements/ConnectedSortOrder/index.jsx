import { connect } from 'react-redux';
import * as userActions from 'app/redux/UserReducer';
import SortOrder from 'app/components/elements/SortOrder';
import { browserHistory } from 'react-router';

const mapStateToProps = (state, ownProps) => {
    // HACK: initState interferes with default state from reducer so use props when sort_order is not in state.
    const currentSort =
        state.user.get('sort_order') === undefined
            ? ownProps.sortOrder
            : state.user.get('sort_order');
    return {
        ...ownProps,
        currentSort,
    };
};

const mapDispatchToProps = dispatch => ({
    setSortOrder: (sort, topic) => {
        const route = topic ? `/${sort}/${topic}` : `/${sort}`;
        browserHistory.replace(route);
        dispatch(userActions.setSortOrder(sort));
    },
});

const ConnectedSortOrder = connect(mapStateToProps, mapDispatchToProps)(
    SortOrder
);

export default ConnectedSortOrder;
