'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FormattedHTMLMessage = undefined;

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

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactIntl = require('react-intl');

var _en = require('react-intl/locale-data/en');

var _en2 = _interopRequireDefault(_en);

var _es = require('react-intl/locale-data/es');

var _es2 = _interopRequireDefault(_es);

var _ru = require('react-intl/locale-data/ru');

var _ru2 = _interopRequireDefault(_ru);

var _fr = require('react-intl/locale-data/fr');

var _fr2 = _interopRequireDefault(_fr);

var _it = require('react-intl/locale-data/it');

var _it2 = _interopRequireDefault(_it);

var _ko = require('react-intl/locale-data/ko');

var _ko2 = _interopRequireDefault(_ko);

var _pl = require('react-intl/locale-data/pl');

var _pl2 = _interopRequireDefault(_pl);

var _ja = require('react-intl/locale-data/ja');

var _ja2 = _interopRequireDefault(_ja);

var _client_config = require('app/client_config');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// addLocaleData([...en, ...es, ...ru, ...fr, ...it, ...ko, ...zh, ...pl, ...ja]);

// import zh from 'react-intl/locale-data/zh';
(0, _reactIntl.addLocaleData)([].concat((0, _toConsumableArray3.default)(_en2.default), (0, _toConsumableArray3.default)(_es2.default), (0, _toConsumableArray3.default)(_ru2.default), (0, _toConsumableArray3.default)(_fr2.default), (0, _toConsumableArray3.default)(_it2.default), (0, _toConsumableArray3.default)(_ko2.default), (0, _toConsumableArray3.default)(_pl2.default), (0, _toConsumableArray3.default)(_ja2.default)));

_counterpart2.default.registerTranslations('en', require('counterpart/locales/en'));
_counterpart2.default.registerTranslations('en', require('app/locales/en.json'));

_counterpart2.default.registerTranslations('es', require('app/locales/counterpart/es'));
_counterpart2.default.registerTranslations('es', require('app/locales/es.json'));

_counterpart2.default.registerTranslations('ru', require('counterpart/locales/ru'));
_counterpart2.default.registerTranslations('ru', require('app/locales/ru.json'));

_counterpart2.default.registerTranslations('fr', require('app/locales/counterpart/fr'));
_counterpart2.default.registerTranslations('fr', require('app/locales/fr.json'));

_counterpart2.default.registerTranslations('it', require('app/locales/counterpart/it'));
_counterpart2.default.registerTranslations('it', require('app/locales/it.json'));

_counterpart2.default.registerTranslations('ko', require('app/locales/counterpart/ko'));
_counterpart2.default.registerTranslations('ko', require('app/locales/ko.json'));

// tt.registerTranslations('zh', require('app/locales/counterpart/zh'));
// tt.registerTranslations('zh', require('app/locales/zh.json'));

_counterpart2.default.registerTranslations('pl', require('app/locales/counterpart/pl'));
_counterpart2.default.registerTranslations('pl', require('app/locales/pl.json'));

_counterpart2.default.registerTranslations('ja', require('app/locales/counterpart/ja'));
_counterpart2.default.registerTranslations('ja', require('app/locales/ja.json'));

if (process.env.NODE_ENV === 'production') {
    _counterpart2.default.setFallbackLocale('en');
}

var Translator = function (_React$Component) {
    (0, _inherits3.default)(Translator, _React$Component);

    function Translator() {
        (0, _classCallCheck3.default)(this, Translator);
        return (0, _possibleConstructorReturn3.default)(this, (Translator.__proto__ || (0, _getPrototypeOf2.default)(Translator)).apply(this, arguments));
    }

    (0, _createClass3.default)(Translator, [{
        key: 'render',
        value: function render() {
            var language = this.props.locale;
            _counterpart2.default.setLocale(language);
            return _react2.default.createElement(
                _reactIntl.IntlProvider
                // to ensure dynamic language change, "key" property with same "locale" info must be added
                // see: https://github.com/yahoo/react-intl/wiki/Components#multiple-intl-contexts
                ,
                { key: language,
                    locale: language,
                    defaultLocale: _client_config.DEFAULT_LANGUAGE
                },
                this.props.children
            );
        }
    }]);
    return Translator;
}(_react2.default.Component);

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var locale = state.app.getIn(['user_preferences', 'locale']);
    return (0, _extends3.default)({}, ownProps, { locale: locale });
})(Translator);
var FormattedHTMLMessage = exports.FormattedHTMLMessage = function FormattedHTMLMessage(_ref) {
    var id = _ref.id,
        params = _ref.params,
        className = _ref.className;
    return _react2.default.createElement('div', {
        className: 'FormattedHTMLMessage' + (className ? ' ' + className : ''),
        dangerouslySetInnerHTML: { __html: (0, _counterpart2.default)(id, params) }
    });
};