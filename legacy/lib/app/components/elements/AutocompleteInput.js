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

var _reactAutocomplete = require('react-autocomplete');

var _reactAutocomplete2 = _interopRequireDefault(_reactAutocomplete);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function matchInputToItem(item, input) {
    return item.name.toLowerCase().indexOf(input.toLowerCase()) !== -1 || item.abbr.toLowerCase().indexOf(input.toLowerCase()) !== -1;
}

/**
 * An example of how to implement a relevancy-based sorting method. States are
 * sorted based on the location of the match - For example, a search for "or"
 * will return "Oregon" before "North Carolina" even though "North Carolina"
 * would normally sort above Oregon. Strings where the match is in the same
 * location (or there is no match) will be sorted alphabetically - For example,
 * a search for "or" would return "North Carolina" above "North Dakota".
 */
function sortInput(a, b, value) {
    var aLower = a.name.toLowerCase();
    var bLower = b.name.toLowerCase();
    var valueLower = value.toLowerCase();
    var queryPosA = aLower.indexOf(valueLower);
    var queryPosB = bLower.indexOf(valueLower);
    if (queryPosA !== queryPosB) {
        return queryPosA - queryPosB;
    }
    return aLower < bLower ? -1 : 1;
}

var AutocompleteInput = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(AutocompleteInput, _React$Component);

    function AutocompleteInput(props) {
        (0, _classCallCheck3.default)(this, AutocompleteInput);

        var _this = (0, _possibleConstructorReturn3.default)(this, (AutocompleteInput.__proto__ || (0, _getPrototypeOf2.default)(AutocompleteInput)).call(this, props));

        _this.state = {
            value: _this.props.initialValue
        };
        return _this;
    }

    (0, _createClass3.default)(AutocompleteInput, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'label',
                    { htmlFor: 'input-autocomplete' },
                    this.props.label
                ),
                _react2.default.createElement(_reactAutocomplete2.default, {
                    value: this.state.value,
                    inputProps: { id: 'input-autocomplete' },
                    wrapperStyle: {
                        position: 'relative',
                        display: 'inline-block'
                    },
                    items: this.props.values,
                    getItemValue: function getItemValue(item) {
                        return item.name;
                    },
                    shouldItemRender: matchInputToItem,
                    sortItems: sortInput,
                    onChange: function onChange(event, value) {
                        return _this2.setState({ value: value });
                    },
                    onSelect: function onSelect(value) {
                        _this2.setState({ value: value });
                        _this2.props.onSelect(value);
                    },
                    renderMenu: function renderMenu(children) {
                        return _react2.default.createElement(
                            'div',
                            { className: 'react-autocomplete-input' },
                            children
                        );
                    },
                    renderItem: function renderItem(item, isHighlighted) {
                        return _react2.default.createElement(
                            'div',
                            {
                                className: 'item ' + (isHighlighted ? 'item-highlighted' : ''),
                                key: item.abbr
                            },
                            item.name
                        );
                    }
                })
            );
        }
    }]);
    return AutocompleteInput;
}(_react2.default.Component), _class.propTypes = {
    initialValue: _propTypes2.default.string.isRequired,
    label: _propTypes2.default.string.isRequired,
    values: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        name: _propTypes2.default.string,
        abbr: _propTypes2.default.string
    })).isRequired,
    onSelect: _propTypes2.default.func.isRequired
}, _temp);
exports.default = AutocompleteInput;