'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _ExtractContent = require('app/utils/ExtractContent');

var _ProxifyUrl = require('app/utils/ProxifyUrl');

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _TimeAgoWrapper = require('app/components/elements/TimeAgoWrapper');

var _TimeAgoWrapper2 = _interopRequireDefault(_TimeAgoWrapper);

var _Userpic = require('app/components/elements/Userpic');

var _Userpic2 = _interopRequireDefault(_Userpic);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: document why ` ` => `%20` is needed, and/or move to base fucntion
var proxify = function proxify(url, size) {
    return (0, _ProxifyUrl.proxifyImageUrl)(url, size).replace(/ /g, '%20');
};

var DraftSummary = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(DraftSummary, _React$Component);

    function DraftSummary() {
        (0, _classCallCheck3.default)(this, DraftSummary);
        return (0, _possibleConstructorReturn3.default)(this, (DraftSummary.__proto__ || (0, _getPrototypeOf2.default)(DraftSummary)).call(this));
    }

    (0, _createClass3.default)(DraftSummary, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(props, state) {
            return props.username !== this.props.username || props.post != this.props.post;
        }
    }, {
        key: 'clickContent',
        value: function clickContent() {
            this.props.hidePostDrafts();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                idx = _props.idx,
                post = _props.post,
                onDraftsClose = _props.onDraftsClose,
                onDeleteDraft = _props.onDeleteDraft;

            if (!post) return null;

            var onClickContent = function onClickContent(e) {
                e.preventDefault();
                _this2.clickContent();
                onDraftsClose(post);
            };

            var clickDeleteDraft = function clickDeleteDraft() {
                onDeleteDraft(post);
            };

            var summary = (0, _ExtractContent.extractBodySummary)(post.body, false);
            var keyWord = process.env.BROWSER ? decodeURI(window.location.search).split('=')[1] : null;
            var highlightColor = '#00FFC8';
            var content_body = _react2.default.createElement(
                'div',
                { className: 'DraftSummary__body entry-content' },
                _react2.default.createElement('span', {
                    onClick: onClickContent,
                    dangerouslySetInnerHTML: {
                        __html: (0, _ExtractContent.highlightKeyword)(summary, keyWord, highlightColor)
                    }
                })
            );

            var content_title = _react2.default.createElement(
                'h2',
                { className: 'drafts__h2 entry-title' },
                _react2.default.createElement('span', {
                    onClick: onClickContent,
                    dangerouslySetInnerHTML: {
                        __html: (0, _ExtractContent.highlightKeyword)(post.title, keyWord, highlightColor)
                    }
                })
            );

            // New Post Summary heading
            var summary_header = _react2.default.createElement(
                'div',
                { className: 'drafts__summary-header' },
                _react2.default.createElement(
                    'div',
                    { className: 'draft-user' },
                    _react2.default.createElement(
                        'div',
                        { className: 'draft-user__col user__col--left' },
                        _react2.default.createElement(_Userpic2.default, { account: post.author, size: _Userpic.SIZE_SMALL })
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'user__name' },
                        _react2.default.createElement(
                            'span',
                            {
                                itemProp: 'author',
                                itemScope: true,
                                itemType: 'http://schema.org/Person'
                            },
                            _react2.default.createElement(
                                'strong',
                                null,
                                post.author
                            ),
                            '\xA0\u2022\xA0'
                        )
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'timestamp__time' },
                        _react2.default.createElement(_TimeAgoWrapper2.default, {
                            date: post.timestamp,
                            className: 'updated'
                        })
                    )
                )
            );

            var image_link = (0, _ExtractContent.extractImageLink)(post.json_metadata, post.body);
            var thumb = null;
            if (image_link) {
                var blogImg = proxify(image_link, '160x120');

                thumb = _react2.default.createElement('img', { className: 'drafts__feature-img', src: blogImg });
                thumb = _react2.default.createElement(
                    'span',
                    { className: 'drafts__feature-img-container' },
                    thumb
                );
            }

            return _react2.default.createElement(
                'div',
                { className: 'drafts__summary' },
                summary_header,
                _react2.default.createElement(
                    'div',
                    {
                        className: 'drafts__content hentry' + (thumb ? ' with-image ' : ' '),
                        itemScope: true,
                        itemType: 'http://schema.org/blogPost'
                    },
                    thumb ? _react2.default.createElement(
                        'div',
                        { className: 'drafts__content-block drafts__content-block--img' },
                        thumb
                    ) : null,
                    _react2.default.createElement(
                        'div',
                        { className: 'drafts__content-block drafts__content-block--text' },
                        content_title,
                        content_body
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'drafts__summary-footer' },
                    _react2.default.createElement(
                        'a',
                        { onClick: clickDeleteDraft },
                        (0, _counterpart2.default)('g.delete')
                    )
                )
            );
        }
    }]);
    return DraftSummary;
}(_react2.default.Component), _class.propTypes = {
    post: _propTypes2.default.object.isRequired,
    onDraftsClose: _propTypes2.default.func,
    onDeleteDraft: _propTypes2.default.func
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, props) {
    var post = props.post;

    return {
        post: post,
        username: state.user.getIn(['current', 'username']) || state.offchain.get('account')
    };
}, function (dispatch) {
    return {
        hidePostDrafts: function hidePostDrafts() {
            return dispatch(userActions.hidePostDrafts());
        }
    };
})(DraftSummary);