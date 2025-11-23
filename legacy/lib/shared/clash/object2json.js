'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expo = {
    ifObjectToJSON: function ifObjectToJSON(item) {
        if ((typeof item === 'undefined' ? 'undefined' : (0, _typeof3.default)(item)) === 'object') {
            try {
                return (0, _stringify2.default)(item);
            } catch (e) {
                return item;
            }
        }
        return item;
    },

    ifStringParseJSON: function ifStringParseJSON(item) {
        if (typeof item === 'string') {
            try {
                return JSON.parse(item);
            } catch (e) {
                return item;
            }
        }
        return item;
    }
};
exports.default = expo;


exports.test = {
    run: function run() {
        var ob = { a: 2 },
            st = '{"a":2}';
        console.log('test eq1', expo.ifObjectToJSON(ob) == st);
        console.log('test eq2', expo.ifStringParseJSON(st).a == ob.a);
    }
};