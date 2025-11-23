'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _addonKnobs = require('@storybook/addon-knobs');

var _RootReducer = require('app/redux/RootReducer');

var _RootReducer2 = _interopRequireDefault(_RootReducer);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _Voting = require('./Voting');

var _Voting2 = _interopRequireDefault(_Voting);

var _decorators = require('decorators');

var _reactIntl = require('react-intl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = (0, _redux.createStore)(_RootReducer2.default);

(0, _react3.storiesOf)('Elements', module).addDecorator(_addonKnobs.withKnobs).addDecorator(_decorators.Center).addDecorator(function (getStory) {
    return _react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        getStory()
    );
}).add('Voting', function () {
    return _react2.default.createElement(
        _reactIntl.IntlProvider,
        { locale: 'en' },
        _react2.default.createElement(_Voting2.default, {
            post: 'cool Post',
            post_obj: {
                get: function get(arg) {
                    switch (arg) {
                        case 'is_paidout':
                            return true;
                            break;
                        case 'payout_at':
                            return '2016';
                            break;
                        case 'pending_payout_value':
                            return 5;
                            break;
                        case 'author_payout_value':
                            return 15;
                            break;
                        case 'curator_payout_value':
                            return 13;
                            break;
                        default:
                            return 'cool';
                    }
                },
                getIn: function getIn() {}
            }
        })
    );
});

/*
                store={mockStore}

*/