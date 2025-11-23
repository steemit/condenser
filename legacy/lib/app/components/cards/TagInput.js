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

exports.validateTagInput = validateTagInput;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _ReduxForms = require('app/utils/ReduxForms');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MAX_TAGS = 8;

var TagInput = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(TagInput, _React$Component);

    function TagInput() {
        (0, _classCallCheck3.default)(this, TagInput);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TagInput.__proto__ || (0, _getPrototypeOf2.default)(TagInput)).call(this));

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'TagInput');
        return _this;
    }

    (0, _createClass3.default)(TagInput, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                tabIndex = _props.tabIndex,
                disabled = _props.disabled,
                _onChange = _props.onChange;

            var impProps = (0, _extends3.default)({}, this.props);
            var inputSanitized = (0, _ReduxForms.cleanReduxInput)(impProps);

            var tags = inputSanitized.value.split(' ');
            var hidden = [];
            if (tags && tags[0].substring(0, 5) == 'hive-') hidden.push(tags.shift());
            var value = tags.join(' ');

            var input = _react2.default.createElement('input', {
                type: 'text',
                value: value,
                onChange: function onChange(e) {
                    e.preventDefault();
                    // Re-insert any hidden tags first.
                    var updatedEvent = (0, _extends3.default)({}, e, {
                        target: (0, _extends3.default)({}, e.target, {
                            value: hidden.concat([e.target.value]).join(' ')
                        })
                    });
                    _onChange(updatedEvent);
                },
                ref: 'tagInputRef',
                tabIndex: tabIndex,
                disabled: disabled,
                autoCapitalize: 'none',
                placeholder: (0, _counterpart2.default)('reply_editor.tag')
            });

            return _react2.default.createElement(
                'span',
                null,
                input
            );
        }
    }]);
    return TagInput;
}(_react2.default.Component), _class.propTypes = {
    // HTML props
    id: _propTypes2.default.string, // DOM id for active component (focusing, etc...)
    autoComplete: _propTypes2.default.string,
    placeholder: _propTypes2.default.string,
    onChange: _propTypes2.default.func.isRequired,
    onBlur: _propTypes2.default.func.isRequired,
    disabled: _propTypes2.default.bool,
    value: _propTypes2.default.string,
    tabIndex: _propTypes2.default.number
}, _class.defaultProps = {
    autoComplete: 'on',
    id: 'TagInputId'
}, _temp);
function validateTagInput(value) {
    var required = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (!value || value.trim() === '') return required ? (0, _counterpart2.default)('g.required') : null;
    var cats = value.trim().replace(/#/g, '').split(/ +/);

    return (
        // !value || value.trim() === '' ? 'Required' :
        cats.length > MAX_TAGS ? (0, _counterpart2.default)('category_selector_jsx.use_limited_amount_of_categories', {
            amount: MAX_TAGS
        }) : cats.find(function (c) {
            return c.length > 24;
        }) ? (0, _counterpart2.default)('category_selector_jsx.maximum_tag_length_is_24_characters') : cats.find(function (c) {
            return c.split('-').length > 2;
        }) ? (0, _counterpart2.default)('category_selector_jsx.use_one_dash') : cats.find(function (c) {
            return c.indexOf(',') >= 0;
        }) ? (0, _counterpart2.default)('category_selector_jsx.use_spaces_to_separate_tags') : cats.find(function (c) {
            return (/[A-Z]/.test(c)
            );
        }) ? (0, _counterpart2.default)('category_selector_jsx.use_only_lowercase_letters') : cats.find(function (c) {
            return !/^[a-z0-9-#]+$/.test(c);
        }) ? (0, _counterpart2.default)('category_selector_jsx.use_only_allowed_characters') : cats.find(function (c) {
            return !/^[a-z-#]/.test(c);
        }) ? (0, _counterpart2.default)('category_selector_jsx.must_start_with_a_letter') : cats.find(function (c) {
            return !/[a-z0-9]$/.test(c);
        }) ? (0, _counterpart2.default)('category_selector_jsx.must_end_with_a_letter_or_number') : cats.filter(function (c) {
            return c.substring(0, 5) === 'hive-';
        }).length > 1 ? (0, _counterpart2.default)('category_selector_jsx.must_not_include_hivemind_community_owner', {
            hive: cats.filter(function (c) {
                return c.substring(0, 5) === 'hive-';
            })[0]
        }) : null
    );
}
exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    // apply translations
    // they are used here because default prop can't acces intl property
    var placeholder = (0, _counterpart2.default)('category_selector_jsx.tag_your_story');
    return (0, _extends3.default)({ placeholder: placeholder }, ownProps);
})(TagInput);