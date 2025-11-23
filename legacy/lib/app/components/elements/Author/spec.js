'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _RootReducer = require('app/redux/RootReducer');

var _RootReducer2 = _interopRequireDefault(_RootReducer);

var _enzyme = require('enzyme');

var _enzymeAdapterReact = require('enzyme-adapter-react-15');

var _enzymeAdapterReact2 = _interopRequireDefault(_enzymeAdapterReact);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _enzyme.configure)({ adapter: new _enzymeAdapterReact2.default() });

var store = (0, _redux.createStore)(_RootReducer2.default);

describe('<Author />', function () {
    var wrapper = (0, _enzyme.shallow)(_react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        _react2.default.createElement(_index2.default, null)
    ));
    var container = wrapper.instance();

    it('renders without crashing', function () {
        expect(wrapper).toBeTruthy();
        expect(container).toBeTruthy();
        expect(wrapper).toMatchSnapshot();
    });
});