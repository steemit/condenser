'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchInput = function SearchInput(_ref) {
    var type = _ref.type;

    return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
            'form',
            {
                className: 'search-input',
                action: '/static/search.html',
                method: 'GET'
            },
            _react2.default.createElement(
                'svg',
                {
                    className: 'search-input__icon',
                    width: '42',
                    height: '42',
                    viewBox: '0 0 32 32',
                    version: '1.1',
                    xmlns: 'http://www.w3.org/2000/svg'
                },
                _react2.default.createElement(
                    'g',
                    null,
                    _react2.default.createElement('path', {
                        className: 'search-input__path',
                        d: 'M14.3681591,18.5706017 L11.3928571,21.6 L14.3681591,18.5706017 C13.273867,17.6916019 12.5714286,16.3293241 12.5714286,14.8 C12.5714286,12.1490332 14.6820862,10 17.2857143,10 C19.8893424,10 22,12.1490332 22,14.8 C22,17.4509668 19.8893424,19.6 17.2857143,19.6 C16.1841009,19.6 15.1707389,19.215281 14.3681591,18.5706017 Z',
                        id: 'icon-svg'
                    })
                )
            ),
            _react2.default.createElement('input', {
                name: 'q',
                className: 'search-input__inner',
                type: 'search',
                placeholder: (0, _counterpart2.default)('g.search')
            }),
            _react2.default.createElement('button', {
                className: 'input-group-button',
                href: '/static/search.html',
                type: 'submit',
                title: (0, _counterpart2.default)('g.search')
            })
        )
    );
};

exports.default = SearchInput;