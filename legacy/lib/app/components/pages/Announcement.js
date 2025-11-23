'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _markdown = require('markdown');

var _markdown2 = _interopRequireDefault(_markdown);

var _FetchDataSaga = require('app/redux/FetchDataSaga');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mk = _markdown2.default.markdown;

var Announcement = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(Announcement, _Component);

    function Announcement() {
        (0, _classCallCheck3.default)(this, Announcement);
        return (0, _possibleConstructorReturn3.default)(this, (Announcement.__proto__ || (0, _getPrototypeOf2.default)(Announcement)).apply(this, arguments));
    }

    (0, _createClass3.default)(Announcement, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var getNotices = this.props.getNotices;

            getNotices();
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                notices = _props.notices,
                user_preferences = _props.user_preferences;


            var commsHead = _react2.default.createElement('div', { style: { color: '#aaa', paddingTop: '0em' } });
            var list = _react2.default.createElement(
                'ul',
                { className: 'c-sidebar__list_ann' },
                _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'div',
                        { className: 'c-sidebar__header' },
                        (0, _counterpart2.default)('g.announcement')
                    )
                ),
                notices && notices.map(function (item, index) {
                    var notice = item.toJS();
                    var locale = user_preferences.locale;
                    if (notice.status !== 1) return null;
                    return _react2.default.createElement('li', {
                        key: index,
                        dangerouslySetInnerHTML: {
                            __html: mk.toHTML(notice.body[locale === 'zh' ? 'cn' : 'en'])
                        }
                    });
                })
            );

            return notices && notices.size > 0 && notices.toJS()[0].status === 1 ? _react2.default.createElement(
                'div',
                { className: 'c-sidebar__module' },
                _react2.default.createElement(
                    'div',
                    { className: 'c-sidebar__content' },
                    list
                )
            ) : _react2.default.createElement('div', null);
        }
    }]);
    return Announcement;
}(_react.Component), _class.propTypes = {}, _class.defaultProps = {
    current: ''
}, _temp);
exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    return (0, _extends3.default)({}, ownProps, {
        notices: state.global.get('notices'),
        user_preferences: state.app.get('user_preferences').toJS()
    });
}, function (dispatch) {
    return {
        getNotices: function getNotices(username) {
            return dispatch(_FetchDataSaga.actions.getNotices(username));
        }
    };
})(Announcement);