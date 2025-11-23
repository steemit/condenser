'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toPrimitive = require('babel-runtime/core-js/symbol/to-primitive');

var _toPrimitive2 = _interopRequireDefault(_toPrimitive);

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _getOwnPropertyDescriptors = require('babel-runtime/core-js/object/get-own-property-descriptors');

var _getOwnPropertyDescriptors2 = _interopRequireDefault(_getOwnPropertyDescriptors);

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _getOwnPropertySymbols = require('babel-runtime/core-js/object/get-own-property-symbols');

var _getOwnPropertySymbols2 = _interopRequireDefault(_getOwnPropertySymbols);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _toStringTag = require('babel-runtime/core-js/symbol/to-string-tag');

var _toStringTag2 = _interopRequireDefault(_toStringTag);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _defineProperty4 = require('babel-runtime/core-js/object/define-property');

var _defineProperty5 = _interopRequireDefault(_defineProperty4);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

!function (t, e) {
    if ('object' == (typeof exports === 'undefined' ? 'undefined' : (0, _typeof3.default)(exports)) && 'object' == (typeof module === 'undefined' ? 'undefined' : (0, _typeof3.default)(module))) module.exports = e();else if ('function' == typeof define && define.amd) define([], e);else {
        var o = e();
        for (var n in o) {
            ('object' == (typeof exports === 'undefined' ? 'undefined' : (0, _typeof3.default)(exports)) ? exports : t)[n] = o[n];
        }
    }
}(self, function () {
    return function () {
        var t = {
            239: function _(t) {
                var e = Object.prototype.toString;
                t.exports = function (t) {
                    return e.call(t);
                };
            },
            924: function _(t, e, o) {
                var n = o(569)(_getPrototypeOf2.default, Object);
                t.exports = n;
            },
            569: function _(t) {
                t.exports = function (t, e) {
                    return function (o) {
                        return t(e(o));
                    };
                };
            },
            721: function _(t) {
                var e = Object.prototype.hasOwnProperty;
                t.exports = function (t, o) {
                    return null != t && e.call(t, o);
                };
            },
            469: function _(t) {
                var e = Array.isArray;
                t.exports = e;
            },
            5: function _(t) {
                t.exports = function (t) {
                    return null != t && 'object' == (typeof t === 'undefined' ? 'undefined' : (0, _typeof3.default)(t));
                };
            },
            630: function _(t, e, o) {
                var n = o(239),
                    i = o(924),
                    r = o(5),
                    s = Function.prototype,
                    d = Object.prototype,
                    a = s.toString,
                    p = d.hasOwnProperty,
                    l = a.call(Object);
                t.exports = function (t) {
                    if (!r(t) || '[object Object]' != n(t)) return !1;
                    var e = i(t);
                    if (null === e) return !0;
                    var o = p.call(e, 'constructor') && e.constructor;
                    return 'function' == typeof o && o instanceof o && a.call(o) == l;
                };
            },
            37: function _(t, e, o) {
                var n = o(239),
                    i = o(469),
                    r = o(5);
                t.exports = function (t) {
                    return 'string' == typeof t || !i(t) && r(t) && '[object String]' == n(t);
                };
            }
        },
            e = {};
        function o(n) {
            var i = e[n];
            if (void 0 !== i) return i.exports;
            var r = e[n] = { exports: {} };
            return t[n](r, r.exports, o), r.exports;
        }
        o.n = function (t) {
            var e = t && t.__esModule ? function () {
                return t.default;
            } : function () {
                return t;
            };
            return o.d(e, { a: e }), e;
        }, o.d = function (t, e) {
            for (var n in e) {
                o.o(e, n) && !o.o(t, n) && (0, _defineProperty5.default)(t, n, {
                    enumerable: !0,
                    get: e[n]
                });
            }
        }, o.o = function (t, e) {
            return Object.prototype.hasOwnProperty.call(t, e);
        }, o.r = function (t) {
            'undefined' != typeof _symbol2.default && _toStringTag2.default && (0, _defineProperty5.default)(t, _toStringTag2.default, {
                value: 'Module'
            }), Object.defineProperty(t, '__esModule', { value: !0 });
        };
        var n = {};
        return function () {
            'use strict';

            o.r(n), o.d(n, { initAds: function initAds() {
                    return f;
                } });
            var t = o(721),
                e = o.n(t),
                i = o(630),
                r = o.n(i),
                s = o(37),
                d = o.n(s);
            function a(t, e) {
                var o = (0, _keys2.default)(t);
                if (_getOwnPropertySymbols2.default) {
                    var n = (0, _getOwnPropertySymbols2.default)(t);
                    e && (n = n.filter(function (e) {
                        return (0, _getOwnPropertyDescriptor2.default)(t, e).enumerable;
                    })), o.push.apply(o, n);
                }
                return o;
            }
            function p(t) {
                for (var e = 1; e < arguments.length; e++) {
                    var o = null != arguments[e] ? arguments[e] : {};
                    e % 2 ? a(Object(o), !0).forEach(function (e) {
                        l(t, e, o[e]);
                    }) : _getOwnPropertyDescriptors2.default ? (0, _defineProperties2.default)(t, (0, _getOwnPropertyDescriptors2.default)(o)) : a(Object(o)).forEach(function (e) {
                        (0, _defineProperty5.default)(t, e, (0, _getOwnPropertyDescriptor2.default)(o, e));
                    });
                }
                return t;
            }
            function l(t, e, o) {
                return (e = u(e)) in t ? (0, _defineProperty5.default)(t, e, {
                    value: o,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[e] = o, t;
            }
            function c(t, e) {
                for (var o = 0; o < e.length; o++) {
                    var n = e[o];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, 'value' in n && (n.writable = !0), (0, _defineProperty5.default)(t, u(n.key), n);
                }
            }
            function u(t) {
                var e = function (t, e) {
                    if ('object' != (typeof t === 'undefined' ? 'undefined' : (0, _typeof3.default)(t)) || null === t) return t;
                    var o = t[_toPrimitive2.default];
                    if (void 0 !== o) {
                        var n = o.call(t, e || 'default');
                        if ('object' != (typeof n === 'undefined' ? 'undefined' : (0, _typeof3.default)(n))) return n;
                        throw new TypeError('@@toPrimitive must return a primitive value.');
                    }
                    return ('string' === e ? String : Number)(t);
                }(t, 'string');
                return 'symbol' == (typeof e === 'undefined' ? 'undefined' : (0, _typeof3.default)(e)) ? e : String(e);
            }
            var f = function () {
                function t(e) {
                    !function (t, e) {
                        if (!(t instanceof e)) throw new TypeError('Cannot call a class as a function');
                    }(this, t), this.options = e || {}, this.Init();
                }
                var o, n, i;
                return o = t, n = [{
                    key: 'Init',
                    value: function value() {
                        return e()(this.options, 'wrapper') ? e()(this.options, 'wrapper') && !d()(this.options.wrapper) ? console.error('wrapper must be string') : e()(this.options, 'env') ? [1, 2].indexOf(this.options.env) < 0 ? console.error('env should be number 1 or number 2') : e()(this.options, 'pid') ? e()(this.options, 'pid') && !d()(this.options.pid) ? console.error('pid must be string') : e()(this.options, 'is_mock') ? [0, 1].indexOf(this.options.is_mock) < 0 ? console.error('is_mock should be number 0 or number 1') : e()(this.options, 'lang') && !d()(this.options.lang) ? console.error('lang must be string') : e()(this.options, 'loadSuccessCallback') && 'function' != typeof this.options.loadSuccessCallback ? console.error('loadSuccessCallback must be function') : e()(this.options, 'loadFailCallback') && 'function' != typeof this.options.loadFailCallback ? console.error('loadFailCallback must be function') : e()(this.options, 'clickEventCallback') && 'function' != typeof this.options.clickEventCallback ? console.error('clickEventCallback must be function') : e()(this.options, 'expand') && !r()(this.options.expand) ? console.error('expand must be object') : e()(this.options, 'expand') && e()(this.options.expand, 'uuid') && !d()(this.options.expand.uuid) ? console.error('uuid must be string') : e()(this.options, 'expand') && e()(this.options.expand, 'waddr') && !d()(this.options.expand.waddr) ? console.error('waddr must be string') : e()(this.options, 'expand') && e()(this.options.expand, 'tokenlist') && !d()(this.options.expand.tokenlist) ? console.error('tokenlist must be string') : e()(this.options, 'expand') && e()(this.options.expand, 'txid') && !d()(this.options.expand.txid) ? console.error('txid must be string') : void this.LoadAds() : console.error('is_mock is require') : console.error('pid is require') : console.error('env is require') : console.log('wrapper is require');
                    }
                }, {
                    key: 'LoadAds',
                    value: function value() {
                        var t = this,
                            o = document.getElementById(this.options.wrapper);
                        if (!o) return console.error('wrapper is not found');
                        var n,
                            i,
                            r,
                            s,
                            d,
                            a = 1 === this.options.env ? 'https://test-engine.tronads.io/dist/html' : 'https://engine.tronads.io/html',
                            l = document.getElementById(this.options.wrapper),
                            c = document.createElement('iframe'),
                            u = '';
                        e()(this.options, 'expand') && (u = 'uuid=' + (null !== (i = this.options.expand) && void 0 !== i && i.uuid ? this.options.expand.uuid : '') + '&waddr=' + (null !== (r = this.options.expand) && void 0 !== r && r.waddr ? this.options.expand.waddr : '') + '&tokenlist=' + (null !== (s = this.options.expand) && void 0 !== s && s.tokenlist ? this.options.expand.tokenlist : '') + '&txid=' + (null !== (d = this.options.expand) && void 0 !== d && d.txid ? this.options.expand.txid : ''));
                        var f = encodeURIComponent('env=' + this.options.env + '&pid=' + this.options.pid + '&is_mock=' + this.options.is_mock + '&lang=' + ((null === (n = this.options) || void 0 === n ? void 0 : n.lang) || '') + '&' + u);
                        c.id = 'pid-' + this.options.pid, c.name = 'pid-' + this.options.pid, c.border = 0, c.width = '100%', c.height = '100%', c.marginWidth = 0, c.marginHeight = 0, c.scrolling = !1, c.frameBorder = 0, c.src = a + '/pid-' + this.options.pid + '.html?' + f;
                        var v = document.getElementById('pid-' + this.options.pid);
                        v && o.removeChild(v), window.tronAdSdkFeInterface || (window.tronAdSdkFeInterface = {}), window.tronAdSdkFeInterface.adWindowEventTagArray || (window.tronAdSdkFeInterface.adWindowEventTagArray = []), window.tronAdSdkFeInterface.adWindowEventTagArray.indexOf('ad-event-pid-' + this.options.pid) < 0 && window.tronAdSdkFeInterface.adWindowEventTagArray.push('ad-event-pid-' + this.options.pid);
                        var h = function h(e) {
                            var o, n, i;
                            if (!(['https://test-engine.tronads.io', 'https://engine.tronads.io'].indexOf(e.origin) < 0 || (null == e || null === (o = e.data) || void 0 === o ? void 0 : o.pid) !== t.options.pid && 'defaultIndexPid' !== (null == e || null === (n = e.data) || void 0 === n ? void 0 : n.pid))) if ('initSuccess' === e.data.type) (null === (i = t.options) || void 0 === i ? void 0 : i.loadSuccessCallback) && t.options.loadSuccessCallback(p({}, e.data));else if ('initError' === e.data.type) {
                                var r;
                                (null === (r = t.options) || void 0 === r ? void 0 : r.loadFailCallback) && t.options.loadFailCallback(p({}, e.data));
                            } else if ('clickUrl' === e.data.type) {
                                var s, d, a;
                                null != e && null !== (s = e.data) && void 0 !== s && s.value && window.open(null == e || null === (a = e.data) || void 0 === a ? void 0 : a.value), (null === (d = t.options) || void 0 === d ? void 0 : d.clickEventCallback) && t.options.clickEventCallback(p({}, e.data));
                            }
                        };
                        window.tronAdSdkFeInterface.adWindowEventObj || (window.tronAdSdkFeInterface.adWindowEventObj = {}), Object.hasOwnProperty.call(window.tronAdSdkFeInterface.adWindowEventObj, 'ad-event-pid-' + this.options.pid) && window.removeEventListener('message', window.tronAdSdkFeInterface.adWindowEventObj['ad-event-pid-' + this.options.pid]), window.tronAdSdkFeInterface.adWindowEventObj = p(p({}, window.tronAdSdkFeInterface.adWindowEventObj), {}, (0, _defineProperty3.default)({}, 'ad-event-pid-' + this.options.pid, h)), window.addEventListener('message', h), l.appendChild(c);
                    }
                }, {
                    key: 'unbindMessage',
                    value: function value() {
                        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '';
                        try {
                            if (Object.hasOwnProperty.call(window.tronAdSdkFeInterface.adWindowEventObj, 'ad-event-pid-' + (t || this.options.pid))) return window.removeEventListener('message', window.tronAdSdkFeInterface.adWindowEventObj['ad-event-pid-' + (t || this.options.pid)]), {
                                pid: '' + (t || this.options.pid),
                                status: 'success'
                            };
                        } catch (e) {
                            return {
                                pid: '' + (t || this.options.pid),
                                status: 'fail'
                            };
                        }
                    }
                }], n && c(o.prototype, n), i && c(o, i), Object.defineProperty(o, 'prototype', { writable: !1 }), t;
            }();
        }(), n;
    }();
});