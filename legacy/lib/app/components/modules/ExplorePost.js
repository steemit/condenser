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

var _reactRedux = require('react-redux');

var _ServerApiClient = require('app/utils/ServerApiClient');

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _reactCopyToClipboard = require('react-copy-to-clipboard');

var _reactCopyToClipboard2 = _interopRequireDefault(_reactCopyToClipboard);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ExplorePost = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(ExplorePost, _Component);

    function ExplorePost(props) {
        (0, _classCallCheck3.default)(this, ExplorePost);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ExplorePost.__proto__ || (0, _getPrototypeOf2.default)(ExplorePost)).call(this, props));

        _this.state = {
            copied: false,
            copiedMD: false
        };
        _this.onCopy = _this.onCopy.bind(_this);
        _this.onCopyMD = _this.onCopyMD.bind(_this);
        _this.Steemd = _this.Steemd.bind(_this);
        _this.Steemdb = _this.Steemdb.bind(_this);
        _this.Busy = _this.Busy.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(ExplorePost, [{
        key: 'Steemd',
        value: function Steemd() {
            (0, _ServerApiClient.serverApiRecordEvent)('SteemdView', this.props.permlink);
        }
    }, {
        key: 'Steemdb',
        value: function Steemdb() {
            (0, _ServerApiClient.serverApiRecordEvent)('SteemdbView', this.props.permlink);
        }
    }, {
        key: 'Busy',
        value: function Busy() {
            (0, _ServerApiClient.serverApiRecordEvent)('Busy view', this.props.permlink);
        }
    }, {
        key: 'onCopy',
        value: function onCopy() {
            this.setState({
                copied: true
            });
        }
    }, {
        key: 'onCopyMD',
        value: function onCopyMD() {
            this.setState({
                copiedMD: true
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var link = this.props.permlink;
            var title = this.props.title;
            var steemscan = 'https://steemscan.com/' + link;
            var steemdb = 'https://steemdb.io' + link;
            // const busy = 'https://busy.org' + link;
            var steemit = 'https://steemit.com' + link;
            var steemitmd = '[' + title + '](https://steemit.com' + link + ')';
            var text = this.state.copied == true ? (0, _counterpart2.default)('explorepost_jsx.copied') : (0, _counterpart2.default)('explorepost_jsx.copy');
            var textMD = this.state.copiedMD == true ? (0, _counterpart2.default)('explorepost_jsx.copied') : (0, _counterpart2.default)('explorepost_jsx.copy');
            return _react2.default.createElement(
                'span',
                { className: 'ExplorePost' },
                _react2.default.createElement(
                    'h4',
                    null,
                    (0, _counterpart2.default)('g.share_this_post')
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'div',
                    { className: 'input-group' },
                    _react2.default.createElement('input', {
                        className: 'input-group-field share-box',
                        type: 'text',
                        value: steemit,
                        onChange: function onChange(e) {
                            return e.preventDefault();
                        }
                    }),
                    _react2.default.createElement(
                        _reactCopyToClipboard2.default,
                        {
                            text: steemit,
                            onCopy: this.onCopy,
                            className: 'ExplorePost__copy-button input-group-label'
                        },
                        _react2.default.createElement(
                            'span',
                            null,
                            text
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'input-group' },
                    _react2.default.createElement('input', {
                        className: 'input-group-field share-box',
                        type: 'text',
                        value: steemitmd,
                        onChange: function onChange(e) {
                            return e.preventDefault();
                        }
                    }),
                    _react2.default.createElement(
                        _reactCopyToClipboard2.default,
                        {
                            text: steemitmd,
                            onCopy: this.onCopyMD,
                            className: 'ExplorePost__copy-button input-group-label'
                        },
                        _react2.default.createElement(
                            'span',
                            null,
                            textMD
                        )
                    )
                ),
                _react2.default.createElement(
                    'h5',
                    null,
                    (0, _counterpart2.default)('explorepost_jsx.alternative_sources')
                ),
                _react2.default.createElement(
                    'ul',
                    null,
                    _react2.default.createElement(
                        'li',
                        null,
                        _react2.default.createElement(
                            'a',
                            {
                                href: steemscan,
                                onClick: this.Steemd,
                                target: '_blank',
                                rel: 'noopener noreferrer'
                            },
                            'steemscan.com ',
                            _react2.default.createElement(_Icon2.default, { name: 'extlink' })
                        )
                    ),
                    _react2.default.createElement(
                        'li',
                        null,
                        _react2.default.createElement(
                            'a',
                            {
                                href: steemdb,
                                onClick: this.Steemdb,
                                target: '_blank',
                                rel: 'noopener noreferrer'
                            },
                            'steemdb.io ',
                            _react2.default.createElement(_Icon2.default, { name: 'extlink' })
                        )
                    )
                )
            );
        }
    }]);
    return ExplorePost;
}(_react.Component), _class.propTypes = {
    permlink: _propTypes2.default.string.isRequired,
    title: _propTypes2.default.string.isRequired
}, _temp);
exports.default = (0, _reactRedux.connect)()(ExplorePost);