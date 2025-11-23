'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _addonKnobs = require('@storybook/addon-knobs');

var _RootReducer = require('app/redux/RootReducer');

var _RootReducer2 = _interopRequireDefault(_RootReducer);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _Userpic = require('./Userpic');

var _Userpic2 = _interopRequireDefault(_Userpic);

var _decorators = require('decorators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = (0, _redux.createStore)(_RootReducer2.default);
global.$STM_Config = { img_proxy_prefix: 'https://steemitimages.com/' };

(0, _react3.storiesOf)('Elements', module).addDecorator(_addonKnobs.withKnobs).addDecorator(_decorators.Center).addDecorator(function (getStory) {
    return _react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        getStory()
    );
}).add('Userpic', function () {
    return _react2.default.createElement(_Userpic2.default, { account: 'maitland' });
});