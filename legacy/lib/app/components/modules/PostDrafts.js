'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _DraftSummary = require('../cards/DraftSummary');

var _DraftSummary2 = _interopRequireDefault(_DraftSummary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PostDrafts = function (_Component) {
    (0, _inherits3.default)(PostDrafts, _Component);

    function PostDrafts(props) {
        (0, _classCallCheck3.default)(this, PostDrafts);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PostDrafts.__proto__ || (0, _getPrototypeOf2.default)(PostDrafts)).call(this));

        _this.getDraftList = function () {
            var username = _this.props.username;

            var draftList = JSON.parse(localStorage.getItem('draft-list')) || [];
            draftList = draftList.filter(function (data) {
                return data.author === username;
            });
            _this.setState({ draftList: draftList });
        };

        _this.onDeleteDraft = function (post) {
            var clearDraft = _this.props.clearDraft;

            var draftList = JSON.parse(localStorage.getItem('draft-list')) || [];
            var draftIdx = draftList.findIndex(function (data) {
                return data.author === post.author && data.permlink === post.permlink;
            });
            draftList.splice(draftIdx, 1);
            localStorage.setItem('draft-list', (0, _stringify2.default)(draftList));
            _this.getDraftList(); // state 업데이트
            clearDraft(post.author + '^' + post.permlink);
        };

        _this.state = {
            draftList: []
        };
        return _this;
    }

    (0, _createClass3.default)(PostDrafts, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.getDraftList();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                username = _props.username,
                onDraftsClose = _props.onDraftsClose,
                clearDraft = _props.clearDraft;
            var draftList = this.state.draftList;


            var drafts = draftList.map(function (draft, idx) {
                return _react2.default.createElement(
                    'div',
                    { key: idx, className: 'drafts-option' },
                    _react2.default.createElement(_DraftSummary2.default, {
                        idx: idx + 1,
                        post: draft,
                        onDraftsClose: onDraftsClose,
                        onDeleteDraft: _this2.onDeleteDraft
                    })
                );
            });

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'h3',
                        { className: 'column' },
                        (0, _counterpart2.default)('reply_editor.draft')
                    )
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'div',
                    { className: 'drafts-list' },
                    drafts
                )
            );
        }
    }]);
    return PostDrafts;
}(_react.Component);

exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    var username = state.user.getIn(['current', 'username']);
    return (0, _extends3.default)({}, ownProps, {
        fields: [],
        username: username,
        initialValues: {},
        onDraftsClose: ownProps.onDraftsClose,
        clearDraft: ownProps.clearDraft
    });
})(PostDrafts);