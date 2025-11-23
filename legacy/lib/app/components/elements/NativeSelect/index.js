'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NativeSelect = function NativeSelect(_ref) {
    var options = _ref.options,
        className = _ref.className,
        currentlySelected = _ref.currentlySelected,
        onChange = _ref.onChange;

    var handleChange = function handleChange(event) {
        onChange(event.target);
    };

    var opts = options.map(function (val) {
        return _react2.default.createElement(
            'option',
            {
                key: val.name + val.label,
                value: val.value,
                disabled: val.disabled ? val.disabled : false
            },
            val.label
        );
    });

    return _react2.default.createElement(
        'select',
        {
            onChange: handleChange,
            className: 'nativeSelect ' + className,
            value: currentlySelected
        },
        opts
    );
};

NativeSelect.propTypes = {
    options: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        name: _propTypes2.default.string,
        label: _propTypes2.default.string,
        link: _propTypes2.default.string
    })).isRequired,
    onChange: _propTypes2.default.func.isRequired,
    className: _propTypes2.default.string,
    currentlySelected: _propTypes2.default.string.isRequired
};
NativeSelect.defaultProps = {
    className: ''
};

exports.default = NativeSelect;