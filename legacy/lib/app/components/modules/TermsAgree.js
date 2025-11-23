'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _class, _temp; /* eslint react/prop-types: 0 */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _Translator = require('app/Translator');

var _HelpContent = require('app/components/elements/HelpContent');

var _HelpContent2 = _interopRequireDefault(_HelpContent);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TermsAgree = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(TermsAgree, _Component);

    function TermsAgree() {
        (0, _classCallCheck3.default)(this, TermsAgree);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TermsAgree.__proto__ || (0, _getPrototypeOf2.default)(TermsAgree)).call(this));

        _this.state = {
            tosChecked: false,
            privacyChecked: false
        };
        _this.termsAgree = _this.termsAgree.bind(_this);
        _this.handleInputChange = _this.handleInputChange.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(TermsAgree, [{
        key: 'handleInputChange',
        value: function handleInputChange(event) {
            var target = event.target;
            var value = target.type === 'checkbox' ? target.checked : target.value;
            var name = target.name;

            this.setState((0, _defineProperty3.default)({}, name, value));
        }
    }, {
        key: 'termsAgree',
        value: function termsAgree(e) {
            // let user proceed
            this.props.acceptTerms(e);
        }
    }, {
        key: 'render',
        value: function render() {
            var username = this.props.username;


            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'h4',
                    null,
                    (0, _counterpart2.default)('termsagree_jsx.please_review')
                ),
                _react2.default.createElement(
                    'p',
                    null,
                    (0, _counterpart2.default)('termsagree_jsx.hi_user', { username: username })
                ),
                _react2.default.createElement(
                    'p',
                    null,
                    (0, _counterpart2.default)('termsagree_jsx.blurb')
                ),
                _react2.default.createElement(
                    'p',
                    null,
                    _react2.default.createElement(
                        'label',
                        null,
                        _react2.default.createElement('input', {
                            name: 'tosChecked',
                            type: 'checkbox',
                            checked: this.state.tosChecked,
                            onChange: this.handleInputChange
                        }),
                        (0, _counterpart2.default)('termsagree_jsx.i_agree_to_steemits'),
                        ' ',
                        _react2.default.createElement(
                            'a',
                            {
                                target: '_blank',
                                rel: 'noopener noreferrer',
                                href: '/tos.html'
                            },
                            (0, _counterpart2.default)('termsagree_jsx.terms_of_service')
                        )
                    )
                ),
                _react2.default.createElement(
                    'p',
                    null,
                    _react2.default.createElement(
                        'label',
                        null,
                        _react2.default.createElement('input', {
                            name: 'privacyChecked',
                            type: 'checkbox',
                            checked: this.state.privacyChecked,
                            onChange: this.handleInputChange
                        }),
                        (0, _counterpart2.default)('termsagree_jsx.i_agree_to_steemits'),
                        ' ',
                        _react2.default.createElement(
                            'a',
                            {
                                target: '_blank',
                                rel: 'noopener noreferrer',
                                href: '/privacy.html'
                            },
                            (0, _counterpart2.default)('termsagree_jsx.privacy_policy')
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'button',
                        {
                            type: 'submit',
                            className: 'button',
                            onClick: this.termsAgree,
                            disabled: !this.state.tosChecked || !this.state.privacyChecked
                        },
                        (0, _counterpart2.default)('termsagree_jsx.continue')
                    )
                )
            );
        }
    }]);
    return TermsAgree;
}(_react.Component), _class.propTypes = {
    username: _propTypes2.default.string.isRequired,
    acceptTerms: _propTypes2.default.func.isRequired
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state) {
    return {
        username: state.user.getIn(['current', 'username'])
    };
}, function (dispatch) {
    return {
        acceptTerms: function acceptTerms(e) {
            if (e) e.preventDefault();
            dispatch(userActions.acceptTerms());
        }
    };
})(TermsAgree);
// mapStateToProps