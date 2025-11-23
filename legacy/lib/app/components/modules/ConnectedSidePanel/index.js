'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _reactRedux = require('react-redux');

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _SidePanel = require('app/components/modules/SidePanel');

var _SidePanel2 = _interopRequireDefault(_SidePanel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapStateToProps = function mapStateToProps(state, ownProps) {
    return (0, _extends3.default)({
        visible: state.user.get('show_side_panel'),
        current: state.user.get('current'),
        username: state.user.getIn(['current', 'username'])
    }, ownProps);
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        hideSidePanel: function hideSidePanel() {
            return dispatch(userActions.hideSidePanel());
        },
        showSidePanel: function showSidePanel() {
            return dispatch(userActions.showSidePanel());
        }
    };
};

var ConnectedSideBar = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_SidePanel2.default);

exports.default = ConnectedSideBar;