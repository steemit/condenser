'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _enzymeAdapterReact = require('enzyme-adapter-react-15');

var _enzymeAdapterReact2 = _interopRequireDefault(_enzymeAdapterReact);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _enzyme.configure)({ adapter: new _enzymeAdapterReact2.default() });

describe('Memo', function () {
    it('should return an empty span if no text is provided', function () {
        var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(_index.Memo, { fromNegativeRepUser: false }));
        expect(wrapper.html()).toEqual('<span></span>');
    });

    it('should render a plain ol memo', function () {
        var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(_index.Memo, { fromNegativeRepUser: false, text: 'hi dude' }));
        expect(wrapper.html()).toEqual('<span class="Memo">hi dude</span>');
    });
});