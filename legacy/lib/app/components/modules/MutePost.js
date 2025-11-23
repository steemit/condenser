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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MutePost = function (_Component) {
    (0, _inherits3.default)(MutePost, _Component);

    function MutePost(props) {
        (0, _classCallCheck3.default)(this, MutePost);

        var _this = (0, _possibleConstructorReturn3.default)(this, (MutePost.__proto__ || (0, _getPrototypeOf2.default)(MutePost)).call(this, props));

        _this.componentWillUpdate = function (nextProps, nextState) {
            if (nextState.notes != _this.state.notes) {
                _this.setState({ disableSubmit: nextState.notes == '' });
            }
        };

        _this.onInput = function (e) {
            _this.setState({ notes: ('' + (e.target.value || '')).trim() });
        };

        _this.onSubmit = function () {
            if (_this.state.notes) _this.props.onSubmit(_this.state.notes);
        };

        _this.state = { notes: '', disableSubmit: true };
        return _this;
    }

    (0, _createClass3.default)(MutePost, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state,
                notes = _state.notes,
                disableSubmit = _state.disableSubmit;
            var isMuted = this.props.isMuted;


            return _react2.default.createElement(
                'span',
                null,
                isMuted ? _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'h4',
                        null,
                        (0, _counterpart2.default)('g.unmute_this_post')
                    ),
                    ' ',
                    _react2.default.createElement(
                        'p',
                        null,
                        ' ',
                        (0, _counterpart2.default)('g.unmute_this_post_description')
                    )
                ) : _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'h4',
                        null,
                        (0, _counterpart2.default)('g.mute_this_post')
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        (0, _counterpart2.default)('g.mute_this_post_description')
                    )
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'div',
                    { className: 'input-group' },
                    _react2.default.createElement(
                        'span',
                        { className: 'input-group-label' },
                        'Notes'
                    ),
                    _react2.default.createElement('input', {
                        className: 'input-group-field',
                        type: 'text',
                        maxLength: 120,
                        onKeyUp: function onKeyUp(e) {
                            if (e.key === 'Enter') {
                                _this2.onSubmit();
                            }
                            _this2.onInput(e);
                        }
                    }),
                    _react2.default.createElement(
                        'button',
                        {
                            className: 'button slim hollow secondary',
                            type: 'submit',
                            disabled: disableSubmit,
                            onClick: function onClick() {
                                return _this2.onSubmit();
                            }
                        },
                        isMuted ? (0, _counterpart2.default)('g.unmute') : (0, _counterpart2.default)('g.mute')
                    )
                )
            );
        }
    }]);
    return MutePost;
}(_react.Component);

MutePost.propTypes = {
    onSubmit: _propTypes2.default.func.isRequired,
    isMuted: _propTypes2.default.bool
};

MutePost.defaultProps = {
    isMuted: false
};

exports.default = (0, _reactRedux.connect)()(MutePost);