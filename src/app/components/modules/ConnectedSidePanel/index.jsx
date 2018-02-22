import { connect } from 'react-redux';
import * as userActions from 'app/redux/UserReducer';
import SidePanel from 'app/components/modules/SidePanel';

const mapStateToProps = (state, ownProps) => {
    return {
        ...ownProps,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        showSideBar: () => dispatch(showSideBar),
        hideSideBar: () => dispatch(hideSideBar),
    };
};

const ConnectedSideBar = connect(mapStateToProps, mapDispatchToProps)(
    SidePanel
);

export default ConnectedSideBar;
