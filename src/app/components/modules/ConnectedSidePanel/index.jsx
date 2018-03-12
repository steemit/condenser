import { connect } from 'react-redux';
import * as userActions from 'app/redux/UserReducer';
import SidePanel from 'app/components/modules/SidePanel';

const mapStateToProps = (state, ownProps) => {
    return {
        visible: state.user.get('show_side_panel'),
        current: state.user.get('current'),
        username: state.user.getIn(['current', 'username']),
        ...ownProps,
    };
};

const mapDispatchToProps = dispatch => ({
    hideSidePanel: () => dispatch(userActions.hideSidePanel()),
});

const ConnectedSideBar = connect(mapStateToProps, mapDispatchToProps)(
    SidePanel
);

export default ConnectedSideBar;
