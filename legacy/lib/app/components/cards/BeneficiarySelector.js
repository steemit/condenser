'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BeneficiarySelector = undefined;

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

exports.validateBeneficiaries = validateBeneficiaries;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAutocomplete = require('react-autocomplete');

var _reactAutocomplete2 = _interopRequireDefault(_reactAutocomplete);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _ChainValidation = require('app/utils/ChainValidation');

var _ReactForm = require('app/utils/ReactForm');

var _ReactForm2 = _interopRequireDefault(_ReactForm);

var _immutable = require('immutable');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BeneficiarySelector = exports.BeneficiarySelector = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(BeneficiarySelector, _React$Component);

    function BeneficiarySelector() {
        (0, _classCallCheck3.default)(this, BeneficiarySelector);

        var _this = (0, _possibleConstructorReturn3.default)(this, (BeneficiarySelector.__proto__ || (0, _getPrototypeOf2.default)(BeneficiarySelector)).call(this));

        _this.handleAddBeneficiary = function (e) {
            e.preventDefault();
            var beneficiaries = _this.props.value;
            if (beneficiaries.length < 8) {
                _this.props.onChange(beneficiaries.concat([{ username: '', percent: '' }]));
            }
        };

        _this.handleRemoveBeneficiary = function (idx) {
            return function (e) {
                e.preventDefault();
                var beneficiaries = _this.props.value;
                _this.props.onChange(beneficiaries.filter(function (s, bidx) {
                    return idx != bidx;
                }));
            };
        };

        _this.handleBeneficiaryUserChange = function (idx) {
            return function (e) {
                e.preventDefault();
                var beneficiaries = _this.props.value;
                var newBeneficiaries = beneficiaries.map(function (beneficiary, bidx) {
                    if (idx != bidx) return beneficiary;
                    return (0, _extends3.default)({}, beneficiary, { username: e.target.value });
                });
                _this.props.onChange(newBeneficiaries);
            };
        };

        _this.handleBeneficiaryUserSelect = function (idx) {
            return function (val) {
                var beneficiaries = _this.props.value;
                var newBeneficiaries = beneficiaries.map(function (beneficiary, bidx) {
                    if (idx != bidx) return beneficiary;
                    return (0, _extends3.default)({}, beneficiary, { username: val });
                });
                _this.props.onChange(newBeneficiaries);
            };
        };

        _this.handleBeneficiaryPercentChange = function (idx) {
            return function (e) {
                e.preventDefault();
                var beneficiaries = _this.props.value;
                var newBeneficiaries = beneficiaries.map(function (beneficiary, bidx) {
                    if (idx != bidx) return beneficiary;
                    return (0, _extends3.default)({}, beneficiary, { percent: e.target.value });
                });
                _this.props.onChange(newBeneficiaries);
            };
        };

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'BeneficiarySelector');
        return _this;
    }

    (0, _createClass3.default)(BeneficiarySelector, [{
        key: 'matchAutocompleteUser',
        value: function matchAutocompleteUser(item, value) {
            return item.toLowerCase().indexOf(value.toLowerCase()) > -1;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                username = _props.username,
                following = _props.following,
                tabIndex = _props.tabIndex;

            var beneficiaries = this.props.value;
            var remainingPercent = 100 - beneficiaries.map(function (b) {
                return b.percent ? parseInt(b.percent) : 0;
            }).reduce(function (sum, elt) {
                return sum + elt;
            }, 0);

            return _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column small-2' },
                        _react2.default.createElement(
                            'div',
                            { className: 'input-group' },
                            _react2.default.createElement('input', {
                                id: 'remainingPercent',
                                type: 'text',
                                pattern: '[0-9]*',
                                value: remainingPercent,
                                disabled: true,
                                className: 'BeneficiarySelector__percentbox'
                            }),
                            _react2.default.createElement(
                                'span',
                                { className: 'BeneficiarySelector__percentrow' },
                                '%'
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'column small-5' },
                        _react2.default.createElement(
                            'div',
                            { className: 'input-group' },
                            _react2.default.createElement(
                                'span',
                                { className: 'input-group-label' },
                                '@'
                            ),
                            _react2.default.createElement('input', {
                                className: 'input-group-field bold',
                                type: 'text',
                                disabled: true,
                                value: username
                            })
                        )
                    )
                ),
                beneficiaries.map(function (beneficiary, idx) {
                    return _react2.default.createElement(
                        'div',
                        { className: 'row', key: idx },
                        _react2.default.createElement(
                            'div',
                            { className: 'column small-2' },
                            _react2.default.createElement(
                                'div',
                                { className: 'input-group' },
                                _react2.default.createElement('input', {
                                    id: 'percent',
                                    type: 'text',
                                    pattern: '[0-9]*',
                                    value: beneficiary.percent,
                                    onChange: _this2.handleBeneficiaryPercentChange(idx),
                                    className: 'BeneficiarySelector__percentbox'
                                }),
                                _react2.default.createElement(
                                    'span',
                                    { className: 'BeneficiarySelector__percentrow' },
                                    '%'
                                )
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'column small-5' },
                            _react2.default.createElement(
                                'div',
                                { className: 'input-group' },
                                _react2.default.createElement(
                                    'span',
                                    { className: 'input-group-label' },
                                    '@'
                                ),
                                _react2.default.createElement(_reactAutocomplete2.default, {
                                    wrapperStyle: {
                                        display: 'inline-block',
                                        width: '100%'
                                    },
                                    inputProps: {
                                        id: 'user',
                                        type: 'text',
                                        className: 'input-group-field',
                                        autoComplete: 'off',
                                        autoCorrect: 'off',
                                        autoCapitalize: 'off',
                                        spellCheck: 'false'
                                    },
                                    renderMenu: function renderMenu(items) {
                                        return _react2.default.createElement('div', {
                                            className: 'react-autocomplete-input',
                                            children: items
                                        });
                                    },
                                    getItemValue: function getItemValue(item) {
                                        return item;
                                    },
                                    items: _this2.props.following,
                                    shouldItemRender: _this2.matchAutocompleteUser,
                                    renderItem: function renderItem(item, isHighlighted) {
                                        return _react2.default.createElement(
                                            'div',
                                            {
                                                className: isHighlighted ? 'active' : ''
                                            },
                                            item
                                        );
                                    },
                                    value: beneficiary.username,
                                    onChange: _this2.handleBeneficiaryUserChange(idx),
                                    onSelect: _this2.handleBeneficiaryUserSelect(idx)
                                })
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'BeneficiarySelector__percentrow column small-5' },
                            _react2.default.createElement(
                                'a',
                                {
                                    id: 'remove',
                                    href: '#',
                                    onClick: _this2.handleRemoveBeneficiary(idx)
                                },
                                (0, _counterpart2.default)('g.remove')
                            )
                        )
                    );
                }),
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column' },
                        _react2.default.createElement(
                            'a',
                            {
                                id: 'add',
                                href: '#',
                                onClick: this.handleAddBeneficiary,
                                hidden: beneficiaries.length >= 8
                            },
                            (0, _counterpart2.default)('beneficiary_selector_jsx.add')
                        )
                    )
                )
            );
        }
    }]);
    return BeneficiarySelector;
}(_react2.default.Component), _class.propTypes = {
    // HTML props
    id: _react2.default.PropTypes.string, // DOM id for active component (focusing, etc...)
    onChange: _react2.default.PropTypes.func.isRequired,
    onBlur: _react2.default.PropTypes.func.isRequired,
    value: _react2.default.PropTypes.array,
    tabIndex: _react2.default.PropTypes.number,

    // redux connect
    following: _react2.default.PropTypes.array.isRequired
}, _class.defaultProps = {
    id: 'BeneficiarySelectorId'
}, _temp);
function validateBeneficiaries(username, beneficiaries) {
    var required = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    if (beneficiaries.length > 8) {
        return (0, _counterpart2.default)('beneficiary_selector_jsx.exceeds_max_beneficiaries');
    }
    var totalPercent = 0;

    var beneficiaryNames = (0, _immutable.Set)();
    for (var i = 0; i < beneficiaries.length; i++) {
        var beneficiary = beneficiaries[i];
        var accountError = (0, _ChainValidation.validate_account_name)(beneficiary.username, '');
        if ((required || beneficiary.username) && accountError) {
            return accountError;
        }
        if (beneficiary.username === username) {
            return (0, _counterpart2.default)('beneficiary_selector_jsx.beneficiary_cannot_be_self');
        }
        if (beneficiaryNames.has(beneficiary.username)) {
            return (0, _counterpart2.default)('beneficiary_selector_jsx.beneficiary_cannot_be_duplicate');
        } else {
            beneficiaryNames = beneficiaryNames.add(beneficiary.username);
        }
        if ((required || beneficiary.percent) && !/^[1-9]\d{0,2}$/.test(beneficiary.percent)) {
            return (0, _counterpart2.default)('beneficiary_selector_jsx.beneficiary_percent_invalid');
        }
        totalPercent += parseInt(beneficiary.percent);
    }
    if (totalPercent > 100) {
        return (0, _counterpart2.default)('beneficiary_selector_jsx.beneficiary_percent_total_invalid');
    }
}

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var following = (0, _immutable.List)();
    var username = state.user.getIn(['current', 'username']);
    var follow = state.global.get('follow');
    if (follow) {
        var followingData = follow.getIn(['getFollowingAsync', username, 'blog_result']);
        if (followingData) following = followingData.sort();
    }
    return (0, _extends3.default)({}, ownProps, {
        username: username,
        following: following.toJS()
    });
})(BeneficiarySelector);