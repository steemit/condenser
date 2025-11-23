'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _enzymeAdapterReact = require('enzyme-adapter-react-15');

var _enzymeAdapterReact2 = _interopRequireDefault(_enzymeAdapterReact);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global describe, it, before, beforeEach, after, afterEach */
(0, _enzyme.configure)({ adapter: new _enzymeAdapterReact2.default() });

beforeEach(function () {
    global.$STM_Config = {};
});

describe('Header', function () {
    it('contains class .header', function () {
        global.$STM_Config = { read_only_mode: false };
        var header = (0, _enzyme.shallow)(_react2.default.createElement(_index._Header_, { pathname: 'whatever' }));
        console.log(header.closest('header.header'));
        expect(header.closest('header.header').length).toBe(1);
    });
});