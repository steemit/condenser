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
    depositSteem: username => {
        const new_window = window.open();
        new_window.opener = null;
        new_window.location =
            username !== undefined
                ? 'https://blocktrades.us/?input_coin_type=eth&output_coin_type=steem&receive_address=' +
                  username
                : 'https://blocktrades.us/?input_coin_type=eth&output_coin_type=steem';
    },
});

const ConnectedSideBar = connect(mapStateToProps, mapDispatchToProps)(
    SidePanel
);

export default ConnectedSideBar;
