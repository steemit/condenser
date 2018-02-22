import { connect } from 'react-redux';
import * as userActions from 'app/redux/UserReducer';
import SidePanel from 'app/components/modules/SidePanel';

const mapStateToProps = (state, ownProps) => {
    return {
        visible: state.user.get('show_side_panel'),
        ...ownProps,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        showSideBar: () => dispatch(userActions.showSidePanel()),
        hideSideBar: () => dispatch(userActions.hideSidePanel()),
    };
};

const ConnectedSideBar = connect(mapStateToProps, mapDispatchToProps)(
    SidePanel
);

export default ConnectedSideBar;
