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

var _DropdownMenu = require('app/components/elements/DropdownMenu');

var _DropdownMenu2 = _interopRequireDefault(_DropdownMenu);

var _reactRouter = require('react-router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function userLink(name) {
    return _react2.default.createElement(
        _reactRouter.Link,
        { className: 'username', key: name, to: '/@' + name },
        name
    );
}

var UserNames = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(UserNames, _Component);

    function UserNames() {
        (0, _classCallCheck3.default)(this, UserNames);
        return (0, _possibleConstructorReturn3.default)(this, (UserNames.__proto__ || (0, _getPrototypeOf2.default)(UserNames)).apply(this, arguments));
    }

    (0, _createClass3.default)(UserNames, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                names = _props.names,
                size = _props.size;


            if (!names) {
                return null;
            }

            // `size` is max number of names to list before "and <x>"
            if (size >= names.length) {
                // enforce bounds
                size = names.length - 1;
            }

            // if size == 0, there is no "and" in the output
            var and_names = size == 0 ? [] : names.splice(size);

            var out = [];

            // build first portion of output: "name1, name2, name3"
            for (var i = 0; i < names.length; i++) {
                if (i > 0) out.push(_react2.default.createElement(
                    'span',
                    { key: '_comma' + i },
                    ', '
                ));
                out.push(userLink(names[i]));
            }

            // build suffix: " and name4" or " and 3 others" (dropdown if and_names > 1)
            if (and_names.length > 0) {
                out.push(_react2.default.createElement(
                    'span',
                    { key: '_and' },
                    ' and '
                ));
                if (and_names.length == 1) {
                    // and <name>
                    out.push(userLink(and_names[0]));
                } else {
                    // and <x> others...
                    out.push(_react2.default.createElement(_DropdownMenu2.default, {
                        key: '_others',
                        selected: and_names.length + ' others',
                        items: and_names.map(function (name) {
                            return { value: name, link: '/@' + name };
                        }),
                        el: 'div'
                    }));
                }
            }

            return _react2.default.createElement(
                'span',
                { className: 'UserNames' },
                out
            );
        }
    }]);
    return UserNames;
}(_react.Component), _class.propTypes = {
    names: _propTypes2.default.array,
    size: _propTypes2.default.number
}, _class.defaultProps = {
    size: 2
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    return ownProps;
})(UserNames);