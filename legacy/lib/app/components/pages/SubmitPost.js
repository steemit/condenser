'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactRouter = require('react-router');

var _ReplyEditorNew = require('app/components/elements/ReplyEditorNew');

var _ReplyEditorNew2 = _interopRequireDefault(_ReplyEditorNew);

var _ReplyEditor = require('app/components/elements/ReplyEditor');

var _ReplyEditor2 = _interopRequireDefault(_ReplyEditor);

var _constants = require('shared/constants');

var _Callout = require('app/components/elements/Callout');

var _Callout2 = _interopRequireDefault(_Callout);

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-underscore-dangle */
var formId = _constants.SUBMIT_FORM_ID;
var SubmitReplyEditor = (0, _ReplyEditor2.default)(formId);

function _redirect_url(operations) {
    try {
        var category = operations[0][0][1].category;

        return '/created/' + category;
    } catch (e) {
        console.error('redirect_url', e);
    }
    return '/created';
}

var SubmitPost = function (_React$Component) {
    (0, _inherits3.default)(SubmitPost, _React$Component);

    function SubmitPost() {
        (0, _classCallCheck3.default)(this, SubmitPost);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SubmitPost.__proto__ || (0, _getPrototypeOf2.default)(SubmitPost)).call(this));

        _this.success = function (operations) {
            localStorage.removeItem('replyEditorData-' + formId);
            _reactRouter.browserHistory.push(_redirect_url(operations));
        };
        return _this;
    }

    (0, _createClass3.default)(SubmitPost, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.setRouteTag();
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.props.username) {
                return _react2.default.createElement(
                    _Callout2.default,
                    null,
                    'Log in to make a post.'
                );
            }

            return _react2.default.createElement(SubmitReplyEditor, {
                type: 'submit_story',
                successCallback: this.success
            });
        }
    }]);
    return SubmitPost;
}(_react2.default.Component);

module.exports = {
    path: 'submit.html',
    component: (0, _reactRedux.connect)(function (state, ownProps) {
        return {
            username: state.user.getIn(['current', 'username'])
        };
    }, function (dispatch) {
        return {
            setRouteTag: function setRouteTag() {
                return dispatch(appActions.setRouteTag({ routeTag: 'submit_post' }));
            }
        };
    })(SubmitPost)
};