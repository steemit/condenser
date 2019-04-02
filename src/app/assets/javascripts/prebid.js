/* prebid.js v2.3.0
Updated : 2019-02-20 */
!(function(u) {
    var s = window.pbjsChunk;
    window.pbjsChunk = function(e, t, n) {
        for (var r, i, o, a = 0, c = []; a < e.length; a++)
            (i = e[a]), d[i] && c.push(d[i][0]), (d[i] = 0);
        for (r in t)
            Object.prototype.hasOwnProperty.call(t, r) && (u[r] = t[r]);
        for (s && s(e, t, n); c.length; ) c.shift()();
        if (n) for (a = 0; a < n.length; a++) o = f((f.s = n[a]));
        return o;
    };
    var n = {},
        d = { 202: 0 };
    function f(e) {
        if (n[e]) return n[e].exports;
        var t = (n[e] = { i: e, l: !1, exports: {} });
        return u[e].call(t.exports, t, t.exports, f), (t.l = !0), t.exports;
    }
    (f.m = u),
        (f.c = n),
        (f.d = function(e, t, n) {
            f.o(e, t) ||
                Object.defineProperty(e, t, {
                    configurable: !1,
                    enumerable: !0,
                    get: n,
                });
        }),
        (f.n = function(e) {
            var t =
                e && e.__esModule
                    ? function() {
                          return e.default;
                      }
                    : function() {
                          return e;
                      };
            return f.d(t, 'a', t), t;
        }),
        (f.o = function(e, t) {
            return Object.prototype.hasOwnProperty.call(e, t);
        }),
        (f.p = ''),
        (f.oe = function(e) {
            throw (console.error(e), e);
        }),
        f((f.s = 489));
})({
    0: function(e, t, n) {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 }),
            n.d(t, 'internal', function() {
                return C;
            }),
            (t.replaceTokenInString = function(i, e, o) {
                return (
                    $(e, function(e, t) {
                        e = void 0 === e ? '' : e;
                        var n = o + t.toUpperCase() + o,
                            r = new RegExp(n, 'g');
                        i = i.replace(r, e);
                    }),
                    i
                );
            }),
            (t.getUniqueIdentifierStr = B),
            (t.generateUUID = function e(t) {
                return t
                    ? (t ^ (U() >> (t / 4))).toString(16)
                    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, e);
            }),
            (t.getBidIdParameter = function(e, t) {
                if (t && t[e]) return t[e];
                return '';
            }),
            (t.tryAppendQueryString = function(e, t, n) {
                if (n) return (e += t + '=' + encodeURIComponent(n) + '&');
                return e;
            }),
            (t.parseQueryStringParameters = function(e) {
                var t = '';
                for (var n in e)
                    e.hasOwnProperty(n) &&
                        (t += n + '=' + encodeURIComponent(e[n]) + '&');
                return t;
            }),
            (t.transformAdServerTargetingObj = function(t) {
                return t && 0 < Object.getOwnPropertyNames(t).length
                    ? ue(t)
                          .map(function(e) {
                              return ''
                                  .concat(e, '=')
                                  .concat(encodeURIComponent(se(t, e)));
                          })
                          .join('&')
                    : '';
            }),
            (t.getAdUnitSizes = function(e) {
                if (!e) return;
                var t = [];
                if (
                    e.mediaTypes &&
                    e.mediaTypes.banner &&
                    Array.isArray(e.mediaTypes.banner.sizes)
                ) {
                    var n = e.mediaTypes.banner.sizes;
                    Array.isArray(n[0]) ? (t = n) : t.push(n);
                } else
                    Array.isArray(e.sizes) &&
                        (Array.isArray(e.sizes[0])
                            ? (t = e.sizes)
                            : t.push(e.sizes));
                return t;
            }),
            (t.parseSizesInput = function(e) {
                var t = [];
                if ('string' == typeof e) {
                    var n = e.split(','),
                        r = /^(\d)+x(\d)+$/i;
                    if (n)
                        for (var i in n)
                            ee(n, i) && n[i].match(r) && t.push(n[i]);
                } else if ('object' === l(e)) {
                    var o = e.length;
                    if (0 < o)
                        if (
                            2 === o &&
                            'number' == typeof e[0] &&
                            'number' == typeof e[1]
                        )
                            t.push(R(e));
                        else for (var a = 0; a < o; a++) t.push(R(e[a]));
                }
                return t;
            }),
            (t.parseGPTSingleSizeArray = R),
            (t.getTopWindowLocation = N),
            (t.getTopFrameReferrer = D),
            (t.getAncestorOrigins = k),
            (t.getWindowTop = P),
            (t.getWindowSelf = x),
            (t.getWindowLocation = q),
            (t.getTopWindowUrl = function() {
                var t;
                try {
                    t = C.getTopWindowLocation().href;
                } catch (e) {
                    t = '';
                }
                return t;
            }),
            (t.getTopWindowReferrer = function() {
                try {
                    return window.top.document.referrer;
                } catch (e) {
                    return document.referrer;
                }
            }),
            (t.logMessage = G),
            (t.logInfo = M),
            (t.logWarn = W),
            (t.logError = z),
            (t.hasConsoleLogger = function() {
                return A;
            }),
            (t.debugTurnedOn = F),
            (t.createInvisibleIframe = function() {
                var e = document.createElement('iframe');
                return (
                    (e.id = B()),
                    (e.height = 0),
                    (e.width = 0),
                    (e.border = '0px'),
                    (e.hspace = '0'),
                    (e.vspace = '0'),
                    (e.marginWidth = '0'),
                    (e.marginHeight = '0'),
                    (e.style.border = '0'),
                    (e.scrolling = 'no'),
                    (e.frameBorder = '0'),
                    (e.src = 'about:blank'),
                    (e.style.display = 'none'),
                    e
                );
            }),
            (t.getParameterByName = V),
            (t.hasValidBidRequest = function(e, n, t) {
                var r = !1;
                function i(e, t) {
                    t === n[o] && (r = !0);
                }
                for (var o = 0; o < n.length; o++)
                    if (((r = !1), $(e, i), !r))
                        return (
                            z(
                                'Params are missing for bid request. One of these required paramaters are missing: ' +
                                    n,
                                t
                            ),
                            !1
                        );
                return !0;
            }),
            (t.addEventHandler = function(e, t, n) {
                e.addEventListener
                    ? e.addEventListener(t, n, !0)
                    : e.attachEvent && e.attachEvent('on' + t, n);
            }),
            (t.isA = H),
            (t.isFn = K),
            (t.isStr = Y),
            (t.isArray = J),
            (t.isNumber = Q),
            (t.isPlainObject = function(e) {
                return H(e, h);
            }),
            (t.isBoolean = function(e) {
                return H(e, E);
            }),
            (t.isEmpty = X),
            (t.isEmptyStr = function(e) {
                return Y(e) && (!e || 0 === e.length);
            }),
            (t._each = $),
            (t.contains = function(e, t) {
                if (X(e)) return !1;
                if (K(e.indexOf)) return -1 !== e.indexOf(t);
                var n = e.length;
                for (; n--; ) if (e[n] === t) return !0;
                return !1;
            }),
            n.d(t, 'indexOf', function() {
                return Z;
            }),
            (t._map = function(n, r) {
                if (X(n)) return [];
                if (K(n.map)) return n.map(r);
                var i = [];
                return (
                    $(n, function(e, t) {
                        i.push(r(e, t, n));
                    }),
                    i
                );
            }),
            (t.insertElement = te),
            (t.triggerPixel = ne),
            (t.callBurl = function(e) {
                var t = e.source,
                    n = e.burl;
                t === g.S2S.SRC && n && C.triggerPixel(n);
            }),
            (t.insertHtmlIntoIframe = function(e) {
                if (!e) return;
                var t = document.createElement('iframe');
                (t.id = B()),
                    (t.width = 0),
                    (t.height = 0),
                    (t.hspace = '0'),
                    (t.vspace = '0'),
                    (t.marginWidth = '0'),
                    (t.marginHeight = '0'),
                    (t.style.display = 'none'),
                    (t.style.height = '0px'),
                    (t.style.width = '0px'),
                    (t.scrolling = 'no'),
                    (t.frameBorder = '0'),
                    (t.allowtransparency = 'true'),
                    C.insertElement(t, document, 'body'),
                    t.contentWindow.document.open(),
                    t.contentWindow.document.write(e),
                    t.contentWindow.document.close();
            }),
            (t.insertUserSyncIframe = re),
            (t.createTrackPixelHtml = function(e) {
                if (!e) return '';
                var t = encodeURI(e),
                    n =
                        '<div style="position:absolute;left:0px;top:0px;visibility:hidden;">';
                return (n += '<img src="' + t + '"></div>');
            }),
            (t.createTrackPixelIframeHtml = ie),
            (t.getIframeDocument = function(e) {
                if (!e) return;
                var t;
                try {
                    t = e.contentWindow
                        ? e.contentWindow.document
                        : e.contentDocument.document
                          ? e.contentDocument.document
                          : e.contentDocument;
                } catch (e) {
                    C.logError('Cannot get iframe document', e);
                }
                return t;
            }),
            (t.getValueString = oe),
            (t.uniques = ae),
            (t.flatten = ce),
            (t.getBidRequest = function(n, e) {
                return n
                    ? (e.some(function(e) {
                          var t = c()(e.bids, function(t) {
                              return ['bidId', 'adId', 'bid_id'].some(function(
                                  e
                              ) {
                                  return t[e] === n;
                              });
                          });
                          return t && (r = t), t;
                      }),
                      r)
                    : void 0;
                var r;
            }),
            (t.getKeys = ue),
            (t.getValue = se),
            (t.getBidderCodes = function() {
                return (0 < arguments.length && void 0 !== arguments[0]
                    ? arguments[0]
                    : pbjs.adUnits
                )
                    .map(function(e) {
                        return e.bids
                            .map(function(e) {
                                return e.bidder;
                            })
                            .reduce(ce, []);
                    })
                    .reduce(ce)
                    .filter(ae);
            }),
            (t.isGptPubadsDefined = function() {
                if (
                    window.googletag &&
                    K(window.googletag.pubads) &&
                    K(window.googletag.pubads().getSlots)
                )
                    return !0;
            }),
            n.d(t, 'getHighestCpm', function() {
                return de;
            }),
            n.d(t, 'getOldestHighestCpmBid', function() {
                return fe;
            }),
            n.d(t, 'getLatestHighestCpmBid', function() {
                return le;
            }),
            (t.shuffle = function(e) {
                var t = e.length;
                for (; 0 < t; ) {
                    var n = Math.floor(Math.random() * t),
                        r = e[--t];
                    (e[t] = e[n]), (e[n] = r);
                }
                return e;
            }),
            (t.adUnitsFilter = function(e, t) {
                return s()(e, t && t.adUnitCode);
            }),
            (t.isSrcdocSupported = function(e) {
                return (
                    e.defaultView &&
                    e.defaultView.frameElement &&
                    'srcdoc' in e.defaultView.frameElement &&
                    !/firefox/i.test(navigator.userAgent)
                );
            }),
            (t.deepClone = function(e) {
                return o()(e);
            }),
            (t.inIframe = pe),
            (t.isSafariBrowser = function() {
                return /^((?!chrome|android).)*safari/i.test(
                    navigator.userAgent
                );
            }),
            (t.replaceAuctionPrice = function(e, t) {
                if (!e) return;
                return e.replace(/\$\{AUCTION_PRICE\}/g, t);
            }),
            (t.timestamp = function() {
                return new Date().getTime();
            }),
            (t.checkCookieSupport = be),
            (t.cookiesAreEnabled = function() {
                if (C.checkCookieSupport()) return !0;
                return (
                    (window.document.cookie = 'prebid.cookieTest'),
                    -1 != window.document.cookie.indexOf('prebid.cookieTest')
                );
            }),
            (t.getCookie = function(e) {
                var t = window.document.cookie.match(
                    '(^|;)\\s*' + e + '\\s*=\\s*([^;]*)\\s*(;|$)'
                );
                return t ? decodeURIComponent(t[2]) : null;
            }),
            (t.delayExecution = function(e, t) {
                if (t < 1)
                    throw new Error(
                        'numRequiredCalls must be a positive number. Got '.concat(
                            t
                        )
                    );
                var n = 0;
                return function() {
                    ++n === t && e.apply(null, arguments);
                };
            }),
            (t.groupBy = function(e, n) {
                return e.reduce(function(e, t) {
                    return (e[t[n]] = e[t[n]] || []).push(t), e;
                }, {});
            }),
            (t.deepAccess = function(e, t) {
                if (!e) return;
                t = String(t).split('.');
                for (var n = 0; n < t.length; n++)
                    if (void 0 === (e = e[t[n]])) return;
                return e;
            }),
            (t.createContentToExecuteExtScriptInFriendlyFrame = function(e) {
                return e
                    ? '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html><head><base target="_top" /><script>inDapIF=true;</script></head><body>\x3c!--PRE_SCRIPT_TAG_MACRO--\x3e<script src="'.concat(
                          e,
                          '"></script>\x3c!--POST_SCRIPT_TAG_MACRO--\x3e</body></html>'
                      )
                    : '';
            }),
            (t.getDefinedParams = function(n, e) {
                return e
                    .filter(function(e) {
                        return n[e];
                    })
                    .reduce(function(e, t) {
                        return f(
                            e,
                            (function(e, t, n) {
                                t in e
                                    ? Object.defineProperty(e, t, {
                                          value: n,
                                          enumerable: !0,
                                          configurable: !0,
                                          writable: !0,
                                      })
                                    : (e[t] = n);
                                return e;
                            })({}, t, n[t])
                        );
                    }, {});
            }),
            (t.isValidMediaTypes = function(e) {
                var t = ['banner', 'native', 'video'];
                if (
                    !Object.keys(e).every(function(e) {
                        return s()(t, e);
                    })
                )
                    return !1;
                if (e.video && e.video.context)
                    return s()(['instream', 'outstream'], e.video.context);
                return !0;
            }),
            (t.getBidderRequest = function(e, t, n) {
                return (
                    c()(e, function(e) {
                        return (
                            0 <
                            e.bids.filter(function(e) {
                                return e.bidder === t && e.adUnitCode === n;
                            }).length
                        );
                    }) || { start: null, auctionId: null }
                );
            }),
            (t.getUserConfiguredParams = function(e, t, n) {
                return e
                    .filter(function(e) {
                        return e.code === t;
                    })
                    .map(function(e) {
                        return e.bids;
                    })
                    .reduce(ce, [])
                    .filter(function(e) {
                        return e.bidder === n;
                    })
                    .map(function(e) {
                        return e.params || {};
                    });
            }),
            (t.getOrigin = function() {
                return window.location.origin
                    ? window.location.origin
                    : window.location.protocol +
                          '//' +
                          window.location.hostname +
                          (window.location.port
                              ? ':' + window.location.port
                              : '');
            }),
            (t.getDNT = function() {
                return (
                    '1' === navigator.doNotTrack ||
                    '1' === window.doNotTrack ||
                    '1' === navigator.msDoNotTrack ||
                    'yes' === navigator.doNotTrack
                );
            }),
            (t.isAdUnitCodeMatchingSlot = function(t) {
                return function(e) {
                    return ye(t, e);
                };
            }),
            (t.isSlotMatchingAdUnitCode = function(t) {
                return function(e) {
                    return ye(e, t);
                };
            }),
            (t.unsupportedBidderMessage = function(e, t) {
                var n = Object.keys(e.mediaTypes || { banner: 'banner' }).join(
                    ', '
                );
                return '\n    '
                    .concat(e.code, ' is a ')
                    .concat(
                        n,
                        " ad unit\n    containing bidders that don't support "
                    )
                    .concat(n, ': ')
                    .concat(t, ".\n    This bidder won't fetch demand.\n  ");
            }),
            (t.deletePropertyFromObject = ve),
            (t.removeRequestId = function(e) {
                return ve(e, 'requestId');
            }),
            (t.isInteger = me),
            (t.convertCamelToUnderscore = function(e) {
                return e
                    .replace(/(?:^|\.?)([A-Z])/g, function(e, t) {
                        return '_' + t.toLowerCase();
                    })
                    .replace(/^_/, '');
            }),
            (t.transformBidderParamKeywords = function(e) {
                var r =
                        1 < arguments.length && void 0 !== arguments[1]
                            ? arguments[1]
                            : 'keywords',
                    i = [];
                return (
                    $(e, function(e, t) {
                        if (J(e)) {
                            var n = [];
                            $(e, function(e) {
                                ((e = oe(r + '.' + t, e)) || '' === e) &&
                                    n.push(e);
                            }),
                                (e = n);
                        } else {
                            if (!Y((e = oe(r + '.' + t, e)))) return;
                            e = [e];
                        }
                        i.push({ key: t, value: e });
                    }),
                    i
                );
            }),
            (t.convertTypes = function(r, i) {
                return (
                    Object.keys(r).forEach(function(e) {
                        var t, n;
                        i[e] &&
                            (K(r[e])
                                ? (i[e] = r[e](i[e]))
                                : (i[e] = ((t = r[e]),
                                  (n = i[e]),
                                  'string' === t
                                      ? n && n.toString()
                                      : 'number' === t ? Number(n) : n)),
                            isNaN(i[e]) && delete i.key);
                    }),
                    i
                );
            }),
            (t.isArrayOfNums = function(e, t) {
                return (
                    J(e) &&
                    (!t || e.length === t) &&
                    e.every(function(e) {
                        return me(e);
                    })
                );
            });
        var r = n(3),
            i = n(69),
            o = n.n(i),
            a = n(10),
            c = n.n(a),
            u = n(7),
            s = n.n(u),
            d = n(11);
        function f() {
            return (f =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        function l(e) {
            return (l =
                'function' == typeof Symbol &&
                'symbol' == typeof Symbol.iterator
                    ? function(e) {
                          return typeof e;
                      }
                    : function(e) {
                          return e &&
                              'function' == typeof Symbol &&
                              e.constructor === Symbol &&
                              e !== Symbol.prototype
                              ? 'symbol'
                              : typeof e;
                      })(e);
        }
        var g = n(4),
            p = !1,
            b = 'Array',
            y = 'String',
            v = 'Function',
            m = 'Number',
            h = 'Object',
            E = 'Boolean',
            S = Object.prototype.toString,
            T = Boolean(window.console),
            A = Boolean(T && window.console.log),
            I = Boolean(T && window.console.info),
            O = Boolean(T && window.console.warn),
            w = Boolean(T && window.console.error),
            C = {
                checkCookieSupport: be,
                createTrackPixelIframeHtml: ie,
                getWindowSelf: x,
                getWindowTop: P,
                getAncestorOrigins: k,
                getTopFrameReferrer: D,
                getWindowLocation: q,
                getTopWindowLocation: N,
                insertUserSyncIframe: re,
                insertElement: te,
                isFn: K,
                triggerPixel: ne,
                logError: z,
                logWarn: W,
                logMessage: G,
                logInfo: M,
            };
        var j,
            _ = ((j = 0),
            function() {
                return ++j;
            });
        function B() {
            return (
                _() +
                Math.random()
                    .toString(16)
                    .substr(2)
            );
        }
        function U() {
            return window && window.crypto && window.crypto.getRandomValues
                ? crypto.getRandomValues(new Uint8Array(1))[0] % 16
                : 16 * Math.random();
        }
        function R(e) {
            if (J(e) && 2 === e.length && !isNaN(e[0]) && !isNaN(e[1]))
                return e[0] + 'x' + e[1];
        }
        function N() {
            if (pe()) {
                var e;
                try {
                    e = C.getAncestorOrigins() || C.getTopFrameReferrer();
                } catch (e) {
                    M('could not obtain top window location', e);
                }
                if (e) return Object(d.c)(e, { decodeSearchAsString: !0 });
            }
            return C.getWindowLocation();
        }
        function D() {
            try {
                window.top.location.toString();
                for (
                    var e, t = '';
                    (e = e ? e.parent : window).document &&
                        e.document.referrer &&
                        (t = e.document.referrer),
                        e !== window.top;

                );
                return t;
            } catch (e) {
                return window.document.referrer;
            }
        }
        function k() {
            if (
                window.document.location &&
                window.document.location.ancestorOrigins &&
                1 <= window.document.location.ancestorOrigins.length
            )
                return window.document.location.ancestorOrigins[
                    window.document.location.ancestorOrigins.length - 1
                ];
        }
        function P() {
            return window.top;
        }
        function x() {
            return window.self;
        }
        function q() {
            return window.location;
        }
        function G() {
            F() && A && console.log.apply(console, L(arguments, 'MESSAGE:'));
        }
        function M() {
            F() && I && console.info.apply(console, L(arguments, 'INFO:'));
        }
        function W() {
            F() && O && console.warn.apply(console, L(arguments, 'WARNING:'));
        }
        function z() {
            F() && w && console.error.apply(console, L(arguments, 'ERROR:'));
        }
        function L(e, t) {
            return (
                (e = [].slice.call(e)),
                t && e.unshift(t),
                e.unshift(
                    'display: inline-block; color: #fff; background: #3b88c3; padding: 1px 4px; border-radius: 3px;'
                ),
                e.unshift('%cPrebid'),
                e
            );
        }
        function F() {
            if (!1 === r.config.getConfig('debug') && !1 === p) {
                var e = 'TRUE' === V(g.DEBUG_MODE).toUpperCase();
                r.config.setConfig({ debug: e }), (p = !0);
            }
            return !!r.config.getConfig('debug');
        }
        function V(e) {
            var t = new RegExp('[\\?&]' + e + '=([^&#]*)').exec(
                window.location.search
            );
            return null === t
                ? ''
                : decodeURIComponent(t[1].replace(/\+/g, ' '));
        }
        function H(e, t) {
            return S.call(e) === '[object ' + t + ']';
        }
        function K(e) {
            return H(e, v);
        }
        function Y(e) {
            return H(e, y);
        }
        function J(e) {
            return H(e, b);
        }
        function Q(e) {
            return H(e, m);
        }
        function X(e) {
            if (!e) return !0;
            if (J(e) || Y(e)) return !(0 < e.length);
            for (var t in e) if (hasOwnProperty.call(e, t)) return !1;
            return !0;
        }
        function $(e, t) {
            if (!X(e)) {
                if (K(e.forEach)) return e.forEach(t, this);
                var n = 0,
                    r = e.length;
                if (0 < r) for (; n < r; n++) t(e[n], n, e);
                else
                    for (n in e)
                        hasOwnProperty.call(e, n) && t.call(this, e[n], n);
            }
        }
        var Z = (function() {
            if (Array.prototype.indexOf) return Array.prototype.indexOf;
        })();
        var ee = function(e, t) {
            return e.hasOwnProperty
                ? e.hasOwnProperty(t)
                : void 0 !== e[t] && e.constructor.prototype[t] !== e[t];
        };
        function te(e, t, n, r) {
            var i;
            (t = t || document),
                (i = n
                    ? t.getElementsByTagName(n)
                    : t.getElementsByTagName('head'));
            try {
                if (
                    (i = i.length ? i : t.getElementsByTagName('body')).length
                ) {
                    i = i[0];
                    var o = r ? null : i.firstChild;
                    return i.insertBefore(e, o);
                }
            } catch (e) {}
        }
        function ne(e, t) {
            var n = new Image();
            t &&
                C.isFn(t) &&
                (n.addEventListener('load', t), n.addEventListener('error', t)),
                (n.src = e);
        }
        function re(e, t) {
            var n = C.createTrackPixelIframeHtml(
                    e,
                    !1,
                    'allow-scripts allow-same-origin'
                ),
                r = document.createElement('div');
            r.innerHTML = n;
            var i = r.firstChild;
            t &&
                C.isFn(t) &&
                (i.addEventListener('load', t), i.addEventListener('error', t)),
                C.insertElement(i, document, 'html', !0);
        }
        function ie(e) {
            var t =
                    !(1 < arguments.length && void 0 !== arguments[1]) ||
                    arguments[1],
                n =
                    2 < arguments.length && void 0 !== arguments[2]
                        ? arguments[2]
                        : '';
            return e
                ? (t && (e = encodeURI(e)),
                  n && (n = 'sandbox="'.concat(n, '"')),
                  '<iframe '
                      .concat(n, ' id="')
                      .concat(
                          B(),
                          '"\n      frameborder="0"\n      allowtransparency="true"\n      marginheight="0" marginwidth="0"\n      width="0" hspace="0" vspace="0" height="0"\n      style="height:0px;width:0px;display:none;"\n      scrolling="no"\n      src="'
                      )
                      .concat(e, '">\n    </iframe>'))
                : '';
        }
        function oe(e, t, n) {
            return null == t
                ? n
                : Y(t)
                  ? t
                  : Q(t)
                    ? t.toString()
                    : void C.logWarn(
                          'Unsuported type for param: ' +
                              e +
                              ' required type: String'
                      );
        }
        function ae(e, t, n) {
            return n.indexOf(e) === t;
        }
        function ce(e, t) {
            return e.concat(t);
        }
        function ue(e) {
            return Object.keys(e);
        }
        function se(e, t) {
            return e[t];
        }
        var de = ge('timeToRespond', function(e, t) {
                return t < e;
            }),
            fe = ge('responseTimestamp', function(e, t) {
                return t < e;
            }),
            le = ge('responseTimestamp', function(e, t) {
                return e < t;
            });
        function ge(n, r) {
            return function(e, t) {
                return e.cpm === t.cpm
                    ? r(e[n], t[n]) ? t : e
                    : e.cpm < t.cpm ? t : e;
            };
        }
        function pe() {
            try {
                return C.getWindowSelf() !== C.getWindowTop();
            } catch (e) {
                return !0;
            }
        }
        function be() {
            if (window.navigator.cookieEnabled || document.cookie.length)
                return !0;
        }
        var ye = function(e, t) {
            return e.getAdUnitPath() === t || e.getSlotElementId() === t;
        };
        function ve(e, t) {
            var n = f({}, e);
            return delete n[t], n;
        }
        function me(e) {
            return Number.isInteger
                ? Number.isInteger(e)
                : 'number' == typeof e && isFinite(e) && Math.floor(e) === e;
        }
    },
    1: function(e, t, n) {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 }),
            (t.registerBidder = function(t) {
                var n = Array.isArray(t.supportedMediaTypes)
                    ? { supportedMediaTypes: t.supportedMediaTypes }
                    : void 0;
                function r(e) {
                    var t = S(e);
                    i.default.registerBidAdapter(t, e.code, n);
                }
                r(t),
                    Array.isArray(t.aliases) &&
                        t.aliases.forEach(function(e) {
                            (i.default.aliasRegistry[e] = t.code),
                                r(h({}, t, { code: e }));
                        });
            }),
            (t.newBidder = S),
            (t.isValid = T);
        var r = n(28),
            i = n(8),
            o = n(3),
            p = n(14),
            a = n(19),
            c = n(18),
            u = n(42),
            s = n(4),
            b = n.n(s),
            d = n(9),
            y = n.n(d),
            f = n(7),
            l = n.n(f),
            v = n(0);
        function g(e, t) {
            return (
                (function(e) {
                    if (Array.isArray(e)) return e;
                })(e) ||
                (function(e, t) {
                    var n = [],
                        r = !0,
                        i = !1,
                        o = void 0;
                    try {
                        for (
                            var a, c = e[Symbol.iterator]();
                            !(r = (a = c.next()).done) &&
                            (n.push(a.value), !t || n.length !== t);
                            r = !0
                        );
                    } catch (e) {
                        (i = !0), (o = e);
                    } finally {
                        try {
                            r || null == c.return || c.return();
                        } finally {
                            if (i) throw o;
                        }
                    }
                    return n;
                })(e, t) ||
                (function() {
                    throw new TypeError(
                        'Invalid attempt to destructure non-iterable instance'
                    );
                })()
            );
        }
        function m(e) {
            return (m =
                'function' == typeof Symbol &&
                'symbol' == typeof Symbol.iterator
                    ? function(e) {
                          return typeof e;
                      }
                    : function(e) {
                          return e &&
                              'function' == typeof Symbol &&
                              e.constructor === Symbol &&
                              e !== Symbol.prototype
                              ? 'symbol'
                              : typeof e;
                      })(e);
        }
        function h() {
            return (h =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        var E = [
            'requestId',
            'cpm',
            'ttl',
            'creativeId',
            'netRevenue',
            'currency',
        ];
        function S(f) {
            return h(new r.a(f.code), {
                getSpec: function() {
                    return Object.freeze(f);
                },
                registerSyncs: l,
                callBids: function(o, a, e, n) {
                    if (Array.isArray(o.bids)) {
                        var c = {},
                            u = [],
                            t = o.bids.filter(g);
                        if (0 !== t.length) {
                            var s = {};
                            t.forEach(function(e) {
                                (s[e.bidId] = e).adUnitCode ||
                                    (e.adUnitCode = e.placementCode);
                            });
                            var r = f.buildRequests(t, o);
                            if (r && 0 !== r.length) {
                                Array.isArray(r) || (r = [r]);
                                var d = Object(v.delayExecution)(i, r.length);
                                r.forEach(function(i) {
                                    switch (i.method) {
                                        case 'GET':
                                            n(
                                                ''.concat(i.url).concat(
                                                    (function(e) {
                                                        if (e)
                                                            return '?'.concat(
                                                                'object' ===
                                                                m(e)
                                                                    ? Object(
                                                                          v.parseQueryStringParameters
                                                                      )(e)
                                                                    : e
                                                            );
                                                        return '';
                                                    })(i.data)
                                                ),
                                                { success: e, error: t },
                                                void 0,
                                                h(
                                                    {
                                                        method: 'GET',
                                                        withCredentials: !0,
                                                    },
                                                    i.options
                                                )
                                            );
                                            break;
                                        case 'POST':
                                            n(
                                                i.url,
                                                { success: e, error: t },
                                                'string' == typeof i.data
                                                    ? i.data
                                                    : JSON.stringify(i.data),
                                                h(
                                                    {
                                                        method: 'POST',
                                                        contentType:
                                                            'text/plain',
                                                        withCredentials: !0,
                                                    },
                                                    i.options
                                                )
                                            );
                                            break;
                                        default:
                                            Object(v.logWarn)(
                                                'Skipping invalid request from '
                                                    .concat(
                                                        f.code,
                                                        '. Request type '
                                                    )
                                                    .concat(
                                                        i.type,
                                                        ' must be GET or POST'
                                                    )
                                            ),
                                                d();
                                    }
                                    function e(e, t) {
                                        try {
                                            e = JSON.parse(e);
                                        } catch (e) {}
                                        var n;
                                        (e = {
                                            body: e,
                                            headers: {
                                                get: t.getResponseHeader.bind(
                                                    t
                                                ),
                                            },
                                        }),
                                            u.push(e);
                                        try {
                                            n = f.interpretResponse(e, i);
                                        } catch (e) {
                                            return (
                                                Object(v.logError)(
                                                    'Bidder '.concat(
                                                        f.code,
                                                        " failed to interpret the server's response. Continuing without bids"
                                                    ),
                                                    null,
                                                    e
                                                ),
                                                void d()
                                            );
                                        }
                                        function r(e) {
                                            var t,
                                                n,
                                                r = s[e.requestId];
                                            if (r) {
                                                var i = h(
                                                    Object(p.a)(
                                                        b.a.STATUS.GOOD,
                                                        r
                                                    ),
                                                    e
                                                );
                                                (t = r.adUnitCode),
                                                    (n = i),
                                                    (c[t] = !0),
                                                    T(t, n, [o]) && a(t, n);
                                            } else Object(v.logWarn)('Bidder '.concat(f.code, ' made bid for unknown request ID: ').concat(e.requestId, '. Ignoring.'));
                                        }
                                        n && (n.forEach ? n.forEach(r) : r(n)),
                                            d(n);
                                    }
                                    function t(e) {
                                        Object(v.logError)(
                                            'Server call for '
                                                .concat(f.code, ' failed: ')
                                                .concat(
                                                    e,
                                                    '. Continuing without bids.'
                                                )
                                        ),
                                            d();
                                    }
                                });
                            } else i();
                        } else i();
                    }
                    function i() {
                        e(),
                            y.a.emit(b.a.EVENTS.BIDDER_DONE, o),
                            l(u, o.gdprConsent);
                    }
                },
            });
            function l(e, t) {
                if (f.getUserSyncs) {
                    var n = o.config.getConfig('userSync.filterSettings'),
                        r = f.getUserSyncs(
                            {
                                iframeEnabled: !!(
                                    o.config.getConfig(
                                        'userSync.iframeEnabled'
                                    ) ||
                                    (n && (n.iframe || n.all))
                                ),
                                pixelEnabled: !!(
                                    o.config.getConfig(
                                        'userSync.pixelEnabled'
                                    ) ||
                                    (n && (n.image || n.all))
                                ),
                            },
                            e,
                            t
                        );
                    r &&
                        (Array.isArray(r) || (r = [r]),
                        r.forEach(function(e) {
                            a.a.registerSync(e.type, f.code, e.url);
                        }));
                }
            }
            function g(e) {
                return (
                    !!f.isBidRequestValid(e) ||
                    (Object(v.logWarn)(
                        'Invalid bid sent to bidder '
                            .concat(f.code, ': ')
                            .concat(JSON.stringify(e))
                    ),
                    !1)
                );
            }
        }
        function T(e, t, n) {
            function r(e) {
                return 'Invalid bid from '
                    .concat(t.bidderCode, '. Ignoring bid: ')
                    .concat(e);
            }
            return e
                ? t
                  ? ((i = Object.keys(t)),
                    E.every(function(e) {
                        return l()(i, e) && !l()([void 0, null], t[e]);
                    })
                        ? 'native' !== t.mediaType || Object(c.e)(t, n)
                          ? 'video' !== t.mediaType || Object(u.b)(t, n)
                            ? !(
                                  'banner' === t.mediaType &&
                                  !(function(e, t, n) {
                                      if (
                                          (t.width || 0 === t.width) &&
                                          (t.height || 0 === t.height)
                                      )
                                          return !0;
                                      var r = Object(v.getBidderRequest)(
                                              n,
                                              t.bidderCode,
                                              e
                                          ),
                                          i =
                                              r &&
                                              r.bids &&
                                              r.bids[0] &&
                                              r.bids[0].sizes,
                                          o = Object(v.parseSizesInput)(i);
                                      if (1 !== o.length) return !1;
                                      var a = g(o[0].split('x'), 2),
                                          c = a[0],
                                          u = a[1];
                                      return (t.width = c), (t.height = u), !0;
                                  })(e, t, n)
                              ) ||
                              (Object(v.logError)(
                                  r('Banner bids require a width and height')
                              ),
                              !1)
                            : (Object(v.logError)(
                                  r(
                                      'Video bid does not have required vastUrl or renderer property'
                                  )
                              ),
                              !1)
                          : (Object(v.logError)(
                                r(
                                    'Native bid missing some required properties.'
                                )
                            ),
                            !1)
                        : (Object(v.logError)(
                              r(
                                  'Bidder '.concat(
                                      t.bidderCode,
                                      ' is missing required params. Check http://prebid.org/dev-docs/bidder-adapter-1.html for list of params.'
                                  )
                              )
                          ),
                          !1))
                  : (Object(v.logWarn)(
                        'Some adapter tried to add an undefined bid for '.concat(
                            e,
                            '.'
                        )
                    ),
                    !1)
                : (Object(v.logWarn)(
                      'No adUnitCode was supplied to addBidResponse.'
                  ),
                  !1);
            var i;
        }
    },
    10: function(e, t, n) {
        n(48), (e.exports = n(13).Array.find);
    },
    108: function(e, t, n) {
        'use strict';
        var r = n(15),
            i = n(34)(6),
            o = 'findIndex',
            a = !0;
        o in [] &&
            Array(1)[o](function() {
                a = !1;
            }),
            r(r.P + r.F * a, 'Array', {
                findIndex: function(e) {
                    return i(
                        this,
                        e,
                        1 < arguments.length ? arguments[1] : void 0
                    );
                },
            }),
            n(27)(o);
    },
    11: function(e, t, n) {
        'use strict';
        function r(e) {
            return Object.keys(e)
                .map(function(t) {
                    return Array.isArray(e[t])
                        ? e[t]
                              .map(function(e) {
                                  return ''.concat(t, '[]=').concat(e);
                              })
                              .join('&')
                        : ''.concat(t, '=').concat(e[t]);
                })
                .join('&');
        }
        (t.b = r),
            (t.c = function(e, t) {
                var n = document.createElement('a');
                t && 'noDecodeWholeURL' in t && t.noDecodeWholeURL
                    ? (n.href = e)
                    : (n.href = decodeURIComponent(e));
                var r =
                    t && 'decodeSearchAsString' in t && t.decodeSearchAsString;
                return {
                    href: n.href,
                    protocol: (n.protocol || '').replace(/:$/, ''),
                    hostname: n.hostname,
                    port: +n.port,
                    pathname: n.pathname.replace(/^(?!\/)/, '/'),
                    search: r
                        ? n.search
                        : ((i = n.search || ''),
                          i
                              ? i
                                    .replace(/^\?/, '')
                                    .split('&')
                                    .reduce(function(e, t) {
                                        var n,
                                            r,
                                            i = t.split('='),
                                            o = ((r = 2),
                                            (function(e) {
                                                if (Array.isArray(e)) return e;
                                            })((n = i)) ||
                                                (function(e, t) {
                                                    var n = [],
                                                        r = !0,
                                                        i = !1,
                                                        o = void 0;
                                                    try {
                                                        for (
                                                            var a,
                                                                c = e[
                                                                    Symbol
                                                                        .iterator
                                                                ]();
                                                            !(r = (a = c.next())
                                                                .done) &&
                                                            (n.push(a.value),
                                                            !t ||
                                                                n.length !== t);
                                                            r = !0
                                                        );
                                                    } catch (e) {
                                                        (i = !0), (o = e);
                                                    } finally {
                                                        try {
                                                            r ||
                                                                null ==
                                                                    c.return ||
                                                                c.return();
                                                        } finally {
                                                            if (i) throw o;
                                                        }
                                                    }
                                                    return n;
                                                })(n, r) ||
                                                (function() {
                                                    throw new TypeError(
                                                        'Invalid attempt to destructure non-iterable instance'
                                                    );
                                                })()),
                                            a = o[0],
                                            c = o[1];
                                        return (
                                            /\[\]$/.test(a)
                                                ? ((a = a.replace('[]', '')),
                                                  (e[a] = e[a] || []),
                                                  e[a].push(c))
                                                : (e[a] = c || ''),
                                            e
                                        );
                                    }, {})
                              : {}),
                    hash: (n.hash || '').replace(/^#/, ''),
                    host: n.host || window.location.host,
                };
                var i;
            }),
            (t.a = function(e) {
                return (
                    (e.protocol || 'http') +
                    '://' +
                    (e.host ||
                        e.hostname + (e.port ? ':'.concat(e.port) : '')) +
                    (e.pathname || '') +
                    (e.search ? '?'.concat(r(e.search || '')) : '') +
                    (e.hash ? '#'.concat(e.hash) : '')
                );
            });
    },
    12: function(e, t, n) {
        'use strict';
        (t.a = i),
            (t.c = function(e) {
                return !(!e || !e.url);
            }),
            (t.b = function(e, t) {
                e.render(t);
            });
        var f = n(29),
            l = n(0),
            r = n(10),
            g = n.n(r);
        function i(e) {
            var t,
                n,
                r,
                i = this,
                o = e.url,
                a = e.config,
                c = e.id,
                u = e.callback,
                s = e.loaded,
                d = e.adUnitCode;
            (this.url = o),
                (this.config = a),
                (this.handlers = {}),
                (this.id = c),
                (this.loaded = s),
                (this.cmd = []),
                (this.push = function(e) {
                    'function' == typeof e
                        ? i.loaded ? e.call() : i.cmd.push(e)
                        : l.logError(
                              'Commands given to Renderer.push must be wrapped in a function'
                          );
                }),
                (this.callback =
                    u ||
                    function() {
                        (i.loaded = !0), i.process();
                    }),
                (t = d),
                (n = pbjs.adUnits),
                (r = g()(n, function(e) {
                    return e.code === t;
                })) &&
                r.renderer &&
                r.renderer.url &&
                r.renderer.render
                    ? l.logWarn(
                          'External Js not loaded by Renderer since renderer url and callback is already defined on adUnit '.concat(
                              d
                          )
                      )
                    : Object(f.b)(o, this.callback, !0);
        }
        (i.install = function(e) {
            return new i({
                url: e.url,
                config: e.config,
                id: e.id,
                callback: e.callback,
                loaded: e.loaded,
                adUnitCode: e.adUnitCode,
            });
        }),
            (i.prototype.getConfig = function() {
                return this.config;
            }),
            (i.prototype.setRender = function(e) {
                this.render = e;
            }),
            (i.prototype.setEventHandlers = function(e) {
                this.handlers = e;
            }),
            (i.prototype.handleVideoEvent = function(e) {
                var t = e.id,
                    n = e.eventName;
                'function' == typeof this.handlers[n] && this.handlers[n](),
                    l.logMessage(
                        'Prebid Renderer event for id '
                            .concat(t, ' type ')
                            .concat(n)
                    );
            }),
            (i.prototype.process = function() {
                for (; 0 < this.cmd.length; )
                    try {
                        this.cmd.shift().call();
                    } catch (e) {
                        l.logError('Error processing Renderer command: ', e);
                    }
            });
    },
    13: function(e, t) {
        var n = (e.exports = { version: '2.6.4' });
        'number' == typeof __e && (__e = n);
    },
    14: function(e, t, n) {
        'use strict';
        t.a = function(e, t) {
            return new r(e, t);
        };
        var i = n(0);
        function r(e, t) {
            var n = (t && t.src) || 'client',
                r = e || 0;
            (this.bidderCode = (t && t.bidder) || ''),
                (this.width = 0),
                (this.height = 0),
                (this.statusMessage = (function() {
                    switch (r) {
                        case 0:
                            return 'Pending';
                        case 1:
                            return 'Bid available';
                        case 2:
                            return 'Bid returned empty or error response';
                        case 3:
                            return 'Bid timed out';
                    }
                })()),
                (this.adId = i.getUniqueIdentifierStr()),
                (this.requestId = t && t.bidId),
                (this.mediaType = 'banner'),
                (this.source = n),
                (this.getStatusCode = function() {
                    return r;
                }),
                (this.getSize = function() {
                    return this.width + 'x' + this.height;
                });
        }
    },
    15: function(e, t, n) {
        var b = n(20),
            y = n(13),
            v = n(32),
            m = n(50),
            h = n(57),
            E = 'prototype',
            S = function(e, t, n) {
                var r,
                    i,
                    o,
                    a = e & S.F,
                    c = e & S.G,
                    u = e & S.S,
                    s = e & S.P,
                    d = e & S.B,
                    f = e & S.W,
                    l = c ? y : y[t] || (y[t] = {}),
                    g = l[E],
                    p = c ? b : u ? b[t] : (b[t] || {})[E];
                for (r in (c && (n = t), n))
                    ((i = !a && p && void 0 !== p[r]) && h(l, r)) ||
                        ((o = i ? p[r] : n[r]),
                        (l[r] =
                            c && 'function' != typeof p[r]
                                ? n[r]
                                : d && i
                                  ? v(o, b)
                                  : f && p[r] == o
                                    ? (function(r) {
                                          var e = function(e, t, n) {
                                              if (this instanceof r) {
                                                  switch (arguments.length) {
                                                      case 0:
                                                          return new r();
                                                      case 1:
                                                          return new r(e);
                                                      case 2:
                                                          return new r(e, t);
                                                  }
                                                  return new r(e, t, n);
                                              }
                                              return r.apply(this, arguments);
                                          };
                                          return (e[E] = r[E]), e;
                                      })(o)
                                    : s && 'function' == typeof o
                                      ? v(Function.call, o)
                                      : o),
                        s &&
                            (((l.virtual || (l.virtual = {}))[r] = o),
                            e & S.R && g && !g[r] && m(g, r, o)));
            };
        (S.F = 1),
            (S.G = 2),
            (S.S = 4),
            (S.P = 8),
            (S.B = 16),
            (S.W = 32),
            (S.U = 64),
            (S.R = 128),
            (e.exports = S);
    },
    16: function(e, t) {
        e.exports = function(e) {
            return 'object' == typeof e ? null !== e : 'function' == typeof e;
        };
    },
    17: function(e, t, n) {
        'use strict';
        n.d(t, 'a', function() {
            return o;
        }),
            n.d(t, 'b', function() {
                return a;
            });
        var r = n(68),
            i = n.n(r),
            o = i()({ ready: i.a.SYNC | i.a.ASYNC | i.a.QUEUE }),
            a = o.hooks;
    },
    18: function(e, t, n) {
        'use strict';
        n.d(t, 'd', function() {
            return i;
        }),
            n.d(t, 'a', function() {
                return s;
            }),
            (t.f = function(e) {
                if (
                    e &&
                    e.type &&
                    ((t = e.type),
                    (t && c()(Object.keys(d), t)) ||
                        (Object(a.logError)(
                            ''.concat(t, ' nativeParam is not supported')
                        ),
                        0))
                )
                    return d[e.type];
                var t;
                return e;
            }),
            (t.e = function(t, e) {
                var n = Object(a.getBidRequest)(t.requestId, e);
                if (!n) return !1;
                if (!Object(a.deepAccess)(t, 'native.clickUrl')) return !1;
                if (
                    Object(a.deepAccess)(t, 'native.image') &&
                    (!Object(a.deepAccess)(t, 'native.image.height') ||
                        !Object(a.deepAccess)(t, 'native.image.width'))
                )
                    return !1;
                if (
                    Object(a.deepAccess)(t, 'native.icon') &&
                    (!Object(a.deepAccess)(t, 'native.icon.height') ||
                        !Object(a.deepAccess)(t, 'native.icon.width'))
                )
                    return !1;
                var r = n.nativeParams;
                if (!r) return !0;
                var i = Object.keys(r).filter(function(e) {
                        return r[e].required;
                    }),
                    o = Object.keys(t.native).filter(function(e) {
                        return t.native[e];
                    });
                return i.every(function(e) {
                    return c()(o, e);
                });
            }),
            (t.b = function(e, t) {
                var n;
                'click' === e.action
                    ? (n = t.native && t.native.clickTrackers)
                    : ((n = t.native && t.native.impressionTrackers),
                      t.native &&
                          t.native.javascriptTrackers &&
                          Object(a.insertHtmlIntoIframe)(
                              t.native.javascriptTrackers
                          ));
                (n || []).forEach(a.triggerPixel);
            }),
            (t.c = function(r) {
                var i = {};
                return (
                    Object.keys(r.native).forEach(function(e) {
                        var t = u.NATIVE_KEYS[e],
                            n = r.native[e];
                        'object' === o(n) && n.url && (n = n.url),
                            t && n && (i[t] = n);
                    }),
                    i
                );
            });
        var a = n(0),
            r = n(7),
            c = n.n(r);
        function o(e) {
            return (o =
                'function' == typeof Symbol &&
                'symbol' == typeof Symbol.iterator
                    ? function(e) {
                          return typeof e;
                      }
                    : function(e) {
                          return e &&
                              'function' == typeof Symbol &&
                              e.constructor === Symbol &&
                              e !== Symbol.prototype
                              ? 'symbol'
                              : typeof e;
                      })(e);
        }
        var u = n(4),
            i = [],
            s = Object.keys(u.NATIVE_KEYS).map(function(e) {
                return u.NATIVE_KEYS[e];
            }),
            d = {
                image: {
                    image: { required: !0 },
                    title: { required: !0 },
                    sponsoredBy: { required: !0 },
                    clickUrl: { required: !0 },
                    body: { required: !1 },
                    icon: { required: !1 },
                },
            };
    },
    19: function(e, t, n) {
        'use strict';
        n.d(t, 'a', function() {
            return a;
        });
        var s = n(0),
            i = n(3),
            r = n(7),
            d = n.n(r);
        function f(e, t) {
            return (
                (function(e) {
                    if (Array.isArray(e)) return e;
                })(e) ||
                (function(e, t) {
                    var n = [],
                        r = !0,
                        i = !1,
                        o = void 0;
                    try {
                        for (
                            var a, c = e[Symbol.iterator]();
                            !(r = (a = c.next()).done) &&
                            (n.push(a.value), !t || n.length !== t);
                            r = !0
                        );
                    } catch (e) {
                        (i = !0), (o = e);
                    } finally {
                        try {
                            r || null == c.return || c.return();
                        } finally {
                            if (i) throw o;
                        }
                    }
                    return n;
                })(e, t) ||
                (function() {
                    throw new TypeError(
                        'Invalid attempt to destructure non-iterable instance'
                    );
                })()
            );
        }
        function l() {
            return (l =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        i.config.setDefaults({
            userSync: {
                syncEnabled: !0,
                pixelEnabled: !0,
                syncsPerBidder: 5,
                syncDelay: 3e3,
            },
        });
        var o = !s.isSafariBrowser() && s.cookiesAreEnabled(),
            a = (function(e) {
                var t = {},
                    o = { image: [], iframe: [] },
                    n = !1,
                    a = {},
                    c = { image: !1, iframe: !1 },
                    u = e.config;
                function r() {
                    if (
                        u.syncEnabled &&
                        e.browserSupportsCookies &&
                        (u.enableOverride || !n)
                    ) {
                        try {
                            (u.pixelEnabled || c.image) &&
                                s.shuffle(o.image).forEach(function(e) {
                                    var t = f(e, 2),
                                        n = t[0],
                                        r = t[1];
                                    s.logMessage(
                                        'Invoking image pixel user sync for bidder: '.concat(
                                            n
                                        )
                                    ),
                                        s.triggerPixel(r);
                                }),
                                (u.iframeEnabled || c.iframe) &&
                                    s.shuffle(o.iframe).forEach(function(e) {
                                        var t = f(e, 2),
                                            n = t[0],
                                            r = t[1];
                                        s.logMessage(
                                            'Invoking iframe user sync for bidder: '.concat(
                                                n
                                            )
                                        ),
                                            s.insertUserSyncIframe(r);
                                    });
                        } catch (e) {
                            return s.logError('Error firing user syncs', e);
                        }
                        (o = { image: [], iframe: [] }), (n = !0);
                    }
                }
                return (
                    i.config.getConfig('userSync', function(e) {
                        u = l(u, e.userSync);
                    }),
                    (t.registerSync = function(e, t, n) {
                        if (!u.syncEnabled || !s.isArray(o[e]))
                            return s.logWarn(
                                'User sync type "'.concat(e, '" not supported')
                            );
                        if (!t)
                            return s.logWarn(
                                'Bidder is required for registering sync'
                            );
                        if (
                            0 !== u.syncsPerBidder &&
                            Number(a[t]) >= u.syncsPerBidder
                        )
                            return s.logWarn(
                                'Number of user syncs exceeded for "'.concat(
                                    t,
                                    '"'
                                )
                            );
                        if (u.filterSettings) {
                            if (
                                (function(e, t) {
                                    var n = u.filterSettings;
                                    if (
                                        (function(e, t) {
                                            if (e.all && e[t])
                                                return (
                                                    s.logWarn(
                                                        'Detected presence of the "filterSettings.all" and "filterSettings.'.concat(
                                                            t,
                                                            '" in userSync config.  You cannot mix "all" with "iframe/image" configs; they are mutually exclusive.'
                                                        )
                                                    ),
                                                    !1
                                                );
                                            var n = e.all ? e.all : e[t],
                                                r = e.all ? 'all' : t;
                                            if (!n) return !1;
                                            var i = n.filter,
                                                o = n.bidders;
                                            return i &&
                                                'include' !== i &&
                                                'exclude' !== i
                                                ? (s.logWarn(
                                                      'UserSync "filterSettings.'
                                                          .concat(
                                                              r,
                                                              '.filter" setting \''
                                                          )
                                                          .concat(
                                                              i,
                                                              "' is not a valid option; use either 'include' or 'exclude'."
                                                          )
                                                  ),
                                                  !1)
                                                : !!(
                                                      '*' === o ||
                                                      (Array.isArray(o) &&
                                                          0 < o.length &&
                                                          o.every(function(e) {
                                                              return (
                                                                  s.isStr(e) &&
                                                                  '*' !== e
                                                              );
                                                          }))
                                                  ) ||
                                                      (s.logWarn(
                                                          'Detected an invalid setup in userSync "filterSettings.'.concat(
                                                              r,
                                                              ".bidders\"; use either '*' (to represent all bidders) or an array of bidders."
                                                          )
                                                      ),
                                                      !1);
                                        })(n, e)
                                    ) {
                                        c[e] = !0;
                                        var r = n.all ? n.all : n[e],
                                            i =
                                                '*' === r.bidders
                                                    ? [t]
                                                    : r.bidders,
                                            o = r.filter || 'include',
                                            a = {
                                                include: function(e, t) {
                                                    return !d()(e, t);
                                                },
                                                exclude: function(e, t) {
                                                    return d()(e, t);
                                                },
                                            };
                                        return a[o](i, t);
                                    }
                                    return !1;
                                })(e, t)
                            )
                                return s.logWarn(
                                    "Bidder '"
                                        .concat(
                                            t,
                                            "' is not permitted to register their userSync "
                                        )
                                        .concat(
                                            e,
                                            ' pixels as per filterSettings config.'
                                        )
                                );
                        } else if (
                            u.enabledBidders &&
                            u.enabledBidders.length &&
                            u.enabledBidders.indexOf(t) < 0
                        )
                            return s.logWarn(
                                'Bidder "'.concat(
                                    t,
                                    '" not permitted to register their userSync pixels.'
                                )
                            );
                        var r, i;
                        o[e].push([t, n]),
                            (r = a)[(i = t)] ? (r[i] += 1) : (r[i] = 1),
                            (a = r);
                    }),
                    (t.syncUsers = function() {
                        var e =
                            0 < arguments.length && void 0 !== arguments[0]
                                ? arguments[0]
                                : 0;
                        if (e) return setTimeout(r, Number(e));
                        r();
                    }),
                    (t.triggerUserSyncs = function() {
                        u.enableOverride && t.syncUsers();
                    }),
                    t
                );
            })({
                config: i.config.getConfig('userSync'),
                browserSupportsCookies: o,
            });
    },
    198: function(e, t, n) {
        'use strict';
        (t.b = function(e, t) {
            var n = { puts: e.map(a) };
            Object(i.a)(
                o.config.getConfig('cache.url'),
                ((r = t),
                {
                    success: function(e) {
                        var t;
                        try {
                            t = JSON.parse(e).responses;
                        } catch (e) {
                            return void r(e, []);
                        }
                        t
                            ? r(null, t)
                            : r(
                                  new Error(
                                      "The cache server didn't respond with a responses property."
                                  ),
                                  []
                              );
                    },
                    error: function(e, t) {
                        r(
                            new Error(
                                'Error storing video ad in the cache: '
                                    .concat(e, ': ')
                                    .concat(JSON.stringify(t))
                            ),
                            []
                        );
                    },
                }),
                JSON.stringify(n),
                { contentType: 'text/plain', withCredentials: !0 }
            );
            var r;
        }),
            (t.a = function(e) {
                return ''
                    .concat(o.config.getConfig('cache.url'), '?uuid=')
                    .concat(e);
            });
        var i = n(6),
            o = n(3);
        function a(e) {
            var t,
                n,
                r,
                i = {
                    type: 'xml',
                    value: e.vastXml
                        ? e.vastXml
                        : ((t = e.vastUrl),
                          (n = e.vastImpUrl),
                          (r = n ? '<![CDATA['.concat(n, ']]>') : ''),
                          '<VAST version="3.0">\n    <Ad>\n      <Wrapper>\n        <AdSystem>prebid.org wrapper</AdSystem>\n        <VASTAdTagURI><![CDATA['
                              .concat(
                                  t,
                                  ']]></VASTAdTagURI>\n        <Impression>'
                              )
                              .concat(
                                  r,
                                  '</Impression>\n        <Creatives></Creatives>\n      </Wrapper>\n    </Ad>\n  </VAST>'
                              )),
                    ttlseconds: Number(e.ttl),
                };
            return (
                'string' == typeof e.customCacheKey &&
                    '' !== e.customCacheKey &&
                    (i.key = e.customCacheKey),
                i
            );
        }
    },
    2: function(e, t, n) {
        'use strict';
        n.d(t, 'b', function() {
            return r;
        }),
            n.d(t, 'c', function() {
                return i;
            }),
            n.d(t, 'a', function() {
                return o;
            });
        var r = 'native',
            i = 'video',
            o = 'banner';
    },
    20: function(e, t) {
        var n = (e.exports =
            'undefined' != typeof window && window.Math == Math
                ? window
                : 'undefined' != typeof self && self.Math == Math
                  ? self
                  : Function('return this')());
        'number' == typeof __g && (__g = n);
    },
    21: function(e, t, n) {
        n(108), (e.exports = n(13).Array.findIndex);
    },
    22: function(to, uo) {
        var vo;
        vo = (function() {
            return this;
        })();
        try {
            vo = vo || Function('return this')() || eval('this');
        } catch (e) {
            'object' == typeof window && (vo = window);
        }
        to.exports = vo;
    },
    23: function(e, t, n) {
        e.exports = !n(33)(function() {
            return (
                7 !=
                Object.defineProperty({}, 'a', {
                    get: function() {
                        return 7;
                    },
                }).a
            );
        });
    },
    24: function(e, t) {
        var n = {}.toString;
        e.exports = function(e) {
            return n.call(e).slice(8, -1);
        };
    },
    25: function(e, t) {
        e.exports = function(e) {
            if (null == e) throw TypeError("Can't call method on  " + e);
            return e;
        };
    },
    26: function(e, t, n) {
        var r = n(61)('wks'),
            i = n(63),
            o = n(20).Symbol,
            a = 'function' == typeof o;
        (e.exports = function(e) {
            return r[e] || (r[e] = (a && o[e]) || (a ? o : i)('Symbol.' + e));
        }).store = r;
    },
    27: function(e, t) {
        e.exports = function() {};
    },
    28: function(e, t, n) {
        'use strict';
        t.a = function(e) {
            var t = e;
            return {
                callBids: function() {},
                setBidderCode: function(e) {
                    t = e;
                },
                getBidderCode: function() {
                    return t;
                },
            };
        };
    },
    29: function(e, t, n) {
        'use strict';
        (t.a = function(e, t) {
            if (!t || !e)
                return void o.logError(
                    'cannot load external script without url and moduleCode'
                );
            if (!i()(c, t))
                return void o.logError(
                    ''.concat(
                        t,
                        ' not whitelisted for loading external JavaScript'
                    )
                );
            if (a[e]) return;
            o.logWarn('module '.concat(t, ' is loading external JavaScript'));
            var n = document.createElement('script');
            (n.type = 'text/javascript'),
                (n.async = !0),
                (n.src = e),
                o.insertElement(n),
                (a[e] = !0);
        }),
            (t.b = function(t, e, n) {
                if (!t)
                    return void o.logError(
                        'Error attempting to request empty URL',
                        'adloader.js:loadScript'
                    );
                n
                    ? a[t]
                      ? e &&
                        'function' == typeof e &&
                        (a[t].loaded ? e() : a[t].callbacks.push(e))
                      : ((a[t] = { loaded: !1, callbacks: [] }),
                        e && 'function' == typeof e && a[t].callbacks.push(e),
                        u(t, function() {
                            a[t].loaded = !0;
                            try {
                                for (var e = 0; e < a[t].callbacks.length; e++)
                                    a[t].callbacks[e]();
                            } catch (e) {
                                o.logError(
                                    'Error executing callback',
                                    'adloader.js:loadScript',
                                    e
                                );
                            }
                        }))
                    : u(t, e);
            });
        var r = n(7),
            i = n.n(r),
            o = n(0),
            a = {},
            c = ['criteo'];
        function u(e, t) {
            var n = document.createElement('script');
            (n.type = 'text/javascript'),
                (n.async = !0),
                t &&
                    'function' == typeof t &&
                    (n.readyState
                        ? (n.onreadystatechange = function() {
                              ('loaded' !== n.readyState &&
                                  'complete' !== n.readyState) ||
                                  ((n.onreadystatechange = null), t());
                          })
                        : (n.onload = function() {
                              t();
                          })),
                (n.src = e);
            var r = document.getElementsByTagName('head');
            (r = r.length ? r : document.getElementsByTagName('body')).length &&
                (r = r[0]).insertBefore(n, r.firstChild);
        }
    },
    3: function(e, t, n) {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 }),
            n.d(t, 'RANDOM', function() {
                return a;
            }),
            (t.newConfig = c),
            n.d(t, 'config', function() {
                return u;
            });
        var s = n(31),
            r = n(10),
            d = n.n(r),
            i = n(7),
            o = n.n(i),
            f = n(17);
        function l() {
            return (l =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        function g(e) {
            return (g =
                'function' == typeof Symbol &&
                'symbol' == typeof Symbol.iterator
                    ? function(e) {
                          return typeof e;
                      }
                    : function(e) {
                          return e &&
                              'function' == typeof Symbol &&
                              e.constructor === Symbol &&
                              e !== Symbol.prototype
                              ? 'symbol'
                              : typeof e;
                      })(e);
        }
        var p = n(0),
            b = !1,
            y = 3e3,
            v = window.location.origin,
            m = !0,
            h = !1,
            E = !1,
            S = 400,
            a = 'random',
            T = {};
        (T[a] = !0), (T.fixed = !0);
        var A = a,
            I = {
                LOW: 'low',
                MEDIUM: 'medium',
                HIGH: 'high',
                AUTO: 'auto',
                DENSE: 'dense',
                CUSTOM: 'custom',
            },
            O = '*';
        function c() {
            var a,
                c,
                r = [];
            function e() {
                a = {};
                var n = {
                    _debug: b,
                    get debug() {
                        return this._debug;
                    },
                    set debug(e) {
                        this._debug = e;
                    },
                    _bidderTimeout: y,
                    get bidderTimeout() {
                        return this._bidderTimeout;
                    },
                    set bidderTimeout(e) {
                        this._bidderTimeout = e;
                    },
                    _publisherDomain: v,
                    get publisherDomain() {
                        return this._publisherDomain;
                    },
                    set publisherDomain(e) {
                        this._publisherDomain = e;
                    },
                    _priceGranularity: I.MEDIUM,
                    set priceGranularity(e) {
                        o(e) &&
                            ('string' == typeof e
                                ? (this._priceGranularity = i(e) ? e : I.MEDIUM)
                                : 'object' === g(e) &&
                                  ((this._customPriceBucket = e),
                                  (this._priceGranularity = I.CUSTOM),
                                  p.logMessage(
                                      'Using custom price granularity'
                                  )));
                    },
                    get priceGranularity() {
                        return this._priceGranularity;
                    },
                    _customPriceBucket: {},
                    get customPriceBucket() {
                        return this._customPriceBucket;
                    },
                    _mediaTypePriceGranularity: {},
                    get mediaTypePriceGranularity() {
                        return this._mediaTypePriceGranularity;
                    },
                    set mediaTypePriceGranularity(n) {
                        var r = this;
                        this._mediaTypePriceGranularity = Object.keys(n).reduce(
                            function(e, t) {
                                return (
                                    o(n[t])
                                        ? 'string' == typeof n
                                          ? (e[t] = i(n[t])
                                                ? n[t]
                                                : r._priceGranularity)
                                          : 'object' === g(n) &&
                                            ((e[t] = n[t]),
                                            p.logMessage(
                                                'Using custom price granularity for '.concat(
                                                    t
                                                )
                                            ))
                                        : p.logWarn(
                                              'Invalid price granularity for media type: '.concat(
                                                  t
                                              )
                                          ),
                                    e
                                );
                            },
                            {}
                        );
                    },
                    _sendAllBids: m,
                    get enableSendAllBids() {
                        return this._sendAllBids;
                    },
                    set enableSendAllBids(e) {
                        this._sendAllBids = e;
                    },
                    _useBidCache: E,
                    get useBidCache() {
                        return this._useBidCache;
                    },
                    set useBidCache(e) {
                        this._useBidCache = e;
                    },
                    _bidderSequence: A,
                    get bidderSequence() {
                        return this._bidderSequence;
                    },
                    set bidderSequence(e) {
                        T[e]
                            ? (this._bidderSequence = e)
                            : p.logWarn(
                                  'Invalid order: '.concat(
                                      e,
                                      '. Bidder Sequence was not set.'
                                  )
                              );
                    },
                    _timeoutBuffer: S,
                    get timeoutBuffer() {
                        return this._timeoutBuffer;
                    },
                    set timeoutBuffer(e) {
                        this._timeoutBuffer = e;
                    },
                    _disableAjaxTimeout: h,
                    get disableAjaxTimeout() {
                        return this._disableAjaxTimeout;
                    },
                    set disableAjaxTimeout(e) {
                        this._disableAjaxTimeout = e;
                    },
                };
                function i(t) {
                    return d()(Object.keys(I), function(e) {
                        return t === I[e];
                    });
                }
                function o(e) {
                    if (!e)
                        return (
                            p.logError(
                                'Prebid Error: no value passed to `setPriceGranularity()`'
                            ),
                            !1
                        );
                    if ('string' == typeof e)
                        i(e) ||
                            p.logWarn(
                                'Prebid Warning: setPriceGranularity was called with invalid setting, using `medium` as default.'
                            );
                    else if ('object' === g(e) && !Object(s.b)(e))
                        return (
                            p.logError(
                                'Invalid custom price value passed to `setPriceGranularity()`'
                            ),
                            !1
                        );
                    return !0;
                }
                c &&
                    u(
                        Object.keys(c).reduce(function(e, t) {
                            return c[t] !== n[t] && (e[t] = n[t] || {}), e;
                        }, {})
                    ),
                    (c = n);
            }
            var t = Object(f.a)('async', function(n) {
                if ('object' === g(n)) {
                    var e = Object.keys(n),
                        r = {};
                    e.forEach(function(e) {
                        var t = n[e];
                        'object' === g(a[e]) &&
                            'object' === g(t) &&
                            (t = l({}, a[e], t)),
                            (r[e] = c[e] = t);
                    }),
                        u(r);
                } else p.logError('setConfig options must be an object');
            });
            function u(i) {
                var t = Object.keys(i);
                r
                    .filter(function(e) {
                        return o()(t, e.topic);
                    })
                    .forEach(function(e) {
                        var t, n, r;
                        e.callback(
                            ((t = {}),
                            (n = e.topic),
                            (r = i[e.topic]),
                            n in t
                                ? Object.defineProperty(t, n, {
                                      value: r,
                                      enumerable: !0,
                                      configurable: !0,
                                      writable: !0,
                                  })
                                : (t[n] = r),
                            t)
                        );
                    }),
                    r
                        .filter(function(e) {
                            return e.topic === O;
                        })
                        .forEach(function(e) {
                            return e.callback(i);
                        });
            }
            return (
                e(),
                {
                    getConfig: function() {
                        if (
                            arguments.length <= 1 &&
                            'function' !=
                                typeof (arguments.length <= 0
                                    ? void 0
                                    : arguments[0])
                        ) {
                            var e =
                                arguments.length <= 0 ? void 0 : arguments[0];
                            return e ? p.deepAccess(c, e) : c;
                        }
                        return function(e, t) {
                            var n = t;
                            return (
                                'string' != typeof e && ((n = e), (e = O)),
                                'function' == typeof n
                                    ? (r.push({ topic: e, callback: n }),
                                      function() {
                                          r.splice(r.indexOf(t), 1);
                                      })
                                    : void p.logError(
                                          'listener must be a function'
                                      )
                            );
                        }.apply(void 0, arguments);
                    },
                    setConfig: t,
                    setDefaults: function(e) {
                        'object' === g(a)
                            ? (l(a, e), l(c, e))
                            : p.logError('defaults must be an object');
                    },
                    resetConfig: e,
                }
            );
        }
        var u = c();
    },
    30: function(e, t, n) {
        'use strict';
        n.d(t, 'a', function() {
            return d;
        });
        var r = n(0),
            u = n(45),
            i = n(10),
            o = n.n(i),
            a = n(4);
        var s,
            c,
            d = ((s = []),
            ((c = {}).addWinningBid = function(t) {
                var e = o()(s, function(e) {
                    return e.getAuctionId() === t.auctionId;
                });
                e
                    ? e.addWinningBid(t)
                    : utils.logWarn(
                          'Auction not found when adding winning bid'
                      );
            }),
            (c.getAllWinningBids = function() {
                return s
                    .map(function(e) {
                        return e.getWinningBids();
                    })
                    .reduce(r.flatten, []);
            }),
            (c.getBidsRequested = function() {
                return s
                    .map(function(e) {
                        return e.getBidRequests();
                    })
                    .reduce(r.flatten, []);
            }),
            (c.getNoBids = function() {
                return s
                    .map(function(e) {
                        return e.getNoBids();
                    })
                    .reduce(r.flatten, []);
            }),
            (c.getBidsReceived = function() {
                return s
                    .map(function(e) {
                        if (e.getAuctionStatus() === u.a)
                            return e.getBidsReceived();
                    })
                    .reduce(r.flatten, [])
                    .filter(function(e) {
                        return e;
                    });
            }),
            (c.getAdUnits = function() {
                return s
                    .map(function(e) {
                        return e.getAdUnits();
                    })
                    .reduce(r.flatten, []);
            }),
            (c.getAdUnitCodes = function() {
                return s
                    .map(function(e) {
                        return e.getAdUnitCodes();
                    })
                    .reduce(r.flatten, [])
                    .filter(r.uniques);
            }),
            (c.createAuction = function(e) {
                var t,
                    n = e.adUnits,
                    r = e.adUnitCodes,
                    i = e.callback,
                    o = e.cbTimeout,
                    a = e.labels,
                    c = Object(u.d)({
                        adUnits: n,
                        adUnitCodes: r,
                        callback: i,
                        cbTimeout: o,
                        labels: a,
                    });
                return (t = c), s.push(t), c;
            }),
            (c.findBidByAdId = function(t) {
                return o()(
                    s
                        .map(function(e) {
                            return e.getBidsReceived();
                        })
                        .reduce(r.flatten, []),
                    function(e) {
                        return e.adId === t;
                    }
                );
            }),
            (c.getStandardBidderAdServerTargeting = function() {
                return Object(u.c)()[a.JSON_MAPPING.ADSERVER_TARGETING];
            }),
            (c.setStatusForBids = function(e, t) {
                var n = c.findBidByAdId(e);
                if (
                    (n && (n.status = t),
                    n && t === a.BID_STATUS.BID_TARGETING_SET)
                ) {
                    var r = o()(s, function(e) {
                        return e.getAuctionId() === n.auctionId;
                    });
                    r && r.setBidTargeting(n);
                }
            }),
            (c.getLastAuctionId = function() {
                return s.length && s[s.length - 1].getAuctionId();
            }),
            c);
    },
    31: function(e, t, n) {
        'use strict';
        n.d(t, 'a', function() {
            return d;
        }),
            n.d(t, 'b', function() {
                return v;
            });
        var r = n(10),
            b = n.n(r),
            i = n(0),
            y = 2,
            o = { buckets: [{ min: 0, max: 5, increment: 0.5 }] },
            a = { buckets: [{ min: 0, max: 20, increment: 0.1 }] },
            c = { buckets: [{ min: 0, max: 20, increment: 0.01 }] },
            u = {
                buckets: [
                    { min: 0, max: 3, increment: 0.01 },
                    { min: 3, max: 8, increment: 0.05 },
                    { min: 8, max: 20, increment: 0.5 },
                ],
            },
            s = {
                buckets: [
                    { min: 0, max: 5, increment: 0.05 },
                    { min: 5, max: 10, increment: 0.1 },
                    { min: 10, max: 20, increment: 0.5 },
                ],
            };
        function d(e, t) {
            var n =
                    2 < arguments.length && void 0 !== arguments[2]
                        ? arguments[2]
                        : 1,
                r = parseFloat(e);
            return (
                isNaN(r) && (r = ''),
                {
                    low: '' === r ? '' : f(e, o, n),
                    med: '' === r ? '' : f(e, a, n),
                    high: '' === r ? '' : f(e, c, n),
                    auto: '' === r ? '' : f(e, s, n),
                    dense: '' === r ? '' : f(e, u, n),
                    custom: '' === r ? '' : f(e, t, n),
                }
            );
        }
        function f(n, e, r) {
            var i = '';
            if (!v(e)) return i;
            var t,
                o,
                a,
                c,
                u,
                s,
                d,
                f,
                l,
                g = e.buckets.reduce(
                    function(e, t) {
                        return e.max > t.max ? e : t;
                    },
                    { max: 0 }
                ),
                p = b()(e.buckets, function(e) {
                    if (n > g.max * r) {
                        var t = e.precision;
                        void 0 === t && (t = y), (i = (e.max * r).toFixed(t));
                    } else if (n <= e.max * r && n >= e.min * r) return e;
                });
            return (
                p &&
                    ((t = n),
                    (a = r),
                    (c = void 0 !== (o = p).precision ? o.precision : y),
                    (u = o.increment * a),
                    (s = o.min * a),
                    (d = Math.pow(10, c + 2)),
                    (f = (t * d - s * d) / (u * d)),
                    (l = Math.floor(f) * u + s),
                    (i = (l = Number(l.toFixed(10))).toFixed(c))),
                i
            );
        }
        function v(e) {
            if (i.isEmpty(e) || !e.buckets || !Array.isArray(e.buckets))
                return !1;
            var t = !0;
            return (
                e.buckets.forEach(function(e) {
                    (void 0 !== e.min && e.max && e.increment) || (t = !1);
                }),
                t
            );
        }
    },
    32: function(e, t, n) {
        var o = n(49);
        e.exports = function(r, i, e) {
            if ((o(r), void 0 === i)) return r;
            switch (e) {
                case 1:
                    return function(e) {
                        return r.call(i, e);
                    };
                case 2:
                    return function(e, t) {
                        return r.call(i, e, t);
                    };
                case 3:
                    return function(e, t, n) {
                        return r.call(i, e, t, n);
                    };
            }
            return function() {
                return r.apply(i, arguments);
            };
        };
    },
    33: function(e, t) {
        e.exports = function(e) {
            try {
                return !!e();
            } catch (e) {
                return !0;
            }
        };
    },
    34: function(e, t, n) {
        var h = n(32),
            E = n(35),
            S = n(58),
            T = n(36),
            r = n(59);
        e.exports = function(f, e) {
            var l = 1 == f,
                g = 2 == f,
                p = 3 == f,
                b = 4 == f,
                y = 6 == f,
                v = 5 == f || y,
                m = e || r;
            return function(e, t, n) {
                for (
                    var r,
                        i,
                        o = S(e),
                        a = E(o),
                        c = h(t, n, 3),
                        u = T(a.length),
                        s = 0,
                        d = l ? m(e, u) : g ? m(e, 0) : void 0;
                    s < u;
                    s++
                )
                    if ((v || s in a) && ((i = c((r = a[s]), s, o)), f))
                        if (l) d[s] = i;
                        else if (i)
                            switch (f) {
                                case 3:
                                    return !0;
                                case 5:
                                    return r;
                                case 6:
                                    return s;
                                case 2:
                                    d.push(r);
                            }
                        else if (b) return !1;
                return y ? -1 : p || b ? b : d;
            };
        };
    },
    35: function(e, t, n) {
        var r = n(24);
        e.exports = Object('z').propertyIsEnumerable(0)
            ? Object
            : function(e) {
                  return 'String' == r(e) ? e.split('') : Object(e);
              };
    },
    36: function(e, t, n) {
        var r = n(37),
            i = Math.min;
        e.exports = function(e) {
            return 0 < e ? i(r(e), 9007199254740991) : 0;
        };
    },
    37: function(e, t) {
        var n = Math.ceil,
            r = Math.floor;
        e.exports = function(e) {
            return isNaN((e = +e)) ? 0 : (0 < e ? r : n)(e);
        };
    },
    38: function(e, t, n) {
        var r = n(24);
        e.exports =
            Array.isArray ||
            function(e) {
                return 'Array' == r(e);
            };
    },
    39: function(e, t, n) {
        'use strict';
        (t.a = function(e, t) {
            if (e.labelAll)
                return { labelAll: !0, labels: e.labelAll, activeLabels: t };
            return { labelAll: !1, labels: e.labelAny, activeLabels: t };
        }),
            (t.c = function(e) {
                var t = y(
                    1 < arguments.length && void 0 !== arguments[1]
                        ? arguments[1]
                        : b
                );
                return !t.shouldFilter || !!t.sizesSupported[e];
            }),
            (t.b = function() {
                var e =
                        0 < arguments.length && void 0 !== arguments[0]
                            ? arguments[0]
                            : {},
                    t = e.labels,
                    n = void 0 === t ? [] : t,
                    r = e.labelAll,
                    i = void 0 !== r && r,
                    o = e.activeLabels,
                    a = void 0 === o ? [] : o,
                    c = 1 < arguments.length ? arguments[1] : void 0,
                    u = 2 < arguments.length ? arguments[2] : void 0,
                    s = y(
                        3 < arguments.length && void 0 !== arguments[3]
                            ? arguments[3]
                            : b
                    );
                c = Object(g.isPlainObject)(c)
                    ? Object(g.deepClone)(c)
                    : u ? { banner: { sizes: u } } : {};
                var d = Object(g.deepAccess)(c, 'banner.sizes');
                s.shouldFilter &&
                    d &&
                    (c.banner.sizes = d.filter(function(e) {
                        return s.sizesSupported[e];
                    }));
                var f = Object.keys(c),
                    l = {
                        active:
                            1 < f.length ||
                            (1 === f.length && 'banner' !== f[0]) ||
                            ('banner' === f[0] &&
                                0 <
                                    Object(g.deepAccess)(
                                        c,
                                        'banner.sizes.length'
                                    ) &&
                                (0 === n.length ||
                                    (!i &&
                                        (n.some(function(e) {
                                            return s.labels[e];
                                        }) ||
                                            n.some(function(e) {
                                                return p()(a, e);
                                            }))) ||
                                    (i &&
                                        n.reduce(function(e, t) {
                                            return e
                                                ? s.labels[t] || p()(a, t)
                                                : e;
                                        }, !0)))),
                        mediaTypes: c,
                    };
                d &&
                    d.length !== c.banner.sizes.length &&
                    (l.filterResults = { before: d, after: c.banner.sizes });
                return l;
            });
        var r = n(3),
            g = n(0),
            i = n(7),
            p = n.n(i);
        function o(e) {
            return (o =
                'function' == typeof Symbol &&
                'symbol' == typeof Symbol.iterator
                    ? function(e) {
                          return typeof e;
                      }
                    : function(e) {
                          return e &&
                              'function' == typeof Symbol &&
                              e.constructor === Symbol &&
                              e !== Symbol.prototype
                              ? 'symbol'
                              : typeof e;
                      })(e);
        }
        var b = [];
        function y(e) {
            return e.reduce(
                function(n, e) {
                    return (
                        'object' === o(e) && 'string' == typeof e.mediaQuery
                            ? matchMedia(e.mediaQuery).matches &&
                              (Array.isArray(e.sizesSupported) &&
                                  (n.shouldFilter = !0),
                              ['labels', 'sizesSupported'].forEach(function(t) {
                                  return (e[t] || []).forEach(function(e) {
                                      return (n[t][e] = !0);
                                  });
                              }))
                            : Object(g.logWarn)(
                                  'sizeConfig rule missing required property "mediaQuery"'
                              ),
                        n
                    );
                },
                { labels: {}, sizesSupported: {}, shouldFilter: !1 }
            );
        }
        r.config.getConfig('sizeConfig', function(e) {
            return (t = e.sizeConfig), void (b = t);
            var t;
        });
    },
    4: function(e, t) {
        e.exports = {
            JSON_MAPPING: {
                PL_CODE: 'code',
                PL_SIZE: 'sizes',
                PL_BIDS: 'bids',
                BD_BIDDER: 'bidder',
                BD_ID: 'paramsd',
                BD_PL_ID: 'placementId',
                ADSERVER_TARGETING: 'adserverTargeting',
                BD_SETTING_STANDARD: 'standard',
            },
            DEBUG_MODE: 'pbjs_debug',
            STATUS: { GOOD: 1, NO_BID: 2 },
            CB: {
                TYPE: {
                    ALL_BIDS_BACK: 'allRequestedBidsBack',
                    AD_UNIT_BIDS_BACK: 'adUnitBidsBack',
                    BID_WON: 'bidWon',
                    REQUEST_BIDS: 'requestBids',
                },
            },
            EVENTS: {
                AUCTION_INIT: 'auctionInit',
                AUCTION_END: 'auctionEnd',
                BID_ADJUSTMENT: 'bidAdjustment',
                BID_TIMEOUT: 'bidTimeout',
                BID_REQUESTED: 'bidRequested',
                BID_RESPONSE: 'bidResponse',
                NO_BID: 'noBid',
                BID_WON: 'bidWon',
                BIDDER_DONE: 'bidderDone',
                SET_TARGETING: 'setTargeting',
                REQUEST_BIDS: 'requestBids',
                ADD_AD_UNITS: 'addAdUnits',
                AD_RENDER_FAILED: 'adRenderFailed',
            },
            AD_RENDER_FAILED_REASON: {
                PREVENT_WRITING_ON_MAIN_DOCUMENT:
                    'preventWritingOnMainDocuemnt',
                NO_AD: 'noAd',
                EXCEPTION: 'exception',
                CANNOT_FIND_AD: 'cannotFindAd',
                MISSING_DOC_OR_ADID: 'missingDocOrAdid',
            },
            EVENT_ID_PATHS: { bidWon: 'adUnitCode' },
            GRANULARITY_OPTIONS: {
                LOW: 'low',
                MEDIUM: 'medium',
                HIGH: 'high',
                AUTO: 'auto',
                DENSE: 'dense',
                CUSTOM: 'custom',
            },
            TARGETING_KEYS: {
                BIDDER: 'hb_bidder',
                AD_ID: 'hb_adid',
                PRICE_BUCKET: 'hb_pb',
                SIZE: 'hb_size',
                DEAL: 'hb_deal',
                SOURCE: 'hb_source',
                FORMAT: 'hb_format',
            },
            NATIVE_KEYS: {
                title: 'hb_native_title',
                body: 'hb_native_body',
                body2: 'hb_native_body2',
                privacyLink: 'hb_native_privacy',
                sponsoredBy: 'hb_native_brand',
                image: 'hb_native_image',
                icon: 'hb_native_icon',
                clickUrl: 'hb_native_linkurl',
                displayUrl: 'hb_native_displayurl',
                cta: 'hb_native_cta',
                rating: 'hb_native_rating',
                address: 'hb_native_address',
                downloads: 'hb_native_downloads',
                likes: 'hb_native_likes',
                phone: 'hb_native_phone',
                price: 'hb_native_price',
                salePrice: 'hb_native_saleprice',
            },
            S2S: {
                SRC: 's2s',
                DEFAULT_ENDPOINT:
                    'https://prebid.adnxs.com/pbs/v1/openrtb2/auction',
                SYNCED_BIDDERS_KEY: 'pbjsSyncs',
            },
            BID_STATUS: {
                BID_TARGETING_SET: 'targetingSet',
                RENDERED: 'rendered',
            },
        };
    },
    40: function(e, t, n) {
        'use strict';
        n.d(t, 'a', function() {
            return o;
        });
        var r = n(0),
            i = {};
        var o = {
            incrementCounter: function(e) {
                return (
                    (i[e] = i[e] || {}),
                    (i[e].counter =
                        Object(r.deepAccess)(i, ''.concat(e, '.counter')) + 1 ||
                        1),
                    i[e].counter
                );
            },
            getCounter: function(e) {
                return Object(r.deepAccess)(i, ''.concat(e, '.counter')) || 0;
            },
        };
    },
    41: function(e, t, n) {
        'use strict';
        (t.a = r),
            n.d(t, 'b', function() {
                return i;
            });
        var c = n(0);
        function u() {
            return (u =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        function r(i) {
            function o() {
                var e = (function() {
                        var t,
                            n = [];
                        do {
                            try {
                                t = t ? t.parent : i;
                                try {
                                    var e = t == i.top,
                                        r = {
                                            referrer:
                                                t.document.referrer || null,
                                            location: t.location.href || null,
                                            isTop: e,
                                        };
                                    e &&
                                        (r = u(r, {
                                            canonicalUrl: a(t.document),
                                        })),
                                        n.push(r);
                                } catch (e) {
                                    n.push({
                                        referrer: null,
                                        location: null,
                                        isTop: t == i.top,
                                    }),
                                        Object(c.logWarn)(
                                            'Trying to access cross domain iframe. Continuing without referrer and location'
                                        );
                                }
                            } catch (e) {
                                return (
                                    n.push({
                                        referrer: null,
                                        location: null,
                                        isTop: !1,
                                    }),
                                    n
                                );
                            }
                        } while (t != i.top);
                        return n;
                    })(),
                    t = (function() {
                        try {
                            if (!i.location.ancestorOrigins) return;
                            return i.location.ancestorOrigins;
                        } catch (e) {}
                    })();
                if (t)
                    for (var n = 0, r = t.length; n < r; n++)
                        e[n].ancestor = t[n];
                return e;
            }
            function a(e) {
                try {
                    var t = e.querySelector("link[rel='canonical']");
                    if (null !== t) return t.href;
                } catch (e) {}
                return null;
            }
            return function() {
                try {
                    var e,
                        t = o(),
                        n = t.length - 1,
                        r =
                            null !== t[n].location ||
                            (0 < n && null !== t[n - 1].referrer),
                        i = (function(e) {
                            var t,
                                n = [],
                                r = null,
                                i = null,
                                o = null,
                                a = null,
                                c = null;
                            for (t = e.length - 1; 0 <= t; t--) {
                                try {
                                    r = e[t].location;
                                } catch (e) {}
                                if (r) n.push(r), c || (c = r);
                                else if (0 !== t) {
                                    i = e[t - 1];
                                    try {
                                        (o = i.referrer), (a = i.ancestor);
                                    } catch (e) {}
                                    o
                                        ? (n.push(o), c || (c = o))
                                        : a
                                          ? (n.push(a), c || (c = a))
                                          : n.push(null);
                                } else n.push(null);
                            }
                            return { stack: n, detectedRefererUrl: c };
                        })(t);
                    return (
                        t[t.length - 1].canonicalUrl &&
                            (e = t[t.length - 1].canonicalUrl),
                        {
                            referer: i.detectedRefererUrl,
                            reachedTop: r,
                            numIframes: n,
                            stack: i.stack,
                            canonicalUrl: e,
                        }
                    );
                } catch (e) {}
            };
        }
        var i = r(window);
    },
    42: function(e, t, n) {
        'use strict';
        n.d(t, 'a', function() {
            return c;
        }),
            (t.b = function(e, t) {
                var n = Object(o.getBidRequest)(e.requestId, t),
                    r = n && Object(o.deepAccess)(n, 'mediaTypes.video'),
                    i = r && Object(o.deepAccess)(r, 'context');
                return u(e, n, r, i);
            });
        n(8);
        var o = n(0),
            i = n(3),
            r = n(7),
            a = (n.n(r), n(17)),
            c = 'outstream';
        var u = Object(a.a)(
            'sync',
            function(e, t, n, r) {
                return !t || (n && r !== c)
                    ? i.config.getConfig('cache.url') || !e.vastXml || e.vastUrl
                      ? !(!e.vastUrl && !e.vastXml)
                      : (Object(o.logError)(
                            '\n        This bid contains only vastXml and will not work when a prebid cache url is not specified.\n        Try enabling prebid cache with pbjs.setConfig({ cache: {url: "..."} });\n      '
                        ),
                        !1)
                    : r !== c || !(!e.renderer && !t.renderer);
            },
            'checkVideoBidSetup'
        );
    },
    43: function(e, t, n) {
        'use strict';
        (t.a = function() {
            return window.pbjs;
        }),
            (window.pbjs = window.pbjs || {}),
            (window.pbjs.cmd = window.pbjs.cmd || []),
            (window.pbjs.que = window.pbjs.que || []);
    },
    44: function(e, t, n) {
        'use strict';
        (t.a = B),
            n.d(t, 'b', function() {
                return u;
            });
        var h = n(0),
            E = n(3),
            S = n(18),
            r = n(30),
            i = n(39),
            o = n(7),
            T = n.n(o);
        function A(e) {
            return (
                (function(e) {
                    if (Array.isArray(e)) {
                        for (
                            var t = 0, n = new Array(e.length);
                            t < e.length;
                            t++
                        )
                            n[t] = e[t];
                        return n;
                    }
                })(e) ||
                (function(e) {
                    if (
                        Symbol.iterator in Object(e) ||
                        '[object Arguments]' ===
                            Object.prototype.toString.call(e)
                    )
                        return Array.from(e);
                })(e) ||
                (function() {
                    throw new TypeError(
                        'Invalid attempt to spread non-iterable instance'
                    );
                })()
            );
        }
        function I() {
            return (I =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        function O(e, t, n) {
            return (
                t in e
                    ? Object.defineProperty(e, t, {
                          value: n,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                      })
                    : (e[t] = n),
                e
            );
        }
        var w = n(0),
            C = n(4),
            j = [],
            _ = Object.keys(C.TARGETING_KEYS).map(function(e) {
                return C.TARGETING_KEYS[e];
            }),
            a = function(e) {
                return (
                    e.responseTimestamp + 1e3 * e.ttl + 1e3 >
                    Object(h.timestamp)()
                );
            },
            c = function(e) {
                return (
                    e &&
                    ((e.status &&
                        !T()(
                            [
                                C.BID_STATUS.BID_TARGETING_SET,
                                C.BID_STATUS.RENDERED,
                            ],
                            e.status
                        )) ||
                        !e.status)
                );
            };
        function B(e, n) {
            var r = [],
                i = Object(h.groupBy)(e, 'adUnitCode');
            return (
                Object.keys(i).forEach(function(e) {
                    var t = Object(h.groupBy)(i[e], 'bidderCode');
                    Object.keys(t).forEach(function(e) {
                        return r.push(t[e].reduce(n));
                    });
                }),
                r
            );
        }
        var u = (function(n) {
            var g = {},
                r = {};
            function p(e) {
                return 'string' == typeof e
                    ? [e]
                    : w.isArray(e) ? e : n.getAdUnitCodes() || [];
            }
            function b() {
                var e = n.getBidsReceived();
                return (
                    E.config.getConfig('useBidCache') ||
                        (e = e.filter(function(e) {
                            return r[e.adUnitCode] === e.auctionId;
                        })),
                    B(
                        (e = e
                            .filter(function(e) {
                                return (
                                    'banner' !== e.mediaType ||
                                    Object(i.c)([e.width, e.height])
                                );
                            })
                            .filter(c)
                            .filter(a)),
                        h.getOldestHighestCpmBid
                    )
                );
            }
            function y() {
                return n
                    .getStandardBidderAdServerTargeting()
                    .map(function(e) {
                        return e.key;
                    })
                    .concat(_)
                    .filter(h.uniques);
            }
            function v(r, i, e, t) {
                return (
                    Object.keys(i.adserverTargeting)
                        .filter(o())
                        .forEach(function(e) {
                            var t, n;
                            r.length &&
                                r
                                    .filter(
                                        ((n = e),
                                        function(e) {
                                            return (
                                                e.adUnitCode === i.adUnitCode &&
                                                e.adserverTargeting[n]
                                            );
                                        })
                                    )
                                    .forEach(
                                        ((t = e),
                                        function(e) {
                                            w.isArray(e.adserverTargeting[t]) ||
                                                (e.adserverTargeting[t] = [
                                                    e.adserverTargeting[t],
                                                ]),
                                                (e.adserverTargeting[
                                                    t
                                                ] = e.adserverTargeting[t]
                                                    .concat(
                                                        i.adserverTargeting[t]
                                                    )
                                                    .filter(h.uniques)),
                                                delete i.adserverTargeting[t];
                                        })
                                    );
                        }),
                    r.push(i),
                    r
                );
            }
            function o() {
                var t = y();
                return function(e) {
                    return -1 === t.indexOf(e);
                };
            }
            function m(t) {
                return O(
                    {},
                    t.adUnitCode,
                    Object.keys(t.adserverTargeting)
                        .filter(o())
                        .map(function(e) {
                            return O({}, e.substring(0, 20), [
                                t.adserverTargeting[e],
                            ]);
                        })
                );
            }
            return (
                (g.setLatestAuctionForAdUnit = function(e, t) {
                    r[e] = t;
                }),
                (g.resetPresetTargeting = function(e) {
                    if (Object(h.isGptPubadsDefined)()) {
                        var t = p(e),
                            r = n.getAdUnits().filter(function(e) {
                                return T()(t, e.code);
                            });
                        window.googletag
                            .pubads()
                            .getSlots()
                            .forEach(function(n) {
                                j.forEach(function(t) {
                                    r.forEach(function(e) {
                                        (e.code !== n.getAdUnitPath() &&
                                            e.code !== n.getSlotElementId()) ||
                                            n.setTargeting(t, null);
                                    });
                                });
                            });
                    }
                }),
                (g.resetPresetTargetingAST = function(e) {
                    p(e).forEach(function(e) {
                        var t = window.apntag.getTag(e);
                        if (t && t.keywords) {
                            var n = Object.keys(t.keywords),
                                r = {};
                            n.forEach(function(e) {
                                T()(j, e.toLowerCase()) ||
                                    (r[e] = t.keywords[e]);
                            }),
                                window.apntag.modifyTag(e, { keywords: r });
                        }
                    });
                }),
                (g.getAllTargeting = function(e) {
                    var r,
                        t,
                        i,
                        n,
                        o,
                        a,
                        c,
                        u,
                        s,
                        d =
                            1 < arguments.length && void 0 !== arguments[1]
                                ? arguments[1]
                                : b(),
                        f = p(e),
                        l = ((a = f),
                        (c = d),
                        (u = g.getWinningBids(a, c)),
                        (s = y()),
                        (u = u.map(function(o) {
                            return O(
                                {},
                                o.adUnitCode,
                                Object.keys(o.adserverTargeting)
                                    .filter(function(e) {
                                        return (
                                            void 0 ===
                                                o.sendStandardTargeting ||
                                            o.sendStandardTargeting ||
                                            -1 === s.indexOf(e)
                                        );
                                    })
                                    .reduce(function(e, t) {
                                        var n = [o.adserverTargeting[t]],
                                            r = O({}, t.substring(0, 20), n);
                                        if (t !== C.TARGETING_KEYS.DEAL)
                                            return [].concat(A(e), [r]);
                                        var i = O(
                                            {},
                                            ''
                                                .concat(t, '_')
                                                .concat(o.bidderCode)
                                                .substring(0, 20),
                                            n
                                        );
                                        return [].concat(A(e), [r, i]);
                                    }, [])
                            );
                        })))
                            .concat(
                                ((n = f),
                                (o = d),
                                o
                                    .filter(function(e) {
                                        return T()(n, e.adUnitCode);
                                    })
                                    .map(function(e) {
                                        return I({}, e);
                                    })
                                    .reduce(v, [])
                                    .map(m)
                                    .filter(function(e) {
                                        return e;
                                    }))
                            )
                            .concat(
                                E.config.getConfig('enableSendAllBids')
                                    ? ((r = f),
                                      (t = d),
                                      (i = _.concat(S.a)),
                                      B(t, h.getHighestCpm)
                                          .map(function(t) {
                                              if (
                                                  t.adserverTargeting &&
                                                  r &&
                                                  ((w.isArray(r) &&
                                                      T()(r, t.adUnitCode)) ||
                                                      ('string' == typeof r &&
                                                          t.adUnitCode === r))
                                              )
                                                  return O(
                                                      {},
                                                      t.adUnitCode,
                                                      ((n = t),
                                                      i
                                                          .filter(function(e) {
                                                              return (
                                                                  void 0 !==
                                                                  t
                                                                      .adserverTargeting[
                                                                      e
                                                                  ]
                                                              );
                                                          })
                                                          .map(function(e) {
                                                              return O(
                                                                  {},
                                                                  ''
                                                                      .concat(
                                                                          e,
                                                                          '_'
                                                                      )
                                                                      .concat(
                                                                          n.bidderCode
                                                                      )
                                                                      .substring(
                                                                          0,
                                                                          20
                                                                      ),
                                                                  [
                                                                      n
                                                                          .adserverTargeting[
                                                                          e
                                                                      ],
                                                                  ]
                                                              );
                                                          }))
                                                  );
                                              var n;
                                          })
                                          .filter(function(e) {
                                              return e;
                                          }))
                                    : []
                            );
                    return (
                        l.map(function(t) {
                            Object.keys(t).map(function(e) {
                                t[e].map(function(e) {
                                    -1 === j.indexOf(Object.keys(e)[0]) &&
                                        (j = Object.keys(e).concat(j));
                                });
                            });
                        }),
                        (l = l
                            .map(function(e) {
                                return O(
                                    {},
                                    Object.keys(e)[0],
                                    e[Object.keys(e)[0]]
                                        .map(function(e) {
                                            return O(
                                                {},
                                                Object.keys(e)[0],
                                                e[Object.keys(e)[0]].join(', ')
                                            );
                                        })
                                        .reduce(function(e, t) {
                                            return I(t, e);
                                        }, {})
                                );
                            })
                            .reduce(function(e, t) {
                                var n = Object.keys(t)[0];
                                return (e[n] = I({}, e[n], t[n])), e;
                            }, {})),
                        f.forEach(function(e) {
                            l[e] || (l[e] = {});
                        }),
                        l
                    );
                }),
                (g.setTargetingForGPT = function(i, e) {
                    window.googletag
                        .pubads()
                        .getSlots()
                        .forEach(function(r) {
                            Object.keys(i)
                                .filter(
                                    e
                                        ? e(r)
                                        : Object(h.isAdUnitCodeMatchingSlot)(r)
                                )
                                .forEach(function(n) {
                                    return Object.keys(i[n]).forEach(function(
                                        t
                                    ) {
                                        var e = i[n][t].split(',');
                                        (e = 1 < e.length ? [e] : e)
                                            .map(function(e) {
                                                return (
                                                    w.logMessage(
                                                        'Attempting to set key value for slot: '
                                                            .concat(
                                                                r.getSlotElementId(),
                                                                ' key: '
                                                            )
                                                            .concat(
                                                                t,
                                                                ' value: '
                                                            )
                                                            .concat(e)
                                                    ),
                                                    e
                                                );
                                            })
                                            .forEach(function(e) {
                                                r.setTargeting(t, e);
                                            });
                                    });
                                });
                        });
                }),
                (g.getWinningBids = function(e) {
                    var n =
                            1 < arguments.length && void 0 !== arguments[1]
                                ? arguments[1]
                                : b(),
                        t = p(e);
                    return n
                        .filter(function(e) {
                            return T()(t, e.adUnitCode);
                        })
                        .filter(function(e) {
                            return 0 < e.cpm;
                        })
                        .map(function(e) {
                            return e.adUnitCode;
                        })
                        .filter(h.uniques)
                        .map(function(t) {
                            return n
                                .filter(function(e) {
                                    return e.adUnitCode === t ? e : null;
                                })
                                .reduce(h.getHighestCpm);
                        });
                }),
                (g.setTargetingForAst = function() {
                    var r = g.getAllTargeting();
                    try {
                        g.resetPresetTargetingAST();
                    } catch (e) {
                        w.logError('unable to reset targeting for AST' + e);
                    }
                    Object.keys(r).forEach(function(n) {
                        return Object.keys(r[n]).forEach(function(e) {
                            if (
                                (w.logMessage(
                                    'Attempting to set targeting for targetId: '
                                        .concat(n, ' key: ')
                                        .concat(e, ' value: ')
                                        .concat(r[n][e])
                                ),
                                w.isStr(r[n][e]) || w.isArray(r[n][e]))
                            ) {
                                var t = {};
                                e.search(/pt[0-9]/) < 0
                                    ? (t[e.toUpperCase()] = r[n][e])
                                    : (t[e] = r[n][e]),
                                    window.apntag.setKeywords(n, t, {
                                        overrideKeyValue: !0,
                                    });
                            }
                        });
                    });
                }),
                (g.isApntagDefined = function() {
                    if (window.apntag && w.isFn(window.apntag.setKeywords))
                        return !0;
                }),
                g
            );
        })(r.a);
    },
    45: function(e, t, n) {
        'use strict';
        n.d(t, 'a', function() {
            return N;
        }),
            (t.d = function(e) {
                var t,
                    f,
                    l,
                    g,
                    p = e.adUnits,
                    n = e.adUnitCodes,
                    r = e.callback,
                    i = e.cbTimeout,
                    o = e.labels,
                    u = p,
                    s = o,
                    b = n,
                    y = [],
                    v = [],
                    a = [],
                    m = C.generateUUID(),
                    h = r,
                    E = i,
                    c = [];
                function S() {
                    return {
                        auctionId: m,
                        timestamp: t,
                        auctionEnd: f,
                        auctionStatus: l,
                        adUnits: u,
                        adUnitCodes: b,
                        labels: s,
                        bidderRequests: y,
                        noBids: a,
                        bidsReceived: v,
                        winningBids: c,
                        timeout: E,
                    };
                }
                function d(e, t) {
                    if ((t && clearTimeout(g), null != h)) {
                        var n = [];
                        e &&
                            (C.logMessage('Auction '.concat(m, ' timedOut')),
                            (c = v),
                            (u = (a = y)
                                .filter(function(e) {
                                    return !e.doneCbCallCount;
                                })
                                .map(function(e) {
                                    return e.bidderCode;
                                })
                                .filter(A.uniques)),
                            (s = c
                                .map(function(e) {
                                    return e.bidder;
                                })
                                .filter(A.uniques)),
                            (d = u.filter(function(e) {
                                return !O()(s, e);
                            })),
                            (n = a
                                .map(function(e) {
                                    return (e.bids || []).filter(function(e) {
                                        return O()(d, e.bidder);
                                    });
                                })
                                .reduce(A.flatten, [])
                                .map(function(e) {
                                    return {
                                        bidId: e.bidId,
                                        bidder: e.bidder,
                                        adUnitCode: e.adUnitCode,
                                        auctionId: e.auctionId,
                                    };
                                })).length && _.emit(B.EVENTS.BID_TIMEOUT, n));
                        try {
                            (l = N),
                                (f = Date.now()),
                                _.emit(B.EVENTS.AUCTION_END, S());
                            var r = b,
                                i = v
                                    .filter(A.adUnitsFilter.bind(this, r))
                                    .reduce(M, {});
                            h.apply(pbjs, [i, e]);
                        } catch (e) {
                            C.logError(
                                'Error executing bidsBackHandler',
                                null,
                                e
                            );
                        } finally {
                            n.length && j.callTimedOutBidders(p, n, E);
                            var o = I.config.getConfig('userSync') || {};
                            o.enableOverride || w(o.syncDelay);
                        }
                        h = null;
                    }
                    var a, c, u, s, d;
                }
                function T() {
                    C.logInfo(
                        'Bids Received for Auction with id: '.concat(m),
                        v
                    ),
                        (l = N),
                        d(!1, !0);
                }
                return {
                    addBidReceived: function(e) {
                        v = v.concat(e);
                    },
                    addNoBid: function(e) {
                        a = a.concat(e);
                    },
                    executeCallback: d,
                    callBids: function() {
                        var n = this;
                        (l = U), (t = Date.now());
                        var i = j.makeBidRequests(u, t, m, E, s);
                        C.logInfo(
                            'Bids Requested for Auction with id: '.concat(m),
                            i
                        ),
                            i.forEach(function(e) {
                                var t;
                                (t = e), (y = y.concat(t));
                            });
                        var o = {};
                        if (i.length < 1)
                            C.logWarn(
                                'No valid bid requests returned for auction'
                            ),
                                T();
                        else {
                            var e = {
                                bidRequests: i,
                                run: function() {
                                    var e, t;
                                    (e = d.bind(null, !0)),
                                        (t = setTimeout(e, E)),
                                        (g = t),
                                        (l = R),
                                        _.emit(B.EVENTS.AUCTION_INIT, S());
                                    var r = G(T, n);
                                    j.callBids(
                                        u,
                                        i,
                                        function() {
                                            for (
                                                var e = arguments.length,
                                                    t = new Array(e),
                                                    n = 0;
                                                n < e;
                                                n++
                                            )
                                                t[n] = arguments[n];
                                            q.apply(
                                                {
                                                    dispatch: r.addBidResponse,
                                                    bidderRequest: this,
                                                },
                                                t
                                            );
                                        },
                                        r.adapterDone,
                                        {
                                            request: function(e, t) {
                                                c(k, t),
                                                    c(o, e),
                                                    P[e] ||
                                                        (P[e] = {
                                                            SRA: !0,
                                                            origin: t,
                                                        }),
                                                    1 < o[e] && (P[e].SRA = !1);
                                            },
                                            done: function(e) {
                                                k[e]--,
                                                    x[0] &&
                                                        a(x[0]) &&
                                                        x.shift();
                                            },
                                        },
                                        E
                                    );
                                },
                            };
                            a(e) ||
                                (C.logWarn(
                                    'queueing auction due to limited endpoint capacity'
                                ),
                                x.push(e));
                        }
                        function a(e) {
                            var r = !0,
                                i =
                                    I.config.getConfig(
                                        'maxRequestsPerOrigin'
                                    ) || D;
                            return (
                                e.bidRequests.some(function(e) {
                                    var t = 1,
                                        n =
                                            void 0 !== e.src &&
                                            e.src === B.S2S.SRC
                                                ? 's2s'
                                                : e.bidderCode;
                                    return (
                                        P[n] &&
                                            (!1 === P[n].SRA &&
                                                (t = Math.min(
                                                    e.bids.length,
                                                    i
                                                )),
                                            k[P[n].origin] + t > i && (r = !1)),
                                        !r
                                    );
                                }),
                                r && e.run(),
                                r
                            );
                        }
                        function c(e, t) {
                            void 0 === e[t] ? (e[t] = 1) : e[t]++;
                        }
                    },
                    addWinningBid: function(e) {
                        (c = c.concat(e)), j.callBidWonBidder(e.bidder, e, p);
                    },
                    setBidTargeting: function(e) {
                        j.callSetTargetingBidder(e.bidder, e);
                    },
                    getWinningBids: function() {
                        return c;
                    },
                    getTimeout: function() {
                        return E;
                    },
                    getAuctionId: function() {
                        return m;
                    },
                    getAuctionStatus: function() {
                        return l;
                    },
                    getAdUnits: function() {
                        return u;
                    },
                    getAdUnitCodes: function() {
                        return b;
                    },
                    getBidRequests: function() {
                        return y;
                    },
                    getBidsReceived: function() {
                        return v;
                    },
                    getNoBids: function() {
                        return a;
                    },
                };
            }),
            n.d(t, 'b', function() {
                return q;
            }),
            (t.c = E);
        var A = n(0),
            l = n(31),
            o = n(18),
            a = n(198),
            g = n(12),
            I = n(3),
            r = n(19),
            i = n(17),
            c = n(10),
            p = n.n(c),
            u = n(7),
            O = n.n(u),
            s = n(42);
        function b(e) {
            return (b =
                'function' == typeof Symbol &&
                'symbol' == typeof Symbol.iterator
                    ? function(e) {
                          return typeof e;
                      }
                    : function(e) {
                          return e &&
                              'function' == typeof Symbol &&
                              e.constructor === Symbol &&
                              e !== Symbol.prototype
                              ? 'symbol'
                              : typeof e;
                      })(e);
        }
        function y() {
            return (y =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        var w = r.a.syncUsers,
            C = n(0),
            j = n(8).default,
            _ = n(9),
            B = n(4),
            U = 'started',
            R = 'inProgress',
            N = 'completed';
        _.on(B.EVENTS.BID_ADJUSTMENT, function(e) {
            !(function(e) {
                var t,
                    n = e.bidderCode,
                    r = e.cpm;
                if (
                    pbjs.bidderSettings &&
                    (n &&
                    pbjs.bidderSettings[n] &&
                    'function' == typeof pbjs.bidderSettings[n].bidCpmAdjustment
                        ? (t = pbjs.bidderSettings[n].bidCpmAdjustment)
                        : pbjs.bidderSettings[
                              B.JSON_MAPPING.BD_SETTING_STANDARD
                          ] &&
                          'function' ==
                              typeof pbjs.bidderSettings[
                                  B.JSON_MAPPING.BD_SETTING_STANDARD
                              ].bidCpmAdjustment &&
                          (t =
                              pbjs.bidderSettings[
                                  B.JSON_MAPPING.BD_SETTING_STANDARD
                              ].bidCpmAdjustment),
                    t)
                )
                    try {
                        r = t(e.cpm, y({}, e));
                    } catch (e) {
                        C.logError(
                            'Error during bid adjustment',
                            'bidmanager.js',
                            e
                        );
                    }
                0 <= r && (e.cpm = r);
            })(e);
        });
        var D = 4,
            k = {},
            P = {},
            x = [];
        var q = Object(i.a)(
            'async',
            function(e, t) {
                this.dispatch.call(this.bidderRequest, e, t);
            },
            'addBidResponse'
        );
        function G(t, o) {
            var a = 0,
                n = false,
                r = new Set(),
                c = {};
            function u() {
                a--;
                if (n && a === 0) {
                    t();
                }
            }
            function e(e, t) {
                var n = this;
                (c[t.requestId] = true), a++;
                var r = o.getAuctionId(),
                    i = h({
                        adUnitCode: e,
                        bid: t,
                        bidderRequest: n,
                        auctionId: r,
                    });
                if (i.mediaType === 'video') {
                    v(o, i, n, u);
                } else {
                    f(o, i);
                    u();
                }
            }
            function i() {
                var e = this;
                if (
                    (r.add(this),
                    (n = o.getBidRequests().every(function(e) {
                        return r.has(e);
                    })),
                    this.bids.forEach(function(e) {
                        c[e.bidId] ||
                            (o.addNoBid(e), _.emit(B.EVENTS.NO_BID, e));
                    }),
                    n && 0 === a)
                ) {
                    t();
                }
            }
            return { addBidResponse: e, adapterDone: i };
        }
        function d(e, t) {
            t.timeToRespond >
                e.getTimeout() + I.config.getConfig('timeoutBuffer') &&
                e.executeCallback(!0);
        }
        function f(e, t) {
            _.emit(B.EVENTS.BID_RESPONSE, t), e.addBidReceived(t), d(e, t);
        }
        function v(e, t, n, r) {
            var i = true,
                o = Object(A['getBidRequest'])(t.requestId, [n]),
                a = o && Object(A['deepAccess'])(o, 'mediaTypes.video'),
                c = a && Object(A['deepAccess'])(a, 'context');
            if (I['config'].getConfig('cache.url') && c !== s['a']) {
                if (!t.videoCacheKey) {
                    i = false;
                    m(e, t, r, o);
                } else if (!t.vastUrl) {
                    C.logError(
                        'videoCacheKey specified but not required vastUrl for video bid'
                    );
                    i = false;
                }
            }
            if (i) {
                f(e, t);
                r();
            }
        }
        var m = Object(i.a)(
            'async',
            function(n, r, i, e) {
                Object(a.b)([r], function(e, t) {
                    e
                        ? (C.logWarn(
                              'Failed to save to the video cache: '.concat(
                                  e,
                                  '. Video bid must be discarded.'
                              )
                          ),
                          d(n, r))
                        : '' === t[0].uuid
                          ? (C.logWarn(
                                'Supplied video cache key was already in use by Prebid Cache; caching attempt was rejected. Video bid must be discarded.'
                            ),
                            d(n, r))
                          : ((r.videoCacheKey = t[0].uuid),
                            r.vastUrl ||
                                (r.vastUrl = Object(a.a)(r.videoCacheKey)),
                            f(n, r),
                            i());
                });
            },
            'callPrebidCache'
        );
        function h(e) {
            var t = e.adUnitCode,
                n = e.bid,
                r = e.bidderRequest,
                i = e.auctionId,
                o = r.start,
                a = y({}, n, {
                    auctionId: i,
                    responseTimestamp: Object(A['timestamp'])(),
                    requestTimestamp: o,
                    cpm: parseFloat(n.cpm) || 0,
                    bidder: n.bidderCode,
                    adUnitCode: t,
                });
            (a.timeToRespond = a.responseTimestamp - a.requestTimestamp),
                _.emit(B.EVENTS.BID_ADJUSTMENT, a);
            var c =
                    r.bids &&
                    p()(r.bids, function(e) {
                        return e.adUnitCode == t;
                    }),
                u = c && c.renderer;
            if (u && u.url) {
                a.renderer = g['a'].install({ url: u.url });
                a.renderer.setRender(u.render);
            }
            var s = I['config'].getConfig(
                    'mediaTypePriceGranularity.'.concat(n.mediaType)
                ),
                d = Object(l['a'])(
                    a.cpm,
                    b(s) === 'object'
                        ? s
                        : I['config'].getConfig('customPriceBucket'),
                    I['config'].getConfig('currency.granularityMultiplier')
                ),
                f;
            if (
                ((a.pbLg = d.low),
                (a.pbMg = d.med),
                (a.pbHg = d.high),
                (a.pbAg = d.auto),
                (a.pbDg = d.dense),
                (a.pbCg = d.custom),
                a.bidderCode && (0 < a.cpm || a.dealId))
            ) {
                f = S(a.bidderCode, a);
            }
            return (a.adserverTargeting = y(a.adserverTargeting || {}, f)), a;
        }
        function E(e) {
            var t = I.config.getConfig('mediaTypePriceGranularity.'.concat(e)),
                n =
                    'string' == typeof e && t
                        ? 'string' == typeof t ? t : 'custom'
                        : I.config.getConfig('priceGranularity'),
                r = pbjs.bidderSettings;
            return (
                r[B.JSON_MAPPING.BD_SETTING_STANDARD] ||
                    (r[B.JSON_MAPPING.BD_SETTING_STANDARD] = {}),
                r[B.JSON_MAPPING.BD_SETTING_STANDARD][
                    B.JSON_MAPPING.ADSERVER_TARGETING
                ] ||
                    (r[B.JSON_MAPPING.BD_SETTING_STANDARD][
                        B.JSON_MAPPING.ADSERVER_TARGETING
                    ] = [
                        {
                            key: B.TARGETING_KEYS.BIDDER,
                            val: function(e) {
                                return e.bidderCode;
                            },
                        },
                        {
                            key: B.TARGETING_KEYS.AD_ID,
                            val: function(e) {
                                return e.adId;
                            },
                        },
                        {
                            key: B.TARGETING_KEYS.PRICE_BUCKET,
                            val: function(e) {
                                return n === B.GRANULARITY_OPTIONS.AUTO
                                    ? e.pbAg
                                    : n === B.GRANULARITY_OPTIONS.DENSE
                                      ? e.pbDg
                                      : n === B.GRANULARITY_OPTIONS.LOW
                                        ? e.pbLg
                                        : n === B.GRANULARITY_OPTIONS.MEDIUM
                                          ? e.pbMg
                                          : n === B.GRANULARITY_OPTIONS.HIGH
                                            ? e.pbHg
                                            : n === B.GRANULARITY_OPTIONS.CUSTOM
                                              ? e.pbCg
                                              : void 0;
                            },
                        },
                        {
                            key: B.TARGETING_KEYS.SIZE,
                            val: function(e) {
                                return e.size;
                            },
                        },
                        {
                            key: B.TARGETING_KEYS.DEAL,
                            val: function(e) {
                                return e.dealId;
                            },
                        },
                        {
                            key: B.TARGETING_KEYS.SOURCE,
                            val: function(e) {
                                return e.source;
                            },
                        },
                        {
                            key: B.TARGETING_KEYS.FORMAT,
                            val: function(e) {
                                return e.mediaType;
                            },
                        },
                    ]),
                r[B.JSON_MAPPING.BD_SETTING_STANDARD]
            );
        }
        function S(e, t) {
            if (!t) {
                return {};
            }
            var n = {},
                r = pbjs.bidderSettings;
            if (r) {
                var i = E(t.mediaType);
                T(n, i, t);
                if (e && r[e] && r[e][B.JSON_MAPPING.ADSERVER_TARGETING]) {
                    T(n, r[e], t);
                    t.sendStandardTargeting = r[e].sendStandardTargeting;
                }
            }
            if (t['native']) {
                n = y({}, n, Object(o['c'])(t));
            }
            return n;
        }
        function T(r, i, o) {
            var e = i[B.JSON_MAPPING.ADSERVER_TARGETING];
            return (
                (o.size = o.getSize()),
                C._each(e, function(e) {
                    var t = e.key,
                        n = e.val;
                    if (
                        (r[t] &&
                            C.logWarn(
                                'The key: ' + t + ' is getting ovewritten'
                            ),
                        C.isFn(n))
                    )
                        try {
                            n = n(o);
                        } catch (e) {
                            C.logError('bidmanager', 'ERROR', e);
                        }
                    ((void 0 === i.suppressEmptyKeys ||
                        !0 !== i.suppressEmptyKeys) &&
                        t !== B.TARGETING_KEYS.DEAL) ||
                    (!C.isEmptyStr(n) && null != n)
                        ? (r[t] = n)
                        : C.logInfo(
                              "suppressing empty key '" +
                                  t +
                                  "' from adserver targeting"
                          );
                }),
                r
            );
        }
        function M(e, t) {
            return (
                e[t.adUnitCode] || (e[t.adUnitCode] = { bids: [] }),
                e[t.adUnitCode].bids.push(t),
                e
            );
        }
    },
    48: function(e, t, n) {
        'use strict';
        var r = n(15),
            i = n(34)(5),
            o = 'find',
            a = !0;
        o in [] &&
            Array(1)[o](function() {
                a = !1;
            }),
            r(r.P + r.F * a, 'Array', {
                find: function(e) {
                    return i(
                        this,
                        e,
                        1 < arguments.length ? arguments[1] : void 0
                    );
                },
            }),
            n(27)(o);
    },
    489: function(e, t, n) {
        e.exports = n(490);
    },
    49: function(e, t) {
        e.exports = function(e) {
            if ('function' != typeof e)
                throw TypeError(e + ' is not a function!');
            return e;
        };
    },
    490: function(e, t, n) {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 });
        var r = n(43),
            c = n(0),
            i = n(491),
            o = n(19),
            a = n(29),
            u = n(3),
            y = n(30),
            s = n(44),
            d = n(17),
            f = n(492),
            l = n(7),
            g = n.n(l),
            p = n(40),
            v = n(12),
            b = n(14);
        function m(e) {
            return (m =
                'function' == typeof Symbol &&
                'symbol' == typeof Symbol.iterator
                    ? function(e) {
                          return typeof e;
                      }
                    : function(e) {
                          return e &&
                              'function' == typeof Symbol &&
                              e.constructor === Symbol &&
                              e !== Symbol.prototype
                              ? 'symbol'
                              : typeof e;
                      })(e);
        }
        function h() {
            return (h =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        var E = Object(r.a)(),
            S = n(4),
            T = n(0),
            A = n(8).default,
            I = n(9),
            O = o.a.triggerUserSyncs,
            w = S.EVENTS,
            C = w.ADD_AD_UNITS,
            j = w.BID_WON,
            _ = w.REQUEST_BIDS,
            B = w.SET_TARGETING,
            U = w.AD_RENDER_FAILED,
            R = S.AD_RENDER_FAILED_REASON,
            N = R.PREVENT_WRITING_ON_MAIN_DOCUMENT,
            D = R.NO_AD,
            k = R.EXCEPTION,
            P = R.CANNOT_FIND_AD,
            x = R.MISSING_DOC_OR_ADID,
            q = {
                bidWon: function(e) {
                    var t = y.a
                        .getBidsRequested()
                        .map(function(e) {
                            return e.bids.map(function(e) {
                                return e.adUnitCode;
                            });
                        })
                        .reduce(c.flatten)
                        .filter(c.uniques);
                    return (
                        !!T.contains(t, e) ||
                        void T.logError(
                            'The "' + e + '" placement is not defined.'
                        )
                    );
                },
            };
        function G(e, t, n) {
            e.defaultView &&
                e.defaultView.frameElement &&
                ((e.defaultView.frameElement.width = t),
                (e.defaultView.frameElement.height = n));
        }
        Object(f.a)(),
            (E.bidderSettings = E.bidderSettings || {}),
            (E.libLoaded = !0),
            (E.version = 'v2.3.0'),
            T.logInfo('Prebid.js v2.3.0 loaded'),
            (E.adUnits = E.adUnits || []),
            (E.triggerUserSyncs = O);
        var M = Object(d.a)(
            'sync',
            function(e) {
                return (
                    e.forEach(function(e) {
                        var t = e.mediaTypes,
                            n = T.getAdUnitSizes(e);
                        if (t && t.banner) {
                            var r = t.banner;
                            r.sizes
                                ? ((r.sizes = n), (e.sizes = n))
                                : (T.logError(
                                      'Detected a mediaTypes.banner object did not include sizes.  This is a required field for the mediaTypes.banner object.  Removing invalid mediaTypes.banner object from request.'
                                  ),
                                  delete e.mediaTypes.banner);
                        } else e.sizes && (T.logWarn('Usage of adUnits.sizes will eventually be deprecated.  Please define size dimensions within the corresponding area of the mediaTypes.<object> (eg mediaTypes.banner.sizes).'), (e.sizes = n));
                        if (t && t.video) {
                            var i = t.video;
                            if (i.playerSize)
                                if (
                                    Array.isArray(i.playerSize) &&
                                    1 === i.playerSize.length &&
                                    i.playerSize.every(function(e) {
                                        return Object(c.isArrayOfNums)(e, 2);
                                    })
                                )
                                    e.sizes = i.playerSize;
                                else if (
                                    Object(c.isArrayOfNums)(i.playerSize, 2)
                                ) {
                                    var o = [];
                                    o.push(i.playerSize),
                                        T.logInfo(
                                            'Transforming video.playerSize from ['
                                                .concat(i.playerSize, '] to [[')
                                                .concat(
                                                    o,
                                                    "]] so it's in the proper format."
                                                )
                                        ),
                                        (e.sizes = i.playerSize = o);
                                } else
                                    T.logError(
                                        'Detected incorrect configuration of mediaTypes.video.playerSize.  Please specify only one set of dimensions in a format like: [[640, 480]]. Removing invalid mediaTypes.video.playerSize property from request.'
                                    ),
                                        delete e.mediaTypes.video.playerSize;
                        }
                        if (t && t.native) {
                            var a = t.native;
                            a.image &&
                                a.image.sizes &&
                                !Array.isArray(a.image.sizes) &&
                                (T.logError(
                                    'Please use an array of sizes for native.image.sizes field.  Removing invalid mediaTypes.native.image.sizes property from request.'
                                ),
                                delete e.mediaTypes.native.image.sizes),
                                a.image &&
                                    a.image.aspect_ratios &&
                                    !Array.isArray(a.image.aspect_ratios) &&
                                    (T.logError(
                                        'Please use an array of sizes for native.image.aspect_ratios field.  Removing invalid mediaTypes.native.image.aspect_ratios property from request.'
                                    ),
                                    delete e.mediaTypes.native.image
                                        .aspect_ratios),
                                a.icon &&
                                    a.icon.sizes &&
                                    !Array.isArray(a.icon.sizes) &&
                                    (T.logError(
                                        'Please use an array of sizes for native.icon.sizes field.  Removing invalid mediaTypes.native.icon.sizes property from request.'
                                    ),
                                    delete e.mediaTypes.native.icon.sizes);
                        }
                    }),
                    e
                );
            },
            'checkAdUnitSetup'
        );
        function W(e) {
            var n = y.a[e]().filter(
                    c.adUnitsFilter.bind(this, y.a.getAdUnitCodes())
                ),
                r = y.a.getLastAuctionId();
            return n
                .map(function(e) {
                    return e.adUnitCode;
                })
                .filter(c.uniques)
                .map(function(t) {
                    return n.filter(function(e) {
                        return e.auctionId === r && e.adUnitCode === t;
                    });
                })
                .filter(function(e) {
                    return e && e[0] && e[0].adUnitCode;
                })
                .map(function(e) {
                    return (
                        (t = {}),
                        (n = e[0].adUnitCode),
                        (r = { bids: e.map(c.removeRequestId) }),
                        n in t
                            ? Object.defineProperty(t, n, {
                                  value: r,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0,
                              })
                            : (t[n] = r),
                        t
                    );
                    var t, n, r;
                })
                .reduce(function(e, t) {
                    return h(e, t);
                }, {});
        }
        function z(e, t, n) {
            var r = {};
            (r.reason = e),
                (r.message = t),
                n && (r.bid = n),
                T.logError(t),
                I.emit(U, r);
        }
        function L(e) {
            e.forEach(function(e) {
                if (void 0 === e.called)
                    try {
                        e.call(), (e.called = !0);
                    } catch (e) {
                        T.logError(
                            'Error processing command :',
                            'prebid.js',
                            e
                        );
                    }
            });
        }
        (E.getAdserverTargetingForAdUnitCodeStr = function(e) {
            if (
                (T.logInfo(
                    'Invoking pbjs.getAdserverTargetingForAdUnitCodeStr',
                    arguments
                ),
                e)
            ) {
                var t = E.getAdserverTargetingForAdUnitCode(e);
                return T.transformAdServerTargetingObj(t);
            }
            T.logMessage(
                'Need to call getAdserverTargetingForAdUnitCodeStr with adunitCode'
            );
        }),
            (E.getAdserverTargetingForAdUnitCode = function(e) {
                return E.getAdserverTargeting(e)[e];
            }),
            (E.getAdserverTargeting = function(e) {
                return (
                    T.logInfo('Invoking pbjs.getAdserverTargeting', arguments),
                    s.b.getAllTargeting(e)
                );
            }),
            (E.getNoBids = function() {
                return (
                    T.logInfo('Invoking pbjs.getNoBids', arguments),
                    W('getNoBids')
                );
            }),
            (E.getBidResponses = function() {
                return (
                    T.logInfo('Invoking pbjs.getBidResponses', arguments),
                    W('getBidsReceived')
                );
            }),
            (E.getBidResponsesForAdUnitCode = function(t) {
                return {
                    bids: y.a
                        .getBidsReceived()
                        .filter(function(e) {
                            return e.adUnitCode === t;
                        })
                        .map(c.removeRequestId),
                };
            }),
            (E.setTargetingForGPTAsync = function(e, t) {
                if (
                    (T.logInfo(
                        'Invoking pbjs.setTargetingForGPTAsync',
                        arguments
                    ),
                    Object(c.isGptPubadsDefined)())
                ) {
                    var n = s.b.getAllTargeting(e);
                    s.b.resetPresetTargeting(e),
                        s.b.setTargetingForGPT(n, t),
                        Object.keys(n).forEach(function(t) {
                            Object.keys(n[t]).forEach(function(e) {
                                'hb_adid' === e &&
                                    y.a.setStatusForBids(
                                        n[t][e],
                                        S.BID_STATUS.BID_TARGETING_SET
                                    );
                            });
                        }),
                        I.emit(B, n);
                } else
                    T.logError('window.googletag is not defined on the page');
            }),
            (E.setTargetingForAst = function() {
                T.logInfo('Invoking pbjs.setTargetingForAn', arguments),
                    s.b.isApntagDefined()
                        ? (s.b.setTargetingForAst(),
                          I.emit(B, s.b.getAllTargeting()))
                        : T.logError(
                              'window.apntag is not defined on the page'
                          );
            }),
            (E.renderAd = function(e, t) {
                if (
                    (T.logInfo('Invoking pbjs.renderAd', arguments),
                    T.logMessage('Calling renderAd with adId :' + t),
                    e && t)
                )
                    try {
                        var n = y.a.findBidByAdId(t);
                        if (n) {
                            (n.status = S.BID_STATUS.RENDERED),
                                (n.ad = T.replaceAuctionPrice(n.ad, n.cpm)),
                                (n.adUrl = T.replaceAuctionPrice(
                                    n.adUrl,
                                    n.cpm
                                )),
                                y.a.addWinningBid(n),
                                I.emit(j, n);
                            var r = n.height,
                                i = n.width,
                                o = n.ad,
                                a = n.mediaType,
                                c = n.adUrl,
                                u = n.renderer,
                                s = document.createComment(
                                    'Creative '
                                        .concat(n.creativeId, ' served by ')
                                        .concat(
                                            n.bidder,
                                            ' Prebid.js Header Bidding'
                                        )
                                );
                            if ((T.insertElement(s, e, 'body'), Object(v.c)(u)))
                                Object(v.b)(u, n);
                            else if (
                                (e === document && !T.inIframe()) ||
                                'video' === a
                            ) {
                                var d = 'Error trying to write ad. Ad render call ad id '.concat(
                                    t,
                                    ' was prevented from writing to the main document.'
                                );
                                z(N, d, n);
                            } else if (o)
                                e.open('text/html', 'replace'),
                                    e.write(o),
                                    e.close(),
                                    G(e, i, r),
                                    T.callBurl(n);
                            else if (c) {
                                var f = T.createInvisibleIframe();
                                (f.height = r),
                                    (f.width = i),
                                    (f.style.display = 'inline'),
                                    (f.style.overflow = 'hidden'),
                                    (f.src = c),
                                    T.insertElement(f, e, 'body'),
                                    G(e, i, r),
                                    T.callBurl(n);
                            } else {
                                var l = 'Error trying to write ad. No ad for bid response id: '.concat(
                                    t
                                );
                                z(D, l, n);
                            }
                        } else {
                            var g = 'Error trying to write ad. Cannot find ad by given id : '.concat(
                                t
                            );
                            z(P, g);
                        }
                    } catch (e) {
                        var p = 'Error trying to write ad Id :'
                            .concat(t, ' to the page:')
                            .concat(e.message);
                        z(k, p);
                    }
                else {
                    var b = 'Error trying to write ad Id :'.concat(
                        t,
                        ' to the page. Missing document or adId'
                    );
                    z(x, b);
                }
            }),
            (E.removeAdUnit = function(e) {
                if ((T.logInfo('Invoking pbjs.removeAdUnit', arguments), e))
                    for (var t = 0; t < E.adUnits.length; t++)
                        E.adUnits[t].code === e && E.adUnits.splice(t, 1);
            }),
            (E.requestBids = Object(d.a)('async', function() {
                var e =
                        0 < arguments.length && void 0 !== arguments[0]
                            ? arguments[0]
                            : {},
                    t = e.bidsBackHandler,
                    n = e.timeout,
                    r = e.adUnits,
                    i = e.adUnitCodes,
                    o = e.labels;
                I.emit(_);
                var a = n || u.config.getConfig('bidderTimeout');
                if (
                    ((r = r || E.adUnits),
                    T.logInfo('Invoking pbjs.requestBids', arguments),
                    i && i.length
                        ? (r = r.filter(function(e) {
                              return g()(i, e.code);
                          }))
                        : (i =
                              r &&
                              r.map(function(e) {
                                  return e.code;
                              })),
                    (r = M(r)).forEach(function(i) {
                        var o = Object.keys(
                                i.mediaTypes || { banner: 'banner' }
                            ),
                            e = i.bids.map(function(e) {
                                return e.bidder;
                            }),
                            a = A.bidderRegistry,
                            t = u.config.getConfig('s2sConfig'),
                            n = t && t.bidders,
                            r = n
                                ? e.filter(function(e) {
                                      return !g()(n, e);
                                  })
                                : e;
                        (i.transactionId = T.generateUUID()),
                            r.forEach(function(t) {
                                var e = a[t],
                                    n = e && e.getSpec && e.getSpec(),
                                    r = (n && n.supportedMediaTypes) || [
                                        'banner',
                                    ];
                                o.some(function(e) {
                                    return g()(r, e);
                                }) ||
                                    (T.logWarn(
                                        T.unsupportedBidderMessage(i, t)
                                    ),
                                    (i.bids = i.bids.filter(function(e) {
                                        return e.bidder !== t;
                                    })));
                            }),
                            p.a.incrementCounter(i.code);
                    }),
                    r && 0 !== r.length)
                ) {
                    var c = y.a.createAuction({
                        adUnits: r,
                        adUnitCodes: i,
                        callback: t,
                        cbTimeout: a,
                        labels: o,
                    });
                    return (
                        i.forEach(function(e) {
                            return s.b.setLatestAuctionForAdUnit(
                                e,
                                c.getAuctionId()
                            );
                        }),
                        c.callBids(),
                        c
                    );
                }
                if (
                    (T.logMessage('No adUnits configured. No bids requested.'),
                    'function' == typeof t)
                )
                    try {
                        t();
                    } catch (e) {
                        T.logError('Error executing bidsBackHandler', null, e);
                    }
            })),
            (E.addAdUnits = function(e) {
                T.logInfo('Invoking pbjs.addAdUnits', arguments),
                    T.isArray(e)
                        ? E.adUnits.push.apply(E.adUnits, e)
                        : 'object' === m(e) && E.adUnits.push(e),
                    I.emit(C);
            }),
            (E.onEvent = function(e, t, n) {
                T.logInfo('Invoking pbjs.onEvent', arguments),
                    T.isFn(t)
                        ? !n || q[e].call(null, n)
                          ? I.on(e, t, n)
                          : T.logError(
                                'The id provided is not valid for event "' +
                                    e +
                                    '" and no handler was set.'
                            )
                        : T.logError(
                              'The event handler provided is not a function and was not set on event "' +
                                  e +
                                  '".'
                          );
            }),
            (E.offEvent = function(e, t, n) {
                T.logInfo('Invoking pbjs.offEvent', arguments),
                    (n && !q[e].call(null, n)) || I.off(e, t, n);
            }),
            (E.registerBidAdapter = function(e, t) {
                T.logInfo('Invoking pbjs.registerBidAdapter', arguments);
                try {
                    A.registerBidAdapter(e(), t);
                } catch (e) {
                    T.logError(
                        'Error registering bidder adapter : ' + e.message
                    );
                }
            }),
            (E.registerAnalyticsAdapter = function(e) {
                T.logInfo('Invoking pbjs.registerAnalyticsAdapter', arguments);
                try {
                    A.registerAnalyticsAdapter(e);
                } catch (e) {
                    T.logError(
                        'Error registering analytics adapter : ' + e.message
                    );
                }
            }),
            (E.createBid = function(e) {
                return (
                    T.logInfo('Invoking pbjs.createBid', arguments),
                    Object(b.a)(e)
                );
            }),
            (E.loadScript = function(e, t, n) {
                T.logInfo('Invoking pbjs.loadScript', arguments),
                    Object(a.b)(e, t, n);
            }),
            (E.enableAnalytics = function(e) {
                e && !T.isEmpty(e)
                    ? (T.logInfo('Invoking pbjs.enableAnalytics for: ', e),
                      A.enableAnalytics(e))
                    : T.logError(
                          'pbjs.enableAnalytics should be called with option {}'
                      );
            }),
            (E.aliasBidder = function(e, t) {
                T.logInfo('Invoking pbjs.aliasBidder', arguments),
                    e && t
                        ? A.aliasBidAdapter(e, t)
                        : T.logError(
                              'bidderCode and alias must be passed as arguments',
                              'pbjs.aliasBidder'
                          );
            }),
            (E.getAllWinningBids = function() {
                return y.a.getAllWinningBids().map(c.removeRequestId);
            }),
            (E.getAllPrebidWinningBids = function() {
                return y.a
                    .getBidsReceived()
                    .filter(function(e) {
                        return e.status === S.BID_STATUS.BID_TARGETING_SET;
                    })
                    .map(c.removeRequestId);
            }),
            (E.getHighestCpmBids = function(e) {
                var t = Object(s.a)(
                    y.a.getBidsReceived(),
                    c.getLatestHighestCpmBid
                );
                return s.b.getWinningBids(e, t).map(c.removeRequestId);
            }),
            (E.markWinningBidAsUsed = function(t) {
                var e = [];
                t.adUnitCode && t.adId
                    ? (e = y.a.getBidsReceived().filter(function(e) {
                          return (
                              e.adId === t.adId && e.adUnitCode === t.adUnitCode
                          );
                      }))
                    : t.adUnitCode
                      ? (e = s.b.getWinningBids(t.adUnitCode))
                      : t.adId
                        ? (e = y.a.getBidsReceived().filter(function(e) {
                              return e.adId === t.adId;
                          }))
                        : T.logWarn(
                              "Inproper usage of markWinningBidAsUsed. It'll need an adUnitCode and/or adId to function."
                          ),
                    0 < e.length && (e[0].status = S.BID_STATUS.RENDERED);
            }),
            (E.getConfig = u.config.getConfig),
            (E.setConfig = u.config.setConfig),
            E.que.push(function() {
                return Object(i.a)();
            }),
            (E.cmd.push = function(e) {
                if ('function' == typeof e)
                    try {
                        e.call();
                    } catch (e) {
                        T.logError(
                            'Error processing command :',
                            e.message,
                            e.stack
                        );
                    }
                else
                    T.logError(
                        'Commands written into pbjs.cmd.push must be wrapped in a function'
                    );
            }),
            (E.que.push = E.cmd.push),
            (E.processQueue = function() {
                d.a.ready(), L(E.que), L(E.cmd);
            }),
            (t.default = E);
    },
    491: function(e, t, n) {
        'use strict';
        t.a = function() {
            addEventListener('message', a, !1);
        };
        var r = n(9),
            p = n.n(r),
            b = n(18),
            i = n(4),
            y = (n.n(i), n(0)),
            v = n(30),
            o = n(10),
            m = n.n(o),
            h = n(12),
            E = i.EVENTS.BID_WON;
        function a(e) {
            var t,
                n,
                r,
                i,
                o,
                a,
                c,
                u,
                s,
                d,
                f = e.message ? 'message' : 'data',
                l = {};
            try {
                l = JSON.parse(e[f]);
            } catch (e) {
                return;
            }
            if (l && l.adId) {
                var g = m()(v.a.getBidsReceived(), function(e) {
                    return e.adId === l.adId;
                });
                'Prebid Request' === l.message &&
                    ((t = g),
                    (n = l.adServerDomain),
                    (r = e.source),
                    (i = t.adId),
                    (o = t.ad),
                    (a = t.adUrl),
                    (c = t.width),
                    (u = t.height),
                    (s = t.renderer),
                    (d = t.cpm),
                    Object(h.c)(s)
                        ? Object(h.b)(s, t)
                        : i &&
                          ((function(e) {
                              var c = e.adUnitCode,
                                  r = e.width,
                                  i = e.height;
                              function o(e) {
                                  var t,
                                      n,
                                      r,
                                      i,
                                      o = ((t = c),
                                      window.googletag
                                          ? ((i = t),
                                            m()(
                                                window.googletag
                                                    .pubads()
                                                    .getSlots()
                                                    .filter(
                                                        Object(
                                                            y.isSlotMatchingAdUnitCode
                                                        )(i)
                                                    ),
                                                function(e) {
                                                    return e;
                                                }
                                            ).getSlotElementId())
                                          : window.apntag
                                            ? ((n = t),
                                              (r = window.apntag.getTag(n)) &&
                                                  r.targetId)
                                            : t),
                                      a = document.getElementById(o);
                                  return a && a.querySelector(e);
                              }
                              ['div', 'iframe'].forEach(function(e) {
                                  var t = o(e);
                                  if (t) {
                                      var n = t.style;
                                      (n.width = r + 'px'),
                                          (n.height = i + 'px');
                                  } else Object(y.logWarn)('Unable to locate matching page element for adUnitCode '.concat(c, ".  Can't resize it to ad's dimensions.  Please review setup."));
                              });
                          })(t),
                          r.postMessage(
                              JSON.stringify({
                                  message: 'Prebid Response',
                                  ad: Object(y.replaceAuctionPrice)(o, d),
                                  adUrl: Object(y.replaceAuctionPrice)(a, d),
                                  adId: i,
                                  width: c,
                                  height: u,
                              }),
                              n
                          )),
                    v.a.addWinningBid(g),
                    p.a.emit(E, g)),
                    'Prebid Native' === l.message &&
                        (Object(b.b)(l, g),
                        v.a.addWinningBid(g),
                        p.a.emit(E, g));
            }
        }
    },
    492: function(e, t, n) {
        'use strict';
        t.a = function(e) {
            var t;
            try {
                (e = e || window.sessionStorage),
                    (t = JSON.parse(e.getItem(u)));
            } catch (e) {}
            t && f(t, !0);
        };
        var r = n(3),
            o = n(0),
            i = n(45);
        function a() {
            return (a =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        var c,
            u = 'pbjs:debugging';
        function s(e) {
            Object(o.logMessage)('DEBUG: ' + e);
        }
        function d() {
            i.b.getHooks({ hook: c }).remove();
        }
        function f(e) {
            var t =
                1 < arguments.length && void 0 !== arguments[1] && arguments[1];
            r.config.setConfig({ debug: !0 }),
                s('bidder overrides enabled'.concat(t ? ' from session' : '')),
                d(),
                (c = function(e, r, i) {
                    if (
                        Array.isArray(this.bidders) &&
                        -1 === this.bidders.indexOf(i.bidderCode)
                    )
                        return (
                            (t = "bidder '".concat(
                                i.bidderCode,
                                "' excluded from auction by bidder overrides"
                            )),
                            void Object(o.logWarn)('DEBUG: ' + t)
                        );
                    var t;
                    Array.isArray(this.bids) &&
                        this.bids.forEach(function(n) {
                            (n.bidder && n.bidder !== i.bidderCode) ||
                                (n.adUnitCode && n.adUnitCode !== r) ||
                                ((i = a({}, i)),
                                Object.keys(n)
                                    .filter(function(e) {
                                        return (
                                            -1 ===
                                            ['bidder', 'adUnitCode'].indexOf(e)
                                        );
                                    })
                                    .forEach(function(e) {
                                        var t = n[e];
                                        s(
                                            "bidder overrides changed '"
                                                .concat(r, '/')
                                                .concat(i.bidderCode, "' bid.")
                                                .concat(e, " from '")
                                                .concat(i[e], "' to '")
                                                .concat(t, "'")
                                        ),
                                            (i[e] = t);
                                    }));
                        });
                    e(r, i);
                }.bind(e)),
                i.b.before(c, 5);
        }
        function l(e) {
            if (e.enabled) {
                try {
                    window.sessionStorage.setItem(u, JSON.stringify(e));
                } catch (e) {}
                f(e);
            } else {
                d(), s('bidder overrides disabled');
                try {
                    window.sessionStorage.removeItem(u);
                } catch (e) {}
            }
        }
        r.config.getConfig('debugging', function(e) {
            return l(e.debugging);
        });
    },
    50: function(e, t, n) {
        var r = n(51),
            i = n(56);
        e.exports = n(23)
            ? function(e, t, n) {
                  return r.f(e, t, i(1, n));
              }
            : function(e, t, n) {
                  return (e[t] = n), e;
              };
    },
    51: function(e, t, n) {
        var r = n(52),
            i = n(53),
            o = n(55),
            a = Object.defineProperty;
        t.f = n(23)
            ? Object.defineProperty
            : function(e, t, n) {
                  if ((r(e), (t = o(t, !0)), r(n), i))
                      try {
                          return a(e, t, n);
                      } catch (e) {}
                  if ('get' in n || 'set' in n)
                      throw TypeError('Accessors not supported!');
                  return 'value' in n && (e[t] = n.value), e;
              };
    },
    52: function(e, t, n) {
        var r = n(16);
        e.exports = function(e) {
            if (!r(e)) throw TypeError(e + ' is not an object!');
            return e;
        };
    },
    53: function(e, t, n) {
        e.exports =
            !n(23) &&
            !n(33)(function() {
                return (
                    7 !=
                    Object.defineProperty(n(54)('div'), 'a', {
                        get: function() {
                            return 7;
                        },
                    }).a
                );
            });
    },
    54: function(e, t, n) {
        var r = n(16),
            i = n(20).document,
            o = r(i) && r(i.createElement);
        e.exports = function(e) {
            return o ? i.createElement(e) : {};
        };
    },
    55: function(e, t, n) {
        var i = n(16);
        e.exports = function(e, t) {
            if (!i(e)) return e;
            var n, r;
            if (
                t &&
                'function' == typeof (n = e.toString) &&
                !i((r = n.call(e)))
            )
                return r;
            if ('function' == typeof (n = e.valueOf) && !i((r = n.call(e))))
                return r;
            if (
                !t &&
                'function' == typeof (n = e.toString) &&
                !i((r = n.call(e)))
            )
                return r;
            throw TypeError("Can't convert object to primitive value");
        };
    },
    56: function(e, t) {
        e.exports = function(e, t) {
            return {
                enumerable: !(1 & e),
                configurable: !(2 & e),
                writable: !(4 & e),
                value: t,
            };
        };
    },
    57: function(e, t) {
        var n = {}.hasOwnProperty;
        e.exports = function(e, t) {
            return n.call(e, t);
        };
    },
    58: function(e, t, n) {
        var r = n(25);
        e.exports = function(e) {
            return Object(r(e));
        };
    },
    59: function(e, t, n) {
        var r = n(60);
        e.exports = function(e, t) {
            return new (r(e))(t);
        };
    },
    6: function(e, t, n) {
        'use strict';
        n.d(t, 'a', function() {
            return r;
        }),
            (t.b = i);
        var l = n(11),
            g = n(3);
        function p() {
            return (p =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        function b(e) {
            return (b =
                'function' == typeof Symbol &&
                'symbol' == typeof Symbol.iterator
                    ? function(e) {
                          return typeof e;
                      }
                    : function(e) {
                          return e &&
                              'function' == typeof Symbol &&
                              e.constructor === Symbol &&
                              e !== Symbol.prototype
                              ? 'symbol'
                              : typeof e;
                      })(e);
        }
        var y = n(0),
            v = 4,
            r = i();
        function i() {
            var s =
                    0 < arguments.length && void 0 !== arguments[0]
                        ? arguments[0]
                        : 3e3,
                e =
                    1 < arguments.length && void 0 !== arguments[1]
                        ? arguments[1]
                        : {},
                d = e.request,
                f = e.done;
            return function(e, t, n) {
                var r =
                    3 < arguments.length && void 0 !== arguments[3]
                        ? arguments[3]
                        : {};
                try {
                    var i,
                        o = r.method || (n ? 'POST' : 'GET'),
                        a = document.createElement('a');
                    a.href = e;
                    var c =
                        'object' === b(t) && null !== t
                            ? t
                            : {
                                  success: function() {
                                      y.logMessage('xhr success');
                                  },
                                  error: function(e) {
                                      y.logError('xhr error', null, e);
                                  },
                              };
                    if (
                        ('function' == typeof t && (c.success = t),
                        ((i = new window.XMLHttpRequest()).onreadystatechange = function() {
                            if (i.readyState === v) {
                                'function' == typeof f && f(a.origin);
                                var e = i.status;
                                (200 <= e && e < 300) || 304 === e
                                    ? c.success(i.responseText, i)
                                    : c.error(i.statusText, i);
                            }
                        }),
                        g.config.getConfig('disableAjaxTimeout') ||
                            (i.ontimeout = function() {
                                y.logError(
                                    '  xhr timeout after ',
                                    i.timeout,
                                    'ms'
                                );
                            }),
                        'GET' === o && n)
                    ) {
                        var u = Object(l.c)(e, r);
                        p(u.search, n), (e = Object(l.a)(u));
                    }
                    i.open(o, e, !0),
                        g.config.getConfig('disableAjaxTimeout') ||
                            (i.timeout = s),
                        r.withCredentials && (i.withCredentials = !0),
                        y._each(r.customHeaders, function(e, t) {
                            i.setRequestHeader(t, e);
                        }),
                        r.preflight &&
                            i.setRequestHeader(
                                'X-Requested-With',
                                'XMLHttpRequest'
                            ),
                        i.setRequestHeader(
                            'Content-Type',
                            r.contentType || 'text/plain'
                        ),
                        'function' == typeof d && d(a.origin),
                        'POST' === o && n ? i.send(n) : i.send();
                } catch (e) {
                    y.logError('xhr construction', e);
                }
            };
        }
    },
    60: function(e, t, n) {
        var r = n(16),
            i = n(38),
            o = n(26)('species');
        e.exports = function(e) {
            var t;
            return (
                i(e) &&
                    ('function' != typeof (t = e.constructor) ||
                        (t !== Array && !i(t.prototype)) ||
                        (t = void 0),
                    r(t) && null === (t = t[o]) && (t = void 0)),
                void 0 === t ? Array : t
            );
        };
    },
    61: function(e, t, n) {
        var r = n(13),
            i = n(20),
            o = '__core-js_shared__',
            a = i[o] || (i[o] = {});
        (e.exports = function(e, t) {
            return a[e] || (a[e] = void 0 !== t ? t : {});
        })('versions', []).push({
            version: r.version,
            mode: n(62) ? 'pure' : 'global',
            copyright: '© 2019 Denis Pushkarev (zloirock.ru)',
        });
    },
    62: function(e, t) {
        e.exports = !0;
    },
    63: function(e, t) {
        var n = 0,
            r = Math.random();
        e.exports = function(e) {
            return 'Symbol('.concat(
                void 0 === e ? '' : e,
                ')_',
                (++n + r).toString(36)
            );
        };
    },
    64: function(e, t, n) {
        'use strict';
        var r = n(15),
            i = n(65)(!0);
        r(r.P, 'Array', {
            includes: function(e) {
                return i(this, e, 1 < arguments.length ? arguments[1] : void 0);
            },
        }),
            n(27)('includes');
    },
    65: function(e, t, n) {
        var u = n(66),
            s = n(36),
            d = n(67);
        e.exports = function(c) {
            return function(e, t, n) {
                var r,
                    i = u(e),
                    o = s(i.length),
                    a = d(n, o);
                if (c && t != t) {
                    for (; a < o; ) if ((r = i[a++]) != r) return !0;
                } else
                    for (; a < o; a++)
                        if ((c || a in i) && i[a] === t) return c || a || 0;
                return !c && -1;
            };
        };
    },
    66: function(e, t, n) {
        var r = n(35),
            i = n(25);
        e.exports = function(e) {
            return r(i(e));
        };
    },
    67: function(e, t, n) {
        var r = n(37),
            i = Math.max,
            o = Math.min;
        e.exports = function(e, t) {
            return (e = r(e)) < 0 ? i(e + t, 0) : o(e, t);
        };
    },
    68: function(e, t) {
        (A.SYNC = 1), (A.ASYNC = 2), (A.QUEUE = 4);
        var n = 'function' == typeof Proxy,
            r = Object.freeze({ useProxy: n, ready: 0 }),
            i = Object.getPrototypeOf({}),
            o = {},
            E =
                function(e, t) {
                    return t;
                }.bind(null, 1, o)() === o
                    ? Function.prototype.bind
                    : function(e) {
                          var t = this,
                              n = T(arguments, 1);
                          return function() {
                              return t.apply(e, n.concat(T(arguments)));
                          };
                      };
        function S(e) {
            return T(arguments, 1).reduce(function(t, n) {
                return (
                    n &&
                        Object.keys(n).forEach(function(e) {
                            t[e] = n[e];
                        }),
                    t
                );
            }, e);
        }
        function T(e, t) {
            return Array.prototype.slice.call(e, t);
        }
        function a(e) {
            for (var t; (t = e.shift()); ) t();
        }
        function A(b) {
            var y,
                v = {},
                m = [],
                h = [];
            function e(e, t) {
                return 'function' == typeof e
                    ? c.call(null, 'sync', e, t)
                    : 'string' == typeof e && 'function' == typeof t
                      ? c.apply(null, arguments)
                      : 'object' == typeof e
                        ? function(o, e, t) {
                              var n = !0;
                              void 0 === e &&
                                  ((e = Object.getOwnPropertyNames(o)),
                                  (n = !1));
                              var a = {},
                                  r = ['constructor'];
                              for (
                                  ;
                                  (e = e.filter(function(e) {
                                      return (
                                          'function' == typeof o[e] &&
                                          !r.includes(e) &&
                                          !e.match(/^_/)
                                      );
                                  })).forEach(function(e) {
                                      var t = e.split(':'),
                                          n = t[0],
                                          r = t[1] || 'sync';
                                      if (!a[n]) {
                                          var i = o[n];
                                          a[n] = o[n] = c(r, i);
                                      }
                                  }),
                                      (o = Object.getPrototypeOf(o)),
                                      n && o !== i;

                              );
                              t && (v[t] = a);
                              return a;
                          }.apply(null, arguments)
                        : void 0;
            }
            function c(i, e, t) {
                if (e.__funHook) {
                    if (e.__funHook === i) return t && (v[t] = e), e;
                    throw 'attempting to wrap func with different hook types';
                }
                var o,
                    a,
                    c = [];
                c.type = 'before';
                var u = [];
                u.type = 'after';
                var n = E.call(p, c),
                    r = E.call(p, u),
                    s = {
                        __funHook: i,
                        before: n,
                        after: r,
                        getHooks: g,
                        removeAll: function() {
                            return g().remove();
                        },
                        fn: e,
                    },
                    d = {
                        get: function(e, t) {
                            return (
                                s[t] || Reflect.get.apply(Reflect, arguments)
                            );
                        },
                    };
                return (
                    y || h.push(l),
                    b.useProxy
                        ? (a = new Proxy(e, d))
                        : S(
                              (a = function() {
                                  return d.apply
                                      ? d.apply(e, this, T(arguments))
                                      : e.apply(this, arguments);
                              }),
                              s
                          ),
                    t && (v[t] = a),
                    l(),
                    a
                );
                function f() {
                    function e(e, t, n) {
                        for (var r = e.length; 0 < r--; )
                            0 !== r || ('async' === i && 'a' === t)
                                ? ((n =
                                      'i.call(' +
                                      t +
                                      '[' +
                                      r +
                                      '].hook, h,' +
                                      n +
                                      ')'),
                                  ('async' === i && 'a' === t && 0 === r) ||
                                      (n = 'n(' + n + ',e)'))
                                : (n =
                                      t +
                                      '[' +
                                      r +
                                      '].hook.apply(h,[' +
                                      n +
                                      ('b' === t ? '].concat(g))' : ',r])'));
                        return n;
                    }
                    if (c.length || u.length) {
                        var t;
                        if ('sync' === i) {
                            var n,
                                r =
                                    'r=t.apply(h,' +
                                    (c.length ? 'arguments' : 'g') +
                                    ')';
                            u.length &&
                                (n = e(
                                    u,
                                    'a',
                                    'n(function extract(s){r=s},e)'
                                )),
                                c.length &&
                                    ((r = e(
                                        c,
                                        'b',
                                        'n(function extract(){' +
                                            r +
                                            ';' +
                                            n +
                                            '},e)'
                                    )),
                                    (n = '')),
                                (t = [
                                    'var r,e={bail:function(a){r=a}}',
                                    r,
                                    n,
                                    'return r',
                                ].join(';'));
                        } else
                            'async' === i &&
                                ((t =
                                    't.apply(h,' +
                                    (c.length
                                        ? 'Array.prototype.slice.call(arguments)'
                                        : 'g') +
                                    '.concat(' +
                                    e(u, 'a', 'z?n(z,e):[]') +
                                    '))'),
                                c.length &&
                                    (t = 'n(function partial(){' + t + '},e)'),
                                (t = [
                                    'var z',
                                    'typeof g[g.length-1]==="function"&&(z=i.call(g.pop(),null))',
                                    'var e={bail:z}',
                                    e(c, 'b', t),
                                ].join(';')));
                        o = E.call(
                            new Function('i,b,a,n,t,h,g', t),
                            null,
                            E,
                            c,
                            u,
                            Object.assign || S
                        );
                    } else o = void 0;
                    l();
                }
                function l() {
                    !y &&
                    ('sync' !== i || b.ready & A.SYNC) &&
                    ('async' !== i || b.ready & A.ASYNC)
                        ? 'sync' !== i && b.ready & A.QUEUE
                          ? (d.apply = function() {
                                var e = arguments;
                                m.push(function() {
                                    a.apply(e[1], e[2]);
                                });
                            })
                          : (d.apply = function() {
                                throw 'hooked function not ready';
                            })
                        : (d.apply = o);
                }
                function g(n) {
                    var e = c.concat(u);
                    return (
                        'object' == typeof n &&
                            (e = e.filter(function(t) {
                                return Object.keys(n).every(function(e) {
                                    return t[e] === n[e];
                                });
                            })),
                        S(e, {
                            remove: function() {
                                return (
                                    e.forEach(function(e) {
                                        e.remove();
                                    }),
                                    a
                                );
                            },
                        })
                    );
                }
                function p(e, t) {
                    var n = this,
                        r = {
                            hook: e,
                            type: this.type,
                            priority: t || 10,
                            remove: function() {
                                var e = n.indexOf(r);
                                -1 !== e && (n.splice(e, 1), f());
                            },
                        };
                    return (
                        this.push(r),
                        this.sort(function(e, t) {
                            return t.priority - e.priority;
                        }),
                        f(),
                        a
                    );
                }
            }
            return (
                (b = S({}, r, b)).ready
                    ? (e.ready = function() {
                          (y = !0), a(h), a(m);
                      })
                    : (y = !0),
                (e.hooks = v),
                e
            );
        }
        e.exports = A;
    },
    69: function(e, t) {
        e.exports = function e(t) {
            var n = Array.isArray(t) ? [] : {};
            for (var r in t) {
                var i = t[r];
                n[r] = i && 'object' == typeof i ? e(i) : i;
            }
            return n;
        };
    },
    7: function(e, t, n) {
        n(64), (e.exports = n(13).Array.includes);
    },
    8: function(e, t, n) {
        'use strict';
        Object.defineProperty(t, '__esModule', { value: !0 }),
            n.d(t, 'gdprDataHandler', function() {
                return U;
            }),
            (t.setS2STestingModule = function(e) {
                I = e;
            });
        var h = n(0),
            g = n(39),
            p = n(18),
            d = n(1),
            v = n(6),
            E = n(3),
            r = n(7),
            S = n.n(r),
            i = n(10),
            T = n.n(i),
            b = n(40),
            A = n(41);
        function m(e, t) {
            return (
                (function(e) {
                    if (Array.isArray(e)) return e;
                })(e) ||
                (function(e, t) {
                    var n = [],
                        r = !0,
                        i = !1,
                        o = void 0;
                    try {
                        for (
                            var a, c = e[Symbol.iterator]();
                            !(r = (a = c.next()).done) &&
                            (n.push(a.value), !t || n.length !== t);
                            r = !0
                        );
                    } catch (e) {
                        (i = !0), (o = e);
                    } finally {
                        try {
                            r || null == c.return || c.return();
                        } finally {
                            if (i) throw o;
                        }
                    }
                    return n;
                })(e, t) ||
                (function() {
                    throw new TypeError(
                        'Invalid attempt to destructure non-iterable instance'
                    );
                })()
            );
        }
        function y() {
            return (y =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        var I,
            O = n(0),
            w = n(4),
            C = n(9),
            f = {},
            j = (f.bidderRegistry = {}),
            l = (f.aliasRegistry = {}),
            _ = {};
        E.config.getConfig('s2sConfig', function(e) {
            _ = e.s2sConfig;
        });
        var o = {};
        function B(e) {
            var i = e.bidderCode,
                s = e.auctionId,
                d = e.bidderRequestId,
                t = e.adUnits,
                f = e.labels,
                l = e.src;
            return t
                .reduce(function(e, c) {
                    var t = Object(g.b)(
                            Object(g.a)(c, f),
                            c.mediaTypes,
                            c.sizes
                        ),
                        n = t.active,
                        u = t.mediaTypes,
                        r = t.filterResults;
                    return (
                        n
                            ? r &&
                              O.logInfo(
                                  'Size mapping filtered adUnit "'.concat(
                                      c.code,
                                      '" banner sizes from '
                                  ),
                                  r.before,
                                  'to ',
                                  r.after
                              )
                            : O.logInfo(
                                  'Size mapping disabled adUnit "'.concat(
                                      c.code,
                                      '"'
                                  )
                              ),
                        n &&
                            e.push(
                                c.bids
                                    .filter(function(e) {
                                        return e.bidder === i;
                                    })
                                    .reduce(function(e, t) {
                                        var n =
                                            c.nativeParams ||
                                            O.deepAccess(
                                                c,
                                                'mediaTypes.native'
                                            );
                                        n &&
                                            (t = y({}, t, {
                                                nativeParams: Object(p.f)(n),
                                            })),
                                            (t = y(
                                                {},
                                                t,
                                                Object(h.getDefinedParams)(c, [
                                                    'mediaType',
                                                    'renderer',
                                                ])
                                            ));
                                        var r = Object(g.b)(
                                                Object(g.a)(t, f),
                                                u
                                            ),
                                            i = r.active,
                                            o = r.mediaTypes,
                                            a = r.filterResults;
                                        return (
                                            i
                                                ? a &&
                                                  O.logInfo(
                                                      'Size mapping filtered adUnit "'
                                                          .concat(
                                                              c.code,
                                                              '" bidder "'
                                                          )
                                                          .concat(
                                                              t.bidder,
                                                              '" banner sizes from '
                                                          ),
                                                      a.before,
                                                      'to ',
                                                      a.after
                                                  )
                                                : O.logInfo(
                                                      'Size mapping deactivated adUnit "'
                                                          .concat(
                                                              c.code,
                                                              '" bidder "'
                                                          )
                                                          .concat(t.bidder, '"')
                                                  ),
                                            O.isValidMediaTypes(o)
                                                ? (t = y({}, t, {
                                                      mediaTypes: o,
                                                  }))
                                                : O.logError(
                                                      'mediaTypes is not correctly configured for adunit '.concat(
                                                          c.code
                                                      )
                                                  ),
                                            i &&
                                                e.push(
                                                    y({}, t, {
                                                        adUnitCode: c.code,
                                                        transactionId:
                                                            c.transactionId,
                                                        sizes:
                                                            O.deepAccess(
                                                                o,
                                                                'banner.sizes'
                                                            ) ||
                                                            O.deepAccess(
                                                                o,
                                                                'video.playerSize'
                                                            ) ||
                                                            [],
                                                        bidId:
                                                            t.bid_id ||
                                                            O.getUniqueIdentifierStr(),
                                                        bidderRequestId: d,
                                                        auctionId: s,
                                                        src: l,
                                                        bidRequestsCount: b.a.getCounter(
                                                            c.code
                                                        ),
                                                    })
                                                ),
                                            e
                                        );
                                    }, [])
                            ),
                        e
                    );
                }, [])
                .reduce(h.flatten, [])
                .filter(function(e) {
                    return '' !== e;
                });
        }
        var U = {
            consentData: null,
            setConsentData: function(e) {
                U.consentData = e;
            },
            getConsentData: function() {
                return U.consentData;
            },
        };
        function R() {
            return _ && _.enabled && _.testing && I;
        }
        function a(t, n, e) {
            try {
                var r = j[t].getSpec();
                r &&
                    r[n] &&
                    'function' == typeof r[n] &&
                    (O.logInfo('Invoking '.concat(t, '.').concat(n)), r[n](e));
            } catch (e) {
                O.logWarn('Error calling '.concat(n, ' of ').concat(t));
            }
        }
        (f.makeBidRequests = function(e, i, o, a, c) {
            var u = [],
                t = Object(h.getBidderCodes)(e);
            E.config.getConfig('bidderSequence') === E.RANDOM &&
                (t = Object(h.shuffle)(t));
            var n,
                r,
                s,
                d = Object(A.b)(),
                f = t,
                l = [];
            if (_.enabled) {
                R() && (l = I.getSourceBidderMap(e)[I.CLIENT]);
                var g = _.bidders;
                f = t.filter(function(e) {
                    return !S()(g, e) || S()(l, e);
                });
                var p = ((n = e),
                    (r = _.bidders),
                    (s = O.deepClone(n)).forEach(function(e) {
                        e.bids = e.bids
                            .filter(function(e) {
                                return (
                                    S()(r, e.bidder) &&
                                    (!R() || e.finalSource !== I.CLIENT)
                                );
                            })
                            .map(function(e) {
                                return (
                                    (e.bid_id = O.getUniqueIdentifierStr()), e
                                );
                            });
                    }),
                    (s = s.filter(function(e) {
                        return 0 !== e.bids.length;
                    }))),
                    b = O.generateUUID();
                g.forEach(function(e) {
                    var t = O.getUniqueIdentifierStr(),
                        n = {
                            bidderCode: e,
                            auctionId: o,
                            bidderRequestId: t,
                            tid: b,
                            bids: B({
                                bidderCode: e,
                                auctionId: o,
                                bidderRequestId: t,
                                adUnits: O.deepClone(p),
                                labels: c,
                                src: w.S2S.SRC,
                            }),
                            auctionStart: i,
                            timeout: _.timeout,
                            src: w.S2S.SRC,
                            refererInfo: d,
                        };
                    0 !== n.bids.length && u.push(n);
                }),
                    p.forEach(function(e) {
                        var t = e.bids.filter(function(t) {
                            return T()(u, function(e) {
                                return T()(e.bids, function(e) {
                                    return e.bidId === t.bid_id;
                                });
                            });
                        });
                        e.bids = t;
                    }),
                    u.forEach(function(e) {
                        e.adUnitsS2SCopy = p.filter(function(e) {
                            return 0 < e.bids.length;
                        });
                    });
            }
            var y,
                v,
                m = ((y = e),
                (v = O.deepClone(y)).forEach(function(e) {
                    e.bids = e.bids.filter(function(e) {
                        return !R() || e.finalSource !== I.SERVER;
                    });
                }),
                (v = v.filter(function(e) {
                    return 0 !== e.bids.length;
                })));
            return (
                f.forEach(function(e) {
                    var t = O.getUniqueIdentifierStr(),
                        n = {
                            bidderCode: e,
                            auctionId: o,
                            bidderRequestId: t,
                            bids: B({
                                bidderCode: e,
                                auctionId: o,
                                bidderRequestId: t,
                                adUnits: O.deepClone(m),
                                labels: c,
                                src: 'client',
                            }),
                            auctionStart: i,
                            timeout: a,
                            refererInfo: d,
                        },
                        r = j[e];
                    r ||
                        O.logError(
                            'Trying to make a request for bidder that does not exist: '.concat(
                                e
                            )
                        ),
                        r && n.bids && 0 !== n.bids.length && u.push(n);
                }),
                U.getConsentData() &&
                    u.forEach(function(e) {
                        e.gdprConsent = U.getConsentData();
                    }),
                u
            );
        }),
            (f.callBids = function(e, t, r, i, o, a) {
                if (t.length) {
                    var n = m(
                            t.reduce(
                                function(e, t) {
                                    return (
                                        e[
                                            Number(
                                                void 0 !== t.src &&
                                                    t.src === w.S2S.SRC
                                            )
                                        ].push(t),
                                        e
                                    );
                                },
                                [[], []]
                            ),
                            2
                        ),
                        c = n[0],
                        u = n[1];
                    if (u.length) {
                        var s = Object(v.b)(
                                a,
                                o
                                    ? {
                                          request: o.request.bind(null, 's2s'),
                                          done: o.done,
                                      }
                                    : void 0
                            ),
                            d = _.bidders,
                            f = j[_.adapter],
                            l = u[0].tid,
                            g = u[0].adUnitsS2SCopy;
                        if (f) {
                            var p = { tid: l, ad_units: g };
                            if (p.ad_units.length) {
                                var b = u.map(function(e) {
                                        return (
                                            (e.start = Object(h.timestamp)()),
                                            i.bind(e)
                                        );
                                    }),
                                    y = p.ad_units.reduce(function(e, t) {
                                        return e.concat(
                                            (t.bids || []).reduce(function(
                                                e,
                                                t
                                            ) {
                                                return e.concat(t.bidder);
                                            },
                                            [])
                                        );
                                    }, []);
                                O.logMessage(
                                    'CALLING S2S HEADER BIDDERS ==== '.concat(
                                        d
                                            .filter(function(e) {
                                                return S()(y, e);
                                            })
                                            .join(',')
                                    )
                                ),
                                    u.forEach(function(e) {
                                        C.emit(w.EVENTS.BID_REQUESTED, e);
                                    }),
                                    f.callBids(
                                        p,
                                        u,
                                        function(e, t) {
                                            var n = Object(h.getBidderRequest)(
                                                u,
                                                t.bidderCode,
                                                e
                                            );
                                            n && r.call(n, e, t);
                                        },
                                        function() {
                                            return b.forEach(function(e) {
                                                return e();
                                            });
                                        },
                                        s
                                    );
                            }
                        }
                    }
                    c.forEach(function(e) {
                        e.start = Object(h.timestamp)();
                        var t = j[e.bidderCode];
                        O.logMessage(
                            'CALLING BIDDER ======= '.concat(e.bidderCode)
                        ),
                            C.emit(w.EVENTS.BID_REQUESTED, e);
                        var n = Object(v.b)(
                            a,
                            o
                                ? {
                                      request: o.request.bind(
                                          null,
                                          e.bidderCode
                                      ),
                                      done: o.done,
                                  }
                                : void 0
                        );
                        t.callBids(e, r.bind(e), i.bind(e), n);
                    });
                } else
                    O.logWarn(
                        'callBids executed with no bidRequests.  Were they filtered by labels or sizing?'
                    );
            }),
            (f.videoAdapters = []),
            (f.registerBidAdapter = function(e, t) {
                var n = (2 < arguments.length && void 0 !== arguments[2]
                        ? arguments[2]
                        : {}
                    ).supportedMediaTypes,
                    r = void 0 === n ? [] : n;
                e && t
                    ? 'function' == typeof e.callBids
                      ? ((j[t] = e),
                        S()(r, 'video') && f.videoAdapters.push(t),
                        S()(r, 'native') && p.d.push(t))
                      : O.logError(
                            'Bidder adaptor error for bidder code: ' +
                                t +
                                'bidder must implement a callBids() function'
                        )
                    : O.logError('bidAdaptor or bidderCode not specified');
            }),
            (f.aliasBidAdapter = function(t, e) {
                var n, r;
                if (void 0 === j[e]) {
                    var i = j[t];
                    if (void 0 === i) {
                        var o = E.config.getConfig('s2sConfig'),
                            a = o && o.bidders;
                        a && S()(a, e)
                            ? (l[e] = t)
                            : O.logError(
                                  'bidderCode "' +
                                      t +
                                      '" is not an existing bidder.',
                                  'adapterManager.aliasBidAdapter'
                              );
                    } else
                        try {
                            var c,
                                u = ((n = t),
                                (r = []),
                                S()(f.videoAdapters, n) && r.push('video'),
                                S()(p.d, n) && r.push('native'),
                                r);
                            if (i.constructor.prototype != Object.prototype)
                                (c = new i.constructor()).setBidderCode(e);
                            else {
                                var s = i.getSpec();
                                (c = Object(d.newBidder)(
                                    y({}, s, { code: e })
                                )),
                                    (l[e] = t);
                            }
                            f.registerBidAdapter(c, e, {
                                supportedMediaTypes: u,
                            });
                        } catch (e) {
                            O.logError(
                                t +
                                    ' bidder does not currently support aliasing.',
                                'adapterManager.aliasBidAdapter'
                            );
                        }
                } else
                    O.logMessage(
                        'alias name "' + e + '" has been already specified.'
                    );
            }),
            (f.registerAnalyticsAdapter = function(e) {
                var t = e.adapter,
                    n = e.code;
                t && n
                    ? 'function' == typeof t.enableAnalytics
                      ? ((t.code = n), (o[n] = t))
                      : O.logError(
                            'Prebid Error: Analytics adaptor error for analytics "'.concat(
                                n,
                                '"\n        analytics adapter must implement an enableAnalytics() function'
                            )
                        )
                    : O.logError(
                          'Prebid Error: analyticsAdapter or analyticsCode not specified'
                      );
            }),
            (f.enableAnalytics = function(e) {
                O.isArray(e) || (e = [e]),
                    O._each(e, function(e) {
                        var t = o[e.provider];
                        t
                            ? t.enableAnalytics(e)
                            : O.logError(
                                  'Prebid Error: no analytics adapter found in registry for\n        '.concat(
                                      e.provider,
                                      '.'
                                  )
                              );
                    });
            }),
            (f.getBidAdapter = function(e) {
                return j[e];
            }),
            (f.callTimedOutBidders = function(t, n, r) {
                (n = n.map(function(e) {
                    return (
                        (e.params = O.getUserConfiguredParams(
                            t,
                            e.adUnitCode,
                            e.bidder
                        )),
                        (e.timeout = r),
                        e
                    );
                })),
                    (n = O.groupBy(n, 'bidder')),
                    Object.keys(n).forEach(function(e) {
                        a(e, 'onTimeout', n[e]);
                    });
            }),
            (f.callBidWonBidder = function(e, t, n) {
                (t.params = O.getUserConfiguredParams(
                    n,
                    t.adUnitCode,
                    t.bidder
                )),
                    a(e, 'onBidWon', t);
            }),
            (f.callSetTargetingBidder = function(e, t) {
                a(e, 'onSetTargeting', t);
            }),
            (t.default = f);
    },
    9: function(e, t, n) {
        function r() {
            return (r =
                Object.assign ||
                function(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n)
                            Object.prototype.hasOwnProperty.call(n, r) &&
                                (e[r] = n[r]);
                    }
                    return e;
                }).apply(this, arguments);
        }
        var c,
            i,
            u = n(0),
            o = n(4),
            a = Array.prototype.slice,
            s = Array.prototype.push,
            d = u._map(o.EVENTS, function(e) {
                return e;
            }),
            f = o.EVENT_ID_PATHS,
            l = [];
        e.exports = ((c = {}),
        ((i = {}).on = function(e, t, n) {
            if (((i = e), u.contains(d, i))) {
                var r = c[e] || { que: [] };
                n
                    ? ((r[n] = r[n] || { que: [] }), r[n].que.push(t))
                    : r.que.push(t),
                    (c[e] = r);
            } else
                u.logError(
                    'Wrong event name : ' + e + ' Valid event names :' + d
                );
            var i;
        }),
        (i.emit = function(e) {
            !(function(e, t) {
                u.logMessage('Emitting event for: ' + e);
                var n = t[0] || {},
                    r = n[f[e]],
                    i = c[e] || { que: [] },
                    o = u._map(i, function(e, t) {
                        return t;
                    }),
                    a = [];
                l.push({ eventType: e, args: n, id: r }),
                    r && u.contains(o, r) && s.apply(a, i[r].que),
                    s.apply(a, i.que),
                    u._each(a, function(e) {
                        if (e)
                            try {
                                e.apply(null, t);
                            } catch (e) {
                                u.logError(
                                    'Error executing handler:',
                                    'events.js',
                                    e
                                );
                            }
                    });
            })(e, a.call(arguments, 1));
        }),
        (i.off = function(e, n, r) {
            var i = c[e];
            u.isEmpty(i) ||
                (u.isEmpty(i.que) && u.isEmpty(i[r])) ||
                (r && (u.isEmpty(i[r]) || u.isEmpty(i[r].que))) ||
                (r
                    ? u._each(i[r].que, function(e) {
                          var t = i[r].que;
                          e === n && t.splice(u.indexOf.call(t, e), 1);
                      })
                    : u._each(i.que, function(e) {
                          var t = i.que;
                          e === n && t.splice(u.indexOf.call(t, e), 1);
                      }),
                (c[e] = i));
        }),
        (i.get = function() {
            return c;
        }),
        (i.getEvents = function() {
            var n = [];
            return (
                u._each(l, function(e) {
                    var t = r({}, e);
                    n.push(t);
                }),
                n
            );
        }),
        i);
    },
});
pbjsChunk(
    [159],
    {
        163: function(e, t, r) {
            e.exports = r(164);
        },
        164: function(e, t, r) {
            'use strict';
            Object.defineProperty(t, '__esModule', { value: !0 }),
                r.d(t, 'spec', function() {
                    return n;
                });
            var d = r(0),
                h = r(3),
                i = r(1),
                n = {
                    code: 'coinzilla',
                    aliases: ['czlla'],
                    isBidRequestValid: function(e) {
                        return !!e.params.placementId;
                    },
                    buildRequests: function(e, n) {
                        return 0 === e.length
                            ? []
                            : e.map(function(e) {
                                  var t = d.parseSizesInput(e.sizes)[0],
                                      r = t.split('x')[0],
                                      i = t.split('x')[1];
                                  return {
                                      method: 'POST',
                                      url:
                                          'https://request.czilladx.com/serve/request.php',
                                      data: {
                                          placementId: e.params.placementId,
                                          width: r,
                                          height: i,
                                          bidId: e.bidId,
                                          referer: n.refererInfo.referer,
                                      },
                                  };
                              });
                    },
                    interpretResponse: function(e, t) {
                        var r = [],
                            i = e.body,
                            n = i.creativeId || 0,
                            d = i.width || 0,
                            u = i.height || 0,
                            a = i.cpm || 0;
                        if (0 !== d && 0 !== u && 0 !== a && 0 !== n) {
                            var s = i.dealid || '',
                                c = i.currency || 'EUR',
                                p = void 0 === i.netRevenue || i.netRevenue,
                                l = t.data.referer,
                                o = {
                                    requestId: i.requestId,
                                    cpm: a,
                                    width: i.width,
                                    height: i.height,
                                    creativeId: n,
                                    dealId: s,
                                    currency: c,
                                    netRevenue: p,
                                    ttl: h.config.getConfig('_bidderTimeout'),
                                    referrer: l,
                                    ad: i.ad,
                                };
                            r.push(o);
                        }
                        return r;
                    },
                };
            Object(i.registerBidder)(n);
        },
    },
    [163]
);
pbjsChunk(
    [152],
    {
        189: function(e, r, n) {
            e.exports = n(190);
        },
        190: function(e, r, n) {
            'use strict';
            Object.defineProperty(r, '__esModule', { value: !0 }),
                n.d(r, 'currencySupportEnabled', function() {
                    return m;
                }),
                n.d(r, 'currencyRates', function() {
                    return R;
                }),
                (r.setConfig = c),
                (r.addBidResponseHook = w);
            var f = n(14),
                d = n(4),
                a = (n.n(d), n(6)),
                l = n(0),
                o = n(3),
                s = n(17);
            function u(e) {
                return (u =
                    'function' == typeof Symbol &&
                    'symbol' == typeof Symbol.iterator
                        ? function(e) {
                              return typeof e;
                          }
                        : function(e) {
                              return e &&
                                  'function' == typeof Symbol &&
                                  e.constructor === Symbol &&
                                  e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          })(e);
            }
            var y,
                g =
                    'https://cdn.jsdelivr.net/gh/prebid/currency-file@1/latest.json?date=$$TODAY$$',
                v = 4,
                p = [],
                b = {},
                h = !1,
                C = !0,
                S = 'USD',
                m = !1,
                R = {},
                D = {};
            function c(e) {
                var r = g;
                if (
                    ('object' === u(e.rates) &&
                        ((R.conversions = e.rates), (C = !(h = !0))),
                    'object' === u(e.defaultRates) &&
                        ((y = e.defaultRates), (R.conversions = y), (h = !0)),
                    'string' == typeof e.adServerCurrency)
                ) {
                    l.logInfo('enabling currency support', arguments),
                        (S = e.adServerCurrency),
                        e.conversionRateFile &&
                            (l.logInfo(
                                'currency using override conversionRateFile:',
                                e.conversionRateFile
                            ),
                            (r = e.conversionRateFile));
                    var n = r.indexOf('$$TODAY$$');
                    if (-1 !== n) {
                        var o = new Date(),
                            c = ''.concat(o.getMonth() + 1),
                            t = ''.concat(o.getDate());
                        c.length < 2 && (c = '0'.concat(c)),
                            t.length < 2 && (t = '0'.concat(t));
                        var i = ''
                            .concat(o.getFullYear())
                            .concat(c)
                            .concat(t);
                        r = ''
                            .concat(r.substring(0, n))
                            .concat(i)
                            .concat(r.substring(n + 9, r.length));
                    }
                    !(function(e) {
                        (b = {}),
                            (m = !0),
                            l.logInfo(
                                'Installing addBidResponse decorator for currency module',
                                arguments
                            ),
                            s.b.addBidResponse.before(w, 100),
                            C &&
                                ((C = !1),
                                Object(a.a)(e, {
                                    success: function(r) {
                                        try {
                                            (R = JSON.parse(r)),
                                                l.logInfo(
                                                    'currencyRates set to ' +
                                                        JSON.stringify(R)
                                                ),
                                                (h = !0),
                                                O();
                                        } catch (e) {
                                            I(
                                                'Failed to parse currencyRates response: ' +
                                                    r
                                            );
                                        }
                                    },
                                    error: I,
                                }));
                    })(r);
                } else
                    l.logInfo('disabling currency support'),
                        (function() {
                            l.logInfo(
                                'Uninstalling addBidResponse decorator for currency module',
                                arguments
                            ),
                                s.b.addBidResponse
                                    .getHooks({ hook: w })
                                    .remove(),
                                (S = 'USD'),
                                (b = {}),
                                (h = m = !1),
                                (C = !0),
                                (R = {}),
                                (D = {});
                        })();
                'object' === u(e.bidderCurrencyDefault) &&
                    (D = e.bidderCurrencyDefault);
            }
            function I(e) {
                y
                    ? (l.logWarn(e),
                      l.logWarn(
                          'Currency failed loading rates, falling back to currency.defaultRates'
                      ))
                    : l.logError(e);
            }
            function w(e, r, n) {
                if (!n) return e.call(this, r);
                var o = n.bidderCode || n.bidder;
                if (D[o]) {
                    var c = D[o];
                    n.currency && c !== n.currency
                        ? l.logWarn(
                              "Currency default '"
                                  .concat(o, ': ')
                                  .concat(c, "' ignored. adapter specified '")
                                  .concat(n.currency, "'")
                          )
                        : (n.currency = c);
                }
                n.currency ||
                    (l.logWarn(
                        'Currency not specified on bid.  Defaulted to "USD"'
                    ),
                    (n.currency = 'USD'));
                var t,
                    i,
                    a,
                    s = n.currency,
                    u = n.cpm;
                if (
                    ((n.getCpmInNewCurrency = function(e) {
                        return (parseFloat(u) * j(s, e)).toFixed(3);
                    }),
                    n.currency === S)
                )
                    return e.call(this, r, n);
                p.push(
                    ((t = e),
                    (i = this),
                    (a = [r, n]),
                    function() {
                        var r = a[1];
                        if (void 0 !== r && 'currency' in r && 'cpm' in r) {
                            var e = r.currency;
                            try {
                                var n = j(e);
                                (r.originalCpm = r.cpm),
                                    (r.originalCurrency = r.currency),
                                    1 !== n &&
                                        ((r.cpm = (
                                            parseFloat(r.cpm) * n
                                        ).toFixed(4)),
                                        (r.currency = S));
                            } catch (e) {
                                l.logWarn(
                                    'Returning NO_BID, getCurrencyConversion threw error: ',
                                    e
                                ),
                                    (a[1] = Object(f.a)(d.STATUS.NO_BID, {
                                        bidder: r.bidderCode || r.bidder,
                                        bidId: r.requestId,
                                    }));
                            }
                        }
                        return t.apply(i, a);
                    })
                ),
                    (m && !h) || O();
            }
            function O() {
                for (; 0 < p.length; ) p.shift()();
            }
            function j(e) {
                var r,
                    n =
                        1 < arguments.length && void 0 !== arguments[1]
                            ? arguments[1]
                            : S,
                    o = null,
                    c = ''.concat(e, '->').concat(n);
                if (c in b)
                    (o = b[c]),
                        l.logMessage(
                            'Using conversionCache value ' + o + ' for ' + c
                        );
                else if (!1 === m) {
                    if ('USD' !== e)
                        throw new Error(
                            'Prebid currency support has not been enabled and fromCurrency is not USD'
                        );
                    o = 1;
                } else if (e === n) o = 1;
                else if (e in R.conversions) {
                    if (!(n in (r = R.conversions[e])))
                        throw new Error(
                            "Specified adServerCurrency in config '" +
                                n +
                                "' not found in the currency rates file"
                        );
                    (o = r[n]),
                        l.logInfo(
                            'getCurrencyConversion using direct ' +
                                e +
                                ' to ' +
                                n +
                                ' conversionRate ' +
                                o
                        );
                } else if (n in R.conversions) {
                    if (!(e in (r = R.conversions[n])))
                        throw new Error(
                            "Specified fromCurrency '" +
                                e +
                                "' not found in the currency rates file"
                        );
                    (o = F(1 / r[e], v)),
                        l.logInfo(
                            'getCurrencyConversion using reciprocal ' +
                                e +
                                ' to ' +
                                n +
                                ' conversionRate ' +
                                o
                        );
                } else {
                    var t = Object.keys(R.conversions)[0];
                    if (!(e in R.conversions[t]))
                        throw new Error(
                            "Specified fromCurrency '" +
                                e +
                                "' not found in the currency rates file"
                        );
                    var i = 1 / R.conversions[t][e];
                    if (!(n in R.conversions[t]))
                        throw new Error(
                            "Specified adServerCurrency in config '" +
                                n +
                                "' not found in the currency rates file"
                        );
                    (o = F(i * R.conversions[t][n], v)),
                        l.logInfo(
                            'getCurrencyConversion using intermediate ' +
                                e +
                                ' thru ' +
                                t +
                                ' to ' +
                                n +
                                ' conversionRate ' +
                                o
                        );
                }
                return (
                    c in b ||
                        (l.logMessage(
                            'Adding conversionCache value ' + o + ' for ' + c
                        ),
                        (b[c] = o)),
                    o
                );
            }
            function F(e, r) {
                for (var n = 1, o = 0; o < r; o++) n += '0';
                return Math.round(e * n) / n;
            }
            o.config.getConfig('currency', function(e) {
                return c(e.currency);
            });
        },
    },
    [189]
);
pbjs.processQueue();
