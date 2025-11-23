'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _addonKnobs = require('@storybook/addon-knobs');

var _immutable = require('immutable');

var _RootReducer = require('app/redux/RootReducer');

var _RootReducer2 = _interopRequireDefault(_RootReducer);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _decorators = require('decorators');

var _UserList = require('./UserList');

var _UserList2 = _interopRequireDefault(_UserList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = (0, _redux.createStore)(_RootReducer2.default);

var options = {
    range: true,
    min: 0,
    max: 150,
    step: 1
};

(0, _react3.storiesOf)('Elements', module).addDecorator(_addonKnobs.withKnobs).addDecorator(_decorators.Center).addDecorator(function (getStory) {
    return _react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        getStory()
    );
}).add('UserList', function () {
    var mockUsers = (0, _immutable.List)(Array((0, _addonKnobs.number)('number of users', 10, options)).fill('test'));
    return _react2.default.createElement(_UserList2.default, { users: mockUsers, title: 'User List' });
});