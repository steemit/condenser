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

var UserTitleEditor = function (_Component) {
    (0, _inherits3.default)(UserTitleEditor, _Component);

    function UserTitleEditor(props) {
        (0, _classCallCheck3.default)(this, UserTitleEditor);

        var _this = (0, _possibleConstructorReturn3.default)(this, (UserTitleEditor.__proto__ || (0, _getPrototypeOf2.default)(UserTitleEditor)).call(this, props));

        _this.onInput = function (event) {
            var newState = {};
            var newValue = event.target.value || '';
            if (event.target.hasOwnProperty('checked')) newValue = event.target.checked;
            newState[event.target.name] = newValue;
            _this.setState(newState);
        };

        _this.onSubmit = function () {
            _this.props.onSubmit(_this.state.title.trim());
        };

        _this.state = {
            title: _this.props.title ? _this.props.title : ''
        };
        return _this;
    }

    (0, _createClass3.default)(UserTitleEditor, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var title = this.state.title;
            var _props = this.props,
                username = _props.username,
                community = _props.community;


            return _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'h4',
                        null,
                        (0, _counterpart2.default)('g.community_user_title_edit_description', {
                            community: community,
                            username: username
                        })
                    )
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'div',
                    { className: 'input-group' },
                    _react2.default.createElement(
                        'span',
                        { className: 'input-group-label' },
                        'Title'
                    ),
                    _react2.default.createElement('input', {
                        className: 'input-group-field',
                        type: 'text',
                        maxLength: 32,
                        name: 'title',
                        value: title,
                        onChange: function onChange(e) {
                            return _this2.onInput(e);
                        }
                    })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'text-right' },
                    _react2.default.createElement(
                        'button',
                        {
                            className: 'button',
                            type: 'submit',
                            onClick: function onClick() {
                                return _this2.onSubmit();
                            }
                        },
                        'Save'
                    )
                )
            );
        }
    }]);
    return UserTitleEditor;
}(_react.Component);

UserTitleEditor.propTypes = {
    onSubmit: _propTypes2.default.func.isRequired,
    title: _propTypes2.default.string,
    username: _propTypes2.default.string.isRequired,
    community: _propTypes2.default.string.isRequired
};

UserTitleEditor.defaultProps = {
    title: ''
};

exports.default = (0, _reactRedux.connect)()(UserTitleEditor);