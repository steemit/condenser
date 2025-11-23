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

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VotesAndComments = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(VotesAndComments, _React$Component);

    function VotesAndComments(props) {
        (0, _classCallCheck3.default)(this, VotesAndComments);

        var _this = (0, _possibleConstructorReturn3.default)(this, (VotesAndComments.__proto__ || (0, _getPrototypeOf2.default)(VotesAndComments)).call(this, props));

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'VotesAndComments');
        return _this;
    }

    (0, _createClass3.default)(VotesAndComments, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                comments = _props.comments,
                commentsLink = _props.commentsLink,
                totalVotes = _props.totalVotes;

            var comments_tooltip = (0, _counterpart2.default)('votesandcomments_jsx.no_responses_yet_click_to_respond');
            if (comments > 0) comments_tooltip = (0, _counterpart2.default)('votesandcomments_jsx.response_count_tooltip', { count: comments });

            return _react2.default.createElement(
                'span',
                { className: 'VotesAndComments' },
                _react2.default.createElement(
                    'span',
                    {
                        className: 'VotesAndComments__votes',
                        title: (0, _counterpart2.default)('votesandcomments_jsx.vote_count', {
                            count: totalVotes
                        })
                    },
                    _react2.default.createElement(_Icon2.default, { size: '1x', name: 'chevron-up-circle' }),
                    '\xA0',
                    totalVotes
                ),
                _react2.default.createElement(
                    'span',
                    {
                        className: 'VotesAndComments__comments' + (comments === 0 ? ' no-comments' : '')
                    },
                    _react2.default.createElement(
                        _reactRouter.Link,
                        { to: commentsLink, title: comments_tooltip },
                        _react2.default.createElement(_Icon2.default, { name: comments > 1 ? 'chatboxes' : 'chatbox' }),
                        '\xA0',
                        comments
                    )
                )
            );
        }
    }]);
    return VotesAndComments;
}(_react2.default.Component), _class.propTypes = {
    // HTML properties
    post: _propTypes2.default.object.isRequired,
    commentsLink: _propTypes2.default.string.isRequired,

    // Redux connect properties
    comments: _propTypes2.default.number,
    totalVotes: _propTypes2.default.number
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, props) {
    return {
        totalVotes: props.post.getIn(['stats', 'total_votes']),
        comments: props.post.get('children')
    };
})(VotesAndComments);