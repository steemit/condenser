'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _AutocompleteInput = require('app/components/elements/AutocompleteInput');

var _AutocompleteInput2 = _interopRequireDefault(_AutocompleteInput);

var _Unicode = require('app/utils/Unicode');

var _Unicode2 = _interopRequireDefault(_Unicode);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _assert = require('assert');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var languageOptions = [{ abbr: 'en', name: 'English' }, { abbr: 'kr', name: 'Korean' }, { abbr: 'zh', name: 'Chinese' }, { abbr: 'ms', name: 'Malay' }, { abbr: 'pl', name: 'Polish' }, { abbr: 'pt', name: 'Portuguese' }, { abbr: 'ru', name: 'Russian' }, { abbr: 'it', name: 'Italian' }, { abbr: 'de', name: 'German' }, { abbr: 'es', name: 'Spanish' }, { abbr: 'sv', name: 'Swedish' }];

var CommunitySettings = function (_Component) {
    (0, _inherits3.default)(CommunitySettings, _Component);

    function CommunitySettings(props) {
        (0, _classCallCheck3.default)(this, CommunitySettings);

        var _this = (0, _possibleConstructorReturn3.default)(this, (CommunitySettings.__proto__ || (0, _getPrototypeOf2.default)(CommunitySettings)).call(this, props));

        _this.onInput = function (event) {
            var el = event.target;
            var field = el.name;
            var value = el.hasOwnProperty('checked') ? el.checked : el.value;
            _this.setState((0, _defineProperty3.default)({}, field, value));

            if (field == 'title') {
                var formError = null;
                var rx = new RegExp('^[' + _Unicode2.default.L + ']');
                if (value && !rx.test(value)) formError = 'Must start with a letter.';
                _this.setState({ formError: formError });
            }
        };

        _this.onSubmit = function (e) {
            e.preventDefault();
            // Trim leading and trailing whitespace before submission.
            var payload = {};
            (0, _keys2.default)(_this.state).forEach(function (k) {
                if (k == 'formError') return;
                if (typeof _this.state[k] === 'string') payload[k] = _this.state[k].trim();else payload[k] = _this.state[k];
            });
            _this.props.onSubmit(payload);
        };

        _this.state = {
            title: _this.props.title,
            about: _this.props.about,
            is_nsfw: _this.props.is_nsfw,
            lang: _this.props.lang,
            description: _this.props.description,
            flag_text: _this.props.flag_text
        };
        return _this;
    }

    (0, _createClass3.default)(CommunitySettings, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state,
                title = _state.title,
                about = _state.about,
                is_nsfw = _state.is_nsfw,
                lang = _state.lang,
                description = _state.description,
                flag_text = _state.flag_text,
                formError = _state.formError;

            var currentLanguage = languageOptions.filter(function (l) {
                return l.abbr === lang;
            })[0].name;
            return _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'h4',
                        null,
                        (0, _counterpart2.default)('g.community_settings_header')
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        (0, _counterpart2.default)('g.community_settings_description')
                    )
                ),
                _react2.default.createElement(
                    'form',
                    { onSubmit: this.onSubmit },
                    formError && _react2.default.createElement(
                        'span',
                        { className: 'error' },
                        formError
                    ),
                    _react2.default.createElement(
                        'label',
                        { className: 'input-group' },
                        _react2.default.createElement(
                            'span',
                            { className: 'input-group-label' },
                            'Title '
                        ),
                        _react2.default.createElement('input', {
                            className: 'input-group-field',
                            type: 'text',
                            maxLength: 20,
                            minLength: 3,
                            name: 'title',
                            value: title,
                            onChange: function onChange(e) {
                                return _this2.onInput(e);
                            },
                            required: true
                        })
                    ),
                    _react2.default.createElement(
                        'label',
                        { className: 'input-group' },
                        _react2.default.createElement(
                            'span',
                            { className: 'input-group-label' },
                            'About '
                        ),
                        _react2.default.createElement('input', {
                            className: 'input-group-field',
                            type: 'text',
                            maxLength: 120,
                            name: 'about',
                            value: about,
                            onChange: function onChange(e) {
                                return _this2.onInput(e);
                            }
                        })
                    ),
                    _react2.default.createElement(_AutocompleteInput2.default, {
                        label: 'Language',
                        values: languageOptions,
                        initialValue: currentLanguage,
                        onSelect: function onSelect(v) {
                            var selectedLanguage = languageOptions.filter(function (l) {
                                return l.name === v;
                            })[0];
                            _this2.setState({
                                lang: selectedLanguage.abbr
                            });
                        }
                    }),
                    _react2.default.createElement(
                        'label',
                        { style: { margin: '1em 0 1rem' } },
                        'Description',
                        _react2.default.createElement('br', null),
                        _react2.default.createElement('textarea', {
                            style: { whiteSpace: 'normal' },
                            type: 'text',
                            maxLength: 1000,
                            rows: '10',
                            onChange: function onChange(e) {
                                return _this2.onInput(e);
                            },
                            name: 'description',
                            value: description
                        })
                    ),
                    _react2.default.createElement(
                        'label',
                        { style: { margin: '0 0 0.5rem' } },
                        'Rules (one per line)',
                        _react2.default.createElement('br', null),
                        _react2.default.createElement('textarea', {
                            style: { whiteSpace: 'normal' },
                            type: 'text',
                            maxLength: 1000,
                            rows: '7',
                            onChange: function onChange(e) {
                                return _this2.onInput(e);
                            },
                            name: 'flag_text',
                            value: flag_text
                        })
                    ),
                    _react2.default.createElement(
                        'label',
                        null,
                        _react2.default.createElement('input', {
                            type: 'checkbox',
                            name: 'is_nsfw',
                            checked: is_nsfw,
                            onChange: function onChange(e) {
                                return _this2.onInput(e);
                            }
                        }),
                        ' ',
                        'NSFW'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'text-right' },
                        _react2.default.createElement('input', { className: 'button', type: 'submit', value: 'Save' })
                    )
                )
            );
        }
    }]);
    return CommunitySettings;
}(_react.Component);

CommunitySettings.propTypes = {
    onSubmit: _propTypes2.default.func.isRequired,
    title: _propTypes2.default.string.isRequired,
    about: _propTypes2.default.string.isRequired,
    is_nsfw: _propTypes2.default.bool.isRequired,
    lang: _propTypes2.default.string,
    description: _propTypes2.default.string.isRequired,
    flag_text: _propTypes2.default.string.isRequired
};

exports.default = (0, _reactRedux.connect)()(CommunitySettings);