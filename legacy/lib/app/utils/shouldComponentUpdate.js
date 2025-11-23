'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

exports.default = function (instance, name) {
    var mixin = _reactAddonsPureRenderMixin2.default.shouldComponentUpdate.bind(instance);
    if (process.env.BROWSER && window.steemDebug_shouldComponentUpdate === undefined) {
        window.steemDebug_shouldComponentUpdate = false; // console command line completion
    }
    return function (nextProps, nextState) {
        var upd = mixin(nextProps, nextState);
        // Usage: steemDebug_shouldComponentUpdate = true
        // Or: steemDebug_shouldComponentUpdate = /Comment/
        if (upd && process.env.BROWSER && window.steemDebug_shouldComponentUpdate) {
            var filter = window.steemDebug_shouldComponentUpdate;
            if (filter.test) {
                if (!filter.test(name)) return upd;
            }
            compare(name, instance.props, nextProps);
            compare(name, instance.state, nextState);
        }
        return upd;
    };
};

exports.compare = compare;

var _reactAddonsPureRenderMixin = require('react-addons-pure-render-mixin');

var _reactAddonsPureRenderMixin2 = _interopRequireDefault(_reactAddonsPureRenderMixin);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function compare(name, a, b) {
    var aKeys = new _set2.default(a && (0, _keys2.default)(a));
    var bKeys = new _set2.default(b && (0, _keys2.default)(b));
    var ab = new _set2.default([].concat((0, _toConsumableArray3.default)(aKeys), (0, _toConsumableArray3.default)(aKeys)));
    ab.forEach(function (key) {
        var hasA = aKeys.has(key);
        var hasB = bKeys.has(key);
        if (!hasA && !hasB) return;
        if (hasA && hasB && a[key] === b[key]) return;
        var desc = !hasA ? 'added' : !hasB ? 'removed' : 'changed';
        console.log(name, key, desc);
        var aKey = a[key];
        var bKey = b[key];
        if (typeof aKey !== 'function' && typeof bKey !== 'function') {
            //functions are too verbose
            console.log(key, 'was', a && toJS(aKey));
            console.log(key, 'is', b && toJS(bKey));
        }
    });
}

/**
    Wrapper for PureRenderMixin.
    This allows debugging that will show which properties changed.
*/


var toJS = function toJS(o) {
    return _immutable.Iterable.isIterable(o) ? o.toJS() : o;
};