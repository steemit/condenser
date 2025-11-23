webpackJsonp([2],{

/***/ 2087:
/***/ (function(module, exports, __webpack_require__) {

/*!
 * html2canvas 1.0.0-rc.7 <https://html2canvas.hertzen.com>
 * Copyright (c) 2020 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
(function (global, factory) {
     true ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.html2canvas = factory());
}(this, function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var Bounds = /** @class */ (function () {
        function Bounds(x, y, w, h) {
            this.left = x;
            this.top = y;
            this.width = w;
            this.height = h;
        }
        Bounds.prototype.add = function (x, y, w, h) {
            return new Bounds(this.left + x, this.top + y, this.width + w, this.height + h);
        };
        Bounds.fromClientRect = function (clientRect) {
            return new Bounds(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
        };
        return Bounds;
    }());
    var parseBounds = function (node) {
        return Bounds.fromClientRect(node.getBoundingClientRect());
    };
    var parseDocumentSize = function (document) {
        var body = document.body;
        var documentElement = document.documentElement;
        if (!body || !documentElement) {
            throw new Error("Unable to get document size");
        }
        var width = Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth));
        var height = Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight));
        return new Bounds(0, 0, width, height);
    };

    /*
     * css-line-break 1.1.1 <https://github.com/niklasvh/css-line-break#readme>
     * Copyright (c) 2019 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
    var toCodePoints = function (str) {
        var codePoints = [];
        var i = 0;
        var length = str.length;
        while (i < length) {
            var value = str.charCodeAt(i++);
            if (value >= 0xd800 && value <= 0xdbff && i < length) {
                var extra = str.charCodeAt(i++);
                if ((extra & 0xfc00) === 0xdc00) {
                    codePoints.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
                }
                else {
                    codePoints.push(value);
                    i--;
                }
            }
            else {
                codePoints.push(value);
            }
        }
        return codePoints;
    };
    var fromCodePoint = function () {
        var codePoints = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            codePoints[_i] = arguments[_i];
        }
        if (String.fromCodePoint) {
            return String.fromCodePoint.apply(String, codePoints);
        }
        var length = codePoints.length;
        if (!length) {
            return '';
        }
        var codeUnits = [];
        var index = -1;
        var result = '';
        while (++index < length) {
            var codePoint = codePoints[index];
            if (codePoint <= 0xffff) {
                codeUnits.push(codePoint);
            }
            else {
                codePoint -= 0x10000;
                codeUnits.push((codePoint >> 10) + 0xd800, codePoint % 0x400 + 0xdc00);
            }
            if (index + 1 === length || codeUnits.length > 0x4000) {
                result += String.fromCharCode.apply(String, codeUnits);
                codeUnits.length = 0;
            }
        }
        return result;
    };
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // Use a lookup table to find the index.
    var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
    for (var i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }
    var decode = function (base64) {
        var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === '=') {
            bufferLength--;
            if (base64[base64.length - 2] === '=') {
                bufferLength--;
            }
        }
        var buffer = typeof ArrayBuffer !== 'undefined' &&
            typeof Uint8Array !== 'undefined' &&
            typeof Uint8Array.prototype.slice !== 'undefined'
            ? new ArrayBuffer(bufferLength)
            : new Array(bufferLength);
        var bytes = Array.isArray(buffer) ? buffer : new Uint8Array(buffer);
        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return buffer;
    };
    var polyUint16Array = function (buffer) {
        var length = buffer.length;
        var bytes = [];
        for (var i = 0; i < length; i += 2) {
            bytes.push((buffer[i + 1] << 8) | buffer[i]);
        }
        return bytes;
    };
    var polyUint32Array = function (buffer) {
        var length = buffer.length;
        var bytes = [];
        for (var i = 0; i < length; i += 4) {
            bytes.push((buffer[i + 3] << 24) | (buffer[i + 2] << 16) | (buffer[i + 1] << 8) | buffer[i]);
        }
        return bytes;
    };

    /** Shift size for getting the index-2 table offset. */
    var UTRIE2_SHIFT_2 = 5;
    /** Shift size for getting the index-1 table offset. */
    var UTRIE2_SHIFT_1 = 6 + 5;
    /**
     * Shift size for shifting left the index array values.
     * Increases possible data size with 16-bit index values at the cost
     * of compactability.
     * This requires data blocks to be aligned by UTRIE2_DATA_GRANULARITY.
     */
    var UTRIE2_INDEX_SHIFT = 2;
    /**
     * Difference between the two shift sizes,
     * for getting an index-1 offset from an index-2 offset. 6=11-5
     */
    var UTRIE2_SHIFT_1_2 = UTRIE2_SHIFT_1 - UTRIE2_SHIFT_2;
    /**
     * The part of the index-2 table for U+D800..U+DBFF stores values for
     * lead surrogate code _units_ not code _points_.
     * Values for lead surrogate code _points_ are indexed with this portion of the table.
     * Length=32=0x20=0x400>>UTRIE2_SHIFT_2. (There are 1024=0x400 lead surrogates.)
     */
    var UTRIE2_LSCP_INDEX_2_OFFSET = 0x10000 >> UTRIE2_SHIFT_2;
    /** Number of entries in a data block. 32=0x20 */
    var UTRIE2_DATA_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_2;
    /** Mask for getting the lower bits for the in-data-block offset. */
    var UTRIE2_DATA_MASK = UTRIE2_DATA_BLOCK_LENGTH - 1;
    var UTRIE2_LSCP_INDEX_2_LENGTH = 0x400 >> UTRIE2_SHIFT_2;
    /** Count the lengths of both BMP pieces. 2080=0x820 */
    var UTRIE2_INDEX_2_BMP_LENGTH = UTRIE2_LSCP_INDEX_2_OFFSET + UTRIE2_LSCP_INDEX_2_LENGTH;
    /**
     * The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.
     * Length 32=0x20 for lead bytes C0..DF, regardless of UTRIE2_SHIFT_2.
     */
    var UTRIE2_UTF8_2B_INDEX_2_OFFSET = UTRIE2_INDEX_2_BMP_LENGTH;
    var UTRIE2_UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6; /* U+0800 is the first code point after 2-byte UTF-8 */
    /**
     * The index-1 table, only used for supplementary code points, at offset 2112=0x840.
     * Variable length, for code points up to highStart, where the last single-value range starts.
     * Maximum length 512=0x200=0x100000>>UTRIE2_SHIFT_1.
     * (For 0x100000 supplementary code points U+10000..U+10ffff.)
     *
     * The part of the index-2 table for supplementary code points starts
     * after this index-1 table.
     *
     * Both the index-1 table and the following part of the index-2 table
     * are omitted completely if there is only BMP data.
     */
    var UTRIE2_INDEX_1_OFFSET = UTRIE2_UTF8_2B_INDEX_2_OFFSET + UTRIE2_UTF8_2B_INDEX_2_LENGTH;
    /**
     * Number of index-1 entries for the BMP. 32=0x20
     * This part of the index-1 table is omitted from the serialized form.
     */
    var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> UTRIE2_SHIFT_1;
    /** Number of entries in an index-2 block. 64=0x40 */
    var UTRIE2_INDEX_2_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_1_2;
    /** Mask for getting the lower bits for the in-index-2-block offset. */
    var UTRIE2_INDEX_2_MASK = UTRIE2_INDEX_2_BLOCK_LENGTH - 1;
    var slice16 = function (view, start, end) {
        if (view.slice) {
            return view.slice(start, end);
        }
        return new Uint16Array(Array.prototype.slice.call(view, start, end));
    };
    var slice32 = function (view, start, end) {
        if (view.slice) {
            return view.slice(start, end);
        }
        return new Uint32Array(Array.prototype.slice.call(view, start, end));
    };
    var createTrieFromBase64 = function (base64) {
        var buffer = decode(base64);
        var view32 = Array.isArray(buffer) ? polyUint32Array(buffer) : new Uint32Array(buffer);
        var view16 = Array.isArray(buffer) ? polyUint16Array(buffer) : new Uint16Array(buffer);
        var headerLength = 24;
        var index = slice16(view16, headerLength / 2, view32[4] / 2);
        var data = view32[5] === 2
            ? slice16(view16, (headerLength + view32[4]) / 2)
            : slice32(view32, Math.ceil((headerLength + view32[4]) / 4));
        return new Trie(view32[0], view32[1], view32[2], view32[3], index, data);
    };
    var Trie = /** @class */ (function () {
        function Trie(initialValue, errorValue, highStart, highValueIndex, index, data) {
            this.initialValue = initialValue;
            this.errorValue = errorValue;
            this.highStart = highStart;
            this.highValueIndex = highValueIndex;
            this.index = index;
            this.data = data;
        }
        /**
         * Get the value for a code point as stored in the Trie.
         *
         * @param codePoint the code point
         * @return the value
         */
        Trie.prototype.get = function (codePoint) {
            var ix;
            if (codePoint >= 0) {
                if (codePoint < 0x0d800 || (codePoint > 0x0dbff && codePoint <= 0x0ffff)) {
                    // Ordinary BMP code point, excluding leading surrogates.
                    // BMP uses a single level lookup.  BMP index starts at offset 0 in the Trie2 index.
                    // 16 bit data is stored in the index array itself.
                    ix = this.index[codePoint >> UTRIE2_SHIFT_2];
                    ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
                    return this.data[ix];
                }
                if (codePoint <= 0xffff) {
                    // Lead Surrogate Code Point.  A Separate index section is stored for
                    // lead surrogate code units and code points.
                    //   The main index has the code unit data.
                    //   For this function, we need the code point data.
                    // Note: this expression could be refactored for slightly improved efficiency, but
                    //       surrogate code points will be so rare in practice that it's not worth it.
                    ix = this.index[UTRIE2_LSCP_INDEX_2_OFFSET + ((codePoint - 0xd800) >> UTRIE2_SHIFT_2)];
                    ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
                    return this.data[ix];
                }
                if (codePoint < this.highStart) {
                    // Supplemental code point, use two-level lookup.
                    ix = UTRIE2_INDEX_1_OFFSET - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> UTRIE2_SHIFT_1);
                    ix = this.index[ix];
                    ix += (codePoint >> UTRIE2_SHIFT_2) & UTRIE2_INDEX_2_MASK;
                    ix = this.index[ix];
                    ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
                    return this.data[ix];
                }
                if (codePoint <= 0x10ffff) {
                    return this.data[this.highValueIndex];
                }
            }
            // Fall through.  The code point is outside of the legal range of 0..0x10ffff.
            return this.errorValue;
        };
        return Trie;
    }());

    var base64 = 'KwAAAAAAAAAACA4AIDoAAPAfAAACAAAAAAAIABAAGABAAEgAUABYAF4AZgBeAGYAYABoAHAAeABeAGYAfACEAIAAiACQAJgAoACoAK0AtQC9AMUAXgBmAF4AZgBeAGYAzQDVAF4AZgDRANkA3gDmAOwA9AD8AAQBDAEUARoBIgGAAIgAJwEvATcBPwFFAU0BTAFUAVwBZAFsAXMBewGDATAAiwGTAZsBogGkAawBtAG8AcIBygHSAdoB4AHoAfAB+AH+AQYCDgIWAv4BHgImAi4CNgI+AkUCTQJTAlsCYwJrAnECeQKBAk0CiQKRApkCoQKoArACuALAAsQCzAIwANQC3ALkAjAA7AL0AvwCAQMJAxADGAMwACADJgMuAzYDPgOAAEYDSgNSA1IDUgNaA1oDYANiA2IDgACAAGoDgAByA3YDfgOAAIQDgACKA5IDmgOAAIAAogOqA4AAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAK8DtwOAAIAAvwPHA88D1wPfAyAD5wPsA/QD/AOAAIAABAQMBBIEgAAWBB4EJgQuBDMEIAM7BEEEXgBJBCADUQRZBGEEaQQwADAAcQQ+AXkEgQSJBJEEgACYBIAAoASoBK8EtwQwAL8ExQSAAIAAgACAAIAAgACgAM0EXgBeAF4AXgBeAF4AXgBeANUEXgDZBOEEXgDpBPEE+QQBBQkFEQUZBSEFKQUxBTUFPQVFBUwFVAVcBV4AYwVeAGsFcwV7BYMFiwWSBV4AmgWgBacFXgBeAF4AXgBeAKsFXgCyBbEFugW7BcIFwgXIBcIFwgXQBdQF3AXkBesF8wX7BQMGCwYTBhsGIwYrBjMGOwZeAD8GRwZNBl4AVAZbBl4AXgBeAF4AXgBeAF4AXgBeAF4AXgBeAGMGXgBqBnEGXgBeAF4AXgBeAF4AXgBeAF4AXgB5BoAG4wSGBo4GkwaAAIADHgR5AF4AXgBeAJsGgABGA4AAowarBrMGswagALsGwwbLBjAA0wbaBtoG3QbaBtoG2gbaBtoG2gblBusG8wb7BgMHCwcTBxsHCwcjBysHMAc1BzUHOgdCB9oGSgdSB1oHYAfaBloHaAfaBlIH2gbaBtoG2gbaBtoG2gbaBjUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHbQdeAF4ANQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQd1B30HNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B4MH2gaKB68EgACAAIAAgACAAIAAgACAAI8HlwdeAJ8HpweAAIAArwe3B14AXgC/B8UHygcwANAH2AfgB4AA6AfwBz4B+AcACFwBCAgPCBcIogEYAR8IJwiAAC8INwg/CCADRwhPCFcIXwhnCEoDGgSAAIAAgABvCHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIhAiLCI4IMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlggwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAANQc1BzUHNQc1BzUHNQc1BzUHNQc1B54INQc1B6II2gaqCLIIugiAAIAAvgjGCIAAgACAAIAAgACAAIAAgACAAIAAywiHAYAA0wiAANkI3QjlCO0I9Aj8CIAAgACAAAIJCgkSCRoJIgknCTYHLwk3CZYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiAAIAAAAFAAXgBeAGAAcABeAHwAQACQAKAArQC9AJ4AXgBeAE0A3gBRAN4A7AD8AMwBGgEAAKcBNwEFAUwBXAF4QkhCmEKnArcCgAHHAsABz4LAAcABwAHAAd+C6ABoAG+C/4LAAcABwAHAAc+DF4MAAcAB54M3gweDV4Nng3eDaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAEeDqABVg6WDqABoQ6gAaABoAHXDvcONw/3DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DncPAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcAB7cPPwlGCU4JMACAAIAAgABWCV4JYQmAAGkJcAl4CXwJgAkwADAAMAAwAIgJgACLCZMJgACZCZ8JowmrCYAAswkwAF4AXgB8AIAAuwkABMMJyQmAAM4JgADVCTAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAqwYWBNkIMAAwADAAMADdCeAJ6AnuCR4E9gkwAP4JBQoNCjAAMACAABUK0wiAAB0KJAosCjQKgAAwADwKQwqAAEsKvQmdCVMKWwowADAAgACAALcEMACAAGMKgABrCjAAMAAwADAAMAAwADAAMAAwADAAMAAeBDAAMAAwADAAMAAwADAAMAAwADAAMAAwAIkEPQFzCnoKiQSCCooKkAqJBJgKoAqkCokEGAGsCrQKvArBCjAAMADJCtEKFQHZCuEK/gHpCvEKMAAwADAAMACAAIwE+QowAIAAPwEBCzAAMAAwADAAMACAAAkLEQswAIAAPwEZCyELgAAOCCkLMAAxCzkLMAAwADAAMAAwADAAXgBeAEELMAAwADAAMAAwADAAMAAwAEkLTQtVC4AAXAtkC4AAiQkwADAAMAAwADAAMAAwADAAbAtxC3kLgAuFC4sLMAAwAJMLlwufCzAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAApwswADAAMACAAIAAgACvC4AAgACAAIAAgACAALcLMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAvwuAAMcLgACAAIAAgACAAIAAyguAAIAAgACAAIAA0QswADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAANkLgACAAIAA4AswADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACJCR4E6AswADAAhwHwC4AA+AsADAgMEAwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMACAAIAAGAwdDCUMMAAwAC0MNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQw1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHPQwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADUHNQc1BzUHNQc1BzUHNQc2BzAAMAA5DDUHNQc1BzUHNQc1BzUHNQc1BzUHNQdFDDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAATQxSDFoMMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAF4AXgBeAF4AXgBeAF4AYgxeAGoMXgBxDHkMfwxeAIUMXgBeAI0MMAAwADAAMAAwAF4AXgCVDJ0MMAAwADAAMABeAF4ApQxeAKsMswy7DF4Awgy9DMoMXgBeAF4AXgBeAF4AXgBeAF4AXgDRDNkMeQBqCeAM3Ax8AOYM7Az0DPgMXgBeAF4AXgBeAF4AXgBeAF4AXgBeAF4AXgBeAF4AXgCgAAANoAAHDQ4NFg0wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAeDSYNMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAC4NMABeAF4ANg0wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAD4NRg1ODVYNXg1mDTAAbQ0wADAAMAAwADAAMAAwADAA2gbaBtoG2gbaBtoG2gbaBnUNeg3CBYANwgWFDdoGjA3aBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gaUDZwNpA2oDdoG2gawDbcNvw3HDdoG2gbPDdYN3A3fDeYN2gbsDfMN2gbaBvoN/g3aBgYODg7aBl4AXgBeABYOXgBeACUG2gYeDl4AJA5eACwO2w3aBtoGMQ45DtoG2gbaBtoGQQ7aBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gZJDjUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B1EO2gY1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQdZDjUHNQc1BzUHNQc1B2EONQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHaA41BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B3AO2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gY1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B2EO2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gZJDtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBkkOeA6gAKAAoAAwADAAMAAwAKAAoACgAKAAoACgAKAAgA4wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAD//wQABAAEAAQABAAEAAQABAAEAA0AAwABAAEAAgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAKABMAFwAeABsAGgAeABcAFgASAB4AGwAYAA8AGAAcAEsASwBLAEsASwBLAEsASwBLAEsAGAAYAB4AHgAeABMAHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAFgAbABIAHgAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYADQARAB4ABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAUABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkAFgAaABsAGwAbAB4AHQAdAB4ATwAXAB4ADQAeAB4AGgAbAE8ATwAOAFAAHQAdAB0ATwBPABcATwBPAE8AFgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAFAATwBAAE8ATwBPAEAATwBQAFAATwBQAB4AHgAeAB4AHgAeAB0AHQAdAB0AHgAdAB4ADgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgBQAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkACQAJAAkACQAJAAkABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAFAAHgAeAB4AKwArAFAAUABQAFAAGABQACsAKwArACsAHgAeAFAAHgBQAFAAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUAAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAYAA0AKwArAB4AHgAbACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAB4ABAAEAB4ABAAEABMABAArACsAKwArACsAKwArACsAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAKwArACsAKwArAFYAVgBWAB4AHgArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AGgAaABoAGAAYAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQAEwAEACsAEwATAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABLAEsASwBLAEsASwBLAEsASwBLABoAGQAZAB4AUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABMAUAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABABQAFAABAAEAB4ABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUAAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAFAABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQAUABQAB4AHgAYABMAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAFAABAAEAAQABAAEAFAABAAEAAQAUAAEAAQABAAEAAQAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArACsAHgArAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAAQABAANAA0ASwBLAEsASwBLAEsASwBLAEsASwAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAKwArACsAUABQAFAAUAArACsABABQAAQABAAEAAQABAAEAAQAKwArAAQABAArACsABAAEAAQAUAArACsAKwArACsAKwArACsABAArACsAKwArAFAAUAArAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAGgAaAFAAUABQAFAAUABMAB4AGwBQAB4AKwArACsABAAEAAQAKwBQAFAAUABQAFAAUAArACsAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUAArAFAAUAArACsABAArAAQABAAEAAQABAArACsAKwArAAQABAArACsABAAEAAQAKwArACsABAArACsAKwArACsAKwArAFAAUABQAFAAKwBQACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwAEAAQAUABQAFAABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUABQAFAAUAArACsABABQAAQABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQAKwArAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwAeABsAKwArACsAKwArACsAKwBQAAQABAAEAAQABAAEACsABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwArAAQABAArACsABAAEAAQAKwArACsAKwArACsAKwArAAQABAArACsAKwArAFAAUAArAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwAeAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwAEAFAAKwBQAFAAUABQAFAAUAArACsAKwBQAFAAUAArAFAAUABQAFAAKwArACsAUABQACsAUAArAFAAUAArACsAKwBQAFAAKwArACsAUABQAFAAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAAQABAAEAAQAKwArACsABAAEAAQAKwAEAAQABAAEACsAKwBQACsAKwArACsAKwArAAQAKwArACsAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAB4AHgAeAB4AHgAeABsAHgArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABAArACsAKwArACsAKwArAAQABAArAFAAUABQACsAKwArACsAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAB4AUAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABAArACsAKwArACsAKwArAAQABAArACsAKwArACsAKwArAFAAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABABQAB4AKwArACsAKwBQAFAAUAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQABoAUABQAFAAUABQAFAAKwArAAQABAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQACsAUAArACsAUABQAFAAUABQAFAAUAArACsAKwAEACsAKwArACsABAAEAAQABAAEAAQAKwAEACsABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgAqACsAKwArACsAGwBcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAeAEsASwBLAEsASwBLAEsASwBLAEsADQANACsAKwArACsAKwBcAFwAKwBcACsAKwBcAFwAKwBcACsAKwBcACsAKwArACsAKwArAFwAXABcAFwAKwBcAFwAXABcAFwAXABcACsAXABcAFwAKwBcACsAXAArACsAXABcACsAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgArACoAKgBcACsAKwBcAFwAXABcAFwAKwBcACsAKgAqACoAKgAqACoAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAFwAXABcAFwAUAAOAA4ADgAOAB4ADgAOAAkADgAOAA0ACQATABMAEwATABMACQAeABMAHgAeAB4ABAAEAB4AHgAeAB4AHgAeAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUAANAAQAHgAEAB4ABAAWABEAFgARAAQABABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAAQABAAEAAQABAANAAQABABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsADQANAB4AHgAeAB4AHgAeAAQAHgAeAB4AHgAeAB4AKwAeAB4ADgAOAA0ADgAeAB4AHgAeAB4ACQAJACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqAFwASwBLAEsASwBLAEsASwBLAEsASwANAA0AHgAeAB4AHgBcAFwAXABcAFwAXAAqACoAKgAqAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAKgAqACoAKgAqACoAKgBcAFwAXAAqACoAKgAqAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAXAAqAEsASwBLAEsASwBLAEsASwBLAEsAKgAqACoAKgAqACoAUABQAFAAUABQAFAAKwBQACsAKwArACsAKwBQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQACsAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwAEAAQABAAeAA0AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYAEQArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAADQANAA0AUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAA0ADQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsABAAEACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoADQANABUAXAANAB4ADQAbAFwAKgArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAB4AHgATABMADQANAA4AHgATABMAHgAEAAQABAAJACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAUABQAFAAUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwAeACsAKwArABMAEwBLAEsASwBLAEsASwBLAEsASwBLAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwBcAFwAXABcAFwAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBcACsAKwArACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEACsAKwAeAB4AXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgArACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgArACsABABLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKgAqACoAKgAqACoAKgBcACoAKgAqACoAKgAqACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAUABQAFAAUABQAFAAUAArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsADQANAB4ADQANAA0ADQAeAB4AHgAeAB4AHgAeAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAHgAeAB4AHgBQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwANAA0ADQANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwBQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAA0AUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsABAAEAAQAHgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAUABQAFAABABQAFAAUABQAAQABAAEAFAAUAAEAAQABAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAKwBQACsAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAFAAHgAeAB4AUABQAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAKwArAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAKwAeAB4AHgAeAB4AHgAeAA4AHgArAA0ADQANAA0ADQANAA0ACQANAA0ADQAIAAQACwAEAAQADQAJAA0ADQAMAB0AHQAeABcAFwAWABcAFwAXABYAFwAdAB0AHgAeABQAFAAUAA0AAQABAAQABAAEAAQABAAJABoAGgAaABoAGgAaABoAGgAeABcAFwAdABUAFQAeAB4AHgAeAB4AHgAYABYAEQAVABUAFQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgANAB4ADQANAA0ADQAeAA0ADQANAAcAHgAeAB4AHgArAAQABAAEAAQABAAEAAQABAAEAAQAUABQACsAKwBPAFAAUABQAFAAUAAeAB4AHgAWABEATwBQAE8ATwBPAE8AUABQAFAAUABQAB4AHgAeABYAEQArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAGwAbABsAGwAbABsAGwAaABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAaABsAGwAbABsAGgAbABsAGgAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgBQABoAHgAdAB4AUAAeABoAHgAeAB4AHgAeAB4AHgAeAB4ATwAeAFAAGwAeAB4AUABQAFAAUABQAB4AHgAeAB0AHQAeAFAAHgBQAB4AUAAeAFAATwBQAFAAHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AUABQAFAAUABPAE8AUABQAFAAUABQAE8AUABQAE8AUABPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBQAFAAUABQAE8ATwBPAE8ATwBPAE8ATwBPAE8AUABQAFAAUABQAFAAUABQAFAAHgAeAFAAUABQAFAATwAeAB4AKwArACsAKwAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB0AHQAeAB4AHgAdAB0AHgAeAB0AHgAeAB4AHQAeAB0AGwAbAB4AHQAeAB4AHgAeAB0AHgAeAB0AHQAdAB0AHgAeAB0AHgAdAB4AHQAdAB0AHQAdAB0AHgAdAB4AHgAeAB4AHgAdAB0AHQAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAdAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHgAdAB0AHQAdAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHQAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAlACUAHgAeAB4AHgAeAB4AHgAeAB4AFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBQAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB0AHQAeAB4AHgAeAB0AHQAdAB4AHgAdAB4AHgAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB0AHQAeAB4AHQAeAB4AHgAeAB0AHQAeAB4AHgAeACUAJQAdAB0AJQAeACUAJQAlACAAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAHgAeAB4AHgAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHQAdAB0AHgAdACUAHQAdAB4AHQAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAHQAdAB0AHQAlAB4AJQAlACUAHQAlACUAHQAdAB0AJQAlAB0AHQAlAB0AHQAlACUAJQAeAB0AHgAeAB4AHgAdAB0AJQAdAB0AHQAdAB0AHQAlACUAJQAlACUAHQAlACUAIAAlAB0AHQAlACUAJQAlACUAJQAlACUAHgAeAB4AJQAlACAAIAAgACAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeABcAFwAXABcAFwAXAB4AEwATACUAHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAWABEAFgARAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAeAB4AKwArACsAKwArABMADQANAA0AUAATAA0AUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUAANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAA0ADQANAA0ADQANAA0ADQAeAA0AFgANAB4AHgAXABcAHgAeABcAFwAWABEAFgARABYAEQAWABEADQANAA0ADQATAFAADQANAB4ADQANAB4AHgAeAB4AHgAMAAwADQANAA0AHgANAA0AFgANAA0ADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArAA0AEQARACUAJQBHAFcAVwAWABEAFgARABYAEQAWABEAFgARACUAJQAWABEAFgARABYAEQAWABEAFQAWABEAEQAlAFcAVwBXAFcAVwBXAFcAVwBXAAQABAAEAAQABAAEACUAVwBXAFcAVwA2ACUAJQBXAFcAVwBHAEcAJQAlACUAKwBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBRAFcAUQBXAFEAVwBXAFcAVwBXAFcAUQBXAFcAVwBXAFcAVwBRAFEAKwArAAQABAAVABUARwBHAFcAFQBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBRAFcAVwBXAFcAVwBXAFEAUQBXAFcAVwBXABUAUQBHAEcAVwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwArACUAJQBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAKwArACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAE8ATwBPAE8ATwBPAE8ATwAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADQATAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQAHgBQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAeAA0ADQANAA0ADQArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAAQAUABQAFAABABQAFAAUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAeAB4AHgAeACsAKwArACsAUABQAFAAUABQAFAAHgAeABoAHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADgAOABMAEwArACsAKwArACsAKwArACsABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUAAeAB4AHgBQAA4AUAArACsAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAB4AWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYACsAKwArAAQAHgAeAB4AHgAeAB4ADQANAA0AHgAeAB4AHgArAFAASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArAB4AHgBcAFwAXABcAFwAKgBcAFwAXABcAFwAXABcAFwAXABcAEsASwBLAEsASwBLAEsASwBLAEsAXABcAFwAXABcACsAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAFAAUABQAAQAUABQAFAAUABQAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAHgANAA0ADQBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAKgAqACoAXABcACoAKgBcAFwAXABcAFwAKgAqAFwAKgBcACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAA0ADQBQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQADQAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAVABVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBUAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVACsAKwArACsAKwArACsAKwArACsAKwArAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAKwArACsAKwBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAKwArACsAKwAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArACsAKwArAFYABABWAFYAVgBWAFYAVgBWAFYAVgBWAB4AVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgArAFYAVgBWAFYAVgArAFYAKwBWAFYAKwBWAFYAKwBWAFYAVgBWAFYAVgBWAFYAVgBWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAEQAWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAaAB4AKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAGAARABEAGAAYABMAEwAWABEAFAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACUAJQAlACUAJQAWABEAFgARABYAEQAWABEAFgARABYAEQAlACUAFgARACUAJQAlACUAJQAlACUAEQAlABEAKwAVABUAEwATACUAFgARABYAEQAWABEAJQAlACUAJQAlACUAJQAlACsAJQAbABoAJQArACsAKwArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAcAKwATACUAJQAbABoAJQAlABYAEQAlACUAEQAlABEAJQBXAFcAVwBXAFcAVwBXAFcAVwBXABUAFQAlACUAJQATACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXABYAJQARACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAWACUAEQAlABYAEQARABYAEQARABUAVwBRAFEAUQBRAFEAUQBRAFEAUQBRAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcARwArACsAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXACsAKwBXAFcAVwBXAFcAVwArACsAVwBXAFcAKwArACsAGgAbACUAJQAlABsAGwArAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAAQAB0AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsADQANAA0AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQBQAFAAUABQACsAKwArACsAUABQAFAAUABQAFAAUABQAA0AUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQACsAKwArAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgBQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwBQAFAAUABQAFAABAAEAAQAKwAEAAQAKwArACsAKwArAAQABAAEAAQAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsABAAEAAQAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsADQANAA0ADQANAA0ADQANAB4AKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AUABQAFAAUABQAFAAUABQAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwArACsAUABQAFAAUABQAA0ADQANAA0ADQANABQAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwANAA0ADQANAA0ADQANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQAeAB4AHgAeAB4AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsASwBLAEsASwBLAEsASwBLAEsASwANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAeAA4AUAArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAADQANAB4ADQAeAAQABAAEAB4AKwArAEsASwBLAEsASwBLAEsASwBLAEsAUAAOAFAADQANAA0AKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAA0AHgANAA0AHgAEACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAA0AKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAUAArACsAKwArACsAKwAEACsAKwArACsAKwBQAFAAUABQAFAABAAEACsAKwAEAAQABAAEAAQABAAEACsAKwArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABABQAFAAUABQAA0ADQANAA0AHgBLAEsASwBLAEsASwBLAEsASwBLACsADQArAB4AKwArAAQABAAEAAQAUABQAB4AUAArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEACsAKwAEAAQABAAEAAQABAAEAAQABAAOAA0ADQATABMAHgAeAB4ADQANAA0ADQANAA0ADQANAA0ADQANAA0ADQANAA0AUABQAFAAUAAEAAQAKwArAAQADQANAB4AUAArACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAKwAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAXABcAA0ADQANACoASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAOAB4ADQANAA0ADQAOAB4ABAArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAFAAUAArACsAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA0ADQANACsADgAOAA4ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAFAADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAOABMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAArACsAKwAEACsABAAEACsABAAEAAQABAAEAAQABABQAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABIAEgAQwBDAEMAUABQAFAAUABDAFAAUABQAEgAQwBIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABDAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwANAA0AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAANACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQANAB4AHgAeAB4AHgAeAFAAUABQAFAADQAeACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEcARwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwArACsAKwArACsAKwArACsAKwArACsAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQACsAKwAeAAQABAANAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAHgAeAAQABAAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAEAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUAArACsAUAArACsAUABQACsAKwBQAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQACsAUABQAFAAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwAeAB4AUABQAFAAUABQACsAUAArACsAKwBQAFAAUABQAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AKwArAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAEAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAeAB4ADQANAA0ADQAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABAArAAQABAArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAEAAQABAAEAAQABAAEACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAFgAWAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArAFAAKwArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArAFAAKwBQACsAKwArACsAKwArAFAAKwArACsAKwBQACsAUAArAFAAKwBQAFAAUAArAFAAUAArAFAAKwArAFAAKwBQACsAUAArAFAAKwBQACsAUABQACsAUAArACsAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAUABQAFAAUAArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwBQAFAAUAArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAlACUAJQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeACUAJQAlACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeACUAJQAlACUAJQAeACUAJQAlACUAJQAgACAAIAAlACUAIAAlACUAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIQAhACEAIQAhACUAJQAgACAAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACAAIAAlACUAJQAlACAAJQAgACAAIAAgACAAIAAgACAAIAAlACUAJQAgACUAJQAlACUAIAAgACAAJQAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeACUAHgAlAB4AJQAlACUAJQAlACAAJQAlACUAJQAeACUAHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAIAAgACAAJQAlACUAIAAgACAAIAAgAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFwAXABcAFQAVABUAHgAeAB4AHgAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACAAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAlACAAIAAlACUAJQAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAIAAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsA';

    /* @flow */
    var LETTER_NUMBER_MODIFIER = 50;
    // Non-tailorable Line Breaking Classes
    var BK = 1; //  Cause a line break (after)
    var CR = 2; //  Cause a line break (after), except between CR and LF
    var LF = 3; //  Cause a line break (after)
    var CM = 4; //  Prohibit a line break between the character and the preceding character
    var NL = 5; //  Cause a line break (after)
    var WJ = 7; //  Prohibit line breaks before and after
    var ZW = 8; //  Provide a break opportunity
    var GL = 9; //  Prohibit line breaks before and after
    var SP = 10; // Enable indirect line breaks
    var ZWJ = 11; // Prohibit line breaks within joiner sequences
    // Break Opportunities
    var B2 = 12; //  Provide a line break opportunity before and after the character
    var BA = 13; //  Generally provide a line break opportunity after the character
    var BB = 14; //  Generally provide a line break opportunity before the character
    var HY = 15; //  Provide a line break opportunity after the character, except in numeric context
    var CB = 16; //   Provide a line break opportunity contingent on additional information
    // Characters Prohibiting Certain Breaks
    var CL = 17; //  Prohibit line breaks before
    var CP = 18; //  Prohibit line breaks before
    var EX = 19; //  Prohibit line breaks before
    var IN = 20; //  Allow only indirect line breaks between pairs
    var NS = 21; //  Allow only indirect line breaks before
    var OP = 22; //  Prohibit line breaks after
    var QU = 23; //  Act like they are both opening and closing
    // Numeric Context
    var IS = 24; //  Prevent breaks after any and before numeric
    var NU = 25; //  Form numeric expressions for line breaking purposes
    var PO = 26; //  Do not break following a numeric expression
    var PR = 27; //  Do not break in front of a numeric expression
    var SY = 28; //  Prevent a break before; and allow a break after
    // Other Characters
    var AI = 29; //  Act like AL when the resolvedEAW is N; otherwise; act as ID
    var AL = 30; //  Are alphabetic characters or symbols that are used with alphabetic characters
    var CJ = 31; //  Treat as NS or ID for strict or normal breaking.
    var EB = 32; //  Do not break from following Emoji Modifier
    var EM = 33; //  Do not break from preceding Emoji Base
    var H2 = 34; //  Form Korean syllable blocks
    var H3 = 35; //  Form Korean syllable blocks
    var HL = 36; //  Do not break around a following hyphen; otherwise act as Alphabetic
    var ID = 37; //  Break before or after; except in some numeric context
    var JL = 38; //  Form Korean syllable blocks
    var JV = 39; //  Form Korean syllable blocks
    var JT = 40; //  Form Korean syllable blocks
    var RI = 41; //  Keep pairs together. For pairs; break before and after other classes
    var SA = 42; //  Provide a line break opportunity contingent on additional, language-specific context analysis
    var XX = 43; //  Have as yet unknown line breaking behavior or unassigned code positions
    var BREAK_MANDATORY = '!';
    var BREAK_NOT_ALLOWED = '×';
    var BREAK_ALLOWED = '÷';
    var UnicodeTrie = createTrieFromBase64(base64);
    var ALPHABETICS = [AL, HL];
    var HARD_LINE_BREAKS = [BK, CR, LF, NL];
    var SPACE = [SP, ZW];
    var PREFIX_POSTFIX = [PR, PO];
    var LINE_BREAKS = HARD_LINE_BREAKS.concat(SPACE);
    var KOREAN_SYLLABLE_BLOCK = [JL, JV, JT, H2, H3];
    var HYPHEN = [HY, BA];
    var codePointsToCharacterClasses = function (codePoints, lineBreak) {
        if (lineBreak === void 0) { lineBreak = 'strict'; }
        var types = [];
        var indicies = [];
        var categories = [];
        codePoints.forEach(function (codePoint, index) {
            var classType = UnicodeTrie.get(codePoint);
            if (classType > LETTER_NUMBER_MODIFIER) {
                categories.push(true);
                classType -= LETTER_NUMBER_MODIFIER;
            }
            else {
                categories.push(false);
            }
            if (['normal', 'auto', 'loose'].indexOf(lineBreak) !== -1) {
                // U+2010, – U+2013, 〜 U+301C, ゠ U+30A0
                if ([0x2010, 0x2013, 0x301c, 0x30a0].indexOf(codePoint) !== -1) {
                    indicies.push(index);
                    return types.push(CB);
                }
            }
            if (classType === CM || classType === ZWJ) {
                // LB10 Treat any remaining combining mark or ZWJ as AL.
                if (index === 0) {
                    indicies.push(index);
                    return types.push(AL);
                }
                // LB9 Do not break a combining character sequence; treat it as if it has the line breaking class of
                // the base character in all of the following rules. Treat ZWJ as if it were CM.
                var prev = types[index - 1];
                if (LINE_BREAKS.indexOf(prev) === -1) {
                    indicies.push(indicies[index - 1]);
                    return types.push(prev);
                }
                indicies.push(index);
                return types.push(AL);
            }
            indicies.push(index);
            if (classType === CJ) {
                return types.push(lineBreak === 'strict' ? NS : ID);
            }
            if (classType === SA) {
                return types.push(AL);
            }
            if (classType === AI) {
                return types.push(AL);
            }
            // For supplementary characters, a useful default is to treat characters in the range 10000..1FFFD as AL
            // and characters in the ranges 20000..2FFFD and 30000..3FFFD as ID, until the implementation can be revised
            // to take into account the actual line breaking properties for these characters.
            if (classType === XX) {
                if ((codePoint >= 0x20000 && codePoint <= 0x2fffd) || (codePoint >= 0x30000 && codePoint <= 0x3fffd)) {
                    return types.push(ID);
                }
                else {
                    return types.push(AL);
                }
            }
            types.push(classType);
        });
        return [indicies, types, categories];
    };
    var isAdjacentWithSpaceIgnored = function (a, b, currentIndex, classTypes) {
        var current = classTypes[currentIndex];
        if (Array.isArray(a) ? a.indexOf(current) !== -1 : a === current) {
            var i = currentIndex;
            while (i <= classTypes.length) {
                i++;
                var next = classTypes[i];
                if (next === b) {
                    return true;
                }
                if (next !== SP) {
                    break;
                }
            }
        }
        if (current === SP) {
            var i = currentIndex;
            while (i > 0) {
                i--;
                var prev = classTypes[i];
                if (Array.isArray(a) ? a.indexOf(prev) !== -1 : a === prev) {
                    var n = currentIndex;
                    while (n <= classTypes.length) {
                        n++;
                        var next = classTypes[n];
                        if (next === b) {
                            return true;
                        }
                        if (next !== SP) {
                            break;
                        }
                    }
                }
                if (prev !== SP) {
                    break;
                }
            }
        }
        return false;
    };
    var previousNonSpaceClassType = function (currentIndex, classTypes) {
        var i = currentIndex;
        while (i >= 0) {
            var type = classTypes[i];
            if (type === SP) {
                i--;
            }
            else {
                return type;
            }
        }
        return 0;
    };
    var _lineBreakAtIndex = function (codePoints, classTypes, indicies, index, forbiddenBreaks) {
        if (indicies[index] === 0) {
            return BREAK_NOT_ALLOWED;
        }
        var currentIndex = index - 1;
        if (Array.isArray(forbiddenBreaks) && forbiddenBreaks[currentIndex] === true) {
            return BREAK_NOT_ALLOWED;
        }
        var beforeIndex = currentIndex - 1;
        var afterIndex = currentIndex + 1;
        var current = classTypes[currentIndex];
        // LB4 Always break after hard line breaks.
        // LB5 Treat CR followed by LF, as well as CR, LF, and NL as hard line breaks.
        var before = beforeIndex >= 0 ? classTypes[beforeIndex] : 0;
        var next = classTypes[afterIndex];
        if (current === CR && next === LF) {
            return BREAK_NOT_ALLOWED;
        }
        if (HARD_LINE_BREAKS.indexOf(current) !== -1) {
            return BREAK_MANDATORY;
        }
        // LB6 Do not break before hard line breaks.
        if (HARD_LINE_BREAKS.indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED;
        }
        // LB7 Do not break before spaces or zero width space.
        if (SPACE.indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED;
        }
        // LB8 Break before any character following a zero-width space, even if one or more spaces intervene.
        if (previousNonSpaceClassType(currentIndex, classTypes) === ZW) {
            return BREAK_ALLOWED;
        }
        // LB8a Do not break between a zero width joiner and an ideograph, emoji base or emoji modifier.
        if (UnicodeTrie.get(codePoints[currentIndex]) === ZWJ && (next === ID || next === EB || next === EM)) {
            return BREAK_NOT_ALLOWED;
        }
        // LB11 Do not break before or after Word joiner and related characters.
        if (current === WJ || next === WJ) {
            return BREAK_NOT_ALLOWED;
        }
        // LB12 Do not break after NBSP and related characters.
        if (current === GL) {
            return BREAK_NOT_ALLOWED;
        }
        // LB12a Do not break before NBSP and related characters, except after spaces and hyphens.
        if ([SP, BA, HY].indexOf(current) === -1 && next === GL) {
            return BREAK_NOT_ALLOWED;
        }
        // LB13 Do not break before ‘]’ or ‘!’ or ‘;’ or ‘/’, even after spaces.
        if ([CL, CP, EX, IS, SY].indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED;
        }
        // LB14 Do not break after ‘[’, even after spaces.
        if (previousNonSpaceClassType(currentIndex, classTypes) === OP) {
            return BREAK_NOT_ALLOWED;
        }
        // LB15 Do not break within ‘”[’, even with intervening spaces.
        if (isAdjacentWithSpaceIgnored(QU, OP, currentIndex, classTypes)) {
            return BREAK_NOT_ALLOWED;
        }
        // LB16 Do not break between closing punctuation and a nonstarter (lb=NS), even with intervening spaces.
        if (isAdjacentWithSpaceIgnored([CL, CP], NS, currentIndex, classTypes)) {
            return BREAK_NOT_ALLOWED;
        }
        // LB17 Do not break within ‘——’, even with intervening spaces.
        if (isAdjacentWithSpaceIgnored(B2, B2, currentIndex, classTypes)) {
            return BREAK_NOT_ALLOWED;
        }
        // LB18 Break after spaces.
        if (current === SP) {
            return BREAK_ALLOWED;
        }
        // LB19 Do not break before or after quotation marks, such as ‘ ” ’.
        if (current === QU || next === QU) {
            return BREAK_NOT_ALLOWED;
        }
        // LB20 Break before and after unresolved CB.
        if (next === CB || current === CB) {
            return BREAK_ALLOWED;
        }
        // LB21 Do not break before hyphen-minus, other hyphens, fixed-width spaces, small kana, and other non-starters, or after acute accents.
        if ([BA, HY, NS].indexOf(next) !== -1 || current === BB) {
            return BREAK_NOT_ALLOWED;
        }
        // LB21a Don't break after Hebrew + Hyphen.
        if (before === HL && HYPHEN.indexOf(current) !== -1) {
            return BREAK_NOT_ALLOWED;
        }
        // LB21b Don’t break between Solidus and Hebrew letters.
        if (current === SY && next === HL) {
            return BREAK_NOT_ALLOWED;
        }
        // LB22 Do not break between two ellipses, or between letters, numbers or exclamations and ellipsis.
        if (next === IN && ALPHABETICS.concat(IN, EX, NU, ID, EB, EM).indexOf(current) !== -1) {
            return BREAK_NOT_ALLOWED;
        }
        // LB23 Do not break between digits and letters.
        if ((ALPHABETICS.indexOf(next) !== -1 && current === NU) || (ALPHABETICS.indexOf(current) !== -1 && next === NU)) {
            return BREAK_NOT_ALLOWED;
        }
        // LB23a Do not break between numeric prefixes and ideographs, or between ideographs and numeric postfixes.
        if ((current === PR && [ID, EB, EM].indexOf(next) !== -1) ||
            ([ID, EB, EM].indexOf(current) !== -1 && next === PO)) {
            return BREAK_NOT_ALLOWED;
        }
        // LB24 Do not break between numeric prefix/postfix and letters, or between letters and prefix/postfix.
        if ((ALPHABETICS.indexOf(current) !== -1 && PREFIX_POSTFIX.indexOf(next) !== -1) ||
            (PREFIX_POSTFIX.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1)) {
            return BREAK_NOT_ALLOWED;
        }
        // LB25 Do not break between the following pairs of classes relevant to numbers:
        if (
        // (PR | PO) × ( OP | HY )? NU
        ([PR, PO].indexOf(current) !== -1 &&
            (next === NU || ([OP, HY].indexOf(next) !== -1 && classTypes[afterIndex + 1] === NU))) ||
            // ( OP | HY ) × NU
            ([OP, HY].indexOf(current) !== -1 && next === NU) ||
            // NU ×	(NU | SY | IS)
            (current === NU && [NU, SY, IS].indexOf(next) !== -1)) {
            return BREAK_NOT_ALLOWED;
        }
        // NU (NU | SY | IS)* × (NU | SY | IS | CL | CP)
        if ([NU, SY, IS, CL, CP].indexOf(next) !== -1) {
            var prevIndex = currentIndex;
            while (prevIndex >= 0) {
                var type = classTypes[prevIndex];
                if (type === NU) {
                    return BREAK_NOT_ALLOWED;
                }
                else if ([SY, IS].indexOf(type) !== -1) {
                    prevIndex--;
                }
                else {
                    break;
                }
            }
        }
        // NU (NU | SY | IS)* (CL | CP)? × (PO | PR))
        if ([PR, PO].indexOf(next) !== -1) {
            var prevIndex = [CL, CP].indexOf(current) !== -1 ? beforeIndex : currentIndex;
            while (prevIndex >= 0) {
                var type = classTypes[prevIndex];
                if (type === NU) {
                    return BREAK_NOT_ALLOWED;
                }
                else if ([SY, IS].indexOf(type) !== -1) {
                    prevIndex--;
                }
                else {
                    break;
                }
            }
        }
        // LB26 Do not break a Korean syllable.
        if ((JL === current && [JL, JV, H2, H3].indexOf(next) !== -1) ||
            ([JV, H2].indexOf(current) !== -1 && [JV, JT].indexOf(next) !== -1) ||
            ([JT, H3].indexOf(current) !== -1 && next === JT)) {
            return BREAK_NOT_ALLOWED;
        }
        // LB27 Treat a Korean Syllable Block the same as ID.
        if ((KOREAN_SYLLABLE_BLOCK.indexOf(current) !== -1 && [IN, PO].indexOf(next) !== -1) ||
            (KOREAN_SYLLABLE_BLOCK.indexOf(next) !== -1 && current === PR)) {
            return BREAK_NOT_ALLOWED;
        }
        // LB28 Do not break between alphabetics (“at”).
        if (ALPHABETICS.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED;
        }
        // LB29 Do not break between numeric punctuation and alphabetics (“e.g.”).
        if (current === IS && ALPHABETICS.indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED;
        }
        // LB30 Do not break between letters, numbers, or ordinary symbols and opening or closing parentheses.
        if ((ALPHABETICS.concat(NU).indexOf(current) !== -1 && next === OP) ||
            (ALPHABETICS.concat(NU).indexOf(next) !== -1 && current === CP)) {
            return BREAK_NOT_ALLOWED;
        }
        // LB30a Break between two regional indicator symbols if and only if there are an even number of regional
        // indicators preceding the position of the break.
        if (current === RI && next === RI) {
            var i = indicies[currentIndex];
            var count = 1;
            while (i > 0) {
                i--;
                if (classTypes[i] === RI) {
                    count++;
                }
                else {
                    break;
                }
            }
            if (count % 2 !== 0) {
                return BREAK_NOT_ALLOWED;
            }
        }
        // LB30b Do not break between an emoji base and an emoji modifier.
        if (current === EB && next === EM) {
            return BREAK_NOT_ALLOWED;
        }
        return BREAK_ALLOWED;
    };
    var cssFormattedClasses = function (codePoints, options) {
        if (!options) {
            options = { lineBreak: 'normal', wordBreak: 'normal' };
        }
        var _a = codePointsToCharacterClasses(codePoints, options.lineBreak), indicies = _a[0], classTypes = _a[1], isLetterNumber = _a[2];
        if (options.wordBreak === 'break-all' || options.wordBreak === 'break-word') {
            classTypes = classTypes.map(function (type) { return ([NU, AL, SA].indexOf(type) !== -1 ? ID : type); });
        }
        var forbiddenBreakpoints = options.wordBreak === 'keep-all'
            ? isLetterNumber.map(function (letterNumber, i) {
                return letterNumber && codePoints[i] >= 0x4e00 && codePoints[i] <= 0x9fff;
            })
            : undefined;
        return [indicies, classTypes, forbiddenBreakpoints];
    };
    var Break = /** @class */ (function () {
        function Break(codePoints, lineBreak, start, end) {
            this.codePoints = codePoints;
            this.required = lineBreak === BREAK_MANDATORY;
            this.start = start;
            this.end = end;
        }
        Break.prototype.slice = function () {
            return fromCodePoint.apply(void 0, this.codePoints.slice(this.start, this.end));
        };
        return Break;
    }());
    var LineBreaker = function (str, options) {
        var codePoints = toCodePoints(str);
        var _a = cssFormattedClasses(codePoints, options), indicies = _a[0], classTypes = _a[1], forbiddenBreakpoints = _a[2];
        var length = codePoints.length;
        var lastEnd = 0;
        var nextIndex = 0;
        return {
            next: function () {
                if (nextIndex >= length) {
                    return { done: true, value: null };
                }
                var lineBreak = BREAK_NOT_ALLOWED;
                while (nextIndex < length &&
                    (lineBreak = _lineBreakAtIndex(codePoints, classTypes, indicies, ++nextIndex, forbiddenBreakpoints)) ===
                        BREAK_NOT_ALLOWED) { }
                if (lineBreak !== BREAK_NOT_ALLOWED || nextIndex === length) {
                    var value = new Break(codePoints, lineBreak, lastEnd, nextIndex);
                    lastEnd = nextIndex;
                    return { value: value, done: false };
                }
                return { done: true, value: null };
            },
        };
    };

    // https://www.w3.org/TR/css-syntax-3
    var TokenType;
    (function (TokenType) {
        TokenType[TokenType["STRING_TOKEN"] = 0] = "STRING_TOKEN";
        TokenType[TokenType["BAD_STRING_TOKEN"] = 1] = "BAD_STRING_TOKEN";
        TokenType[TokenType["LEFT_PARENTHESIS_TOKEN"] = 2] = "LEFT_PARENTHESIS_TOKEN";
        TokenType[TokenType["RIGHT_PARENTHESIS_TOKEN"] = 3] = "RIGHT_PARENTHESIS_TOKEN";
        TokenType[TokenType["COMMA_TOKEN"] = 4] = "COMMA_TOKEN";
        TokenType[TokenType["HASH_TOKEN"] = 5] = "HASH_TOKEN";
        TokenType[TokenType["DELIM_TOKEN"] = 6] = "DELIM_TOKEN";
        TokenType[TokenType["AT_KEYWORD_TOKEN"] = 7] = "AT_KEYWORD_TOKEN";
        TokenType[TokenType["PREFIX_MATCH_TOKEN"] = 8] = "PREFIX_MATCH_TOKEN";
        TokenType[TokenType["DASH_MATCH_TOKEN"] = 9] = "DASH_MATCH_TOKEN";
        TokenType[TokenType["INCLUDE_MATCH_TOKEN"] = 10] = "INCLUDE_MATCH_TOKEN";
        TokenType[TokenType["LEFT_CURLY_BRACKET_TOKEN"] = 11] = "LEFT_CURLY_BRACKET_TOKEN";
        TokenType[TokenType["RIGHT_CURLY_BRACKET_TOKEN"] = 12] = "RIGHT_CURLY_BRACKET_TOKEN";
        TokenType[TokenType["SUFFIX_MATCH_TOKEN"] = 13] = "SUFFIX_MATCH_TOKEN";
        TokenType[TokenType["SUBSTRING_MATCH_TOKEN"] = 14] = "SUBSTRING_MATCH_TOKEN";
        TokenType[TokenType["DIMENSION_TOKEN"] = 15] = "DIMENSION_TOKEN";
        TokenType[TokenType["PERCENTAGE_TOKEN"] = 16] = "PERCENTAGE_TOKEN";
        TokenType[TokenType["NUMBER_TOKEN"] = 17] = "NUMBER_TOKEN";
        TokenType[TokenType["FUNCTION"] = 18] = "FUNCTION";
        TokenType[TokenType["FUNCTION_TOKEN"] = 19] = "FUNCTION_TOKEN";
        TokenType[TokenType["IDENT_TOKEN"] = 20] = "IDENT_TOKEN";
        TokenType[TokenType["COLUMN_TOKEN"] = 21] = "COLUMN_TOKEN";
        TokenType[TokenType["URL_TOKEN"] = 22] = "URL_TOKEN";
        TokenType[TokenType["BAD_URL_TOKEN"] = 23] = "BAD_URL_TOKEN";
        TokenType[TokenType["CDC_TOKEN"] = 24] = "CDC_TOKEN";
        TokenType[TokenType["CDO_TOKEN"] = 25] = "CDO_TOKEN";
        TokenType[TokenType["COLON_TOKEN"] = 26] = "COLON_TOKEN";
        TokenType[TokenType["SEMICOLON_TOKEN"] = 27] = "SEMICOLON_TOKEN";
        TokenType[TokenType["LEFT_SQUARE_BRACKET_TOKEN"] = 28] = "LEFT_SQUARE_BRACKET_TOKEN";
        TokenType[TokenType["RIGHT_SQUARE_BRACKET_TOKEN"] = 29] = "RIGHT_SQUARE_BRACKET_TOKEN";
        TokenType[TokenType["UNICODE_RANGE_TOKEN"] = 30] = "UNICODE_RANGE_TOKEN";
        TokenType[TokenType["WHITESPACE_TOKEN"] = 31] = "WHITESPACE_TOKEN";
        TokenType[TokenType["EOF_TOKEN"] = 32] = "EOF_TOKEN";
    })(TokenType || (TokenType = {}));
    var FLAG_UNRESTRICTED = 1 << 0;
    var FLAG_ID = 1 << 1;
    var FLAG_INTEGER = 1 << 2;
    var FLAG_NUMBER = 1 << 3;
    var LINE_FEED = 0x000a;
    var SOLIDUS = 0x002f;
    var REVERSE_SOLIDUS = 0x005c;
    var CHARACTER_TABULATION = 0x0009;
    var SPACE$1 = 0x0020;
    var QUOTATION_MARK = 0x0022;
    var EQUALS_SIGN = 0x003d;
    var NUMBER_SIGN = 0x0023;
    var DOLLAR_SIGN = 0x0024;
    var PERCENTAGE_SIGN = 0x0025;
    var APOSTROPHE = 0x0027;
    var LEFT_PARENTHESIS = 0x0028;
    var RIGHT_PARENTHESIS = 0x0029;
    var LOW_LINE = 0x005f;
    var HYPHEN_MINUS = 0x002d;
    var EXCLAMATION_MARK = 0x0021;
    var LESS_THAN_SIGN = 0x003c;
    var GREATER_THAN_SIGN = 0x003e;
    var COMMERCIAL_AT = 0x0040;
    var LEFT_SQUARE_BRACKET = 0x005b;
    var RIGHT_SQUARE_BRACKET = 0x005d;
    var CIRCUMFLEX_ACCENT = 0x003d;
    var LEFT_CURLY_BRACKET = 0x007b;
    var QUESTION_MARK = 0x003f;
    var RIGHT_CURLY_BRACKET = 0x007d;
    var VERTICAL_LINE = 0x007c;
    var TILDE = 0x007e;
    var CONTROL = 0x0080;
    var REPLACEMENT_CHARACTER = 0xfffd;
    var ASTERISK = 0x002a;
    var PLUS_SIGN = 0x002b;
    var COMMA = 0x002c;
    var COLON = 0x003a;
    var SEMICOLON = 0x003b;
    var FULL_STOP = 0x002e;
    var NULL = 0x0000;
    var BACKSPACE = 0x0008;
    var LINE_TABULATION = 0x000b;
    var SHIFT_OUT = 0x000e;
    var INFORMATION_SEPARATOR_ONE = 0x001f;
    var DELETE = 0x007f;
    var EOF = -1;
    var ZERO = 0x0030;
    var a = 0x0061;
    var e = 0x0065;
    var f = 0x0066;
    var u = 0x0075;
    var z = 0x007a;
    var A = 0x0041;
    var E = 0x0045;
    var F = 0x0046;
    var U = 0x0055;
    var Z = 0x005a;
    var isDigit = function (codePoint) { return codePoint >= ZERO && codePoint <= 0x0039; };
    var isSurrogateCodePoint = function (codePoint) { return codePoint >= 0xd800 && codePoint <= 0xdfff; };
    var isHex = function (codePoint) {
        return isDigit(codePoint) || (codePoint >= A && codePoint <= F) || (codePoint >= a && codePoint <= f);
    };
    var isLowerCaseLetter = function (codePoint) { return codePoint >= a && codePoint <= z; };
    var isUpperCaseLetter = function (codePoint) { return codePoint >= A && codePoint <= Z; };
    var isLetter = function (codePoint) { return isLowerCaseLetter(codePoint) || isUpperCaseLetter(codePoint); };
    var isNonASCIICodePoint = function (codePoint) { return codePoint >= CONTROL; };
    var isWhiteSpace = function (codePoint) {
        return codePoint === LINE_FEED || codePoint === CHARACTER_TABULATION || codePoint === SPACE$1;
    };
    var isNameStartCodePoint = function (codePoint) {
        return isLetter(codePoint) || isNonASCIICodePoint(codePoint) || codePoint === LOW_LINE;
    };
    var isNameCodePoint = function (codePoint) {
        return isNameStartCodePoint(codePoint) || isDigit(codePoint) || codePoint === HYPHEN_MINUS;
    };
    var isNonPrintableCodePoint = function (codePoint) {
        return ((codePoint >= NULL && codePoint <= BACKSPACE) ||
            codePoint === LINE_TABULATION ||
            (codePoint >= SHIFT_OUT && codePoint <= INFORMATION_SEPARATOR_ONE) ||
            codePoint === DELETE);
    };
    var isValidEscape = function (c1, c2) {
        if (c1 !== REVERSE_SOLIDUS) {
            return false;
        }
        return c2 !== LINE_FEED;
    };
    var isIdentifierStart = function (c1, c2, c3) {
        if (c1 === HYPHEN_MINUS) {
            return isNameStartCodePoint(c2) || isValidEscape(c2, c3);
        }
        else if (isNameStartCodePoint(c1)) {
            return true;
        }
        else if (c1 === REVERSE_SOLIDUS && isValidEscape(c1, c2)) {
            return true;
        }
        return false;
    };
    var isNumberStart = function (c1, c2, c3) {
        if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
            if (isDigit(c2)) {
                return true;
            }
            return c2 === FULL_STOP && isDigit(c3);
        }
        if (c1 === FULL_STOP) {
            return isDigit(c2);
        }
        return isDigit(c1);
    };
    var stringToNumber = function (codePoints) {
        var c = 0;
        var sign = 1;
        if (codePoints[c] === PLUS_SIGN || codePoints[c] === HYPHEN_MINUS) {
            if (codePoints[c] === HYPHEN_MINUS) {
                sign = -1;
            }
            c++;
        }
        var integers = [];
        while (isDigit(codePoints[c])) {
            integers.push(codePoints[c++]);
        }
        var int = integers.length ? parseInt(fromCodePoint.apply(void 0, integers), 10) : 0;
        if (codePoints[c] === FULL_STOP) {
            c++;
        }
        var fraction = [];
        while (isDigit(codePoints[c])) {
            fraction.push(codePoints[c++]);
        }
        var fracd = fraction.length;
        var frac = fracd ? parseInt(fromCodePoint.apply(void 0, fraction), 10) : 0;
        if (codePoints[c] === E || codePoints[c] === e) {
            c++;
        }
        var expsign = 1;
        if (codePoints[c] === PLUS_SIGN || codePoints[c] === HYPHEN_MINUS) {
            if (codePoints[c] === HYPHEN_MINUS) {
                expsign = -1;
            }
            c++;
        }
        var exponent = [];
        while (isDigit(codePoints[c])) {
            exponent.push(codePoints[c++]);
        }
        var exp = exponent.length ? parseInt(fromCodePoint.apply(void 0, exponent), 10) : 0;
        return sign * (int + frac * Math.pow(10, -fracd)) * Math.pow(10, expsign * exp);
    };
    var LEFT_PARENTHESIS_TOKEN = {
        type: TokenType.LEFT_PARENTHESIS_TOKEN
    };
    var RIGHT_PARENTHESIS_TOKEN = {
        type: TokenType.RIGHT_PARENTHESIS_TOKEN
    };
    var COMMA_TOKEN = { type: TokenType.COMMA_TOKEN };
    var SUFFIX_MATCH_TOKEN = { type: TokenType.SUFFIX_MATCH_TOKEN };
    var PREFIX_MATCH_TOKEN = { type: TokenType.PREFIX_MATCH_TOKEN };
    var COLUMN_TOKEN = { type: TokenType.COLUMN_TOKEN };
    var DASH_MATCH_TOKEN = { type: TokenType.DASH_MATCH_TOKEN };
    var INCLUDE_MATCH_TOKEN = { type: TokenType.INCLUDE_MATCH_TOKEN };
    var LEFT_CURLY_BRACKET_TOKEN = {
        type: TokenType.LEFT_CURLY_BRACKET_TOKEN
    };
    var RIGHT_CURLY_BRACKET_TOKEN = {
        type: TokenType.RIGHT_CURLY_BRACKET_TOKEN
    };
    var SUBSTRING_MATCH_TOKEN = { type: TokenType.SUBSTRING_MATCH_TOKEN };
    var BAD_URL_TOKEN = { type: TokenType.BAD_URL_TOKEN };
    var BAD_STRING_TOKEN = { type: TokenType.BAD_STRING_TOKEN };
    var CDO_TOKEN = { type: TokenType.CDO_TOKEN };
    var CDC_TOKEN = { type: TokenType.CDC_TOKEN };
    var COLON_TOKEN = { type: TokenType.COLON_TOKEN };
    var SEMICOLON_TOKEN = { type: TokenType.SEMICOLON_TOKEN };
    var LEFT_SQUARE_BRACKET_TOKEN = {
        type: TokenType.LEFT_SQUARE_BRACKET_TOKEN
    };
    var RIGHT_SQUARE_BRACKET_TOKEN = {
        type: TokenType.RIGHT_SQUARE_BRACKET_TOKEN
    };
    var WHITESPACE_TOKEN = { type: TokenType.WHITESPACE_TOKEN };
    var EOF_TOKEN = { type: TokenType.EOF_TOKEN };
    var Tokenizer = /** @class */ (function () {
        function Tokenizer() {
            this._value = [];
        }
        Tokenizer.prototype.write = function (chunk) {
            this._value = this._value.concat(toCodePoints(chunk));
        };
        Tokenizer.prototype.read = function () {
            var tokens = [];
            var token = this.consumeToken();
            while (token !== EOF_TOKEN) {
                tokens.push(token);
                token = this.consumeToken();
            }
            return tokens;
        };
        Tokenizer.prototype.consumeToken = function () {
            var codePoint = this.consumeCodePoint();
            switch (codePoint) {
                case QUOTATION_MARK:
                    return this.consumeStringToken(QUOTATION_MARK);
                case NUMBER_SIGN:
                    var c1 = this.peekCodePoint(0);
                    var c2 = this.peekCodePoint(1);
                    var c3 = this.peekCodePoint(2);
                    if (isNameCodePoint(c1) || isValidEscape(c2, c3)) {
                        var flags = isIdentifierStart(c1, c2, c3) ? FLAG_ID : FLAG_UNRESTRICTED;
                        var value = this.consumeName();
                        return { type: TokenType.HASH_TOKEN, value: value, flags: flags };
                    }
                    break;
                case DOLLAR_SIGN:
                    if (this.peekCodePoint(0) === EQUALS_SIGN) {
                        this.consumeCodePoint();
                        return SUFFIX_MATCH_TOKEN;
                    }
                    break;
                case APOSTROPHE:
                    return this.consumeStringToken(APOSTROPHE);
                case LEFT_PARENTHESIS:
                    return LEFT_PARENTHESIS_TOKEN;
                case RIGHT_PARENTHESIS:
                    return RIGHT_PARENTHESIS_TOKEN;
                case ASTERISK:
                    if (this.peekCodePoint(0) === EQUALS_SIGN) {
                        this.consumeCodePoint();
                        return SUBSTRING_MATCH_TOKEN;
                    }
                    break;
                case PLUS_SIGN:
                    if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
                        this.reconsumeCodePoint(codePoint);
                        return this.consumeNumericToken();
                    }
                    break;
                case COMMA:
                    return COMMA_TOKEN;
                case HYPHEN_MINUS:
                    var e1 = codePoint;
                    var e2 = this.peekCodePoint(0);
                    var e3 = this.peekCodePoint(1);
                    if (isNumberStart(e1, e2, e3)) {
                        this.reconsumeCodePoint(codePoint);
                        return this.consumeNumericToken();
                    }
                    if (isIdentifierStart(e1, e2, e3)) {
                        this.reconsumeCodePoint(codePoint);
                        return this.consumeIdentLikeToken();
                    }
                    if (e2 === HYPHEN_MINUS && e3 === GREATER_THAN_SIGN) {
                        this.consumeCodePoint();
                        this.consumeCodePoint();
                        return CDC_TOKEN;
                    }
                    break;
                case FULL_STOP:
                    if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
                        this.reconsumeCodePoint(codePoint);
                        return this.consumeNumericToken();
                    }
                    break;
                case SOLIDUS:
                    if (this.peekCodePoint(0) === ASTERISK) {
                        this.consumeCodePoint();
                        while (true) {
                            var c = this.consumeCodePoint();
                            if (c === ASTERISK) {
                                c = this.consumeCodePoint();
                                if (c === SOLIDUS) {
                                    return this.consumeToken();
                                }
                            }
                            if (c === EOF) {
                                return this.consumeToken();
                            }
                        }
                    }
                    break;
                case COLON:
                    return COLON_TOKEN;
                case SEMICOLON:
                    return SEMICOLON_TOKEN;
                case LESS_THAN_SIGN:
                    if (this.peekCodePoint(0) === EXCLAMATION_MARK &&
                        this.peekCodePoint(1) === HYPHEN_MINUS &&
                        this.peekCodePoint(2) === HYPHEN_MINUS) {
                        this.consumeCodePoint();
                        this.consumeCodePoint();
                        return CDO_TOKEN;
                    }
                    break;
                case COMMERCIAL_AT:
                    var a1 = this.peekCodePoint(0);
                    var a2 = this.peekCodePoint(1);
                    var a3 = this.peekCodePoint(2);
                    if (isIdentifierStart(a1, a2, a3)) {
                        var value = this.consumeName();
                        return { type: TokenType.AT_KEYWORD_TOKEN, value: value };
                    }
                    break;
                case LEFT_SQUARE_BRACKET:
                    return LEFT_SQUARE_BRACKET_TOKEN;
                case REVERSE_SOLIDUS:
                    if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                        this.reconsumeCodePoint(codePoint);
                        return this.consumeIdentLikeToken();
                    }
                    break;
                case RIGHT_SQUARE_BRACKET:
                    return RIGHT_SQUARE_BRACKET_TOKEN;
                case CIRCUMFLEX_ACCENT:
                    if (this.peekCodePoint(0) === EQUALS_SIGN) {
                        this.consumeCodePoint();
                        return PREFIX_MATCH_TOKEN;
                    }
                    break;
                case LEFT_CURLY_BRACKET:
                    return LEFT_CURLY_BRACKET_TOKEN;
                case RIGHT_CURLY_BRACKET:
                    return RIGHT_CURLY_BRACKET_TOKEN;
                case u:
                case U:
                    var u1 = this.peekCodePoint(0);
                    var u2 = this.peekCodePoint(1);
                    if (u1 === PLUS_SIGN && (isHex(u2) || u2 === QUESTION_MARK)) {
                        this.consumeCodePoint();
                        this.consumeUnicodeRangeToken();
                    }
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeIdentLikeToken();
                case VERTICAL_LINE:
                    if (this.peekCodePoint(0) === EQUALS_SIGN) {
                        this.consumeCodePoint();
                        return DASH_MATCH_TOKEN;
                    }
                    if (this.peekCodePoint(0) === VERTICAL_LINE) {
                        this.consumeCodePoint();
                        return COLUMN_TOKEN;
                    }
                    break;
                case TILDE:
                    if (this.peekCodePoint(0) === EQUALS_SIGN) {
                        this.consumeCodePoint();
                        return INCLUDE_MATCH_TOKEN;
                    }
                    break;
                case EOF:
                    return EOF_TOKEN;
            }
            if (isWhiteSpace(codePoint)) {
                this.consumeWhiteSpace();
                return WHITESPACE_TOKEN;
            }
            if (isDigit(codePoint)) {
                this.reconsumeCodePoint(codePoint);
                return this.consumeNumericToken();
            }
            if (isNameStartCodePoint(codePoint)) {
                this.reconsumeCodePoint(codePoint);
                return this.consumeIdentLikeToken();
            }
            return { type: TokenType.DELIM_TOKEN, value: fromCodePoint(codePoint) };
        };
        Tokenizer.prototype.consumeCodePoint = function () {
            var value = this._value.shift();
            return typeof value === 'undefined' ? -1 : value;
        };
        Tokenizer.prototype.reconsumeCodePoint = function (codePoint) {
            this._value.unshift(codePoint);
        };
        Tokenizer.prototype.peekCodePoint = function (delta) {
            if (delta >= this._value.length) {
                return -1;
            }
            return this._value[delta];
        };
        Tokenizer.prototype.consumeUnicodeRangeToken = function () {
            var digits = [];
            var codePoint = this.consumeCodePoint();
            while (isHex(codePoint) && digits.length < 6) {
                digits.push(codePoint);
                codePoint = this.consumeCodePoint();
            }
            var questionMarks = false;
            while (codePoint === QUESTION_MARK && digits.length < 6) {
                digits.push(codePoint);
                codePoint = this.consumeCodePoint();
                questionMarks = true;
            }
            if (questionMarks) {
                var start_1 = parseInt(fromCodePoint.apply(void 0, digits.map(function (digit) { return (digit === QUESTION_MARK ? ZERO : digit); })), 16);
                var end = parseInt(fromCodePoint.apply(void 0, digits.map(function (digit) { return (digit === QUESTION_MARK ? F : digit); })), 16);
                return { type: TokenType.UNICODE_RANGE_TOKEN, start: start_1, end: end };
            }
            var start = parseInt(fromCodePoint.apply(void 0, digits), 16);
            if (this.peekCodePoint(0) === HYPHEN_MINUS && isHex(this.peekCodePoint(1))) {
                this.consumeCodePoint();
                codePoint = this.consumeCodePoint();
                var endDigits = [];
                while (isHex(codePoint) && endDigits.length < 6) {
                    endDigits.push(codePoint);
                    codePoint = this.consumeCodePoint();
                }
                var end = parseInt(fromCodePoint.apply(void 0, endDigits), 16);
                return { type: TokenType.UNICODE_RANGE_TOKEN, start: start, end: end };
            }
            else {
                return { type: TokenType.UNICODE_RANGE_TOKEN, start: start, end: start };
            }
        };
        Tokenizer.prototype.consumeIdentLikeToken = function () {
            var value = this.consumeName();
            if (value.toLowerCase() === 'url' && this.peekCodePoint(0) === LEFT_PARENTHESIS) {
                this.consumeCodePoint();
                return this.consumeUrlToken();
            }
            else if (this.peekCodePoint(0) === LEFT_PARENTHESIS) {
                this.consumeCodePoint();
                return { type: TokenType.FUNCTION_TOKEN, value: value };
            }
            return { type: TokenType.IDENT_TOKEN, value: value };
        };
        Tokenizer.prototype.consumeUrlToken = function () {
            var value = [];
            this.consumeWhiteSpace();
            if (this.peekCodePoint(0) === EOF) {
                return { type: TokenType.URL_TOKEN, value: '' };
            }
            var next = this.peekCodePoint(0);
            if (next === APOSTROPHE || next === QUOTATION_MARK) {
                var stringToken = this.consumeStringToken(this.consumeCodePoint());
                if (stringToken.type === TokenType.STRING_TOKEN) {
                    this.consumeWhiteSpace();
                    if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
                        this.consumeCodePoint();
                        return { type: TokenType.URL_TOKEN, value: stringToken.value };
                    }
                }
                this.consumeBadUrlRemnants();
                return BAD_URL_TOKEN;
            }
            while (true) {
                var codePoint = this.consumeCodePoint();
                if (codePoint === EOF || codePoint === RIGHT_PARENTHESIS) {
                    return { type: TokenType.URL_TOKEN, value: fromCodePoint.apply(void 0, value) };
                }
                else if (isWhiteSpace(codePoint)) {
                    this.consumeWhiteSpace();
                    if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
                        this.consumeCodePoint();
                        return { type: TokenType.URL_TOKEN, value: fromCodePoint.apply(void 0, value) };
                    }
                    this.consumeBadUrlRemnants();
                    return BAD_URL_TOKEN;
                }
                else if (codePoint === QUOTATION_MARK ||
                    codePoint === APOSTROPHE ||
                    codePoint === LEFT_PARENTHESIS ||
                    isNonPrintableCodePoint(codePoint)) {
                    this.consumeBadUrlRemnants();
                    return BAD_URL_TOKEN;
                }
                else if (codePoint === REVERSE_SOLIDUS) {
                    if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                        value.push(this.consumeEscapedCodePoint());
                    }
                    else {
                        this.consumeBadUrlRemnants();
                        return BAD_URL_TOKEN;
                    }
                }
                else {
                    value.push(codePoint);
                }
            }
        };
        Tokenizer.prototype.consumeWhiteSpace = function () {
            while (isWhiteSpace(this.peekCodePoint(0))) {
                this.consumeCodePoint();
            }
        };
        Tokenizer.prototype.consumeBadUrlRemnants = function () {
            while (true) {
                var codePoint = this.consumeCodePoint();
                if (codePoint === RIGHT_PARENTHESIS || codePoint === EOF) {
                    return;
                }
                if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                    this.consumeEscapedCodePoint();
                }
            }
        };
        Tokenizer.prototype.consumeStringSlice = function (count) {
            var SLICE_STACK_SIZE = 60000;
            var value = '';
            while (count > 0) {
                var amount = Math.min(SLICE_STACK_SIZE, count);
                value += fromCodePoint.apply(void 0, this._value.splice(0, amount));
                count -= amount;
            }
            this._value.shift();
            return value;
        };
        Tokenizer.prototype.consumeStringToken = function (endingCodePoint) {
            var value = '';
            var i = 0;
            do {
                var codePoint = this._value[i];
                if (codePoint === EOF || codePoint === undefined || codePoint === endingCodePoint) {
                    value += this.consumeStringSlice(i);
                    return { type: TokenType.STRING_TOKEN, value: value };
                }
                if (codePoint === LINE_FEED) {
                    this._value.splice(0, i);
                    return BAD_STRING_TOKEN;
                }
                if (codePoint === REVERSE_SOLIDUS) {
                    var next = this._value[i + 1];
                    if (next !== EOF && next !== undefined) {
                        if (next === LINE_FEED) {
                            value += this.consumeStringSlice(i);
                            i = -1;
                            this._value.shift();
                        }
                        else if (isValidEscape(codePoint, next)) {
                            value += this.consumeStringSlice(i);
                            value += fromCodePoint(this.consumeEscapedCodePoint());
                            i = -1;
                        }
                    }
                }
                i++;
            } while (true);
        };
        Tokenizer.prototype.consumeNumber = function () {
            var repr = [];
            var type = FLAG_INTEGER;
            var c1 = this.peekCodePoint(0);
            if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
                repr.push(this.consumeCodePoint());
            }
            while (isDigit(this.peekCodePoint(0))) {
                repr.push(this.consumeCodePoint());
            }
            c1 = this.peekCodePoint(0);
            var c2 = this.peekCodePoint(1);
            if (c1 === FULL_STOP && isDigit(c2)) {
                repr.push(this.consumeCodePoint(), this.consumeCodePoint());
                type = FLAG_NUMBER;
                while (isDigit(this.peekCodePoint(0))) {
                    repr.push(this.consumeCodePoint());
                }
            }
            c1 = this.peekCodePoint(0);
            c2 = this.peekCodePoint(1);
            var c3 = this.peekCodePoint(2);
            if ((c1 === E || c1 === e) && (((c2 === PLUS_SIGN || c2 === HYPHEN_MINUS) && isDigit(c3)) || isDigit(c2))) {
                repr.push(this.consumeCodePoint(), this.consumeCodePoint());
                type = FLAG_NUMBER;
                while (isDigit(this.peekCodePoint(0))) {
                    repr.push(this.consumeCodePoint());
                }
            }
            return [stringToNumber(repr), type];
        };
        Tokenizer.prototype.consumeNumericToken = function () {
            var _a = this.consumeNumber(), number = _a[0], flags = _a[1];
            var c1 = this.peekCodePoint(0);
            var c2 = this.peekCodePoint(1);
            var c3 = this.peekCodePoint(2);
            if (isIdentifierStart(c1, c2, c3)) {
                var unit = this.consumeName();
                return { type: TokenType.DIMENSION_TOKEN, number: number, flags: flags, unit: unit };
            }
            if (c1 === PERCENTAGE_SIGN) {
                this.consumeCodePoint();
                return { type: TokenType.PERCENTAGE_TOKEN, number: number, flags: flags };
            }
            return { type: TokenType.NUMBER_TOKEN, number: number, flags: flags };
        };
        Tokenizer.prototype.consumeEscapedCodePoint = function () {
            var codePoint = this.consumeCodePoint();
            if (isHex(codePoint)) {
                var hex = fromCodePoint(codePoint);
                while (isHex(this.peekCodePoint(0)) && hex.length < 6) {
                    hex += fromCodePoint(this.consumeCodePoint());
                }
                if (isWhiteSpace(this.peekCodePoint(0))) {
                    this.consumeCodePoint();
                }
                var hexCodePoint = parseInt(hex, 16);
                if (hexCodePoint === 0 || isSurrogateCodePoint(hexCodePoint) || hexCodePoint > 0x10ffff) {
                    return REPLACEMENT_CHARACTER;
                }
                return hexCodePoint;
            }
            if (codePoint === EOF) {
                return REPLACEMENT_CHARACTER;
            }
            return codePoint;
        };
        Tokenizer.prototype.consumeName = function () {
            var result = '';
            while (true) {
                var codePoint = this.consumeCodePoint();
                if (isNameCodePoint(codePoint)) {
                    result += fromCodePoint(codePoint);
                }
                else if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                    result += fromCodePoint(this.consumeEscapedCodePoint());
                }
                else {
                    this.reconsumeCodePoint(codePoint);
                    return result;
                }
            }
        };
        return Tokenizer;
    }());

    var Parser = /** @class */ (function () {
        function Parser(tokens) {
            this._tokens = tokens;
        }
        Parser.create = function (value) {
            var tokenizer = new Tokenizer();
            tokenizer.write(value);
            return new Parser(tokenizer.read());
        };
        Parser.parseValue = function (value) {
            return Parser.create(value).parseComponentValue();
        };
        Parser.parseValues = function (value) {
            return Parser.create(value).parseComponentValues();
        };
        Parser.prototype.parseComponentValue = function () {
            var token = this.consumeToken();
            while (token.type === TokenType.WHITESPACE_TOKEN) {
                token = this.consumeToken();
            }
            if (token.type === TokenType.EOF_TOKEN) {
                throw new SyntaxError("Error parsing CSS component value, unexpected EOF");
            }
            this.reconsumeToken(token);
            var value = this.consumeComponentValue();
            do {
                token = this.consumeToken();
            } while (token.type === TokenType.WHITESPACE_TOKEN);
            if (token.type === TokenType.EOF_TOKEN) {
                return value;
            }
            throw new SyntaxError("Error parsing CSS component value, multiple values found when expecting only one");
        };
        Parser.prototype.parseComponentValues = function () {
            var values = [];
            while (true) {
                var value = this.consumeComponentValue();
                if (value.type === TokenType.EOF_TOKEN) {
                    return values;
                }
                values.push(value);
                values.push();
            }
        };
        Parser.prototype.consumeComponentValue = function () {
            var token = this.consumeToken();
            switch (token.type) {
                case TokenType.LEFT_CURLY_BRACKET_TOKEN:
                case TokenType.LEFT_SQUARE_BRACKET_TOKEN:
                case TokenType.LEFT_PARENTHESIS_TOKEN:
                    return this.consumeSimpleBlock(token.type);
                case TokenType.FUNCTION_TOKEN:
                    return this.consumeFunction(token);
            }
            return token;
        };
        Parser.prototype.consumeSimpleBlock = function (type) {
            var block = { type: type, values: [] };
            var token = this.consumeToken();
            while (true) {
                if (token.type === TokenType.EOF_TOKEN || isEndingTokenFor(token, type)) {
                    return block;
                }
                this.reconsumeToken(token);
                block.values.push(this.consumeComponentValue());
                token = this.consumeToken();
            }
        };
        Parser.prototype.consumeFunction = function (functionToken) {
            var cssFunction = {
                name: functionToken.value,
                values: [],
                type: TokenType.FUNCTION
            };
            while (true) {
                var token = this.consumeToken();
                if (token.type === TokenType.EOF_TOKEN || token.type === TokenType.RIGHT_PARENTHESIS_TOKEN) {
                    return cssFunction;
                }
                this.reconsumeToken(token);
                cssFunction.values.push(this.consumeComponentValue());
            }
        };
        Parser.prototype.consumeToken = function () {
            var token = this._tokens.shift();
            return typeof token === 'undefined' ? EOF_TOKEN : token;
        };
        Parser.prototype.reconsumeToken = function (token) {
            this._tokens.unshift(token);
        };
        return Parser;
    }());
    var isDimensionToken = function (token) { return token.type === TokenType.DIMENSION_TOKEN; };
    var isNumberToken = function (token) { return token.type === TokenType.NUMBER_TOKEN; };
    var isIdentToken = function (token) { return token.type === TokenType.IDENT_TOKEN; };
    var isStringToken = function (token) { return token.type === TokenType.STRING_TOKEN; };
    var isIdentWithValue = function (token, value) {
        return isIdentToken(token) && token.value === value;
    };
    var nonWhiteSpace = function (token) { return token.type !== TokenType.WHITESPACE_TOKEN; };
    var nonFunctionArgSeparator = function (token) {
        return token.type !== TokenType.WHITESPACE_TOKEN && token.type !== TokenType.COMMA_TOKEN;
    };
    var parseFunctionArgs = function (tokens) {
        var args = [];
        var arg = [];
        tokens.forEach(function (token) {
            if (token.type === TokenType.COMMA_TOKEN) {
                if (arg.length === 0) {
                    throw new Error("Error parsing function args, zero tokens for arg");
                }
                args.push(arg);
                arg = [];
                return;
            }
            if (token.type !== TokenType.WHITESPACE_TOKEN) {
                arg.push(token);
            }
        });
        if (arg.length) {
            args.push(arg);
        }
        return args;
    };
    var isEndingTokenFor = function (token, type) {
        if (type === TokenType.LEFT_CURLY_BRACKET_TOKEN && token.type === TokenType.RIGHT_CURLY_BRACKET_TOKEN) {
            return true;
        }
        if (type === TokenType.LEFT_SQUARE_BRACKET_TOKEN && token.type === TokenType.RIGHT_SQUARE_BRACKET_TOKEN) {
            return true;
        }
        return type === TokenType.LEFT_PARENTHESIS_TOKEN && token.type === TokenType.RIGHT_PARENTHESIS_TOKEN;
    };

    var isLength = function (token) {
        return token.type === TokenType.NUMBER_TOKEN || token.type === TokenType.DIMENSION_TOKEN;
    };

    var isLengthPercentage = function (token) {
        return token.type === TokenType.PERCENTAGE_TOKEN || isLength(token);
    };
    var parseLengthPercentageTuple = function (tokens) {
        return tokens.length > 1 ? [tokens[0], tokens[1]] : [tokens[0]];
    };
    var ZERO_LENGTH = {
        type: TokenType.NUMBER_TOKEN,
        number: 0,
        flags: FLAG_INTEGER
    };
    var FIFTY_PERCENT = {
        type: TokenType.PERCENTAGE_TOKEN,
        number: 50,
        flags: FLAG_INTEGER
    };
    var HUNDRED_PERCENT = {
        type: TokenType.PERCENTAGE_TOKEN,
        number: 100,
        flags: FLAG_INTEGER
    };
    var getAbsoluteValueForTuple = function (tuple, width, height) {
        var x = tuple[0], y = tuple[1];
        return [getAbsoluteValue(x, width), getAbsoluteValue(typeof y !== 'undefined' ? y : x, height)];
    };
    var getAbsoluteValue = function (token, parent) {
        if (token.type === TokenType.PERCENTAGE_TOKEN) {
            return (token.number / 100) * parent;
        }
        if (isDimensionToken(token)) {
            switch (token.unit) {
                case 'rem':
                case 'em':
                    return 16 * token.number; // TODO use correct font-size
                case 'px':
                default:
                    return token.number;
            }
        }
        return token.number;
    };

    var DEG = 'deg';
    var GRAD = 'grad';
    var RAD = 'rad';
    var TURN = 'turn';
    var angle = {
        name: 'angle',
        parse: function (value) {
            if (value.type === TokenType.DIMENSION_TOKEN) {
                switch (value.unit) {
                    case DEG:
                        return (Math.PI * value.number) / 180;
                    case GRAD:
                        return (Math.PI / 200) * value.number;
                    case RAD:
                        return value.number;
                    case TURN:
                        return Math.PI * 2 * value.number;
                }
            }
            throw new Error("Unsupported angle type");
        }
    };
    var isAngle = function (value) {
        if (value.type === TokenType.DIMENSION_TOKEN) {
            if (value.unit === DEG || value.unit === GRAD || value.unit === RAD || value.unit === TURN) {
                return true;
            }
        }
        return false;
    };
    var parseNamedSide = function (tokens) {
        var sideOrCorner = tokens
            .filter(isIdentToken)
            .map(function (ident) { return ident.value; })
            .join(' ');
        switch (sideOrCorner) {
            case 'to bottom right':
            case 'to right bottom':
            case 'left top':
            case 'top left':
                return [ZERO_LENGTH, ZERO_LENGTH];
            case 'to top':
            case 'bottom':
                return deg(0);
            case 'to bottom left':
            case 'to left bottom':
            case 'right top':
            case 'top right':
                return [ZERO_LENGTH, HUNDRED_PERCENT];
            case 'to right':
            case 'left':
                return deg(90);
            case 'to top left':
            case 'to left top':
            case 'right bottom':
            case 'bottom right':
                return [HUNDRED_PERCENT, HUNDRED_PERCENT];
            case 'to bottom':
            case 'top':
                return deg(180);
            case 'to top right':
            case 'to right top':
            case 'left bottom':
            case 'bottom left':
                return [HUNDRED_PERCENT, ZERO_LENGTH];
            case 'to left':
            case 'right':
                return deg(270);
        }
        return 0;
    };
    var deg = function (deg) { return (Math.PI * deg) / 180; };

    var color = {
        name: 'color',
        parse: function (value) {
            if (value.type === TokenType.FUNCTION) {
                var colorFunction = SUPPORTED_COLOR_FUNCTIONS[value.name];
                if (typeof colorFunction === 'undefined') {
                    throw new Error("Attempting to parse an unsupported color function \"" + value.name + "\"");
                }
                return colorFunction(value.values);
            }
            if (value.type === TokenType.HASH_TOKEN) {
                if (value.value.length === 3) {
                    var r = value.value.substring(0, 1);
                    var g = value.value.substring(1, 2);
                    var b = value.value.substring(2, 3);
                    return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), 1);
                }
                if (value.value.length === 4) {
                    var r = value.value.substring(0, 1);
                    var g = value.value.substring(1, 2);
                    var b = value.value.substring(2, 3);
                    var a = value.value.substring(3, 4);
                    return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), parseInt(a + a, 16) / 255);
                }
                if (value.value.length === 6) {
                    var r = value.value.substring(0, 2);
                    var g = value.value.substring(2, 4);
                    var b = value.value.substring(4, 6);
                    return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), 1);
                }
                if (value.value.length === 8) {
                    var r = value.value.substring(0, 2);
                    var g = value.value.substring(2, 4);
                    var b = value.value.substring(4, 6);
                    var a = value.value.substring(6, 8);
                    return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), parseInt(a, 16) / 255);
                }
            }
            if (value.type === TokenType.IDENT_TOKEN) {
                var namedColor = COLORS[value.value.toUpperCase()];
                if (typeof namedColor !== 'undefined') {
                    return namedColor;
                }
            }
            return COLORS.TRANSPARENT;
        }
    };
    var isTransparent = function (color) { return (0xff & color) === 0; };
    var asString = function (color) {
        var alpha = 0xff & color;
        var blue = 0xff & (color >> 8);
        var green = 0xff & (color >> 16);
        var red = 0xff & (color >> 24);
        return alpha < 255 ? "rgba(" + red + "," + green + "," + blue + "," + alpha / 255 + ")" : "rgb(" + red + "," + green + "," + blue + ")";
    };
    var pack = function (r, g, b, a) {
        return ((r << 24) | (g << 16) | (b << 8) | (Math.round(a * 255) << 0)) >>> 0;
    };
    var getTokenColorValue = function (token, i) {
        if (token.type === TokenType.NUMBER_TOKEN) {
            return token.number;
        }
        if (token.type === TokenType.PERCENTAGE_TOKEN) {
            var max = i === 3 ? 1 : 255;
            return i === 3 ? (token.number / 100) * max : Math.round((token.number / 100) * max);
        }
        return 0;
    };
    var rgb = function (args) {
        var tokens = args.filter(nonFunctionArgSeparator);
        if (tokens.length === 3) {
            var _a = tokens.map(getTokenColorValue), r = _a[0], g = _a[1], b = _a[2];
            return pack(r, g, b, 1);
        }
        if (tokens.length === 4) {
            var _b = tokens.map(getTokenColorValue), r = _b[0], g = _b[1], b = _b[2], a = _b[3];
            return pack(r, g, b, a);
        }
        return 0;
    };
    function hue2rgb(t1, t2, hue) {
        if (hue < 0) {
            hue += 1;
        }
        if (hue >= 1) {
            hue -= 1;
        }
        if (hue < 1 / 6) {
            return (t2 - t1) * hue * 6 + t1;
        }
        else if (hue < 1 / 2) {
            return t2;
        }
        else if (hue < 2 / 3) {
            return (t2 - t1) * 6 * (2 / 3 - hue) + t1;
        }
        else {
            return t1;
        }
    }
    var hsl = function (args) {
        var tokens = args.filter(nonFunctionArgSeparator);
        var hue = tokens[0], saturation = tokens[1], lightness = tokens[2], alpha = tokens[3];
        var h = (hue.type === TokenType.NUMBER_TOKEN ? deg(hue.number) : angle.parse(hue)) / (Math.PI * 2);
        var s = isLengthPercentage(saturation) ? saturation.number / 100 : 0;
        var l = isLengthPercentage(lightness) ? lightness.number / 100 : 0;
        var a = typeof alpha !== 'undefined' && isLengthPercentage(alpha) ? getAbsoluteValue(alpha, 1) : 1;
        if (s === 0) {
            return pack(l * 255, l * 255, l * 255, 1);
        }
        var t2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        var t1 = l * 2 - t2;
        var r = hue2rgb(t1, t2, h + 1 / 3);
        var g = hue2rgb(t1, t2, h);
        var b = hue2rgb(t1, t2, h - 1 / 3);
        return pack(r * 255, g * 255, b * 255, a);
    };
    var SUPPORTED_COLOR_FUNCTIONS = {
        hsl: hsl,
        hsla: hsl,
        rgb: rgb,
        rgba: rgb
    };
    var COLORS = {
        ALICEBLUE: 0xf0f8ffff,
        ANTIQUEWHITE: 0xfaebd7ff,
        AQUA: 0x00ffffff,
        AQUAMARINE: 0x7fffd4ff,
        AZURE: 0xf0ffffff,
        BEIGE: 0xf5f5dcff,
        BISQUE: 0xffe4c4ff,
        BLACK: 0x000000ff,
        BLANCHEDALMOND: 0xffebcdff,
        BLUE: 0x0000ffff,
        BLUEVIOLET: 0x8a2be2ff,
        BROWN: 0xa52a2aff,
        BURLYWOOD: 0xdeb887ff,
        CADETBLUE: 0x5f9ea0ff,
        CHARTREUSE: 0x7fff00ff,
        CHOCOLATE: 0xd2691eff,
        CORAL: 0xff7f50ff,
        CORNFLOWERBLUE: 0x6495edff,
        CORNSILK: 0xfff8dcff,
        CRIMSON: 0xdc143cff,
        CYAN: 0x00ffffff,
        DARKBLUE: 0x00008bff,
        DARKCYAN: 0x008b8bff,
        DARKGOLDENROD: 0xb886bbff,
        DARKGRAY: 0xa9a9a9ff,
        DARKGREEN: 0x006400ff,
        DARKGREY: 0xa9a9a9ff,
        DARKKHAKI: 0xbdb76bff,
        DARKMAGENTA: 0x8b008bff,
        DARKOLIVEGREEN: 0x556b2fff,
        DARKORANGE: 0xff8c00ff,
        DARKORCHID: 0x9932ccff,
        DARKRED: 0x8b0000ff,
        DARKSALMON: 0xe9967aff,
        DARKSEAGREEN: 0x8fbc8fff,
        DARKSLATEBLUE: 0x483d8bff,
        DARKSLATEGRAY: 0x2f4f4fff,
        DARKSLATEGREY: 0x2f4f4fff,
        DARKTURQUOISE: 0x00ced1ff,
        DARKVIOLET: 0x9400d3ff,
        DEEPPINK: 0xff1493ff,
        DEEPSKYBLUE: 0x00bfffff,
        DIMGRAY: 0x696969ff,
        DIMGREY: 0x696969ff,
        DODGERBLUE: 0x1e90ffff,
        FIREBRICK: 0xb22222ff,
        FLORALWHITE: 0xfffaf0ff,
        FORESTGREEN: 0x228b22ff,
        FUCHSIA: 0xff00ffff,
        GAINSBORO: 0xdcdcdcff,
        GHOSTWHITE: 0xf8f8ffff,
        GOLD: 0xffd700ff,
        GOLDENROD: 0xdaa520ff,
        GRAY: 0x808080ff,
        GREEN: 0x008000ff,
        GREENYELLOW: 0xadff2fff,
        GREY: 0x808080ff,
        HONEYDEW: 0xf0fff0ff,
        HOTPINK: 0xff69b4ff,
        INDIANRED: 0xcd5c5cff,
        INDIGO: 0x4b0082ff,
        IVORY: 0xfffff0ff,
        KHAKI: 0xf0e68cff,
        LAVENDER: 0xe6e6faff,
        LAVENDERBLUSH: 0xfff0f5ff,
        LAWNGREEN: 0x7cfc00ff,
        LEMONCHIFFON: 0xfffacdff,
        LIGHTBLUE: 0xadd8e6ff,
        LIGHTCORAL: 0xf08080ff,
        LIGHTCYAN: 0xe0ffffff,
        LIGHTGOLDENRODYELLOW: 0xfafad2ff,
        LIGHTGRAY: 0xd3d3d3ff,
        LIGHTGREEN: 0x90ee90ff,
        LIGHTGREY: 0xd3d3d3ff,
        LIGHTPINK: 0xffb6c1ff,
        LIGHTSALMON: 0xffa07aff,
        LIGHTSEAGREEN: 0x20b2aaff,
        LIGHTSKYBLUE: 0x87cefaff,
        LIGHTSLATEGRAY: 0x778899ff,
        LIGHTSLATEGREY: 0x778899ff,
        LIGHTSTEELBLUE: 0xb0c4deff,
        LIGHTYELLOW: 0xffffe0ff,
        LIME: 0x00ff00ff,
        LIMEGREEN: 0x32cd32ff,
        LINEN: 0xfaf0e6ff,
        MAGENTA: 0xff00ffff,
        MAROON: 0x800000ff,
        MEDIUMAQUAMARINE: 0x66cdaaff,
        MEDIUMBLUE: 0x0000cdff,
        MEDIUMORCHID: 0xba55d3ff,
        MEDIUMPURPLE: 0x9370dbff,
        MEDIUMSEAGREEN: 0x3cb371ff,
        MEDIUMSLATEBLUE: 0x7b68eeff,
        MEDIUMSPRINGGREEN: 0x00fa9aff,
        MEDIUMTURQUOISE: 0x48d1ccff,
        MEDIUMVIOLETRED: 0xc71585ff,
        MIDNIGHTBLUE: 0x191970ff,
        MINTCREAM: 0xf5fffaff,
        MISTYROSE: 0xffe4e1ff,
        MOCCASIN: 0xffe4b5ff,
        NAVAJOWHITE: 0xffdeadff,
        NAVY: 0x000080ff,
        OLDLACE: 0xfdf5e6ff,
        OLIVE: 0x808000ff,
        OLIVEDRAB: 0x6b8e23ff,
        ORANGE: 0xffa500ff,
        ORANGERED: 0xff4500ff,
        ORCHID: 0xda70d6ff,
        PALEGOLDENROD: 0xeee8aaff,
        PALEGREEN: 0x98fb98ff,
        PALETURQUOISE: 0xafeeeeff,
        PALEVIOLETRED: 0xdb7093ff,
        PAPAYAWHIP: 0xffefd5ff,
        PEACHPUFF: 0xffdab9ff,
        PERU: 0xcd853fff,
        PINK: 0xffc0cbff,
        PLUM: 0xdda0ddff,
        POWDERBLUE: 0xb0e0e6ff,
        PURPLE: 0x800080ff,
        REBECCAPURPLE: 0x663399ff,
        RED: 0xff0000ff,
        ROSYBROWN: 0xbc8f8fff,
        ROYALBLUE: 0x4169e1ff,
        SADDLEBROWN: 0x8b4513ff,
        SALMON: 0xfa8072ff,
        SANDYBROWN: 0xf4a460ff,
        SEAGREEN: 0x2e8b57ff,
        SEASHELL: 0xfff5eeff,
        SIENNA: 0xa0522dff,
        SILVER: 0xc0c0c0ff,
        SKYBLUE: 0x87ceebff,
        SLATEBLUE: 0x6a5acdff,
        SLATEGRAY: 0x708090ff,
        SLATEGREY: 0x708090ff,
        SNOW: 0xfffafaff,
        SPRINGGREEN: 0x00ff7fff,
        STEELBLUE: 0x4682b4ff,
        TAN: 0xd2b48cff,
        TEAL: 0x008080ff,
        THISTLE: 0xd8bfd8ff,
        TOMATO: 0xff6347ff,
        TRANSPARENT: 0x00000000,
        TURQUOISE: 0x40e0d0ff,
        VIOLET: 0xee82eeff,
        WHEAT: 0xf5deb3ff,
        WHITE: 0xffffffff,
        WHITESMOKE: 0xf5f5f5ff,
        YELLOW: 0xffff00ff,
        YELLOWGREEN: 0x9acd32ff
    };

    var PropertyDescriptorParsingType;
    (function (PropertyDescriptorParsingType) {
        PropertyDescriptorParsingType[PropertyDescriptorParsingType["VALUE"] = 0] = "VALUE";
        PropertyDescriptorParsingType[PropertyDescriptorParsingType["LIST"] = 1] = "LIST";
        PropertyDescriptorParsingType[PropertyDescriptorParsingType["IDENT_VALUE"] = 2] = "IDENT_VALUE";
        PropertyDescriptorParsingType[PropertyDescriptorParsingType["TYPE_VALUE"] = 3] = "TYPE_VALUE";
        PropertyDescriptorParsingType[PropertyDescriptorParsingType["TOKEN_VALUE"] = 4] = "TOKEN_VALUE";
    })(PropertyDescriptorParsingType || (PropertyDescriptorParsingType = {}));

    var BACKGROUND_CLIP;
    (function (BACKGROUND_CLIP) {
        BACKGROUND_CLIP[BACKGROUND_CLIP["BORDER_BOX"] = 0] = "BORDER_BOX";
        BACKGROUND_CLIP[BACKGROUND_CLIP["PADDING_BOX"] = 1] = "PADDING_BOX";
        BACKGROUND_CLIP[BACKGROUND_CLIP["CONTENT_BOX"] = 2] = "CONTENT_BOX";
    })(BACKGROUND_CLIP || (BACKGROUND_CLIP = {}));
    var backgroundClip = {
        name: 'background-clip',
        initialValue: 'border-box',
        prefix: false,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            return tokens.map(function (token) {
                if (isIdentToken(token)) {
                    switch (token.value) {
                        case 'padding-box':
                            return BACKGROUND_CLIP.PADDING_BOX;
                        case 'content-box':
                            return BACKGROUND_CLIP.CONTENT_BOX;
                    }
                }
                return BACKGROUND_CLIP.BORDER_BOX;
            });
        }
    };

    var backgroundColor = {
        name: "background-color",
        initialValue: 'transparent',
        prefix: false,
        type: PropertyDescriptorParsingType.TYPE_VALUE,
        format: 'color'
    };

    var parseColorStop = function (args) {
        var color$1 = color.parse(args[0]);
        var stop = args[1];
        return stop && isLengthPercentage(stop) ? { color: color$1, stop: stop } : { color: color$1, stop: null };
    };
    var processColorStops = function (stops, lineLength) {
        var first = stops[0];
        var last = stops[stops.length - 1];
        if (first.stop === null) {
            first.stop = ZERO_LENGTH;
        }
        if (last.stop === null) {
            last.stop = HUNDRED_PERCENT;
        }
        var processStops = [];
        var previous = 0;
        for (var i = 0; i < stops.length; i++) {
            var stop_1 = stops[i].stop;
            if (stop_1 !== null) {
                var absoluteValue = getAbsoluteValue(stop_1, lineLength);
                if (absoluteValue > previous) {
                    processStops.push(absoluteValue);
                }
                else {
                    processStops.push(previous);
                }
                previous = absoluteValue;
            }
            else {
                processStops.push(null);
            }
        }
        var gapBegin = null;
        for (var i = 0; i < processStops.length; i++) {
            var stop_2 = processStops[i];
            if (stop_2 === null) {
                if (gapBegin === null) {
                    gapBegin = i;
                }
            }
            else if (gapBegin !== null) {
                var gapLength = i - gapBegin;
                var beforeGap = processStops[gapBegin - 1];
                var gapValue = (stop_2 - beforeGap) / (gapLength + 1);
                for (var g = 1; g <= gapLength; g++) {
                    processStops[gapBegin + g - 1] = gapValue * g;
                }
                gapBegin = null;
            }
        }
        return stops.map(function (_a, i) {
            var color = _a.color;
            return { color: color, stop: Math.max(Math.min(1, processStops[i] / lineLength), 0) };
        });
    };
    var getAngleFromCorner = function (corner, width, height) {
        var centerX = width / 2;
        var centerY = height / 2;
        var x = getAbsoluteValue(corner[0], width) - centerX;
        var y = centerY - getAbsoluteValue(corner[1], height);
        return (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
    };
    var calculateGradientDirection = function (angle, width, height) {
        var radian = typeof angle === 'number' ? angle : getAngleFromCorner(angle, width, height);
        var lineLength = Math.abs(width * Math.sin(radian)) + Math.abs(height * Math.cos(radian));
        var halfWidth = width / 2;
        var halfHeight = height / 2;
        var halfLineLength = lineLength / 2;
        var yDiff = Math.sin(radian - Math.PI / 2) * halfLineLength;
        var xDiff = Math.cos(radian - Math.PI / 2) * halfLineLength;
        return [lineLength, halfWidth - xDiff, halfWidth + xDiff, halfHeight - yDiff, halfHeight + yDiff];
    };
    var distance = function (a, b) { return Math.sqrt(a * a + b * b); };
    var findCorner = function (width, height, x, y, closest) {
        var corners = [[0, 0], [0, height], [width, 0], [width, height]];
        return corners.reduce(function (stat, corner) {
            var cx = corner[0], cy = corner[1];
            var d = distance(x - cx, y - cy);
            if (closest ? d < stat.optimumDistance : d > stat.optimumDistance) {
                return {
                    optimumCorner: corner,
                    optimumDistance: d
                };
            }
            return stat;
        }, {
            optimumDistance: closest ? Infinity : -Infinity,
            optimumCorner: null
        }).optimumCorner;
    };
    var calculateRadius = function (gradient, x, y, width, height) {
        var rx = 0;
        var ry = 0;
        switch (gradient.size) {
            case CSSRadialExtent.CLOSEST_SIDE:
                // The ending shape is sized so that that it exactly meets the side of the gradient box closest to the gradient’s center.
                // If the shape is an ellipse, it exactly meets the closest side in each dimension.
                if (gradient.shape === CSSRadialShape.CIRCLE) {
                    rx = ry = Math.min(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
                }
                else if (gradient.shape === CSSRadialShape.ELLIPSE) {
                    rx = Math.min(Math.abs(x), Math.abs(x - width));
                    ry = Math.min(Math.abs(y), Math.abs(y - height));
                }
                break;
            case CSSRadialExtent.CLOSEST_CORNER:
                // The ending shape is sized so that that it passes through the corner of the gradient box closest to the gradient’s center.
                // If the shape is an ellipse, the ending shape is given the same aspect-ratio it would have if closest-side were specified.
                if (gradient.shape === CSSRadialShape.CIRCLE) {
                    rx = ry = Math.min(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
                }
                else if (gradient.shape === CSSRadialShape.ELLIPSE) {
                    // Compute the ratio ry/rx (which is to be the same as for "closest-side")
                    var c = Math.min(Math.abs(y), Math.abs(y - height)) / Math.min(Math.abs(x), Math.abs(x - width));
                    var _a = findCorner(width, height, x, y, true), cx = _a[0], cy = _a[1];
                    rx = distance(cx - x, (cy - y) / c);
                    ry = c * rx;
                }
                break;
            case CSSRadialExtent.FARTHEST_SIDE:
                // Same as closest-side, except the ending shape is sized based on the farthest side(s)
                if (gradient.shape === CSSRadialShape.CIRCLE) {
                    rx = ry = Math.max(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
                }
                else if (gradient.shape === CSSRadialShape.ELLIPSE) {
                    rx = Math.max(Math.abs(x), Math.abs(x - width));
                    ry = Math.max(Math.abs(y), Math.abs(y - height));
                }
                break;
            case CSSRadialExtent.FARTHEST_CORNER:
                // Same as closest-corner, except the ending shape is sized based on the farthest corner.
                // If the shape is an ellipse, the ending shape is given the same aspect ratio it would have if farthest-side were specified.
                if (gradient.shape === CSSRadialShape.CIRCLE) {
                    rx = ry = Math.max(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
                }
                else if (gradient.shape === CSSRadialShape.ELLIPSE) {
                    // Compute the ratio ry/rx (which is to be the same as for "farthest-side")
                    var c = Math.max(Math.abs(y), Math.abs(y - height)) / Math.max(Math.abs(x), Math.abs(x - width));
                    var _b = findCorner(width, height, x, y, false), cx = _b[0], cy = _b[1];
                    rx = distance(cx - x, (cy - y) / c);
                    ry = c * rx;
                }
                break;
        }
        if (Array.isArray(gradient.size)) {
            rx = getAbsoluteValue(gradient.size[0], width);
            ry = gradient.size.length === 2 ? getAbsoluteValue(gradient.size[1], height) : rx;
        }
        return [rx, ry];
    };

    var linearGradient = function (tokens) {
        var angle$1 = deg(180);
        var stops = [];
        parseFunctionArgs(tokens).forEach(function (arg, i) {
            if (i === 0) {
                var firstToken = arg[0];
                if (firstToken.type === TokenType.IDENT_TOKEN && firstToken.value === 'to') {
                    angle$1 = parseNamedSide(arg);
                    return;
                }
                else if (isAngle(firstToken)) {
                    angle$1 = angle.parse(firstToken);
                    return;
                }
            }
            var colorStop = parseColorStop(arg);
            stops.push(colorStop);
        });
        return { angle: angle$1, stops: stops, type: CSSImageType.LINEAR_GRADIENT };
    };

    var prefixLinearGradient = function (tokens) {
        var angle$1 = deg(180);
        var stops = [];
        parseFunctionArgs(tokens).forEach(function (arg, i) {
            if (i === 0) {
                var firstToken = arg[0];
                if (firstToken.type === TokenType.IDENT_TOKEN &&
                    ['top', 'left', 'right', 'bottom'].indexOf(firstToken.value) !== -1) {
                    angle$1 = parseNamedSide(arg);
                    return;
                }
                else if (isAngle(firstToken)) {
                    angle$1 = (angle.parse(firstToken) + deg(270)) % deg(360);
                    return;
                }
            }
            var colorStop = parseColorStop(arg);
            stops.push(colorStop);
        });
        return {
            angle: angle$1,
            stops: stops,
            type: CSSImageType.LINEAR_GRADIENT
        };
    };

    var testRangeBounds = function (document) {
        var TEST_HEIGHT = 123;
        if (document.createRange) {
            var range = document.createRange();
            if (range.getBoundingClientRect) {
                var testElement = document.createElement('boundtest');
                testElement.style.height = TEST_HEIGHT + "px";
                testElement.style.display = 'block';
                document.body.appendChild(testElement);
                range.selectNode(testElement);
                var rangeBounds = range.getBoundingClientRect();
                var rangeHeight = Math.round(rangeBounds.height);
                document.body.removeChild(testElement);
                if (rangeHeight === TEST_HEIGHT) {
                    return true;
                }
            }
        }
        return false;
    };
    var testCORS = function () { return typeof new Image().crossOrigin !== 'undefined'; };
    var testResponseType = function () { return typeof new XMLHttpRequest().responseType === 'string'; };
    var testSVG = function (document) {
        var img = new Image();
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        if (!ctx) {
            return false;
        }
        img.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";
        try {
            ctx.drawImage(img, 0, 0);
            canvas.toDataURL();
        }
        catch (e) {
            return false;
        }
        return true;
    };
    var isGreenPixel = function (data) {
        return data[0] === 0 && data[1] === 255 && data[2] === 0 && data[3] === 255;
    };
    var testForeignObject = function (document) {
        var canvas = document.createElement('canvas');
        var size = 100;
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        if (!ctx) {
            return Promise.reject(false);
        }
        ctx.fillStyle = 'rgb(0, 255, 0)';
        ctx.fillRect(0, 0, size, size);
        var img = new Image();
        var greenImageSrc = canvas.toDataURL();
        img.src = greenImageSrc;
        var svg = createForeignObjectSVG(size, size, 0, 0, img);
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, size, size);
        return loadSerializedSVG(svg)
            .then(function (img) {
            ctx.drawImage(img, 0, 0);
            var data = ctx.getImageData(0, 0, size, size).data;
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, size, size);
            var node = document.createElement('div');
            node.style.backgroundImage = "url(" + greenImageSrc + ")";
            node.style.height = size + "px";
            // Firefox 55 does not render inline <img /> tags
            return isGreenPixel(data)
                ? loadSerializedSVG(createForeignObjectSVG(size, size, 0, 0, node))
                : Promise.reject(false);
        })
            .then(function (img) {
            ctx.drawImage(img, 0, 0);
            // Edge does not render background-images
            return isGreenPixel(ctx.getImageData(0, 0, size, size).data);
        })
            .catch(function () { return false; });
    };
    var createForeignObjectSVG = function (width, height, x, y, node) {
        var xmlns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(xmlns, 'svg');
        var foreignObject = document.createElementNS(xmlns, 'foreignObject');
        svg.setAttributeNS(null, 'width', width.toString());
        svg.setAttributeNS(null, 'height', height.toString());
        foreignObject.setAttributeNS(null, 'width', '100%');
        foreignObject.setAttributeNS(null, 'height', '100%');
        foreignObject.setAttributeNS(null, 'x', x.toString());
        foreignObject.setAttributeNS(null, 'y', y.toString());
        foreignObject.setAttributeNS(null, 'externalResourcesRequired', 'true');
        svg.appendChild(foreignObject);
        foreignObject.appendChild(node);
        return svg;
    };
    var loadSerializedSVG = function (svg) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = function () { return resolve(img); };
            img.onerror = reject;
            img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
        });
    };
    var FEATURES = {
        get SUPPORT_RANGE_BOUNDS() {
            var value = testRangeBounds(document);
            Object.defineProperty(FEATURES, 'SUPPORT_RANGE_BOUNDS', { value: value });
            return value;
        },
        get SUPPORT_SVG_DRAWING() {
            var value = testSVG(document);
            Object.defineProperty(FEATURES, 'SUPPORT_SVG_DRAWING', { value: value });
            return value;
        },
        get SUPPORT_FOREIGNOBJECT_DRAWING() {
            var value = typeof Array.from === 'function' && typeof window.fetch === 'function'
                ? testForeignObject(document)
                : Promise.resolve(false);
            Object.defineProperty(FEATURES, 'SUPPORT_FOREIGNOBJECT_DRAWING', { value: value });
            return value;
        },
        get SUPPORT_CORS_IMAGES() {
            var value = testCORS();
            Object.defineProperty(FEATURES, 'SUPPORT_CORS_IMAGES', { value: value });
            return value;
        },
        get SUPPORT_RESPONSE_TYPE() {
            var value = testResponseType();
            Object.defineProperty(FEATURES, 'SUPPORT_RESPONSE_TYPE', { value: value });
            return value;
        },
        get SUPPORT_CORS_XHR() {
            var value = 'withCredentials' in new XMLHttpRequest();
            Object.defineProperty(FEATURES, 'SUPPORT_CORS_XHR', { value: value });
            return value;
        }
    };

    var Logger = /** @class */ (function () {
        function Logger(_a) {
            var id = _a.id, enabled = _a.enabled;
            this.id = id;
            this.enabled = enabled;
            this.start = Date.now();
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Logger.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.enabled) {
                // eslint-disable-next-line no-console
                if (typeof window !== 'undefined' && window.console && typeof console.debug === 'function') {
                    // eslint-disable-next-line no-console
                    console.debug.apply(console, [this.id, this.getTime() + "ms"].concat(args));
                }
                else {
                    this.info.apply(this, args);
                }
            }
        };
        Logger.prototype.getTime = function () {
            return Date.now() - this.start;
        };
        Logger.create = function (options) {
            Logger.instances[options.id] = new Logger(options);
        };
        Logger.destroy = function (id) {
            delete Logger.instances[id];
        };
        Logger.getInstance = function (id) {
            var instance = Logger.instances[id];
            if (typeof instance === 'undefined') {
                throw new Error("No logger instance found with id " + id);
            }
            return instance;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Logger.prototype.info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.enabled) {
                // eslint-disable-next-line no-console
                if (typeof window !== 'undefined' && window.console && typeof console.info === 'function') {
                    // eslint-disable-next-line no-console
                    console.info.apply(console, [this.id, this.getTime() + "ms"].concat(args));
                }
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Logger.prototype.error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (this.enabled) {
                // eslint-disable-next-line no-console
                if (typeof window !== 'undefined' && window.console && typeof console.error === 'function') {
                    // eslint-disable-next-line no-console
                    console.error.apply(console, [this.id, this.getTime() + "ms"].concat(args));
                }
                else {
                    this.info.apply(this, args);
                }
            }
        };
        Logger.instances = {};
        return Logger;
    }());

    var CacheStorage = /** @class */ (function () {
        function CacheStorage() {
        }
        CacheStorage.create = function (name, options) {
            return (CacheStorage._caches[name] = new Cache(name, options));
        };
        CacheStorage.destroy = function (name) {
            delete CacheStorage._caches[name];
        };
        CacheStorage.open = function (name) {
            var cache = CacheStorage._caches[name];
            if (typeof cache !== 'undefined') {
                return cache;
            }
            throw new Error("Cache with key \"" + name + "\" not found");
        };
        CacheStorage.getOrigin = function (url) {
            var link = CacheStorage._link;
            if (!link) {
                return 'about:blank';
            }
            link.href = url;
            link.href = link.href; // IE9, LOL! - http://jsfiddle.net/niklasvh/2e48b/
            return link.protocol + link.hostname + link.port;
        };
        CacheStorage.isSameOrigin = function (src) {
            return CacheStorage.getOrigin(src) === CacheStorage._origin;
        };
        CacheStorage.setContext = function (window) {
            CacheStorage._link = window.document.createElement('a');
            CacheStorage._origin = CacheStorage.getOrigin(window.location.href);
        };
        CacheStorage.getInstance = function () {
            var current = CacheStorage._current;
            if (current === null) {
                throw new Error("No cache instance attached");
            }
            return current;
        };
        CacheStorage.attachInstance = function (cache) {
            CacheStorage._current = cache;
        };
        CacheStorage.detachInstance = function () {
            CacheStorage._current = null;
        };
        CacheStorage._caches = {};
        CacheStorage._origin = 'about:blank';
        CacheStorage._current = null;
        return CacheStorage;
    }());
    var Cache = /** @class */ (function () {
        function Cache(id, options) {
            this.id = id;
            this._options = options;
            this._cache = {};
        }
        Cache.prototype.addImage = function (src) {
            var result = Promise.resolve();
            if (this.has(src)) {
                return result;
            }
            if (isBlobImage(src) || isRenderable(src)) {
                this._cache[src] = this.loadImage(src);
                return result;
            }
            return result;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cache.prototype.match = function (src) {
            return this._cache[src];
        };
        Cache.prototype.loadImage = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var isSameOrigin, useCORS, useProxy, src;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            isSameOrigin = CacheStorage.isSameOrigin(key);
                            useCORS = !isInlineImage(key) && this._options.useCORS === true && FEATURES.SUPPORT_CORS_IMAGES && !isSameOrigin;
                            useProxy = !isInlineImage(key) &&
                                !isSameOrigin &&
                                typeof this._options.proxy === 'string' &&
                                FEATURES.SUPPORT_CORS_XHR &&
                                !useCORS;
                            if (!isSameOrigin && this._options.allowTaint === false && !isInlineImage(key) && !useProxy && !useCORS) {
                                return [2 /*return*/];
                            }
                            src = key;
                            if (!useProxy) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.proxy(src)];
                        case 1:
                            src = _a.sent();
                            _a.label = 2;
                        case 2:
                            Logger.getInstance(this.id).debug("Added image " + key.substring(0, 256));
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    var img = new Image();
                                    img.onload = function () { return resolve(img); };
                                    img.onerror = reject;
                                    //ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous
                                    if (isInlineBase64Image(src) || useCORS) {
                                        img.crossOrigin = 'anonymous';
                                    }
                                    img.src = src;
                                    if (img.complete === true) {
                                        // Inline XML images may fail to parse, throwing an Error later on
                                        setTimeout(function () { return resolve(img); }, 500);
                                    }
                                    if (_this._options.imageTimeout > 0) {
                                        setTimeout(function () { return reject("Timed out (" + _this._options.imageTimeout + "ms) loading image"); }, _this._options.imageTimeout);
                                    }
                                })];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        Cache.prototype.has = function (key) {
            return typeof this._cache[key] !== 'undefined';
        };
        Cache.prototype.keys = function () {
            return Promise.resolve(Object.keys(this._cache));
        };
        Cache.prototype.proxy = function (src) {
            var _this = this;
            var proxy = this._options.proxy;
            if (!proxy) {
                throw new Error('No proxy defined');
            }
            var key = src.substring(0, 256);
            return new Promise(function (resolve, reject) {
                var responseType = FEATURES.SUPPORT_RESPONSE_TYPE ? 'blob' : 'text';
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        if (responseType === 'text') {
                            resolve(xhr.response);
                        }
                        else {
                            var reader_1 = new FileReader();
                            reader_1.addEventListener('load', function () { return resolve(reader_1.result); }, false);
                            reader_1.addEventListener('error', function (e) { return reject(e); }, false);
                            reader_1.readAsDataURL(xhr.response);
                        }
                    }
                    else {
                        reject("Failed to proxy resource " + key + " with status code " + xhr.status);
                    }
                };
                xhr.onerror = reject;
                xhr.open('GET', proxy + "?url=" + encodeURIComponent(src) + "&responseType=" + responseType);
                if (responseType !== 'text' && xhr instanceof XMLHttpRequest) {
                    xhr.responseType = responseType;
                }
                if (_this._options.imageTimeout) {
                    var timeout_1 = _this._options.imageTimeout;
                    xhr.timeout = timeout_1;
                    xhr.ontimeout = function () { return reject("Timed out (" + timeout_1 + "ms) proxying " + key); };
                }
                xhr.send();
            });
        };
        return Cache;
    }());
    var INLINE_SVG = /^data:image\/svg\+xml/i;
    var INLINE_BASE64 = /^data:image\/.*;base64,/i;
    var INLINE_IMG = /^data:image\/.*/i;
    var isRenderable = function (src) { return FEATURES.SUPPORT_SVG_DRAWING || !isSVG(src); };
    var isInlineImage = function (src) { return INLINE_IMG.test(src); };
    var isInlineBase64Image = function (src) { return INLINE_BASE64.test(src); };
    var isBlobImage = function (src) { return src.substr(0, 4) === 'blob'; };
    var isSVG = function (src) { return src.substr(-3).toLowerCase() === 'svg' || INLINE_SVG.test(src); };

    var webkitGradient = function (tokens) {
        var angle = deg(180);
        var stops = [];
        var type = CSSImageType.LINEAR_GRADIENT;
        var shape = CSSRadialShape.CIRCLE;
        var size = CSSRadialExtent.FARTHEST_CORNER;
        var position = [];
        parseFunctionArgs(tokens).forEach(function (arg, i) {
            var firstToken = arg[0];
            if (i === 0) {
                if (isIdentToken(firstToken) && firstToken.value === 'linear') {
                    type = CSSImageType.LINEAR_GRADIENT;
                    return;
                }
                else if (isIdentToken(firstToken) && firstToken.value === 'radial') {
                    type = CSSImageType.RADIAL_GRADIENT;
                    return;
                }
            }
            if (firstToken.type === TokenType.FUNCTION) {
                if (firstToken.name === 'from') {
                    var color$1 = color.parse(firstToken.values[0]);
                    stops.push({ stop: ZERO_LENGTH, color: color$1 });
                }
                else if (firstToken.name === 'to') {
                    var color$1 = color.parse(firstToken.values[0]);
                    stops.push({ stop: HUNDRED_PERCENT, color: color$1 });
                }
                else if (firstToken.name === 'color-stop') {
                    var values = firstToken.values.filter(nonFunctionArgSeparator);
                    if (values.length === 2) {
                        var color$1 = color.parse(values[1]);
                        var stop_1 = values[0];
                        if (isNumberToken(stop_1)) {
                            stops.push({
                                stop: { type: TokenType.PERCENTAGE_TOKEN, number: stop_1.number * 100, flags: stop_1.flags },
                                color: color$1
                            });
                        }
                    }
                }
            }
        });
        return type === CSSImageType.LINEAR_GRADIENT
            ? {
                angle: (angle + deg(180)) % deg(360),
                stops: stops,
                type: type
            }
            : { size: size, shape: shape, stops: stops, position: position, type: type };
    };

    var CLOSEST_SIDE = 'closest-side';
    var FARTHEST_SIDE = 'farthest-side';
    var CLOSEST_CORNER = 'closest-corner';
    var FARTHEST_CORNER = 'farthest-corner';
    var CIRCLE = 'circle';
    var ELLIPSE = 'ellipse';
    var COVER = 'cover';
    var CONTAIN = 'contain';
    var radialGradient = function (tokens) {
        var shape = CSSRadialShape.CIRCLE;
        var size = CSSRadialExtent.FARTHEST_CORNER;
        var stops = [];
        var position = [];
        parseFunctionArgs(tokens).forEach(function (arg, i) {
            var isColorStop = true;
            if (i === 0) {
                var isAtPosition_1 = false;
                isColorStop = arg.reduce(function (acc, token) {
                    if (isAtPosition_1) {
                        if (isIdentToken(token)) {
                            switch (token.value) {
                                case 'center':
                                    position.push(FIFTY_PERCENT);
                                    return acc;
                                case 'top':
                                case 'left':
                                    position.push(ZERO_LENGTH);
                                    return acc;
                                case 'right':
                                case 'bottom':
                                    position.push(HUNDRED_PERCENT);
                                    return acc;
                            }
                        }
                        else if (isLengthPercentage(token) || isLength(token)) {
                            position.push(token);
                        }
                    }
                    else if (isIdentToken(token)) {
                        switch (token.value) {
                            case CIRCLE:
                                shape = CSSRadialShape.CIRCLE;
                                return false;
                            case ELLIPSE:
                                shape = CSSRadialShape.ELLIPSE;
                                return false;
                            case 'at':
                                isAtPosition_1 = true;
                                return false;
                            case CLOSEST_SIDE:
                                size = CSSRadialExtent.CLOSEST_SIDE;
                                return false;
                            case COVER:
                            case FARTHEST_SIDE:
                                size = CSSRadialExtent.FARTHEST_SIDE;
                                return false;
                            case CONTAIN:
                            case CLOSEST_CORNER:
                                size = CSSRadialExtent.CLOSEST_CORNER;
                                return false;
                            case FARTHEST_CORNER:
                                size = CSSRadialExtent.FARTHEST_CORNER;
                                return false;
                        }
                    }
                    else if (isLength(token) || isLengthPercentage(token)) {
                        if (!Array.isArray(size)) {
                            size = [];
                        }
                        size.push(token);
                        return false;
                    }
                    return acc;
                }, isColorStop);
            }
            if (isColorStop) {
                var colorStop = parseColorStop(arg);
                stops.push(colorStop);
            }
        });
        return { size: size, shape: shape, stops: stops, position: position, type: CSSImageType.RADIAL_GRADIENT };
    };

    var prefixRadialGradient = function (tokens) {
        var shape = CSSRadialShape.CIRCLE;
        var size = CSSRadialExtent.FARTHEST_CORNER;
        var stops = [];
        var position = [];
        parseFunctionArgs(tokens).forEach(function (arg, i) {
            var isColorStop = true;
            if (i === 0) {
                isColorStop = arg.reduce(function (acc, token) {
                    if (isIdentToken(token)) {
                        switch (token.value) {
                            case 'center':
                                position.push(FIFTY_PERCENT);
                                return false;
                            case 'top':
                            case 'left':
                                position.push(ZERO_LENGTH);
                                return false;
                            case 'right':
                            case 'bottom':
                                position.push(HUNDRED_PERCENT);
                                return false;
                        }
                    }
                    else if (isLengthPercentage(token) || isLength(token)) {
                        position.push(token);
                        return false;
                    }
                    return acc;
                }, isColorStop);
            }
            else if (i === 1) {
                isColorStop = arg.reduce(function (acc, token) {
                    if (isIdentToken(token)) {
                        switch (token.value) {
                            case CIRCLE:
                                shape = CSSRadialShape.CIRCLE;
                                return false;
                            case ELLIPSE:
                                shape = CSSRadialShape.ELLIPSE;
                                return false;
                            case CONTAIN:
                            case CLOSEST_SIDE:
                                size = CSSRadialExtent.CLOSEST_SIDE;
                                return false;
                            case FARTHEST_SIDE:
                                size = CSSRadialExtent.FARTHEST_SIDE;
                                return false;
                            case CLOSEST_CORNER:
                                size = CSSRadialExtent.CLOSEST_CORNER;
                                return false;
                            case COVER:
                            case FARTHEST_CORNER:
                                size = CSSRadialExtent.FARTHEST_CORNER;
                                return false;
                        }
                    }
                    else if (isLength(token) || isLengthPercentage(token)) {
                        if (!Array.isArray(size)) {
                            size = [];
                        }
                        size.push(token);
                        return false;
                    }
                    return acc;
                }, isColorStop);
            }
            if (isColorStop) {
                var colorStop = parseColorStop(arg);
                stops.push(colorStop);
            }
        });
        return { size: size, shape: shape, stops: stops, position: position, type: CSSImageType.RADIAL_GRADIENT };
    };

    var CSSImageType;
    (function (CSSImageType) {
        CSSImageType[CSSImageType["URL"] = 0] = "URL";
        CSSImageType[CSSImageType["LINEAR_GRADIENT"] = 1] = "LINEAR_GRADIENT";
        CSSImageType[CSSImageType["RADIAL_GRADIENT"] = 2] = "RADIAL_GRADIENT";
    })(CSSImageType || (CSSImageType = {}));
    var isLinearGradient = function (background) {
        return background.type === CSSImageType.LINEAR_GRADIENT;
    };
    var isRadialGradient = function (background) {
        return background.type === CSSImageType.RADIAL_GRADIENT;
    };
    var CSSRadialShape;
    (function (CSSRadialShape) {
        CSSRadialShape[CSSRadialShape["CIRCLE"] = 0] = "CIRCLE";
        CSSRadialShape[CSSRadialShape["ELLIPSE"] = 1] = "ELLIPSE";
    })(CSSRadialShape || (CSSRadialShape = {}));
    var CSSRadialExtent;
    (function (CSSRadialExtent) {
        CSSRadialExtent[CSSRadialExtent["CLOSEST_SIDE"] = 0] = "CLOSEST_SIDE";
        CSSRadialExtent[CSSRadialExtent["FARTHEST_SIDE"] = 1] = "FARTHEST_SIDE";
        CSSRadialExtent[CSSRadialExtent["CLOSEST_CORNER"] = 2] = "CLOSEST_CORNER";
        CSSRadialExtent[CSSRadialExtent["FARTHEST_CORNER"] = 3] = "FARTHEST_CORNER";
    })(CSSRadialExtent || (CSSRadialExtent = {}));
    var image = {
        name: 'image',
        parse: function (value) {
            if (value.type === TokenType.URL_TOKEN) {
                var image_1 = { url: value.value, type: CSSImageType.URL };
                CacheStorage.getInstance().addImage(value.value);
                return image_1;
            }
            if (value.type === TokenType.FUNCTION) {
                var imageFunction = SUPPORTED_IMAGE_FUNCTIONS[value.name];
                if (typeof imageFunction === 'undefined') {
                    throw new Error("Attempting to parse an unsupported image function \"" + value.name + "\"");
                }
                return imageFunction(value.values);
            }
            throw new Error("Unsupported image type");
        }
    };
    function isSupportedImage(value) {
        return value.type !== TokenType.FUNCTION || SUPPORTED_IMAGE_FUNCTIONS[value.name];
    }
    var SUPPORTED_IMAGE_FUNCTIONS = {
        'linear-gradient': linearGradient,
        '-moz-linear-gradient': prefixLinearGradient,
        '-ms-linear-gradient': prefixLinearGradient,
        '-o-linear-gradient': prefixLinearGradient,
        '-webkit-linear-gradient': prefixLinearGradient,
        'radial-gradient': radialGradient,
        '-moz-radial-gradient': prefixRadialGradient,
        '-ms-radial-gradient': prefixRadialGradient,
        '-o-radial-gradient': prefixRadialGradient,
        '-webkit-radial-gradient': prefixRadialGradient,
        '-webkit-gradient': webkitGradient
    };

    var backgroundImage = {
        name: 'background-image',
        initialValue: 'none',
        type: PropertyDescriptorParsingType.LIST,
        prefix: false,
        parse: function (tokens) {
            if (tokens.length === 0) {
                return [];
            }
            var first = tokens[0];
            if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
                return [];
            }
            return tokens.filter(function (value) { return nonFunctionArgSeparator(value) && isSupportedImage(value); }).map(image.parse);
        }
    };

    var backgroundOrigin = {
        name: 'background-origin',
        initialValue: 'border-box',
        prefix: false,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            return tokens.map(function (token) {
                if (isIdentToken(token)) {
                    switch (token.value) {
                        case 'padding-box':
                            return 1 /* PADDING_BOX */;
                        case 'content-box':
                            return 2 /* CONTENT_BOX */;
                    }
                }
                return 0 /* BORDER_BOX */;
            });
        }
    };

    var backgroundPosition = {
        name: 'background-position',
        initialValue: '0% 0%',
        type: PropertyDescriptorParsingType.LIST,
        prefix: false,
        parse: function (tokens) {
            return parseFunctionArgs(tokens)
                .map(function (values) { return values.filter(isLengthPercentage); })
                .map(parseLengthPercentageTuple);
        }
    };

    var BACKGROUND_REPEAT;
    (function (BACKGROUND_REPEAT) {
        BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT"] = 0] = "REPEAT";
        BACKGROUND_REPEAT[BACKGROUND_REPEAT["NO_REPEAT"] = 1] = "NO_REPEAT";
        BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT_X"] = 2] = "REPEAT_X";
        BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT_Y"] = 3] = "REPEAT_Y";
    })(BACKGROUND_REPEAT || (BACKGROUND_REPEAT = {}));
    var backgroundRepeat = {
        name: 'background-repeat',
        initialValue: 'repeat',
        prefix: false,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            return parseFunctionArgs(tokens)
                .map(function (values) {
                return values
                    .filter(isIdentToken)
                    .map(function (token) { return token.value; })
                    .join(' ');
            })
                .map(parseBackgroundRepeat);
        }
    };
    var parseBackgroundRepeat = function (value) {
        switch (value) {
            case 'no-repeat':
                return BACKGROUND_REPEAT.NO_REPEAT;
            case 'repeat-x':
            case 'repeat no-repeat':
                return BACKGROUND_REPEAT.REPEAT_X;
            case 'repeat-y':
            case 'no-repeat repeat':
                return BACKGROUND_REPEAT.REPEAT_Y;
            case 'repeat':
            default:
                return BACKGROUND_REPEAT.REPEAT;
        }
    };

    var BACKGROUND_SIZE;
    (function (BACKGROUND_SIZE) {
        BACKGROUND_SIZE["AUTO"] = "auto";
        BACKGROUND_SIZE["CONTAIN"] = "contain";
        BACKGROUND_SIZE["COVER"] = "cover";
    })(BACKGROUND_SIZE || (BACKGROUND_SIZE = {}));
    var backgroundSize = {
        name: 'background-size',
        initialValue: '0',
        prefix: false,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            return parseFunctionArgs(tokens).map(function (values) { return values.filter(isBackgroundSizeInfoToken); });
        }
    };
    var isBackgroundSizeInfoToken = function (value) {
        return isIdentToken(value) || isLengthPercentage(value);
    };

    var borderColorForSide = function (side) { return ({
        name: "border-" + side + "-color",
        initialValue: 'transparent',
        prefix: false,
        type: PropertyDescriptorParsingType.TYPE_VALUE,
        format: 'color'
    }); };
    var borderTopColor = borderColorForSide('top');
    var borderRightColor = borderColorForSide('right');
    var borderBottomColor = borderColorForSide('bottom');
    var borderLeftColor = borderColorForSide('left');

    var borderRadiusForSide = function (side) { return ({
        name: "border-radius-" + side,
        initialValue: '0 0',
        prefix: false,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) { return parseLengthPercentageTuple(tokens.filter(isLengthPercentage)); }
    }); };
    var borderTopLeftRadius = borderRadiusForSide('top-left');
    var borderTopRightRadius = borderRadiusForSide('top-right');
    var borderBottomRightRadius = borderRadiusForSide('bottom-right');
    var borderBottomLeftRadius = borderRadiusForSide('bottom-left');

    var BORDER_STYLE;
    (function (BORDER_STYLE) {
        BORDER_STYLE[BORDER_STYLE["NONE"] = 0] = "NONE";
        BORDER_STYLE[BORDER_STYLE["SOLID"] = 1] = "SOLID";
    })(BORDER_STYLE || (BORDER_STYLE = {}));
    var borderStyleForSide = function (side) { return ({
        name: "border-" + side + "-style",
        initialValue: 'solid',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (style) {
            switch (style) {
                case 'none':
                    return BORDER_STYLE.NONE;
            }
            return BORDER_STYLE.SOLID;
        }
    }); };
    var borderTopStyle = borderStyleForSide('top');
    var borderRightStyle = borderStyleForSide('right');
    var borderBottomStyle = borderStyleForSide('bottom');
    var borderLeftStyle = borderStyleForSide('left');

    var borderWidthForSide = function (side) { return ({
        name: "border-" + side + "-width",
        initialValue: '0',
        type: PropertyDescriptorParsingType.VALUE,
        prefix: false,
        parse: function (token) {
            if (isDimensionToken(token)) {
                return token.number;
            }
            return 0;
        }
    }); };
    var borderTopWidth = borderWidthForSide('top');
    var borderRightWidth = borderWidthForSide('right');
    var borderBottomWidth = borderWidthForSide('bottom');
    var borderLeftWidth = borderWidthForSide('left');

    var color$1 = {
        name: "color",
        initialValue: 'transparent',
        prefix: false,
        type: PropertyDescriptorParsingType.TYPE_VALUE,
        format: 'color'
    };

    var display = {
        name: 'display',
        initialValue: 'inline-block',
        prefix: false,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            return tokens.filter(isIdentToken).reduce(function (bit, token) {
                return bit | parseDisplayValue(token.value);
            }, 0 /* NONE */);
        }
    };
    var parseDisplayValue = function (display) {
        switch (display) {
            case 'block':
                return 2 /* BLOCK */;
            case 'inline':
                return 4 /* INLINE */;
            case 'run-in':
                return 8 /* RUN_IN */;
            case 'flow':
                return 16 /* FLOW */;
            case 'flow-root':
                return 32 /* FLOW_ROOT */;
            case 'table':
                return 64 /* TABLE */;
            case 'flex':
            case '-webkit-flex':
                return 128 /* FLEX */;
            case 'grid':
            case '-ms-grid':
                return 256 /* GRID */;
            case 'ruby':
                return 512 /* RUBY */;
            case 'subgrid':
                return 1024 /* SUBGRID */;
            case 'list-item':
                return 2048 /* LIST_ITEM */;
            case 'table-row-group':
                return 4096 /* TABLE_ROW_GROUP */;
            case 'table-header-group':
                return 8192 /* TABLE_HEADER_GROUP */;
            case 'table-footer-group':
                return 16384 /* TABLE_FOOTER_GROUP */;
            case 'table-row':
                return 32768 /* TABLE_ROW */;
            case 'table-cell':
                return 65536 /* TABLE_CELL */;
            case 'table-column-group':
                return 131072 /* TABLE_COLUMN_GROUP */;
            case 'table-column':
                return 262144 /* TABLE_COLUMN */;
            case 'table-caption':
                return 524288 /* TABLE_CAPTION */;
            case 'ruby-base':
                return 1048576 /* RUBY_BASE */;
            case 'ruby-text':
                return 2097152 /* RUBY_TEXT */;
            case 'ruby-base-container':
                return 4194304 /* RUBY_BASE_CONTAINER */;
            case 'ruby-text-container':
                return 8388608 /* RUBY_TEXT_CONTAINER */;
            case 'contents':
                return 16777216 /* CONTENTS */;
            case 'inline-block':
                return 33554432 /* INLINE_BLOCK */;
            case 'inline-list-item':
                return 67108864 /* INLINE_LIST_ITEM */;
            case 'inline-table':
                return 134217728 /* INLINE_TABLE */;
            case 'inline-flex':
                return 268435456 /* INLINE_FLEX */;
            case 'inline-grid':
                return 536870912 /* INLINE_GRID */;
        }
        return 0 /* NONE */;
    };

    var FLOAT;
    (function (FLOAT) {
        FLOAT[FLOAT["NONE"] = 0] = "NONE";
        FLOAT[FLOAT["LEFT"] = 1] = "LEFT";
        FLOAT[FLOAT["RIGHT"] = 2] = "RIGHT";
        FLOAT[FLOAT["INLINE_START"] = 3] = "INLINE_START";
        FLOAT[FLOAT["INLINE_END"] = 4] = "INLINE_END";
    })(FLOAT || (FLOAT = {}));
    var float = {
        name: 'float',
        initialValue: 'none',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (float) {
            switch (float) {
                case 'left':
                    return FLOAT.LEFT;
                case 'right':
                    return FLOAT.RIGHT;
                case 'inline-start':
                    return FLOAT.INLINE_START;
                case 'inline-end':
                    return FLOAT.INLINE_END;
            }
            return FLOAT.NONE;
        }
    };

    var letterSpacing = {
        name: 'letter-spacing',
        initialValue: '0',
        prefix: false,
        type: PropertyDescriptorParsingType.VALUE,
        parse: function (token) {
            if (token.type === TokenType.IDENT_TOKEN && token.value === 'normal') {
                return 0;
            }
            if (token.type === TokenType.NUMBER_TOKEN) {
                return token.number;
            }
            if (token.type === TokenType.DIMENSION_TOKEN) {
                return token.number;
            }
            return 0;
        }
    };

    var LINE_BREAK;
    (function (LINE_BREAK) {
        LINE_BREAK["NORMAL"] = "normal";
        LINE_BREAK["STRICT"] = "strict";
    })(LINE_BREAK || (LINE_BREAK = {}));
    var lineBreak = {
        name: 'line-break',
        initialValue: 'normal',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (lineBreak) {
            switch (lineBreak) {
                case 'strict':
                    return LINE_BREAK.STRICT;
                case 'normal':
                default:
                    return LINE_BREAK.NORMAL;
            }
        }
    };

    var lineHeight = {
        name: 'line-height',
        initialValue: 'normal',
        prefix: false,
        type: PropertyDescriptorParsingType.TOKEN_VALUE
    };
    var computeLineHeight = function (token, fontSize) {
        if (isIdentToken(token) && token.value === 'normal') {
            return 1.2 * fontSize;
        }
        else if (token.type === TokenType.NUMBER_TOKEN) {
            return fontSize * token.number;
        }
        else if (isLengthPercentage(token)) {
            return getAbsoluteValue(token, fontSize);
        }
        return fontSize;
    };

    var listStyleImage = {
        name: 'list-style-image',
        initialValue: 'none',
        type: PropertyDescriptorParsingType.VALUE,
        prefix: false,
        parse: function (token) {
            if (token.type === TokenType.IDENT_TOKEN && token.value === 'none') {
                return null;
            }
            return image.parse(token);
        }
    };

    var LIST_STYLE_POSITION;
    (function (LIST_STYLE_POSITION) {
        LIST_STYLE_POSITION[LIST_STYLE_POSITION["INSIDE"] = 0] = "INSIDE";
        LIST_STYLE_POSITION[LIST_STYLE_POSITION["OUTSIDE"] = 1] = "OUTSIDE";
    })(LIST_STYLE_POSITION || (LIST_STYLE_POSITION = {}));
    var listStylePosition = {
        name: 'list-style-position',
        initialValue: 'outside',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (position) {
            switch (position) {
                case 'inside':
                    return LIST_STYLE_POSITION.INSIDE;
                case 'outside':
                default:
                    return LIST_STYLE_POSITION.OUTSIDE;
            }
        }
    };

    var LIST_STYLE_TYPE;
    (function (LIST_STYLE_TYPE) {
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["NONE"] = -1] = "NONE";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["DISC"] = 0] = "DISC";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["CIRCLE"] = 1] = "CIRCLE";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["SQUARE"] = 2] = "SQUARE";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["DECIMAL"] = 3] = "DECIMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_DECIMAL"] = 4] = "CJK_DECIMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["DECIMAL_LEADING_ZERO"] = 5] = "DECIMAL_LEADING_ZERO";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_ROMAN"] = 6] = "LOWER_ROMAN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["UPPER_ROMAN"] = 7] = "UPPER_ROMAN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_GREEK"] = 8] = "LOWER_GREEK";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_ALPHA"] = 9] = "LOWER_ALPHA";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["UPPER_ALPHA"] = 10] = "UPPER_ALPHA";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["ARABIC_INDIC"] = 11] = "ARABIC_INDIC";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["ARMENIAN"] = 12] = "ARMENIAN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["BENGALI"] = 13] = "BENGALI";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["CAMBODIAN"] = 14] = "CAMBODIAN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_EARTHLY_BRANCH"] = 15] = "CJK_EARTHLY_BRANCH";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_HEAVENLY_STEM"] = 16] = "CJK_HEAVENLY_STEM";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_IDEOGRAPHIC"] = 17] = "CJK_IDEOGRAPHIC";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["DEVANAGARI"] = 18] = "DEVANAGARI";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["ETHIOPIC_NUMERIC"] = 19] = "ETHIOPIC_NUMERIC";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["GEORGIAN"] = 20] = "GEORGIAN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["GUJARATI"] = 21] = "GUJARATI";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["GURMUKHI"] = 22] = "GURMUKHI";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["HEBREW"] = 22] = "HEBREW";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["HIRAGANA"] = 23] = "HIRAGANA";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["HIRAGANA_IROHA"] = 24] = "HIRAGANA_IROHA";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["JAPANESE_FORMAL"] = 25] = "JAPANESE_FORMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["JAPANESE_INFORMAL"] = 26] = "JAPANESE_INFORMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["KANNADA"] = 27] = "KANNADA";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["KATAKANA"] = 28] = "KATAKANA";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["KATAKANA_IROHA"] = 29] = "KATAKANA_IROHA";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["KHMER"] = 30] = "KHMER";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["KOREAN_HANGUL_FORMAL"] = 31] = "KOREAN_HANGUL_FORMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["KOREAN_HANJA_FORMAL"] = 32] = "KOREAN_HANJA_FORMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["KOREAN_HANJA_INFORMAL"] = 33] = "KOREAN_HANJA_INFORMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["LAO"] = 34] = "LAO";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_ARMENIAN"] = 35] = "LOWER_ARMENIAN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["MALAYALAM"] = 36] = "MALAYALAM";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["MONGOLIAN"] = 37] = "MONGOLIAN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["MYANMAR"] = 38] = "MYANMAR";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["ORIYA"] = 39] = "ORIYA";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["PERSIAN"] = 40] = "PERSIAN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["SIMP_CHINESE_FORMAL"] = 41] = "SIMP_CHINESE_FORMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["SIMP_CHINESE_INFORMAL"] = 42] = "SIMP_CHINESE_INFORMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["TAMIL"] = 43] = "TAMIL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["TELUGU"] = 44] = "TELUGU";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["THAI"] = 45] = "THAI";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["TIBETAN"] = 46] = "TIBETAN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["TRAD_CHINESE_FORMAL"] = 47] = "TRAD_CHINESE_FORMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["TRAD_CHINESE_INFORMAL"] = 48] = "TRAD_CHINESE_INFORMAL";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["UPPER_ARMENIAN"] = 49] = "UPPER_ARMENIAN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["DISCLOSURE_OPEN"] = 50] = "DISCLOSURE_OPEN";
        LIST_STYLE_TYPE[LIST_STYLE_TYPE["DISCLOSURE_CLOSED"] = 51] = "DISCLOSURE_CLOSED";
    })(LIST_STYLE_TYPE || (LIST_STYLE_TYPE = {}));
    var listStyleType = {
        name: 'list-style-type',
        initialValue: 'none',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (type) {
            switch (type) {
                case 'disc':
                    return LIST_STYLE_TYPE.DISC;
                case 'circle':
                    return LIST_STYLE_TYPE.CIRCLE;
                case 'square':
                    return LIST_STYLE_TYPE.SQUARE;
                case 'decimal':
                    return LIST_STYLE_TYPE.DECIMAL;
                case 'cjk-decimal':
                    return LIST_STYLE_TYPE.CJK_DECIMAL;
                case 'decimal-leading-zero':
                    return LIST_STYLE_TYPE.DECIMAL_LEADING_ZERO;
                case 'lower-roman':
                    return LIST_STYLE_TYPE.LOWER_ROMAN;
                case 'upper-roman':
                    return LIST_STYLE_TYPE.UPPER_ROMAN;
                case 'lower-greek':
                    return LIST_STYLE_TYPE.LOWER_GREEK;
                case 'lower-alpha':
                    return LIST_STYLE_TYPE.LOWER_ALPHA;
                case 'upper-alpha':
                    return LIST_STYLE_TYPE.UPPER_ALPHA;
                case 'arabic-indic':
                    return LIST_STYLE_TYPE.ARABIC_INDIC;
                case 'armenian':
                    return LIST_STYLE_TYPE.ARMENIAN;
                case 'bengali':
                    return LIST_STYLE_TYPE.BENGALI;
                case 'cambodian':
                    return LIST_STYLE_TYPE.CAMBODIAN;
                case 'cjk-earthly-branch':
                    return LIST_STYLE_TYPE.CJK_EARTHLY_BRANCH;
                case 'cjk-heavenly-stem':
                    return LIST_STYLE_TYPE.CJK_HEAVENLY_STEM;
                case 'cjk-ideographic':
                    return LIST_STYLE_TYPE.CJK_IDEOGRAPHIC;
                case 'devanagari':
                    return LIST_STYLE_TYPE.DEVANAGARI;
                case 'ethiopic-numeric':
                    return LIST_STYLE_TYPE.ETHIOPIC_NUMERIC;
                case 'georgian':
                    return LIST_STYLE_TYPE.GEORGIAN;
                case 'gujarati':
                    return LIST_STYLE_TYPE.GUJARATI;
                case 'gurmukhi':
                    return LIST_STYLE_TYPE.GURMUKHI;
                case 'hebrew':
                    return LIST_STYLE_TYPE.HEBREW;
                case 'hiragana':
                    return LIST_STYLE_TYPE.HIRAGANA;
                case 'hiragana-iroha':
                    return LIST_STYLE_TYPE.HIRAGANA_IROHA;
                case 'japanese-formal':
                    return LIST_STYLE_TYPE.JAPANESE_FORMAL;
                case 'japanese-informal':
                    return LIST_STYLE_TYPE.JAPANESE_INFORMAL;
                case 'kannada':
                    return LIST_STYLE_TYPE.KANNADA;
                case 'katakana':
                    return LIST_STYLE_TYPE.KATAKANA;
                case 'katakana-iroha':
                    return LIST_STYLE_TYPE.KATAKANA_IROHA;
                case 'khmer':
                    return LIST_STYLE_TYPE.KHMER;
                case 'korean-hangul-formal':
                    return LIST_STYLE_TYPE.KOREAN_HANGUL_FORMAL;
                case 'korean-hanja-formal':
                    return LIST_STYLE_TYPE.KOREAN_HANJA_FORMAL;
                case 'korean-hanja-informal':
                    return LIST_STYLE_TYPE.KOREAN_HANJA_INFORMAL;
                case 'lao':
                    return LIST_STYLE_TYPE.LAO;
                case 'lower-armenian':
                    return LIST_STYLE_TYPE.LOWER_ARMENIAN;
                case 'malayalam':
                    return LIST_STYLE_TYPE.MALAYALAM;
                case 'mongolian':
                    return LIST_STYLE_TYPE.MONGOLIAN;
                case 'myanmar':
                    return LIST_STYLE_TYPE.MYANMAR;
                case 'oriya':
                    return LIST_STYLE_TYPE.ORIYA;
                case 'persian':
                    return LIST_STYLE_TYPE.PERSIAN;
                case 'simp-chinese-formal':
                    return LIST_STYLE_TYPE.SIMP_CHINESE_FORMAL;
                case 'simp-chinese-informal':
                    return LIST_STYLE_TYPE.SIMP_CHINESE_INFORMAL;
                case 'tamil':
                    return LIST_STYLE_TYPE.TAMIL;
                case 'telugu':
                    return LIST_STYLE_TYPE.TELUGU;
                case 'thai':
                    return LIST_STYLE_TYPE.THAI;
                case 'tibetan':
                    return LIST_STYLE_TYPE.TIBETAN;
                case 'trad-chinese-formal':
                    return LIST_STYLE_TYPE.TRAD_CHINESE_FORMAL;
                case 'trad-chinese-informal':
                    return LIST_STYLE_TYPE.TRAD_CHINESE_INFORMAL;
                case 'upper-armenian':
                    return LIST_STYLE_TYPE.UPPER_ARMENIAN;
                case 'disclosure-open':
                    return LIST_STYLE_TYPE.DISCLOSURE_OPEN;
                case 'disclosure-closed':
                    return LIST_STYLE_TYPE.DISCLOSURE_CLOSED;
                case 'none':
                default:
                    return LIST_STYLE_TYPE.NONE;
            }
        }
    };

    var marginForSide = function (side) { return ({
        name: "margin-" + side,
        initialValue: '0',
        prefix: false,
        type: PropertyDescriptorParsingType.TOKEN_VALUE
    }); };
    var marginTop = marginForSide('top');
    var marginRight = marginForSide('right');
    var marginBottom = marginForSide('bottom');
    var marginLeft = marginForSide('left');

    var OVERFLOW;
    (function (OVERFLOW) {
        OVERFLOW[OVERFLOW["VISIBLE"] = 0] = "VISIBLE";
        OVERFLOW[OVERFLOW["HIDDEN"] = 1] = "HIDDEN";
        OVERFLOW[OVERFLOW["SCROLL"] = 2] = "SCROLL";
        OVERFLOW[OVERFLOW["AUTO"] = 3] = "AUTO";
    })(OVERFLOW || (OVERFLOW = {}));
    var overflow = {
        name: 'overflow',
        initialValue: 'visible',
        prefix: false,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            return tokens.filter(isIdentToken).map(function (overflow) {
                switch (overflow.value) {
                    case 'hidden':
                        return OVERFLOW.HIDDEN;
                    case 'scroll':
                        return OVERFLOW.SCROLL;
                    case 'auto':
                        return OVERFLOW.AUTO;
                    case 'visible':
                    default:
                        return OVERFLOW.VISIBLE;
                }
            });
        }
    };

    var OVERFLOW_WRAP;
    (function (OVERFLOW_WRAP) {
        OVERFLOW_WRAP["NORMAL"] = "normal";
        OVERFLOW_WRAP["BREAK_WORD"] = "break-word";
    })(OVERFLOW_WRAP || (OVERFLOW_WRAP = {}));
    var overflowWrap = {
        name: 'overflow-wrap',
        initialValue: 'normal',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (overflow) {
            switch (overflow) {
                case 'break-word':
                    return OVERFLOW_WRAP.BREAK_WORD;
                case 'normal':
                default:
                    return OVERFLOW_WRAP.NORMAL;
            }
        }
    };

    var paddingForSide = function (side) { return ({
        name: "padding-" + side,
        initialValue: '0',
        prefix: false,
        type: PropertyDescriptorParsingType.TYPE_VALUE,
        format: 'length-percentage'
    }); };
    var paddingTop = paddingForSide('top');
    var paddingRight = paddingForSide('right');
    var paddingBottom = paddingForSide('bottom');
    var paddingLeft = paddingForSide('left');

    var TEXT_ALIGN;
    (function (TEXT_ALIGN) {
        TEXT_ALIGN[TEXT_ALIGN["LEFT"] = 0] = "LEFT";
        TEXT_ALIGN[TEXT_ALIGN["CENTER"] = 1] = "CENTER";
        TEXT_ALIGN[TEXT_ALIGN["RIGHT"] = 2] = "RIGHT";
    })(TEXT_ALIGN || (TEXT_ALIGN = {}));
    var textAlign = {
        name: 'text-align',
        initialValue: 'left',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (textAlign) {
            switch (textAlign) {
                case 'right':
                    return TEXT_ALIGN.RIGHT;
                case 'center':
                case 'justify':
                    return TEXT_ALIGN.CENTER;
                case 'left':
                default:
                    return TEXT_ALIGN.LEFT;
            }
        }
    };

    var POSITION;
    (function (POSITION) {
        POSITION[POSITION["STATIC"] = 0] = "STATIC";
        POSITION[POSITION["RELATIVE"] = 1] = "RELATIVE";
        POSITION[POSITION["ABSOLUTE"] = 2] = "ABSOLUTE";
        POSITION[POSITION["FIXED"] = 3] = "FIXED";
        POSITION[POSITION["STICKY"] = 4] = "STICKY";
    })(POSITION || (POSITION = {}));
    var position = {
        name: 'position',
        initialValue: 'static',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (position) {
            switch (position) {
                case 'relative':
                    return POSITION.RELATIVE;
                case 'absolute':
                    return POSITION.ABSOLUTE;
                case 'fixed':
                    return POSITION.FIXED;
                case 'sticky':
                    return POSITION.STICKY;
            }
            return POSITION.STATIC;
        }
    };

    var textShadow = {
        name: 'text-shadow',
        initialValue: 'none',
        type: PropertyDescriptorParsingType.LIST,
        prefix: false,
        parse: function (tokens) {
            if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
                return [];
            }
            return parseFunctionArgs(tokens).map(function (values) {
                var shadow = {
                    color: COLORS.TRANSPARENT,
                    offsetX: ZERO_LENGTH,
                    offsetY: ZERO_LENGTH,
                    blur: ZERO_LENGTH
                };
                var c = 0;
                for (var i = 0; i < values.length; i++) {
                    var token = values[i];
                    if (isLength(token)) {
                        if (c === 0) {
                            shadow.offsetX = token;
                        }
                        else if (c === 1) {
                            shadow.offsetY = token;
                        }
                        else {
                            shadow.blur = token;
                        }
                        c++;
                    }
                    else {
                        shadow.color = color.parse(token);
                    }
                }
                return shadow;
            });
        }
    };

    var TEXT_TRANSFORM;
    (function (TEXT_TRANSFORM) {
        TEXT_TRANSFORM[TEXT_TRANSFORM["NONE"] = 0] = "NONE";
        TEXT_TRANSFORM[TEXT_TRANSFORM["LOWERCASE"] = 1] = "LOWERCASE";
        TEXT_TRANSFORM[TEXT_TRANSFORM["UPPERCASE"] = 2] = "UPPERCASE";
        TEXT_TRANSFORM[TEXT_TRANSFORM["CAPITALIZE"] = 3] = "CAPITALIZE";
    })(TEXT_TRANSFORM || (TEXT_TRANSFORM = {}));
    var textTransform = {
        name: 'text-transform',
        initialValue: 'none',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (textTransform) {
            switch (textTransform) {
                case 'uppercase':
                    return TEXT_TRANSFORM.UPPERCASE;
                case 'lowercase':
                    return TEXT_TRANSFORM.LOWERCASE;
                case 'capitalize':
                    return TEXT_TRANSFORM.CAPITALIZE;
            }
            return TEXT_TRANSFORM.NONE;
        }
    };

    var transform = {
        name: 'transform',
        initialValue: 'none',
        prefix: true,
        type: PropertyDescriptorParsingType.VALUE,
        parse: function (token) {
            if (token.type === TokenType.IDENT_TOKEN && token.value === 'none') {
                return null;
            }
            if (token.type === TokenType.FUNCTION) {
                var transformFunction = SUPPORTED_TRANSFORM_FUNCTIONS[token.name];
                if (typeof transformFunction === 'undefined') {
                    throw new Error("Attempting to parse an unsupported transform function \"" + token.name + "\"");
                }
                return transformFunction(token.values);
            }
            return null;
        }
    };
    var matrix = function (args) {
        var values = args.filter(function (arg) { return arg.type === TokenType.NUMBER_TOKEN; }).map(function (arg) { return arg.number; });
        return values.length === 6 ? values : null;
    };
    // doesn't support 3D transforms at the moment
    var matrix3d = function (args) {
        var values = args.filter(function (arg) { return arg.type === TokenType.NUMBER_TOKEN; }).map(function (arg) { return arg.number; });
        var a1 = values[0], b1 = values[1], _a = values[2], _b = values[3], a2 = values[4], b2 = values[5], _c = values[6], _d = values[7], _e = values[8], _f = values[9], _g = values[10], _h = values[11], a4 = values[12], b4 = values[13], _j = values[14], _k = values[15];
        return values.length === 16 ? [a1, b1, a2, b2, a4, b4] : null;
    };
    var SUPPORTED_TRANSFORM_FUNCTIONS = {
        matrix: matrix,
        matrix3d: matrix3d
    };

    var DEFAULT_VALUE = {
        type: TokenType.PERCENTAGE_TOKEN,
        number: 50,
        flags: FLAG_INTEGER
    };
    var DEFAULT = [DEFAULT_VALUE, DEFAULT_VALUE];
    var transformOrigin = {
        name: 'transform-origin',
        initialValue: '50% 50%',
        prefix: true,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            var origins = tokens.filter(isLengthPercentage);
            if (origins.length !== 2) {
                return DEFAULT;
            }
            return [origins[0], origins[1]];
        }
    };

    var VISIBILITY;
    (function (VISIBILITY) {
        VISIBILITY[VISIBILITY["VISIBLE"] = 0] = "VISIBLE";
        VISIBILITY[VISIBILITY["HIDDEN"] = 1] = "HIDDEN";
        VISIBILITY[VISIBILITY["COLLAPSE"] = 2] = "COLLAPSE";
    })(VISIBILITY || (VISIBILITY = {}));
    var visibility = {
        name: 'visible',
        initialValue: 'none',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (visibility) {
            switch (visibility) {
                case 'hidden':
                    return VISIBILITY.HIDDEN;
                case 'collapse':
                    return VISIBILITY.COLLAPSE;
                case 'visible':
                default:
                    return VISIBILITY.VISIBLE;
            }
        }
    };

    var WORD_BREAK;
    (function (WORD_BREAK) {
        WORD_BREAK["NORMAL"] = "normal";
        WORD_BREAK["BREAK_ALL"] = "break-all";
        WORD_BREAK["KEEP_ALL"] = "keep-all";
    })(WORD_BREAK || (WORD_BREAK = {}));
    var wordBreak = {
        name: 'word-break',
        initialValue: 'normal',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (wordBreak) {
            switch (wordBreak) {
                case 'break-all':
                    return WORD_BREAK.BREAK_ALL;
                case 'keep-all':
                    return WORD_BREAK.KEEP_ALL;
                case 'normal':
                default:
                    return WORD_BREAK.NORMAL;
            }
        }
    };

    var zIndex = {
        name: 'z-index',
        initialValue: 'auto',
        prefix: false,
        type: PropertyDescriptorParsingType.VALUE,
        parse: function (token) {
            if (token.type === TokenType.IDENT_TOKEN) {
                return { auto: true, order: 0 };
            }
            if (isNumberToken(token)) {
                return { auto: false, order: token.number };
            }
            throw new Error("Invalid z-index number parsed");
        }
    };

    var opacity = {
        name: 'opacity',
        initialValue: '1',
        type: PropertyDescriptorParsingType.VALUE,
        prefix: false,
        parse: function (token) {
            if (isNumberToken(token)) {
                return token.number;
            }
            return 1;
        }
    };

    var textDecorationColor = {
        name: "text-decoration-color",
        initialValue: 'transparent',
        prefix: false,
        type: PropertyDescriptorParsingType.TYPE_VALUE,
        format: 'color'
    };

    var textDecorationLine = {
        name: 'text-decoration-line',
        initialValue: 'none',
        prefix: false,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            return tokens
                .filter(isIdentToken)
                .map(function (token) {
                switch (token.value) {
                    case 'underline':
                        return 1 /* UNDERLINE */;
                    case 'overline':
                        return 2 /* OVERLINE */;
                    case 'line-through':
                        return 3 /* LINE_THROUGH */;
                    case 'none':
                        return 4 /* BLINK */;
                }
                return 0 /* NONE */;
            })
                .filter(function (line) { return line !== 0 /* NONE */; });
        }
    };

    var fontFamily = {
        name: "font-family",
        initialValue: '',
        prefix: false,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            var accumulator = [];
            var results = [];
            tokens.forEach(function (token) {
                switch (token.type) {
                    case TokenType.IDENT_TOKEN:
                    case TokenType.STRING_TOKEN:
                        accumulator.push(token.value);
                        break;
                    case TokenType.NUMBER_TOKEN:
                        accumulator.push(token.number.toString());
                        break;
                    case TokenType.COMMA_TOKEN:
                        results.push(accumulator.join(' '));
                        accumulator.length = 0;
                        break;
                }
            });
            if (accumulator.length) {
                results.push(accumulator.join(' '));
            }
            return results.map(function (result) { return (result.indexOf(' ') === -1 ? result : "'" + result + "'"); });
        }
    };

    var fontSize = {
        name: "font-size",
        initialValue: '0',
        prefix: false,
        type: PropertyDescriptorParsingType.TYPE_VALUE,
        format: 'length'
    };

    var fontWeight = {
        name: 'font-weight',
        initialValue: 'normal',
        type: PropertyDescriptorParsingType.VALUE,
        prefix: false,
        parse: function (token) {
            if (isNumberToken(token)) {
                return token.number;
            }
            if (isIdentToken(token)) {
                switch (token.value) {
                    case 'bold':
                        return 700;
                    case 'normal':
                    default:
                        return 400;
                }
            }
            return 400;
        }
    };

    var fontVariant = {
        name: 'font-variant',
        initialValue: 'none',
        type: PropertyDescriptorParsingType.LIST,
        prefix: false,
        parse: function (tokens) {
            return tokens.filter(isIdentToken).map(function (token) { return token.value; });
        }
    };

    var FONT_STYLE;
    (function (FONT_STYLE) {
        FONT_STYLE["NORMAL"] = "normal";
        FONT_STYLE["ITALIC"] = "italic";
        FONT_STYLE["OBLIQUE"] = "oblique";
    })(FONT_STYLE || (FONT_STYLE = {}));
    var fontStyle = {
        name: 'font-style',
        initialValue: 'normal',
        prefix: false,
        type: PropertyDescriptorParsingType.IDENT_VALUE,
        parse: function (overflow) {
            switch (overflow) {
                case 'oblique':
                    return FONT_STYLE.OBLIQUE;
                case 'italic':
                    return FONT_STYLE.ITALIC;
                case 'normal':
                default:
                    return FONT_STYLE.NORMAL;
            }
        }
    };

    var contains = function (bit, value) { return (bit & value) !== 0; };

    var content = {
        name: 'content',
        initialValue: 'none',
        type: PropertyDescriptorParsingType.LIST,
        prefix: false,
        parse: function (tokens) {
            if (tokens.length === 0) {
                return [];
            }
            var first = tokens[0];
            if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
                return [];
            }
            return tokens;
        }
    };

    var counterIncrement = {
        name: 'counter-increment',
        initialValue: 'none',
        prefix: true,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            if (tokens.length === 0) {
                return null;
            }
            var first = tokens[0];
            if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
                return null;
            }
            var increments = [];
            var filtered = tokens.filter(nonWhiteSpace);
            for (var i = 0; i < filtered.length; i++) {
                var counter = filtered[i];
                var next = filtered[i + 1];
                if (counter.type === TokenType.IDENT_TOKEN) {
                    var increment = next && isNumberToken(next) ? next.number : 1;
                    increments.push({ counter: counter.value, increment: increment });
                }
            }
            return increments;
        }
    };

    var counterReset = {
        name: 'counter-reset',
        initialValue: 'none',
        prefix: true,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            if (tokens.length === 0) {
                return [];
            }
            var resets = [];
            var filtered = tokens.filter(nonWhiteSpace);
            for (var i = 0; i < filtered.length; i++) {
                var counter = filtered[i];
                var next = filtered[i + 1];
                if (isIdentToken(counter) && counter.value !== 'none') {
                    var reset = next && isNumberToken(next) ? next.number : 0;
                    resets.push({ counter: counter.value, reset: reset });
                }
            }
            return resets;
        }
    };

    var quotes = {
        name: 'quotes',
        initialValue: 'none',
        prefix: true,
        type: PropertyDescriptorParsingType.LIST,
        parse: function (tokens) {
            if (tokens.length === 0) {
                return null;
            }
            var first = tokens[0];
            if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
                return null;
            }
            var quotes = [];
            var filtered = tokens.filter(isStringToken);
            if (filtered.length % 2 !== 0) {
                return null;
            }
            for (var i = 0; i < filtered.length; i += 2) {
                var open_1 = filtered[i].value;
                var close_1 = filtered[i + 1].value;
                quotes.push({ open: open_1, close: close_1 });
            }
            return quotes;
        }
    };
    var getQuote = function (quotes, depth, open) {
        if (!quotes) {
            return '';
        }
        var quote = quotes[Math.min(depth, quotes.length - 1)];
        if (!quote) {
            return '';
        }
        return open ? quote.open : quote.close;
    };

    var boxShadow = {
        name: 'box-shadow',
        initialValue: 'none',
        type: PropertyDescriptorParsingType.LIST,
        prefix: false,
        parse: function (tokens) {
            if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
                return [];
            }
            return parseFunctionArgs(tokens).map(function (values) {
                var shadow = {
                    color: 0x000000ff,
                    offsetX: ZERO_LENGTH,
                    offsetY: ZERO_LENGTH,
                    blur: ZERO_LENGTH,
                    spread: ZERO_LENGTH,
                    inset: false
                };
                var c = 0;
                for (var i = 0; i < values.length; i++) {
                    var token = values[i];
                    if (isIdentWithValue(token, 'inset')) {
                        shadow.inset = true;
                    }
                    else if (isLength(token)) {
                        if (c === 0) {
                            shadow.offsetX = token;
                        }
                        else if (c === 1) {
                            shadow.offsetY = token;
                        }
                        else if (c === 2) {
                            shadow.blur = token;
                        }
                        else {
                            shadow.spread = token;
                        }
                        c++;
                    }
                    else {
                        shadow.color = color.parse(token);
                    }
                }
                return shadow;
            });
        }
    };

    var CSSParsedDeclaration = /** @class */ (function () {
        function CSSParsedDeclaration(declaration) {
            this.backgroundClip = parse(backgroundClip, declaration.backgroundClip);
            this.backgroundColor = parse(backgroundColor, declaration.backgroundColor);
            this.backgroundImage = parse(backgroundImage, declaration.backgroundImage);
            this.backgroundOrigin = parse(backgroundOrigin, declaration.backgroundOrigin);
            this.backgroundPosition = parse(backgroundPosition, declaration.backgroundPosition);
            this.backgroundRepeat = parse(backgroundRepeat, declaration.backgroundRepeat);
            this.backgroundSize = parse(backgroundSize, declaration.backgroundSize);
            this.borderTopColor = parse(borderTopColor, declaration.borderTopColor);
            this.borderRightColor = parse(borderRightColor, declaration.borderRightColor);
            this.borderBottomColor = parse(borderBottomColor, declaration.borderBottomColor);
            this.borderLeftColor = parse(borderLeftColor, declaration.borderLeftColor);
            this.borderTopLeftRadius = parse(borderTopLeftRadius, declaration.borderTopLeftRadius);
            this.borderTopRightRadius = parse(borderTopRightRadius, declaration.borderTopRightRadius);
            this.borderBottomRightRadius = parse(borderBottomRightRadius, declaration.borderBottomRightRadius);
            this.borderBottomLeftRadius = parse(borderBottomLeftRadius, declaration.borderBottomLeftRadius);
            this.borderTopStyle = parse(borderTopStyle, declaration.borderTopStyle);
            this.borderRightStyle = parse(borderRightStyle, declaration.borderRightStyle);
            this.borderBottomStyle = parse(borderBottomStyle, declaration.borderBottomStyle);
            this.borderLeftStyle = parse(borderLeftStyle, declaration.borderLeftStyle);
            this.borderTopWidth = parse(borderTopWidth, declaration.borderTopWidth);
            this.borderRightWidth = parse(borderRightWidth, declaration.borderRightWidth);
            this.borderBottomWidth = parse(borderBottomWidth, declaration.borderBottomWidth);
            this.borderLeftWidth = parse(borderLeftWidth, declaration.borderLeftWidth);
            this.boxShadow = parse(boxShadow, declaration.boxShadow);
            this.color = parse(color$1, declaration.color);
            this.display = parse(display, declaration.display);
            this.float = parse(float, declaration.cssFloat);
            this.fontFamily = parse(fontFamily, declaration.fontFamily);
            this.fontSize = parse(fontSize, declaration.fontSize);
            this.fontStyle = parse(fontStyle, declaration.fontStyle);
            this.fontVariant = parse(fontVariant, declaration.fontVariant);
            this.fontWeight = parse(fontWeight, declaration.fontWeight);
            this.letterSpacing = parse(letterSpacing, declaration.letterSpacing);
            this.lineBreak = parse(lineBreak, declaration.lineBreak);
            this.lineHeight = parse(lineHeight, declaration.lineHeight);
            this.listStyleImage = parse(listStyleImage, declaration.listStyleImage);
            this.listStylePosition = parse(listStylePosition, declaration.listStylePosition);
            this.listStyleType = parse(listStyleType, declaration.listStyleType);
            this.marginTop = parse(marginTop, declaration.marginTop);
            this.marginRight = parse(marginRight, declaration.marginRight);
            this.marginBottom = parse(marginBottom, declaration.marginBottom);
            this.marginLeft = parse(marginLeft, declaration.marginLeft);
            this.opacity = parse(opacity, declaration.opacity);
            var overflowTuple = parse(overflow, declaration.overflow);
            this.overflowX = overflowTuple[0];
            this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
            this.overflowWrap = parse(overflowWrap, declaration.overflowWrap);
            this.paddingTop = parse(paddingTop, declaration.paddingTop);
            this.paddingRight = parse(paddingRight, declaration.paddingRight);
            this.paddingBottom = parse(paddingBottom, declaration.paddingBottom);
            this.paddingLeft = parse(paddingLeft, declaration.paddingLeft);
            this.position = parse(position, declaration.position);
            this.textAlign = parse(textAlign, declaration.textAlign);
            this.textDecorationColor = parse(textDecorationColor, declaration.textDecorationColor || declaration.color);
            this.textDecorationLine = parse(textDecorationLine, declaration.textDecorationLine);
            this.textShadow = parse(textShadow, declaration.textShadow);
            this.textTransform = parse(textTransform, declaration.textTransform);
            this.transform = parse(transform, declaration.transform);
            this.transformOrigin = parse(transformOrigin, declaration.transformOrigin);
            this.visibility = parse(visibility, declaration.visibility);
            this.wordBreak = parse(wordBreak, declaration.wordBreak);
            this.zIndex = parse(zIndex, declaration.zIndex);
        }
        CSSParsedDeclaration.prototype.isVisible = function () {
            return this.display > 0 && this.opacity > 0 && this.visibility === VISIBILITY.VISIBLE;
        };
        CSSParsedDeclaration.prototype.isTransparent = function () {
            return isTransparent(this.backgroundColor);
        };
        CSSParsedDeclaration.prototype.isTransformed = function () {
            return this.transform !== null;
        };
        CSSParsedDeclaration.prototype.isPositioned = function () {
            return this.position !== POSITION.STATIC;
        };
        CSSParsedDeclaration.prototype.isPositionedWithZIndex = function () {
            return this.isPositioned() && !this.zIndex.auto;
        };
        CSSParsedDeclaration.prototype.isFloating = function () {
            return this.float !== FLOAT.NONE;
        };
        CSSParsedDeclaration.prototype.isInlineLevel = function () {
            return (contains(this.display, 4 /* INLINE */) ||
                contains(this.display, 33554432 /* INLINE_BLOCK */) ||
                contains(this.display, 268435456 /* INLINE_FLEX */) ||
                contains(this.display, 536870912 /* INLINE_GRID */) ||
                contains(this.display, 67108864 /* INLINE_LIST_ITEM */) ||
                contains(this.display, 134217728 /* INLINE_TABLE */));
        };
        return CSSParsedDeclaration;
    }());
    var CSSParsedPseudoDeclaration = /** @class */ (function () {
        function CSSParsedPseudoDeclaration(declaration) {
            this.content = parse(content, declaration.content);
            this.quotes = parse(quotes, declaration.quotes);
        }
        return CSSParsedPseudoDeclaration;
    }());
    var CSSParsedCounterDeclaration = /** @class */ (function () {
        function CSSParsedCounterDeclaration(declaration) {
            this.counterIncrement = parse(counterIncrement, declaration.counterIncrement);
            this.counterReset = parse(counterReset, declaration.counterReset);
        }
        return CSSParsedCounterDeclaration;
    }());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var parse = function (descriptor, style) {
        var tokenizer = new Tokenizer();
        var value = style !== null && typeof style !== 'undefined' ? style.toString() : descriptor.initialValue;
        tokenizer.write(value);
        var parser = new Parser(tokenizer.read());
        switch (descriptor.type) {
            case PropertyDescriptorParsingType.IDENT_VALUE:
                var token = parser.parseComponentValue();
                return descriptor.parse(isIdentToken(token) ? token.value : descriptor.initialValue);
            case PropertyDescriptorParsingType.VALUE:
                return descriptor.parse(parser.parseComponentValue());
            case PropertyDescriptorParsingType.LIST:
                return descriptor.parse(parser.parseComponentValues());
            case PropertyDescriptorParsingType.TOKEN_VALUE:
                return parser.parseComponentValue();
            case PropertyDescriptorParsingType.TYPE_VALUE:
                switch (descriptor.format) {
                    case 'angle':
                        return angle.parse(parser.parseComponentValue());
                    case 'color':
                        return color.parse(parser.parseComponentValue());
                    case 'image':
                        return image.parse(parser.parseComponentValue());
                    case 'length':
                        var length_1 = parser.parseComponentValue();
                        return isLength(length_1) ? length_1 : ZERO_LENGTH;
                    case 'length-percentage':
                        var value_1 = parser.parseComponentValue();
                        return isLengthPercentage(value_1) ? value_1 : ZERO_LENGTH;
                }
        }
        throw new Error("Attempting to parse unsupported css format type " + descriptor.format);
    };

    var ElementContainer = /** @class */ (function () {
        function ElementContainer(element) {
            this.styles = new CSSParsedDeclaration(window.getComputedStyle(element, null));
            this.textNodes = [];
            this.elements = [];
            if (this.styles.transform !== null && isHTMLElementNode(element)) {
                // getBoundingClientRect takes transforms into account
                element.style.transform = 'none';
            }
            this.bounds = parseBounds(element);
            this.flags = 0;
        }
        return ElementContainer;
    }());

    var TextBounds = /** @class */ (function () {
        function TextBounds(text, bounds) {
            this.text = text;
            this.bounds = bounds;
        }
        return TextBounds;
    }());
    var parseTextBounds = function (value, styles, node) {
        var textList = breakText(value, styles);
        var textBounds = [];
        var offset = 0;
        textList.forEach(function (text) {
            if (styles.textDecorationLine.length || text.trim().length > 0) {
                if (FEATURES.SUPPORT_RANGE_BOUNDS) {
                    textBounds.push(new TextBounds(text, getRangeBounds(node, offset, text.length)));
                }
                else {
                    var replacementNode = node.splitText(text.length);
                    textBounds.push(new TextBounds(text, getWrapperBounds(node)));
                    node = replacementNode;
                }
            }
            else if (!FEATURES.SUPPORT_RANGE_BOUNDS) {
                node = node.splitText(text.length);
            }
            offset += text.length;
        });
        return textBounds;
    };
    var getWrapperBounds = function (node) {
        var ownerDocument = node.ownerDocument;
        if (ownerDocument) {
            var wrapper = ownerDocument.createElement('html2canvaswrapper');
            wrapper.appendChild(node.cloneNode(true));
            var parentNode = node.parentNode;
            if (parentNode) {
                parentNode.replaceChild(wrapper, node);
                var bounds = parseBounds(wrapper);
                if (wrapper.firstChild) {
                    parentNode.replaceChild(wrapper.firstChild, wrapper);
                }
                return bounds;
            }
        }
        return new Bounds(0, 0, 0, 0);
    };
    var getRangeBounds = function (node, offset, length) {
        var ownerDocument = node.ownerDocument;
        if (!ownerDocument) {
            throw new Error('Node has no owner document');
        }
        var range = ownerDocument.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset + length);
        return Bounds.fromClientRect(range.getBoundingClientRect());
    };
    var breakText = function (value, styles) {
        return styles.letterSpacing !== 0 ? toCodePoints(value).map(function (i) { return fromCodePoint(i); }) : breakWords(value, styles);
    };
    var breakWords = function (str, styles) {
        var breaker = LineBreaker(str, {
            lineBreak: styles.lineBreak,
            wordBreak: styles.overflowWrap === OVERFLOW_WRAP.BREAK_WORD ? 'break-word' : styles.wordBreak
        });
        var words = [];
        var bk;
        while (!(bk = breaker.next()).done) {
            if (bk.value) {
                words.push(bk.value.slice());
            }
        }
        return words;
    };

    var TextContainer = /** @class */ (function () {
        function TextContainer(node, styles) {
            this.text = transform$1(node.data, styles.textTransform);
            this.textBounds = parseTextBounds(this.text, styles, node);
        }
        return TextContainer;
    }());
    var transform$1 = function (text, transform) {
        switch (transform) {
            case TEXT_TRANSFORM.LOWERCASE:
                return text.toLowerCase();
            case TEXT_TRANSFORM.CAPITALIZE:
                return text.replace(CAPITALIZE, capitalize);
            case TEXT_TRANSFORM.UPPERCASE:
                return text.toUpperCase();
            default:
                return text;
        }
    };
    var CAPITALIZE = /(^|\s|:|-|\(|\))([a-z])/g;
    var capitalize = function (m, p1, p2) {
        if (m.length > 0) {
            return p1 + p2.toUpperCase();
        }
        return m;
    };

    var ImageElementContainer = /** @class */ (function (_super) {
        __extends(ImageElementContainer, _super);
        function ImageElementContainer(img) {
            var _this = _super.call(this, img) || this;
            _this.src = img.currentSrc || img.src;
            _this.intrinsicWidth = img.naturalWidth;
            _this.intrinsicHeight = img.naturalHeight;
            CacheStorage.getInstance().addImage(_this.src);
            return _this;
        }
        return ImageElementContainer;
    }(ElementContainer));

    var CanvasElementContainer = /** @class */ (function (_super) {
        __extends(CanvasElementContainer, _super);
        function CanvasElementContainer(canvas) {
            var _this = _super.call(this, canvas) || this;
            _this.canvas = canvas;
            _this.intrinsicWidth = canvas.width;
            _this.intrinsicHeight = canvas.height;
            return _this;
        }
        return CanvasElementContainer;
    }(ElementContainer));

    var SVGElementContainer = /** @class */ (function (_super) {
        __extends(SVGElementContainer, _super);
        function SVGElementContainer(img) {
            var _this = _super.call(this, img) || this;
            var s = new XMLSerializer();
            _this.svg = "data:image/svg+xml," + encodeURIComponent(s.serializeToString(img));
            _this.intrinsicWidth = img.width.baseVal.value;
            _this.intrinsicHeight = img.height.baseVal.value;
            CacheStorage.getInstance().addImage(_this.svg);
            return _this;
        }
        return SVGElementContainer;
    }(ElementContainer));

    var LIElementContainer = /** @class */ (function (_super) {
        __extends(LIElementContainer, _super);
        function LIElementContainer(element) {
            var _this = _super.call(this, element) || this;
            _this.value = element.value;
            return _this;
        }
        return LIElementContainer;
    }(ElementContainer));

    var OLElementContainer = /** @class */ (function (_super) {
        __extends(OLElementContainer, _super);
        function OLElementContainer(element) {
            var _this = _super.call(this, element) || this;
            _this.start = element.start;
            _this.reversed = typeof element.reversed === 'boolean' && element.reversed === true;
            return _this;
        }
        return OLElementContainer;
    }(ElementContainer));

    var CHECKBOX_BORDER_RADIUS = [
        {
            type: TokenType.DIMENSION_TOKEN,
            flags: 0,
            unit: 'px',
            number: 3
        }
    ];
    var RADIO_BORDER_RADIUS = [
        {
            type: TokenType.PERCENTAGE_TOKEN,
            flags: 0,
            number: 50
        }
    ];
    var reformatInputBounds = function (bounds) {
        if (bounds.width > bounds.height) {
            return new Bounds(bounds.left + (bounds.width - bounds.height) / 2, bounds.top, bounds.height, bounds.height);
        }
        else if (bounds.width < bounds.height) {
            return new Bounds(bounds.left, bounds.top + (bounds.height - bounds.width) / 2, bounds.width, bounds.width);
        }
        return bounds;
    };
    var getInputValue = function (node) {
        var value = node.type === PASSWORD ? new Array(node.value.length + 1).join('\u2022') : node.value;
        return value.length === 0 ? node.placeholder || '' : value;
    };
    var CHECKBOX = 'checkbox';
    var RADIO = 'radio';
    var PASSWORD = 'password';
    var INPUT_COLOR = 0x2a2a2aff;
    var InputElementContainer = /** @class */ (function (_super) {
        __extends(InputElementContainer, _super);
        function InputElementContainer(input) {
            var _this = _super.call(this, input) || this;
            _this.type = input.type.toLowerCase();
            _this.checked = input.checked;
            _this.value = getInputValue(input);
            if (_this.type === CHECKBOX || _this.type === RADIO) {
                _this.styles.backgroundColor = 0xdededeff;
                _this.styles.borderTopColor = _this.styles.borderRightColor = _this.styles.borderBottomColor = _this.styles.borderLeftColor = 0xa5a5a5ff;
                _this.styles.borderTopWidth = _this.styles.borderRightWidth = _this.styles.borderBottomWidth = _this.styles.borderLeftWidth = 1;
                _this.styles.borderTopStyle = _this.styles.borderRightStyle = _this.styles.borderBottomStyle = _this.styles.borderLeftStyle =
                    BORDER_STYLE.SOLID;
                _this.styles.backgroundClip = [BACKGROUND_CLIP.BORDER_BOX];
                _this.styles.backgroundOrigin = [0 /* BORDER_BOX */];
                _this.bounds = reformatInputBounds(_this.bounds);
            }
            switch (_this.type) {
                case CHECKBOX:
                    _this.styles.borderTopRightRadius = _this.styles.borderTopLeftRadius = _this.styles.borderBottomRightRadius = _this.styles.borderBottomLeftRadius = CHECKBOX_BORDER_RADIUS;
                    break;
                case RADIO:
                    _this.styles.borderTopRightRadius = _this.styles.borderTopLeftRadius = _this.styles.borderBottomRightRadius = _this.styles.borderBottomLeftRadius = RADIO_BORDER_RADIUS;
                    break;
            }
            return _this;
        }
        return InputElementContainer;
    }(ElementContainer));

    var SelectElementContainer = /** @class */ (function (_super) {
        __extends(SelectElementContainer, _super);
        function SelectElementContainer(element) {
            var _this = _super.call(this, element) || this;
            var option = element.options[element.selectedIndex || 0];
            _this.value = option ? option.text || '' : '';
            return _this;
        }
        return SelectElementContainer;
    }(ElementContainer));

    var TextareaElementContainer = /** @class */ (function (_super) {
        __extends(TextareaElementContainer, _super);
        function TextareaElementContainer(element) {
            var _this = _super.call(this, element) || this;
            _this.value = element.value;
            return _this;
        }
        return TextareaElementContainer;
    }(ElementContainer));

    var parseColor = function (value) { return color.parse(Parser.create(value).parseComponentValue()); };
    var IFrameElementContainer = /** @class */ (function (_super) {
        __extends(IFrameElementContainer, _super);
        function IFrameElementContainer(iframe) {
            var _this = _super.call(this, iframe) || this;
            _this.src = iframe.src;
            _this.width = parseInt(iframe.width, 10) || 0;
            _this.height = parseInt(iframe.height, 10) || 0;
            _this.backgroundColor = _this.styles.backgroundColor;
            try {
                if (iframe.contentWindow &&
                    iframe.contentWindow.document &&
                    iframe.contentWindow.document.documentElement) {
                    _this.tree = parseTree(iframe.contentWindow.document.documentElement);
                    // http://www.w3.org/TR/css3-background/#special-backgrounds
                    var documentBackgroundColor = iframe.contentWindow.document.documentElement
                        ? parseColor(getComputedStyle(iframe.contentWindow.document.documentElement)
                            .backgroundColor)
                        : COLORS.TRANSPARENT;
                    var bodyBackgroundColor = iframe.contentWindow.document.body
                        ? parseColor(getComputedStyle(iframe.contentWindow.document.body).backgroundColor)
                        : COLORS.TRANSPARENT;
                    _this.backgroundColor = isTransparent(documentBackgroundColor)
                        ? isTransparent(bodyBackgroundColor)
                            ? _this.styles.backgroundColor
                            : bodyBackgroundColor
                        : documentBackgroundColor;
                }
            }
            catch (e) { }
            return _this;
        }
        return IFrameElementContainer;
    }(ElementContainer));

    var LIST_OWNERS = ['OL', 'UL', 'MENU'];
    var parseNodeTree = function (node, parent, root) {
        for (var childNode = node.firstChild, nextNode = void 0; childNode; childNode = nextNode) {
            nextNode = childNode.nextSibling;
            if (isTextNode(childNode) && childNode.data.trim().length > 0) {
                parent.textNodes.push(new TextContainer(childNode, parent.styles));
            }
            else if (isElementNode(childNode)) {
                var container = createContainer(childNode);
                if (container.styles.isVisible()) {
                    if (createsRealStackingContext(childNode, container, root)) {
                        container.flags |= 4 /* CREATES_REAL_STACKING_CONTEXT */;
                    }
                    else if (createsStackingContext(container.styles)) {
                        container.flags |= 2 /* CREATES_STACKING_CONTEXT */;
                    }
                    if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
                        container.flags |= 8 /* IS_LIST_OWNER */;
                    }
                    parent.elements.push(container);
                    if (!isTextareaElement(childNode) && !isSVGElement(childNode) && !isSelectElement(childNode)) {
                        parseNodeTree(childNode, container, root);
                    }
                }
            }
        }
    };
    var createContainer = function (element) {
        if (isImageElement(element)) {
            return new ImageElementContainer(element);
        }
        if (isCanvasElement(element)) {
            return new CanvasElementContainer(element);
        }
        if (isSVGElement(element)) {
            return new SVGElementContainer(element);
        }
        if (isLIElement(element)) {
            return new LIElementContainer(element);
        }
        if (isOLElement(element)) {
            return new OLElementContainer(element);
        }
        if (isInputElement(element)) {
            return new InputElementContainer(element);
        }
        if (isSelectElement(element)) {
            return new SelectElementContainer(element);
        }
        if (isTextareaElement(element)) {
            return new TextareaElementContainer(element);
        }
        if (isIFrameElement(element)) {
            return new IFrameElementContainer(element);
        }
        return new ElementContainer(element);
    };
    var parseTree = function (element) {
        var container = createContainer(element);
        container.flags |= 4 /* CREATES_REAL_STACKING_CONTEXT */;
        parseNodeTree(element, container, container);
        return container;
    };
    var createsRealStackingContext = function (node, container, root) {
        return (container.styles.isPositionedWithZIndex() ||
            container.styles.opacity < 1 ||
            container.styles.isTransformed() ||
            (isBodyElement(node) && root.styles.isTransparent()));
    };
    var createsStackingContext = function (styles) { return styles.isPositioned() || styles.isFloating(); };
    var isTextNode = function (node) { return node.nodeType === Node.TEXT_NODE; };
    var isElementNode = function (node) { return node.nodeType === Node.ELEMENT_NODE; };
    var isHTMLElementNode = function (node) {
        return isElementNode(node) && typeof node.style !== 'undefined' && !isSVGElementNode(node);
    };
    var isSVGElementNode = function (element) {
        return typeof element.className === 'object';
    };
    var isLIElement = function (node) { return node.tagName === 'LI'; };
    var isOLElement = function (node) { return node.tagName === 'OL'; };
    var isInputElement = function (node) { return node.tagName === 'INPUT'; };
    var isHTMLElement = function (node) { return node.tagName === 'HTML'; };
    var isSVGElement = function (node) { return node.tagName === 'svg'; };
    var isBodyElement = function (node) { return node.tagName === 'BODY'; };
    var isCanvasElement = function (node) { return node.tagName === 'CANVAS'; };
    var isImageElement = function (node) { return node.tagName === 'IMG'; };
    var isIFrameElement = function (node) { return node.tagName === 'IFRAME'; };
    var isStyleElement = function (node) { return node.tagName === 'STYLE'; };
    var isScriptElement = function (node) { return node.tagName === 'SCRIPT'; };
    var isTextareaElement = function (node) { return node.tagName === 'TEXTAREA'; };
    var isSelectElement = function (node) { return node.tagName === 'SELECT'; };

    var CounterState = /** @class */ (function () {
        function CounterState() {
            this.counters = {};
        }
        CounterState.prototype.getCounterValue = function (name) {
            var counter = this.counters[name];
            if (counter && counter.length) {
                return counter[counter.length - 1];
            }
            return 1;
        };
        CounterState.prototype.getCounterValues = function (name) {
            var counter = this.counters[name];
            return counter ? counter : [];
        };
        CounterState.prototype.pop = function (counters) {
            var _this = this;
            counters.forEach(function (counter) { return _this.counters[counter].pop(); });
        };
        CounterState.prototype.parse = function (style) {
            var _this = this;
            var counterIncrement = style.counterIncrement;
            var counterReset = style.counterReset;
            var canReset = true;
            if (counterIncrement !== null) {
                counterIncrement.forEach(function (entry) {
                    var counter = _this.counters[entry.counter];
                    if (counter && entry.increment !== 0) {
                        canReset = false;
                        counter[Math.max(0, counter.length - 1)] += entry.increment;
                    }
                });
            }
            var counterNames = [];
            if (canReset) {
                counterReset.forEach(function (entry) {
                    var counter = _this.counters[entry.counter];
                    counterNames.push(entry.counter);
                    if (!counter) {
                        counter = _this.counters[entry.counter] = [];
                    }
                    counter.push(entry.reset);
                });
            }
            return counterNames;
        };
        return CounterState;
    }());
    var ROMAN_UPPER = {
        integers: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
        values: ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
    };
    var ARMENIAN = {
        integers: [
            9000,
            8000,
            7000,
            6000,
            5000,
            4000,
            3000,
            2000,
            1000,
            900,
            800,
            700,
            600,
            500,
            400,
            300,
            200,
            100,
            90,
            80,
            70,
            60,
            50,
            40,
            30,
            20,
            10,
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2,
            1
        ],
        values: [
            'Ք',
            'Փ',
            'Ւ',
            'Ց',
            'Ր',
            'Տ',
            'Վ',
            'Ս',
            'Ռ',
            'Ջ',
            'Պ',
            'Չ',
            'Ո',
            'Շ',
            'Ն',
            'Յ',
            'Մ',
            'Ճ',
            'Ղ',
            'Ձ',
            'Հ',
            'Կ',
            'Ծ',
            'Խ',
            'Լ',
            'Ի',
            'Ժ',
            'Թ',
            'Ը',
            'Է',
            'Զ',
            'Ե',
            'Դ',
            'Գ',
            'Բ',
            'Ա'
        ]
    };
    var HEBREW = {
        integers: [
            10000,
            9000,
            8000,
            7000,
            6000,
            5000,
            4000,
            3000,
            2000,
            1000,
            400,
            300,
            200,
            100,
            90,
            80,
            70,
            60,
            50,
            40,
            30,
            20,
            19,
            18,
            17,
            16,
            15,
            10,
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2,
            1
        ],
        values: [
            'י׳',
            'ט׳',
            'ח׳',
            'ז׳',
            'ו׳',
            'ה׳',
            'ד׳',
            'ג׳',
            'ב׳',
            'א׳',
            'ת',
            'ש',
            'ר',
            'ק',
            'צ',
            'פ',
            'ע',
            'ס',
            'נ',
            'מ',
            'ל',
            'כ',
            'יט',
            'יח',
            'יז',
            'טז',
            'טו',
            'י',
            'ט',
            'ח',
            'ז',
            'ו',
            'ה',
            'ד',
            'ג',
            'ב',
            'א'
        ]
    };
    var GEORGIAN = {
        integers: [
            10000,
            9000,
            8000,
            7000,
            6000,
            5000,
            4000,
            3000,
            2000,
            1000,
            900,
            800,
            700,
            600,
            500,
            400,
            300,
            200,
            100,
            90,
            80,
            70,
            60,
            50,
            40,
            30,
            20,
            10,
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2,
            1
        ],
        values: [
            'ჵ',
            'ჰ',
            'ჯ',
            'ჴ',
            'ხ',
            'ჭ',
            'წ',
            'ძ',
            'ც',
            'ჩ',
            'შ',
            'ყ',
            'ღ',
            'ქ',
            'ფ',
            'ჳ',
            'ტ',
            'ს',
            'რ',
            'ჟ',
            'პ',
            'ო',
            'ჲ',
            'ნ',
            'მ',
            'ლ',
            'კ',
            'ი',
            'თ',
            'ჱ',
            'ზ',
            'ვ',
            'ე',
            'დ',
            'გ',
            'ბ',
            'ა'
        ]
    };
    var createAdditiveCounter = function (value, min, max, symbols, fallback, suffix) {
        if (value < min || value > max) {
            return createCounterText(value, fallback, suffix.length > 0);
        }
        return (symbols.integers.reduce(function (string, integer, index) {
            while (value >= integer) {
                value -= integer;
                string += symbols.values[index];
            }
            return string;
        }, '') + suffix);
    };
    var createCounterStyleWithSymbolResolver = function (value, codePointRangeLength, isNumeric, resolver) {
        var string = '';
        do {
            if (!isNumeric) {
                value--;
            }
            string = resolver(value) + string;
            value /= codePointRangeLength;
        } while (value * codePointRangeLength >= codePointRangeLength);
        return string;
    };
    var createCounterStyleFromRange = function (value, codePointRangeStart, codePointRangeEnd, isNumeric, suffix) {
        var codePointRangeLength = codePointRangeEnd - codePointRangeStart + 1;
        return ((value < 0 ? '-' : '') +
            (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, isNumeric, function (codePoint) {
                return fromCodePoint(Math.floor(codePoint % codePointRangeLength) + codePointRangeStart);
            }) +
                suffix));
    };
    var createCounterStyleFromSymbols = function (value, symbols, suffix) {
        if (suffix === void 0) { suffix = '. '; }
        var codePointRangeLength = symbols.length;
        return (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, false, function (codePoint) { return symbols[Math.floor(codePoint % codePointRangeLength)]; }) + suffix);
    };
    var CJK_ZEROS = 1 << 0;
    var CJK_TEN_COEFFICIENTS = 1 << 1;
    var CJK_TEN_HIGH_COEFFICIENTS = 1 << 2;
    var CJK_HUNDRED_COEFFICIENTS = 1 << 3;
    var createCJKCounter = function (value, numbers, multipliers, negativeSign, suffix, flags) {
        if (value < -9999 || value > 9999) {
            return createCounterText(value, LIST_STYLE_TYPE.CJK_DECIMAL, suffix.length > 0);
        }
        var tmp = Math.abs(value);
        var string = suffix;
        if (tmp === 0) {
            return numbers[0] + string;
        }
        for (var digit = 0; tmp > 0 && digit <= 4; digit++) {
            var coefficient = tmp % 10;
            if (coefficient === 0 && contains(flags, CJK_ZEROS) && string !== '') {
                string = numbers[coefficient] + string;
            }
            else if (coefficient > 1 ||
                (coefficient === 1 && digit === 0) ||
                (coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_COEFFICIENTS)) ||
                (coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_HIGH_COEFFICIENTS) && value > 100) ||
                (coefficient === 1 && digit > 1 && contains(flags, CJK_HUNDRED_COEFFICIENTS))) {
                string = numbers[coefficient] + (digit > 0 ? multipliers[digit - 1] : '') + string;
            }
            else if (coefficient === 1 && digit > 0) {
                string = multipliers[digit - 1] + string;
            }
            tmp = Math.floor(tmp / 10);
        }
        return (value < 0 ? negativeSign : '') + string;
    };
    var CHINESE_INFORMAL_MULTIPLIERS = '十百千萬';
    var CHINESE_FORMAL_MULTIPLIERS = '拾佰仟萬';
    var JAPANESE_NEGATIVE = 'マイナス';
    var KOREAN_NEGATIVE = '마이너스';
    var createCounterText = function (value, type, appendSuffix) {
        var defaultSuffix = appendSuffix ? '. ' : '';
        var cjkSuffix = appendSuffix ? '、' : '';
        var koreanSuffix = appendSuffix ? ', ' : '';
        var spaceSuffix = appendSuffix ? ' ' : '';
        switch (type) {
            case LIST_STYLE_TYPE.DISC:
                return '•' + spaceSuffix;
            case LIST_STYLE_TYPE.CIRCLE:
                return '◦' + spaceSuffix;
            case LIST_STYLE_TYPE.SQUARE:
                return '◾' + spaceSuffix;
            case LIST_STYLE_TYPE.DECIMAL_LEADING_ZERO:
                var string = createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
                return string.length < 4 ? "0" + string : string;
            case LIST_STYLE_TYPE.CJK_DECIMAL:
                return createCounterStyleFromSymbols(value, '〇一二三四五六七八九', cjkSuffix);
            case LIST_STYLE_TYPE.LOWER_ROMAN:
                return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, LIST_STYLE_TYPE.DECIMAL, defaultSuffix).toLowerCase();
            case LIST_STYLE_TYPE.UPPER_ROMAN:
                return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);
            case LIST_STYLE_TYPE.LOWER_GREEK:
                return createCounterStyleFromRange(value, 945, 969, false, defaultSuffix);
            case LIST_STYLE_TYPE.LOWER_ALPHA:
                return createCounterStyleFromRange(value, 97, 122, false, defaultSuffix);
            case LIST_STYLE_TYPE.UPPER_ALPHA:
                return createCounterStyleFromRange(value, 65, 90, false, defaultSuffix);
            case LIST_STYLE_TYPE.ARABIC_INDIC:
                return createCounterStyleFromRange(value, 1632, 1641, true, defaultSuffix);
            case LIST_STYLE_TYPE.ARMENIAN:
            case LIST_STYLE_TYPE.UPPER_ARMENIAN:
                return createAdditiveCounter(value, 1, 9999, ARMENIAN, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);
            case LIST_STYLE_TYPE.LOWER_ARMENIAN:
                return createAdditiveCounter(value, 1, 9999, ARMENIAN, LIST_STYLE_TYPE.DECIMAL, defaultSuffix).toLowerCase();
            case LIST_STYLE_TYPE.BENGALI:
                return createCounterStyleFromRange(value, 2534, 2543, true, defaultSuffix);
            case LIST_STYLE_TYPE.CAMBODIAN:
            case LIST_STYLE_TYPE.KHMER:
                return createCounterStyleFromRange(value, 6112, 6121, true, defaultSuffix);
            case LIST_STYLE_TYPE.CJK_EARTHLY_BRANCH:
                return createCounterStyleFromSymbols(value, '子丑寅卯辰巳午未申酉戌亥', cjkSuffix);
            case LIST_STYLE_TYPE.CJK_HEAVENLY_STEM:
                return createCounterStyleFromSymbols(value, '甲乙丙丁戊己庚辛壬癸', cjkSuffix);
            case LIST_STYLE_TYPE.CJK_IDEOGRAPHIC:
            case LIST_STYLE_TYPE.TRAD_CHINESE_INFORMAL:
                return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
            case LIST_STYLE_TYPE.TRAD_CHINESE_FORMAL:
                return createCJKCounter(value, '零壹貳參肆伍陸柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
            case LIST_STYLE_TYPE.SIMP_CHINESE_INFORMAL:
                return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
            case LIST_STYLE_TYPE.SIMP_CHINESE_FORMAL:
                return createCJKCounter(value, '零壹贰叁肆伍陆柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
            case LIST_STYLE_TYPE.JAPANESE_INFORMAL:
                return createCJKCounter(value, '〇一二三四五六七八九', '十百千万', JAPANESE_NEGATIVE, cjkSuffix, 0);
            case LIST_STYLE_TYPE.JAPANESE_FORMAL:
                return createCJKCounter(value, '零壱弐参四伍六七八九', '拾百千万', JAPANESE_NEGATIVE, cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
            case LIST_STYLE_TYPE.KOREAN_HANGUL_FORMAL:
                return createCJKCounter(value, '영일이삼사오육칠팔구', '십백천만', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
            case LIST_STYLE_TYPE.KOREAN_HANJA_INFORMAL:
                return createCJKCounter(value, '零一二三四五六七八九', '十百千萬', KOREAN_NEGATIVE, koreanSuffix, 0);
            case LIST_STYLE_TYPE.KOREAN_HANJA_FORMAL:
                return createCJKCounter(value, '零壹貳參四五六七八九', '拾百千', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
            case LIST_STYLE_TYPE.DEVANAGARI:
                return createCounterStyleFromRange(value, 0x966, 0x96f, true, defaultSuffix);
            case LIST_STYLE_TYPE.GEORGIAN:
                return createAdditiveCounter(value, 1, 19999, GEORGIAN, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);
            case LIST_STYLE_TYPE.GUJARATI:
                return createCounterStyleFromRange(value, 0xae6, 0xaef, true, defaultSuffix);
            case LIST_STYLE_TYPE.GURMUKHI:
                return createCounterStyleFromRange(value, 0xa66, 0xa6f, true, defaultSuffix);
            case LIST_STYLE_TYPE.HEBREW:
                return createAdditiveCounter(value, 1, 10999, HEBREW, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);
            case LIST_STYLE_TYPE.HIRAGANA:
                return createCounterStyleFromSymbols(value, 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん');
            case LIST_STYLE_TYPE.HIRAGANA_IROHA:
                return createCounterStyleFromSymbols(value, 'いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす');
            case LIST_STYLE_TYPE.KANNADA:
                return createCounterStyleFromRange(value, 0xce6, 0xcef, true, defaultSuffix);
            case LIST_STYLE_TYPE.KATAKANA:
                return createCounterStyleFromSymbols(value, 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン', cjkSuffix);
            case LIST_STYLE_TYPE.KATAKANA_IROHA:
                return createCounterStyleFromSymbols(value, 'イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス', cjkSuffix);
            case LIST_STYLE_TYPE.LAO:
                return createCounterStyleFromRange(value, 0xed0, 0xed9, true, defaultSuffix);
            case LIST_STYLE_TYPE.MONGOLIAN:
                return createCounterStyleFromRange(value, 0x1810, 0x1819, true, defaultSuffix);
            case LIST_STYLE_TYPE.MYANMAR:
                return createCounterStyleFromRange(value, 0x1040, 0x1049, true, defaultSuffix);
            case LIST_STYLE_TYPE.ORIYA:
                return createCounterStyleFromRange(value, 0xb66, 0xb6f, true, defaultSuffix);
            case LIST_STYLE_TYPE.PERSIAN:
                return createCounterStyleFromRange(value, 0x6f0, 0x6f9, true, defaultSuffix);
            case LIST_STYLE_TYPE.TAMIL:
                return createCounterStyleFromRange(value, 0xbe6, 0xbef, true, defaultSuffix);
            case LIST_STYLE_TYPE.TELUGU:
                return createCounterStyleFromRange(value, 0xc66, 0xc6f, true, defaultSuffix);
            case LIST_STYLE_TYPE.THAI:
                return createCounterStyleFromRange(value, 0xe50, 0xe59, true, defaultSuffix);
            case LIST_STYLE_TYPE.TIBETAN:
                return createCounterStyleFromRange(value, 0xf20, 0xf29, true, defaultSuffix);
            case LIST_STYLE_TYPE.DECIMAL:
            default:
                return createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
        }
    };

    var IGNORE_ATTRIBUTE = 'data-html2canvas-ignore';
    var DocumentCloner = /** @class */ (function () {
        function DocumentCloner(element, options) {
            this.options = options;
            this.scrolledElements = [];
            this.referenceElement = element;
            this.counters = new CounterState();
            this.quoteDepth = 0;
            if (!element.ownerDocument) {
                throw new Error('Cloned element does not have an owner document');
            }
            this.documentElement = this.cloneNode(element.ownerDocument.documentElement);
        }
        DocumentCloner.prototype.toIFrame = function (ownerDocument, windowSize) {
            var _this = this;
            var iframe = createIFrameContainer(ownerDocument, windowSize);
            if (!iframe.contentWindow) {
                return Promise.reject("Unable to find iframe window");
            }
            var scrollX = ownerDocument.defaultView.pageXOffset;
            var scrollY = ownerDocument.defaultView.pageYOffset;
            var cloneWindow = iframe.contentWindow;
            var documentClone = cloneWindow.document;
            /* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle
             if window url is about:blank, we can assign the url to current by writing onto the document
             */
            var iframeLoad = iframeLoader(iframe).then(function () { return __awaiter(_this, void 0, void 0, function () {
                var onclone;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.scrolledElements.forEach(restoreNodeScroll);
                            if (cloneWindow) {
                                cloneWindow.scrollTo(windowSize.left, windowSize.top);
                                if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) &&
                                    (cloneWindow.scrollY !== windowSize.top || cloneWindow.scrollX !== windowSize.left)) {
                                    documentClone.documentElement.style.top = -windowSize.top + 'px';
                                    documentClone.documentElement.style.left = -windowSize.left + 'px';
                                    documentClone.documentElement.style.position = 'absolute';
                                }
                            }
                            onclone = this.options.onclone;
                            if (typeof this.clonedReferenceElement === 'undefined') {
                                return [2 /*return*/, Promise.reject("Error finding the " + this.referenceElement.nodeName + " in the cloned document")];
                            }
                            if (!(documentClone.fonts && documentClone.fonts.ready)) return [3 /*break*/, 2];
                            return [4 /*yield*/, documentClone.fonts.ready];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            if (typeof onclone === 'function') {
                                return [2 /*return*/, Promise.resolve()
                                        .then(function () { return onclone(documentClone); })
                                        .then(function () { return iframe; })];
                            }
                            return [2 /*return*/, iframe];
                    }
                });
            }); });
            documentClone.open();
            documentClone.write(serializeDoctype(document.doctype) + "<html></html>");
            // Chrome scrolls the parent document for some reason after the write to the cloned window???
            restoreOwnerScroll(this.referenceElement.ownerDocument, scrollX, scrollY);
            documentClone.replaceChild(documentClone.adoptNode(this.documentElement), documentClone.documentElement);
            documentClone.close();
            return iframeLoad;
        };
        DocumentCloner.prototype.createElementClone = function (node) {
            if (isCanvasElement(node)) {
                return this.createCanvasClone(node);
            }
            /*
            if (isIFrameElement(node)) {
                return this.createIFrameClone(node);
            }
    */
            if (isStyleElement(node)) {
                return this.createStyleClone(node);
            }
            var clone = node.cloneNode(false);
            // @ts-ignore
            if (isImageElement(clone) && clone.loading === 'lazy') {
                // @ts-ignore
                clone.loading = 'eager';
            }
            return clone;
        };
        DocumentCloner.prototype.createStyleClone = function (node) {
            try {
                var sheet = node.sheet;
                if (sheet && sheet.cssRules) {
                    var css = [].slice.call(sheet.cssRules, 0).reduce(function (css, rule) {
                        if (rule && typeof rule.cssText === 'string') {
                            return css + rule.cssText;
                        }
                        return css;
                    }, '');
                    var style = node.cloneNode(false);
                    style.textContent = css;
                    return style;
                }
            }
            catch (e) {
                // accessing node.sheet.cssRules throws a DOMException
                Logger.getInstance(this.options.id).error('Unable to access cssRules property', e);
                if (e.name !== 'SecurityError') {
                    throw e;
                }
            }
            return node.cloneNode(false);
        };
        DocumentCloner.prototype.createCanvasClone = function (canvas) {
            if (this.options.inlineImages && canvas.ownerDocument) {
                var img = canvas.ownerDocument.createElement('img');
                try {
                    img.src = canvas.toDataURL();
                    return img;
                }
                catch (e) {
                    Logger.getInstance(this.options.id).info("Unable to clone canvas contents, canvas is tainted");
                }
            }
            var clonedCanvas = canvas.cloneNode(false);
            try {
                clonedCanvas.width = canvas.width;
                clonedCanvas.height = canvas.height;
                var ctx = canvas.getContext('2d');
                var clonedCtx = clonedCanvas.getContext('2d');
                if (clonedCtx) {
                    if (ctx) {
                        clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
                    }
                    else {
                        clonedCtx.drawImage(canvas, 0, 0);
                    }
                }
                return clonedCanvas;
            }
            catch (e) { }
            return clonedCanvas;
        };
        /*
        createIFrameClone(iframe: HTMLIFrameElement) {
            const tempIframe = <HTMLIFrameElement>iframe.cloneNode(false);
            const iframeKey = generateIframeKey();
            tempIframe.setAttribute('data-html2canvas-internal-iframe-key', iframeKey);

            const {width, height} = parseBounds(iframe);

            this.resourceLoader.cache[iframeKey] = getIframeDocumentElement(iframe, this.options)
                .then(documentElement => {
                    return this.renderer(
                        documentElement,
                        {
                            allowTaint: this.options.allowTaint,
                            backgroundColor: '#ffffff',
                            canvas: null,
                            imageTimeout: this.options.imageTimeout,
                            logging: this.options.logging,
                            proxy: this.options.proxy,
                            removeContainer: this.options.removeContainer,
                            scale: this.options.scale,
                            foreignObjectRendering: this.options.foreignObjectRendering,
                            useCORS: this.options.useCORS,
                            target: new CanvasRenderer(),
                            width,
                            height,
                            x: 0,
                            y: 0,
                            windowWidth: documentElement.ownerDocument.defaultView.innerWidth,
                            windowHeight: documentElement.ownerDocument.defaultView.innerHeight,
                            scrollX: documentElement.ownerDocument.defaultView.pageXOffset,
                            scrollY: documentElement.ownerDocument.defaultView.pageYOffset
                        },
                    );
                })
                .then(
                    (canvas: HTMLCanvasElement) =>
                        new Promise((resolve, reject) => {
                            const iframeCanvas = document.createElement('img');
                            iframeCanvas.onload = () => resolve(canvas);
                            iframeCanvas.onerror = (event) => {
                                // Empty iframes may result in empty "data:," URLs, which are invalid from the <img>'s point of view
                                // and instead of `onload` cause `onerror` and unhandled rejection warnings
                                // https://github.com/niklasvh/html2canvas/issues/1502
                                iframeCanvas.src == 'data:,' ? resolve(canvas) : reject(event);
                            };
                            iframeCanvas.src = canvas.toDataURL();
                            if (tempIframe.parentNode && iframe.ownerDocument && iframe.ownerDocument.defaultView) {
                                tempIframe.parentNode.replaceChild(
                                    copyCSSStyles(
                                        iframe.ownerDocument.defaultView.getComputedStyle(iframe),
                                        iframeCanvas
                                    ),
                                    tempIframe
                                );
                            }
                        })
                );
            return tempIframe;
        }
    */
        DocumentCloner.prototype.cloneNode = function (node) {
            if (isTextNode(node)) {
                return document.createTextNode(node.data);
            }
            if (!node.ownerDocument) {
                return node.cloneNode(false);
            }
            var window = node.ownerDocument.defaultView;
            if (window && isElementNode(node) && (isHTMLElementNode(node) || isSVGElementNode(node))) {
                var clone = this.createElementClone(node);
                var style = window.getComputedStyle(node);
                var styleBefore = window.getComputedStyle(node, ':before');
                var styleAfter = window.getComputedStyle(node, ':after');
                if (this.referenceElement === node && isHTMLElementNode(clone)) {
                    this.clonedReferenceElement = clone;
                }
                if (isBodyElement(clone)) {
                    createPseudoHideStyles(clone);
                }
                var counters = this.counters.parse(new CSSParsedCounterDeclaration(style));
                var before = this.resolvePseudoContent(node, clone, styleBefore, PseudoElementType.BEFORE);
                for (var child = node.firstChild; child; child = child.nextSibling) {
                    if (!isElementNode(child) ||
                        (!isScriptElement(child) &&
                            !child.hasAttribute(IGNORE_ATTRIBUTE) &&
                            (typeof this.options.ignoreElements !== 'function' || !this.options.ignoreElements(child)))) {
                        if (!this.options.copyStyles || !isElementNode(child) || !isStyleElement(child)) {
                            clone.appendChild(this.cloneNode(child));
                        }
                    }
                }
                if (before) {
                    clone.insertBefore(before, clone.firstChild);
                }
                var after = this.resolvePseudoContent(node, clone, styleAfter, PseudoElementType.AFTER);
                if (after) {
                    clone.appendChild(after);
                }
                this.counters.pop(counters);
                if (style && (this.options.copyStyles || isSVGElementNode(node)) && !isIFrameElement(node)) {
                    copyCSSStyles(style, clone);
                }
                //this.inlineAllImages(clone);
                if (node.scrollTop !== 0 || node.scrollLeft !== 0) {
                    this.scrolledElements.push([clone, node.scrollLeft, node.scrollTop]);
                }
                if ((isTextareaElement(node) || isSelectElement(node)) &&
                    (isTextareaElement(clone) || isSelectElement(clone))) {
                    clone.value = node.value;
                }
                return clone;
            }
            return node.cloneNode(false);
        };
        DocumentCloner.prototype.resolvePseudoContent = function (node, clone, style, pseudoElt) {
            var _this = this;
            if (!style) {
                return;
            }
            var value = style.content;
            var document = clone.ownerDocument;
            if (!document || !value || value === 'none' || value === '-moz-alt-content' || style.display === 'none') {
                return;
            }
            this.counters.parse(new CSSParsedCounterDeclaration(style));
            var declaration = new CSSParsedPseudoDeclaration(style);
            var anonymousReplacedElement = document.createElement('html2canvaspseudoelement');
            copyCSSStyles(style, anonymousReplacedElement);
            declaration.content.forEach(function (token) {
                if (token.type === TokenType.STRING_TOKEN) {
                    anonymousReplacedElement.appendChild(document.createTextNode(token.value));
                }
                else if (token.type === TokenType.URL_TOKEN) {
                    var img = document.createElement('img');
                    img.src = token.value;
                    img.style.opacity = '1';
                    anonymousReplacedElement.appendChild(img);
                }
                else if (token.type === TokenType.FUNCTION) {
                    if (token.name === 'attr') {
                        var attr = token.values.filter(isIdentToken);
                        if (attr.length) {
                            anonymousReplacedElement.appendChild(document.createTextNode(node.getAttribute(attr[0].value) || ''));
                        }
                    }
                    else if (token.name === 'counter') {
                        var _a = token.values.filter(nonFunctionArgSeparator), counter = _a[0], counterStyle = _a[1];
                        if (counter && isIdentToken(counter)) {
                            var counterState = _this.counters.getCounterValue(counter.value);
                            var counterType = counterStyle && isIdentToken(counterStyle)
                                ? listStyleType.parse(counterStyle.value)
                                : LIST_STYLE_TYPE.DECIMAL;
                            anonymousReplacedElement.appendChild(document.createTextNode(createCounterText(counterState, counterType, false)));
                        }
                    }
                    else if (token.name === 'counters') {
                        var _b = token.values.filter(nonFunctionArgSeparator), counter = _b[0], delim = _b[1], counterStyle = _b[2];
                        if (counter && isIdentToken(counter)) {
                            var counterStates = _this.counters.getCounterValues(counter.value);
                            var counterType_1 = counterStyle && isIdentToken(counterStyle)
                                ? listStyleType.parse(counterStyle.value)
                                : LIST_STYLE_TYPE.DECIMAL;
                            var separator = delim && delim.type === TokenType.STRING_TOKEN ? delim.value : '';
                            var text = counterStates
                                .map(function (value) { return createCounterText(value, counterType_1, false); })
                                .join(separator);
                            anonymousReplacedElement.appendChild(document.createTextNode(text));
                        }
                    }
                }
                else if (token.type === TokenType.IDENT_TOKEN) {
                    switch (token.value) {
                        case 'open-quote':
                            anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, _this.quoteDepth++, true)));
                            break;
                        case 'close-quote':
                            anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, --_this.quoteDepth, false)));
                            break;
                        default:
                            // safari doesn't parse string tokens correctly because of lack of quotes
                            anonymousReplacedElement.appendChild(document.createTextNode(token.value));
                    }
                }
            });
            anonymousReplacedElement.className = PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + " " + PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
            var newClassName = pseudoElt === PseudoElementType.BEFORE
                ? " " + PSEUDO_HIDE_ELEMENT_CLASS_BEFORE
                : " " + PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
            if (isSVGElementNode(clone)) {
                clone.className.baseValue += newClassName;
            }
            else {
                clone.className += newClassName;
            }
            return anonymousReplacedElement;
        };
        DocumentCloner.destroy = function (container) {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
                return true;
            }
            return false;
        };
        return DocumentCloner;
    }());
    var PseudoElementType;
    (function (PseudoElementType) {
        PseudoElementType[PseudoElementType["BEFORE"] = 0] = "BEFORE";
        PseudoElementType[PseudoElementType["AFTER"] = 1] = "AFTER";
    })(PseudoElementType || (PseudoElementType = {}));
    var createIFrameContainer = function (ownerDocument, bounds) {
        var cloneIframeContainer = ownerDocument.createElement('iframe');
        cloneIframeContainer.className = 'html2canvas-container';
        cloneIframeContainer.style.visibility = 'hidden';
        cloneIframeContainer.style.position = 'fixed';
        cloneIframeContainer.style.left = '-10000px';
        cloneIframeContainer.style.top = '0px';
        cloneIframeContainer.style.border = '0';
        cloneIframeContainer.width = bounds.width.toString();
        cloneIframeContainer.height = bounds.height.toString();
        cloneIframeContainer.scrolling = 'no'; // ios won't scroll without it
        cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, 'true');
        ownerDocument.body.appendChild(cloneIframeContainer);
        return cloneIframeContainer;
    };
    var iframeLoader = function (iframe) {
        return new Promise(function (resolve, reject) {
            var cloneWindow = iframe.contentWindow;
            if (!cloneWindow) {
                return reject("No window assigned for iframe");
            }
            var documentClone = cloneWindow.document;
            cloneWindow.onload = iframe.onload = documentClone.onreadystatechange = function () {
                cloneWindow.onload = iframe.onload = documentClone.onreadystatechange = null;
                var interval = setInterval(function () {
                    if (documentClone.body.childNodes.length > 0 && documentClone.readyState === 'complete') {
                        clearInterval(interval);
                        resolve(iframe);
                    }
                }, 50);
            };
        });
    };
    var copyCSSStyles = function (style, target) {
        // Edge does not provide value for cssText
        for (var i = style.length - 1; i >= 0; i--) {
            var property = style.item(i);
            // Safari shows pseudoelements if content is set
            if (property !== 'content') {
                target.style.setProperty(property, style.getPropertyValue(property));
            }
        }
        return target;
    };
    var serializeDoctype = function (doctype) {
        var str = '';
        if (doctype) {
            str += '<!DOCTYPE ';
            if (doctype.name) {
                str += doctype.name;
            }
            if (doctype.internalSubset) {
                str += doctype.internalSubset;
            }
            if (doctype.publicId) {
                str += "\"" + doctype.publicId + "\"";
            }
            if (doctype.systemId) {
                str += "\"" + doctype.systemId + "\"";
            }
            str += '>';
        }
        return str;
    };
    var restoreOwnerScroll = function (ownerDocument, x, y) {
        if (ownerDocument &&
            ownerDocument.defaultView &&
            (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)) {
            ownerDocument.defaultView.scrollTo(x, y);
        }
    };
    var restoreNodeScroll = function (_a) {
        var element = _a[0], x = _a[1], y = _a[2];
        element.scrollLeft = x;
        element.scrollTop = y;
    };
    var PSEUDO_BEFORE = ':before';
    var PSEUDO_AFTER = ':after';
    var PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = '___html2canvas___pseudoelement_before';
    var PSEUDO_HIDE_ELEMENT_CLASS_AFTER = '___html2canvas___pseudoelement_after';
    var PSEUDO_HIDE_ELEMENT_STYLE = "{\n    content: \"\" !important;\n    display: none !important;\n}";
    var createPseudoHideStyles = function (body) {
        createStyles(body, "." + PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + PSEUDO_BEFORE + PSEUDO_HIDE_ELEMENT_STYLE + "\n         ." + PSEUDO_HIDE_ELEMENT_CLASS_AFTER + PSEUDO_AFTER + PSEUDO_HIDE_ELEMENT_STYLE);
    };
    var createStyles = function (body, styles) {
        var document = body.ownerDocument;
        if (document) {
            var style = document.createElement('style');
            style.textContent = styles;
            body.appendChild(style);
        }
    };

    var PathType;
    (function (PathType) {
        PathType[PathType["VECTOR"] = 0] = "VECTOR";
        PathType[PathType["BEZIER_CURVE"] = 1] = "BEZIER_CURVE";
    })(PathType || (PathType = {}));
    var equalPath = function (a, b) {
        if (a.length === b.length) {
            return a.some(function (v, i) { return v === b[i]; });
        }
        return false;
    };
    var transformPath = function (path, deltaX, deltaY, deltaW, deltaH) {
        return path.map(function (point, index) {
            switch (index) {
                case 0:
                    return point.add(deltaX, deltaY);
                case 1:
                    return point.add(deltaX + deltaW, deltaY);
                case 2:
                    return point.add(deltaX + deltaW, deltaY + deltaH);
                case 3:
                    return point.add(deltaX, deltaY + deltaH);
            }
            return point;
        });
    };

    var Vector = /** @class */ (function () {
        function Vector(x, y) {
            this.type = PathType.VECTOR;
            this.x = x;
            this.y = y;
        }
        Vector.prototype.add = function (deltaX, deltaY) {
            return new Vector(this.x + deltaX, this.y + deltaY);
        };
        return Vector;
    }());

    var lerp = function (a, b, t) {
        return new Vector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    };
    var BezierCurve = /** @class */ (function () {
        function BezierCurve(start, startControl, endControl, end) {
            this.type = PathType.BEZIER_CURVE;
            this.start = start;
            this.startControl = startControl;
            this.endControl = endControl;
            this.end = end;
        }
        BezierCurve.prototype.subdivide = function (t, firstHalf) {
            var ab = lerp(this.start, this.startControl, t);
            var bc = lerp(this.startControl, this.endControl, t);
            var cd = lerp(this.endControl, this.end, t);
            var abbc = lerp(ab, bc, t);
            var bccd = lerp(bc, cd, t);
            var dest = lerp(abbc, bccd, t);
            return firstHalf ? new BezierCurve(this.start, ab, abbc, dest) : new BezierCurve(dest, bccd, cd, this.end);
        };
        BezierCurve.prototype.add = function (deltaX, deltaY) {
            return new BezierCurve(this.start.add(deltaX, deltaY), this.startControl.add(deltaX, deltaY), this.endControl.add(deltaX, deltaY), this.end.add(deltaX, deltaY));
        };
        BezierCurve.prototype.reverse = function () {
            return new BezierCurve(this.end, this.endControl, this.startControl, this.start);
        };
        return BezierCurve;
    }());
    var isBezierCurve = function (path) { return path.type === PathType.BEZIER_CURVE; };

    var BoundCurves = /** @class */ (function () {
        function BoundCurves(element) {
            var styles = element.styles;
            var bounds = element.bounds;
            var _a = getAbsoluteValueForTuple(styles.borderTopLeftRadius, bounds.width, bounds.height), tlh = _a[0], tlv = _a[1];
            var _b = getAbsoluteValueForTuple(styles.borderTopRightRadius, bounds.width, bounds.height), trh = _b[0], trv = _b[1];
            var _c = getAbsoluteValueForTuple(styles.borderBottomRightRadius, bounds.width, bounds.height), brh = _c[0], brv = _c[1];
            var _d = getAbsoluteValueForTuple(styles.borderBottomLeftRadius, bounds.width, bounds.height), blh = _d[0], blv = _d[1];
            var factors = [];
            factors.push((tlh + trh) / bounds.width);
            factors.push((blh + brh) / bounds.width);
            factors.push((tlv + blv) / bounds.height);
            factors.push((trv + brv) / bounds.height);
            var maxFactor = Math.max.apply(Math, factors);
            if (maxFactor > 1) {
                tlh /= maxFactor;
                tlv /= maxFactor;
                trh /= maxFactor;
                trv /= maxFactor;
                brh /= maxFactor;
                brv /= maxFactor;
                blh /= maxFactor;
                blv /= maxFactor;
            }
            var topWidth = bounds.width - trh;
            var rightHeight = bounds.height - brv;
            var bottomWidth = bounds.width - brh;
            var leftHeight = bounds.height - blv;
            var borderTopWidth = styles.borderTopWidth;
            var borderRightWidth = styles.borderRightWidth;
            var borderBottomWidth = styles.borderBottomWidth;
            var borderLeftWidth = styles.borderLeftWidth;
            var paddingTop = getAbsoluteValue(styles.paddingTop, element.bounds.width);
            var paddingRight = getAbsoluteValue(styles.paddingRight, element.bounds.width);
            var paddingBottom = getAbsoluteValue(styles.paddingBottom, element.bounds.width);
            var paddingLeft = getAbsoluteValue(styles.paddingLeft, element.bounds.width);
            this.topLeftBorderBox =
                tlh > 0 || tlv > 0
                    ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT)
                    : new Vector(bounds.left, bounds.top);
            this.topRightBorderBox =
                trh > 0 || trv > 0
                    ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, CORNER.TOP_RIGHT)
                    : new Vector(bounds.left + bounds.width, bounds.top);
            this.bottomRightBorderBox =
                brh > 0 || brv > 0
                    ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, CORNER.BOTTOM_RIGHT)
                    : new Vector(bounds.left + bounds.width, bounds.top + bounds.height);
            this.bottomLeftBorderBox =
                blh > 0 || blv > 0
                    ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, CORNER.BOTTOM_LEFT)
                    : new Vector(bounds.left, bounds.top + bounds.height);
            this.topLeftPaddingBox =
                tlh > 0 || tlv > 0
                    ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + borderTopWidth, Math.max(0, tlh - borderLeftWidth), Math.max(0, tlv - borderTopWidth), CORNER.TOP_LEFT)
                    : new Vector(bounds.left + borderLeftWidth, bounds.top + borderTopWidth);
            this.topRightPaddingBox =
                trh > 0 || trv > 0
                    ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth), bounds.top + borderTopWidth, topWidth > bounds.width + borderLeftWidth ? 0 : trh - borderLeftWidth, trv - borderTopWidth, CORNER.TOP_RIGHT)
                    : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + borderTopWidth);
            this.bottomRightPaddingBox =
                brh > 0 || brv > 0
                    ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - borderLeftWidth), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth), Math.max(0, brh - borderRightWidth), brv - borderBottomWidth, CORNER.BOTTOM_RIGHT)
                    : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + bounds.height - borderBottomWidth);
            this.bottomLeftPaddingBox =
                blh > 0 || blv > 0
                    ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + leftHeight, Math.max(0, blh - borderLeftWidth), blv - borderBottomWidth, CORNER.BOTTOM_LEFT)
                    : new Vector(bounds.left + borderLeftWidth, bounds.top + bounds.height - borderBottomWidth);
            this.topLeftContentBox =
                tlh > 0 || tlv > 0
                    ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop, Math.max(0, tlh - (borderLeftWidth + paddingLeft)), Math.max(0, tlv - (borderTopWidth + paddingTop)), CORNER.TOP_LEFT)
                    : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop);
            this.topRightContentBox =
                trh > 0 || trv > 0
                    ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth + paddingLeft), bounds.top + borderTopWidth + paddingTop, topWidth > bounds.width + borderLeftWidth + paddingLeft ? 0 : trh - borderLeftWidth + paddingLeft, trv - (borderTopWidth + paddingTop), CORNER.TOP_RIGHT)
                    : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + borderTopWidth + paddingTop);
            this.bottomRightContentBox =
                brh > 0 || brv > 0
                    ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - (borderLeftWidth + paddingLeft)), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth + paddingTop), Math.max(0, brh - (borderRightWidth + paddingRight)), brv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_RIGHT)
                    : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
            this.bottomLeftContentBox =
                blh > 0 || blv > 0
                    ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + leftHeight, Math.max(0, blh - (borderLeftWidth + paddingLeft)), blv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_LEFT)
                    : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
        }
        return BoundCurves;
    }());
    var CORNER;
    (function (CORNER) {
        CORNER[CORNER["TOP_LEFT"] = 0] = "TOP_LEFT";
        CORNER[CORNER["TOP_RIGHT"] = 1] = "TOP_RIGHT";
        CORNER[CORNER["BOTTOM_RIGHT"] = 2] = "BOTTOM_RIGHT";
        CORNER[CORNER["BOTTOM_LEFT"] = 3] = "BOTTOM_LEFT";
    })(CORNER || (CORNER = {}));
    var getCurvePoints = function (x, y, r1, r2, position) {
        var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
        var ox = r1 * kappa; // control point offset horizontal
        var oy = r2 * kappa; // control point offset vertical
        var xm = x + r1; // x-middle
        var ym = y + r2; // y-middle
        switch (position) {
            case CORNER.TOP_LEFT:
                return new BezierCurve(new Vector(x, ym), new Vector(x, ym - oy), new Vector(xm - ox, y), new Vector(xm, y));
            case CORNER.TOP_RIGHT:
                return new BezierCurve(new Vector(x, y), new Vector(x + ox, y), new Vector(xm, ym - oy), new Vector(xm, ym));
            case CORNER.BOTTOM_RIGHT:
                return new BezierCurve(new Vector(xm, y), new Vector(xm, y + oy), new Vector(x + ox, ym), new Vector(x, ym));
            case CORNER.BOTTOM_LEFT:
            default:
                return new BezierCurve(new Vector(xm, ym), new Vector(xm - ox, ym), new Vector(x, y + oy), new Vector(x, y));
        }
    };
    var calculateBorderBoxPath = function (curves) {
        return [curves.topLeftBorderBox, curves.topRightBorderBox, curves.bottomRightBorderBox, curves.bottomLeftBorderBox];
    };
    var calculateContentBoxPath = function (curves) {
        return [
            curves.topLeftContentBox,
            curves.topRightContentBox,
            curves.bottomRightContentBox,
            curves.bottomLeftContentBox
        ];
    };
    var calculatePaddingBoxPath = function (curves) {
        return [
            curves.topLeftPaddingBox,
            curves.topRightPaddingBox,
            curves.bottomRightPaddingBox,
            curves.bottomLeftPaddingBox
        ];
    };

    var TransformEffect = /** @class */ (function () {
        function TransformEffect(offsetX, offsetY, matrix) {
            this.type = 0 /* TRANSFORM */;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
            this.matrix = matrix;
            this.target = 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */;
        }
        return TransformEffect;
    }());
    var ClipEffect = /** @class */ (function () {
        function ClipEffect(path, target) {
            this.type = 1 /* CLIP */;
            this.target = target;
            this.path = path;
        }
        return ClipEffect;
    }());
    var isTransformEffect = function (effect) {
        return effect.type === 0 /* TRANSFORM */;
    };
    var isClipEffect = function (effect) { return effect.type === 1 /* CLIP */; };

    var StackingContext = /** @class */ (function () {
        function StackingContext(container) {
            this.element = container;
            this.inlineLevel = [];
            this.nonInlineLevel = [];
            this.negativeZIndex = [];
            this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
            this.positiveZIndex = [];
            this.nonPositionedFloats = [];
            this.nonPositionedInlineLevel = [];
        }
        return StackingContext;
    }());
    var ElementPaint = /** @class */ (function () {
        function ElementPaint(element, parentStack) {
            this.container = element;
            this.effects = parentStack.slice(0);
            this.curves = new BoundCurves(element);
            if (element.styles.transform !== null) {
                var offsetX = element.bounds.left + element.styles.transformOrigin[0].number;
                var offsetY = element.bounds.top + element.styles.transformOrigin[1].number;
                var matrix = element.styles.transform;
                this.effects.push(new TransformEffect(offsetX, offsetY, matrix));
            }
            if (element.styles.overflowX !== OVERFLOW.VISIBLE) {
                var borderBox = calculateBorderBoxPath(this.curves);
                var paddingBox = calculatePaddingBoxPath(this.curves);
                if (equalPath(borderBox, paddingBox)) {
                    this.effects.push(new ClipEffect(borderBox, 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */));
                }
                else {
                    this.effects.push(new ClipEffect(borderBox, 2 /* BACKGROUND_BORDERS */));
                    this.effects.push(new ClipEffect(paddingBox, 4 /* CONTENT */));
                }
            }
        }
        ElementPaint.prototype.getParentEffects = function () {
            var effects = this.effects.slice(0);
            if (this.container.styles.overflowX !== OVERFLOW.VISIBLE) {
                var borderBox = calculateBorderBoxPath(this.curves);
                var paddingBox = calculatePaddingBoxPath(this.curves);
                if (!equalPath(borderBox, paddingBox)) {
                    effects.push(new ClipEffect(paddingBox, 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */));
                }
            }
            return effects;
        };
        return ElementPaint;
    }());
    var parseStackTree = function (parent, stackingContext, realStackingContext, listItems) {
        parent.container.elements.forEach(function (child) {
            var treatAsRealStackingContext = contains(child.flags, 4 /* CREATES_REAL_STACKING_CONTEXT */);
            var createsStackingContext = contains(child.flags, 2 /* CREATES_STACKING_CONTEXT */);
            var paintContainer = new ElementPaint(child, parent.getParentEffects());
            if (contains(child.styles.display, 2048 /* LIST_ITEM */)) {
                listItems.push(paintContainer);
            }
            var listOwnerItems = contains(child.flags, 8 /* IS_LIST_OWNER */) ? [] : listItems;
            if (treatAsRealStackingContext || createsStackingContext) {
                var parentStack = treatAsRealStackingContext || child.styles.isPositioned() ? realStackingContext : stackingContext;
                var stack = new StackingContext(paintContainer);
                if (child.styles.isPositioned() || child.styles.opacity < 1 || child.styles.isTransformed()) {
                    var order_1 = child.styles.zIndex.order;
                    if (order_1 < 0) {
                        var index_1 = 0;
                        parentStack.negativeZIndex.some(function (current, i) {
                            if (order_1 > current.element.container.styles.zIndex.order) {
                                index_1 = i;
                                return false;
                            }
                            else if (index_1 > 0) {
                                return true;
                            }
                            return false;
                        });
                        parentStack.negativeZIndex.splice(index_1, 0, stack);
                    }
                    else if (order_1 > 0) {
                        var index_2 = 0;
                        parentStack.positiveZIndex.some(function (current, i) {
                            if (order_1 >= current.element.container.styles.zIndex.order) {
                                index_2 = i + 1;
                                return false;
                            }
                            else if (index_2 > 0) {
                                return true;
                            }
                            return false;
                        });
                        parentStack.positiveZIndex.splice(index_2, 0, stack);
                    }
                    else {
                        parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
                    }
                }
                else {
                    if (child.styles.isFloating()) {
                        parentStack.nonPositionedFloats.push(stack);
                    }
                    else {
                        parentStack.nonPositionedInlineLevel.push(stack);
                    }
                }
                parseStackTree(paintContainer, stack, treatAsRealStackingContext ? stack : realStackingContext, listOwnerItems);
            }
            else {
                if (child.styles.isInlineLevel()) {
                    stackingContext.inlineLevel.push(paintContainer);
                }
                else {
                    stackingContext.nonInlineLevel.push(paintContainer);
                }
                parseStackTree(paintContainer, stackingContext, realStackingContext, listOwnerItems);
            }
            if (contains(child.flags, 8 /* IS_LIST_OWNER */)) {
                processListItems(child, listOwnerItems);
            }
        });
    };
    var processListItems = function (owner, elements) {
        var numbering = owner instanceof OLElementContainer ? owner.start : 1;
        var reversed = owner instanceof OLElementContainer ? owner.reversed : false;
        for (var i = 0; i < elements.length; i++) {
            var item = elements[i];
            if (item.container instanceof LIElementContainer &&
                typeof item.container.value === 'number' &&
                item.container.value !== 0) {
                numbering = item.container.value;
            }
            item.listValue = createCounterText(numbering, item.container.styles.listStyleType, true);
            numbering += reversed ? -1 : 1;
        }
    };
    var parseStackingContexts = function (container) {
        var paintContainer = new ElementPaint(container, []);
        var root = new StackingContext(paintContainer);
        var listItems = [];
        parseStackTree(paintContainer, root, root, listItems);
        processListItems(paintContainer.container, listItems);
        return root;
    };

    var parsePathForBorder = function (curves, borderSide) {
        switch (borderSide) {
            case 0:
                return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftPaddingBox, curves.topRightBorderBox, curves.topRightPaddingBox);
            case 1:
                return createPathFromCurves(curves.topRightBorderBox, curves.topRightPaddingBox, curves.bottomRightBorderBox, curves.bottomRightPaddingBox);
            case 2:
                return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox);
            case 3:
            default:
                return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox, curves.topLeftBorderBox, curves.topLeftPaddingBox);
        }
    };
    var createPathFromCurves = function (outer1, inner1, outer2, inner2) {
        var path = [];
        if (isBezierCurve(outer1)) {
            path.push(outer1.subdivide(0.5, false));
        }
        else {
            path.push(outer1);
        }
        if (isBezierCurve(outer2)) {
            path.push(outer2.subdivide(0.5, true));
        }
        else {
            path.push(outer2);
        }
        if (isBezierCurve(inner2)) {
            path.push(inner2.subdivide(0.5, true).reverse());
        }
        else {
            path.push(inner2);
        }
        if (isBezierCurve(inner1)) {
            path.push(inner1.subdivide(0.5, false).reverse());
        }
        else {
            path.push(inner1);
        }
        return path;
    };

    var paddingBox = function (element) {
        var bounds = element.bounds;
        var styles = element.styles;
        return bounds.add(styles.borderLeftWidth, styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth), -(styles.borderTopWidth + styles.borderBottomWidth));
    };
    var contentBox = function (element) {
        var styles = element.styles;
        var bounds = element.bounds;
        var paddingLeft = getAbsoluteValue(styles.paddingLeft, bounds.width);
        var paddingRight = getAbsoluteValue(styles.paddingRight, bounds.width);
        var paddingTop = getAbsoluteValue(styles.paddingTop, bounds.width);
        var paddingBottom = getAbsoluteValue(styles.paddingBottom, bounds.width);
        return bounds.add(paddingLeft + styles.borderLeftWidth, paddingTop + styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth + paddingLeft + paddingRight), -(styles.borderTopWidth + styles.borderBottomWidth + paddingTop + paddingBottom));
    };

    var calculateBackgroundPositioningArea = function (backgroundOrigin, element) {
        if (backgroundOrigin === 0 /* BORDER_BOX */) {
            return element.bounds;
        }
        if (backgroundOrigin === 2 /* CONTENT_BOX */) {
            return contentBox(element);
        }
        return paddingBox(element);
    };
    var calculateBackgroundPaintingArea = function (backgroundClip, element) {
        if (backgroundClip === BACKGROUND_CLIP.BORDER_BOX) {
            return element.bounds;
        }
        if (backgroundClip === BACKGROUND_CLIP.CONTENT_BOX) {
            return contentBox(element);
        }
        return paddingBox(element);
    };
    var calculateBackgroundRendering = function (container, index, intrinsicSize) {
        var backgroundPositioningArea = calculateBackgroundPositioningArea(getBackgroundValueForIndex(container.styles.backgroundOrigin, index), container);
        var backgroundPaintingArea = calculateBackgroundPaintingArea(getBackgroundValueForIndex(container.styles.backgroundClip, index), container);
        var backgroundImageSize = calculateBackgroundSize(getBackgroundValueForIndex(container.styles.backgroundSize, index), intrinsicSize, backgroundPositioningArea);
        var sizeWidth = backgroundImageSize[0], sizeHeight = backgroundImageSize[1];
        var position = getAbsoluteValueForTuple(getBackgroundValueForIndex(container.styles.backgroundPosition, index), backgroundPositioningArea.width - sizeWidth, backgroundPositioningArea.height - sizeHeight);
        var path = calculateBackgroundRepeatPath(getBackgroundValueForIndex(container.styles.backgroundRepeat, index), position, backgroundImageSize, backgroundPositioningArea, backgroundPaintingArea);
        var offsetX = Math.round(backgroundPositioningArea.left + position[0]);
        var offsetY = Math.round(backgroundPositioningArea.top + position[1]);
        return [path, offsetX, offsetY, sizeWidth, sizeHeight];
    };
    var isAuto = function (token) { return isIdentToken(token) && token.value === BACKGROUND_SIZE.AUTO; };
    var hasIntrinsicValue = function (value) { return typeof value === 'number'; };
    var calculateBackgroundSize = function (size, _a, bounds) {
        var intrinsicWidth = _a[0], intrinsicHeight = _a[1], intrinsicProportion = _a[2];
        var first = size[0], second = size[1];
        if (isLengthPercentage(first) && second && isLengthPercentage(second)) {
            return [getAbsoluteValue(first, bounds.width), getAbsoluteValue(second, bounds.height)];
        }
        var hasIntrinsicProportion = hasIntrinsicValue(intrinsicProportion);
        if (isIdentToken(first) && (first.value === BACKGROUND_SIZE.CONTAIN || first.value === BACKGROUND_SIZE.COVER)) {
            if (hasIntrinsicValue(intrinsicProportion)) {
                var targetRatio = bounds.width / bounds.height;
                return targetRatio < intrinsicProportion !== (first.value === BACKGROUND_SIZE.COVER)
                    ? [bounds.width, bounds.width / intrinsicProportion]
                    : [bounds.height * intrinsicProportion, bounds.height];
            }
            return [bounds.width, bounds.height];
        }
        var hasIntrinsicWidth = hasIntrinsicValue(intrinsicWidth);
        var hasIntrinsicHeight = hasIntrinsicValue(intrinsicHeight);
        var hasIntrinsicDimensions = hasIntrinsicWidth || hasIntrinsicHeight;
        // If the background-size is auto or auto auto:
        if (isAuto(first) && (!second || isAuto(second))) {
            // If the image has both horizontal and vertical intrinsic dimensions, it's rendered at that size.
            if (hasIntrinsicWidth && hasIntrinsicHeight) {
                return [intrinsicWidth, intrinsicHeight];
            }
            // If the image has no intrinsic dimensions and has no intrinsic proportions,
            // it's rendered at the size of the background positioning area.
            if (!hasIntrinsicProportion && !hasIntrinsicDimensions) {
                return [bounds.width, bounds.height];
            }
            // TODO If the image has no intrinsic dimensions but has intrinsic proportions, it's rendered as if contain had been specified instead.
            // If the image has only one intrinsic dimension and has intrinsic proportions, it's rendered at the size corresponding to that one dimension.
            // The other dimension is computed using the specified dimension and the intrinsic proportions.
            if (hasIntrinsicDimensions && hasIntrinsicProportion) {
                var width_1 = hasIntrinsicWidth
                    ? intrinsicWidth
                    : intrinsicHeight * intrinsicProportion;
                var height_1 = hasIntrinsicHeight
                    ? intrinsicHeight
                    : intrinsicWidth / intrinsicProportion;
                return [width_1, height_1];
            }
            // If the image has only one intrinsic dimension but has no intrinsic proportions,
            // it's rendered using the specified dimension and the other dimension of the background positioning area.
            var width_2 = hasIntrinsicWidth ? intrinsicWidth : bounds.width;
            var height_2 = hasIntrinsicHeight ? intrinsicHeight : bounds.height;
            return [width_2, height_2];
        }
        // If the image has intrinsic proportions, it's stretched to the specified dimension.
        // The unspecified dimension is computed using the specified dimension and the intrinsic proportions.
        if (hasIntrinsicProportion) {
            var width_3 = 0;
            var height_3 = 0;
            if (isLengthPercentage(first)) {
                width_3 = getAbsoluteValue(first, bounds.width);
            }
            else if (isLengthPercentage(second)) {
                height_3 = getAbsoluteValue(second, bounds.height);
            }
            if (isAuto(first)) {
                width_3 = height_3 * intrinsicProportion;
            }
            else if (!second || isAuto(second)) {
                height_3 = width_3 / intrinsicProportion;
            }
            return [width_3, height_3];
        }
        // If the image has no intrinsic proportions, it's stretched to the specified dimension.
        // The unspecified dimension is computed using the image's corresponding intrinsic dimension,
        // if there is one. If there is no such intrinsic dimension,
        // it becomes the corresponding dimension of the background positioning area.
        var width = null;
        var height = null;
        if (isLengthPercentage(first)) {
            width = getAbsoluteValue(first, bounds.width);
        }
        else if (second && isLengthPercentage(second)) {
            height = getAbsoluteValue(second, bounds.height);
        }
        if (width !== null && (!second || isAuto(second))) {
            height =
                hasIntrinsicWidth && hasIntrinsicHeight
                    ? (width / intrinsicWidth) * intrinsicHeight
                    : bounds.height;
        }
        if (height !== null && isAuto(first)) {
            width =
                hasIntrinsicWidth && hasIntrinsicHeight
                    ? (height / intrinsicHeight) * intrinsicWidth
                    : bounds.width;
        }
        if (width !== null && height !== null) {
            return [width, height];
        }
        throw new Error("Unable to calculate background-size for element");
    };
    var getBackgroundValueForIndex = function (values, index) {
        var value = values[index];
        if (typeof value === 'undefined') {
            return values[0];
        }
        return value;
    };
    var calculateBackgroundRepeatPath = function (repeat, _a, _b, backgroundPositioningArea, backgroundPaintingArea) {
        var x = _a[0], y = _a[1];
        var width = _b[0], height = _b[1];
        switch (repeat) {
            case BACKGROUND_REPEAT.REPEAT_X:
                return [
                    new Vector(Math.round(backgroundPositioningArea.left), Math.round(backgroundPositioningArea.top + y)),
                    new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(backgroundPositioningArea.top + y)),
                    new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(height + backgroundPositioningArea.top + y)),
                    new Vector(Math.round(backgroundPositioningArea.left), Math.round(height + backgroundPositioningArea.top + y))
                ];
            case BACKGROUND_REPEAT.REPEAT_Y:
                return [
                    new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top)),
                    new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top)),
                    new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top)),
                    new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top))
                ];
            case BACKGROUND_REPEAT.NO_REPEAT:
                return [
                    new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y)),
                    new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y)),
                    new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y + height)),
                    new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y + height))
                ];
            default:
                return [
                    new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.top)),
                    new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.top)),
                    new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top)),
                    new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top))
                ];
        }
    };

    var SMALL_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    var SAMPLE_TEXT = 'Hidden Text';
    var FontMetrics = /** @class */ (function () {
        function FontMetrics(document) {
            this._data = {};
            this._document = document;
        }
        FontMetrics.prototype.parseMetrics = function (fontFamily, fontSize) {
            var container = this._document.createElement('div');
            var img = this._document.createElement('img');
            var span = this._document.createElement('span');
            var body = this._document.body;
            container.style.visibility = 'hidden';
            container.style.fontFamily = fontFamily;
            container.style.fontSize = fontSize;
            container.style.margin = '0';
            container.style.padding = '0';
            body.appendChild(container);
            img.src = SMALL_IMAGE;
            img.width = 1;
            img.height = 1;
            img.style.margin = '0';
            img.style.padding = '0';
            img.style.verticalAlign = 'baseline';
            span.style.fontFamily = fontFamily;
            span.style.fontSize = fontSize;
            span.style.margin = '0';
            span.style.padding = '0';
            span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
            container.appendChild(span);
            container.appendChild(img);
            var baseline = img.offsetTop - span.offsetTop + 2;
            container.removeChild(span);
            container.appendChild(this._document.createTextNode(SAMPLE_TEXT));
            container.style.lineHeight = 'normal';
            img.style.verticalAlign = 'super';
            var middle = img.offsetTop - container.offsetTop + 2;
            body.removeChild(container);
            return { baseline: baseline, middle: middle };
        };
        FontMetrics.prototype.getMetrics = function (fontFamily, fontSize) {
            var key = fontFamily + " " + fontSize;
            if (typeof this._data[key] === 'undefined') {
                this._data[key] = this.parseMetrics(fontFamily, fontSize);
            }
            return this._data[key];
        };
        return FontMetrics;
    }());

    var MASK_OFFSET = 10000;
    var CanvasRenderer = /** @class */ (function () {
        function CanvasRenderer(options) {
            this._activeEffects = [];
            this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.options = options;
            if (!options.canvas) {
                this.canvas.width = Math.floor(options.width * options.scale);
                this.canvas.height = Math.floor(options.height * options.scale);
                this.canvas.style.width = options.width + "px";
                this.canvas.style.height = options.height + "px";
            }
            this.fontMetrics = new FontMetrics(document);
            this.ctx.scale(this.options.scale, this.options.scale);
            this.ctx.translate(-options.x + options.scrollX, -options.y + options.scrollY);
            this.ctx.textBaseline = 'bottom';
            this._activeEffects = [];
            Logger.getInstance(options.id).debug("Canvas renderer initialized (" + options.width + "x" + options.height + " at " + options.x + "," + options.y + ") with scale " + options.scale);
        }
        CanvasRenderer.prototype.applyEffects = function (effects, target) {
            var _this = this;
            while (this._activeEffects.length) {
                this.popEffect();
            }
            effects.filter(function (effect) { return contains(effect.target, target); }).forEach(function (effect) { return _this.applyEffect(effect); });
        };
        CanvasRenderer.prototype.applyEffect = function (effect) {
            this.ctx.save();
            if (isTransformEffect(effect)) {
                this.ctx.translate(effect.offsetX, effect.offsetY);
                this.ctx.transform(effect.matrix[0], effect.matrix[1], effect.matrix[2], effect.matrix[3], effect.matrix[4], effect.matrix[5]);
                this.ctx.translate(-effect.offsetX, -effect.offsetY);
            }
            if (isClipEffect(effect)) {
                this.path(effect.path);
                this.ctx.clip();
            }
            this._activeEffects.push(effect);
        };
        CanvasRenderer.prototype.popEffect = function () {
            this._activeEffects.pop();
            this.ctx.restore();
        };
        CanvasRenderer.prototype.renderStack = function (stack) {
            return __awaiter(this, void 0, void 0, function () {
                var styles;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            styles = stack.element.container.styles;
                            if (!styles.isVisible()) return [3 /*break*/, 2];
                            this.ctx.globalAlpha = styles.opacity;
                            return [4 /*yield*/, this.renderStackContent(stack)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        CanvasRenderer.prototype.renderNode = function (paint) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!paint.container.styles.isVisible()) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.renderNodeBackgroundAndBorders(paint)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.renderNodeContent(paint)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        CanvasRenderer.prototype.renderTextWithLetterSpacing = function (text, letterSpacing) {
            var _this = this;
            if (letterSpacing === 0) {
                this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
            }
            else {
                var letters = toCodePoints(text.text).map(function (i) { return fromCodePoint(i); });
                letters.reduce(function (left, letter) {
                    _this.ctx.fillText(letter, left, text.bounds.top + text.bounds.height);
                    return left + _this.ctx.measureText(letter).width;
                }, text.bounds.left);
            }
        };
        CanvasRenderer.prototype.createFontStyle = function (styles) {
            var fontVariant = styles.fontVariant
                .filter(function (variant) { return variant === 'normal' || variant === 'small-caps'; })
                .join('');
            var fontFamily = styles.fontFamily.join(', ');
            var fontSize = isDimensionToken(styles.fontSize)
                ? "" + styles.fontSize.number + styles.fontSize.unit
                : styles.fontSize.number + "px";
            return [
                [styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' '),
                fontFamily,
                fontSize
            ];
        };
        CanvasRenderer.prototype.renderTextNode = function (text, styles) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, font, fontFamily, fontSize;
                var _this = this;
                return __generator(this, function (_b) {
                    _a = this.createFontStyle(styles), font = _a[0], fontFamily = _a[1], fontSize = _a[2];
                    this.ctx.font = font;
                    text.textBounds.forEach(function (text) {
                        _this.ctx.fillStyle = asString(styles.color);
                        _this.renderTextWithLetterSpacing(text, styles.letterSpacing);
                        var textShadows = styles.textShadow;
                        if (textShadows.length && text.text.trim().length) {
                            textShadows
                                .slice(0)
                                .reverse()
                                .forEach(function (textShadow) {
                                _this.ctx.shadowColor = asString(textShadow.color);
                                _this.ctx.shadowOffsetX = textShadow.offsetX.number * _this.options.scale;
                                _this.ctx.shadowOffsetY = textShadow.offsetY.number * _this.options.scale;
                                _this.ctx.shadowBlur = textShadow.blur.number;
                                _this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
                            });
                            _this.ctx.shadowColor = '';
                            _this.ctx.shadowOffsetX = 0;
                            _this.ctx.shadowOffsetY = 0;
                            _this.ctx.shadowBlur = 0;
                        }
                        if (styles.textDecorationLine.length) {
                            _this.ctx.fillStyle = asString(styles.textDecorationColor || styles.color);
                            styles.textDecorationLine.forEach(function (textDecorationLine) {
                                switch (textDecorationLine) {
                                    case 1 /* UNDERLINE */:
                                        // Draws a line at the baseline of the font
                                        // TODO As some browsers display the line as more than 1px if the font-size is big,
                                        // need to take that into account both in position and size
                                        var baseline = _this.fontMetrics.getMetrics(fontFamily, fontSize).baseline;
                                        _this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top + baseline), text.bounds.width, 1);
                                        break;
                                    case 2 /* OVERLINE */:
                                        _this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top), text.bounds.width, 1);
                                        break;
                                    case 3 /* LINE_THROUGH */:
                                        // TODO try and find exact position for line-through
                                        var middle = _this.fontMetrics.getMetrics(fontFamily, fontSize).middle;
                                        _this.ctx.fillRect(text.bounds.left, Math.ceil(text.bounds.top + middle), text.bounds.width, 1);
                                        break;
                                }
                            });
                        }
                    });
                    return [2 /*return*/];
                });
            });
        };
        CanvasRenderer.prototype.renderReplacedElement = function (container, curves, image) {
            if (image && container.intrinsicWidth > 0 && container.intrinsicHeight > 0) {
                var box = contentBox(container);
                var path = calculatePaddingBoxPath(curves);
                this.path(path);
                this.ctx.save();
                this.ctx.clip();
                this.ctx.drawImage(image, 0, 0, container.intrinsicWidth, container.intrinsicHeight, box.left, box.top, box.width, box.height);
                this.ctx.restore();
            }
        };
        CanvasRenderer.prototype.renderNodeContent = function (paint) {
            return __awaiter(this, void 0, void 0, function () {
                var container, curves, styles, _i, _a, child, image, e_1, image, e_2, iframeRenderer, canvas, size, bounds, x, textBounds, img, image, url, e_3, bounds;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this.applyEffects(paint.effects, 4 /* CONTENT */);
                            container = paint.container;
                            curves = paint.curves;
                            styles = container.styles;
                            _i = 0, _a = container.textNodes;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                            child = _a[_i];
                            return [4 /*yield*/, this.renderTextNode(child, styles)];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            if (!(container instanceof ImageElementContainer)) return [3 /*break*/, 8];
                            _b.label = 5;
                        case 5:
                            _b.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, this.options.cache.match(container.src)];
                        case 6:
                            image = _b.sent();
                            this.renderReplacedElement(container, curves, image);
                            return [3 /*break*/, 8];
                        case 7:
                            e_1 = _b.sent();
                            Logger.getInstance(this.options.id).error("Error loading image " + container.src);
                            return [3 /*break*/, 8];
                        case 8:
                            if (container instanceof CanvasElementContainer) {
                                this.renderReplacedElement(container, curves, container.canvas);
                            }
                            if (!(container instanceof SVGElementContainer)) return [3 /*break*/, 12];
                            _b.label = 9;
                        case 9:
                            _b.trys.push([9, 11, , 12]);
                            return [4 /*yield*/, this.options.cache.match(container.svg)];
                        case 10:
                            image = _b.sent();
                            this.renderReplacedElement(container, curves, image);
                            return [3 /*break*/, 12];
                        case 11:
                            e_2 = _b.sent();
                            Logger.getInstance(this.options.id).error("Error loading svg " + container.svg.substring(0, 255));
                            return [3 /*break*/, 12];
                        case 12:
                            if (!(container instanceof IFrameElementContainer && container.tree)) return [3 /*break*/, 14];
                            iframeRenderer = new CanvasRenderer({
                                id: this.options.id,
                                scale: this.options.scale,
                                backgroundColor: container.backgroundColor,
                                x: 0,
                                y: 0,
                                scrollX: 0,
                                scrollY: 0,
                                width: container.width,
                                height: container.height,
                                cache: this.options.cache,
                                windowWidth: container.width,
                                windowHeight: container.height
                            });
                            return [4 /*yield*/, iframeRenderer.render(container.tree)];
                        case 13:
                            canvas = _b.sent();
                            if (container.width && container.height) {
                                this.ctx.drawImage(canvas, 0, 0, container.width, container.height, container.bounds.left, container.bounds.top, container.bounds.width, container.bounds.height);
                            }
                            _b.label = 14;
                        case 14:
                            if (container instanceof InputElementContainer) {
                                size = Math.min(container.bounds.width, container.bounds.height);
                                if (container.type === CHECKBOX) {
                                    if (container.checked) {
                                        this.ctx.save();
                                        this.path([
                                            new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79),
                                            new Vector(container.bounds.left + size * 0.16, container.bounds.top + size * 0.5549),
                                            new Vector(container.bounds.left + size * 0.27347, container.bounds.top + size * 0.44071),
                                            new Vector(container.bounds.left + size * 0.39694, container.bounds.top + size * 0.5649),
                                            new Vector(container.bounds.left + size * 0.72983, container.bounds.top + size * 0.23),
                                            new Vector(container.bounds.left + size * 0.84, container.bounds.top + size * 0.34085),
                                            new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79)
                                        ]);
                                        this.ctx.fillStyle = asString(INPUT_COLOR);
                                        this.ctx.fill();
                                        this.ctx.restore();
                                    }
                                }
                                else if (container.type === RADIO) {
                                    if (container.checked) {
                                        this.ctx.save();
                                        this.ctx.beginPath();
                                        this.ctx.arc(container.bounds.left + size / 2, container.bounds.top + size / 2, size / 4, 0, Math.PI * 2, true);
                                        this.ctx.fillStyle = asString(INPUT_COLOR);
                                        this.ctx.fill();
                                        this.ctx.restore();
                                    }
                                }
                            }
                            if (isTextInputElement(container) && container.value.length) {
                                this.ctx.font = this.createFontStyle(styles)[0];
                                this.ctx.fillStyle = asString(styles.color);
                                this.ctx.textBaseline = 'middle';
                                this.ctx.textAlign = canvasTextAlign(container.styles.textAlign);
                                bounds = contentBox(container);
                                x = 0;
                                switch (container.styles.textAlign) {
                                    case TEXT_ALIGN.CENTER:
                                        x += bounds.width / 2;
                                        break;
                                    case TEXT_ALIGN.RIGHT:
                                        x += bounds.width;
                                        break;
                                }
                                textBounds = bounds.add(x, 0, 0, -bounds.height / 2 + 1);
                                this.ctx.save();
                                this.path([
                                    new Vector(bounds.left, bounds.top),
                                    new Vector(bounds.left + bounds.width, bounds.top),
                                    new Vector(bounds.left + bounds.width, bounds.top + bounds.height),
                                    new Vector(bounds.left, bounds.top + bounds.height)
                                ]);
                                this.ctx.clip();
                                this.renderTextWithLetterSpacing(new TextBounds(container.value, textBounds), styles.letterSpacing);
                                this.ctx.restore();
                                this.ctx.textBaseline = 'bottom';
                                this.ctx.textAlign = 'left';
                            }
                            if (!contains(container.styles.display, 2048 /* LIST_ITEM */)) return [3 /*break*/, 20];
                            if (!(container.styles.listStyleImage !== null)) return [3 /*break*/, 19];
                            img = container.styles.listStyleImage;
                            if (!(img.type === CSSImageType.URL)) return [3 /*break*/, 18];
                            image = void 0;
                            url = img.url;
                            _b.label = 15;
                        case 15:
                            _b.trys.push([15, 17, , 18]);
                            return [4 /*yield*/, this.options.cache.match(url)];
                        case 16:
                            image = _b.sent();
                            this.ctx.drawImage(image, container.bounds.left - (image.width + 10), container.bounds.top);
                            return [3 /*break*/, 18];
                        case 17:
                            e_3 = _b.sent();
                            Logger.getInstance(this.options.id).error("Error loading list-style-image " + url);
                            return [3 /*break*/, 18];
                        case 18: return [3 /*break*/, 20];
                        case 19:
                            if (paint.listValue && container.styles.listStyleType !== LIST_STYLE_TYPE.NONE) {
                                this.ctx.font = this.createFontStyle(styles)[0];
                                this.ctx.fillStyle = asString(styles.color);
                                this.ctx.textBaseline = 'middle';
                                this.ctx.textAlign = 'right';
                                bounds = new Bounds(container.bounds.left, container.bounds.top + getAbsoluteValue(container.styles.paddingTop, container.bounds.width), container.bounds.width, computeLineHeight(styles.lineHeight, styles.fontSize.number) / 2 + 1);
                                this.renderTextWithLetterSpacing(new TextBounds(paint.listValue, bounds), styles.letterSpacing);
                                this.ctx.textBaseline = 'bottom';
                                this.ctx.textAlign = 'left';
                            }
                            _b.label = 20;
                        case 20: return [2 /*return*/];
                    }
                });
            });
        };
        CanvasRenderer.prototype.renderStackContent = function (stack) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, _a, child, _b, _c, child, _d, _e, child, _f, _g, child, _h, _j, child, _k, _l, child, _m, _o, child;
                return __generator(this, function (_p) {
                    switch (_p.label) {
                        case 0: 
                        // https://www.w3.org/TR/css-position-3/#painting-order
                        // 1. the background and borders of the element forming the stacking context.
                        return [4 /*yield*/, this.renderNodeBackgroundAndBorders(stack.element)];
                        case 1:
                            // https://www.w3.org/TR/css-position-3/#painting-order
                            // 1. the background and borders of the element forming the stacking context.
                            _p.sent();
                            _i = 0, _a = stack.negativeZIndex;
                            _p.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            child = _a[_i];
                            return [4 /*yield*/, this.renderStack(child)];
                        case 3:
                            _p.sent();
                            _p.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: 
                        // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
                        return [4 /*yield*/, this.renderNodeContent(stack.element)];
                        case 6:
                            // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
                            _p.sent();
                            _b = 0, _c = stack.nonInlineLevel;
                            _p.label = 7;
                        case 7:
                            if (!(_b < _c.length)) return [3 /*break*/, 10];
                            child = _c[_b];
                            return [4 /*yield*/, this.renderNode(child)];
                        case 8:
                            _p.sent();
                            _p.label = 9;
                        case 9:
                            _b++;
                            return [3 /*break*/, 7];
                        case 10:
                            _d = 0, _e = stack.nonPositionedFloats;
                            _p.label = 11;
                        case 11:
                            if (!(_d < _e.length)) return [3 /*break*/, 14];
                            child = _e[_d];
                            return [4 /*yield*/, this.renderStack(child)];
                        case 12:
                            _p.sent();
                            _p.label = 13;
                        case 13:
                            _d++;
                            return [3 /*break*/, 11];
                        case 14:
                            _f = 0, _g = stack.nonPositionedInlineLevel;
                            _p.label = 15;
                        case 15:
                            if (!(_f < _g.length)) return [3 /*break*/, 18];
                            child = _g[_f];
                            return [4 /*yield*/, this.renderStack(child)];
                        case 16:
                            _p.sent();
                            _p.label = 17;
                        case 17:
                            _f++;
                            return [3 /*break*/, 15];
                        case 18:
                            _h = 0, _j = stack.inlineLevel;
                            _p.label = 19;
                        case 19:
                            if (!(_h < _j.length)) return [3 /*break*/, 22];
                            child = _j[_h];
                            return [4 /*yield*/, this.renderNode(child)];
                        case 20:
                            _p.sent();
                            _p.label = 21;
                        case 21:
                            _h++;
                            return [3 /*break*/, 19];
                        case 22:
                            _k = 0, _l = stack.zeroOrAutoZIndexOrTransformedOrOpacity;
                            _p.label = 23;
                        case 23:
                            if (!(_k < _l.length)) return [3 /*break*/, 26];
                            child = _l[_k];
                            return [4 /*yield*/, this.renderStack(child)];
                        case 24:
                            _p.sent();
                            _p.label = 25;
                        case 25:
                            _k++;
                            return [3 /*break*/, 23];
                        case 26:
                            _m = 0, _o = stack.positiveZIndex;
                            _p.label = 27;
                        case 27:
                            if (!(_m < _o.length)) return [3 /*break*/, 30];
                            child = _o[_m];
                            return [4 /*yield*/, this.renderStack(child)];
                        case 28:
                            _p.sent();
                            _p.label = 29;
                        case 29:
                            _m++;
                            return [3 /*break*/, 27];
                        case 30: return [2 /*return*/];
                    }
                });
            });
        };
        CanvasRenderer.prototype.mask = function (paths) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(this.canvas.width, 0);
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.lineTo(0, this.canvas.height);
            this.ctx.lineTo(0, 0);
            this.formatPath(paths.slice(0).reverse());
            this.ctx.closePath();
        };
        CanvasRenderer.prototype.path = function (paths) {
            this.ctx.beginPath();
            this.formatPath(paths);
            this.ctx.closePath();
        };
        CanvasRenderer.prototype.formatPath = function (paths) {
            var _this = this;
            paths.forEach(function (point, index) {
                var start = isBezierCurve(point) ? point.start : point;
                if (index === 0) {
                    _this.ctx.moveTo(start.x, start.y);
                }
                else {
                    _this.ctx.lineTo(start.x, start.y);
                }
                if (isBezierCurve(point)) {
                    _this.ctx.bezierCurveTo(point.startControl.x, point.startControl.y, point.endControl.x, point.endControl.y, point.end.x, point.end.y);
                }
            });
        };
        CanvasRenderer.prototype.renderRepeat = function (path, pattern, offsetX, offsetY) {
            this.path(path);
            this.ctx.fillStyle = pattern;
            this.ctx.translate(offsetX, offsetY);
            this.ctx.fill();
            this.ctx.translate(-offsetX, -offsetY);
        };
        CanvasRenderer.prototype.resizeImage = function (image, width, height) {
            if (image.width === width && image.height === height) {
                return image;
            }
            var canvas = this.canvas.ownerDocument.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
            return canvas;
        };
        CanvasRenderer.prototype.renderBackgroundImage = function (container) {
            return __awaiter(this, void 0, void 0, function () {
                var index, _loop_1, this_1, _i, _a, backgroundImage;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            index = container.styles.backgroundImage.length - 1;
                            _loop_1 = function (backgroundImage) {
                                var image, url, e_4, _a, path, x, y, width, height, pattern, _b, path, x, y, width, height, _c, lineLength, x0, x1, y0, y1, canvas, ctx, gradient_1, pattern, _d, path, left, top_1, width, height, position, x, y, _e, rx, ry, radialGradient_1, midX, midY, f, invF;
                                return __generator(this, function (_f) {
                                    switch (_f.label) {
                                        case 0:
                                            if (!(backgroundImage.type === CSSImageType.URL)) return [3 /*break*/, 5];
                                            image = void 0;
                                            url = backgroundImage.url;
                                            _f.label = 1;
                                        case 1:
                                            _f.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, this_1.options.cache.match(url)];
                                        case 2:
                                            image = _f.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            e_4 = _f.sent();
                                            Logger.getInstance(this_1.options.id).error("Error loading background-image " + url);
                                            return [3 /*break*/, 4];
                                        case 4:
                                            if (image) {
                                                _a = calculateBackgroundRendering(container, index, [
                                                    image.width,
                                                    image.height,
                                                    image.width / image.height
                                                ]), path = _a[0], x = _a[1], y = _a[2], width = _a[3], height = _a[4];
                                                pattern = this_1.ctx.createPattern(this_1.resizeImage(image, width, height), 'repeat');
                                                this_1.renderRepeat(path, pattern, x, y);
                                            }
                                            return [3 /*break*/, 6];
                                        case 5:
                                            if (isLinearGradient(backgroundImage)) {
                                                _b = calculateBackgroundRendering(container, index, [null, null, null]), path = _b[0], x = _b[1], y = _b[2], width = _b[3], height = _b[4];
                                                _c = calculateGradientDirection(backgroundImage.angle, width, height), lineLength = _c[0], x0 = _c[1], x1 = _c[2], y0 = _c[3], y1 = _c[4];
                                                canvas = document.createElement('canvas');
                                                canvas.width = width;
                                                canvas.height = height;
                                                ctx = canvas.getContext('2d');
                                                gradient_1 = ctx.createLinearGradient(x0, y0, x1, y1);
                                                processColorStops(backgroundImage.stops, lineLength).forEach(function (colorStop) {
                                                    return gradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                                                });
                                                ctx.fillStyle = gradient_1;
                                                ctx.fillRect(0, 0, width, height);
                                                if (width > 0 && height > 0) {
                                                    pattern = this_1.ctx.createPattern(canvas, 'repeat');
                                                    this_1.renderRepeat(path, pattern, x, y);
                                                }
                                            }
                                            else if (isRadialGradient(backgroundImage)) {
                                                _d = calculateBackgroundRendering(container, index, [
                                                    null,
                                                    null,
                                                    null
                                                ]), path = _d[0], left = _d[1], top_1 = _d[2], width = _d[3], height = _d[4];
                                                position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                                                x = getAbsoluteValue(position[0], width);
                                                y = getAbsoluteValue(position[position.length - 1], height);
                                                _e = calculateRadius(backgroundImage, x, y, width, height), rx = _e[0], ry = _e[1];
                                                if (rx > 0 && rx > 0) {
                                                    radialGradient_1 = this_1.ctx.createRadialGradient(left + x, top_1 + y, 0, left + x, top_1 + y, rx);
                                                    processColorStops(backgroundImage.stops, rx * 2).forEach(function (colorStop) {
                                                        return radialGradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                                                    });
                                                    this_1.path(path);
                                                    this_1.ctx.fillStyle = radialGradient_1;
                                                    if (rx !== ry) {
                                                        midX = container.bounds.left + 0.5 * container.bounds.width;
                                                        midY = container.bounds.top + 0.5 * container.bounds.height;
                                                        f = ry / rx;
                                                        invF = 1 / f;
                                                        this_1.ctx.save();
                                                        this_1.ctx.translate(midX, midY);
                                                        this_1.ctx.transform(1, 0, 0, f, 0, 0);
                                                        this_1.ctx.translate(-midX, -midY);
                                                        this_1.ctx.fillRect(left, invF * (top_1 - midY) + midY, width, height * invF);
                                                        this_1.ctx.restore();
                                                    }
                                                    else {
                                                        this_1.ctx.fill();
                                                    }
                                                }
                                            }
                                            _f.label = 6;
                                        case 6:
                                            index--;
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            this_1 = this;
                            _i = 0, _a = container.styles.backgroundImage.slice(0).reverse();
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                            backgroundImage = _a[_i];
                            return [5 /*yield**/, _loop_1(backgroundImage)];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        CanvasRenderer.prototype.renderBorder = function (color, side, curvePoints) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.path(parsePathForBorder(curvePoints, side));
                    this.ctx.fillStyle = asString(color);
                    this.ctx.fill();
                    return [2 /*return*/];
                });
            });
        };
        CanvasRenderer.prototype.renderNodeBackgroundAndBorders = function (paint) {
            return __awaiter(this, void 0, void 0, function () {
                var styles, hasBackground, borders, backgroundPaintingArea, side, _i, borders_1, border;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.applyEffects(paint.effects, 2 /* BACKGROUND_BORDERS */);
                            styles = paint.container.styles;
                            hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;
                            borders = [
                                { style: styles.borderTopStyle, color: styles.borderTopColor },
                                { style: styles.borderRightStyle, color: styles.borderRightColor },
                                { style: styles.borderBottomStyle, color: styles.borderBottomColor },
                                { style: styles.borderLeftStyle, color: styles.borderLeftColor }
                            ];
                            backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(getBackgroundValueForIndex(styles.backgroundClip, 0), paint.curves);
                            if (!(hasBackground || styles.boxShadow.length)) return [3 /*break*/, 2];
                            this.ctx.save();
                            this.path(backgroundPaintingArea);
                            this.ctx.clip();
                            if (!isTransparent(styles.backgroundColor)) {
                                this.ctx.fillStyle = asString(styles.backgroundColor);
                                this.ctx.fill();
                            }
                            return [4 /*yield*/, this.renderBackgroundImage(paint.container)];
                        case 1:
                            _a.sent();
                            this.ctx.restore();
                            styles.boxShadow
                                .slice(0)
                                .reverse()
                                .forEach(function (shadow) {
                                _this.ctx.save();
                                var borderBoxArea = calculateBorderBoxPath(paint.curves);
                                var maskOffset = shadow.inset ? 0 : MASK_OFFSET;
                                var shadowPaintingArea = transformPath(borderBoxArea, -maskOffset + (shadow.inset ? 1 : -1) * shadow.spread.number, (shadow.inset ? 1 : -1) * shadow.spread.number, shadow.spread.number * (shadow.inset ? -2 : 2), shadow.spread.number * (shadow.inset ? -2 : 2));
                                if (shadow.inset) {
                                    _this.path(borderBoxArea);
                                    _this.ctx.clip();
                                    _this.mask(shadowPaintingArea);
                                }
                                else {
                                    _this.mask(borderBoxArea);
                                    _this.ctx.clip();
                                    _this.path(shadowPaintingArea);
                                }
                                _this.ctx.shadowOffsetX = shadow.offsetX.number + maskOffset;
                                _this.ctx.shadowOffsetY = shadow.offsetY.number;
                                _this.ctx.shadowColor = asString(shadow.color);
                                _this.ctx.shadowBlur = shadow.blur.number;
                                _this.ctx.fillStyle = shadow.inset ? asString(shadow.color) : 'rgba(0,0,0,1)';
                                _this.ctx.fill();
                                _this.ctx.restore();
                            });
                            _a.label = 2;
                        case 2:
                            side = 0;
                            _i = 0, borders_1 = borders;
                            _a.label = 3;
                        case 3:
                            if (!(_i < borders_1.length)) return [3 /*break*/, 7];
                            border = borders_1[_i];
                            if (!(border.style !== BORDER_STYLE.NONE && !isTransparent(border.color))) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.renderBorder(border.color, side, paint.curves)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            side++;
                            _a.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 3];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        CanvasRenderer.prototype.render = function (element) {
            return __awaiter(this, void 0, void 0, function () {
                var stack;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.options.backgroundColor) {
                                this.ctx.fillStyle = asString(this.options.backgroundColor);
                                this.ctx.fillRect(this.options.x - this.options.scrollX, this.options.y - this.options.scrollY, this.options.width, this.options.height);
                            }
                            stack = parseStackingContexts(element);
                            return [4 /*yield*/, this.renderStack(stack)];
                        case 1:
                            _a.sent();
                            this.applyEffects([], 2 /* BACKGROUND_BORDERS */);
                            return [2 /*return*/, this.canvas];
                    }
                });
            });
        };
        return CanvasRenderer;
    }());
    var isTextInputElement = function (container) {
        if (container instanceof TextareaElementContainer) {
            return true;
        }
        else if (container instanceof SelectElementContainer) {
            return true;
        }
        else if (container instanceof InputElementContainer && container.type !== RADIO && container.type !== CHECKBOX) {
            return true;
        }
        return false;
    };
    var calculateBackgroundCurvedPaintingArea = function (clip, curves) {
        switch (clip) {
            case BACKGROUND_CLIP.BORDER_BOX:
                return calculateBorderBoxPath(curves);
            case BACKGROUND_CLIP.CONTENT_BOX:
                return calculateContentBoxPath(curves);
            case BACKGROUND_CLIP.PADDING_BOX:
            default:
                return calculatePaddingBoxPath(curves);
        }
    };
    var canvasTextAlign = function (textAlign) {
        switch (textAlign) {
            case TEXT_ALIGN.CENTER:
                return 'center';
            case TEXT_ALIGN.RIGHT:
                return 'right';
            case TEXT_ALIGN.LEFT:
            default:
                return 'left';
        }
    };

    var ForeignObjectRenderer = /** @class */ (function () {
        function ForeignObjectRenderer(options) {
            this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.options = options;
            this.canvas.width = Math.floor(options.width * options.scale);
            this.canvas.height = Math.floor(options.height * options.scale);
            this.canvas.style.width = options.width + "px";
            this.canvas.style.height = options.height + "px";
            this.ctx.scale(this.options.scale, this.options.scale);
            this.ctx.translate(-options.x + options.scrollX, -options.y + options.scrollY);
            Logger.getInstance(options.id).debug("EXPERIMENTAL ForeignObject renderer initialized (" + options.width + "x" + options.height + " at " + options.x + "," + options.y + ") with scale " + options.scale);
        }
        ForeignObjectRenderer.prototype.render = function (element) {
            return __awaiter(this, void 0, void 0, function () {
                var svg, img;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            svg = createForeignObjectSVG(Math.max(this.options.windowWidth, this.options.width) * this.options.scale, Math.max(this.options.windowHeight, this.options.height) * this.options.scale, this.options.scrollX * this.options.scale, this.options.scrollY * this.options.scale, element);
                            return [4 /*yield*/, loadSerializedSVG$1(svg)];
                        case 1:
                            img = _a.sent();
                            if (this.options.backgroundColor) {
                                this.ctx.fillStyle = asString(this.options.backgroundColor);
                                this.ctx.fillRect(0, 0, this.options.width * this.options.scale, this.options.height * this.options.scale);
                            }
                            this.ctx.drawImage(img, -this.options.x * this.options.scale, -this.options.y * this.options.scale);
                            return [2 /*return*/, this.canvas];
                    }
                });
            });
        };
        return ForeignObjectRenderer;
    }());
    var loadSerializedSVG$1 = function (svg) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = function () {
                resolve(img);
            };
            img.onerror = reject;
            img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
        });
    };

    var _this = undefined;
    var parseColor$1 = function (value) { return color.parse(Parser.create(value).parseComponentValue()); };
    var html2canvas = function (element, options) {
        if (options === void 0) { options = {}; }
        return renderElement(element, options);
    };
    if (typeof window !== 'undefined') {
        CacheStorage.setContext(window);
    }
    var renderElement = function (element, opts) { return __awaiter(_this, void 0, void 0, function () {
        var ownerDocument, defaultView, instanceName, _a, width, height, left, top, defaultResourceOptions, resourceOptions, defaultOptions, options, windowBounds, documentCloner, clonedElement, container, documentBackgroundColor, bodyBackgroundColor, bgColor, defaultBackgroundColor, backgroundColor, renderOptions, canvas, renderer, root, renderer;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ownerDocument = element.ownerDocument;
                    if (!ownerDocument) {
                        throw new Error("Element is not attached to a Document");
                    }
                    defaultView = ownerDocument.defaultView;
                    if (!defaultView) {
                        throw new Error("Document is not attached to a Window");
                    }
                    instanceName = (Math.round(Math.random() * 1000) + Date.now()).toString(16);
                    _a = isBodyElement(element) || isHTMLElement(element) ? parseDocumentSize(ownerDocument) : parseBounds(element), width = _a.width, height = _a.height, left = _a.left, top = _a.top;
                    defaultResourceOptions = {
                        allowTaint: false,
                        imageTimeout: 15000,
                        proxy: undefined,
                        useCORS: false
                    };
                    resourceOptions = __assign({}, defaultResourceOptions, opts);
                    defaultOptions = {
                        backgroundColor: '#ffffff',
                        cache: opts.cache ? opts.cache : CacheStorage.create(instanceName, resourceOptions),
                        logging: true,
                        removeContainer: true,
                        foreignObjectRendering: false,
                        scale: defaultView.devicePixelRatio || 1,
                        windowWidth: defaultView.innerWidth,
                        windowHeight: defaultView.innerHeight,
                        scrollX: defaultView.pageXOffset,
                        scrollY: defaultView.pageYOffset,
                        x: left,
                        y: top,
                        width: Math.ceil(width),
                        height: Math.ceil(height),
                        id: instanceName
                    };
                    options = __assign({}, defaultOptions, resourceOptions, opts);
                    windowBounds = new Bounds(options.scrollX, options.scrollY, options.windowWidth, options.windowHeight);
                    Logger.create({ id: instanceName, enabled: options.logging });
                    Logger.getInstance(instanceName).debug("Starting document clone");
                    documentCloner = new DocumentCloner(element, {
                        id: instanceName,
                        onclone: options.onclone,
                        ignoreElements: options.ignoreElements,
                        inlineImages: options.foreignObjectRendering,
                        copyStyles: options.foreignObjectRendering
                    });
                    clonedElement = documentCloner.clonedReferenceElement;
                    if (!clonedElement) {
                        return [2 /*return*/, Promise.reject("Unable to find element in cloned iframe")];
                    }
                    return [4 /*yield*/, documentCloner.toIFrame(ownerDocument, windowBounds)];
                case 1:
                    container = _b.sent();
                    documentBackgroundColor = ownerDocument.documentElement
                        ? parseColor$1(getComputedStyle(ownerDocument.documentElement).backgroundColor)
                        : COLORS.TRANSPARENT;
                    bodyBackgroundColor = ownerDocument.body
                        ? parseColor$1(getComputedStyle(ownerDocument.body).backgroundColor)
                        : COLORS.TRANSPARENT;
                    bgColor = opts.backgroundColor;
                    defaultBackgroundColor = typeof bgColor === 'string' ? parseColor$1(bgColor) : bgColor === null ? COLORS.TRANSPARENT : 0xffffffff;
                    backgroundColor = element === ownerDocument.documentElement
                        ? isTransparent(documentBackgroundColor)
                            ? isTransparent(bodyBackgroundColor)
                                ? defaultBackgroundColor
                                : bodyBackgroundColor
                            : documentBackgroundColor
                        : defaultBackgroundColor;
                    renderOptions = {
                        id: instanceName,
                        cache: options.cache,
                        canvas: options.canvas,
                        backgroundColor: backgroundColor,
                        scale: options.scale,
                        x: options.x,
                        y: options.y,
                        scrollX: options.scrollX,
                        scrollY: options.scrollY,
                        width: options.width,
                        height: options.height,
                        windowWidth: options.windowWidth,
                        windowHeight: options.windowHeight
                    };
                    if (!options.foreignObjectRendering) return [3 /*break*/, 3];
                    Logger.getInstance(instanceName).debug("Document cloned, using foreign object rendering");
                    renderer = new ForeignObjectRenderer(renderOptions);
                    return [4 /*yield*/, renderer.render(clonedElement)];
                case 2:
                    canvas = _b.sent();
                    return [3 /*break*/, 5];
                case 3:
                    Logger.getInstance(instanceName).debug("Document cloned, using computed rendering");
                    CacheStorage.attachInstance(options.cache);
                    Logger.getInstance(instanceName).debug("Starting DOM parsing");
                    root = parseTree(clonedElement);
                    CacheStorage.detachInstance();
                    if (backgroundColor === root.styles.backgroundColor) {
                        root.styles.backgroundColor = COLORS.TRANSPARENT;
                    }
                    Logger.getInstance(instanceName).debug("Starting renderer");
                    renderer = new CanvasRenderer(renderOptions);
                    return [4 /*yield*/, renderer.render(root)];
                case 4:
                    canvas = _b.sent();
                    _b.label = 5;
                case 5:
                    if (options.removeContainer === true) {
                        if (!DocumentCloner.destroy(container)) {
                            Logger.getInstance(instanceName).error("Cannot detach cloned iframe as it is not in the DOM anymore");
                        }
                    }
                    Logger.getInstance(instanceName).debug("Finished rendering");
                    Logger.destroy(instanceName);
                    CacheStorage.destroy(instanceName);
                    return [2 /*return*/, canvas];
            }
        });
    }); };

    return html2canvas;

}));
//# sourceMappingURL=html2canvas.js.map


/***/ })

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMi5jNGRiNWJkMTMwNDJjNWVmZDBiYi5qcyIsInNvdXJjZXMiOlsiLi9ub2RlX21vZHVsZXMvaHRtbDJjYW52YXMvZGlzdC9odG1sMmNhbnZhcy5qcz91bmRlZmluZWQiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBodG1sMmNhbnZhcyAxLjAuMC1yYy43IDxodHRwczovL2h0bWwyY2FudmFzLmhlcnR6ZW4uY29tPlxuICogQ29weXJpZ2h0IChjKSAyMDIwIE5pa2xhcyB2b24gSGVydHplbiA8aHR0cHM6Ly9oZXJ0emVuLmNvbT5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBMaWNlbnNlXG4gKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gICAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICAgIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gICAgKGdsb2JhbCA9IGdsb2JhbCB8fCBzZWxmLCBnbG9iYWwuaHRtbDJjYW52YXMgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCBmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICAgIC8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAgICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2VcclxuICAgIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlXHJcbiAgICBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG5cclxuICAgIFRISVMgQ09ERSBJUyBQUk9WSURFRCBPTiBBTiAqQVMgSVMqIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTllcclxuICAgIEtJTkQsIEVJVEhFUiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBXSVRIT1VUIExJTUlUQVRJT04gQU5ZIElNUExJRURcclxuICAgIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBUSVRMRSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UsXHJcbiAgICBNRVJDSEFOVEFCTElUWSBPUiBOT04tSU5GUklOR0VNRU5ULlxyXG5cclxuICAgIFNlZSB0aGUgQXBhY2hlIFZlcnNpb24gMi4wIExpY2Vuc2UgZm9yIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9uc1xyXG4gICAgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuICAgIC8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUocmVzdWx0LnZhbHVlKTsgfSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICAgICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICAgICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxuXG4gICAgdmFyIEJvdW5kcyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBCb3VuZHMoeCwgeSwgdywgaCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQgPSB4O1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IHk7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3O1xyXG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJvdW5kcy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHgsIHksIHcsIGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCb3VuZHModGhpcy5sZWZ0ICsgeCwgdGhpcy50b3AgKyB5LCB0aGlzLndpZHRoICsgdywgdGhpcy5oZWlnaHQgKyBoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIEJvdW5kcy5mcm9tQ2xpZW50UmVjdCA9IGZ1bmN0aW9uIChjbGllbnRSZWN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQm91bmRzKGNsaWVudFJlY3QubGVmdCwgY2xpZW50UmVjdC50b3AsIGNsaWVudFJlY3Qud2lkdGgsIGNsaWVudFJlY3QuaGVpZ2h0KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBCb3VuZHM7XHJcbiAgICB9KCkpO1xyXG4gICAgdmFyIHBhcnNlQm91bmRzID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICByZXR1cm4gQm91bmRzLmZyb21DbGllbnRSZWN0KG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xyXG4gICAgfTtcclxuICAgIHZhciBwYXJzZURvY3VtZW50U2l6ZSA9IGZ1bmN0aW9uIChkb2N1bWVudCkge1xyXG4gICAgICAgIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keTtcclxuICAgICAgICB2YXIgZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgICAgIGlmICghYm9keSB8fCAhZG9jdW1lbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBnZXQgZG9jdW1lbnQgc2l6ZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHdpZHRoID0gTWF0aC5tYXgoTWF0aC5tYXgoYm9keS5zY3JvbGxXaWR0aCwgZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoKSwgTWF0aC5tYXgoYm9keS5vZmZzZXRXaWR0aCwgZG9jdW1lbnRFbGVtZW50Lm9mZnNldFdpZHRoKSwgTWF0aC5tYXgoYm9keS5jbGllbnRXaWR0aCwgZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKSk7XHJcbiAgICAgICAgdmFyIGhlaWdodCA9IE1hdGgubWF4KE1hdGgubWF4KGJvZHkuc2Nyb2xsSGVpZ2h0LCBkb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0KSwgTWF0aC5tYXgoYm9keS5vZmZzZXRIZWlnaHQsIGRvY3VtZW50RWxlbWVudC5vZmZzZXRIZWlnaHQpLCBNYXRoLm1heChib2R5LmNsaWVudEhlaWdodCwgZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkpO1xyXG4gICAgICAgIHJldHVybiBuZXcgQm91bmRzKDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgfTtcblxuICAgIC8qXG4gICAgICogY3NzLWxpbmUtYnJlYWsgMS4xLjEgPGh0dHBzOi8vZ2l0aHViLmNvbS9uaWtsYXN2aC9jc3MtbGluZS1icmVhayNyZWFkbWU+XG4gICAgICogQ29weXJpZ2h0IChjKSAyMDE5IE5pa2xhcyB2b24gSGVydHplbiA8aHR0cHM6Ly9oZXJ0emVuLmNvbT5cbiAgICAgKiBSZWxlYXNlZCB1bmRlciBNSVQgTGljZW5zZVxuICAgICAqL1xuICAgIHZhciB0b0NvZGVQb2ludHMgPSBmdW5jdGlvbiAoc3RyKSB7XHJcbiAgICAgICAgdmFyIGNvZGVQb2ludHMgPSBbXTtcclxuICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHN0ci5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUgKGkgPCBsZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlID0gc3RyLmNoYXJDb2RlQXQoaSsrKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID49IDB4ZDgwMCAmJiB2YWx1ZSA8PSAweGRiZmYgJiYgaSA8IGxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGV4dHJhID0gc3RyLmNoYXJDb2RlQXQoaSsrKTtcclxuICAgICAgICAgICAgICAgIGlmICgoZXh0cmEgJiAweGZjMDApID09PSAweGRjMDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2RlUG9pbnRzLnB1c2goKCh2YWx1ZSAmIDB4M2ZmKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNmZikgKyAweDEwMDAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvZGVQb2ludHMucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29kZVBvaW50cy5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29kZVBvaW50cztcclxuICAgIH07XHJcbiAgICB2YXIgZnJvbUNvZGVQb2ludCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgY29kZVBvaW50cyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGNvZGVQb2ludHNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFN0cmluZy5mcm9tQ29kZVBvaW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNvZGVQb2ludC5hcHBseShTdHJpbmcsIGNvZGVQb2ludHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbGVuZ3RoID0gY29kZVBvaW50cy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCFsZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY29kZVVuaXRzID0gW107XHJcbiAgICAgICAgdmFyIGluZGV4ID0gLTE7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2RlUG9pbnQgPSBjb2RlUG9pbnRzW2luZGV4XTtcclxuICAgICAgICAgICAgaWYgKGNvZGVQb2ludCA8PSAweGZmZmYpIHtcclxuICAgICAgICAgICAgICAgIGNvZGVVbml0cy5wdXNoKGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMDtcclxuICAgICAgICAgICAgICAgIGNvZGVVbml0cy5wdXNoKChjb2RlUG9pbnQgPj4gMTApICsgMHhkODAwLCBjb2RlUG9pbnQgJSAweDQwMCArIDB4ZGMwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGluZGV4ICsgMSA9PT0gbGVuZ3RoIHx8IGNvZGVVbml0cy5sZW5ndGggPiAweDQwMDApIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVVuaXRzKTtcclxuICAgICAgICAgICAgICAgIGNvZGVVbml0cy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgdmFyIGNoYXJzID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xyXG4gICAgLy8gVXNlIGEgbG9va3VwIHRhYmxlIHRvIGZpbmQgdGhlIGluZGV4LlxyXG4gICAgdmFyIGxvb2t1cCA9IHR5cGVvZiBVaW50OEFycmF5ID09PSAndW5kZWZpbmVkJyA/IFtdIDogbmV3IFVpbnQ4QXJyYXkoMjU2KTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsb29rdXBbY2hhcnMuY2hhckNvZGVBdChpKV0gPSBpO1xyXG4gICAgfVxyXG4gICAgdmFyIGRlY29kZSA9IGZ1bmN0aW9uIChiYXNlNjQpIHtcclxuICAgICAgICB2YXIgYnVmZmVyTGVuZ3RoID0gYmFzZTY0Lmxlbmd0aCAqIDAuNzUsIGxlbiA9IGJhc2U2NC5sZW5ndGgsIGksIHAgPSAwLCBlbmNvZGVkMSwgZW5jb2RlZDIsIGVuY29kZWQzLCBlbmNvZGVkNDtcclxuICAgICAgICBpZiAoYmFzZTY0W2Jhc2U2NC5sZW5ndGggLSAxXSA9PT0gJz0nKSB7XHJcbiAgICAgICAgICAgIGJ1ZmZlckxlbmd0aC0tO1xyXG4gICAgICAgICAgICBpZiAoYmFzZTY0W2Jhc2U2NC5sZW5ndGggLSAyXSA9PT0gJz0nKSB7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJMZW5ndGgtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYnVmZmVyID0gdHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJlxyXG4gICAgICAgICAgICB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiZcclxuICAgICAgICAgICAgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNsaWNlICE9PSAndW5kZWZpbmVkJ1xyXG4gICAgICAgICAgICA/IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJMZW5ndGgpXHJcbiAgICAgICAgICAgIDogbmV3IEFycmF5KGJ1ZmZlckxlbmd0aCk7XHJcbiAgICAgICAgdmFyIGJ5dGVzID0gQXJyYXkuaXNBcnJheShidWZmZXIpID8gYnVmZmVyIDogbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcclxuICAgICAgICAgICAgZW5jb2RlZDEgPSBsb29rdXBbYmFzZTY0LmNoYXJDb2RlQXQoaSldO1xyXG4gICAgICAgICAgICBlbmNvZGVkMiA9IGxvb2t1cFtiYXNlNjQuY2hhckNvZGVBdChpICsgMSldO1xyXG4gICAgICAgICAgICBlbmNvZGVkMyA9IGxvb2t1cFtiYXNlNjQuY2hhckNvZGVBdChpICsgMildO1xyXG4gICAgICAgICAgICBlbmNvZGVkNCA9IGxvb2t1cFtiYXNlNjQuY2hhckNvZGVBdChpICsgMyldO1xyXG4gICAgICAgICAgICBieXRlc1twKytdID0gKGVuY29kZWQxIDw8IDIpIHwgKGVuY29kZWQyID4+IDQpO1xyXG4gICAgICAgICAgICBieXRlc1twKytdID0gKChlbmNvZGVkMiAmIDE1KSA8PCA0KSB8IChlbmNvZGVkMyA+PiAyKTtcclxuICAgICAgICAgICAgYnl0ZXNbcCsrXSA9ICgoZW5jb2RlZDMgJiAzKSA8PCA2KSB8IChlbmNvZGVkNCAmIDYzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcclxuICAgIH07XHJcbiAgICB2YXIgcG9seVVpbnQxNkFycmF5ID0gZnVuY3Rpb24gKGJ1ZmZlcikge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xyXG4gICAgICAgIHZhciBieXRlcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDIpIHtcclxuICAgICAgICAgICAgYnl0ZXMucHVzaCgoYnVmZmVyW2kgKyAxXSA8PCA4KSB8IGJ1ZmZlcltpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBieXRlcztcclxuICAgIH07XHJcbiAgICB2YXIgcG9seVVpbnQzMkFycmF5ID0gZnVuY3Rpb24gKGJ1ZmZlcikge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xyXG4gICAgICAgIHZhciBieXRlcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDQpIHtcclxuICAgICAgICAgICAgYnl0ZXMucHVzaCgoYnVmZmVyW2kgKyAzXSA8PCAyNCkgfCAoYnVmZmVyW2kgKyAyXSA8PCAxNikgfCAoYnVmZmVyW2kgKyAxXSA8PCA4KSB8IGJ1ZmZlcltpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBieXRlcztcclxuICAgIH07XG5cbiAgICAvKiogU2hpZnQgc2l6ZSBmb3IgZ2V0dGluZyB0aGUgaW5kZXgtMiB0YWJsZSBvZmZzZXQuICovXHJcbiAgICB2YXIgVVRSSUUyX1NISUZUXzIgPSA1O1xyXG4gICAgLyoqIFNoaWZ0IHNpemUgZm9yIGdldHRpbmcgdGhlIGluZGV4LTEgdGFibGUgb2Zmc2V0LiAqL1xyXG4gICAgdmFyIFVUUklFMl9TSElGVF8xID0gNiArIDU7XHJcbiAgICAvKipcclxuICAgICAqIFNoaWZ0IHNpemUgZm9yIHNoaWZ0aW5nIGxlZnQgdGhlIGluZGV4IGFycmF5IHZhbHVlcy5cclxuICAgICAqIEluY3JlYXNlcyBwb3NzaWJsZSBkYXRhIHNpemUgd2l0aCAxNi1iaXQgaW5kZXggdmFsdWVzIGF0IHRoZSBjb3N0XHJcbiAgICAgKiBvZiBjb21wYWN0YWJpbGl0eS5cclxuICAgICAqIFRoaXMgcmVxdWlyZXMgZGF0YSBibG9ja3MgdG8gYmUgYWxpZ25lZCBieSBVVFJJRTJfREFUQV9HUkFOVUxBUklUWS5cclxuICAgICAqL1xyXG4gICAgdmFyIFVUUklFMl9JTkRFWF9TSElGVCA9IDI7XHJcbiAgICAvKipcclxuICAgICAqIERpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIHNoaWZ0IHNpemVzLFxyXG4gICAgICogZm9yIGdldHRpbmcgYW4gaW5kZXgtMSBvZmZzZXQgZnJvbSBhbiBpbmRleC0yIG9mZnNldC4gNj0xMS01XHJcbiAgICAgKi9cclxuICAgIHZhciBVVFJJRTJfU0hJRlRfMV8yID0gVVRSSUUyX1NISUZUXzEgLSBVVFJJRTJfU0hJRlRfMjtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHBhcnQgb2YgdGhlIGluZGV4LTIgdGFibGUgZm9yIFUrRDgwMC4uVStEQkZGIHN0b3JlcyB2YWx1ZXMgZm9yXHJcbiAgICAgKiBsZWFkIHN1cnJvZ2F0ZSBjb2RlIF91bml0c18gbm90IGNvZGUgX3BvaW50c18uXHJcbiAgICAgKiBWYWx1ZXMgZm9yIGxlYWQgc3Vycm9nYXRlIGNvZGUgX3BvaW50c18gYXJlIGluZGV4ZWQgd2l0aCB0aGlzIHBvcnRpb24gb2YgdGhlIHRhYmxlLlxyXG4gICAgICogTGVuZ3RoPTMyPTB4MjA9MHg0MDA+PlVUUklFMl9TSElGVF8yLiAoVGhlcmUgYXJlIDEwMjQ9MHg0MDAgbGVhZCBzdXJyb2dhdGVzLilcclxuICAgICAqL1xyXG4gICAgdmFyIFVUUklFMl9MU0NQX0lOREVYXzJfT0ZGU0VUID0gMHgxMDAwMCA+PiBVVFJJRTJfU0hJRlRfMjtcclxuICAgIC8qKiBOdW1iZXIgb2YgZW50cmllcyBpbiBhIGRhdGEgYmxvY2suIDMyPTB4MjAgKi9cclxuICAgIHZhciBVVFJJRTJfREFUQV9CTE9DS19MRU5HVEggPSAxIDw8IFVUUklFMl9TSElGVF8yO1xyXG4gICAgLyoqIE1hc2sgZm9yIGdldHRpbmcgdGhlIGxvd2VyIGJpdHMgZm9yIHRoZSBpbi1kYXRhLWJsb2NrIG9mZnNldC4gKi9cclxuICAgIHZhciBVVFJJRTJfREFUQV9NQVNLID0gVVRSSUUyX0RBVEFfQkxPQ0tfTEVOR1RIIC0gMTtcclxuICAgIHZhciBVVFJJRTJfTFNDUF9JTkRFWF8yX0xFTkdUSCA9IDB4NDAwID4+IFVUUklFMl9TSElGVF8yO1xyXG4gICAgLyoqIENvdW50IHRoZSBsZW5ndGhzIG9mIGJvdGggQk1QIHBpZWNlcy4gMjA4MD0weDgyMCAqL1xyXG4gICAgdmFyIFVUUklFMl9JTkRFWF8yX0JNUF9MRU5HVEggPSBVVFJJRTJfTFNDUF9JTkRFWF8yX09GRlNFVCArIFVUUklFMl9MU0NQX0lOREVYXzJfTEVOR1RIO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgMi1ieXRlIFVURi04IHZlcnNpb24gb2YgdGhlIGluZGV4LTIgdGFibGUgZm9sbG93cyBhdCBvZmZzZXQgMjA4MD0weDgyMC5cclxuICAgICAqIExlbmd0aCAzMj0weDIwIGZvciBsZWFkIGJ5dGVzIEMwLi5ERiwgcmVnYXJkbGVzcyBvZiBVVFJJRTJfU0hJRlRfMi5cclxuICAgICAqL1xyXG4gICAgdmFyIFVUUklFMl9VVEY4XzJCX0lOREVYXzJfT0ZGU0VUID0gVVRSSUUyX0lOREVYXzJfQk1QX0xFTkdUSDtcclxuICAgIHZhciBVVFJJRTJfVVRGOF8yQl9JTkRFWF8yX0xFTkdUSCA9IDB4ODAwID4+IDY7IC8qIFUrMDgwMCBpcyB0aGUgZmlyc3QgY29kZSBwb2ludCBhZnRlciAyLWJ5dGUgVVRGLTggKi9cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGluZGV4LTEgdGFibGUsIG9ubHkgdXNlZCBmb3Igc3VwcGxlbWVudGFyeSBjb2RlIHBvaW50cywgYXQgb2Zmc2V0IDIxMTI9MHg4NDAuXHJcbiAgICAgKiBWYXJpYWJsZSBsZW5ndGgsIGZvciBjb2RlIHBvaW50cyB1cCB0byBoaWdoU3RhcnQsIHdoZXJlIHRoZSBsYXN0IHNpbmdsZS12YWx1ZSByYW5nZSBzdGFydHMuXHJcbiAgICAgKiBNYXhpbXVtIGxlbmd0aCA1MTI9MHgyMDA9MHgxMDAwMDA+PlVUUklFMl9TSElGVF8xLlxyXG4gICAgICogKEZvciAweDEwMDAwMCBzdXBwbGVtZW50YXJ5IGNvZGUgcG9pbnRzIFUrMTAwMDAuLlUrMTBmZmZmLilcclxuICAgICAqXHJcbiAgICAgKiBUaGUgcGFydCBvZiB0aGUgaW5kZXgtMiB0YWJsZSBmb3Igc3VwcGxlbWVudGFyeSBjb2RlIHBvaW50cyBzdGFydHNcclxuICAgICAqIGFmdGVyIHRoaXMgaW5kZXgtMSB0YWJsZS5cclxuICAgICAqXHJcbiAgICAgKiBCb3RoIHRoZSBpbmRleC0xIHRhYmxlIGFuZCB0aGUgZm9sbG93aW5nIHBhcnQgb2YgdGhlIGluZGV4LTIgdGFibGVcclxuICAgICAqIGFyZSBvbWl0dGVkIGNvbXBsZXRlbHkgaWYgdGhlcmUgaXMgb25seSBCTVAgZGF0YS5cclxuICAgICAqL1xyXG4gICAgdmFyIFVUUklFMl9JTkRFWF8xX09GRlNFVCA9IFVUUklFMl9VVEY4XzJCX0lOREVYXzJfT0ZGU0VUICsgVVRSSUUyX1VURjhfMkJfSU5ERVhfMl9MRU5HVEg7XHJcbiAgICAvKipcclxuICAgICAqIE51bWJlciBvZiBpbmRleC0xIGVudHJpZXMgZm9yIHRoZSBCTVAuIDMyPTB4MjBcclxuICAgICAqIFRoaXMgcGFydCBvZiB0aGUgaW5kZXgtMSB0YWJsZSBpcyBvbWl0dGVkIGZyb20gdGhlIHNlcmlhbGl6ZWQgZm9ybS5cclxuICAgICAqL1xyXG4gICAgdmFyIFVUUklFMl9PTUlUVEVEX0JNUF9JTkRFWF8xX0xFTkdUSCA9IDB4MTAwMDAgPj4gVVRSSUUyX1NISUZUXzE7XHJcbiAgICAvKiogTnVtYmVyIG9mIGVudHJpZXMgaW4gYW4gaW5kZXgtMiBibG9jay4gNjQ9MHg0MCAqL1xyXG4gICAgdmFyIFVUUklFMl9JTkRFWF8yX0JMT0NLX0xFTkdUSCA9IDEgPDwgVVRSSUUyX1NISUZUXzFfMjtcclxuICAgIC8qKiBNYXNrIGZvciBnZXR0aW5nIHRoZSBsb3dlciBiaXRzIGZvciB0aGUgaW4taW5kZXgtMi1ibG9jayBvZmZzZXQuICovXHJcbiAgICB2YXIgVVRSSUUyX0lOREVYXzJfTUFTSyA9IFVUUklFMl9JTkRFWF8yX0JMT0NLX0xFTkdUSCAtIDE7XHJcbiAgICB2YXIgc2xpY2UxNiA9IGZ1bmN0aW9uICh2aWV3LCBzdGFydCwgZW5kKSB7XHJcbiAgICAgICAgaWYgKHZpZXcuc2xpY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXcuc2xpY2Uoc3RhcnQsIGVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVWludDE2QXJyYXkoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodmlldywgc3RhcnQsIGVuZCkpO1xyXG4gICAgfTtcclxuICAgIHZhciBzbGljZTMyID0gZnVuY3Rpb24gKHZpZXcsIHN0YXJ0LCBlbmQpIHtcclxuICAgICAgICBpZiAodmlldy5zbGljZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlldy5zbGljZShzdGFydCwgZW5kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50MzJBcnJheShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh2aWV3LCBzdGFydCwgZW5kKSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGNyZWF0ZVRyaWVGcm9tQmFzZTY0ID0gZnVuY3Rpb24gKGJhc2U2NCkge1xyXG4gICAgICAgIHZhciBidWZmZXIgPSBkZWNvZGUoYmFzZTY0KTtcclxuICAgICAgICB2YXIgdmlldzMyID0gQXJyYXkuaXNBcnJheShidWZmZXIpID8gcG9seVVpbnQzMkFycmF5KGJ1ZmZlcikgOiBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcclxuICAgICAgICB2YXIgdmlldzE2ID0gQXJyYXkuaXNBcnJheShidWZmZXIpID8gcG9seVVpbnQxNkFycmF5KGJ1ZmZlcikgOiBuZXcgVWludDE2QXJyYXkoYnVmZmVyKTtcclxuICAgICAgICB2YXIgaGVhZGVyTGVuZ3RoID0gMjQ7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gc2xpY2UxNih2aWV3MTYsIGhlYWRlckxlbmd0aCAvIDIsIHZpZXczMls0XSAvIDIpO1xyXG4gICAgICAgIHZhciBkYXRhID0gdmlldzMyWzVdID09PSAyXHJcbiAgICAgICAgICAgID8gc2xpY2UxNih2aWV3MTYsIChoZWFkZXJMZW5ndGggKyB2aWV3MzJbNF0pIC8gMilcclxuICAgICAgICAgICAgOiBzbGljZTMyKHZpZXczMiwgTWF0aC5jZWlsKChoZWFkZXJMZW5ndGggKyB2aWV3MzJbNF0pIC8gNCkpO1xyXG4gICAgICAgIHJldHVybiBuZXcgVHJpZSh2aWV3MzJbMF0sIHZpZXczMlsxXSwgdmlldzMyWzJdLCB2aWV3MzJbM10sIGluZGV4LCBkYXRhKTtcclxuICAgIH07XHJcbiAgICB2YXIgVHJpZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBUcmllKGluaXRpYWxWYWx1ZSwgZXJyb3JWYWx1ZSwgaGlnaFN0YXJ0LCBoaWdoVmFsdWVJbmRleCwgaW5kZXgsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0aWFsVmFsdWUgPSBpbml0aWFsVmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuZXJyb3JWYWx1ZSA9IGVycm9yVmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaFN0YXJ0ID0gaGlnaFN0YXJ0O1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2hWYWx1ZUluZGV4ID0gaGlnaFZhbHVlSW5kZXg7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHRoZSB2YWx1ZSBmb3IgYSBjb2RlIHBvaW50IGFzIHN0b3JlZCBpbiB0aGUgVHJpZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSBjb2RlUG9pbnQgdGhlIGNvZGUgcG9pbnRcclxuICAgICAgICAgKiBAcmV0dXJuIHRoZSB2YWx1ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFRyaWUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChjb2RlUG9pbnQpIHtcclxuICAgICAgICAgICAgdmFyIGl4O1xyXG4gICAgICAgICAgICBpZiAoY29kZVBvaW50ID49IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb2RlUG9pbnQgPCAweDBkODAwIHx8IChjb2RlUG9pbnQgPiAweDBkYmZmICYmIGNvZGVQb2ludCA8PSAweDBmZmZmKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9yZGluYXJ5IEJNUCBjb2RlIHBvaW50LCBleGNsdWRpbmcgbGVhZGluZyBzdXJyb2dhdGVzLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEJNUCB1c2VzIGEgc2luZ2xlIGxldmVsIGxvb2t1cC4gIEJNUCBpbmRleCBzdGFydHMgYXQgb2Zmc2V0IDAgaW4gdGhlIFRyaWUyIGluZGV4LlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIDE2IGJpdCBkYXRhIGlzIHN0b3JlZCBpbiB0aGUgaW5kZXggYXJyYXkgaXRzZWxmLlxyXG4gICAgICAgICAgICAgICAgICAgIGl4ID0gdGhpcy5pbmRleFtjb2RlUG9pbnQgPj4gVVRSSUUyX1NISUZUXzJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGl4ID0gKGl4IDw8IFVUUklFMl9JTkRFWF9TSElGVCkgKyAoY29kZVBvaW50ICYgVVRSSUUyX0RBVEFfTUFTSyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVtpeF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY29kZVBvaW50IDw9IDB4ZmZmZikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIExlYWQgU3Vycm9nYXRlIENvZGUgUG9pbnQuICBBIFNlcGFyYXRlIGluZGV4IHNlY3Rpb24gaXMgc3RvcmVkIGZvclxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxlYWQgc3Vycm9nYXRlIGNvZGUgdW5pdHMgYW5kIGNvZGUgcG9pbnRzLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgVGhlIG1haW4gaW5kZXggaGFzIHRoZSBjb2RlIHVuaXQgZGF0YS5cclxuICAgICAgICAgICAgICAgICAgICAvLyAgIEZvciB0aGlzIGZ1bmN0aW9uLCB3ZSBuZWVkIHRoZSBjb2RlIHBvaW50IGRhdGEuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogdGhpcyBleHByZXNzaW9uIGNvdWxkIGJlIHJlZmFjdG9yZWQgZm9yIHNsaWdodGx5IGltcHJvdmVkIGVmZmljaWVuY3ksIGJ1dFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgIHN1cnJvZ2F0ZSBjb2RlIHBvaW50cyB3aWxsIGJlIHNvIHJhcmUgaW4gcHJhY3RpY2UgdGhhdCBpdCdzIG5vdCB3b3J0aCBpdC5cclxuICAgICAgICAgICAgICAgICAgICBpeCA9IHRoaXMuaW5kZXhbVVRSSUUyX0xTQ1BfSU5ERVhfMl9PRkZTRVQgKyAoKGNvZGVQb2ludCAtIDB4ZDgwMCkgPj4gVVRSSUUyX1NISUZUXzIpXTtcclxuICAgICAgICAgICAgICAgICAgICBpeCA9IChpeCA8PCBVVFJJRTJfSU5ERVhfU0hJRlQpICsgKGNvZGVQb2ludCAmIFVUUklFMl9EQVRBX01BU0spO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbaXhdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNvZGVQb2ludCA8IHRoaXMuaGlnaFN0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gU3VwcGxlbWVudGFsIGNvZGUgcG9pbnQsIHVzZSB0d28tbGV2ZWwgbG9va3VwLlxyXG4gICAgICAgICAgICAgICAgICAgIGl4ID0gVVRSSUUyX0lOREVYXzFfT0ZGU0VUIC0gVVRSSUUyX09NSVRURURfQk1QX0lOREVYXzFfTEVOR1RIICsgKGNvZGVQb2ludCA+PiBVVFJJRTJfU0hJRlRfMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaXggPSB0aGlzLmluZGV4W2l4XTtcclxuICAgICAgICAgICAgICAgICAgICBpeCArPSAoY29kZVBvaW50ID4+IFVUUklFMl9TSElGVF8yKSAmIFVUUklFMl9JTkRFWF8yX01BU0s7XHJcbiAgICAgICAgICAgICAgICAgICAgaXggPSB0aGlzLmluZGV4W2l4XTtcclxuICAgICAgICAgICAgICAgICAgICBpeCA9IChpeCA8PCBVVFJJRTJfSU5ERVhfU0hJRlQpICsgKGNvZGVQb2ludCAmIFVUUklFMl9EQVRBX01BU0spO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbaXhdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNvZGVQb2ludCA8PSAweDEwZmZmZikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbdGhpcy5oaWdoVmFsdWVJbmRleF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gRmFsbCB0aHJvdWdoLiAgVGhlIGNvZGUgcG9pbnQgaXMgb3V0c2lkZSBvZiB0aGUgbGVnYWwgcmFuZ2Ugb2YgMC4uMHgxMGZmZmYuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVycm9yVmFsdWU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gVHJpZTtcclxuICAgIH0oKSk7XG5cbiAgICB2YXIgYmFzZTY0ID0gJ0t3QUFBQUFBQUFBQUNBNEFJRG9BQVBBZkFBQUNBQUFBQUFBSUFCQUFHQUJBQUVnQVVBQllBRjRBWmdCZUFHWUFZQUJvQUhBQWVBQmVBR1lBZkFDRUFJQUFpQUNRQUpnQW9BQ29BSzBBdFFDOUFNVUFYZ0JtQUY0QVpnQmVBR1lBelFEVkFGNEFaZ0RSQU5rQTNnRG1BT3dBOUFEOEFBUUJEQUVVQVJvQklnR0FBSWdBSndFdkFUY0JQd0ZGQVUwQlRBRlVBVndCWkFGc0FYTUJld0dEQVRBQWl3R1RBWnNCb2dHa0Fhd0J0QUc4QWNJQnlnSFNBZG9CNEFIb0FmQUIrQUgrQVFZQ0RnSVdBdjRCSGdJbUFpNENOZ0krQWtVQ1RRSlRBbHNDWXdKckFuRUNlUUtCQWswQ2lRS1JBcGtDb1FLb0FyQUN1QUxBQXNRQ3pBSXdBTlFDM0FMa0FqQUE3QUwwQXZ3Q0FRTUpBeEFER0FNd0FDQURKZ011QXpZRFBnT0FBRVlEU2dOU0ExSURVZ05hQTFvRFlBTmlBMklEZ0FDQUFHb0RnQUJ5QTNZRGZnT0FBSVFEZ0FDS0E1SURtZ09BQUlBQW9nT3FBNEFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBSzhEdHdPQUFJQUF2d1BIQTg4RDF3UGZBeUFENXdQc0EvUUQvQU9BQUlBQUJBUU1CQklFZ0FBV0JCNEVKZ1F1QkRNRUlBTTdCRUVFWGdCSkJDQURVUVJaQkdFRWFRUXdBREFBY1FRK0FYa0VnUVNKQkpFRWdBQ1lCSUFBb0FTb0JLOEV0d1F3QUw4RXhRU0FBSUFBZ0FDQUFJQUFnQUNnQU0wRVhnQmVBRjRBWGdCZUFGNEFYZ0JlQU5VRVhnRFpCT0VFWGdEcEJQRUUrUVFCQlFrRkVRVVpCU0VGS1FVeEJUVUZQUVZGQlV3RlZBVmNCVjRBWXdWZUFHc0Zjd1Y3QllNRml3V1NCVjRBbWdXZ0JhY0ZYZ0JlQUY0QVhnQmVBS3NGWGdDeUJiRUZ1Z1c3QmNJRndnWElCY0lGd2dYUUJkUUYzQVhrQmVzRjh3WDdCUU1HQ3dZVEJoc0dJd1lyQmpNR093WmVBRDhHUndaTkJsNEFWQVpiQmw0QVhnQmVBRjRBWGdCZUFGNEFYZ0JlQUY0QVhnQmVBR01HWGdCcUJuRUdYZ0JlQUY0QVhnQmVBRjRBWGdCZUFGNEFYZ0I1Qm9BRzR3U0dCbzRHa3dhQUFJQURIZ1I1QUY0QVhnQmVBSnNHZ0FCR0E0QUFvd2FyQnJNR3N3YWdBTHNHd3diTEJqQUEwd2JhQnRvRzNRYmFCdG9HMmdiYUJ0b0cyZ2JsQnVzRzh3YjdCZ01IQ3djVEJ4c0hDd2NqQnlzSE1BYzFCelVIT2dkQ0I5b0dTZ2RTQjFvSFlBZmFCbG9IYUFmYUJsSUgyZ2JhQnRvRzJnYmFCdG9HMmdiYUJqVUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVIYlFkZUFGNEFOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFkMUIzMEhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUI0TUgyZ2FLQjY4RWdBQ0FBSUFBZ0FDQUFJQUFnQUNBQUk4SGx3ZGVBSjhIcHdlQUFJQUFyd2UzQjE0QVhnQy9COFVIeWdjd0FOQUgyQWZnQjRBQTZBZndCejRCK0FjQUNGd0JDQWdQQ0JjSW9nRVlBUjhJSndpQUFDOElOd2cvQ0NBRFJ3aFBDRmNJWHdobkNFb0RHZ1NBQUlBQWdBQnZDSGNJZUFoNUNIb0lld2g4Q0gwSWR3aDRDSGtJZWdoN0NId0lmUWgzQ0hnSWVRaDZDSHNJZkFoOUNIY0llQWg1Q0hvSWV3aDhDSDBJZHdoNENIa0llZ2g3Q0h3SWZRaDNDSGdJZVFoNkNIc0lmQWg5Q0hjSWVBaDVDSG9JZXdoOENIMElkd2g0Q0hrSWVnaDdDSHdJZlFoM0NIZ0llUWg2Q0hzSWZBaDlDSGNJZUFoNUNIb0lld2g4Q0gwSWR3aDRDSGtJZWdoN0NId0lmUWgzQ0hnSWVRaDZDSHNJZkFoOUNIY0llQWg1Q0hvSWV3aDhDSDBJZHdoNENIa0llZ2g3Q0h3SWZRaDNDSGdJZVFoNkNIc0lmQWg5Q0hjSWVBaDVDSG9JZXdoOENIMElkd2g0Q0hrSWVnaDdDSHdJZlFoM0NIZ0llUWg2Q0hzSWZBaDlDSGNJZUFoNUNIb0lld2g4Q0gwSWR3aDRDSGtJZWdoN0NId0lmUWgzQ0hnSWVRaDZDSHNJZkFoOUNIY0llQWg1Q0hvSWV3aDhDSDBJZHdoNENIa0llZ2g3Q0h3SWZRaDNDSGdJZVFoNkNIc0lmQWg5Q0hjSWVBaDVDSG9JZXdoOENIMElkd2g0Q0hrSWVnaDdDSHdJZlFoM0NIZ0llUWg2Q0hzSWZBaDlDSGNJZUFoNUNIb0lld2g4Q0gwSWR3aDRDSGtJZWdoN0NId0lmUWgzQ0hnSWVRaDZDSHNJZkFoOUNIY0llQWg1Q0hvSWV3aDhDSDBJZHdoNENIa0llZ2g3Q0h3SWZRaDNDSGdJZVFoNkNIc0lmQWg5Q0hjSWVBaDVDSG9JZXdoOENIMElkd2g0Q0hrSWVnaDdDSHdJZlFoM0NIZ0llUWg2Q0hzSWZBaDlDSGNJZUFoNUNIb0lld2g4Q0gwSWR3aDRDSGtJZWdoN0NId0lmUWgzQ0hnSWVRaDZDSHNJZkFoOUNIY0llQWg1Q0hvSWV3aDhDSDBJZHdoNENIa0llZ2g3Q0h3SWZRaDNDSGdJZVFoNkNIc0lmQWg5Q0hjSWVBaDVDSG9JZXdoOENIMElkd2g0Q0hrSWVnaDdDSHdJZlFoM0NIZ0llUWg2Q0hzSWZBaDlDSGNJZUFoNUNIb0lld2g4Q0gwSWR3aDRDSGtJZWdoN0NId0lmUWgzQ0hnSWVRaDZDSHNJZkFoOUNIY0llQWg1Q0hvSWV3aDhDSDBJZHdoNENIa0llZ2g3Q0h3SWhBaUxDSTRJTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QUpZSWxnaVdDSllJbGdpV0NKWUlsZ2lXQ0pZSWxnaVdDSllJbGdpV0NKWUlsZ2lXQ0pZSWxnaVdDSllJbGdpV0NKWUlsZ2lXQ0pZSWxnaVdDSllJbGdnd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQjU0SU5RYzFCNklJMmdhcUNMSUl1Z2lBQUlBQXZnakdDSUFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBeXdpSEFZQUEwd2lBQU5rSTNRamxDTzBJOUFqOENJQUFnQUNBQUFJSkNna1NDUm9KSWdrbkNUWUhMd2szQ1pZSWxnaVdDSllJbGdpV0NKWUlsZ2lXQ0pZSWxnaVdDSllJbGdpV0NKWUlsZ2lXQ0pZSWxnaVdDSllJbGdpV0NKWUlsZ2lXQ0pZSWxnaVdDSllJbGdpQUFJQUFBQUZBQVhnQmVBR0FBY0FCZUFId0FRQUNRQUtBQXJRQzlBSjRBWGdCZUFFMEEzZ0JSQU40QTdBRDhBTXdCR2dFQUFLY0JOd0VGQVV3QlhBRjRRa2hDbUVLbkFyY0NnQUhIQXNBQno0TEFBY0FCd0FIQUFkK0M2QUJvQUcrQy80TEFBY0FCd0FIQUFjK0RGNE1BQWNBQjU0TTNnd2VEVjRObmczZURhQUJvQUdnQWFBQm9BR2dBYUFCb0FHZ0FhQUJvQUdnQWFBQm9BR2dBYUFCb0FHZ0FhQUJvQUVlRHFBQlZnNldEcUFCb1E2Z0FhQUJvQUhYRHZjT053LzNEdmNPOXc3M0R2Y085dzczRHZjTzl3NzNEdmNPOXc3M0R2Y085dzczRHZjTzl3NzNEdmNPOXc3M0R2Y085dzczRHZjTzl3NzNEdmNPOXc3M0RuY1BBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCd0FIQUFjQUJ3QUhBQWNBQndBSEFBY0FCN2NQUHdsR0NVNEpNQUNBQUlBQWdBQldDVjRKWVFtQUFHa0pjQWw0Q1h3SmdBa3dBREFBTUFBd0FJZ0pnQUNMQ1pNSmdBQ1pDWjhKb3dtckNZQUFzd2t3QUY0QVhnQjhBSUFBdXdrQUJNTUp5UW1BQU00SmdBRFZDVEFBTUFBd0FEQUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFJQUFxd1lXQk5rSU1BQXdBREFBTUFEZENlQUo2QW51Q1I0RTlna3dBUDRKQlFvTkNqQUFNQUNBQUJVSzB3aUFBQjBLSkFvc0NqUUtnQUF3QUR3S1F3cUFBRXNLdlFtZENWTUtXd293QURBQWdBQ0FBTGNFTUFDQUFHTUtnQUJyQ2pBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQWVCREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FJa0VQUUZ6Q25vS2lRU0NDb29La0FxSkJKZ0tvQXFrQ29rRUdBR3NDclFLdkFyQkNqQUFNQURKQ3RFS0ZRSFpDdUVLL2dIcEN2RUtNQUF3QURBQU1BQ0FBSXdFK1Fvd0FJQUFQd0VCQ3pBQU1BQXdBREFBTUFDQUFBa0xFUXN3QUlBQVB3RVpDeUVMZ0FBT0NDa0xNQUF4Q3prTE1BQXdBREFBTUFBd0FEQUFYZ0JlQUVFTE1BQXdBREFBTUFBd0FEQUFNQUF3QUVrTFRRdFZDNEFBWEF0a0M0QUFpUWt3QURBQU1BQXdBREFBTUFBd0FEQUFiQXR4QzNrTGdBdUZDNHNMTUFBd0FKTUxsd3VmQ3pBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBSUFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBcHdzd0FEQUFNQUNBQUlBQWdBQ3ZDNEFBZ0FDQUFJQUFnQUNBQUxjTE1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBdnd1QUFNY0xnQUNBQUlBQWdBQ0FBSUFBeWd1QUFJQUFnQUNBQUlBQTBRc3dBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBTmtMZ0FDQUFJQUE0QXN3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBSUFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0pDUjRFNkFzd0FEQUFod0h3QzRBQStBc0FEQWdNRUF3d0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFDQUFJQUFHQXdkRENVTU1BQXdBQzBNTlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlF3MUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSFBRd3dBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEVUhOUWMxQnpVSE5RYzFCelVITlFjMkJ6QUFNQUE1RERVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RZEZEREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFnQUNBQUlBQVRReFNERm9NTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBRjRBWGdCZUFGNEFYZ0JlQUY0QVlneGVBR29NWGdCeERIa01md3hlQUlVTVhnQmVBSTBNTUFBd0FEQUFNQUF3QUY0QVhnQ1ZESjBNTUFBd0FEQUFNQUJlQUY0QXBReGVBS3NNc3d5N0RGNEF3Z3k5RE1vTVhnQmVBRjRBWGdCZUFGNEFYZ0JlQUY0QVhnRFJETmtNZVFCcUNlQU0zQXg4QU9ZTTdBejBEUGdNWGdCZUFGNEFYZ0JlQUY0QVhnQmVBRjRBWGdCZUFGNEFYZ0JlQUY0QVhnQ2dBQUFOb0FBSERRNE5GZzB3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBZURTWU5NQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FJQUFnQUNBQUlBQWdBQ0FBQzROTUFCZUFGNEFOZzB3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QUQ0TlJnMU9EVllOWGcxbURUQUFiUTB3QURBQU1BQXdBREFBTUFBd0FEQUEyZ2JhQnRvRzJnYmFCdG9HMmdiYUJuVU5lZzNDQllBTndnV0ZEZG9HakEzYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2FVRFp3TnBBMm9EZG9HMmdhd0RiY052dzNIRGRvRzJnYlBEZFlOM0EzZkRlWU4yZ2JzRGZNTjJnYmFCdm9OL2czYUJnWU9EZzdhQmw0QVhnQmVBQllPWGdCZUFDVUcyZ1llRGw0QUpBNWVBQ3dPMnczYUJ0b0dNUTQ1RHRvRzJnYmFCdG9HUVE3YUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ1pKRGpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQjFFTzJnWTFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFkWkRqVUhOUWMxQnpVSE5RYzFCMkVPTlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVIYUE0MUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQjNBTzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnWTFCelVITlFjMUJ6VUhOUWMxQnpVSE5RYzFCelVITlFjMUJ6VUhOUWMxQjJFTzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnWkpEdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCdG9HMmdiYUJ0b0cyZ2JhQnRvRzJnYmFCa2tPZUE2Z0FLQUFvQUF3QURBQU1BQXdBS0FBb0FDZ0FLQUFvQUNnQUtBQWdBNHdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFBd0FEQUFNQUF3QURBQU1BQXdBREFBTUFELy93UUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBMEFBd0FCQUFFQUFnQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUtBQk1BRndBZUFCc0FHZ0FlQUJjQUZnQVNBQjRBR3dBWUFBOEFHQUFjQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQUdBQVlBQjRBSGdBZUFCTUFIZ0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFGZ0FiQUJJQUhnQWVBQjRBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQllBRFFBUkFCNEFCQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUJBQUVBQVFBQkFBRUFBVUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBa0FGZ0FhQUJzQUd3QWJBQjRBSFFBZEFCNEFUd0FYQUI0QURRQWVBQjRBR2dBYkFFOEFUd0FPQUZBQUhRQWRBQjBBVHdCUEFCY0FUd0JQQUU4QUZnQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFIUUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjBBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0JRQUI0QUhnQWVBQjRBVUFCUUFGQUFVQUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFlQUI0QUhnQWVBRkFBVHdCQUFFOEFUd0JQQUVBQVR3QlFBRkFBVHdCUUFCNEFIZ0FlQUI0QUhnQWVBQjBBSFFBZEFCMEFIZ0FkQUI0QURnQlFBRkFBVUFCUUFGQUFIZ0FlQUI0QUhnQWVBQjRBSGdCUUFCNEFVQUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUpBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBa0FDUUFKQUFrQUNRQUpBQWtBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFlQUI0QUhnQWVBRkFBSGdBZUFCNEFLd0FyQUZBQVVBQlFBRkFBR0FCUUFDc0FLd0FyQUNzQUhnQWVBRkFBSGdCUUFGQUFVQUFyQUZBQUt3QWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBS3dBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUJBQUVBQVFBQkFBRUFBUUFCQUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUNzQVVBQWVBQjRBSGdBZUFCNEFIZ0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBWUFBMEFLd0FyQUI0QUhnQWJBQ3NBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBRFFBRUFCNEFCQUFFQUI0QUJBQUVBQk1BQkFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBVmdCV0FGWUFWZ0JXQUZZQVZnQldBRllBVmdCV0FGWUFWZ0JXQUZZQVZnQldBRllBVmdCV0FGWUFWZ0JXQUZZQVZnQldBRllBS3dBckFDc0FLd0FyQUZZQVZnQldBQjRBSGdBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFHZ0FhQUJvQUdBQVlBQjRBSGdBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFFd0FFQUNzQUV3QVRBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFCb0FHUUFaQUI0QVVBQlFBQVFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUJNQVVBQUVBQVFBQkFBRUFBUUFCQUFFQUI0QUhnQUVBQVFBQkFBRUFBUUFCQUJRQUZBQUJBQUVBQjRBQkFBRUFBUUFCQUJRQUZBQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QlFBRkFBVUFBZUFCNEFVQUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBS3dBZUFGQUFCQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFGQUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQVVBQlFBQjRBSGdBWUFCTUFVQUFyQUNzQUt3QXJBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFFQUFRQUJBQUVBRkFBQkFBRUFBUUFCQUFFQUZBQUJBQUVBQVFBVUFBRUFBUUFCQUFFQUFRQUt3QXJBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFFQUFRQUJBQXJBQ3NBSGdBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBZUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQUVBQVFBQkFCUUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFGQUFCQUFFQUFRQUJBQUVBQVFBQkFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFBUUFCQUFOQUEwQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QWVBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUJBQUVBQVFBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBckFGQUFVQUFyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FVQUJRQUZBQVVBQlFBRkFBVUFBckFGQUFLd0FyQUNzQVVBQlFBRkFBVUFBckFDc0FCQUJRQUFRQUJBQUVBQVFBQkFBRUFBUUFLd0FyQUFRQUJBQXJBQ3NBQkFBRUFBUUFVQUFyQUNzQUt3QXJBQ3NBS3dBckFDc0FCQUFyQUNzQUt3QXJBRkFBVUFBckFGQUFVQUJRQUFRQUJBQXJBQ3NBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCUUFGQUFHZ0FhQUZBQVVBQlFBRkFBVUFCTUFCNEFHd0JRQUI0QUt3QXJBQ3NBQkFBRUFBUUFLd0JRQUZBQVVBQlFBRkFBVUFBckFDc0FLd0FyQUZBQVVBQXJBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUZBQVVBQXJBRkFBVUFBckFGQUFVQUFyQUNzQUJBQXJBQVFBQkFBRUFBUUFCQUFyQUNzQUt3QXJBQVFBQkFBckFDc0FCQUFFQUFRQUt3QXJBQ3NBQkFBckFDc0FLd0FyQUNzQUt3QXJBRkFBVUFCUUFGQUFLd0JRQUNzQUt3QXJBQ3NBS3dBckFDc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0FFQUFRQVVBQlFBRkFBQkFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FCQUFFQUFRQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQXJBRkFBVUFCUUFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQXJBRkFBVUFBckFGQUFVQUJRQUZBQVVBQXJBQ3NBQkFCUUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBckFBUUFCQUFFQUNzQUJBQUVBQVFBS3dBckFGQUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBVUFCUUFBUUFCQUFyQUNzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QWVBQnNBS3dBckFDc0FLd0FyQUNzQUt3QlFBQVFBQkFBRUFBUUFCQUFFQUNzQUJBQUVBQVFBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBckFGQUFVQUFyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBRUFBUUFCQUFFQUFRQUt3QXJBQVFBQkFBckFDc0FCQUFFQUFRQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUFRQUJBQXJBQ3NBS3dBckFGQUFVQUFyQUZBQVVBQlFBQVFBQkFBckFDc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0FlQUZBQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FFQUZBQUt3QlFBRkFBVUFCUUFGQUFVQUFyQUNzQUt3QlFBRkFBVUFBckFGQUFVQUJRQUZBQUt3QXJBQ3NBVUFCUUFDc0FVQUFyQUZBQVVBQXJBQ3NBS3dCUUFGQUFLd0FyQUNzQVVBQlFBRkFBS3dBckFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QXJBQ3NBS3dBRUFBUUFCQUFFQUFRQUt3QXJBQ3NBQkFBRUFBUUFLd0FFQUFRQUJBQUVBQ3NBS3dCUUFDc0FLd0FyQUNzQUt3QXJBQVFBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFGQUFVQUJRQUI0QUhnQWVBQjRBSGdBZUFCc0FIZ0FyQUNzQUt3QXJBQ3NBQkFBRUFBUUFCQUFyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUZBQVVBQlFBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUNzQUt3QXJBRkFBQkFBRUFBUUFCQUFFQUFRQUJBQXJBQVFBQkFBRUFDc0FCQUFFQUFRQUJBQXJBQ3NBS3dBckFDc0FLd0FyQUFRQUJBQXJBRkFBVUFCUUFDc0FLd0FyQUNzQUt3QlFBRkFBQkFBRUFDc0FLd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFCNEFVQUFFQUFRQUJBQXJBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQXJBRkFBVUFCUUFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FVQUJRQUZBQVVBQlFBQ3NBS3dBRUFGQUFCQUFFQUFRQUJBQUVBQVFBQkFBckFBUUFCQUFFQUNzQUJBQUVBQVFBQkFBckFDc0FLd0FyQUNzQUt3QXJBQVFBQkFBckFDc0FLd0FyQUNzQUt3QXJBRkFBS3dCUUFGQUFCQUFFQUNzQUt3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBQ3NBVUFCUUFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUJBQUVBRkFBQkFBRUFBUUFCQUFFQUFRQUJBQXJBQVFBQkFBRUFDc0FCQUFFQUFRQUJBQlFBQjRBS3dBckFDc0FLd0JRQUZBQVVBQUVBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBQkFBRUFDc0FLd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUJvQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUFRQUJBQXJBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBS3dBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUNzQVVBQXJBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQXJBQ3NBS3dBRUFDc0FLd0FyQUNzQUJBQUVBQVFBQkFBRUFBUUFLd0FFQUNzQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUNzQUt3QXJBQ3NBS3dBckFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FLd0FyQUFRQUJBQWVBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQXFBRndBWEFBcUFDb0FLZ0FxQUNvQUtnQXFBQ3NBS3dBckFDc0FHd0JjQUZ3QVhBQmNBRndBWEFCY0FDb0FLZ0FxQUNvQUtnQXFBQ29BS2dBZUFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FEUUFOQUNzQUt3QXJBQ3NBS3dCY0FGd0FLd0JjQUNzQUt3QmNBRndBS3dCY0FDc0FLd0JjQUNzQUt3QXJBQ3NBS3dBckFGd0FYQUJjQUZ3QUt3QmNBRndBWEFCY0FGd0FYQUJjQUNzQVhBQmNBRndBS3dCY0FDc0FYQUFyQUNzQVhBQmNBQ3NBWEFCY0FGd0FYQUFxQUZ3QVhBQXFBQ29BS2dBcUFDb0FLZ0FyQUNvQUtnQmNBQ3NBS3dCY0FGd0FYQUJjQUZ3QUt3QmNBQ3NBS2dBcUFDb0FLZ0FxQUNvQUt3QXJBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBS3dBckFGd0FYQUJjQUZ3QVVBQU9BQTRBRGdBT0FCNEFEZ0FPQUFrQURnQU9BQTBBQ1FBVEFCTUFFd0FUQUJNQUNRQWVBQk1BSGdBZUFCNEFCQUFFQUI0QUhnQWVBQjRBSGdBZUFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFOQUFRQUhnQUVBQjRBQkFBV0FCRUFGZ0FSQUFRQUJBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUNzQUt3QXJBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFOQUFRQUJBQUVBQVFBQkFBTkFBUUFCQUJRQUZBQVVBQlFBRkFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFDc0FCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQ3NBRFFBTkFCNEFIZ0FlQUI0QUhnQWVBQVFBSGdBZUFCNEFIZ0FlQUI0QUt3QWVBQjRBRGdBT0FBMEFEZ0FlQUI0QUhnQWVBQjRBQ1FBSkFDc0FLd0FyQUNzQUt3QmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QUtnQXFBQ29BS2dBcUFDb0FLZ0FxQUNvQUtnQXFBQ29BS2dBcUFDb0FLZ0FxQUNvQUtnQXFBRndBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dBTkFBMEFIZ0FlQUI0QUhnQmNBRndBWEFCY0FGd0FYQUFxQUNvQUtnQXFBRndBWEFCY0FGd0FLZ0FxQUNvQVhBQXFBQ29BS2dCY0FGd0FLZ0FxQUNvQUtnQXFBQ29BS2dCY0FGd0FYQUFxQUNvQUtnQXFBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FLZ0FxQUNvQUtnQXFBQ29BS2dBcUFDb0FLZ0FxQUNvQVhBQXFBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBS2dBcUFDb0FLZ0FxQUNvQVVBQlFBRkFBVUFCUUFGQUFLd0JRQUNzQUt3QXJBQ3NBS3dCUUFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFlQUZBQVVBQlFBRkFBV0FCWUFGZ0FXQUJZQUZnQVdBQllBRmdBV0FCWUFGZ0FXQUJZQUZnQVdBQllBRmdBV0FCWUFGZ0FXQUJZQUZnQVdBQllBRmdBV0FCWUFGZ0FXQUJZQUZrQVdRQlpBRmtBV1FCWkFGa0FXUUJaQUZrQVdRQlpBRmtBV1FCWkFGa0FXUUJaQUZrQVdRQlpBRmtBV1FCWkFGa0FXUUJaQUZrQVdRQlpBRmtBV1FCYUFGb0FXZ0JhQUZvQVdnQmFBRm9BV2dCYUFGb0FXZ0JhQUZvQVdnQmFBRm9BV2dCYUFGb0FXZ0JhQUZvQVdnQmFBRm9BV2dCYUFGb0FXZ0JhQUZvQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QlFBRkFBVUFCUUFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFDc0FVQUFyQUZBQVVBQlFBRkFBS3dBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FVQUJRQUZBQVVBQXJBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBVUFCUUFGQUFVQUFyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUZBQUt3QlFBRkFBVUFCUUFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFGQUFVQUJRQUZBQUt3QXJBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBS3dBRUFBUUFCQUFlQUEwQUhnQWVBQjRBSGdBZUFCNEFIZ0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QXJBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQ3NBS3dBckFDc0FLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBckFGQUFVQUJRQUZBQVVBQlFBQ3NBS3dBTkFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQWVBQjRBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQTBBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQllBRVFBckFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQURRQU5BQTBBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FLd0FyQUNzQUt3QXJBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUZBQVVBQlFBRkFBQkFBRUFBUUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUFRQUJBQUVBQTBBRFFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBRUFBUUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFGQUFVQUJRQUNzQUJBQUVBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUFxQUNvQUtnQXFBQ29BS2dBcUFDb0FLZ0FxQUNvQUtnQXFBQ29BS2dBcUFDb0FLZ0FxQUNvQURRQU5BQlVBWEFBTkFCNEFEUUFiQUZ3QUtnQXJBQ3NBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dBckFDc0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBS3dBckFDc0FLd0FyQUI0QUhnQVRBQk1BRFFBTkFBNEFIZ0FUQUJNQUhnQUVBQVFBQkFBSkFDc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0FyQUNzQUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQXJBQ3NBS3dBckFDc0FLd0FyQUNzQVVBQlFBRkFBVUFCUUFBUUFCQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFCQUJRQUNzQUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUNzQUt3QXJBQ3NBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFLd0FyQUNzQUt3QWVBQ3NBS3dBckFCTUFFd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUNzQUt3QmNBRndBWEFCY0FGd0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBQ3NBS3dBckFDc0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FLd0FyQUNzQUt3QXJBQ3NBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCY0FDc0FLd0FyQUNvQUtnQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFCQUFFQUFRQUJBQUVBQ3NBS3dBZUFCNEFYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QUtnQXFBQ29BS2dBcUFDb0FLZ0FxQUNvQUtnQXJBQ29BS2dBcUFDb0FLZ0FxQUNvQUtnQXFBQ29BS2dBcUFDb0FLZ0FxQUNvQUtnQXFBQ29BS2dBcUFDb0FLZ0FxQUNvQUtnQXFBQ29BS2dBckFDc0FCQUJMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUNzQUt3QXJBQ3NBS3dBckFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FLd0FyQUNzQUt3QXJBQ3NBS2dBcUFDb0FLZ0FxQUNvQUtnQmNBQ29BS2dBcUFDb0FLZ0FxQUNzQUt3QUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFyQUFRQUJBQUVBQVFBQkFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBRUFBUUFCQUFFQUFRQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUNzQUt3QXJBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBRFFBTkFCNEFEUUFOQUEwQURRQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQ3NBS3dBckFBUUFCQUFFQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFVQUJRQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBSGdBZUFCNEFIZ0JRQUZBQVVBQlFBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBckFDc0FLd0FOQUEwQURRQU5BQTBBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dBckFDc0FLd0JRQUZBQVVBQkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFOQUEwQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBckFDc0FLd0FyQUNzQUt3QXJBQ3NBQkFBRUFBUUFIZ0FFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBRkFBVUFCUUFGQUFCQUJRQUZBQVVBQlFBQVFBQkFBRUFGQUFVQUFFQUFRQUJBQXJBQ3NBS3dBckFDc0FLd0FFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFLd0FFQUFRQUJBQUVBQVFBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FyQUNzQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUZBQUt3QlFBQ3NBVUFBckFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUt3QXJBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFDc0FIZ0FlQUI0QUhnQWVBQjRBSGdBZUFGQUFIZ0FlQUI0QVVBQlFBRkFBS3dBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFGQUFVQUJRQUZBQUt3QXJBQjRBSGdBZUFCNEFIZ0FlQUNzQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQXJBQ3NBVUFCUUFGQUFLd0FlQUI0QUhnQWVBQjRBSGdBZUFBNEFIZ0FyQUEwQURRQU5BQTBBRFFBTkFBMEFDUUFOQUEwQURRQUlBQVFBQ3dBRUFBUUFEUUFKQUEwQURRQU1BQjBBSFFBZUFCY0FGd0FXQUJjQUZ3QVhBQllBRndBZEFCMEFIZ0FlQUJRQUZBQVVBQTBBQVFBQkFBUUFCQUFFQUFRQUJBQUpBQm9BR2dBYUFCb0FHZ0FhQUJvQUdnQWVBQmNBRndBZEFCVUFGUUFlQUI0QUhnQWVBQjRBSGdBWUFCWUFFUUFWQUJVQUZRQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBTkFCNEFEUUFOQUEwQURRQWVBQTBBRFFBTkFBY0FIZ0FlQUI0QUhnQXJBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBVUFCUUFDc0FLd0JQQUZBQVVBQlFBRkFBVUFBZUFCNEFIZ0FXQUJFQVR3QlFBRThBVHdCUEFFOEFVQUJRQUZBQVVBQlFBQjRBSGdBZUFCWUFFUUFyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBckFDc0FHd0FiQUJzQUd3QWJBQnNBR3dBYUFCc0FHd0FiQUJzQUd3QWJBQnNBR3dBYkFCc0FHd0FiQUJzQUd3QWFBQnNBR3dBYkFCc0FHZ0FiQUJzQUdnQWJBQnNBR3dBYkFCc0FHd0FiQUJzQUd3QWJBQnNBR3dBYkFCc0FHd0FiQUJzQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFCNEFIZ0JRQUJvQUhnQWRBQjRBVUFBZUFCb0FIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFUd0FlQUZBQUd3QWVBQjRBVUFCUUFGQUFVQUJRQUI0QUhnQWVBQjBBSFFBZUFGQUFIZ0JRQUI0QVVBQWVBRkFBVHdCUUFGQUFIZ0FlQUI0QUhnQWVBQjRBSGdCUUFGQUFVQUJRQUZBQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0JRQUI0QVVBQlFBRkFBVUFCUEFFOEFVQUJRQUZBQVVBQlFBRThBVUFCUUFFOEFVQUJQQUU4QVR3QlBBRThBVHdCUEFFOEFUd0JQQUU4QVR3QlFBRkFBVUFCUUFFOEFUd0JQQUU4QVR3QlBBRThBVHdCUEFFOEFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFIZ0FlQUZBQVVBQlFBRkFBVHdBZUFCNEFLd0FyQUNzQUt3QWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZEFCNEFIUUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhRQWVBQjBBSFFBZUFCNEFIZ0FkQUIwQUhnQWVBQjBBSGdBZUFCNEFIUUFlQUIwQUd3QWJBQjRBSFFBZUFCNEFIZ0FlQUIwQUhnQWVBQjBBSFFBZEFCMEFIZ0FlQUIwQUhnQWRBQjRBSFFBZEFCMEFIUUFkQUIwQUhnQWRBQjRBSGdBZUFCNEFIZ0FkQUIwQUhRQWRBQjRBSGdBZUFCNEFIUUFkQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhRQWVBQjRBSGdBZEFCNEFIZ0FlQUI0QUhnQWRBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIUUFkQUI0QUhnQWRBQjBBSFFBZEFCNEFIZ0FkQUIwQUhnQWVBQjBBSFFBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZEFCMEFIZ0FlQUIwQUhRQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCMEFIZ0FlQUI0QUhRQWVBQjRBSGdBZUFCNEFIZ0FlQUIwQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FkQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCUUFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBV0FCRUFGZ0FSQUI0QUhnQWVBQjRBSGdBZUFCMEFIZ0FlQUI0QUhnQWVBQjRBSGdBbEFDVUFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFGZ0FSQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQ1VBSlFBbEFDVUFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QlBBRThBVHdCUEFFOEFUd0JQQUU4QVR3QlBBRThBVHdCUEFFOEFUd0JQQUU4QVR3QlBBRThBVHdCUEFFOEFUd0JQQUU4QVR3QlBBRThBVHdCUEFFOEFIUUFkQUIwQUhRQWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQjBBSFFCUEFFOEFUd0JQQUU4QVR3QlBBRThBVHdCUEFFOEFUd0JQQUU4QVR3QlBBRThBVHdCUEFFOEFUd0JRQUIwQUhRQWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQjRBSGdBZUFCNEFIUUFkQUIwQUhRQWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjBBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhnQWVBQjBBSFFBZEFCMEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FkQUIwQUhnQWRBQjBBSFFBZEFCMEFIUUFkQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FkQUIwQUhnQWVBQjBBSFFBZUFCNEFIZ0FlQUIwQUhRQWVBQjRBSGdBZUFCMEFIUUFkQUI0QUhnQWRBQjRBSGdBZEFCMEFIUUFkQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIUUFkQUIwQUhRQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWRBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUpRQWxBQ1VBSlFBZUFCMEFIUUFlQUI0QUhRQWVBQjRBSGdBZUFCMEFIUUFlQUI0QUhnQWVBQ1VBSlFBZEFCMEFKUUFlQUNVQUpRQWxBQ0FBSlFBbEFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSlFBbEFDVUFIZ0FlQUI0QUhnQWRBQjRBSFFBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIUUFkQUI0QUhRQWRBQjBBSGdBZEFDVUFIUUFkQUI0QUhRQWRBQjRBSFFBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWxBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCMEFIUUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSFFBZEFCMEFIUUFsQUI0QUpRQWxBQ1VBSFFBbEFDVUFIUUFkQUIwQUpRQWxBQjBBSFFBbEFCMEFIUUFsQUNVQUpRQWVBQjBBSGdBZUFCNEFIZ0FkQUIwQUpRQWRBQjBBSFFBZEFCMEFIUUFsQUNVQUpRQWxBQ1VBSFFBbEFDVUFJQUFsQUIwQUhRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUhnQWVBQjRBSlFBbEFDQUFJQUFnQUNBQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FkQUI0QUhnQWVBQmNBRndBWEFCY0FGd0FYQUI0QUV3QVRBQ1VBSGdBZUFCNEFGZ0FSQUJZQUVRQVdBQkVBRmdBUkFCWUFFUUFXQUJFQUZnQVJBRThBVHdCUEFFOEFUd0JQQUU4QVR3QlBBRThBVHdCUEFFOEFUd0JQQUU4QVR3QlBBRThBVHdCUEFFOEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQVdBQkVBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBRmdBUkFCWUFFUUFXQUJFQUZnQVJBQllBRVFBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCWUFFUUFXQUJFQUZnQVJBQllBRVFBV0FCRUFGZ0FSQUJZQUVRQVdBQkVBRmdBUkFCWUFFUUFXQUJFQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUZnQVJBQllBRVFBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCWUFFUUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSFFBZEFCMEFIUUFkQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBS3dBckFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFLd0FyQUNzQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBS3dBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUI0QUhnQWVBQjRBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FFQUFRQUJBQWVBQjRBS3dBckFDc0FLd0FyQUJNQURRQU5BQTBBVUFBVEFBMEFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FLd0FyQUNzQUt3QXJBQ3NBVUFBTkFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QUVBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFDc0FVQUJRQUZBQVVBQlFBRkFBVUFBckFGQUFVQUJRQUZBQVVBQlFBRkFBS3dCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUEwQURRQU5BQTBBRFFBTkFBMEFEUUFlQUEwQUZnQU5BQjRBSGdBWEFCY0FIZ0FlQUJjQUZ3QVdBQkVBRmdBUkFCWUFFUUFXQUJFQURRQU5BQTBBRFFBVEFGQUFEUUFOQUI0QURRQU5BQjRBSGdBZUFCNEFIZ0FNQUF3QURRQU5BQTBBSGdBTkFBMEFGZ0FOQUEwQURRQU5BQTBBRFFBTkFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNzQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFyQUNzQUt3QXJBQTBBRVFBUkFDVUFKUUJIQUZjQVZ3QVdBQkVBRmdBUkFCWUFFUUFXQUJFQUZnQVJBQ1VBSlFBV0FCRUFGZ0FSQUJZQUVRQVdBQkVBRlFBV0FCRUFFUUFsQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUFRQUJBQUVBQVFBQkFBRUFDVUFWd0JYQUZjQVZ3QTJBQ1VBSlFCWEFGY0FWd0JIQUVjQUpRQWxBQ1VBS3dCUkFGY0FVUUJYQUZFQVZ3QlJBRmNBVVFCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRkVBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JSQUZjQVVRQlhBRkVBVndCWEFGY0FWd0JYQUZjQVVRQlhBRmNBVndCWEFGY0FWd0JSQUZFQUt3QXJBQVFBQkFBVkFCVUFSd0JIQUZjQUZRQlJBRmNBVVFCWEFGRUFWd0JSQUZjQVVRQlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZFQVZ3QlJBRmNBVVFCWEFGY0FWd0JYQUZjQVZ3QlJBRmNBVndCWEFGY0FWd0JYQUZFQVVRQlhBRmNBVndCWEFCVUFVUUJIQUVjQVZ3QXJBQ3NBS3dBckFDc0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQUt3QXJBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndBckFDVUFKUUJYQUZjQVZ3QlhBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBS3dBckFDc0FLd0FyQUNVQUpRQWxBQ1VBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FVUUJSQUZFQVVRQlJBRkVBVVFCUkFGRUFVUUJSQUZFQVVRQlJBRkVBVVFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNzQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFFOEFUd0JQQUU4QVR3QlBBRThBVHdBbEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUVjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FLd0FyQUNzQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQURRQVRBQTBBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRkFBVUFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBRkFBQkFBRUFBUUFCQUFlQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUhnQlFBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBVUFCUUFBUUFCQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFBUUFCQUFlQUEwQURRQU5BQTBBRFFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFVQUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdCUUFCNEFIZ0FlQUI0QUhnQWVBRkFBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBckFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQVFBVUFCUUFGQUFCQUJRQUZBQVVBQlFBQVFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUFRQUJBQUVBQVFBQkFBZUFCNEFIZ0FlQUNzQUt3QXJBQ3NBVUFCUUFGQUFVQUJRQUZBQUhnQWVBQm9BSGdBckFDc0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBRGdBT0FCTUFFd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FCQUFFQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQVFBQkFBRUFBUUFCQUFFQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FOQUEwQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QXJBQ3NBS3dBckFDc0FLd0FFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUJRQUZBQVVBQlFBRkFBVUFBZUFCNEFIZ0JRQUE0QVVBQXJBQ3NBVUFCUUFGQUFVQUJRQUZBQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUEwQURRQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUI0QVdBQllBRmdBV0FCWUFGZ0FXQUJZQUZnQVdBQllBRmdBV0FCWUFGZ0FXQUJZQUZnQVdBQllBRmdBV0FCWUFGZ0FXQUJZQUZnQVdBQllBQ3NBS3dBckFBUUFIZ0FlQUI0QUhnQWVBQjRBRFFBTkFBMEFIZ0FlQUI0QUhnQXJBRkFBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dBckFDc0FLd0FyQUI0QUhnQmNBRndBWEFCY0FGd0FLZ0JjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVhBQmNBRndBWEFCY0FDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBRkFBVUFCUUFBUUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFBUUFCQUFyQUNzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QXJBQ3NBSGdBTkFBMEFEUUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBS2dBcUFDb0FYQUFxQUNvQUtnQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQXFBRndBS2dBcUFDb0FYQUJjQUNvQUtnQmNBRndBWEFCY0FGd0FLZ0FxQUZ3QUtnQmNBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUZ3QVhBQmNBQ29BS2dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFCQUFFQUFRQUJBQUVBQTBBRFFCUUFGQUFVQUFFQUFRQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFVQUFyQUNzQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUZBQVVBQlFBRkFBVUFCUUFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFGQUFVQUJRQUZBQVVBQlFBRkFBS3dCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBRFFBRUFBUUFLd0FyQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQUt3QXJBQ3NBS3dBckFDc0FWQUJWQUZVQVZRQlZBRlVBVlFCVkFGVUFWUUJWQUZVQVZRQlZBRlVBVlFCVkFGVUFWUUJWQUZVQVZRQlZBRlVBVlFCVkFGVUFWUUJVQUZVQVZRQlZBRlVBVlFCVkFGVUFWUUJWQUZVQVZRQlZBRlVBVlFCVkFGVUFWUUJWQUZVQVZRQlZBRlVBVlFCVkFGVUFWUUJWQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBRmtBV1FCWkFGa0FXUUJaQUZrQVdRQlpBRmtBV1FCWkFGa0FXUUJaQUZrQVdRQlpBRmtBS3dBckFDc0FLd0JhQUZvQVdnQmFBRm9BV2dCYUFGb0FXZ0JhQUZvQVdnQmFBRm9BV2dCYUFGb0FXZ0JhQUZvQVdnQmFBRm9BV2dCYUFGb0FXZ0JhQUZvQUt3QXJBQ3NBS3dBR0FBWUFCZ0FHQUFZQUJnQUdBQVlBQmdBR0FBWUFCZ0FHQUFZQUJnQUdBQVlBQmdBR0FBWUFCZ0FHQUFZQUJnQUdBQVlBQmdBR0FBWUFCZ0FHQUFZQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFDVUFKUUJYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FKUUFsQUNVQUpRQWxBQ1VBVUFCUUFGQUFVQUJRQUZBQVVBQXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUZBQUt3QXJBQ3NBS3dBckFGWUFCQUJXQUZZQVZnQldBRllBVmdCV0FGWUFWZ0JXQUI0QVZnQldBRllBVmdCV0FGWUFWZ0JXQUZZQVZnQldBRllBVmdBckFGWUFWZ0JXQUZZQVZnQXJBRllBS3dCV0FGWUFLd0JXQUZZQUt3QldBRllBVmdCV0FGWUFWZ0JXQUZZQVZnQldBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBRVFBV0FGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQWFBQjRBS3dBckFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBR0FBUkFCRUFHQUFZQUJNQUV3QVdBQkVBRkFBckFDc0FLd0FyQUNzQUt3QUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUNVQUpRQWxBQ1VBSlFBV0FCRUFGZ0FSQUJZQUVRQVdBQkVBRmdBUkFCWUFFUUFsQUNVQUZnQVJBQ1VBSlFBbEFDVUFKUUFsQUNVQUVRQWxBQkVBS3dBVkFCVUFFd0FUQUNVQUZnQVJBQllBRVFBV0FCRUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDc0FKUUFiQUJvQUpRQXJBQ3NBS3dBckFGQUFVQUJRQUZBQVVBQXJBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUFjQUt3QVRBQ1VBSlFBYkFCb0FKUUFsQUJZQUVRQWxBQ1VBRVFBbEFCRUFKUUJYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUJVQUZRQWxBQ1VBSlFBVEFDVUFWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFCWUFKUUFSQUNVQUpRQWxBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QVdBQ1VBRVFBbEFCWUFFUUFSQUJZQUVRQVJBQlVBVndCUkFGRUFVUUJSQUZFQVVRQlJBRkVBVVFCUkFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRWNBUndBckFDc0FWd0JYQUZjQVZ3QlhBRmNBS3dBckFGY0FWd0JYQUZjQVZ3QlhBQ3NBS3dCWEFGY0FWd0JYQUZjQVZ3QXJBQ3NBVndCWEFGY0FLd0FyQUNzQUdnQWJBQ1VBSlFBbEFCc0FHd0FyQUI0QUhnQWVBQjRBSGdBZUFCNEFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FFQUFRQUJBQVFBQjBBS3dBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFLd0JRQUZBQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUNzQUt3QXJBQ3NBRFFBTkFBMEFLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUNzQUt3QXJBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdCUUFGQUFIZ0FlQUI0QUt3QWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBckFDc0FLd0FyQUI0QUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFCQUFyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUFRQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFDc0FLd0FyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBRUFBUUFCQUFFQUFRQUt3QXJBQ3NBS3dBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUNzQURRQlFBRkFBVUFCUUFDc0FLd0FyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUEwQVVBQlFBRkFBVUFCUUFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QXJBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFDc0FLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUI0QUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0JRQUZBQVVBQlFBRkFBVUFBckFDc0FVQUFyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FVQUJRQUNzQUt3QXJBRkFBS3dBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQXJBQTBBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUI0QUhnQlFBRkFBVUFCUUFGQUFVQUJRQUNzQUt3QXJBQ3NBS3dBckFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FVQUJRQUNzQUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUNzQURRQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QXJBQ3NBS3dBckFCNEFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBckFDc0FLd0JRQUZBQVVBQlFBRkFBQkFBRUFBUUFLd0FFQUFRQUt3QXJBQ3NBS3dBckFBUUFCQUFFQUFRQVVBQlFBRkFBVUFBckFGQUFVQUJRQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FLd0FyQUNzQUJBQUVBQVFBS3dBckFDc0FLd0FFQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUNzQUt3QXJBQ3NBS3dBckFDc0FEUUFOQUEwQURRQU5BQTBBRFFBTkFCNEFLd0FyQUNzQUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUI0QVVBQlFBRkFBVUFCUUFGQUFVQUJRQUI0QVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFCQUFFQUNzQUt3QXJBQ3NBVUFCUUFGQUFVQUJRQUEwQURRQU5BQTBBRFFBTkFCUUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQXJBQ3NBS3dBTkFBMEFEUUFOQUEwQURRQU5BRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBS3dBckFDc0FLd0FyQUNzQUhnQWVBQjRBSGdBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QXJBQ3NBS3dBckFDc0FLd0JRQUZBQVVBQlFBRkFBVUFBRUFBUUFCQUFFQUFRQUJBQUVBQTBBRFFBZUFCNEFIZ0FlQUI0QUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUJBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQWVBQjRBSGdBTkFBMEFEUUFOQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBckFDc0FLd0FyQUNzQUt3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBQ3NBS3dBckFDc0FLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQ3NBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dBTkFBMEFEUUFOQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBQkFBZUFBNEFVQUFyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FFQUZBQVVBQlFBRkFBRFFBTkFCNEFEUUFlQUFRQUJBQUVBQjRBS3dBckFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FVQUFPQUZBQURRQU5BQTBBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFOQUEwQUhnQU5BQTBBSGdBRUFDc0FVQUJRQUZBQVVBQlFBRkFBVUFBckFGQUFLd0JRQUZBQVVBQlFBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQTBBS3dBckFDc0FLd0FyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUt3QXJBQ3NBS3dBckFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FLd0FyQUNzQUt3QXJBQ3NBQkFBRUFBUUFCQUFyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUNzQVVBQlFBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUFRQUJBQUVBQVFBQkFBckFDc0FCQUFFQUNzQUt3QUVBQVFBQkFBckFDc0FVQUFyQUNzQUt3QXJBQ3NBS3dBRUFDc0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFCQUFFQUNzQUt3QUVBQVFBQkFBRUFBUUFCQUFFQUNzQUt3QXJBQVFBQkFBRUFBUUFCQUFyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUJBQUVBQVFBQkFBRUFBUUFCQUJRQUZBQVVBQlFBQTBBRFFBTkFBMEFIZ0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUNzQURRQXJBQjRBS3dBckFBUUFCQUFFQUFRQVVBQlFBQjRBVUFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dBckFDc0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFFQUFRQUJBQUVBQVFBQkFBRUFDc0FLd0FFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFPQUEwQURRQVRBQk1BSGdBZUFCNEFEUUFOQUEwQURRQU5BQTBBRFFBTkFBMEFEUUFOQUEwQURRQU5BQTBBVUFCUUFGQUFVQUFFQUFRQUt3QXJBQVFBRFFBTkFCNEFVQUFyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QXJBQ3NBS3dBckFDc0FLd0FPQUE0QURnQU9BQTRBRGdBT0FBNEFEZ0FPQUE0QURnQU9BQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUJjQUZ3QVhBQmNBRndBWEFCY0FGd0FYQUFyQUNzQUt3QXFBQ29BS2dBcUFDb0FLZ0FxQUNvQUtnQXFBQ29BS2dBcUFDb0FLZ0FyQUNzQUt3QXJBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBWEFCY0FBMEFEUUFOQUNvQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dCUUFGQUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBRUFBUUFCQUFFQUFRQUJBQUVBRkFBQkFBRUFBUUFCQUFPQUI0QURRQU5BQTBBRFFBT0FCNEFCQUFyQUNzQUt3QXJBQ3NBS3dBckFDc0FVQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQVVBQlFBRkFBVUFBckFDc0FVQUJRQUZBQVVBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUEwQURRQU5BQ3NBRGdBT0FBNEFEUUFOQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQXJBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUNzQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUZBQURRQU5BQTBBRFFBTkFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFDc0FLd0FPQUJNQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QXJBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFyQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBVUFCUUFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQUVBQVFBQkFBRUFBUUFCQUFyQUNzQUt3QUVBQ3NBQkFBRUFDc0FCQUFFQUFRQUJBQUVBQVFBQkFCUUFBUUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FLd0FyQUNzQUt3QXJBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBS3dBckFDc0FLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FEUUFOQUEwQURRQU5BQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dCUUFGQUFVQUJRQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFTQUJJQUVnQVF3QkRBRU1BVUFCUUFGQUFVQUJEQUZBQVVBQlFBRWdBUXdCSUFFTUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFTQUJEQUVNQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQklBRU1BVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBS3dBckFDc0FLd0FOQUEwQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBckFBUUFCQUFFQUFRQUJBQU5BQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQUVBQVFBQkFBRUFBUUFCQUFFQUEwQURRQU5BQjRBSGdBZUFCNEFIZ0FlQUZBQVVBQlFBRkFBRFFBZUFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFLd0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQXJBQ3NBS3dBckFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFGQUFVQUJRQUZBQVVBQXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBVUFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUJBQUVBQVFBQkFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUVjQVJ3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBckFDc0FLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBckFDc0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBQ3NBS3dBZUFBUUFCQUFOQUFRQUJBQUVBQVFBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUhnQWVBQjRBSGdBZUFCNEFIZ0FyQUNzQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFCQUFFQUFRQUJBQUVBQjRBSGdBZUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUhnQWVBQVFBQkFBRUFBUUFCQUFFQUFRQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBRUFBUUFCQUFFQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFCNEFIZ0FFQUFRQUJBQWVBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFDc0FIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQXJBRkFBVUFBckFDc0FVQUFyQUNzQVVBQlFBQ3NBS3dCUUFGQUFVQUJRQUNzQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBS3dCUUFDc0FVQUJRQUZBQVVBQlFBRkFBVUFBckFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FyQUZBQVVBQlFBRkFBS3dBckFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBckFGQUFVQUJRQUZBQVVBQlFBRkFBS3dBZUFCNEFVQUJRQUZBQVVBQlFBQ3NBVUFBckFDc0FLd0JRQUZBQVVBQlFBRkFBVUFCUUFDc0FIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBckFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFBZUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFLd0FyQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFFc0FCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQjRBSGdBZUFCNEFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQUVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBQkFBZUFCNEFEUUFOQUEwQURRQWVBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUFRQUJBQUVBQVFBQkFBckFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUJBQUVBQVFBQkFBRUFBUUFCQUFyQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFyQUNzQUJBQUVBQVFBQkFBRUFBUUFCQUFyQUFRQUJBQXJBQVFBQkFBRUFBUUFCQUFyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QlFBRkFBVUFCUUFGQUFLd0FyQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUFRQUJBQUVBQVFBQkFBRUFBUUFLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FIZ0FlQUI0QUhnQUVBQVFBQkFBRUFBUUFCQUFFQUNzQUt3QXJBQ3NBS3dCTEFFc0FTd0JMQUVzQVN3QkxBRXNBU3dCTEFDc0FLd0FyQUNzQUZnQVdBRkFBVUFCUUFGQUFLd0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUFyQUZBQVVBQXJBRkFBS3dBckFGQUFLd0JRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUNzQVVBQlFBRkFBVUFBckFGQUFLd0JRQUNzQUt3QXJBQ3NBS3dBckFGQUFLd0FyQUNzQUt3QlFBQ3NBVUFBckFGQUFLd0JRQUZBQVVBQXJBRkFBVUFBckFGQUFLd0FyQUZBQUt3QlFBQ3NBVUFBckFGQUFLd0JRQUNzQVVBQlFBQ3NBVUFBckFDc0FVQUJRQUZBQVVBQXJBRkFBVUFCUUFGQUFVQUJRQUZBQUt3QlFBRkFBVUFCUUFDc0FVQUJRQUZBQVVBQXJBRkFBS3dCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFDc0FLd0FyQUNzQUt3QlFBRkFBVUFBckFGQUFVQUJRQUZBQVVBQXJBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQlFBRkFBVUFCUUFGQUFVQUJRQUZBQVVBQXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUI0QUhnQXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FUd0JQQUU4QVR3QlBBRThBVHdCUEFFOEFUd0JQQUU4QVR3QWxBQ1VBSlFBZEFCMEFIUUFkQUIwQUhRQWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQjBBSFFBZUFDVUFIUUFkQUIwQUhRQWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQjBBSFFBZEFCMEFIZ0FlQUNVQUpRQWxBQ1VBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQjBBSFFBZEFCMEFIUUFkQUIwQUhRQWRBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDa0FLUUFwQUNrQUtRQXBBQ2tBS1FBcEFDa0FLUUFwQUNrQUtRQXBBQ2tBS1FBcEFDa0FLUUFwQUNrQUtRQXBBQ2tBS1FBbEFDVUFKUUFsQUNVQUlBQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFCNEFIZ0FsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSGdBZUFDVUFKUUFsQUNVQUpRQWVBQ1VBSlFBbEFDVUFKUUFnQUNBQUlBQWxBQ1VBSUFBbEFDVUFJQUFnQUNBQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSVFBaEFDRUFJUUFoQUNVQUpRQWdBQ0FBSlFBbEFDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFJQUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFJQUFnQUNBQUlBQWxBQ1VBSlFBbEFDQUFKUUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFJQUFsQUNVQUpRQWdBQ1VBSlFBbEFDVUFJQUFnQUNBQUpRQWdBQ0FBSUFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWVBQ1VBSGdBbEFCNEFKUUFsQUNVQUpRQWxBQ0FBSlFBbEFDVUFKUUFlQUNVQUhnQWVBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFIZ0FlQUI0QUhnQWVBQjRBSGdBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUlBQWdBQ1VBSlFBbEFDVUFJQUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFJQUFsQUNVQUpRQWxBQ0FBSUFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUI0QUhnQWVBQjRBSGdBZUFDVUFKUUFsQUNVQUpRQWxBQ1VBSUFBZ0FDQUFKUUFsQUNVQUlBQWdBQ0FBSUFBZ0FCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUZ3QVhBQmNBRlFBVkFCVUFIZ0FlQUI0QUhnQWxBQ1VBSlFBZ0FDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSUFBZ0FDQUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFJQUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUlBQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWxBQ1VBSlFBbEFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSlFBbEFDVUFKUUFsQUNVQUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFlQUI0QUhnQWVBQjRBSGdBZUFCNEFIZ0FlQUI0QUhnQWVBQjRBSGdBZUFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNBQUlBQWdBQ0FBSUFBbEFDQUFJQUFsQUNVQUpRQWxBQ1VBSlFBZ0FDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFKUUFsQUNVQUlBQWdBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ0FBSUFBZ0FDQUFJQUFnQUNBQUlBQWdBQ0FBSUFBZ0FDQUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ3NBS3dCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBVndCWEFGY0FWd0JYQUZjQVZ3QlhBRmNBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFsQUNVQUpRQWxBQ1VBSlFBbEFDVUFKUUFyQUFRQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBQkFBRUFBUUFCQUFFQUFRQUJBQUVBQVFBQkFBRUFBUUFCQUFFQUFRQUJBQXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBS3dBckFDc0FLd0FyQUNzQUt3QXJBQ3NBJztcblxuICAgIC8qIEBmbG93ICovXHJcbiAgICB2YXIgTEVUVEVSX05VTUJFUl9NT0RJRklFUiA9IDUwO1xyXG4gICAgLy8gTm9uLXRhaWxvcmFibGUgTGluZSBCcmVha2luZyBDbGFzc2VzXHJcbiAgICB2YXIgQksgPSAxOyAvLyAgQ2F1c2UgYSBsaW5lIGJyZWFrIChhZnRlcilcclxuICAgIHZhciBDUiA9IDI7IC8vICBDYXVzZSBhIGxpbmUgYnJlYWsgKGFmdGVyKSwgZXhjZXB0IGJldHdlZW4gQ1IgYW5kIExGXHJcbiAgICB2YXIgTEYgPSAzOyAvLyAgQ2F1c2UgYSBsaW5lIGJyZWFrIChhZnRlcilcclxuICAgIHZhciBDTSA9IDQ7IC8vICBQcm9oaWJpdCBhIGxpbmUgYnJlYWsgYmV0d2VlbiB0aGUgY2hhcmFjdGVyIGFuZCB0aGUgcHJlY2VkaW5nIGNoYXJhY3RlclxyXG4gICAgdmFyIE5MID0gNTsgLy8gIENhdXNlIGEgbGluZSBicmVhayAoYWZ0ZXIpXHJcbiAgICB2YXIgV0ogPSA3OyAvLyAgUHJvaGliaXQgbGluZSBicmVha3MgYmVmb3JlIGFuZCBhZnRlclxyXG4gICAgdmFyIFpXID0gODsgLy8gIFByb3ZpZGUgYSBicmVhayBvcHBvcnR1bml0eVxyXG4gICAgdmFyIEdMID0gOTsgLy8gIFByb2hpYml0IGxpbmUgYnJlYWtzIGJlZm9yZSBhbmQgYWZ0ZXJcclxuICAgIHZhciBTUCA9IDEwOyAvLyBFbmFibGUgaW5kaXJlY3QgbGluZSBicmVha3NcclxuICAgIHZhciBaV0ogPSAxMTsgLy8gUHJvaGliaXQgbGluZSBicmVha3Mgd2l0aGluIGpvaW5lciBzZXF1ZW5jZXNcclxuICAgIC8vIEJyZWFrIE9wcG9ydHVuaXRpZXNcclxuICAgIHZhciBCMiA9IDEyOyAvLyAgUHJvdmlkZSBhIGxpbmUgYnJlYWsgb3Bwb3J0dW5pdHkgYmVmb3JlIGFuZCBhZnRlciB0aGUgY2hhcmFjdGVyXHJcbiAgICB2YXIgQkEgPSAxMzsgLy8gIEdlbmVyYWxseSBwcm92aWRlIGEgbGluZSBicmVhayBvcHBvcnR1bml0eSBhZnRlciB0aGUgY2hhcmFjdGVyXHJcbiAgICB2YXIgQkIgPSAxNDsgLy8gIEdlbmVyYWxseSBwcm92aWRlIGEgbGluZSBicmVhayBvcHBvcnR1bml0eSBiZWZvcmUgdGhlIGNoYXJhY3RlclxyXG4gICAgdmFyIEhZID0gMTU7IC8vICBQcm92aWRlIGEgbGluZSBicmVhayBvcHBvcnR1bml0eSBhZnRlciB0aGUgY2hhcmFjdGVyLCBleGNlcHQgaW4gbnVtZXJpYyBjb250ZXh0XHJcbiAgICB2YXIgQ0IgPSAxNjsgLy8gICBQcm92aWRlIGEgbGluZSBicmVhayBvcHBvcnR1bml0eSBjb250aW5nZW50IG9uIGFkZGl0aW9uYWwgaW5mb3JtYXRpb25cclxuICAgIC8vIENoYXJhY3RlcnMgUHJvaGliaXRpbmcgQ2VydGFpbiBCcmVha3NcclxuICAgIHZhciBDTCA9IDE3OyAvLyAgUHJvaGliaXQgbGluZSBicmVha3MgYmVmb3JlXHJcbiAgICB2YXIgQ1AgPSAxODsgLy8gIFByb2hpYml0IGxpbmUgYnJlYWtzIGJlZm9yZVxyXG4gICAgdmFyIEVYID0gMTk7IC8vICBQcm9oaWJpdCBsaW5lIGJyZWFrcyBiZWZvcmVcclxuICAgIHZhciBJTiA9IDIwOyAvLyAgQWxsb3cgb25seSBpbmRpcmVjdCBsaW5lIGJyZWFrcyBiZXR3ZWVuIHBhaXJzXHJcbiAgICB2YXIgTlMgPSAyMTsgLy8gIEFsbG93IG9ubHkgaW5kaXJlY3QgbGluZSBicmVha3MgYmVmb3JlXHJcbiAgICB2YXIgT1AgPSAyMjsgLy8gIFByb2hpYml0IGxpbmUgYnJlYWtzIGFmdGVyXHJcbiAgICB2YXIgUVUgPSAyMzsgLy8gIEFjdCBsaWtlIHRoZXkgYXJlIGJvdGggb3BlbmluZyBhbmQgY2xvc2luZ1xyXG4gICAgLy8gTnVtZXJpYyBDb250ZXh0XHJcbiAgICB2YXIgSVMgPSAyNDsgLy8gIFByZXZlbnQgYnJlYWtzIGFmdGVyIGFueSBhbmQgYmVmb3JlIG51bWVyaWNcclxuICAgIHZhciBOVSA9IDI1OyAvLyAgRm9ybSBudW1lcmljIGV4cHJlc3Npb25zIGZvciBsaW5lIGJyZWFraW5nIHB1cnBvc2VzXHJcbiAgICB2YXIgUE8gPSAyNjsgLy8gIERvIG5vdCBicmVhayBmb2xsb3dpbmcgYSBudW1lcmljIGV4cHJlc3Npb25cclxuICAgIHZhciBQUiA9IDI3OyAvLyAgRG8gbm90IGJyZWFrIGluIGZyb250IG9mIGEgbnVtZXJpYyBleHByZXNzaW9uXHJcbiAgICB2YXIgU1kgPSAyODsgLy8gIFByZXZlbnQgYSBicmVhayBiZWZvcmU7IGFuZCBhbGxvdyBhIGJyZWFrIGFmdGVyXHJcbiAgICAvLyBPdGhlciBDaGFyYWN0ZXJzXHJcbiAgICB2YXIgQUkgPSAyOTsgLy8gIEFjdCBsaWtlIEFMIHdoZW4gdGhlIHJlc29sdmVkRUFXIGlzIE47IG90aGVyd2lzZTsgYWN0IGFzIElEXHJcbiAgICB2YXIgQUwgPSAzMDsgLy8gIEFyZSBhbHBoYWJldGljIGNoYXJhY3RlcnMgb3Igc3ltYm9scyB0aGF0IGFyZSB1c2VkIHdpdGggYWxwaGFiZXRpYyBjaGFyYWN0ZXJzXHJcbiAgICB2YXIgQ0ogPSAzMTsgLy8gIFRyZWF0IGFzIE5TIG9yIElEIGZvciBzdHJpY3Qgb3Igbm9ybWFsIGJyZWFraW5nLlxyXG4gICAgdmFyIEVCID0gMzI7IC8vICBEbyBub3QgYnJlYWsgZnJvbSBmb2xsb3dpbmcgRW1vamkgTW9kaWZpZXJcclxuICAgIHZhciBFTSA9IDMzOyAvLyAgRG8gbm90IGJyZWFrIGZyb20gcHJlY2VkaW5nIEVtb2ppIEJhc2VcclxuICAgIHZhciBIMiA9IDM0OyAvLyAgRm9ybSBLb3JlYW4gc3lsbGFibGUgYmxvY2tzXHJcbiAgICB2YXIgSDMgPSAzNTsgLy8gIEZvcm0gS29yZWFuIHN5bGxhYmxlIGJsb2Nrc1xyXG4gICAgdmFyIEhMID0gMzY7IC8vICBEbyBub3QgYnJlYWsgYXJvdW5kIGEgZm9sbG93aW5nIGh5cGhlbjsgb3RoZXJ3aXNlIGFjdCBhcyBBbHBoYWJldGljXHJcbiAgICB2YXIgSUQgPSAzNzsgLy8gIEJyZWFrIGJlZm9yZSBvciBhZnRlcjsgZXhjZXB0IGluIHNvbWUgbnVtZXJpYyBjb250ZXh0XHJcbiAgICB2YXIgSkwgPSAzODsgLy8gIEZvcm0gS29yZWFuIHN5bGxhYmxlIGJsb2Nrc1xyXG4gICAgdmFyIEpWID0gMzk7IC8vICBGb3JtIEtvcmVhbiBzeWxsYWJsZSBibG9ja3NcclxuICAgIHZhciBKVCA9IDQwOyAvLyAgRm9ybSBLb3JlYW4gc3lsbGFibGUgYmxvY2tzXHJcbiAgICB2YXIgUkkgPSA0MTsgLy8gIEtlZXAgcGFpcnMgdG9nZXRoZXIuIEZvciBwYWlyczsgYnJlYWsgYmVmb3JlIGFuZCBhZnRlciBvdGhlciBjbGFzc2VzXHJcbiAgICB2YXIgU0EgPSA0MjsgLy8gIFByb3ZpZGUgYSBsaW5lIGJyZWFrIG9wcG9ydHVuaXR5IGNvbnRpbmdlbnQgb24gYWRkaXRpb25hbCwgbGFuZ3VhZ2Utc3BlY2lmaWMgY29udGV4dCBhbmFseXNpc1xyXG4gICAgdmFyIFhYID0gNDM7IC8vICBIYXZlIGFzIHlldCB1bmtub3duIGxpbmUgYnJlYWtpbmcgYmVoYXZpb3Igb3IgdW5hc3NpZ25lZCBjb2RlIHBvc2l0aW9uc1xyXG4gICAgdmFyIEJSRUFLX01BTkRBVE9SWSA9ICchJztcclxuICAgIHZhciBCUkVBS19OT1RfQUxMT1dFRCA9ICfDlyc7XHJcbiAgICB2YXIgQlJFQUtfQUxMT1dFRCA9ICfDtyc7XHJcbiAgICB2YXIgVW5pY29kZVRyaWUgPSBjcmVhdGVUcmllRnJvbUJhc2U2NChiYXNlNjQpO1xyXG4gICAgdmFyIEFMUEhBQkVUSUNTID0gW0FMLCBITF07XHJcbiAgICB2YXIgSEFSRF9MSU5FX0JSRUFLUyA9IFtCSywgQ1IsIExGLCBOTF07XHJcbiAgICB2YXIgU1BBQ0UgPSBbU1AsIFpXXTtcclxuICAgIHZhciBQUkVGSVhfUE9TVEZJWCA9IFtQUiwgUE9dO1xyXG4gICAgdmFyIExJTkVfQlJFQUtTID0gSEFSRF9MSU5FX0JSRUFLUy5jb25jYXQoU1BBQ0UpO1xyXG4gICAgdmFyIEtPUkVBTl9TWUxMQUJMRV9CTE9DSyA9IFtKTCwgSlYsIEpULCBIMiwgSDNdO1xyXG4gICAgdmFyIEhZUEhFTiA9IFtIWSwgQkFdO1xyXG4gICAgdmFyIGNvZGVQb2ludHNUb0NoYXJhY3RlckNsYXNzZXMgPSBmdW5jdGlvbiAoY29kZVBvaW50cywgbGluZUJyZWFrKSB7XHJcbiAgICAgICAgaWYgKGxpbmVCcmVhayA9PT0gdm9pZCAwKSB7IGxpbmVCcmVhayA9ICdzdHJpY3QnOyB9XHJcbiAgICAgICAgdmFyIHR5cGVzID0gW107XHJcbiAgICAgICAgdmFyIGluZGljaWVzID0gW107XHJcbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcclxuICAgICAgICBjb2RlUG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKGNvZGVQb2ludCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGNsYXNzVHlwZSA9IFVuaWNvZGVUcmllLmdldChjb2RlUG9pbnQpO1xyXG4gICAgICAgICAgICBpZiAoY2xhc3NUeXBlID4gTEVUVEVSX05VTUJFUl9NT0RJRklFUikge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllcy5wdXNoKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY2xhc3NUeXBlIC09IExFVFRFUl9OVU1CRVJfTU9ESUZJRVI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yaWVzLnB1c2goZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChbJ25vcm1hbCcsICdhdXRvJywgJ2xvb3NlJ10uaW5kZXhPZihsaW5lQnJlYWspICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gVSsyMDEwLCDigJMgVSsyMDEzLCDjgJwgVSszMDFDLCDjgqAgVSszMEEwXHJcbiAgICAgICAgICAgICAgICBpZiAoWzB4MjAxMCwgMHgyMDEzLCAweDMwMWMsIDB4MzBhMF0uaW5kZXhPZihjb2RlUG9pbnQpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGljaWVzLnB1c2goaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlcy5wdXNoKENCKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xhc3NUeXBlID09PSBDTSB8fCBjbGFzc1R5cGUgPT09IFpXSikge1xyXG4gICAgICAgICAgICAgICAgLy8gTEIxMCBUcmVhdCBhbnkgcmVtYWluaW5nIGNvbWJpbmluZyBtYXJrIG9yIFpXSiBhcyBBTC5cclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGljaWVzLnB1c2goaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlcy5wdXNoKEFMKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIExCOSBEbyBub3QgYnJlYWsgYSBjb21iaW5pbmcgY2hhcmFjdGVyIHNlcXVlbmNlOyB0cmVhdCBpdCBhcyBpZiBpdCBoYXMgdGhlIGxpbmUgYnJlYWtpbmcgY2xhc3Mgb2ZcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBiYXNlIGNoYXJhY3RlciBpbiBhbGwgb2YgdGhlIGZvbGxvd2luZyBydWxlcy4gVHJlYXQgWldKIGFzIGlmIGl0IHdlcmUgQ00uXHJcbiAgICAgICAgICAgICAgICB2YXIgcHJldiA9IHR5cGVzW2luZGV4IC0gMV07XHJcbiAgICAgICAgICAgICAgICBpZiAoTElORV9CUkVBS1MuaW5kZXhPZihwcmV2KSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRpY2llcy5wdXNoKGluZGljaWVzW2luZGV4IC0gMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlcy5wdXNoKHByZXYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW5kaWNpZXMucHVzaChpbmRleCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZXMucHVzaChBTCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5kaWNpZXMucHVzaChpbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChjbGFzc1R5cGUgPT09IENKKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZXMucHVzaChsaW5lQnJlYWsgPT09ICdzdHJpY3QnID8gTlMgOiBJRCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsYXNzVHlwZSA9PT0gU0EpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlcy5wdXNoKEFMKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xhc3NUeXBlID09PSBBSSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVzLnB1c2goQUwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEZvciBzdXBwbGVtZW50YXJ5IGNoYXJhY3RlcnMsIGEgdXNlZnVsIGRlZmF1bHQgaXMgdG8gdHJlYXQgY2hhcmFjdGVycyBpbiB0aGUgcmFuZ2UgMTAwMDAuLjFGRkZEIGFzIEFMXHJcbiAgICAgICAgICAgIC8vIGFuZCBjaGFyYWN0ZXJzIGluIHRoZSByYW5nZXMgMjAwMDAuLjJGRkZEIGFuZCAzMDAwMC4uM0ZGRkQgYXMgSUQsIHVudGlsIHRoZSBpbXBsZW1lbnRhdGlvbiBjYW4gYmUgcmV2aXNlZFxyXG4gICAgICAgICAgICAvLyB0byB0YWtlIGludG8gYWNjb3VudCB0aGUgYWN0dWFsIGxpbmUgYnJlYWtpbmcgcHJvcGVydGllcyBmb3IgdGhlc2UgY2hhcmFjdGVycy5cclxuICAgICAgICAgICAgaWYgKGNsYXNzVHlwZSA9PT0gWFgpIHtcclxuICAgICAgICAgICAgICAgIGlmICgoY29kZVBvaW50ID49IDB4MjAwMDAgJiYgY29kZVBvaW50IDw9IDB4MmZmZmQpIHx8IChjb2RlUG9pbnQgPj0gMHgzMDAwMCAmJiBjb2RlUG9pbnQgPD0gMHgzZmZmZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZXMucHVzaChJRCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZXMucHVzaChBTCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHlwZXMucHVzaChjbGFzc1R5cGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBbaW5kaWNpZXMsIHR5cGVzLCBjYXRlZ29yaWVzXTtcclxuICAgIH07XHJcbiAgICB2YXIgaXNBZGphY2VudFdpdGhTcGFjZUlnbm9yZWQgPSBmdW5jdGlvbiAoYSwgYiwgY3VycmVudEluZGV4LCBjbGFzc1R5cGVzKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBjbGFzc1R5cGVzW2N1cnJlbnRJbmRleF07XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYSkgPyBhLmluZGV4T2YoY3VycmVudCkgIT09IC0xIDogYSA9PT0gY3VycmVudCkge1xyXG4gICAgICAgICAgICB2YXIgaSA9IGN1cnJlbnRJbmRleDtcclxuICAgICAgICAgICAgd2hpbGUgKGkgPD0gY2xhc3NUeXBlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gY2xhc3NUeXBlc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChuZXh0ID09PSBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dCAhPT0gU1ApIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3VycmVudCA9PT0gU1ApIHtcclxuICAgICAgICAgICAgdmFyIGkgPSBjdXJyZW50SW5kZXg7XHJcbiAgICAgICAgICAgIHdoaWxlIChpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgdmFyIHByZXYgPSBjbGFzc1R5cGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYSkgPyBhLmluZGV4T2YocHJldikgIT09IC0xIDogYSA9PT0gcHJldikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuID0gY3VycmVudEluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChuIDw9IGNsYXNzVHlwZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG4rKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBjbGFzc1R5cGVzW25dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgIT09IFNQKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChwcmV2ICE9PSBTUCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICB2YXIgcHJldmlvdXNOb25TcGFjZUNsYXNzVHlwZSA9IGZ1bmN0aW9uIChjdXJyZW50SW5kZXgsIGNsYXNzVHlwZXMpIHtcclxuICAgICAgICB2YXIgaSA9IGN1cnJlbnRJbmRleDtcclxuICAgICAgICB3aGlsZSAoaSA+PSAwKSB7XHJcbiAgICAgICAgICAgIHZhciB0eXBlID0gY2xhc3NUeXBlc1tpXTtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFNQKSB7XHJcbiAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH07XHJcbiAgICB2YXIgX2xpbmVCcmVha0F0SW5kZXggPSBmdW5jdGlvbiAoY29kZVBvaW50cywgY2xhc3NUeXBlcywgaW5kaWNpZXMsIGluZGV4LCBmb3JiaWRkZW5CcmVha3MpIHtcclxuICAgICAgICBpZiAoaW5kaWNpZXNbaW5kZXhdID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IGluZGV4IC0gMTtcclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShmb3JiaWRkZW5CcmVha3MpICYmIGZvcmJpZGRlbkJyZWFrc1tjdXJyZW50SW5kZXhdID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGJlZm9yZUluZGV4ID0gY3VycmVudEluZGV4IC0gMTtcclxuICAgICAgICB2YXIgYWZ0ZXJJbmRleCA9IGN1cnJlbnRJbmRleCArIDE7XHJcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBjbGFzc1R5cGVzW2N1cnJlbnRJbmRleF07XHJcbiAgICAgICAgLy8gTEI0IEFsd2F5cyBicmVhayBhZnRlciBoYXJkIGxpbmUgYnJlYWtzLlxyXG4gICAgICAgIC8vIExCNSBUcmVhdCBDUiBmb2xsb3dlZCBieSBMRiwgYXMgd2VsbCBhcyBDUiwgTEYsIGFuZCBOTCBhcyBoYXJkIGxpbmUgYnJlYWtzLlxyXG4gICAgICAgIHZhciBiZWZvcmUgPSBiZWZvcmVJbmRleCA+PSAwID8gY2xhc3NUeXBlc1tiZWZvcmVJbmRleF0gOiAwO1xyXG4gICAgICAgIHZhciBuZXh0ID0gY2xhc3NUeXBlc1thZnRlckluZGV4XTtcclxuICAgICAgICBpZiAoY3VycmVudCA9PT0gQ1IgJiYgbmV4dCA9PT0gTEYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJSRUFLX05PVF9BTExPV0VEO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoSEFSRF9MSU5FX0JSRUFLUy5pbmRleE9mKGN1cnJlbnQpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTUFOREFUT1JZO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBMQjYgRG8gbm90IGJyZWFrIGJlZm9yZSBoYXJkIGxpbmUgYnJlYWtzLlxyXG4gICAgICAgIGlmIChIQVJEX0xJTkVfQlJFQUtTLmluZGV4T2YobmV4dCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEI3IERvIG5vdCBicmVhayBiZWZvcmUgc3BhY2VzIG9yIHplcm8gd2lkdGggc3BhY2UuXHJcbiAgICAgICAgaWYgKFNQQUNFLmluZGV4T2YobmV4dCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEI4IEJyZWFrIGJlZm9yZSBhbnkgY2hhcmFjdGVyIGZvbGxvd2luZyBhIHplcm8td2lkdGggc3BhY2UsIGV2ZW4gaWYgb25lIG9yIG1vcmUgc3BhY2VzIGludGVydmVuZS5cclxuICAgICAgICBpZiAocHJldmlvdXNOb25TcGFjZUNsYXNzVHlwZShjdXJyZW50SW5kZXgsIGNsYXNzVHlwZXMpID09PSBaVykge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEI4YSBEbyBub3QgYnJlYWsgYmV0d2VlbiBhIHplcm8gd2lkdGggam9pbmVyIGFuZCBhbiBpZGVvZ3JhcGgsIGVtb2ppIGJhc2Ugb3IgZW1vamkgbW9kaWZpZXIuXHJcbiAgICAgICAgaWYgKFVuaWNvZGVUcmllLmdldChjb2RlUG9pbnRzW2N1cnJlbnRJbmRleF0pID09PSBaV0ogJiYgKG5leHQgPT09IElEIHx8IG5leHQgPT09IEVCIHx8IG5leHQgPT09IEVNKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTk9UX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMTEgRG8gbm90IGJyZWFrIGJlZm9yZSBvciBhZnRlciBXb3JkIGpvaW5lciBhbmQgcmVsYXRlZCBjaGFyYWN0ZXJzLlxyXG4gICAgICAgIGlmIChjdXJyZW50ID09PSBXSiB8fCBuZXh0ID09PSBXSikge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTk9UX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMTIgRG8gbm90IGJyZWFrIGFmdGVyIE5CU1AgYW5kIHJlbGF0ZWQgY2hhcmFjdGVycy5cclxuICAgICAgICBpZiAoY3VycmVudCA9PT0gR0wpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJSRUFLX05PVF9BTExPV0VEO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBMQjEyYSBEbyBub3QgYnJlYWsgYmVmb3JlIE5CU1AgYW5kIHJlbGF0ZWQgY2hhcmFjdGVycywgZXhjZXB0IGFmdGVyIHNwYWNlcyBhbmQgaHlwaGVucy5cclxuICAgICAgICBpZiAoW1NQLCBCQSwgSFldLmluZGV4T2YoY3VycmVudCkgPT09IC0xICYmIG5leHQgPT09IEdMKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEIxMyBEbyBub3QgYnJlYWsgYmVmb3JlIOKAmF3igJkgb3Ig4oCYIeKAmSBvciDigJg74oCZIG9yIOKAmC/igJksIGV2ZW4gYWZ0ZXIgc3BhY2VzLlxyXG4gICAgICAgIGlmIChbQ0wsIENQLCBFWCwgSVMsIFNZXS5pbmRleE9mKG5leHQpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTk9UX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMTQgRG8gbm90IGJyZWFrIGFmdGVyIOKAmFvigJksIGV2ZW4gYWZ0ZXIgc3BhY2VzLlxyXG4gICAgICAgIGlmIChwcmV2aW91c05vblNwYWNlQ2xhc3NUeXBlKGN1cnJlbnRJbmRleCwgY2xhc3NUeXBlcykgPT09IE9QKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEIxNSBEbyBub3QgYnJlYWsgd2l0aGluIOKAmOKAnVvigJksIGV2ZW4gd2l0aCBpbnRlcnZlbmluZyBzcGFjZXMuXHJcbiAgICAgICAgaWYgKGlzQWRqYWNlbnRXaXRoU3BhY2VJZ25vcmVkKFFVLCBPUCwgY3VycmVudEluZGV4LCBjbGFzc1R5cGVzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTk9UX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMTYgRG8gbm90IGJyZWFrIGJldHdlZW4gY2xvc2luZyBwdW5jdHVhdGlvbiBhbmQgYSBub25zdGFydGVyIChsYj1OUyksIGV2ZW4gd2l0aCBpbnRlcnZlbmluZyBzcGFjZXMuXHJcbiAgICAgICAgaWYgKGlzQWRqYWNlbnRXaXRoU3BhY2VJZ25vcmVkKFtDTCwgQ1BdLCBOUywgY3VycmVudEluZGV4LCBjbGFzc1R5cGVzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTk9UX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMTcgRG8gbm90IGJyZWFrIHdpdGhpbiDigJjigJTigJTigJksIGV2ZW4gd2l0aCBpbnRlcnZlbmluZyBzcGFjZXMuXHJcbiAgICAgICAgaWYgKGlzQWRqYWNlbnRXaXRoU3BhY2VJZ25vcmVkKEIyLCBCMiwgY3VycmVudEluZGV4LCBjbGFzc1R5cGVzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTk9UX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMTggQnJlYWsgYWZ0ZXIgc3BhY2VzLlxyXG4gICAgICAgIGlmIChjdXJyZW50ID09PSBTUCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEIxOSBEbyBub3QgYnJlYWsgYmVmb3JlIG9yIGFmdGVyIHF1b3RhdGlvbiBtYXJrcywgc3VjaCBhcyDigJgg4oCdIOKAmS5cclxuICAgICAgICBpZiAoY3VycmVudCA9PT0gUVUgfHwgbmV4dCA9PT0gUVUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJSRUFLX05PVF9BTExPV0VEO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBMQjIwIEJyZWFrIGJlZm9yZSBhbmQgYWZ0ZXIgdW5yZXNvbHZlZCBDQi5cclxuICAgICAgICBpZiAobmV4dCA9PT0gQ0IgfHwgY3VycmVudCA9PT0gQ0IpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJSRUFLX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMjEgRG8gbm90IGJyZWFrIGJlZm9yZSBoeXBoZW4tbWludXMsIG90aGVyIGh5cGhlbnMsIGZpeGVkLXdpZHRoIHNwYWNlcywgc21hbGwga2FuYSwgYW5kIG90aGVyIG5vbi1zdGFydGVycywgb3IgYWZ0ZXIgYWN1dGUgYWNjZW50cy5cclxuICAgICAgICBpZiAoW0JBLCBIWSwgTlNdLmluZGV4T2YobmV4dCkgIT09IC0xIHx8IGN1cnJlbnQgPT09IEJCKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEIyMWEgRG9uJ3QgYnJlYWsgYWZ0ZXIgSGVicmV3ICsgSHlwaGVuLlxyXG4gICAgICAgIGlmIChiZWZvcmUgPT09IEhMICYmIEhZUEhFTi5pbmRleE9mKGN1cnJlbnQpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTk9UX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMjFiIERvbuKAmXQgYnJlYWsgYmV0d2VlbiBTb2xpZHVzIGFuZCBIZWJyZXcgbGV0dGVycy5cclxuICAgICAgICBpZiAoY3VycmVudCA9PT0gU1kgJiYgbmV4dCA9PT0gSEwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJSRUFLX05PVF9BTExPV0VEO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBMQjIyIERvIG5vdCBicmVhayBiZXR3ZWVuIHR3byBlbGxpcHNlcywgb3IgYmV0d2VlbiBsZXR0ZXJzLCBudW1iZXJzIG9yIGV4Y2xhbWF0aW9ucyBhbmQgZWxsaXBzaXMuXHJcbiAgICAgICAgaWYgKG5leHQgPT09IElOICYmIEFMUEhBQkVUSUNTLmNvbmNhdChJTiwgRVgsIE5VLCBJRCwgRUIsIEVNKS5pbmRleE9mKGN1cnJlbnQpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTk9UX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMjMgRG8gbm90IGJyZWFrIGJldHdlZW4gZGlnaXRzIGFuZCBsZXR0ZXJzLlxyXG4gICAgICAgIGlmICgoQUxQSEFCRVRJQ1MuaW5kZXhPZihuZXh0KSAhPT0gLTEgJiYgY3VycmVudCA9PT0gTlUpIHx8IChBTFBIQUJFVElDUy5pbmRleE9mKGN1cnJlbnQpICE9PSAtMSAmJiBuZXh0ID09PSBOVSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJSRUFLX05PVF9BTExPV0VEO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBMQjIzYSBEbyBub3QgYnJlYWsgYmV0d2VlbiBudW1lcmljIHByZWZpeGVzIGFuZCBpZGVvZ3JhcGhzLCBvciBiZXR3ZWVuIGlkZW9ncmFwaHMgYW5kIG51bWVyaWMgcG9zdGZpeGVzLlxyXG4gICAgICAgIGlmICgoY3VycmVudCA9PT0gUFIgJiYgW0lELCBFQiwgRU1dLmluZGV4T2YobmV4dCkgIT09IC0xKSB8fFxyXG4gICAgICAgICAgICAoW0lELCBFQiwgRU1dLmluZGV4T2YoY3VycmVudCkgIT09IC0xICYmIG5leHQgPT09IFBPKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTk9UX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMjQgRG8gbm90IGJyZWFrIGJldHdlZW4gbnVtZXJpYyBwcmVmaXgvcG9zdGZpeCBhbmQgbGV0dGVycywgb3IgYmV0d2VlbiBsZXR0ZXJzIGFuZCBwcmVmaXgvcG9zdGZpeC5cclxuICAgICAgICBpZiAoKEFMUEhBQkVUSUNTLmluZGV4T2YoY3VycmVudCkgIT09IC0xICYmIFBSRUZJWF9QT1NURklYLmluZGV4T2YobmV4dCkgIT09IC0xKSB8fFxyXG4gICAgICAgICAgICAoUFJFRklYX1BPU1RGSVguaW5kZXhPZihjdXJyZW50KSAhPT0gLTEgJiYgQUxQSEFCRVRJQ1MuaW5kZXhPZihuZXh0KSAhPT0gLTEpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEIyNSBEbyBub3QgYnJlYWsgYmV0d2VlbiB0aGUgZm9sbG93aW5nIHBhaXJzIG9mIGNsYXNzZXMgcmVsZXZhbnQgdG8gbnVtYmVyczpcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgLy8gKFBSIHwgUE8pIMOXICggT1AgfCBIWSApPyBOVVxyXG4gICAgICAgIChbUFIsIFBPXS5pbmRleE9mKGN1cnJlbnQpICE9PSAtMSAmJlxyXG4gICAgICAgICAgICAobmV4dCA9PT0gTlUgfHwgKFtPUCwgSFldLmluZGV4T2YobmV4dCkgIT09IC0xICYmIGNsYXNzVHlwZXNbYWZ0ZXJJbmRleCArIDFdID09PSBOVSkpKSB8fFxyXG4gICAgICAgICAgICAvLyAoIE9QIHwgSFkgKSDDlyBOVVxyXG4gICAgICAgICAgICAoW09QLCBIWV0uaW5kZXhPZihjdXJyZW50KSAhPT0gLTEgJiYgbmV4dCA9PT0gTlUpIHx8XHJcbiAgICAgICAgICAgIC8vIE5VIMOXXHQoTlUgfCBTWSB8IElTKVxyXG4gICAgICAgICAgICAoY3VycmVudCA9PT0gTlUgJiYgW05VLCBTWSwgSVNdLmluZGV4T2YobmV4dCkgIT09IC0xKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQlJFQUtfTk9UX0FMTE9XRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIE5VIChOVSB8IFNZIHwgSVMpKiDDlyAoTlUgfCBTWSB8IElTIHwgQ0wgfCBDUClcclxuICAgICAgICBpZiAoW05VLCBTWSwgSVMsIENMLCBDUF0uaW5kZXhPZihuZXh0KSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHByZXZJbmRleCA9IGN1cnJlbnRJbmRleDtcclxuICAgICAgICAgICAgd2hpbGUgKHByZXZJbmRleCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IGNsYXNzVHlwZXNbcHJldkluZGV4XTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSBOVSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFtTWSwgSVNdLmluZGV4T2YodHlwZSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkluZGV4LS07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBOVSAoTlUgfCBTWSB8IElTKSogKENMIHwgQ1ApPyDDlyAoUE8gfCBQUikpXHJcbiAgICAgICAgaWYgKFtQUiwgUE9dLmluZGV4T2YobmV4dCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBwcmV2SW5kZXggPSBbQ0wsIENQXS5pbmRleE9mKGN1cnJlbnQpICE9PSAtMSA/IGJlZm9yZUluZGV4IDogY3VycmVudEluZGV4O1xyXG4gICAgICAgICAgICB3aGlsZSAocHJldkluZGV4ID49IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gY2xhc3NUeXBlc1twcmV2SW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09IE5VKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLX05PVF9BTExPV0VEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoW1NZLCBJU10uaW5kZXhPZih0eXBlKSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2SW5kZXgtLTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIExCMjYgRG8gbm90IGJyZWFrIGEgS29yZWFuIHN5bGxhYmxlLlxyXG4gICAgICAgIGlmICgoSkwgPT09IGN1cnJlbnQgJiYgW0pMLCBKViwgSDIsIEgzXS5pbmRleE9mKG5leHQpICE9PSAtMSkgfHxcclxuICAgICAgICAgICAgKFtKViwgSDJdLmluZGV4T2YoY3VycmVudCkgIT09IC0xICYmIFtKViwgSlRdLmluZGV4T2YobmV4dCkgIT09IC0xKSB8fFxyXG4gICAgICAgICAgICAoW0pULCBIM10uaW5kZXhPZihjdXJyZW50KSAhPT0gLTEgJiYgbmV4dCA9PT0gSlQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEIyNyBUcmVhdCBhIEtvcmVhbiBTeWxsYWJsZSBCbG9jayB0aGUgc2FtZSBhcyBJRC5cclxuICAgICAgICBpZiAoKEtPUkVBTl9TWUxMQUJMRV9CTE9DSy5pbmRleE9mKGN1cnJlbnQpICE9PSAtMSAmJiBbSU4sIFBPXS5pbmRleE9mKG5leHQpICE9PSAtMSkgfHxcclxuICAgICAgICAgICAgKEtPUkVBTl9TWUxMQUJMRV9CTE9DSy5pbmRleE9mKG5leHQpICE9PSAtMSAmJiBjdXJyZW50ID09PSBQUikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJSRUFLX05PVF9BTExPV0VEO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBMQjI4IERvIG5vdCBicmVhayBiZXR3ZWVuIGFscGhhYmV0aWNzICjigJxhdOKAnSkuXHJcbiAgICAgICAgaWYgKEFMUEhBQkVUSUNTLmluZGV4T2YoY3VycmVudCkgIT09IC0xICYmIEFMUEhBQkVUSUNTLmluZGV4T2YobmV4dCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEIyOSBEbyBub3QgYnJlYWsgYmV0d2VlbiBudW1lcmljIHB1bmN0dWF0aW9uIGFuZCBhbHBoYWJldGljcyAo4oCcZS5nLuKAnSkuXHJcbiAgICAgICAgaWYgKGN1cnJlbnQgPT09IElTICYmIEFMUEhBQkVUSUNTLmluZGV4T2YobmV4dCkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTEIzMCBEbyBub3QgYnJlYWsgYmV0d2VlbiBsZXR0ZXJzLCBudW1iZXJzLCBvciBvcmRpbmFyeSBzeW1ib2xzIGFuZCBvcGVuaW5nIG9yIGNsb3NpbmcgcGFyZW50aGVzZXMuXHJcbiAgICAgICAgaWYgKChBTFBIQUJFVElDUy5jb25jYXQoTlUpLmluZGV4T2YoY3VycmVudCkgIT09IC0xICYmIG5leHQgPT09IE9QKSB8fFxyXG4gICAgICAgICAgICAoQUxQSEFCRVRJQ1MuY29uY2F0KE5VKS5pbmRleE9mKG5leHQpICE9PSAtMSAmJiBjdXJyZW50ID09PSBDUCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJSRUFLX05PVF9BTExPV0VEO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBMQjMwYSBCcmVhayBiZXR3ZWVuIHR3byByZWdpb25hbCBpbmRpY2F0b3Igc3ltYm9scyBpZiBhbmQgb25seSBpZiB0aGVyZSBhcmUgYW4gZXZlbiBudW1iZXIgb2YgcmVnaW9uYWxcclxuICAgICAgICAvLyBpbmRpY2F0b3JzIHByZWNlZGluZyB0aGUgcG9zaXRpb24gb2YgdGhlIGJyZWFrLlxyXG4gICAgICAgIGlmIChjdXJyZW50ID09PSBSSSAmJiBuZXh0ID09PSBSSSkge1xyXG4gICAgICAgICAgICB2YXIgaSA9IGluZGljaWVzW2N1cnJlbnRJbmRleF07XHJcbiAgICAgICAgICAgIHZhciBjb3VudCA9IDE7XHJcbiAgICAgICAgICAgIHdoaWxlIChpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzVHlwZXNbaV0gPT09IFJJKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb3VudCAlIDIgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBMQjMwYiBEbyBub3QgYnJlYWsgYmV0d2VlbiBhbiBlbW9qaSBiYXNlIGFuZCBhbiBlbW9qaSBtb2RpZmllci5cclxuICAgICAgICBpZiAoY3VycmVudCA9PT0gRUIgJiYgbmV4dCA9PT0gRU0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJSRUFLX05PVF9BTExPV0VEO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gQlJFQUtfQUxMT1dFRDtcclxuICAgIH07XHJcbiAgICB2YXIgY3NzRm9ybWF0dGVkQ2xhc3NlcyA9IGZ1bmN0aW9uIChjb2RlUG9pbnRzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7IGxpbmVCcmVhazogJ25vcm1hbCcsIHdvcmRCcmVhazogJ25vcm1hbCcgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIF9hID0gY29kZVBvaW50c1RvQ2hhcmFjdGVyQ2xhc3Nlcyhjb2RlUG9pbnRzLCBvcHRpb25zLmxpbmVCcmVhayksIGluZGljaWVzID0gX2FbMF0sIGNsYXNzVHlwZXMgPSBfYVsxXSwgaXNMZXR0ZXJOdW1iZXIgPSBfYVsyXTtcclxuICAgICAgICBpZiAob3B0aW9ucy53b3JkQnJlYWsgPT09ICdicmVhay1hbGwnIHx8IG9wdGlvbnMud29yZEJyZWFrID09PSAnYnJlYWstd29yZCcpIHtcclxuICAgICAgICAgICAgY2xhc3NUeXBlcyA9IGNsYXNzVHlwZXMubWFwKGZ1bmN0aW9uICh0eXBlKSB7IHJldHVybiAoW05VLCBBTCwgU0FdLmluZGV4T2YodHlwZSkgIT09IC0xID8gSUQgOiB0eXBlKTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBmb3JiaWRkZW5CcmVha3BvaW50cyA9IG9wdGlvbnMud29yZEJyZWFrID09PSAna2VlcC1hbGwnXHJcbiAgICAgICAgICAgID8gaXNMZXR0ZXJOdW1iZXIubWFwKGZ1bmN0aW9uIChsZXR0ZXJOdW1iZXIsIGkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJOdW1iZXIgJiYgY29kZVBvaW50c1tpXSA+PSAweDRlMDAgJiYgY29kZVBvaW50c1tpXSA8PSAweDlmZmY7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiBbaW5kaWNpZXMsIGNsYXNzVHlwZXMsIGZvcmJpZGRlbkJyZWFrcG9pbnRzXTtcclxuICAgIH07XHJcbiAgICB2YXIgQnJlYWsgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gQnJlYWsoY29kZVBvaW50cywgbGluZUJyZWFrLCBzdGFydCwgZW5kKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29kZVBvaW50cyA9IGNvZGVQb2ludHM7XHJcbiAgICAgICAgICAgIHRoaXMucmVxdWlyZWQgPSBsaW5lQnJlYWsgPT09IEJSRUFLX01BTkRBVE9SWTtcclxuICAgICAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xyXG4gICAgICAgICAgICB0aGlzLmVuZCA9IGVuZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgQnJlYWsucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnJvbUNvZGVQb2ludC5hcHBseSh2b2lkIDAsIHRoaXMuY29kZVBvaW50cy5zbGljZSh0aGlzLnN0YXJ0LCB0aGlzLmVuZCkpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIEJyZWFrO1xyXG4gICAgfSgpKTtcclxuICAgIHZhciBMaW5lQnJlYWtlciA9IGZ1bmN0aW9uIChzdHIsIG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgY29kZVBvaW50cyA9IHRvQ29kZVBvaW50cyhzdHIpO1xyXG4gICAgICAgIHZhciBfYSA9IGNzc0Zvcm1hdHRlZENsYXNzZXMoY29kZVBvaW50cywgb3B0aW9ucyksIGluZGljaWVzID0gX2FbMF0sIGNsYXNzVHlwZXMgPSBfYVsxXSwgZm9yYmlkZGVuQnJlYWtwb2ludHMgPSBfYVsyXTtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gY29kZVBvaW50cy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIGxhc3RFbmQgPSAwO1xyXG4gICAgICAgIHZhciBuZXh0SW5kZXggPSAwO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChuZXh0SW5kZXggPj0gbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSwgdmFsdWU6IG51bGwgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBsaW5lQnJlYWsgPSBCUkVBS19OT1RfQUxMT1dFRDtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0SW5kZXggPCBsZW5ndGggJiZcclxuICAgICAgICAgICAgICAgICAgICAobGluZUJyZWFrID0gX2xpbmVCcmVha0F0SW5kZXgoY29kZVBvaW50cywgY2xhc3NUeXBlcywgaW5kaWNpZXMsICsrbmV4dEluZGV4LCBmb3JiaWRkZW5CcmVha3BvaW50cykpID09PVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBCUkVBS19OT1RfQUxMT1dFRCkgeyB9XHJcbiAgICAgICAgICAgICAgICBpZiAobGluZUJyZWFrICE9PSBCUkVBS19OT1RfQUxMT1dFRCB8fCBuZXh0SW5kZXggPT09IGxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IG5ldyBCcmVhayhjb2RlUG9pbnRzLCBsaW5lQnJlYWssIGxhc3RFbmQsIG5leHRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdEVuZCA9IG5leHRJbmRleDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyBkb25lOiB0cnVlLCB2YWx1ZTogbnVsbCB9O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9O1xuXG4gICAgLy8gaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy1zeW50YXgtM1xyXG4gICAgdmFyIFRva2VuVHlwZTtcclxuICAgIChmdW5jdGlvbiAoVG9rZW5UeXBlKSB7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlNUUklOR19UT0tFTlwiXSA9IDBdID0gXCJTVFJJTkdfVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiQkFEX1NUUklOR19UT0tFTlwiXSA9IDFdID0gXCJCQURfU1RSSU5HX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkxFRlRfUEFSRU5USEVTSVNfVE9LRU5cIl0gPSAyXSA9IFwiTEVGVF9QQVJFTlRIRVNJU19UT0tFTlwiO1xyXG4gICAgICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJSSUdIVF9QQVJFTlRIRVNJU19UT0tFTlwiXSA9IDNdID0gXCJSSUdIVF9QQVJFTlRIRVNJU19UT0tFTlwiO1xyXG4gICAgICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJDT01NQV9UT0tFTlwiXSA9IDRdID0gXCJDT01NQV9UT0tFTlwiO1xyXG4gICAgICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJIQVNIX1RPS0VOXCJdID0gNV0gPSBcIkhBU0hfVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiREVMSU1fVE9LRU5cIl0gPSA2XSA9IFwiREVMSU1fVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiQVRfS0VZV09SRF9UT0tFTlwiXSA9IDddID0gXCJBVF9LRVlXT1JEX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlBSRUZJWF9NQVRDSF9UT0tFTlwiXSA9IDhdID0gXCJQUkVGSVhfTUFUQ0hfVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiREFTSF9NQVRDSF9UT0tFTlwiXSA9IDldID0gXCJEQVNIX01BVENIX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIklOQ0xVREVfTUFUQ0hfVE9LRU5cIl0gPSAxMF0gPSBcIklOQ0xVREVfTUFUQ0hfVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiTEVGVF9DVVJMWV9CUkFDS0VUX1RPS0VOXCJdID0gMTFdID0gXCJMRUZUX0NVUkxZX0JSQUNLRVRfVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiUklHSFRfQ1VSTFlfQlJBQ0tFVF9UT0tFTlwiXSA9IDEyXSA9IFwiUklHSFRfQ1VSTFlfQlJBQ0tFVF9UT0tFTlwiO1xyXG4gICAgICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJTVUZGSVhfTUFUQ0hfVE9LRU5cIl0gPSAxM10gPSBcIlNVRkZJWF9NQVRDSF9UT0tFTlwiO1xyXG4gICAgICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJTVUJTVFJJTkdfTUFUQ0hfVE9LRU5cIl0gPSAxNF0gPSBcIlNVQlNUUklOR19NQVRDSF9UT0tFTlwiO1xyXG4gICAgICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJESU1FTlNJT05fVE9LRU5cIl0gPSAxNV0gPSBcIkRJTUVOU0lPTl9UT0tFTlwiO1xyXG4gICAgICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJQRVJDRU5UQUdFX1RPS0VOXCJdID0gMTZdID0gXCJQRVJDRU5UQUdFX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIk5VTUJFUl9UT0tFTlwiXSA9IDE3XSA9IFwiTlVNQkVSX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkZVTkNUSU9OXCJdID0gMThdID0gXCJGVU5DVElPTlwiO1xyXG4gICAgICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJGVU5DVElPTl9UT0tFTlwiXSA9IDE5XSA9IFwiRlVOQ1RJT05fVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiSURFTlRfVE9LRU5cIl0gPSAyMF0gPSBcIklERU5UX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkNPTFVNTl9UT0tFTlwiXSA9IDIxXSA9IFwiQ09MVU1OX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlVSTF9UT0tFTlwiXSA9IDIyXSA9IFwiVVJMX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkJBRF9VUkxfVE9LRU5cIl0gPSAyM10gPSBcIkJBRF9VUkxfVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiQ0RDX1RPS0VOXCJdID0gMjRdID0gXCJDRENfVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiQ0RPX1RPS0VOXCJdID0gMjVdID0gXCJDRE9fVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiQ09MT05fVE9LRU5cIl0gPSAyNl0gPSBcIkNPTE9OX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlNFTUlDT0xPTl9UT0tFTlwiXSA9IDI3XSA9IFwiU0VNSUNPTE9OX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkxFRlRfU1FVQVJFX0JSQUNLRVRfVE9LRU5cIl0gPSAyOF0gPSBcIkxFRlRfU1FVQVJFX0JSQUNLRVRfVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiUklHSFRfU1FVQVJFX0JSQUNLRVRfVE9LRU5cIl0gPSAyOV0gPSBcIlJJR0hUX1NRVUFSRV9CUkFDS0VUX1RPS0VOXCI7XHJcbiAgICAgICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlVOSUNPREVfUkFOR0VfVE9LRU5cIl0gPSAzMF0gPSBcIlVOSUNPREVfUkFOR0VfVE9LRU5cIjtcclxuICAgICAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiV0hJVEVTUEFDRV9UT0tFTlwiXSA9IDMxXSA9IFwiV0hJVEVTUEFDRV9UT0tFTlwiO1xyXG4gICAgICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJFT0ZfVE9LRU5cIl0gPSAzMl0gPSBcIkVPRl9UT0tFTlwiO1xyXG4gICAgfSkoVG9rZW5UeXBlIHx8IChUb2tlblR5cGUgPSB7fSkpO1xyXG4gICAgdmFyIEZMQUdfVU5SRVNUUklDVEVEID0gMSA8PCAwO1xyXG4gICAgdmFyIEZMQUdfSUQgPSAxIDw8IDE7XHJcbiAgICB2YXIgRkxBR19JTlRFR0VSID0gMSA8PCAyO1xyXG4gICAgdmFyIEZMQUdfTlVNQkVSID0gMSA8PCAzO1xyXG4gICAgdmFyIExJTkVfRkVFRCA9IDB4MDAwYTtcclxuICAgIHZhciBTT0xJRFVTID0gMHgwMDJmO1xyXG4gICAgdmFyIFJFVkVSU0VfU09MSURVUyA9IDB4MDA1YztcclxuICAgIHZhciBDSEFSQUNURVJfVEFCVUxBVElPTiA9IDB4MDAwOTtcclxuICAgIHZhciBTUEFDRSQxID0gMHgwMDIwO1xyXG4gICAgdmFyIFFVT1RBVElPTl9NQVJLID0gMHgwMDIyO1xyXG4gICAgdmFyIEVRVUFMU19TSUdOID0gMHgwMDNkO1xyXG4gICAgdmFyIE5VTUJFUl9TSUdOID0gMHgwMDIzO1xyXG4gICAgdmFyIERPTExBUl9TSUdOID0gMHgwMDI0O1xyXG4gICAgdmFyIFBFUkNFTlRBR0VfU0lHTiA9IDB4MDAyNTtcclxuICAgIHZhciBBUE9TVFJPUEhFID0gMHgwMDI3O1xyXG4gICAgdmFyIExFRlRfUEFSRU5USEVTSVMgPSAweDAwMjg7XHJcbiAgICB2YXIgUklHSFRfUEFSRU5USEVTSVMgPSAweDAwMjk7XHJcbiAgICB2YXIgTE9XX0xJTkUgPSAweDAwNWY7XHJcbiAgICB2YXIgSFlQSEVOX01JTlVTID0gMHgwMDJkO1xyXG4gICAgdmFyIEVYQ0xBTUFUSU9OX01BUksgPSAweDAwMjE7XHJcbiAgICB2YXIgTEVTU19USEFOX1NJR04gPSAweDAwM2M7XHJcbiAgICB2YXIgR1JFQVRFUl9USEFOX1NJR04gPSAweDAwM2U7XHJcbiAgICB2YXIgQ09NTUVSQ0lBTF9BVCA9IDB4MDA0MDtcclxuICAgIHZhciBMRUZUX1NRVUFSRV9CUkFDS0VUID0gMHgwMDViO1xyXG4gICAgdmFyIFJJR0hUX1NRVUFSRV9CUkFDS0VUID0gMHgwMDVkO1xyXG4gICAgdmFyIENJUkNVTUZMRVhfQUNDRU5UID0gMHgwMDNkO1xyXG4gICAgdmFyIExFRlRfQ1VSTFlfQlJBQ0tFVCA9IDB4MDA3YjtcclxuICAgIHZhciBRVUVTVElPTl9NQVJLID0gMHgwMDNmO1xyXG4gICAgdmFyIFJJR0hUX0NVUkxZX0JSQUNLRVQgPSAweDAwN2Q7XHJcbiAgICB2YXIgVkVSVElDQUxfTElORSA9IDB4MDA3YztcclxuICAgIHZhciBUSUxERSA9IDB4MDA3ZTtcclxuICAgIHZhciBDT05UUk9MID0gMHgwMDgwO1xyXG4gICAgdmFyIFJFUExBQ0VNRU5UX0NIQVJBQ1RFUiA9IDB4ZmZmZDtcclxuICAgIHZhciBBU1RFUklTSyA9IDB4MDAyYTtcclxuICAgIHZhciBQTFVTX1NJR04gPSAweDAwMmI7XHJcbiAgICB2YXIgQ09NTUEgPSAweDAwMmM7XHJcbiAgICB2YXIgQ09MT04gPSAweDAwM2E7XHJcbiAgICB2YXIgU0VNSUNPTE9OID0gMHgwMDNiO1xyXG4gICAgdmFyIEZVTExfU1RPUCA9IDB4MDAyZTtcclxuICAgIHZhciBOVUxMID0gMHgwMDAwO1xyXG4gICAgdmFyIEJBQ0tTUEFDRSA9IDB4MDAwODtcclxuICAgIHZhciBMSU5FX1RBQlVMQVRJT04gPSAweDAwMGI7XHJcbiAgICB2YXIgU0hJRlRfT1VUID0gMHgwMDBlO1xyXG4gICAgdmFyIElORk9STUFUSU9OX1NFUEFSQVRPUl9PTkUgPSAweDAwMWY7XHJcbiAgICB2YXIgREVMRVRFID0gMHgwMDdmO1xyXG4gICAgdmFyIEVPRiA9IC0xO1xyXG4gICAgdmFyIFpFUk8gPSAweDAwMzA7XHJcbiAgICB2YXIgYSA9IDB4MDA2MTtcclxuICAgIHZhciBlID0gMHgwMDY1O1xyXG4gICAgdmFyIGYgPSAweDAwNjY7XHJcbiAgICB2YXIgdSA9IDB4MDA3NTtcclxuICAgIHZhciB6ID0gMHgwMDdhO1xyXG4gICAgdmFyIEEgPSAweDAwNDE7XHJcbiAgICB2YXIgRSA9IDB4MDA0NTtcclxuICAgIHZhciBGID0gMHgwMDQ2O1xyXG4gICAgdmFyIFUgPSAweDAwNTU7XHJcbiAgICB2YXIgWiA9IDB4MDA1YTtcclxuICAgIHZhciBpc0RpZ2l0ID0gZnVuY3Rpb24gKGNvZGVQb2ludCkgeyByZXR1cm4gY29kZVBvaW50ID49IFpFUk8gJiYgY29kZVBvaW50IDw9IDB4MDAzOTsgfTtcclxuICAgIHZhciBpc1N1cnJvZ2F0ZUNvZGVQb2ludCA9IGZ1bmN0aW9uIChjb2RlUG9pbnQpIHsgcmV0dXJuIGNvZGVQb2ludCA+PSAweGQ4MDAgJiYgY29kZVBvaW50IDw9IDB4ZGZmZjsgfTtcclxuICAgIHZhciBpc0hleCA9IGZ1bmN0aW9uIChjb2RlUG9pbnQpIHtcclxuICAgICAgICByZXR1cm4gaXNEaWdpdChjb2RlUG9pbnQpIHx8IChjb2RlUG9pbnQgPj0gQSAmJiBjb2RlUG9pbnQgPD0gRikgfHwgKGNvZGVQb2ludCA+PSBhICYmIGNvZGVQb2ludCA8PSBmKTtcclxuICAgIH07XHJcbiAgICB2YXIgaXNMb3dlckNhc2VMZXR0ZXIgPSBmdW5jdGlvbiAoY29kZVBvaW50KSB7IHJldHVybiBjb2RlUG9pbnQgPj0gYSAmJiBjb2RlUG9pbnQgPD0gejsgfTtcclxuICAgIHZhciBpc1VwcGVyQ2FzZUxldHRlciA9IGZ1bmN0aW9uIChjb2RlUG9pbnQpIHsgcmV0dXJuIGNvZGVQb2ludCA+PSBBICYmIGNvZGVQb2ludCA8PSBaOyB9O1xyXG4gICAgdmFyIGlzTGV0dGVyID0gZnVuY3Rpb24gKGNvZGVQb2ludCkgeyByZXR1cm4gaXNMb3dlckNhc2VMZXR0ZXIoY29kZVBvaW50KSB8fCBpc1VwcGVyQ2FzZUxldHRlcihjb2RlUG9pbnQpOyB9O1xyXG4gICAgdmFyIGlzTm9uQVNDSUlDb2RlUG9pbnQgPSBmdW5jdGlvbiAoY29kZVBvaW50KSB7IHJldHVybiBjb2RlUG9pbnQgPj0gQ09OVFJPTDsgfTtcclxuICAgIHZhciBpc1doaXRlU3BhY2UgPSBmdW5jdGlvbiAoY29kZVBvaW50KSB7XHJcbiAgICAgICAgcmV0dXJuIGNvZGVQb2ludCA9PT0gTElORV9GRUVEIHx8IGNvZGVQb2ludCA9PT0gQ0hBUkFDVEVSX1RBQlVMQVRJT04gfHwgY29kZVBvaW50ID09PSBTUEFDRSQxO1xyXG4gICAgfTtcclxuICAgIHZhciBpc05hbWVTdGFydENvZGVQb2ludCA9IGZ1bmN0aW9uIChjb2RlUG9pbnQpIHtcclxuICAgICAgICByZXR1cm4gaXNMZXR0ZXIoY29kZVBvaW50KSB8fCBpc05vbkFTQ0lJQ29kZVBvaW50KGNvZGVQb2ludCkgfHwgY29kZVBvaW50ID09PSBMT1dfTElORTtcclxuICAgIH07XHJcbiAgICB2YXIgaXNOYW1lQ29kZVBvaW50ID0gZnVuY3Rpb24gKGNvZGVQb2ludCkge1xyXG4gICAgICAgIHJldHVybiBpc05hbWVTdGFydENvZGVQb2ludChjb2RlUG9pbnQpIHx8IGlzRGlnaXQoY29kZVBvaW50KSB8fCBjb2RlUG9pbnQgPT09IEhZUEhFTl9NSU5VUztcclxuICAgIH07XHJcbiAgICB2YXIgaXNOb25QcmludGFibGVDb2RlUG9pbnQgPSBmdW5jdGlvbiAoY29kZVBvaW50KSB7XHJcbiAgICAgICAgcmV0dXJuICgoY29kZVBvaW50ID49IE5VTEwgJiYgY29kZVBvaW50IDw9IEJBQ0tTUEFDRSkgfHxcclxuICAgICAgICAgICAgY29kZVBvaW50ID09PSBMSU5FX1RBQlVMQVRJT04gfHxcclxuICAgICAgICAgICAgKGNvZGVQb2ludCA+PSBTSElGVF9PVVQgJiYgY29kZVBvaW50IDw9IElORk9STUFUSU9OX1NFUEFSQVRPUl9PTkUpIHx8XHJcbiAgICAgICAgICAgIGNvZGVQb2ludCA9PT0gREVMRVRFKTtcclxuICAgIH07XHJcbiAgICB2YXIgaXNWYWxpZEVzY2FwZSA9IGZ1bmN0aW9uIChjMSwgYzIpIHtcclxuICAgICAgICBpZiAoYzEgIT09IFJFVkVSU0VfU09MSURVUykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjMiAhPT0gTElORV9GRUVEO1xyXG4gICAgfTtcclxuICAgIHZhciBpc0lkZW50aWZpZXJTdGFydCA9IGZ1bmN0aW9uIChjMSwgYzIsIGMzKSB7XHJcbiAgICAgICAgaWYgKGMxID09PSBIWVBIRU5fTUlOVVMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlzTmFtZVN0YXJ0Q29kZVBvaW50KGMyKSB8fCBpc1ZhbGlkRXNjYXBlKGMyLCBjMyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzTmFtZVN0YXJ0Q29kZVBvaW50KGMxKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYzEgPT09IFJFVkVSU0VfU09MSURVUyAmJiBpc1ZhbGlkRXNjYXBlKGMxLCBjMikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICB2YXIgaXNOdW1iZXJTdGFydCA9IGZ1bmN0aW9uIChjMSwgYzIsIGMzKSB7XHJcbiAgICAgICAgaWYgKGMxID09PSBQTFVTX1NJR04gfHwgYzEgPT09IEhZUEhFTl9NSU5VUykge1xyXG4gICAgICAgICAgICBpZiAoaXNEaWdpdChjMikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBjMiA9PT0gRlVMTF9TVE9QICYmIGlzRGlnaXQoYzMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYzEgPT09IEZVTExfU1RPUCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXNEaWdpdChjMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpc0RpZ2l0KGMxKTtcclxuICAgIH07XHJcbiAgICB2YXIgc3RyaW5nVG9OdW1iZXIgPSBmdW5jdGlvbiAoY29kZVBvaW50cykge1xyXG4gICAgICAgIHZhciBjID0gMDtcclxuICAgICAgICB2YXIgc2lnbiA9IDE7XHJcbiAgICAgICAgaWYgKGNvZGVQb2ludHNbY10gPT09IFBMVVNfU0lHTiB8fCBjb2RlUG9pbnRzW2NdID09PSBIWVBIRU5fTUlOVVMpIHtcclxuICAgICAgICAgICAgaWYgKGNvZGVQb2ludHNbY10gPT09IEhZUEhFTl9NSU5VUykge1xyXG4gICAgICAgICAgICAgICAgc2lnbiA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGludGVnZXJzID0gW107XHJcbiAgICAgICAgd2hpbGUgKGlzRGlnaXQoY29kZVBvaW50c1tjXSkpIHtcclxuICAgICAgICAgICAgaW50ZWdlcnMucHVzaChjb2RlUG9pbnRzW2MrK10pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaW50ID0gaW50ZWdlcnMubGVuZ3RoID8gcGFyc2VJbnQoZnJvbUNvZGVQb2ludC5hcHBseSh2b2lkIDAsIGludGVnZXJzKSwgMTApIDogMDtcclxuICAgICAgICBpZiAoY29kZVBvaW50c1tjXSA9PT0gRlVMTF9TVE9QKSB7XHJcbiAgICAgICAgICAgIGMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZyYWN0aW9uID0gW107XHJcbiAgICAgICAgd2hpbGUgKGlzRGlnaXQoY29kZVBvaW50c1tjXSkpIHtcclxuICAgICAgICAgICAgZnJhY3Rpb24ucHVzaChjb2RlUG9pbnRzW2MrK10pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZnJhY2QgPSBmcmFjdGlvbi5sZW5ndGg7XHJcbiAgICAgICAgdmFyIGZyYWMgPSBmcmFjZCA/IHBhcnNlSW50KGZyb21Db2RlUG9pbnQuYXBwbHkodm9pZCAwLCBmcmFjdGlvbiksIDEwKSA6IDA7XHJcbiAgICAgICAgaWYgKGNvZGVQb2ludHNbY10gPT09IEUgfHwgY29kZVBvaW50c1tjXSA9PT0gZSkge1xyXG4gICAgICAgICAgICBjKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBleHBzaWduID0gMTtcclxuICAgICAgICBpZiAoY29kZVBvaW50c1tjXSA9PT0gUExVU19TSUdOIHx8IGNvZGVQb2ludHNbY10gPT09IEhZUEhFTl9NSU5VUykge1xyXG4gICAgICAgICAgICBpZiAoY29kZVBvaW50c1tjXSA9PT0gSFlQSEVOX01JTlVTKSB7XHJcbiAgICAgICAgICAgICAgICBleHBzaWduID0gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZXhwb25lbnQgPSBbXTtcclxuICAgICAgICB3aGlsZSAoaXNEaWdpdChjb2RlUG9pbnRzW2NdKSkge1xyXG4gICAgICAgICAgICBleHBvbmVudC5wdXNoKGNvZGVQb2ludHNbYysrXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBleHAgPSBleHBvbmVudC5sZW5ndGggPyBwYXJzZUludChmcm9tQ29kZVBvaW50LmFwcGx5KHZvaWQgMCwgZXhwb25lbnQpLCAxMCkgOiAwO1xyXG4gICAgICAgIHJldHVybiBzaWduICogKGludCArIGZyYWMgKiBNYXRoLnBvdygxMCwgLWZyYWNkKSkgKiBNYXRoLnBvdygxMCwgZXhwc2lnbiAqIGV4cCk7XHJcbiAgICB9O1xyXG4gICAgdmFyIExFRlRfUEFSRU5USEVTSVNfVE9LRU4gPSB7XHJcbiAgICAgICAgdHlwZTogVG9rZW5UeXBlLkxFRlRfUEFSRU5USEVTSVNfVE9LRU5cclxuICAgIH07XHJcbiAgICB2YXIgUklHSFRfUEFSRU5USEVTSVNfVE9LRU4gPSB7XHJcbiAgICAgICAgdHlwZTogVG9rZW5UeXBlLlJJR0hUX1BBUkVOVEhFU0lTX1RPS0VOXHJcbiAgICB9O1xyXG4gICAgdmFyIENPTU1BX1RPS0VOID0geyB0eXBlOiBUb2tlblR5cGUuQ09NTUFfVE9LRU4gfTtcclxuICAgIHZhciBTVUZGSVhfTUFUQ0hfVE9LRU4gPSB7IHR5cGU6IFRva2VuVHlwZS5TVUZGSVhfTUFUQ0hfVE9LRU4gfTtcclxuICAgIHZhciBQUkVGSVhfTUFUQ0hfVE9LRU4gPSB7IHR5cGU6IFRva2VuVHlwZS5QUkVGSVhfTUFUQ0hfVE9LRU4gfTtcclxuICAgIHZhciBDT0xVTU5fVE9LRU4gPSB7IHR5cGU6IFRva2VuVHlwZS5DT0xVTU5fVE9LRU4gfTtcclxuICAgIHZhciBEQVNIX01BVENIX1RPS0VOID0geyB0eXBlOiBUb2tlblR5cGUuREFTSF9NQVRDSF9UT0tFTiB9O1xyXG4gICAgdmFyIElOQ0xVREVfTUFUQ0hfVE9LRU4gPSB7IHR5cGU6IFRva2VuVHlwZS5JTkNMVURFX01BVENIX1RPS0VOIH07XHJcbiAgICB2YXIgTEVGVF9DVVJMWV9CUkFDS0VUX1RPS0VOID0ge1xyXG4gICAgICAgIHR5cGU6IFRva2VuVHlwZS5MRUZUX0NVUkxZX0JSQUNLRVRfVE9LRU5cclxuICAgIH07XHJcbiAgICB2YXIgUklHSFRfQ1VSTFlfQlJBQ0tFVF9UT0tFTiA9IHtcclxuICAgICAgICB0eXBlOiBUb2tlblR5cGUuUklHSFRfQ1VSTFlfQlJBQ0tFVF9UT0tFTlxyXG4gICAgfTtcclxuICAgIHZhciBTVUJTVFJJTkdfTUFUQ0hfVE9LRU4gPSB7IHR5cGU6IFRva2VuVHlwZS5TVUJTVFJJTkdfTUFUQ0hfVE9LRU4gfTtcclxuICAgIHZhciBCQURfVVJMX1RPS0VOID0geyB0eXBlOiBUb2tlblR5cGUuQkFEX1VSTF9UT0tFTiB9O1xyXG4gICAgdmFyIEJBRF9TVFJJTkdfVE9LRU4gPSB7IHR5cGU6IFRva2VuVHlwZS5CQURfU1RSSU5HX1RPS0VOIH07XHJcbiAgICB2YXIgQ0RPX1RPS0VOID0geyB0eXBlOiBUb2tlblR5cGUuQ0RPX1RPS0VOIH07XHJcbiAgICB2YXIgQ0RDX1RPS0VOID0geyB0eXBlOiBUb2tlblR5cGUuQ0RDX1RPS0VOIH07XHJcbiAgICB2YXIgQ09MT05fVE9LRU4gPSB7IHR5cGU6IFRva2VuVHlwZS5DT0xPTl9UT0tFTiB9O1xyXG4gICAgdmFyIFNFTUlDT0xPTl9UT0tFTiA9IHsgdHlwZTogVG9rZW5UeXBlLlNFTUlDT0xPTl9UT0tFTiB9O1xyXG4gICAgdmFyIExFRlRfU1FVQVJFX0JSQUNLRVRfVE9LRU4gPSB7XHJcbiAgICAgICAgdHlwZTogVG9rZW5UeXBlLkxFRlRfU1FVQVJFX0JSQUNLRVRfVE9LRU5cclxuICAgIH07XHJcbiAgICB2YXIgUklHSFRfU1FVQVJFX0JSQUNLRVRfVE9LRU4gPSB7XHJcbiAgICAgICAgdHlwZTogVG9rZW5UeXBlLlJJR0hUX1NRVUFSRV9CUkFDS0VUX1RPS0VOXHJcbiAgICB9O1xyXG4gICAgdmFyIFdISVRFU1BBQ0VfVE9LRU4gPSB7IHR5cGU6IFRva2VuVHlwZS5XSElURVNQQUNFX1RPS0VOIH07XHJcbiAgICB2YXIgRU9GX1RPS0VOID0geyB0eXBlOiBUb2tlblR5cGUuRU9GX1RPS0VOIH07XHJcbiAgICB2YXIgVG9rZW5pemVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIFRva2VuaXplcigpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgVG9rZW5pemVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChjaHVuaykge1xyXG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHRoaXMuX3ZhbHVlLmNvbmNhdCh0b0NvZGVQb2ludHMoY2h1bmspKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFRva2VuaXplci5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRva2VucyA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSB0aGlzLmNvbnN1bWVUb2tlbigpO1xyXG4gICAgICAgICAgICB3aGlsZSAodG9rZW4gIT09IEVPRl9UT0tFTikge1xyXG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLmNvbnN1bWVUb2tlbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnM7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBUb2tlbml6ZXIucHJvdG90eXBlLmNvbnN1bWVUb2tlbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGNvZGVQb2ludCA9IHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGNvZGVQb2ludCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBRVU9UQVRJT05fTUFSSzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdW1lU3RyaW5nVG9rZW4oUVVPVEFUSU9OX01BUkspO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBOVU1CRVJfU0lHTjpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYzEgPSB0aGlzLnBlZWtDb2RlUG9pbnQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGMyID0gdGhpcy5wZWVrQ29kZVBvaW50KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjMyA9IHRoaXMucGVla0NvZGVQb2ludCgyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOYW1lQ29kZVBvaW50KGMxKSB8fCBpc1ZhbGlkRXNjYXBlKGMyLCBjMykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZsYWdzID0gaXNJZGVudGlmaWVyU3RhcnQoYzEsIGMyLCBjMykgPyBGTEFHX0lEIDogRkxBR19VTlJFU1RSSUNURUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuY29uc3VtZU5hbWUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogVG9rZW5UeXBlLkhBU0hfVE9LRU4sIHZhbHVlOiB2YWx1ZSwgZmxhZ3M6IGZsYWdzIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBET0xMQVJfU0lHTjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wZWVrQ29kZVBvaW50KDApID09PSBFUVVBTFNfU0lHTikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNVRkZJWF9NQVRDSF9UT0tFTjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEFQT1NUUk9QSEU6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3VtZVN0cmluZ1Rva2VuKEFQT1NUUk9QSEUpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBMRUZUX1BBUkVOVEhFU0lTOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMRUZUX1BBUkVOVEhFU0lTX1RPS0VOO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBSSUdIVF9QQVJFTlRIRVNJUzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUklHSFRfUEFSRU5USEVTSVNfVE9LRU47XHJcbiAgICAgICAgICAgICAgICBjYXNlIEFTVEVSSVNLOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBlZWtDb2RlUG9pbnQoMCkgPT09IEVRVUFMU19TSUdOKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gU1VCU1RSSU5HX01BVENIX1RPS0VOO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgUExVU19TSUdOOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc051bWJlclN0YXJ0KGNvZGVQb2ludCwgdGhpcy5wZWVrQ29kZVBvaW50KDApLCB0aGlzLnBlZWtDb2RlUG9pbnQoMSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVjb25zdW1lQ29kZVBvaW50KGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWVOdW1lcmljVG9rZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIENPTU1BOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBDT01NQV9UT0tFTjtcclxuICAgICAgICAgICAgICAgIGNhc2UgSFlQSEVOX01JTlVTOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlMSA9IGNvZGVQb2ludDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZTIgPSB0aGlzLnBlZWtDb2RlUG9pbnQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGUzID0gdGhpcy5wZWVrQ29kZVBvaW50KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc051bWJlclN0YXJ0KGUxLCBlMiwgZTMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVjb25zdW1lQ29kZVBvaW50KGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWVOdW1lcmljVG9rZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSWRlbnRpZmllclN0YXJ0KGUxLCBlMiwgZTMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVjb25zdW1lQ29kZVBvaW50KGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWVJZGVudExpa2VUb2tlbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZTIgPT09IEhZUEhFTl9NSU5VUyAmJiBlMyA9PT0gR1JFQVRFUl9USEFOX1NJR04pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQ0RDX1RPS0VOO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgRlVMTF9TVE9QOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc051bWJlclN0YXJ0KGNvZGVQb2ludCwgdGhpcy5wZWVrQ29kZVBvaW50KDApLCB0aGlzLnBlZWtDb2RlUG9pbnQoMSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVjb25zdW1lQ29kZVBvaW50KGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWVOdW1lcmljVG9rZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNPTElEVVM6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGVla0NvZGVQb2ludCgwKSA9PT0gQVNURVJJU0spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGMgPT09IEFTVEVSSVNLKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYyA9IHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjID09PSBTT0xJRFVTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWVUb2tlbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjID09PSBFT0YpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdW1lVG9rZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgQ09MT046XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIENPTE9OX1RPS0VOO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBTRU1JQ09MT046XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNFTUlDT0xPTl9UT0tFTjtcclxuICAgICAgICAgICAgICAgIGNhc2UgTEVTU19USEFOX1NJR046XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGVla0NvZGVQb2ludCgwKSA9PT0gRVhDTEFNQVRJT05fTUFSSyAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBlZWtDb2RlUG9pbnQoMSkgPT09IEhZUEhFTl9NSU5VUyAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBlZWtDb2RlUG9pbnQoMikgPT09IEhZUEhFTl9NSU5VUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBDRE9fVE9LRU47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBDT01NRVJDSUFMX0FUOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhMSA9IHRoaXMucGVla0NvZGVQb2ludCgwKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYTIgPSB0aGlzLnBlZWtDb2RlUG9pbnQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGEzID0gdGhpcy5wZWVrQ29kZVBvaW50KDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0lkZW50aWZpZXJTdGFydChhMSwgYTIsIGEzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLmNvbnN1bWVOYW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IFRva2VuVHlwZS5BVF9LRVlXT1JEX1RPS0VOLCB2YWx1ZTogdmFsdWUgfTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExFRlRfU1FVQVJFX0JSQUNLRVQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExFRlRfU1FVQVJFX0JSQUNLRVRfVE9LRU47XHJcbiAgICAgICAgICAgICAgICBjYXNlIFJFVkVSU0VfU09MSURVUzpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNWYWxpZEVzY2FwZShjb2RlUG9pbnQsIHRoaXMucGVla0NvZGVQb2ludCgwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWNvbnN1bWVDb2RlUG9pbnQoY29kZVBvaW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3VtZUlkZW50TGlrZVRva2VuKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBSSUdIVF9TUVVBUkVfQlJBQ0tFVDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUklHSFRfU1FVQVJFX0JSQUNLRVRfVE9LRU47XHJcbiAgICAgICAgICAgICAgICBjYXNlIENJUkNVTUZMRVhfQUNDRU5UOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBlZWtDb2RlUG9pbnQoMCkgPT09IEVRVUFMU19TSUdOKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUFJFRklYX01BVENIX1RPS0VOO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTEVGVF9DVVJMWV9CUkFDS0VUOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMRUZUX0NVUkxZX0JSQUNLRVRfVE9LRU47XHJcbiAgICAgICAgICAgICAgICBjYXNlIFJJR0hUX0NVUkxZX0JSQUNLRVQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJJR0hUX0NVUkxZX0JSQUNLRVRfVE9LRU47XHJcbiAgICAgICAgICAgICAgICBjYXNlIHU6XHJcbiAgICAgICAgICAgICAgICBjYXNlIFU6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHUxID0gdGhpcy5wZWVrQ29kZVBvaW50KDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB1MiA9IHRoaXMucGVla0NvZGVQb2ludCgxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodTEgPT09IFBMVVNfU0lHTiAmJiAoaXNIZXgodTIpIHx8IHUyID09PSBRVUVTVElPTl9NQVJLKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lVW5pY29kZVJhbmdlVG9rZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWNvbnN1bWVDb2RlUG9pbnQoY29kZVBvaW50KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdW1lSWRlbnRMaWtlVG9rZW4oKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgVkVSVElDQUxfTElORTpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wZWVrQ29kZVBvaW50KDApID09PSBFUVVBTFNfU0lHTikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERBU0hfTUFUQ0hfVE9LRU47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBlZWtDb2RlUG9pbnQoMCkgPT09IFZFUlRJQ0FMX0xJTkUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBDT0xVTU5fVE9LRU47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBUSUxERTpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wZWVrQ29kZVBvaW50KDApID09PSBFUVVBTFNfU0lHTikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOQ0xVREVfTUFUQ0hfVE9LRU47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBFT0Y6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEVPRl9UT0tFTjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNXaGl0ZVNwYWNlKGNvZGVQb2ludCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZVdoaXRlU3BhY2UoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBXSElURVNQQUNFX1RPS0VOO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc0RpZ2l0KGNvZGVQb2ludCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVjb25zdW1lQ29kZVBvaW50KGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdW1lTnVtZXJpY1Rva2VuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzTmFtZVN0YXJ0Q29kZVBvaW50KGNvZGVQb2ludCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVjb25zdW1lQ29kZVBvaW50KGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdW1lSWRlbnRMaWtlVG9rZW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiBUb2tlblR5cGUuREVMSU1fVE9LRU4sIHZhbHVlOiBmcm9tQ29kZVBvaW50KGNvZGVQb2ludCkgfTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFRva2VuaXplci5wcm90b3R5cGUuY29uc3VtZUNvZGVQb2ludCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5fdmFsdWUuc2hpZnQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgPyAtMSA6IHZhbHVlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgVG9rZW5pemVyLnByb3RvdHlwZS5yZWNvbnN1bWVDb2RlUG9pbnQgPSBmdW5jdGlvbiAoY29kZVBvaW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlLnVuc2hpZnQoY29kZVBvaW50KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFRva2VuaXplci5wcm90b3R5cGUucGVla0NvZGVQb2ludCA9IGZ1bmN0aW9uIChkZWx0YSkge1xyXG4gICAgICAgICAgICBpZiAoZGVsdGEgPj0gdGhpcy5fdmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlW2RlbHRhXTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFRva2VuaXplci5wcm90b3R5cGUuY29uc3VtZVVuaWNvZGVSYW5nZVRva2VuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZGlnaXRzID0gW107XHJcbiAgICAgICAgICAgIHZhciBjb2RlUG9pbnQgPSB0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKTtcclxuICAgICAgICAgICAgd2hpbGUgKGlzSGV4KGNvZGVQb2ludCkgJiYgZGlnaXRzLmxlbmd0aCA8IDYpIHtcclxuICAgICAgICAgICAgICAgIGRpZ2l0cy5wdXNoKGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcXVlc3Rpb25NYXJrcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB3aGlsZSAoY29kZVBvaW50ID09PSBRVUVTVElPTl9NQVJLICYmIGRpZ2l0cy5sZW5ndGggPCA2KSB7XHJcbiAgICAgICAgICAgICAgICBkaWdpdHMucHVzaChjb2RlUG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICBxdWVzdGlvbk1hcmtzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocXVlc3Rpb25NYXJrcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0XzEgPSBwYXJzZUludChmcm9tQ29kZVBvaW50LmFwcGx5KHZvaWQgMCwgZGlnaXRzLm1hcChmdW5jdGlvbiAoZGlnaXQpIHsgcmV0dXJuIChkaWdpdCA9PT0gUVVFU1RJT05fTUFSSyA/IFpFUk8gOiBkaWdpdCk7IH0pKSwgMTYpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVuZCA9IHBhcnNlSW50KGZyb21Db2RlUG9pbnQuYXBwbHkodm9pZCAwLCBkaWdpdHMubWFwKGZ1bmN0aW9uIChkaWdpdCkgeyByZXR1cm4gKGRpZ2l0ID09PSBRVUVTVElPTl9NQVJLID8gRiA6IGRpZ2l0KTsgfSkpLCAxNik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyB0eXBlOiBUb2tlblR5cGUuVU5JQ09ERV9SQU5HRV9UT0tFTiwgc3RhcnQ6IHN0YXJ0XzEsIGVuZDogZW5kIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHN0YXJ0ID0gcGFyc2VJbnQoZnJvbUNvZGVQb2ludC5hcHBseSh2b2lkIDAsIGRpZ2l0cyksIDE2KTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGVla0NvZGVQb2ludCgwKSA9PT0gSFlQSEVOX01JTlVTICYmIGlzSGV4KHRoaXMucGVla0NvZGVQb2ludCgxKSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZW5kRGlnaXRzID0gW107XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaXNIZXgoY29kZVBvaW50KSAmJiBlbmREaWdpdHMubGVuZ3RoIDwgNikge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZERpZ2l0cy5wdXNoKGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgZW5kID0gcGFyc2VJbnQoZnJvbUNvZGVQb2ludC5hcHBseSh2b2lkIDAsIGVuZERpZ2l0cyksIDE2KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IFRva2VuVHlwZS5VTklDT0RFX1JBTkdFX1RPS0VOLCBzdGFydDogc3RhcnQsIGVuZDogZW5kIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyB0eXBlOiBUb2tlblR5cGUuVU5JQ09ERV9SQU5HRV9UT0tFTiwgc3RhcnQ6IHN0YXJ0LCBlbmQ6IHN0YXJ0IH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIFRva2VuaXplci5wcm90b3R5cGUuY29uc3VtZUlkZW50TGlrZVRva2VuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLmNvbnN1bWVOYW1lKCk7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAndXJsJyAmJiB0aGlzLnBlZWtDb2RlUG9pbnQoMCkgPT09IExFRlRfUEFSRU5USEVTSVMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3VtZVVybFRva2VuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5wZWVrQ29kZVBvaW50KDApID09PSBMRUZUX1BBUkVOVEhFU0lTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IFRva2VuVHlwZS5GVU5DVElPTl9UT0tFTiwgdmFsdWU6IHZhbHVlIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogVG9rZW5UeXBlLklERU5UX1RPS0VOLCB2YWx1ZTogdmFsdWUgfTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFRva2VuaXplci5wcm90b3R5cGUuY29uc3VtZVVybFRva2VuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5jb25zdW1lV2hpdGVTcGFjZSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wZWVrQ29kZVBvaW50KDApID09PSBFT0YpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IFRva2VuVHlwZS5VUkxfVE9LRU4sIHZhbHVlOiAnJyB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBuZXh0ID0gdGhpcy5wZWVrQ29kZVBvaW50KDApO1xyXG4gICAgICAgICAgICBpZiAobmV4dCA9PT0gQVBPU1RST1BIRSB8fCBuZXh0ID09PSBRVU9UQVRJT05fTUFSSykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0cmluZ1Rva2VuID0gdGhpcy5jb25zdW1lU3RyaW5nVG9rZW4odGhpcy5jb25zdW1lQ29kZVBvaW50KCkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0cmluZ1Rva2VuLnR5cGUgPT09IFRva2VuVHlwZS5TVFJJTkdfVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVXaGl0ZVNwYWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGVla0NvZGVQb2ludCgwKSA9PT0gRU9GIHx8IHRoaXMucGVla0NvZGVQb2ludCgwKSA9PT0gUklHSFRfUEFSRU5USEVTSVMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IFRva2VuVHlwZS5VUkxfVE9LRU4sIHZhbHVlOiBzdHJpbmdUb2tlbi52YWx1ZSB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZUJhZFVybFJlbW5hbnRzKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQkFEX1VSTF9UT0tFTjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvZGVQb2ludCA9IHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvZGVQb2ludCA9PT0gRU9GIHx8IGNvZGVQb2ludCA9PT0gUklHSFRfUEFSRU5USEVTSVMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB0eXBlOiBUb2tlblR5cGUuVVJMX1RPS0VOLCB2YWx1ZTogZnJvbUNvZGVQb2ludC5hcHBseSh2b2lkIDAsIHZhbHVlKSB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNXaGl0ZVNwYWNlKGNvZGVQb2ludCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVXaGl0ZVNwYWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGVla0NvZGVQb2ludCgwKSA9PT0gRU9GIHx8IHRoaXMucGVla0NvZGVQb2ludCgwKSA9PT0gUklHSFRfUEFSRU5USEVTSVMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IFRva2VuVHlwZS5VUkxfVE9LRU4sIHZhbHVlOiBmcm9tQ29kZVBvaW50LmFwcGx5KHZvaWQgMCwgdmFsdWUpIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZUJhZFVybFJlbW5hbnRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJBRF9VUkxfVE9LRU47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjb2RlUG9pbnQgPT09IFFVT1RBVElPTl9NQVJLIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgY29kZVBvaW50ID09PSBBUE9TVFJPUEhFIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgY29kZVBvaW50ID09PSBMRUZUX1BBUkVOVEhFU0lTIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgaXNOb25QcmludGFibGVDb2RlUG9pbnQoY29kZVBvaW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZUJhZFVybFJlbW5hbnRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJBRF9VUkxfVE9LRU47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjb2RlUG9pbnQgPT09IFJFVkVSU0VfU09MSURVUykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1ZhbGlkRXNjYXBlKGNvZGVQb2ludCwgdGhpcy5wZWVrQ29kZVBvaW50KDApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5wdXNoKHRoaXMuY29uc3VtZUVzY2FwZWRDb2RlUG9pbnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVCYWRVcmxSZW1uYW50cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQkFEX1VSTF9UT0tFTjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5wdXNoKGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIFRva2VuaXplci5wcm90b3R5cGUuY29uc3VtZVdoaXRlU3BhY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChpc1doaXRlU3BhY2UodGhpcy5wZWVrQ29kZVBvaW50KDApKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIFRva2VuaXplci5wcm90b3R5cGUuY29uc3VtZUJhZFVybFJlbW5hbnRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvZGVQb2ludCA9IHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvZGVQb2ludCA9PT0gUklHSFRfUEFSRU5USEVTSVMgfHwgY29kZVBvaW50ID09PSBFT0YpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNWYWxpZEVzY2FwZShjb2RlUG9pbnQsIHRoaXMucGVla0NvZGVQb2ludCgwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVFc2NhcGVkQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIFRva2VuaXplci5wcm90b3R5cGUuY29uc3VtZVN0cmluZ1NsaWNlID0gZnVuY3Rpb24gKGNvdW50KSB7XHJcbiAgICAgICAgICAgIHZhciBTTElDRV9TVEFDS19TSVpFID0gNjAwMDA7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICB3aGlsZSAoY291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYW1vdW50ID0gTWF0aC5taW4oU0xJQ0VfU1RBQ0tfU0laRSwgY291bnQpO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gZnJvbUNvZGVQb2ludC5hcHBseSh2b2lkIDAsIHRoaXMuX3ZhbHVlLnNwbGljZSgwLCBhbW91bnQpKTtcclxuICAgICAgICAgICAgICAgIGNvdW50IC09IGFtb3VudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl92YWx1ZS5zaGlmdCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBUb2tlbml6ZXIucHJvdG90eXBlLmNvbnN1bWVTdHJpbmdUb2tlbiA9IGZ1bmN0aW9uIChlbmRpbmdDb2RlUG9pbnQpIHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgIHZhciBpID0gMDtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvZGVQb2ludCA9IHRoaXMuX3ZhbHVlW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvZGVQb2ludCA9PT0gRU9GIHx8IGNvZGVQb2ludCA9PT0gdW5kZWZpbmVkIHx8IGNvZGVQb2ludCA9PT0gZW5kaW5nQ29kZVBvaW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgKz0gdGhpcy5jb25zdW1lU3RyaW5nU2xpY2UoaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogVG9rZW5UeXBlLlNUUklOR19UT0tFTiwgdmFsdWU6IHZhbHVlIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY29kZVBvaW50ID09PSBMSU5FX0ZFRUQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZS5zcGxpY2UoMCwgaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJBRF9TVFJJTkdfVE9LRU47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY29kZVBvaW50ID09PSBSRVZFUlNFX1NPTElEVVMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IHRoaXMuX3ZhbHVlW2kgKyAxXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCAhPT0gRU9GICYmIG5leHQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gTElORV9GRUVEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSB0aGlzLmNvbnN1bWVTdHJpbmdTbGljZShpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNWYWxpZEVzY2FwZShjb2RlUG9pbnQsIG5leHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSB0aGlzLmNvbnN1bWVTdHJpbmdTbGljZShpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlICs9IGZyb21Db2RlUG9pbnQodGhpcy5jb25zdW1lRXNjYXBlZENvZGVQb2ludCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgfSB3aGlsZSAodHJ1ZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBUb2tlbml6ZXIucHJvdG90eXBlLmNvbnN1bWVOdW1iZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciByZXByID0gW107XHJcbiAgICAgICAgICAgIHZhciB0eXBlID0gRkxBR19JTlRFR0VSO1xyXG4gICAgICAgICAgICB2YXIgYzEgPSB0aGlzLnBlZWtDb2RlUG9pbnQoMCk7XHJcbiAgICAgICAgICAgIGlmIChjMSA9PT0gUExVU19TSUdOIHx8IGMxID09PSBIWVBIRU5fTUlOVVMpIHtcclxuICAgICAgICAgICAgICAgIHJlcHIucHVzaCh0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2hpbGUgKGlzRGlnaXQodGhpcy5wZWVrQ29kZVBvaW50KDApKSkge1xyXG4gICAgICAgICAgICAgICAgcmVwci5wdXNoKHRoaXMuY29uc3VtZUNvZGVQb2ludCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjMSA9IHRoaXMucGVla0NvZGVQb2ludCgwKTtcclxuICAgICAgICAgICAgdmFyIGMyID0gdGhpcy5wZWVrQ29kZVBvaW50KDEpO1xyXG4gICAgICAgICAgICBpZiAoYzEgPT09IEZVTExfU1RPUCAmJiBpc0RpZ2l0KGMyKSkge1xyXG4gICAgICAgICAgICAgICAgcmVwci5wdXNoKHRoaXMuY29uc3VtZUNvZGVQb2ludCgpLCB0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKSk7XHJcbiAgICAgICAgICAgICAgICB0eXBlID0gRkxBR19OVU1CRVI7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaXNEaWdpdCh0aGlzLnBlZWtDb2RlUG9pbnQoMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVwci5wdXNoKHRoaXMuY29uc3VtZUNvZGVQb2ludCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjMSA9IHRoaXMucGVla0NvZGVQb2ludCgwKTtcclxuICAgICAgICAgICAgYzIgPSB0aGlzLnBlZWtDb2RlUG9pbnQoMSk7XHJcbiAgICAgICAgICAgIHZhciBjMyA9IHRoaXMucGVla0NvZGVQb2ludCgyKTtcclxuICAgICAgICAgICAgaWYgKChjMSA9PT0gRSB8fCBjMSA9PT0gZSkgJiYgKCgoYzIgPT09IFBMVVNfU0lHTiB8fCBjMiA9PT0gSFlQSEVOX01JTlVTKSAmJiBpc0RpZ2l0KGMzKSkgfHwgaXNEaWdpdChjMikpKSB7XHJcbiAgICAgICAgICAgICAgICByZXByLnB1c2godGhpcy5jb25zdW1lQ29kZVBvaW50KCksIHRoaXMuY29uc3VtZUNvZGVQb2ludCgpKTtcclxuICAgICAgICAgICAgICAgIHR5cGUgPSBGTEFHX05VTUJFUjtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpc0RpZ2l0KHRoaXMucGVla0NvZGVQb2ludCgwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXByLnB1c2godGhpcy5jb25zdW1lQ29kZVBvaW50KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBbc3RyaW5nVG9OdW1iZXIocmVwciksIHR5cGVdO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgVG9rZW5pemVyLnByb3RvdHlwZS5jb25zdW1lTnVtZXJpY1Rva2VuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgX2EgPSB0aGlzLmNvbnN1bWVOdW1iZXIoKSwgbnVtYmVyID0gX2FbMF0sIGZsYWdzID0gX2FbMV07XHJcbiAgICAgICAgICAgIHZhciBjMSA9IHRoaXMucGVla0NvZGVQb2ludCgwKTtcclxuICAgICAgICAgICAgdmFyIGMyID0gdGhpcy5wZWVrQ29kZVBvaW50KDEpO1xyXG4gICAgICAgICAgICB2YXIgYzMgPSB0aGlzLnBlZWtDb2RlUG9pbnQoMik7XHJcbiAgICAgICAgICAgIGlmIChpc0lkZW50aWZpZXJTdGFydChjMSwgYzIsIGMzKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHVuaXQgPSB0aGlzLmNvbnN1bWVOYW1lKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyB0eXBlOiBUb2tlblR5cGUuRElNRU5TSU9OX1RPS0VOLCBudW1iZXI6IG51bWJlciwgZmxhZ3M6IGZsYWdzLCB1bml0OiB1bml0IH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGMxID09PSBQRVJDRU5UQUdFX1NJR04pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogVG9rZW5UeXBlLlBFUkNFTlRBR0VfVE9LRU4sIG51bWJlcjogbnVtYmVyLCBmbGFnczogZmxhZ3MgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiBUb2tlblR5cGUuTlVNQkVSX1RPS0VOLCBudW1iZXI6IG51bWJlciwgZmxhZ3M6IGZsYWdzIH07XHJcbiAgICAgICAgfTtcclxuICAgICAgICBUb2tlbml6ZXIucHJvdG90eXBlLmNvbnN1bWVFc2NhcGVkQ29kZVBvaW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgY29kZVBvaW50ID0gdGhpcy5jb25zdW1lQ29kZVBvaW50KCk7XHJcbiAgICAgICAgICAgIGlmIChpc0hleChjb2RlUG9pbnQpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGV4ID0gZnJvbUNvZGVQb2ludChjb2RlUG9pbnQpO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGlzSGV4KHRoaXMucGVla0NvZGVQb2ludCgwKSkgJiYgaGV4Lmxlbmd0aCA8IDYpIHtcclxuICAgICAgICAgICAgICAgICAgICBoZXggKz0gZnJvbUNvZGVQb2ludCh0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNXaGl0ZVNwYWNlKHRoaXMucGVla0NvZGVQb2ludCgwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN1bWVDb2RlUG9pbnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBoZXhDb2RlUG9pbnQgPSBwYXJzZUludChoZXgsIDE2KTtcclxuICAgICAgICAgICAgICAgIGlmIChoZXhDb2RlUG9pbnQgPT09IDAgfHwgaXNTdXJyb2dhdGVDb2RlUG9pbnQoaGV4Q29kZVBvaW50KSB8fCBoZXhDb2RlUG9pbnQgPiAweDEwZmZmZikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBSRVBMQUNFTUVOVF9DSEFSQUNURVI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaGV4Q29kZVBvaW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2RlUG9pbnQgPT09IEVPRikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFJFUExBQ0VNRU5UX0NIQVJBQ1RFUjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY29kZVBvaW50O1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgVG9rZW5pemVyLnByb3RvdHlwZS5jb25zdW1lTmFtZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvZGVQb2ludCA9IHRoaXMuY29uc3VtZUNvZGVQb2ludCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFtZUNvZGVQb2ludChjb2RlUG9pbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IGZyb21Db2RlUG9pbnQoY29kZVBvaW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzVmFsaWRFc2NhcGUoY29kZVBvaW50LCB0aGlzLnBlZWtDb2RlUG9pbnQoMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IGZyb21Db2RlUG9pbnQodGhpcy5jb25zdW1lRXNjYXBlZENvZGVQb2ludCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVjb25zdW1lQ29kZVBvaW50KGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIFRva2VuaXplcjtcclxuICAgIH0oKSk7XG5cbiAgICB2YXIgUGFyc2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIFBhcnNlcih0b2tlbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5zID0gdG9rZW5zO1xyXG4gICAgICAgIH1cclxuICAgICAgICBQYXJzZXIuY3JlYXRlID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHZhciB0b2tlbml6ZXIgPSBuZXcgVG9rZW5pemVyKCk7XHJcbiAgICAgICAgICAgIHRva2VuaXplci53cml0ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUGFyc2VyKHRva2VuaXplci5yZWFkKCkpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgUGFyc2VyLnBhcnNlVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFBhcnNlci5jcmVhdGUodmFsdWUpLnBhcnNlQ29tcG9uZW50VmFsdWUoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFBhcnNlci5wYXJzZVZhbHVlcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gUGFyc2VyLmNyZWF0ZSh2YWx1ZSkucGFyc2VDb21wb25lbnRWYWx1ZXMoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFBhcnNlci5wcm90b3R5cGUucGFyc2VDb21wb25lbnRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRva2VuID0gdGhpcy5jb25zdW1lVG9rZW4oKTtcclxuICAgICAgICAgICAgd2hpbGUgKHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5XSElURVNQQUNFX1RPS0VOKSB7XHJcbiAgICAgICAgICAgICAgICB0b2tlbiA9IHRoaXMuY29uc3VtZVRva2VuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5FT0ZfVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIkVycm9yIHBhcnNpbmcgQ1NTIGNvbXBvbmVudCB2YWx1ZSwgdW5leHBlY3RlZCBFT0ZcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5yZWNvbnN1bWVUb2tlbih0b2tlbik7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuY29uc3VtZUNvbXBvbmVudFZhbHVlKCk7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIHRva2VuID0gdGhpcy5jb25zdW1lVG9rZW4oKTtcclxuICAgICAgICAgICAgfSB3aGlsZSAodG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLldISVRFU1BBQ0VfVE9LRU4pO1xyXG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkVPRl9UT0tFTikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcIkVycm9yIHBhcnNpbmcgQ1NTIGNvbXBvbmVudCB2YWx1ZSwgbXVsdGlwbGUgdmFsdWVzIGZvdW5kIHdoZW4gZXhwZWN0aW5nIG9ubHkgb25lXCIpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgUGFyc2VyLnByb3RvdHlwZS5wYXJzZUNvbXBvbmVudFZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IFtdO1xyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5jb25zdW1lQ29tcG9uZW50VmFsdWUoKTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS50eXBlID09PSBUb2tlblR5cGUuRU9GX1RPS0VOKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIFBhcnNlci5wcm90b3R5cGUuY29uc3VtZUNvbXBvbmVudFZhbHVlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSB0aGlzLmNvbnN1bWVUb2tlbigpO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgVG9rZW5UeXBlLkxFRlRfQ1VSTFlfQlJBQ0tFVF9UT0tFTjpcclxuICAgICAgICAgICAgICAgIGNhc2UgVG9rZW5UeXBlLkxFRlRfU1FVQVJFX0JSQUNLRVRfVE9LRU46XHJcbiAgICAgICAgICAgICAgICBjYXNlIFRva2VuVHlwZS5MRUZUX1BBUkVOVEhFU0lTX1RPS0VOOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWVTaW1wbGVCbG9jayh0b2tlbi50eXBlKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgVG9rZW5UeXBlLkZVTkNUSU9OX1RPS0VOOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN1bWVGdW5jdGlvbih0b2tlbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgUGFyc2VyLnByb3RvdHlwZS5jb25zdW1lU2ltcGxlQmxvY2sgPSBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgICAgICAgICB2YXIgYmxvY2sgPSB7IHR5cGU6IHR5cGUsIHZhbHVlczogW10gfTtcclxuICAgICAgICAgICAgdmFyIHRva2VuID0gdGhpcy5jb25zdW1lVG9rZW4oKTtcclxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuRU9GX1RPS0VOIHx8IGlzRW5kaW5nVG9rZW5Gb3IodG9rZW4sIHR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJsb2NrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvbnN1bWVUb2tlbih0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBibG9jay52YWx1ZXMucHVzaCh0aGlzLmNvbnN1bWVDb21wb25lbnRWYWx1ZSgpKTtcclxuICAgICAgICAgICAgICAgIHRva2VuID0gdGhpcy5jb25zdW1lVG9rZW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgUGFyc2VyLnByb3RvdHlwZS5jb25zdW1lRnVuY3Rpb24gPSBmdW5jdGlvbiAoZnVuY3Rpb25Ub2tlbikge1xyXG4gICAgICAgICAgICB2YXIgY3NzRnVuY3Rpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBmdW5jdGlvblRva2VuLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVzOiBbXSxcclxuICAgICAgICAgICAgICAgIHR5cGU6IFRva2VuVHlwZS5GVU5DVElPTlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRva2VuID0gdGhpcy5jb25zdW1lVG9rZW4oKTtcclxuICAgICAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuRU9GX1RPS0VOIHx8IHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5SSUdIVF9QQVJFTlRIRVNJU19UT0tFTikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjc3NGdW5jdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMucmVjb25zdW1lVG9rZW4odG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgY3NzRnVuY3Rpb24udmFsdWVzLnB1c2godGhpcy5jb25zdW1lQ29tcG9uZW50VmFsdWUoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIFBhcnNlci5wcm90b3R5cGUuY29uc3VtZVRva2VuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSB0aGlzLl90b2tlbnMuc2hpZnQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB0b2tlbiA9PT0gJ3VuZGVmaW5lZCcgPyBFT0ZfVE9LRU4gOiB0b2tlbjtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFBhcnNlci5wcm90b3R5cGUucmVjb25zdW1lVG9rZW4gPSBmdW5jdGlvbiAodG9rZW4pIHtcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW5zLnVuc2hpZnQodG9rZW4pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIFBhcnNlcjtcclxuICAgIH0oKSk7XHJcbiAgICB2YXIgaXNEaW1lbnNpb25Ub2tlbiA9IGZ1bmN0aW9uICh0b2tlbikgeyByZXR1cm4gdG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkRJTUVOU0lPTl9UT0tFTjsgfTtcclxuICAgIHZhciBpc051bWJlclRva2VuID0gZnVuY3Rpb24gKHRva2VuKSB7IHJldHVybiB0b2tlbi50eXBlID09PSBUb2tlblR5cGUuTlVNQkVSX1RPS0VOOyB9O1xyXG4gICAgdmFyIGlzSWRlbnRUb2tlbiA9IGZ1bmN0aW9uICh0b2tlbikgeyByZXR1cm4gdG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLklERU5UX1RPS0VOOyB9O1xyXG4gICAgdmFyIGlzU3RyaW5nVG9rZW4gPSBmdW5jdGlvbiAodG9rZW4pIHsgcmV0dXJuIHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5TVFJJTkdfVE9LRU47IH07XHJcbiAgICB2YXIgaXNJZGVudFdpdGhWYWx1ZSA9IGZ1bmN0aW9uICh0b2tlbiwgdmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gaXNJZGVudFRva2VuKHRva2VuKSAmJiB0b2tlbi52YWx1ZSA9PT0gdmFsdWU7XHJcbiAgICB9O1xyXG4gICAgdmFyIG5vbldoaXRlU3BhY2UgPSBmdW5jdGlvbiAodG9rZW4pIHsgcmV0dXJuIHRva2VuLnR5cGUgIT09IFRva2VuVHlwZS5XSElURVNQQUNFX1RPS0VOOyB9O1xyXG4gICAgdmFyIG5vbkZ1bmN0aW9uQXJnU2VwYXJhdG9yID0gZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRva2VuLnR5cGUgIT09IFRva2VuVHlwZS5XSElURVNQQUNFX1RPS0VOICYmIHRva2VuLnR5cGUgIT09IFRva2VuVHlwZS5DT01NQV9UT0tFTjtcclxuICAgIH07XHJcbiAgICB2YXIgcGFyc2VGdW5jdGlvbkFyZ3MgPSBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgdmFyIGFyZ3MgPSBbXTtcclxuICAgICAgICB2YXIgYXJnID0gW107XHJcbiAgICAgICAgdG9rZW5zLmZvckVhY2goZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuQ09NTUFfVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcmcubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgcGFyc2luZyBmdW5jdGlvbiBhcmdzLCB6ZXJvIHRva2VucyBmb3IgYXJnXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKGFyZyk7XHJcbiAgICAgICAgICAgICAgICBhcmcgPSBbXTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gVG9rZW5UeXBlLldISVRFU1BBQ0VfVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgIGFyZy5wdXNoKHRva2VuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChhcmcubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGFyZ3MucHVzaChhcmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXJncztcclxuICAgIH07XHJcbiAgICB2YXIgaXNFbmRpbmdUb2tlbkZvciA9IGZ1bmN0aW9uICh0b2tlbiwgdHlwZSkge1xyXG4gICAgICAgIGlmICh0eXBlID09PSBUb2tlblR5cGUuTEVGVF9DVVJMWV9CUkFDS0VUX1RPS0VOICYmIHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5SSUdIVF9DVVJMWV9CUkFDS0VUX1RPS0VOKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZSA9PT0gVG9rZW5UeXBlLkxFRlRfU1FVQVJFX0JSQUNLRVRfVE9LRU4gJiYgdG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLlJJR0hUX1NRVUFSRV9CUkFDS0VUX1RPS0VOKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHlwZSA9PT0gVG9rZW5UeXBlLkxFRlRfUEFSRU5USEVTSVNfVE9LRU4gJiYgdG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLlJJR0hUX1BBUkVOVEhFU0lTX1RPS0VOO1xyXG4gICAgfTtcblxuICAgIHZhciBpc0xlbmd0aCA9IGZ1bmN0aW9uICh0b2tlbikge1xyXG4gICAgICAgIHJldHVybiB0b2tlbi50eXBlID09PSBUb2tlblR5cGUuTlVNQkVSX1RPS0VOIHx8IHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5ESU1FTlNJT05fVE9LRU47XHJcbiAgICB9O1xuXG4gICAgdmFyIGlzTGVuZ3RoUGVyY2VudGFnZSA9IGZ1bmN0aW9uICh0b2tlbikge1xyXG4gICAgICAgIHJldHVybiB0b2tlbi50eXBlID09PSBUb2tlblR5cGUuUEVSQ0VOVEFHRV9UT0tFTiB8fCBpc0xlbmd0aCh0b2tlbik7XHJcbiAgICB9O1xyXG4gICAgdmFyIHBhcnNlTGVuZ3RoUGVyY2VudGFnZVR1cGxlID0gZnVuY3Rpb24gKHRva2Vucykge1xyXG4gICAgICAgIHJldHVybiB0b2tlbnMubGVuZ3RoID4gMSA/IFt0b2tlbnNbMF0sIHRva2Vuc1sxXV0gOiBbdG9rZW5zWzBdXTtcclxuICAgIH07XHJcbiAgICB2YXIgWkVST19MRU5HVEggPSB7XHJcbiAgICAgICAgdHlwZTogVG9rZW5UeXBlLk5VTUJFUl9UT0tFTixcclxuICAgICAgICBudW1iZXI6IDAsXHJcbiAgICAgICAgZmxhZ3M6IEZMQUdfSU5URUdFUlxyXG4gICAgfTtcclxuICAgIHZhciBGSUZUWV9QRVJDRU5UID0ge1xyXG4gICAgICAgIHR5cGU6IFRva2VuVHlwZS5QRVJDRU5UQUdFX1RPS0VOLFxyXG4gICAgICAgIG51bWJlcjogNTAsXHJcbiAgICAgICAgZmxhZ3M6IEZMQUdfSU5URUdFUlxyXG4gICAgfTtcclxuICAgIHZhciBIVU5EUkVEX1BFUkNFTlQgPSB7XHJcbiAgICAgICAgdHlwZTogVG9rZW5UeXBlLlBFUkNFTlRBR0VfVE9LRU4sXHJcbiAgICAgICAgbnVtYmVyOiAxMDAsXHJcbiAgICAgICAgZmxhZ3M6IEZMQUdfSU5URUdFUlxyXG4gICAgfTtcclxuICAgIHZhciBnZXRBYnNvbHV0ZVZhbHVlRm9yVHVwbGUgPSBmdW5jdGlvbiAodHVwbGUsIHdpZHRoLCBoZWlnaHQpIHtcclxuICAgICAgICB2YXIgeCA9IHR1cGxlWzBdLCB5ID0gdHVwbGVbMV07XHJcbiAgICAgICAgcmV0dXJuIFtnZXRBYnNvbHV0ZVZhbHVlKHgsIHdpZHRoKSwgZ2V0QWJzb2x1dGVWYWx1ZSh0eXBlb2YgeSAhPT0gJ3VuZGVmaW5lZCcgPyB5IDogeCwgaGVpZ2h0KV07XHJcbiAgICB9O1xyXG4gICAgdmFyIGdldEFic29sdXRlVmFsdWUgPSBmdW5jdGlvbiAodG9rZW4sIHBhcmVudCkge1xyXG4gICAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuUEVSQ0VOVEFHRV9UT0tFTikge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRva2VuLm51bWJlciAvIDEwMCkgKiBwYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0RpbWVuc2lvblRva2VuKHRva2VuKSkge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLnVuaXQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JlbSc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdlbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE2ICogdG9rZW4ubnVtYmVyOyAvLyBUT0RPIHVzZSBjb3JyZWN0IGZvbnQtc2l6ZVxyXG4gICAgICAgICAgICAgICAgY2FzZSAncHgnOlxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ubnVtYmVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0b2tlbi5udW1iZXI7XHJcbiAgICB9O1xuXG4gICAgdmFyIERFRyA9ICdkZWcnO1xyXG4gICAgdmFyIEdSQUQgPSAnZ3JhZCc7XHJcbiAgICB2YXIgUkFEID0gJ3JhZCc7XHJcbiAgICB2YXIgVFVSTiA9ICd0dXJuJztcclxuICAgIHZhciBhbmdsZSA9IHtcclxuICAgICAgICBuYW1lOiAnYW5nbGUnLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlLnR5cGUgPT09IFRva2VuVHlwZS5ESU1FTlNJT05fVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodmFsdWUudW5pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgREVHOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKE1hdGguUEkgKiB2YWx1ZS5udW1iZXIpIC8gMTgwO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgR1JBRDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChNYXRoLlBJIC8gMjAwKSAqIHZhbHVlLm51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFJBRDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFRVUk46XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLlBJICogMiAqIHZhbHVlLm51bWJlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBhbmdsZSB0eXBlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB2YXIgaXNBbmdsZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh2YWx1ZS50eXBlID09PSBUb2tlblR5cGUuRElNRU5TSU9OX1RPS0VOKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS51bml0ID09PSBERUcgfHwgdmFsdWUudW5pdCA9PT0gR1JBRCB8fCB2YWx1ZS51bml0ID09PSBSQUQgfHwgdmFsdWUudW5pdCA9PT0gVFVSTikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIHZhciBwYXJzZU5hbWVkU2lkZSA9IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICAgICAgICB2YXIgc2lkZU9yQ29ybmVyID0gdG9rZW5zXHJcbiAgICAgICAgICAgIC5maWx0ZXIoaXNJZGVudFRva2VuKVxyXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uIChpZGVudCkgeyByZXR1cm4gaWRlbnQudmFsdWU7IH0pXHJcbiAgICAgICAgICAgIC5qb2luKCcgJyk7XHJcbiAgICAgICAgc3dpdGNoIChzaWRlT3JDb3JuZXIpIHtcclxuICAgICAgICAgICAgY2FzZSAndG8gYm90dG9tIHJpZ2h0JzpcclxuICAgICAgICAgICAgY2FzZSAndG8gcmlnaHQgYm90dG9tJzpcclxuICAgICAgICAgICAgY2FzZSAnbGVmdCB0b3AnOlxyXG4gICAgICAgICAgICBjYXNlICd0b3AgbGVmdCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1pFUk9fTEVOR1RILCBaRVJPX0xFTkdUSF07XHJcbiAgICAgICAgICAgIGNhc2UgJ3RvIHRvcCc6XHJcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVnKDApO1xyXG4gICAgICAgICAgICBjYXNlICd0byBib3R0b20gbGVmdCc6XHJcbiAgICAgICAgICAgIGNhc2UgJ3RvIGxlZnQgYm90dG9tJzpcclxuICAgICAgICAgICAgY2FzZSAncmlnaHQgdG9wJzpcclxuICAgICAgICAgICAgY2FzZSAndG9wIHJpZ2h0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbWkVST19MRU5HVEgsIEhVTkRSRURfUEVSQ0VOVF07XHJcbiAgICAgICAgICAgIGNhc2UgJ3RvIHJpZ2h0JzpcclxuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVnKDkwKTtcclxuICAgICAgICAgICAgY2FzZSAndG8gdG9wIGxlZnQnOlxyXG4gICAgICAgICAgICBjYXNlICd0byBsZWZ0IHRvcCc6XHJcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0IGJvdHRvbSc6XHJcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSByaWdodCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW0hVTkRSRURfUEVSQ0VOVCwgSFVORFJFRF9QRVJDRU5UXTtcclxuICAgICAgICAgICAgY2FzZSAndG8gYm90dG9tJzpcclxuICAgICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZWcoMTgwKTtcclxuICAgICAgICAgICAgY2FzZSAndG8gdG9wIHJpZ2h0JzpcclxuICAgICAgICAgICAgY2FzZSAndG8gcmlnaHQgdG9wJzpcclxuICAgICAgICAgICAgY2FzZSAnbGVmdCBib3R0b20nOlxyXG4gICAgICAgICAgICBjYXNlICdib3R0b20gbGVmdCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW0hVTkRSRURfUEVSQ0VOVCwgWkVST19MRU5HVEhdO1xyXG4gICAgICAgICAgICBjYXNlICd0byBsZWZ0JzpcclxuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZygyNzApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH07XHJcbiAgICB2YXIgZGVnID0gZnVuY3Rpb24gKGRlZykgeyByZXR1cm4gKE1hdGguUEkgKiBkZWcpIC8gMTgwOyB9O1xuXG4gICAgdmFyIGNvbG9yID0ge1xyXG4gICAgICAgIG5hbWU6ICdjb2xvcicsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUudHlwZSA9PT0gVG9rZW5UeXBlLkZVTkNUSU9OKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sb3JGdW5jdGlvbiA9IFNVUFBPUlRFRF9DT0xPUl9GVU5DVElPTlNbdmFsdWUubmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbG9yRnVuY3Rpb24gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXR0ZW1wdGluZyB0byBwYXJzZSBhbiB1bnN1cHBvcnRlZCBjb2xvciBmdW5jdGlvbiBcXFwiXCIgKyB2YWx1ZS5uYW1lICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yRnVuY3Rpb24odmFsdWUudmFsdWVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsdWUudHlwZSA9PT0gVG9rZW5UeXBlLkhBU0hfVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS52YWx1ZS5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZyA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygxLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYiA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygyLCAzKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFjayhwYXJzZUludChyICsgciwgMTYpLCBwYXJzZUludChnICsgZywgMTYpLCBwYXJzZUludChiICsgYiwgMTYpLCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS52YWx1ZS5sZW5ndGggPT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZyA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygxLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYiA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygyLCAzKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYSA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygzLCA0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFjayhwYXJzZUludChyICsgciwgMTYpLCBwYXJzZUludChnICsgZywgMTYpLCBwYXJzZUludChiICsgYiwgMTYpLCBwYXJzZUludChhICsgYSwgMTYpIC8gMjU1KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS52YWx1ZS5sZW5ndGggPT09IDYpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygwLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZyA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygyLCA0KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYiA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZyg0LCA2KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFjayhwYXJzZUludChyLCAxNiksIHBhcnNlSW50KGcsIDE2KSwgcGFyc2VJbnQoYiwgMTYpLCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS52YWx1ZS5sZW5ndGggPT09IDgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygwLCAyKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZyA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZygyLCA0KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYiA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZyg0LCA2KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYSA9IHZhbHVlLnZhbHVlLnN1YnN0cmluZyg2LCA4KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFjayhwYXJzZUludChyLCAxNiksIHBhcnNlSW50KGcsIDE2KSwgcGFyc2VJbnQoYiwgMTYpLCBwYXJzZUludChhLCAxNikgLyAyNTUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS50eXBlID09PSBUb2tlblR5cGUuSURFTlRfVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgIHZhciBuYW1lZENvbG9yID0gQ09MT1JTW3ZhbHVlLnZhbHVlLnRvVXBwZXJDYXNlKCldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBuYW1lZENvbG9yICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuYW1lZENvbG9yO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBDT0xPUlMuVFJBTlNQQVJFTlQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHZhciBpc1RyYW5zcGFyZW50ID0gZnVuY3Rpb24gKGNvbG9yKSB7IHJldHVybiAoMHhmZiAmIGNvbG9yKSA9PT0gMDsgfTtcclxuICAgIHZhciBhc1N0cmluZyA9IGZ1bmN0aW9uIChjb2xvcikge1xyXG4gICAgICAgIHZhciBhbHBoYSA9IDB4ZmYgJiBjb2xvcjtcclxuICAgICAgICB2YXIgYmx1ZSA9IDB4ZmYgJiAoY29sb3IgPj4gOCk7XHJcbiAgICAgICAgdmFyIGdyZWVuID0gMHhmZiAmIChjb2xvciA+PiAxNik7XHJcbiAgICAgICAgdmFyIHJlZCA9IDB4ZmYgJiAoY29sb3IgPj4gMjQpO1xyXG4gICAgICAgIHJldHVybiBhbHBoYSA8IDI1NSA/IFwicmdiYShcIiArIHJlZCArIFwiLFwiICsgZ3JlZW4gKyBcIixcIiArIGJsdWUgKyBcIixcIiArIGFscGhhIC8gMjU1ICsgXCIpXCIgOiBcInJnYihcIiArIHJlZCArIFwiLFwiICsgZ3JlZW4gKyBcIixcIiArIGJsdWUgKyBcIilcIjtcclxuICAgIH07XHJcbiAgICB2YXIgcGFjayA9IGZ1bmN0aW9uIChyLCBnLCBiLCBhKSB7XHJcbiAgICAgICAgcmV0dXJuICgociA8PCAyNCkgfCAoZyA8PCAxNikgfCAoYiA8PCA4KSB8IChNYXRoLnJvdW5kKGEgKiAyNTUpIDw8IDApKSA+Pj4gMDtcclxuICAgIH07XHJcbiAgICB2YXIgZ2V0VG9rZW5Db2xvclZhbHVlID0gZnVuY3Rpb24gKHRva2VuLCBpKSB7XHJcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5OVU1CRVJfVE9LRU4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRva2VuLm51bWJlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5QRVJDRU5UQUdFX1RPS0VOKSB7XHJcbiAgICAgICAgICAgIHZhciBtYXggPSBpID09PSAzID8gMSA6IDI1NTtcclxuICAgICAgICAgICAgcmV0dXJuIGkgPT09IDMgPyAodG9rZW4ubnVtYmVyIC8gMTAwKSAqIG1heCA6IE1hdGgucm91bmQoKHRva2VuLm51bWJlciAvIDEwMCkgKiBtYXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH07XHJcbiAgICB2YXIgcmdiID0gZnVuY3Rpb24gKGFyZ3MpIHtcclxuICAgICAgICB2YXIgdG9rZW5zID0gYXJncy5maWx0ZXIobm9uRnVuY3Rpb25BcmdTZXBhcmF0b3IpO1xyXG4gICAgICAgIGlmICh0b2tlbnMubGVuZ3RoID09PSAzKSB7XHJcbiAgICAgICAgICAgIHZhciBfYSA9IHRva2Vucy5tYXAoZ2V0VG9rZW5Db2xvclZhbHVlKSwgciA9IF9hWzBdLCBnID0gX2FbMV0sIGIgPSBfYVsyXTtcclxuICAgICAgICAgICAgcmV0dXJuIHBhY2sociwgZywgYiwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0b2tlbnMubGVuZ3RoID09PSA0KSB7XHJcbiAgICAgICAgICAgIHZhciBfYiA9IHRva2Vucy5tYXAoZ2V0VG9rZW5Db2xvclZhbHVlKSwgciA9IF9iWzBdLCBnID0gX2JbMV0sIGIgPSBfYlsyXSwgYSA9IF9iWzNdO1xyXG4gICAgICAgICAgICByZXR1cm4gcGFjayhyLCBnLCBiLCBhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gaHVlMnJnYih0MSwgdDIsIGh1ZSkge1xyXG4gICAgICAgIGlmIChodWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGh1ZSArPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaHVlID49IDEpIHtcclxuICAgICAgICAgICAgaHVlIC09IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChodWUgPCAxIC8gNikge1xyXG4gICAgICAgICAgICByZXR1cm4gKHQyIC0gdDEpICogaHVlICogNiArIHQxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChodWUgPCAxIC8gMikge1xyXG4gICAgICAgICAgICByZXR1cm4gdDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGh1ZSA8IDIgLyAzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodDIgLSB0MSkgKiA2ICogKDIgLyAzIC0gaHVlKSArIHQxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHQxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHZhciBoc2wgPSBmdW5jdGlvbiAoYXJncykge1xyXG4gICAgICAgIHZhciB0b2tlbnMgPSBhcmdzLmZpbHRlcihub25GdW5jdGlvbkFyZ1NlcGFyYXRvcik7XHJcbiAgICAgICAgdmFyIGh1ZSA9IHRva2Vuc1swXSwgc2F0dXJhdGlvbiA9IHRva2Vuc1sxXSwgbGlnaHRuZXNzID0gdG9rZW5zWzJdLCBhbHBoYSA9IHRva2Vuc1szXTtcclxuICAgICAgICB2YXIgaCA9IChodWUudHlwZSA9PT0gVG9rZW5UeXBlLk5VTUJFUl9UT0tFTiA/IGRlZyhodWUubnVtYmVyKSA6IGFuZ2xlLnBhcnNlKGh1ZSkpIC8gKE1hdGguUEkgKiAyKTtcclxuICAgICAgICB2YXIgcyA9IGlzTGVuZ3RoUGVyY2VudGFnZShzYXR1cmF0aW9uKSA/IHNhdHVyYXRpb24ubnVtYmVyIC8gMTAwIDogMDtcclxuICAgICAgICB2YXIgbCA9IGlzTGVuZ3RoUGVyY2VudGFnZShsaWdodG5lc3MpID8gbGlnaHRuZXNzLm51bWJlciAvIDEwMCA6IDA7XHJcbiAgICAgICAgdmFyIGEgPSB0eXBlb2YgYWxwaGEgIT09ICd1bmRlZmluZWQnICYmIGlzTGVuZ3RoUGVyY2VudGFnZShhbHBoYSkgPyBnZXRBYnNvbHV0ZVZhbHVlKGFscGhhLCAxKSA6IDE7XHJcbiAgICAgICAgaWYgKHMgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhY2sobCAqIDI1NSwgbCAqIDI1NSwgbCAqIDI1NSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0MiA9IGwgPD0gMC41ID8gbCAqIChzICsgMSkgOiBsICsgcyAtIGwgKiBzO1xyXG4gICAgICAgIHZhciB0MSA9IGwgKiAyIC0gdDI7XHJcbiAgICAgICAgdmFyIHIgPSBodWUycmdiKHQxLCB0MiwgaCArIDEgLyAzKTtcclxuICAgICAgICB2YXIgZyA9IGh1ZTJyZ2IodDEsIHQyLCBoKTtcclxuICAgICAgICB2YXIgYiA9IGh1ZTJyZ2IodDEsIHQyLCBoIC0gMSAvIDMpO1xyXG4gICAgICAgIHJldHVybiBwYWNrKHIgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTUsIGEpO1xyXG4gICAgfTtcclxuICAgIHZhciBTVVBQT1JURURfQ09MT1JfRlVOQ1RJT05TID0ge1xyXG4gICAgICAgIGhzbDogaHNsLFxyXG4gICAgICAgIGhzbGE6IGhzbCxcclxuICAgICAgICByZ2I6IHJnYixcclxuICAgICAgICByZ2JhOiByZ2JcclxuICAgIH07XHJcbiAgICB2YXIgQ09MT1JTID0ge1xyXG4gICAgICAgIEFMSUNFQkxVRTogMHhmMGY4ZmZmZixcclxuICAgICAgICBBTlRJUVVFV0hJVEU6IDB4ZmFlYmQ3ZmYsXHJcbiAgICAgICAgQVFVQTogMHgwMGZmZmZmZixcclxuICAgICAgICBBUVVBTUFSSU5FOiAweDdmZmZkNGZmLFxyXG4gICAgICAgIEFaVVJFOiAweGYwZmZmZmZmLFxyXG4gICAgICAgIEJFSUdFOiAweGY1ZjVkY2ZmLFxyXG4gICAgICAgIEJJU1FVRTogMHhmZmU0YzRmZixcclxuICAgICAgICBCTEFDSzogMHgwMDAwMDBmZixcclxuICAgICAgICBCTEFOQ0hFREFMTU9ORDogMHhmZmViY2RmZixcclxuICAgICAgICBCTFVFOiAweDAwMDBmZmZmLFxyXG4gICAgICAgIEJMVUVWSU9MRVQ6IDB4OGEyYmUyZmYsXHJcbiAgICAgICAgQlJPV046IDB4YTUyYTJhZmYsXHJcbiAgICAgICAgQlVSTFlXT09EOiAweGRlYjg4N2ZmLFxyXG4gICAgICAgIENBREVUQkxVRTogMHg1ZjllYTBmZixcclxuICAgICAgICBDSEFSVFJFVVNFOiAweDdmZmYwMGZmLFxyXG4gICAgICAgIENIT0NPTEFURTogMHhkMjY5MWVmZixcclxuICAgICAgICBDT1JBTDogMHhmZjdmNTBmZixcclxuICAgICAgICBDT1JORkxPV0VSQkxVRTogMHg2NDk1ZWRmZixcclxuICAgICAgICBDT1JOU0lMSzogMHhmZmY4ZGNmZixcclxuICAgICAgICBDUklNU09OOiAweGRjMTQzY2ZmLFxyXG4gICAgICAgIENZQU46IDB4MDBmZmZmZmYsXHJcbiAgICAgICAgREFSS0JMVUU6IDB4MDAwMDhiZmYsXHJcbiAgICAgICAgREFSS0NZQU46IDB4MDA4YjhiZmYsXHJcbiAgICAgICAgREFSS0dPTERFTlJPRDogMHhiODg2YmJmZixcclxuICAgICAgICBEQVJLR1JBWTogMHhhOWE5YTlmZixcclxuICAgICAgICBEQVJLR1JFRU46IDB4MDA2NDAwZmYsXHJcbiAgICAgICAgREFSS0dSRVk6IDB4YTlhOWE5ZmYsXHJcbiAgICAgICAgREFSS0tIQUtJOiAweGJkYjc2YmZmLFxyXG4gICAgICAgIERBUktNQUdFTlRBOiAweDhiMDA4YmZmLFxyXG4gICAgICAgIERBUktPTElWRUdSRUVOOiAweDU1NmIyZmZmLFxyXG4gICAgICAgIERBUktPUkFOR0U6IDB4ZmY4YzAwZmYsXHJcbiAgICAgICAgREFSS09SQ0hJRDogMHg5OTMyY2NmZixcclxuICAgICAgICBEQVJLUkVEOiAweDhiMDAwMGZmLFxyXG4gICAgICAgIERBUktTQUxNT046IDB4ZTk5NjdhZmYsXHJcbiAgICAgICAgREFSS1NFQUdSRUVOOiAweDhmYmM4ZmZmLFxyXG4gICAgICAgIERBUktTTEFURUJMVUU6IDB4NDgzZDhiZmYsXHJcbiAgICAgICAgREFSS1NMQVRFR1JBWTogMHgyZjRmNGZmZixcclxuICAgICAgICBEQVJLU0xBVEVHUkVZOiAweDJmNGY0ZmZmLFxyXG4gICAgICAgIERBUktUVVJRVU9JU0U6IDB4MDBjZWQxZmYsXHJcbiAgICAgICAgREFSS1ZJT0xFVDogMHg5NDAwZDNmZixcclxuICAgICAgICBERUVQUElOSzogMHhmZjE0OTNmZixcclxuICAgICAgICBERUVQU0tZQkxVRTogMHgwMGJmZmZmZixcclxuICAgICAgICBESU1HUkFZOiAweDY5Njk2OWZmLFxyXG4gICAgICAgIERJTUdSRVk6IDB4Njk2OTY5ZmYsXHJcbiAgICAgICAgRE9ER0VSQkxVRTogMHgxZTkwZmZmZixcclxuICAgICAgICBGSVJFQlJJQ0s6IDB4YjIyMjIyZmYsXHJcbiAgICAgICAgRkxPUkFMV0hJVEU6IDB4ZmZmYWYwZmYsXHJcbiAgICAgICAgRk9SRVNUR1JFRU46IDB4MjI4YjIyZmYsXHJcbiAgICAgICAgRlVDSFNJQTogMHhmZjAwZmZmZixcclxuICAgICAgICBHQUlOU0JPUk86IDB4ZGNkY2RjZmYsXHJcbiAgICAgICAgR0hPU1RXSElURTogMHhmOGY4ZmZmZixcclxuICAgICAgICBHT0xEOiAweGZmZDcwMGZmLFxyXG4gICAgICAgIEdPTERFTlJPRDogMHhkYWE1MjBmZixcclxuICAgICAgICBHUkFZOiAweDgwODA4MGZmLFxyXG4gICAgICAgIEdSRUVOOiAweDAwODAwMGZmLFxyXG4gICAgICAgIEdSRUVOWUVMTE9XOiAweGFkZmYyZmZmLFxyXG4gICAgICAgIEdSRVk6IDB4ODA4MDgwZmYsXHJcbiAgICAgICAgSE9ORVlERVc6IDB4ZjBmZmYwZmYsXHJcbiAgICAgICAgSE9UUElOSzogMHhmZjY5YjRmZixcclxuICAgICAgICBJTkRJQU5SRUQ6IDB4Y2Q1YzVjZmYsXHJcbiAgICAgICAgSU5ESUdPOiAweDRiMDA4MmZmLFxyXG4gICAgICAgIElWT1JZOiAweGZmZmZmMGZmLFxyXG4gICAgICAgIEtIQUtJOiAweGYwZTY4Y2ZmLFxyXG4gICAgICAgIExBVkVOREVSOiAweGU2ZTZmYWZmLFxyXG4gICAgICAgIExBVkVOREVSQkxVU0g6IDB4ZmZmMGY1ZmYsXHJcbiAgICAgICAgTEFXTkdSRUVOOiAweDdjZmMwMGZmLFxyXG4gICAgICAgIExFTU9OQ0hJRkZPTjogMHhmZmZhY2RmZixcclxuICAgICAgICBMSUdIVEJMVUU6IDB4YWRkOGU2ZmYsXHJcbiAgICAgICAgTElHSFRDT1JBTDogMHhmMDgwODBmZixcclxuICAgICAgICBMSUdIVENZQU46IDB4ZTBmZmZmZmYsXHJcbiAgICAgICAgTElHSFRHT0xERU5ST0RZRUxMT1c6IDB4ZmFmYWQyZmYsXHJcbiAgICAgICAgTElHSFRHUkFZOiAweGQzZDNkM2ZmLFxyXG4gICAgICAgIExJR0hUR1JFRU46IDB4OTBlZTkwZmYsXHJcbiAgICAgICAgTElHSFRHUkVZOiAweGQzZDNkM2ZmLFxyXG4gICAgICAgIExJR0hUUElOSzogMHhmZmI2YzFmZixcclxuICAgICAgICBMSUdIVFNBTE1PTjogMHhmZmEwN2FmZixcclxuICAgICAgICBMSUdIVFNFQUdSRUVOOiAweDIwYjJhYWZmLFxyXG4gICAgICAgIExJR0hUU0tZQkxVRTogMHg4N2NlZmFmZixcclxuICAgICAgICBMSUdIVFNMQVRFR1JBWTogMHg3Nzg4OTlmZixcclxuICAgICAgICBMSUdIVFNMQVRFR1JFWTogMHg3Nzg4OTlmZixcclxuICAgICAgICBMSUdIVFNURUVMQkxVRTogMHhiMGM0ZGVmZixcclxuICAgICAgICBMSUdIVFlFTExPVzogMHhmZmZmZTBmZixcclxuICAgICAgICBMSU1FOiAweDAwZmYwMGZmLFxyXG4gICAgICAgIExJTUVHUkVFTjogMHgzMmNkMzJmZixcclxuICAgICAgICBMSU5FTjogMHhmYWYwZTZmZixcclxuICAgICAgICBNQUdFTlRBOiAweGZmMDBmZmZmLFxyXG4gICAgICAgIE1BUk9PTjogMHg4MDAwMDBmZixcclxuICAgICAgICBNRURJVU1BUVVBTUFSSU5FOiAweDY2Y2RhYWZmLFxyXG4gICAgICAgIE1FRElVTUJMVUU6IDB4MDAwMGNkZmYsXHJcbiAgICAgICAgTUVESVVNT1JDSElEOiAweGJhNTVkM2ZmLFxyXG4gICAgICAgIE1FRElVTVBVUlBMRTogMHg5MzcwZGJmZixcclxuICAgICAgICBNRURJVU1TRUFHUkVFTjogMHgzY2IzNzFmZixcclxuICAgICAgICBNRURJVU1TTEFURUJMVUU6IDB4N2I2OGVlZmYsXHJcbiAgICAgICAgTUVESVVNU1BSSU5HR1JFRU46IDB4MDBmYTlhZmYsXHJcbiAgICAgICAgTUVESVVNVFVSUVVPSVNFOiAweDQ4ZDFjY2ZmLFxyXG4gICAgICAgIE1FRElVTVZJT0xFVFJFRDogMHhjNzE1ODVmZixcclxuICAgICAgICBNSUROSUdIVEJMVUU6IDB4MTkxOTcwZmYsXHJcbiAgICAgICAgTUlOVENSRUFNOiAweGY1ZmZmYWZmLFxyXG4gICAgICAgIE1JU1RZUk9TRTogMHhmZmU0ZTFmZixcclxuICAgICAgICBNT0NDQVNJTjogMHhmZmU0YjVmZixcclxuICAgICAgICBOQVZBSk9XSElURTogMHhmZmRlYWRmZixcclxuICAgICAgICBOQVZZOiAweDAwMDA4MGZmLFxyXG4gICAgICAgIE9MRExBQ0U6IDB4ZmRmNWU2ZmYsXHJcbiAgICAgICAgT0xJVkU6IDB4ODA4MDAwZmYsXHJcbiAgICAgICAgT0xJVkVEUkFCOiAweDZiOGUyM2ZmLFxyXG4gICAgICAgIE9SQU5HRTogMHhmZmE1MDBmZixcclxuICAgICAgICBPUkFOR0VSRUQ6IDB4ZmY0NTAwZmYsXHJcbiAgICAgICAgT1JDSElEOiAweGRhNzBkNmZmLFxyXG4gICAgICAgIFBBTEVHT0xERU5ST0Q6IDB4ZWVlOGFhZmYsXHJcbiAgICAgICAgUEFMRUdSRUVOOiAweDk4ZmI5OGZmLFxyXG4gICAgICAgIFBBTEVUVVJRVU9JU0U6IDB4YWZlZWVlZmYsXHJcbiAgICAgICAgUEFMRVZJT0xFVFJFRDogMHhkYjcwOTNmZixcclxuICAgICAgICBQQVBBWUFXSElQOiAweGZmZWZkNWZmLFxyXG4gICAgICAgIFBFQUNIUFVGRjogMHhmZmRhYjlmZixcclxuICAgICAgICBQRVJVOiAweGNkODUzZmZmLFxyXG4gICAgICAgIFBJTks6IDB4ZmZjMGNiZmYsXHJcbiAgICAgICAgUExVTTogMHhkZGEwZGRmZixcclxuICAgICAgICBQT1dERVJCTFVFOiAweGIwZTBlNmZmLFxyXG4gICAgICAgIFBVUlBMRTogMHg4MDAwODBmZixcclxuICAgICAgICBSRUJFQ0NBUFVSUExFOiAweDY2MzM5OWZmLFxyXG4gICAgICAgIFJFRDogMHhmZjAwMDBmZixcclxuICAgICAgICBST1NZQlJPV046IDB4YmM4ZjhmZmYsXHJcbiAgICAgICAgUk9ZQUxCTFVFOiAweDQxNjllMWZmLFxyXG4gICAgICAgIFNBRERMRUJST1dOOiAweDhiNDUxM2ZmLFxyXG4gICAgICAgIFNBTE1PTjogMHhmYTgwNzJmZixcclxuICAgICAgICBTQU5EWUJST1dOOiAweGY0YTQ2MGZmLFxyXG4gICAgICAgIFNFQUdSRUVOOiAweDJlOGI1N2ZmLFxyXG4gICAgICAgIFNFQVNIRUxMOiAweGZmZjVlZWZmLFxyXG4gICAgICAgIFNJRU5OQTogMHhhMDUyMmRmZixcclxuICAgICAgICBTSUxWRVI6IDB4YzBjMGMwZmYsXHJcbiAgICAgICAgU0tZQkxVRTogMHg4N2NlZWJmZixcclxuICAgICAgICBTTEFURUJMVUU6IDB4NmE1YWNkZmYsXHJcbiAgICAgICAgU0xBVEVHUkFZOiAweDcwODA5MGZmLFxyXG4gICAgICAgIFNMQVRFR1JFWTogMHg3MDgwOTBmZixcclxuICAgICAgICBTTk9XOiAweGZmZmFmYWZmLFxyXG4gICAgICAgIFNQUklOR0dSRUVOOiAweDAwZmY3ZmZmLFxyXG4gICAgICAgIFNURUVMQkxVRTogMHg0NjgyYjRmZixcclxuICAgICAgICBUQU46IDB4ZDJiNDhjZmYsXHJcbiAgICAgICAgVEVBTDogMHgwMDgwODBmZixcclxuICAgICAgICBUSElTVExFOiAweGQ4YmZkOGZmLFxyXG4gICAgICAgIFRPTUFUTzogMHhmZjYzNDdmZixcclxuICAgICAgICBUUkFOU1BBUkVOVDogMHgwMDAwMDAwMCxcclxuICAgICAgICBUVVJRVU9JU0U6IDB4NDBlMGQwZmYsXHJcbiAgICAgICAgVklPTEVUOiAweGVlODJlZWZmLFxyXG4gICAgICAgIFdIRUFUOiAweGY1ZGViM2ZmLFxyXG4gICAgICAgIFdISVRFOiAweGZmZmZmZmZmLFxyXG4gICAgICAgIFdISVRFU01PS0U6IDB4ZjVmNWY1ZmYsXHJcbiAgICAgICAgWUVMTE9XOiAweGZmZmYwMGZmLFxyXG4gICAgICAgIFlFTExPV0dSRUVOOiAweDlhY2QzMmZmXHJcbiAgICB9O1xuXG4gICAgdmFyIFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlO1xyXG4gICAgKGZ1bmN0aW9uIChQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZSkge1xyXG4gICAgICAgIFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlW1Byb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlW1wiVkFMVUVcIl0gPSAwXSA9IFwiVkFMVUVcIjtcclxuICAgICAgICBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZVtQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZVtcIkxJU1RcIl0gPSAxXSA9IFwiTElTVFwiO1xyXG4gICAgICAgIFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlW1Byb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlW1wiSURFTlRfVkFMVUVcIl0gPSAyXSA9IFwiSURFTlRfVkFMVUVcIjtcclxuICAgICAgICBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZVtQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZVtcIlRZUEVfVkFMVUVcIl0gPSAzXSA9IFwiVFlQRV9WQUxVRVwiO1xyXG4gICAgICAgIFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlW1Byb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlW1wiVE9LRU5fVkFMVUVcIl0gPSA0XSA9IFwiVE9LRU5fVkFMVUVcIjtcclxuICAgIH0pKFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlIHx8IChQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZSA9IHt9KSk7XG5cbiAgICB2YXIgQkFDS0dST1VORF9DTElQO1xyXG4gICAgKGZ1bmN0aW9uIChCQUNLR1JPVU5EX0NMSVApIHtcclxuICAgICAgICBCQUNLR1JPVU5EX0NMSVBbQkFDS0dST1VORF9DTElQW1wiQk9SREVSX0JPWFwiXSA9IDBdID0gXCJCT1JERVJfQk9YXCI7XHJcbiAgICAgICAgQkFDS0dST1VORF9DTElQW0JBQ0tHUk9VTkRfQ0xJUFtcIlBBRERJTkdfQk9YXCJdID0gMV0gPSBcIlBBRERJTkdfQk9YXCI7XHJcbiAgICAgICAgQkFDS0dST1VORF9DTElQW0JBQ0tHUk9VTkRfQ0xJUFtcIkNPTlRFTlRfQk9YXCJdID0gMl0gPSBcIkNPTlRFTlRfQk9YXCI7XHJcbiAgICB9KShCQUNLR1JPVU5EX0NMSVAgfHwgKEJBQ0tHUk9VTkRfQ0xJUCA9IHt9KSk7XHJcbiAgICB2YXIgYmFja2dyb3VuZENsaXAgPSB7XHJcbiAgICAgICAgbmFtZTogJ2JhY2tncm91bmQtY2xpcCcsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnYm9yZGVyLWJveCcsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5MSVNULFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnMubWFwKGZ1bmN0aW9uICh0b2tlbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzSWRlbnRUb2tlbih0b2tlbikpIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BhZGRpbmctYm94JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBCQUNLR1JPVU5EX0NMSVAuUEFERElOR19CT1g7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbnRlbnQtYm94JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBCQUNLR1JPVU5EX0NMSVAuQ09OVEVOVF9CT1g7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJBQ0tHUk9VTkRfQ0xJUC5CT1JERVJfQk9YO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIGJhY2tncm91bmRDb2xvciA9IHtcclxuICAgICAgICBuYW1lOiBcImJhY2tncm91bmQtY29sb3JcIixcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5UWVBFX1ZBTFVFLFxyXG4gICAgICAgIGZvcm1hdDogJ2NvbG9yJ1xyXG4gICAgfTtcblxuICAgIHZhciBwYXJzZUNvbG9yU3RvcCA9IGZ1bmN0aW9uIChhcmdzKSB7XHJcbiAgICAgICAgdmFyIGNvbG9yJDEgPSBjb2xvci5wYXJzZShhcmdzWzBdKTtcclxuICAgICAgICB2YXIgc3RvcCA9IGFyZ3NbMV07XHJcbiAgICAgICAgcmV0dXJuIHN0b3AgJiYgaXNMZW5ndGhQZXJjZW50YWdlKHN0b3ApID8geyBjb2xvcjogY29sb3IkMSwgc3RvcDogc3RvcCB9IDogeyBjb2xvcjogY29sb3IkMSwgc3RvcDogbnVsbCB9O1xyXG4gICAgfTtcclxuICAgIHZhciBwcm9jZXNzQ29sb3JTdG9wcyA9IGZ1bmN0aW9uIChzdG9wcywgbGluZUxlbmd0aCkge1xyXG4gICAgICAgIHZhciBmaXJzdCA9IHN0b3BzWzBdO1xyXG4gICAgICAgIHZhciBsYXN0ID0gc3RvcHNbc3RvcHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgaWYgKGZpcnN0LnN0b3AgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgZmlyc3Quc3RvcCA9IFpFUk9fTEVOR1RIO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobGFzdC5zdG9wID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxhc3Quc3RvcCA9IEhVTkRSRURfUEVSQ0VOVDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHByb2Nlc3NTdG9wcyA9IFtdO1xyXG4gICAgICAgIHZhciBwcmV2aW91cyA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdG9wcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgc3RvcF8xID0gc3RvcHNbaV0uc3RvcDtcclxuICAgICAgICAgICAgaWYgKHN0b3BfMSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGFic29sdXRlVmFsdWUgPSBnZXRBYnNvbHV0ZVZhbHVlKHN0b3BfMSwgbGluZUxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWJzb2x1dGVWYWx1ZSA+IHByZXZpb3VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1N0b3BzLnB1c2goYWJzb2x1dGVWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzU3RvcHMucHVzaChwcmV2aW91cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwcmV2aW91cyA9IGFic29sdXRlVmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzU3RvcHMucHVzaChudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZ2FwQmVnaW4gPSBudWxsO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvY2Vzc1N0b3BzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBzdG9wXzIgPSBwcm9jZXNzU3RvcHNbaV07XHJcbiAgICAgICAgICAgIGlmIChzdG9wXzIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGlmIChnYXBCZWdpbiA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdhcEJlZ2luID0gaTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChnYXBCZWdpbiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdhcExlbmd0aCA9IGkgLSBnYXBCZWdpbjtcclxuICAgICAgICAgICAgICAgIHZhciBiZWZvcmVHYXAgPSBwcm9jZXNzU3RvcHNbZ2FwQmVnaW4gLSAxXTtcclxuICAgICAgICAgICAgICAgIHZhciBnYXBWYWx1ZSA9IChzdG9wXzIgLSBiZWZvcmVHYXApIC8gKGdhcExlbmd0aCArIDEpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgZyA9IDE7IGcgPD0gZ2FwTGVuZ3RoOyBnKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzU3RvcHNbZ2FwQmVnaW4gKyBnIC0gMV0gPSBnYXBWYWx1ZSAqIGc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBnYXBCZWdpbiA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0b3BzLm1hcChmdW5jdGlvbiAoX2EsIGkpIHtcclxuICAgICAgICAgICAgdmFyIGNvbG9yID0gX2EuY29sb3I7XHJcbiAgICAgICAgICAgIHJldHVybiB7IGNvbG9yOiBjb2xvciwgc3RvcDogTWF0aC5tYXgoTWF0aC5taW4oMSwgcHJvY2Vzc1N0b3BzW2ldIC8gbGluZUxlbmd0aCksIDApIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGdldEFuZ2xlRnJvbUNvcm5lciA9IGZ1bmN0aW9uIChjb3JuZXIsIHdpZHRoLCBoZWlnaHQpIHtcclxuICAgICAgICB2YXIgY2VudGVyWCA9IHdpZHRoIC8gMjtcclxuICAgICAgICB2YXIgY2VudGVyWSA9IGhlaWdodCAvIDI7XHJcbiAgICAgICAgdmFyIHggPSBnZXRBYnNvbHV0ZVZhbHVlKGNvcm5lclswXSwgd2lkdGgpIC0gY2VudGVyWDtcclxuICAgICAgICB2YXIgeSA9IGNlbnRlclkgLSBnZXRBYnNvbHV0ZVZhbHVlKGNvcm5lclsxXSwgaGVpZ2h0KTtcclxuICAgICAgICByZXR1cm4gKE1hdGguYXRhbjIoeSwgeCkgKyBNYXRoLlBJICogMikgJSAoTWF0aC5QSSAqIDIpO1xyXG4gICAgfTtcclxuICAgIHZhciBjYWxjdWxhdGVHcmFkaWVudERpcmVjdGlvbiA9IGZ1bmN0aW9uIChhbmdsZSwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgICAgIHZhciByYWRpYW4gPSB0eXBlb2YgYW5nbGUgPT09ICdudW1iZXInID8gYW5nbGUgOiBnZXRBbmdsZUZyb21Db3JuZXIoYW5nbGUsIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIHZhciBsaW5lTGVuZ3RoID0gTWF0aC5hYnMod2lkdGggKiBNYXRoLnNpbihyYWRpYW4pKSArIE1hdGguYWJzKGhlaWdodCAqIE1hdGguY29zKHJhZGlhbikpO1xyXG4gICAgICAgIHZhciBoYWxmV2lkdGggPSB3aWR0aCAvIDI7XHJcbiAgICAgICAgdmFyIGhhbGZIZWlnaHQgPSBoZWlnaHQgLyAyO1xyXG4gICAgICAgIHZhciBoYWxmTGluZUxlbmd0aCA9IGxpbmVMZW5ndGggLyAyO1xyXG4gICAgICAgIHZhciB5RGlmZiA9IE1hdGguc2luKHJhZGlhbiAtIE1hdGguUEkgLyAyKSAqIGhhbGZMaW5lTGVuZ3RoO1xyXG4gICAgICAgIHZhciB4RGlmZiA9IE1hdGguY29zKHJhZGlhbiAtIE1hdGguUEkgLyAyKSAqIGhhbGZMaW5lTGVuZ3RoO1xyXG4gICAgICAgIHJldHVybiBbbGluZUxlbmd0aCwgaGFsZldpZHRoIC0geERpZmYsIGhhbGZXaWR0aCArIHhEaWZmLCBoYWxmSGVpZ2h0IC0geURpZmYsIGhhbGZIZWlnaHQgKyB5RGlmZl07XHJcbiAgICB9O1xyXG4gICAgdmFyIGRpc3RhbmNlID0gZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIE1hdGguc3FydChhICogYSArIGIgKiBiKTsgfTtcclxuICAgIHZhciBmaW5kQ29ybmVyID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIHgsIHksIGNsb3Nlc3QpIHtcclxuICAgICAgICB2YXIgY29ybmVycyA9IFtbMCwgMF0sIFswLCBoZWlnaHRdLCBbd2lkdGgsIDBdLCBbd2lkdGgsIGhlaWdodF1dO1xyXG4gICAgICAgIHJldHVybiBjb3JuZXJzLnJlZHVjZShmdW5jdGlvbiAoc3RhdCwgY29ybmVyKSB7XHJcbiAgICAgICAgICAgIHZhciBjeCA9IGNvcm5lclswXSwgY3kgPSBjb3JuZXJbMV07XHJcbiAgICAgICAgICAgIHZhciBkID0gZGlzdGFuY2UoeCAtIGN4LCB5IC0gY3kpO1xyXG4gICAgICAgICAgICBpZiAoY2xvc2VzdCA/IGQgPCBzdGF0Lm9wdGltdW1EaXN0YW5jZSA6IGQgPiBzdGF0Lm9wdGltdW1EaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpbXVtQ29ybmVyOiBjb3JuZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW11bURpc3RhbmNlOiBkXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0O1xyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgb3B0aW11bURpc3RhbmNlOiBjbG9zZXN0ID8gSW5maW5pdHkgOiAtSW5maW5pdHksXHJcbiAgICAgICAgICAgIG9wdGltdW1Db3JuZXI6IG51bGxcclxuICAgICAgICB9KS5vcHRpbXVtQ29ybmVyO1xyXG4gICAgfTtcclxuICAgIHZhciBjYWxjdWxhdGVSYWRpdXMgPSBmdW5jdGlvbiAoZ3JhZGllbnQsIHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcclxuICAgICAgICB2YXIgcnggPSAwO1xyXG4gICAgICAgIHZhciByeSA9IDA7XHJcbiAgICAgICAgc3dpdGNoIChncmFkaWVudC5zaXplKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQ1NTUmFkaWFsRXh0ZW50LkNMT1NFU1RfU0lERTpcclxuICAgICAgICAgICAgICAgIC8vIFRoZSBlbmRpbmcgc2hhcGUgaXMgc2l6ZWQgc28gdGhhdCB0aGF0IGl0IGV4YWN0bHkgbWVldHMgdGhlIHNpZGUgb2YgdGhlIGdyYWRpZW50IGJveCBjbG9zZXN0IHRvIHRoZSBncmFkaWVudOKAmXMgY2VudGVyLlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHNoYXBlIGlzIGFuIGVsbGlwc2UsIGl0IGV4YWN0bHkgbWVldHMgdGhlIGNsb3Nlc3Qgc2lkZSBpbiBlYWNoIGRpbWVuc2lvbi5cclxuICAgICAgICAgICAgICAgIGlmIChncmFkaWVudC5zaGFwZSA9PT0gQ1NTUmFkaWFsU2hhcGUuQ0lSQ0xFKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcnggPSByeSA9IE1hdGgubWluKE1hdGguYWJzKHgpLCBNYXRoLmFicyh4IC0gd2lkdGgpLCBNYXRoLmFicyh5KSwgTWF0aC5hYnMoeSAtIGhlaWdodCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZ3JhZGllbnQuc2hhcGUgPT09IENTU1JhZGlhbFNoYXBlLkVMTElQU0UpIHtcclxuICAgICAgICAgICAgICAgICAgICByeCA9IE1hdGgubWluKE1hdGguYWJzKHgpLCBNYXRoLmFicyh4IC0gd2lkdGgpKTtcclxuICAgICAgICAgICAgICAgICAgICByeSA9IE1hdGgubWluKE1hdGguYWJzKHkpLCBNYXRoLmFicyh5IC0gaGVpZ2h0KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBDU1NSYWRpYWxFeHRlbnQuQ0xPU0VTVF9DT1JORVI6XHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgZW5kaW5nIHNoYXBlIGlzIHNpemVkIHNvIHRoYXQgdGhhdCBpdCBwYXNzZXMgdGhyb3VnaCB0aGUgY29ybmVyIG9mIHRoZSBncmFkaWVudCBib3ggY2xvc2VzdCB0byB0aGUgZ3JhZGllbnTigJlzIGNlbnRlci5cclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzaGFwZSBpcyBhbiBlbGxpcHNlLCB0aGUgZW5kaW5nIHNoYXBlIGlzIGdpdmVuIHRoZSBzYW1lIGFzcGVjdC1yYXRpbyBpdCB3b3VsZCBoYXZlIGlmIGNsb3Nlc3Qtc2lkZSB3ZXJlIHNwZWNpZmllZC5cclxuICAgICAgICAgICAgICAgIGlmIChncmFkaWVudC5zaGFwZSA9PT0gQ1NTUmFkaWFsU2hhcGUuQ0lSQ0xFKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcnggPSByeSA9IE1hdGgubWluKGRpc3RhbmNlKHgsIHkpLCBkaXN0YW5jZSh4LCB5IC0gaGVpZ2h0KSwgZGlzdGFuY2UoeCAtIHdpZHRoLCB5KSwgZGlzdGFuY2UoeCAtIHdpZHRoLCB5IC0gaGVpZ2h0KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChncmFkaWVudC5zaGFwZSA9PT0gQ1NTUmFkaWFsU2hhcGUuRUxMSVBTRSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbXB1dGUgdGhlIHJhdGlvIHJ5L3J4ICh3aGljaCBpcyB0byBiZSB0aGUgc2FtZSBhcyBmb3IgXCJjbG9zZXN0LXNpZGVcIilcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IE1hdGgubWluKE1hdGguYWJzKHkpLCBNYXRoLmFicyh5IC0gaGVpZ2h0KSkgLyBNYXRoLm1pbihNYXRoLmFicyh4KSwgTWF0aC5hYnMoeCAtIHdpZHRoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9hID0gZmluZENvcm5lcih3aWR0aCwgaGVpZ2h0LCB4LCB5LCB0cnVlKSwgY3ggPSBfYVswXSwgY3kgPSBfYVsxXTtcclxuICAgICAgICAgICAgICAgICAgICByeCA9IGRpc3RhbmNlKGN4IC0geCwgKGN5IC0geSkgLyBjKTtcclxuICAgICAgICAgICAgICAgICAgICByeSA9IGMgKiByeDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIENTU1JhZGlhbEV4dGVudC5GQVJUSEVTVF9TSURFOlxyXG4gICAgICAgICAgICAgICAgLy8gU2FtZSBhcyBjbG9zZXN0LXNpZGUsIGV4Y2VwdCB0aGUgZW5kaW5nIHNoYXBlIGlzIHNpemVkIGJhc2VkIG9uIHRoZSBmYXJ0aGVzdCBzaWRlKHMpXHJcbiAgICAgICAgICAgICAgICBpZiAoZ3JhZGllbnQuc2hhcGUgPT09IENTU1JhZGlhbFNoYXBlLkNJUkNMRSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJ4ID0gcnkgPSBNYXRoLm1heChNYXRoLmFicyh4KSwgTWF0aC5hYnMoeCAtIHdpZHRoKSwgTWF0aC5hYnMoeSksIE1hdGguYWJzKHkgLSBoZWlnaHQpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGdyYWRpZW50LnNoYXBlID09PSBDU1NSYWRpYWxTaGFwZS5FTExJUFNFKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcnggPSBNYXRoLm1heChNYXRoLmFicyh4KSwgTWF0aC5hYnMoeCAtIHdpZHRoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnkgPSBNYXRoLm1heChNYXRoLmFicyh5KSwgTWF0aC5hYnMoeSAtIGhlaWdodCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ1NTUmFkaWFsRXh0ZW50LkZBUlRIRVNUX0NPUk5FUjpcclxuICAgICAgICAgICAgICAgIC8vIFNhbWUgYXMgY2xvc2VzdC1jb3JuZXIsIGV4Y2VwdCB0aGUgZW5kaW5nIHNoYXBlIGlzIHNpemVkIGJhc2VkIG9uIHRoZSBmYXJ0aGVzdCBjb3JuZXIuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgc2hhcGUgaXMgYW4gZWxsaXBzZSwgdGhlIGVuZGluZyBzaGFwZSBpcyBnaXZlbiB0aGUgc2FtZSBhc3BlY3QgcmF0aW8gaXQgd291bGQgaGF2ZSBpZiBmYXJ0aGVzdC1zaWRlIHdlcmUgc3BlY2lmaWVkLlxyXG4gICAgICAgICAgICAgICAgaWYgKGdyYWRpZW50LnNoYXBlID09PSBDU1NSYWRpYWxTaGFwZS5DSVJDTEUpIHtcclxuICAgICAgICAgICAgICAgICAgICByeCA9IHJ5ID0gTWF0aC5tYXgoZGlzdGFuY2UoeCwgeSksIGRpc3RhbmNlKHgsIHkgLSBoZWlnaHQpLCBkaXN0YW5jZSh4IC0gd2lkdGgsIHkpLCBkaXN0YW5jZSh4IC0gd2lkdGgsIHkgLSBoZWlnaHQpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGdyYWRpZW50LnNoYXBlID09PSBDU1NSYWRpYWxTaGFwZS5FTExJUFNFKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29tcHV0ZSB0aGUgcmF0aW8gcnkvcnggKHdoaWNoIGlzIHRvIGJlIHRoZSBzYW1lIGFzIGZvciBcImZhcnRoZXN0LXNpZGVcIilcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IE1hdGgubWF4KE1hdGguYWJzKHkpLCBNYXRoLmFicyh5IC0gaGVpZ2h0KSkgLyBNYXRoLm1heChNYXRoLmFicyh4KSwgTWF0aC5hYnMoeCAtIHdpZHRoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9iID0gZmluZENvcm5lcih3aWR0aCwgaGVpZ2h0LCB4LCB5LCBmYWxzZSksIGN4ID0gX2JbMF0sIGN5ID0gX2JbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgcnggPSBkaXN0YW5jZShjeCAtIHgsIChjeSAtIHkpIC8gYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnkgPSBjICogcng7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZ3JhZGllbnQuc2l6ZSkpIHtcclxuICAgICAgICAgICAgcnggPSBnZXRBYnNvbHV0ZVZhbHVlKGdyYWRpZW50LnNpemVbMF0sIHdpZHRoKTtcclxuICAgICAgICAgICAgcnkgPSBncmFkaWVudC5zaXplLmxlbmd0aCA9PT0gMiA/IGdldEFic29sdXRlVmFsdWUoZ3JhZGllbnQuc2l6ZVsxXSwgaGVpZ2h0KSA6IHJ4O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW3J4LCByeV07XHJcbiAgICB9O1xuXG4gICAgdmFyIGxpbmVhckdyYWRpZW50ID0gZnVuY3Rpb24gKHRva2Vucykge1xyXG4gICAgICAgIHZhciBhbmdsZSQxID0gZGVnKDE4MCk7XHJcbiAgICAgICAgdmFyIHN0b3BzID0gW107XHJcbiAgICAgICAgcGFyc2VGdW5jdGlvbkFyZ3ModG9rZW5zKS5mb3JFYWNoKGZ1bmN0aW9uIChhcmcsIGkpIHtcclxuICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBmaXJzdFRva2VuID0gYXJnWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0VG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLklERU5UX1RPS0VOICYmIGZpcnN0VG9rZW4udmFsdWUgPT09ICd0bycpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZSQxID0gcGFyc2VOYW1lZFNpZGUoYXJnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0FuZ2xlKGZpcnN0VG9rZW4pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUkMSA9IGFuZ2xlLnBhcnNlKGZpcnN0VG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgY29sb3JTdG9wID0gcGFyc2VDb2xvclN0b3AoYXJnKTtcclxuICAgICAgICAgICAgc3RvcHMucHVzaChjb2xvclN0b3ApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB7IGFuZ2xlOiBhbmdsZSQxLCBzdG9wczogc3RvcHMsIHR5cGU6IENTU0ltYWdlVHlwZS5MSU5FQVJfR1JBRElFTlQgfTtcclxuICAgIH07XG5cbiAgICB2YXIgcHJlZml4TGluZWFyR3JhZGllbnQgPSBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgdmFyIGFuZ2xlJDEgPSBkZWcoMTgwKTtcclxuICAgICAgICB2YXIgc3RvcHMgPSBbXTtcclxuICAgICAgICBwYXJzZUZ1bmN0aW9uQXJncyh0b2tlbnMpLmZvckVhY2goZnVuY3Rpb24gKGFyZywgaSkge1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZpcnN0VG9rZW4gPSBhcmdbMF07XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RUb2tlbi50eXBlID09PSBUb2tlblR5cGUuSURFTlRfVE9LRU4gJiZcclxuICAgICAgICAgICAgICAgICAgICBbJ3RvcCcsICdsZWZ0JywgJ3JpZ2h0JywgJ2JvdHRvbSddLmluZGV4T2YoZmlyc3RUb2tlbi52YWx1ZSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUkMSA9IHBhcnNlTmFtZWRTaWRlKGFyZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNBbmdsZShmaXJzdFRva2VuKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlJDEgPSAoYW5nbGUucGFyc2UoZmlyc3RUb2tlbikgKyBkZWcoMjcwKSkgJSBkZWcoMzYwKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGNvbG9yU3RvcCA9IHBhcnNlQ29sb3JTdG9wKGFyZyk7XHJcbiAgICAgICAgICAgIHN0b3BzLnB1c2goY29sb3JTdG9wKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhbmdsZTogYW5nbGUkMSxcclxuICAgICAgICAgICAgc3RvcHM6IHN0b3BzLFxyXG4gICAgICAgICAgICB0eXBlOiBDU1NJbWFnZVR5cGUuTElORUFSX0dSQURJRU5UXHJcbiAgICAgICAgfTtcclxuICAgIH07XG5cbiAgICB2YXIgdGVzdFJhbmdlQm91bmRzID0gZnVuY3Rpb24gKGRvY3VtZW50KSB7XHJcbiAgICAgICAgdmFyIFRFU1RfSEVJR0hUID0gMTIzO1xyXG4gICAgICAgIGlmIChkb2N1bWVudC5jcmVhdGVSYW5nZSkge1xyXG4gICAgICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICAgICAgICBpZiAocmFuZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGVzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib3VuZHRlc3QnKTtcclxuICAgICAgICAgICAgICAgIHRlc3RFbGVtZW50LnN0eWxlLmhlaWdodCA9IFRFU1RfSEVJR0hUICsgXCJweFwiO1xyXG4gICAgICAgICAgICAgICAgdGVzdEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlc3RFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIHJhbmdlLnNlbGVjdE5vZGUodGVzdEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJhbmdlQm91bmRzID0gcmFuZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmFuZ2VIZWlnaHQgPSBNYXRoLnJvdW5kKHJhbmdlQm91bmRzLmhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRlc3RFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIGlmIChyYW5nZUhlaWdodCA9PT0gVEVTVF9IRUlHSFQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgdmFyIHRlc3RDT1JTID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdHlwZW9mIG5ldyBJbWFnZSgpLmNyb3NzT3JpZ2luICE9PSAndW5kZWZpbmVkJzsgfTtcclxuICAgIHZhciB0ZXN0UmVzcG9uc2VUeXBlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdHlwZW9mIG5ldyBYTUxIdHRwUmVxdWVzdCgpLnJlc3BvbnNlVHlwZSA9PT0gJ3N0cmluZyc7IH07XHJcbiAgICB2YXIgdGVzdFNWRyA9IGZ1bmN0aW9uIChkb2N1bWVudCkge1xyXG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIGlmICghY3R4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9zdmcreG1sLDxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48L3N2Zz5cIjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XHJcbiAgICAgICAgICAgIGNhbnZhcy50b0RhdGFVUkwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcbiAgICB2YXIgaXNHcmVlblBpeGVsID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gZGF0YVswXSA9PT0gMCAmJiBkYXRhWzFdID09PSAyNTUgJiYgZGF0YVsyXSA9PT0gMCAmJiBkYXRhWzNdID09PSAyNTU7XHJcbiAgICB9O1xyXG4gICAgdmFyIHRlc3RGb3JlaWduT2JqZWN0ID0gZnVuY3Rpb24gKGRvY3VtZW50KSB7XHJcbiAgICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgIHZhciBzaXplID0gMTAwO1xyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHNpemU7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHNpemU7XHJcbiAgICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIGlmICghY3R4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiKDAsIDI1NSwgMCknO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcclxuICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgdmFyIGdyZWVuSW1hZ2VTcmMgPSBjYW52YXMudG9EYXRhVVJMKCk7XHJcbiAgICAgICAgaW1nLnNyYyA9IGdyZWVuSW1hZ2VTcmM7XHJcbiAgICAgICAgdmFyIHN2ZyA9IGNyZWF0ZUZvcmVpZ25PYmplY3RTVkcoc2l6ZSwgc2l6ZSwgMCwgMCwgaW1nKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3JlZCc7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHNpemUsIHNpemUpO1xyXG4gICAgICAgIHJldHVybiBsb2FkU2VyaWFsaXplZFNWRyhzdmcpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChpbWcpIHtcclxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgc2l6ZSwgc2l6ZSkuZGF0YTtcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdyZWQnO1xyXG4gICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgc2l6ZSwgc2l6ZSk7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBncmVlbkltYWdlU3JjICsgXCIpXCI7XHJcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuaGVpZ2h0ID0gc2l6ZSArIFwicHhcIjtcclxuICAgICAgICAgICAgLy8gRmlyZWZveCA1NSBkb2VzIG5vdCByZW5kZXIgaW5saW5lIDxpbWcgLz4gdGFnc1xyXG4gICAgICAgICAgICByZXR1cm4gaXNHcmVlblBpeGVsKGRhdGEpXHJcbiAgICAgICAgICAgICAgICA/IGxvYWRTZXJpYWxpemVkU1ZHKGNyZWF0ZUZvcmVpZ25PYmplY3RTVkcoc2l6ZSwgc2l6ZSwgMCwgMCwgbm9kZSkpXHJcbiAgICAgICAgICAgICAgICA6IFByb21pc2UucmVqZWN0KGZhbHNlKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW1nKSB7XHJcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcclxuICAgICAgICAgICAgLy8gRWRnZSBkb2VzIG5vdCByZW5kZXIgYmFja2dyb3VuZC1pbWFnZXNcclxuICAgICAgICAgICAgcmV0dXJuIGlzR3JlZW5QaXhlbChjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHNpemUsIHNpemUpLmRhdGEpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGNyZWF0ZUZvcmVpZ25PYmplY3RTVkcgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgeCwgeSwgbm9kZSkge1xyXG4gICAgICAgIHZhciB4bWxucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XHJcbiAgICAgICAgdmFyIHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh4bWxucywgJ3N2ZycpO1xyXG4gICAgICAgIHZhciBmb3JlaWduT2JqZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHhtbG5zLCAnZm9yZWlnbk9iamVjdCcpO1xyXG4gICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGVOUyhudWxsLCAnd2lkdGgnLCB3aWR0aC50b1N0cmluZygpKTtcclxuICAgICAgICBzdmcuc2V0QXR0cmlidXRlTlMobnVsbCwgJ2hlaWdodCcsIGhlaWdodC50b1N0cmluZygpKTtcclxuICAgICAgICBmb3JlaWduT2JqZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsICd3aWR0aCcsICcxMDAlJyk7XHJcbiAgICAgICAgZm9yZWlnbk9iamVjdC5zZXRBdHRyaWJ1dGVOUyhudWxsLCAnaGVpZ2h0JywgJzEwMCUnKTtcclxuICAgICAgICBmb3JlaWduT2JqZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsICd4JywgeC50b1N0cmluZygpKTtcclxuICAgICAgICBmb3JlaWduT2JqZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsICd5JywgeS50b1N0cmluZygpKTtcclxuICAgICAgICBmb3JlaWduT2JqZWN0LnNldEF0dHJpYnV0ZU5TKG51bGwsICdleHRlcm5hbFJlc291cmNlc1JlcXVpcmVkJywgJ3RydWUnKTtcclxuICAgICAgICBzdmcuYXBwZW5kQ2hpbGQoZm9yZWlnbk9iamVjdCk7XHJcbiAgICAgICAgZm9yZWlnbk9iamVjdC5hcHBlbmRDaGlsZChub2RlKTtcclxuICAgICAgICByZXR1cm4gc3ZnO1xyXG4gICAgfTtcclxuICAgIHZhciBsb2FkU2VyaWFsaXplZFNWRyA9IGZ1bmN0aW9uIChzdmcpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiByZXNvbHZlKGltZyk7IH07XHJcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gcmVqZWN0O1xyXG4gICAgICAgICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudChuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKHN2ZykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHZhciBGRUFUVVJFUyA9IHtcclxuICAgICAgICBnZXQgU1VQUE9SVF9SQU5HRV9CT1VORFMoKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRlc3RSYW5nZUJvdW5kcyhkb2N1bWVudCk7XHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGRUFUVVJFUywgJ1NVUFBPUlRfUkFOR0VfQk9VTkRTJywgeyB2YWx1ZTogdmFsdWUgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldCBTVVBQT1JUX1NWR19EUkFXSU5HKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0ZXN0U1ZHKGRvY3VtZW50KTtcclxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZFQVRVUkVTLCAnU1VQUE9SVF9TVkdfRFJBV0lORycsIHsgdmFsdWU6IHZhbHVlIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXQgU1VQUE9SVF9GT1JFSUdOT0JKRUNUX0RSQVdJTkcoKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHR5cGVvZiBBcnJheS5mcm9tID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB3aW5kb3cuZmV0Y2ggPT09ICdmdW5jdGlvbidcclxuICAgICAgICAgICAgICAgID8gdGVzdEZvcmVpZ25PYmplY3QoZG9jdW1lbnQpXHJcbiAgICAgICAgICAgICAgICA6IFByb21pc2UucmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShGRUFUVVJFUywgJ1NVUFBPUlRfRk9SRUlHTk9CSkVDVF9EUkFXSU5HJywgeyB2YWx1ZTogdmFsdWUgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldCBTVVBQT1JUX0NPUlNfSU1BR0VTKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0ZXN0Q09SUygpO1xyXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRkVBVFVSRVMsICdTVVBQT1JUX0NPUlNfSU1BR0VTJywgeyB2YWx1ZTogdmFsdWUgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldCBTVVBQT1JUX1JFU1BPTlNFX1RZUEUoKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRlc3RSZXNwb25zZVR5cGUoKTtcclxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZFQVRVUkVTLCAnU1VQUE9SVF9SRVNQT05TRV9UWVBFJywgeyB2YWx1ZTogdmFsdWUgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldCBTVVBQT1JUX0NPUlNfWEhSKCkge1xyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSAnd2l0aENyZWRlbnRpYWxzJyBpbiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZFQVRVUkVTLCAnU1VQUE9SVF9DT1JTX1hIUicsIHsgdmFsdWU6IHZhbHVlIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBMb2dnZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gTG9nZ2VyKF9hKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IF9hLmlkLCBlbmFibGVkID0gX2EuZW5hYmxlZDtcclxuICAgICAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgICAgICB0aGlzLmVuYWJsZWQgPSBlbmFibGVkO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gRGF0ZS5ub3coKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICAgICAgICBMb2dnZXIucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgdHlwZW9mIGNvbnNvbGUuZGVidWcgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcuYXBwbHkoY29uc29sZSwgW3RoaXMuaWQsIHRoaXMuZ2V0VGltZSgpICsgXCJtc1wiXS5jb25jYXQoYXJncykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmZvLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBMb2dnZXIucHJvdG90eXBlLmdldFRpbWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5zdGFydDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIExvZ2dlci5jcmVhdGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgICAgICBMb2dnZXIuaW5zdGFuY2VzW29wdGlvbnMuaWRdID0gbmV3IExvZ2dlcihvcHRpb25zKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIExvZ2dlci5kZXN0cm95ID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBMb2dnZXIuaW5zdGFuY2VzW2lkXTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIExvZ2dlci5nZXRJbnN0YW5jZSA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBMb2dnZXIuaW5zdGFuY2VzW2lkXTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnN0YW5jZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGxvZ2dlciBpbnN0YW5jZSBmb3VuZCB3aXRoIGlkIFwiICsgaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgICAgICAgTG9nZ2VyLnByb3RvdHlwZS5pbmZvID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgdHlwZW9mIGNvbnNvbGUuaW5mbyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvLmFwcGx5KGNvbnNvbGUsIFt0aGlzLmlkLCB0aGlzLmdldFRpbWUoKSArIFwibXNcIl0uY29uY2F0KGFyZ3MpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICAgICAgICBMb2dnZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkoY29uc29sZSwgW3RoaXMuaWQsIHRoaXMuZ2V0VGltZSgpICsgXCJtc1wiXS5jb25jYXQoYXJncykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmZvLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBMb2dnZXIuaW5zdGFuY2VzID0ge307XHJcbiAgICAgICAgcmV0dXJuIExvZ2dlcjtcclxuICAgIH0oKSk7XG5cbiAgICB2YXIgQ2FjaGVTdG9yYWdlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIENhY2hlU3RvcmFnZSgpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgQ2FjaGVTdG9yYWdlLmNyZWF0ZSA9IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoQ2FjaGVTdG9yYWdlLl9jYWNoZXNbbmFtZV0gPSBuZXcgQ2FjaGUobmFtZSwgb3B0aW9ucykpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FjaGVTdG9yYWdlLmRlc3Ryb3kgPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgICAgICBkZWxldGUgQ2FjaGVTdG9yYWdlLl9jYWNoZXNbbmFtZV07XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYWNoZVN0b3JhZ2Uub3BlbiA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBjYWNoZSA9IENhY2hlU3RvcmFnZS5fY2FjaGVzW25hbWVdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhY2hlICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhY2hlIHdpdGgga2V5IFxcXCJcIiArIG5hbWUgKyBcIlxcXCIgbm90IGZvdW5kXCIpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FjaGVTdG9yYWdlLmdldE9yaWdpbiA9IGZ1bmN0aW9uICh1cmwpIHtcclxuICAgICAgICAgICAgdmFyIGxpbmsgPSBDYWNoZVN0b3JhZ2UuX2xpbms7XHJcbiAgICAgICAgICAgIGlmICghbGluaykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdhYm91dDpibGFuayc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGluay5ocmVmID0gdXJsO1xyXG4gICAgICAgICAgICBsaW5rLmhyZWYgPSBsaW5rLmhyZWY7IC8vIElFOSwgTE9MISAtIGh0dHA6Ly9qc2ZpZGRsZS5uZXQvbmlrbGFzdmgvMmU0OGIvXHJcbiAgICAgICAgICAgIHJldHVybiBsaW5rLnByb3RvY29sICsgbGluay5ob3N0bmFtZSArIGxpbmsucG9ydDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIENhY2hlU3RvcmFnZS5pc1NhbWVPcmlnaW4gPSBmdW5jdGlvbiAoc3JjKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBDYWNoZVN0b3JhZ2UuZ2V0T3JpZ2luKHNyYykgPT09IENhY2hlU3RvcmFnZS5fb3JpZ2luO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FjaGVTdG9yYWdlLnNldENvbnRleHQgPSBmdW5jdGlvbiAod2luZG93KSB7XHJcbiAgICAgICAgICAgIENhY2hlU3RvcmFnZS5fbGluayA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgICAgIENhY2hlU3RvcmFnZS5fb3JpZ2luID0gQ2FjaGVTdG9yYWdlLmdldE9yaWdpbih3aW5kb3cubG9jYXRpb24uaHJlZik7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYWNoZVN0b3JhZ2UuZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50ID0gQ2FjaGVTdG9yYWdlLl9jdXJyZW50O1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gY2FjaGUgaW5zdGFuY2UgYXR0YWNoZWRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYWNoZVN0b3JhZ2UuYXR0YWNoSW5zdGFuY2UgPSBmdW5jdGlvbiAoY2FjaGUpIHtcclxuICAgICAgICAgICAgQ2FjaGVTdG9yYWdlLl9jdXJyZW50ID0gY2FjaGU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYWNoZVN0b3JhZ2UuZGV0YWNoSW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIENhY2hlU3RvcmFnZS5fY3VycmVudCA9IG51bGw7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYWNoZVN0b3JhZ2UuX2NhY2hlcyA9IHt9O1xyXG4gICAgICAgIENhY2hlU3RvcmFnZS5fb3JpZ2luID0gJ2Fib3V0OmJsYW5rJztcclxuICAgICAgICBDYWNoZVN0b3JhZ2UuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIHJldHVybiBDYWNoZVN0b3JhZ2U7XHJcbiAgICB9KCkpO1xyXG4gICAgdmFyIENhY2hlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIENhY2hlKGlkLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIENhY2hlLnByb3RvdHlwZS5hZGRJbWFnZSA9IGZ1bmN0aW9uIChzcmMpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5oYXMoc3JjKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNCbG9iSW1hZ2Uoc3JjKSB8fCBpc1JlbmRlcmFibGUoc3JjKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVbc3JjXSA9IHRoaXMubG9hZEltYWdlKHNyYyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gICAgICAgIENhY2hlLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uIChzcmMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlW3NyY107XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYWNoZS5wcm90b3R5cGUubG9hZEltYWdlID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXNTYW1lT3JpZ2luLCB1c2VDT1JTLCB1c2VQcm94eSwgc3JjO1xyXG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2FtZU9yaWdpbiA9IENhY2hlU3RvcmFnZS5pc1NhbWVPcmlnaW4oa2V5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZUNPUlMgPSAhaXNJbmxpbmVJbWFnZShrZXkpICYmIHRoaXMuX29wdGlvbnMudXNlQ09SUyA9PT0gdHJ1ZSAmJiBGRUFUVVJFUy5TVVBQT1JUX0NPUlNfSU1BR0VTICYmICFpc1NhbWVPcmlnaW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VQcm94eSA9ICFpc0lubGluZUltYWdlKGtleSkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhaXNTYW1lT3JpZ2luICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHRoaXMuX29wdGlvbnMucHJveHkgPT09ICdzdHJpbmcnICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRkVBVFVSRVMuU1VQUE9SVF9DT1JTX1hIUiAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICF1c2VDT1JTO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1NhbWVPcmlnaW4gJiYgdGhpcy5fb3B0aW9ucy5hbGxvd1RhaW50ID09PSBmYWxzZSAmJiAhaXNJbmxpbmVJbWFnZShrZXkpICYmICF1c2VQcm94eSAmJiAhdXNlQ09SUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYyA9IGtleTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdXNlUHJveHkpIHJldHVybiBbMyAvKmJyZWFrKi8sIDJdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5wcm94eShzcmMpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjID0gX2Euc2VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2EubGFiZWwgPSAyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2UodGhpcy5pZCkuZGVidWcoXCJBZGRlZCBpbWFnZSBcIiArIGtleS5zdWJzdHJpbmcoMCwgMjU2KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlc29sdmUoaW1nKTsgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nLm9uZXJyb3IgPSByZWplY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaW9zIHNhZmFyaSAxMC4zIHRhaW50cyBjYW52YXMgd2l0aCBkYXRhIHVybHMgdW5sZXNzIGNyb3NzT3JpZ2luIGlzIHNldCB0byBhbm9ueW1vdXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzSW5saW5lQmFzZTY0SW1hZ2Uoc3JjKSB8fCB1c2VDT1JTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcuY3Jvc3NPcmlnaW4gPSAnYW5vbnltb3VzJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcuc3JjID0gc3JjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nLmNvbXBsZXRlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbmxpbmUgWE1MIGltYWdlcyBtYXkgZmFpbCB0byBwYXJzZSwgdGhyb3dpbmcgYW4gRXJyb3IgbGF0ZXIgb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVzb2x2ZShpbWcpOyB9LCA1MDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5fb3B0aW9ucy5pbWFnZVRpbWVvdXQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlamVjdChcIlRpbWVkIG91dCAoXCIgKyBfdGhpcy5fb3B0aW9ucy5pbWFnZVRpbWVvdXQgKyBcIm1zKSBsb2FkaW5nIGltYWdlXCIpOyB9LCBfdGhpcy5fb3B0aW9ucy5pbWFnZVRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6IHJldHVybiBbMiAvKnJldHVybiovLCBfYS5zZW50KCldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIENhY2hlLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5fY2FjaGVba2V5XSAhPT0gJ3VuZGVmaW5lZCc7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYWNoZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShPYmplY3Qua2V5cyh0aGlzLl9jYWNoZSkpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FjaGUucHJvdG90eXBlLnByb3h5ID0gZnVuY3Rpb24gKHNyYykge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgcHJveHkgPSB0aGlzLl9vcHRpb25zLnByb3h5O1xyXG4gICAgICAgICAgICBpZiAoIXByb3h5KSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHByb3h5IGRlZmluZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIga2V5ID0gc3JjLnN1YnN0cmluZygwLCAyNTYpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlVHlwZSA9IEZFQVRVUkVTLlNVUFBPUlRfUkVTUE9OU0VfVFlQRSA/ICdibG9iJyA6ICd0ZXh0JztcclxuICAgICAgICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VUeXBlID09PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWFkZXJfMSA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkZXJfMS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVzb2x2ZShyZWFkZXJfMS5yZXN1bHQpOyB9LCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkZXJfMS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uIChlKSB7IHJldHVybiByZWplY3QoZSk7IH0sIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRlcl8xLnJlYWRBc0RhdGFVUkwoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFwiRmFpbGVkIHRvIHByb3h5IHJlc291cmNlIFwiICsga2V5ICsgXCIgd2l0aCBzdGF0dXMgY29kZSBcIiArIHhoci5zdGF0dXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB4aHIub25lcnJvciA9IHJlamVjdDtcclxuICAgICAgICAgICAgICAgIHhoci5vcGVuKCdHRVQnLCBwcm94eSArIFwiP3VybD1cIiArIGVuY29kZVVSSUNvbXBvbmVudChzcmMpICsgXCImcmVzcG9uc2VUeXBlPVwiICsgcmVzcG9uc2VUeXBlKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZVR5cGUgIT09ICd0ZXh0JyAmJiB4aHIgaW5zdGFuY2VvZiBYTUxIdHRwUmVxdWVzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSByZXNwb25zZVR5cGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMuX29wdGlvbnMuaW1hZ2VUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVvdXRfMSA9IF90aGlzLl9vcHRpb25zLmltYWdlVGltZW91dDtcclxuICAgICAgICAgICAgICAgICAgICB4aHIudGltZW91dCA9IHRpbWVvdXRfMTtcclxuICAgICAgICAgICAgICAgICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVqZWN0KFwiVGltZWQgb3V0IChcIiArIHRpbWVvdXRfMSArIFwibXMpIHByb3h5aW5nIFwiICsga2V5KTsgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHhoci5zZW5kKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIENhY2hlO1xyXG4gICAgfSgpKTtcclxuICAgIHZhciBJTkxJTkVfU1ZHID0gL15kYXRhOmltYWdlXFwvc3ZnXFwreG1sL2k7XHJcbiAgICB2YXIgSU5MSU5FX0JBU0U2NCA9IC9eZGF0YTppbWFnZVxcLy4qO2Jhc2U2NCwvaTtcclxuICAgIHZhciBJTkxJTkVfSU1HID0gL15kYXRhOmltYWdlXFwvLiovaTtcclxuICAgIHZhciBpc1JlbmRlcmFibGUgPSBmdW5jdGlvbiAoc3JjKSB7IHJldHVybiBGRUFUVVJFUy5TVVBQT1JUX1NWR19EUkFXSU5HIHx8ICFpc1NWRyhzcmMpOyB9O1xyXG4gICAgdmFyIGlzSW5saW5lSW1hZ2UgPSBmdW5jdGlvbiAoc3JjKSB7IHJldHVybiBJTkxJTkVfSU1HLnRlc3Qoc3JjKTsgfTtcclxuICAgIHZhciBpc0lubGluZUJhc2U2NEltYWdlID0gZnVuY3Rpb24gKHNyYykgeyByZXR1cm4gSU5MSU5FX0JBU0U2NC50ZXN0KHNyYyk7IH07XHJcbiAgICB2YXIgaXNCbG9iSW1hZ2UgPSBmdW5jdGlvbiAoc3JjKSB7IHJldHVybiBzcmMuc3Vic3RyKDAsIDQpID09PSAnYmxvYic7IH07XHJcbiAgICB2YXIgaXNTVkcgPSBmdW5jdGlvbiAoc3JjKSB7IHJldHVybiBzcmMuc3Vic3RyKC0zKS50b0xvd2VyQ2FzZSgpID09PSAnc3ZnJyB8fCBJTkxJTkVfU1ZHLnRlc3Qoc3JjKTsgfTtcblxuICAgIHZhciB3ZWJraXRHcmFkaWVudCA9IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICAgICAgICB2YXIgYW5nbGUgPSBkZWcoMTgwKTtcclxuICAgICAgICB2YXIgc3RvcHMgPSBbXTtcclxuICAgICAgICB2YXIgdHlwZSA9IENTU0ltYWdlVHlwZS5MSU5FQVJfR1JBRElFTlQ7XHJcbiAgICAgICAgdmFyIHNoYXBlID0gQ1NTUmFkaWFsU2hhcGUuQ0lSQ0xFO1xyXG4gICAgICAgIHZhciBzaXplID0gQ1NTUmFkaWFsRXh0ZW50LkZBUlRIRVNUX0NPUk5FUjtcclxuICAgICAgICB2YXIgcG9zaXRpb24gPSBbXTtcclxuICAgICAgICBwYXJzZUZ1bmN0aW9uQXJncyh0b2tlbnMpLmZvckVhY2goZnVuY3Rpb24gKGFyZywgaSkge1xyXG4gICAgICAgICAgICB2YXIgZmlyc3RUb2tlbiA9IGFyZ1swXTtcclxuICAgICAgICAgICAgaWYgKGkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc0lkZW50VG9rZW4oZmlyc3RUb2tlbikgJiYgZmlyc3RUb2tlbi52YWx1ZSA9PT0gJ2xpbmVhcicpIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gQ1NTSW1hZ2VUeXBlLkxJTkVBUl9HUkFESUVOVDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0lkZW50VG9rZW4oZmlyc3RUb2tlbikgJiYgZmlyc3RUb2tlbi52YWx1ZSA9PT0gJ3JhZGlhbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gQ1NTSW1hZ2VUeXBlLlJBRElBTF9HUkFESUVOVDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZpcnN0VG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkZVTkNUSU9OKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RUb2tlbi5uYW1lID09PSAnZnJvbScpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY29sb3IkMSA9IGNvbG9yLnBhcnNlKGZpcnN0VG9rZW4udmFsdWVzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICBzdG9wcy5wdXNoKHsgc3RvcDogWkVST19MRU5HVEgsIGNvbG9yOiBjb2xvciQxIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmlyc3RUb2tlbi5uYW1lID09PSAndG8nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbG9yJDEgPSBjb2xvci5wYXJzZShmaXJzdFRva2VuLnZhbHVlc1swXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RvcHMucHVzaCh7IHN0b3A6IEhVTkRSRURfUEVSQ0VOVCwgY29sb3I6IGNvbG9yJDEgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmaXJzdFRva2VuLm5hbWUgPT09ICdjb2xvci1zdG9wJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBmaXJzdFRva2VuLnZhbHVlcy5maWx0ZXIobm9uRnVuY3Rpb25BcmdTZXBhcmF0b3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZXMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2xvciQxID0gY29sb3IucGFyc2UodmFsdWVzWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3BfMSA9IHZhbHVlc1swXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzTnVtYmVyVG9rZW4oc3RvcF8xKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcDogeyB0eXBlOiBUb2tlblR5cGUuUEVSQ0VOVEFHRV9UT0tFTiwgbnVtYmVyOiBzdG9wXzEubnVtYmVyICogMTAwLCBmbGFnczogc3RvcF8xLmZsYWdzIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IGNvbG9yJDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IENTU0ltYWdlVHlwZS5MSU5FQVJfR1JBRElFTlRcclxuICAgICAgICAgICAgPyB7XHJcbiAgICAgICAgICAgICAgICBhbmdsZTogKGFuZ2xlICsgZGVnKDE4MCkpICUgZGVnKDM2MCksXHJcbiAgICAgICAgICAgICAgICBzdG9wczogc3RvcHMsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgOiB7IHNpemU6IHNpemUsIHNoYXBlOiBzaGFwZSwgc3RvcHM6IHN0b3BzLCBwb3NpdGlvbjogcG9zaXRpb24sIHR5cGU6IHR5cGUgfTtcclxuICAgIH07XG5cbiAgICB2YXIgQ0xPU0VTVF9TSURFID0gJ2Nsb3Nlc3Qtc2lkZSc7XHJcbiAgICB2YXIgRkFSVEhFU1RfU0lERSA9ICdmYXJ0aGVzdC1zaWRlJztcclxuICAgIHZhciBDTE9TRVNUX0NPUk5FUiA9ICdjbG9zZXN0LWNvcm5lcic7XHJcbiAgICB2YXIgRkFSVEhFU1RfQ09STkVSID0gJ2ZhcnRoZXN0LWNvcm5lcic7XHJcbiAgICB2YXIgQ0lSQ0xFID0gJ2NpcmNsZSc7XHJcbiAgICB2YXIgRUxMSVBTRSA9ICdlbGxpcHNlJztcclxuICAgIHZhciBDT1ZFUiA9ICdjb3Zlcic7XHJcbiAgICB2YXIgQ09OVEFJTiA9ICdjb250YWluJztcclxuICAgIHZhciByYWRpYWxHcmFkaWVudCA9IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICAgICAgICB2YXIgc2hhcGUgPSBDU1NSYWRpYWxTaGFwZS5DSVJDTEU7XHJcbiAgICAgICAgdmFyIHNpemUgPSBDU1NSYWRpYWxFeHRlbnQuRkFSVEhFU1RfQ09STkVSO1xyXG4gICAgICAgIHZhciBzdG9wcyA9IFtdO1xyXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IFtdO1xyXG4gICAgICAgIHBhcnNlRnVuY3Rpb25BcmdzKHRva2VucykuZm9yRWFjaChmdW5jdGlvbiAoYXJnLCBpKSB7XHJcbiAgICAgICAgICAgIHZhciBpc0NvbG9yU3RvcCA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXNBdFBvc2l0aW9uXzEgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlzQ29sb3JTdG9wID0gYXJnLnJlZHVjZShmdW5jdGlvbiAoYWNjLCB0b2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0F0UG9zaXRpb25fMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNJZGVudFRva2VuKHRva2VuKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0b2tlbi52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NlbnRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnB1c2goRklGVFlfUEVSQ0VOVCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24ucHVzaChaRVJPX0xFTkdUSCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnB1c2goSFVORFJFRF9QRVJDRU5UKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0xlbmd0aFBlcmNlbnRhZ2UodG9rZW4pIHx8IGlzTGVuZ3RoKHRva2VuKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24ucHVzaCh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNJZGVudFRva2VuKHRva2VuKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIENJUkNMRTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFwZSA9IENTU1JhZGlhbFNoYXBlLkNJUkNMRTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIEVMTElQU0U6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcGUgPSBDU1NSYWRpYWxTaGFwZS5FTExJUFNFO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2F0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0F0UG9zaXRpb25fMSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBDTE9TRVNUX1NJREU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IENTU1JhZGlhbEV4dGVudC5DTE9TRVNUX1NJREU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBDT1ZFUjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgRkFSVEhFU1RfU0lERTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplID0gQ1NTUmFkaWFsRXh0ZW50LkZBUlRIRVNUX1NJREU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBDT05UQUlOOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBDTE9TRVNUX0NPUk5FUjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplID0gQ1NTUmFkaWFsRXh0ZW50LkNMT1NFU1RfQ09STkVSO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgRkFSVEhFU1RfQ09STkVSOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemUgPSBDU1NSYWRpYWxFeHRlbnQuRkFSVEhFU1RfQ09STkVSO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0xlbmd0aCh0b2tlbikgfHwgaXNMZW5ndGhQZXJjZW50YWdlKHRva2VuKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoc2l6ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemUgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplLnB1c2godG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XHJcbiAgICAgICAgICAgICAgICB9LCBpc0NvbG9yU3RvcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzQ29sb3JTdG9wKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sb3JTdG9wID0gcGFyc2VDb2xvclN0b3AoYXJnKTtcclxuICAgICAgICAgICAgICAgIHN0b3BzLnB1c2goY29sb3JTdG9wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB7IHNpemU6IHNpemUsIHNoYXBlOiBzaGFwZSwgc3RvcHM6IHN0b3BzLCBwb3NpdGlvbjogcG9zaXRpb24sIHR5cGU6IENTU0ltYWdlVHlwZS5SQURJQUxfR1JBRElFTlQgfTtcclxuICAgIH07XG5cbiAgICB2YXIgcHJlZml4UmFkaWFsR3JhZGllbnQgPSBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgdmFyIHNoYXBlID0gQ1NTUmFkaWFsU2hhcGUuQ0lSQ0xFO1xyXG4gICAgICAgIHZhciBzaXplID0gQ1NTUmFkaWFsRXh0ZW50LkZBUlRIRVNUX0NPUk5FUjtcclxuICAgICAgICB2YXIgc3RvcHMgPSBbXTtcclxuICAgICAgICB2YXIgcG9zaXRpb24gPSBbXTtcclxuICAgICAgICBwYXJzZUZ1bmN0aW9uQXJncyh0b2tlbnMpLmZvckVhY2goZnVuY3Rpb24gKGFyZywgaSkge1xyXG4gICAgICAgICAgICB2YXIgaXNDb2xvclN0b3AgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaXNDb2xvclN0b3AgPSBhcmcucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHRva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSWRlbnRUb2tlbih0b2tlbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0b2tlbi52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2VudGVyJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5wdXNoKEZJRlRZX1BFUkNFTlQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbi5wdXNoKFpFUk9fTEVOR1RIKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnB1c2goSFVORFJFRF9QRVJDRU5UKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNMZW5ndGhQZXJjZW50YWdlKHRva2VuKSB8fCBpc0xlbmd0aCh0b2tlbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24ucHVzaCh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcclxuICAgICAgICAgICAgICAgIH0sIGlzQ29sb3JTdG9wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBpc0NvbG9yU3RvcCA9IGFyZy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgdG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNJZGVudFRva2VuKHRva2VuKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIENJUkNMRTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFwZSA9IENTU1JhZGlhbFNoYXBlLkNJUkNMRTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIEVMTElQU0U6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcGUgPSBDU1NSYWRpYWxTaGFwZS5FTExJUFNFO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgQ09OVEFJTjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgQ0xPU0VTVF9TSURFOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemUgPSBDU1NSYWRpYWxFeHRlbnQuQ0xPU0VTVF9TSURFO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgRkFSVEhFU1RfU0lERTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplID0gQ1NTUmFkaWFsRXh0ZW50LkZBUlRIRVNUX1NJREU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBDTE9TRVNUX0NPUk5FUjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplID0gQ1NTUmFkaWFsRXh0ZW50LkNMT1NFU1RfQ09STkVSO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgQ09WRVI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIEZBUlRIRVNUX0NPUk5FUjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplID0gQ1NTUmFkaWFsRXh0ZW50LkZBUlRIRVNUX0NPUk5FUjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNMZW5ndGgodG9rZW4pIHx8IGlzTGVuZ3RoUGVyY2VudGFnZSh0b2tlbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHNpemUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZS5wdXNoKHRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xyXG4gICAgICAgICAgICAgICAgfSwgaXNDb2xvclN0b3ApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc0NvbG9yU3RvcCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yU3RvcCA9IHBhcnNlQ29sb3JTdG9wKGFyZyk7XHJcbiAgICAgICAgICAgICAgICBzdG9wcy5wdXNoKGNvbG9yU3RvcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4geyBzaXplOiBzaXplLCBzaGFwZTogc2hhcGUsIHN0b3BzOiBzdG9wcywgcG9zaXRpb246IHBvc2l0aW9uLCB0eXBlOiBDU1NJbWFnZVR5cGUuUkFESUFMX0dSQURJRU5UIH07XHJcbiAgICB9O1xuXG4gICAgdmFyIENTU0ltYWdlVHlwZTtcclxuICAgIChmdW5jdGlvbiAoQ1NTSW1hZ2VUeXBlKSB7XHJcbiAgICAgICAgQ1NTSW1hZ2VUeXBlW0NTU0ltYWdlVHlwZVtcIlVSTFwiXSA9IDBdID0gXCJVUkxcIjtcclxuICAgICAgICBDU1NJbWFnZVR5cGVbQ1NTSW1hZ2VUeXBlW1wiTElORUFSX0dSQURJRU5UXCJdID0gMV0gPSBcIkxJTkVBUl9HUkFESUVOVFwiO1xyXG4gICAgICAgIENTU0ltYWdlVHlwZVtDU1NJbWFnZVR5cGVbXCJSQURJQUxfR1JBRElFTlRcIl0gPSAyXSA9IFwiUkFESUFMX0dSQURJRU5UXCI7XHJcbiAgICB9KShDU1NJbWFnZVR5cGUgfHwgKENTU0ltYWdlVHlwZSA9IHt9KSk7XHJcbiAgICB2YXIgaXNMaW5lYXJHcmFkaWVudCA9IGZ1bmN0aW9uIChiYWNrZ3JvdW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tncm91bmQudHlwZSA9PT0gQ1NTSW1hZ2VUeXBlLkxJTkVBUl9HUkFESUVOVDtcclxuICAgIH07XHJcbiAgICB2YXIgaXNSYWRpYWxHcmFkaWVudCA9IGZ1bmN0aW9uIChiYWNrZ3JvdW5kKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhY2tncm91bmQudHlwZSA9PT0gQ1NTSW1hZ2VUeXBlLlJBRElBTF9HUkFESUVOVDtcclxuICAgIH07XHJcbiAgICB2YXIgQ1NTUmFkaWFsU2hhcGU7XHJcbiAgICAoZnVuY3Rpb24gKENTU1JhZGlhbFNoYXBlKSB7XHJcbiAgICAgICAgQ1NTUmFkaWFsU2hhcGVbQ1NTUmFkaWFsU2hhcGVbXCJDSVJDTEVcIl0gPSAwXSA9IFwiQ0lSQ0xFXCI7XHJcbiAgICAgICAgQ1NTUmFkaWFsU2hhcGVbQ1NTUmFkaWFsU2hhcGVbXCJFTExJUFNFXCJdID0gMV0gPSBcIkVMTElQU0VcIjtcclxuICAgIH0pKENTU1JhZGlhbFNoYXBlIHx8IChDU1NSYWRpYWxTaGFwZSA9IHt9KSk7XHJcbiAgICB2YXIgQ1NTUmFkaWFsRXh0ZW50O1xyXG4gICAgKGZ1bmN0aW9uIChDU1NSYWRpYWxFeHRlbnQpIHtcclxuICAgICAgICBDU1NSYWRpYWxFeHRlbnRbQ1NTUmFkaWFsRXh0ZW50W1wiQ0xPU0VTVF9TSURFXCJdID0gMF0gPSBcIkNMT1NFU1RfU0lERVwiO1xyXG4gICAgICAgIENTU1JhZGlhbEV4dGVudFtDU1NSYWRpYWxFeHRlbnRbXCJGQVJUSEVTVF9TSURFXCJdID0gMV0gPSBcIkZBUlRIRVNUX1NJREVcIjtcclxuICAgICAgICBDU1NSYWRpYWxFeHRlbnRbQ1NTUmFkaWFsRXh0ZW50W1wiQ0xPU0VTVF9DT1JORVJcIl0gPSAyXSA9IFwiQ0xPU0VTVF9DT1JORVJcIjtcclxuICAgICAgICBDU1NSYWRpYWxFeHRlbnRbQ1NTUmFkaWFsRXh0ZW50W1wiRkFSVEhFU1RfQ09STkVSXCJdID0gM10gPSBcIkZBUlRIRVNUX0NPUk5FUlwiO1xyXG4gICAgfSkoQ1NTUmFkaWFsRXh0ZW50IHx8IChDU1NSYWRpYWxFeHRlbnQgPSB7fSkpO1xyXG4gICAgdmFyIGltYWdlID0ge1xyXG4gICAgICAgIG5hbWU6ICdpbWFnZScsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUudHlwZSA9PT0gVG9rZW5UeXBlLlVSTF9UT0tFTikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGltYWdlXzEgPSB7IHVybDogdmFsdWUudmFsdWUsIHR5cGU6IENTU0ltYWdlVHlwZS5VUkwgfTtcclxuICAgICAgICAgICAgICAgIENhY2hlU3RvcmFnZS5nZXRJbnN0YW5jZSgpLmFkZEltYWdlKHZhbHVlLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbWFnZV8xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS50eXBlID09PSBUb2tlblR5cGUuRlVOQ1RJT04pIHtcclxuICAgICAgICAgICAgICAgIHZhciBpbWFnZUZ1bmN0aW9uID0gU1VQUE9SVEVEX0lNQUdFX0ZVTkNUSU9OU1t2YWx1ZS5uYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW1hZ2VGdW5jdGlvbiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdHRlbXB0aW5nIHRvIHBhcnNlIGFuIHVuc3VwcG9ydGVkIGltYWdlIGZ1bmN0aW9uIFxcXCJcIiArIHZhbHVlLm5hbWUgKyBcIlxcXCJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW1hZ2VGdW5jdGlvbih2YWx1ZS52YWx1ZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuc3VwcG9ydGVkIGltYWdlIHR5cGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIGlzU3VwcG9ydGVkSW1hZ2UodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gdmFsdWUudHlwZSAhPT0gVG9rZW5UeXBlLkZVTkNUSU9OIHx8IFNVUFBPUlRFRF9JTUFHRV9GVU5DVElPTlNbdmFsdWUubmFtZV07XHJcbiAgICB9XHJcbiAgICB2YXIgU1VQUE9SVEVEX0lNQUdFX0ZVTkNUSU9OUyA9IHtcclxuICAgICAgICAnbGluZWFyLWdyYWRpZW50JzogbGluZWFyR3JhZGllbnQsXHJcbiAgICAgICAgJy1tb3otbGluZWFyLWdyYWRpZW50JzogcHJlZml4TGluZWFyR3JhZGllbnQsXHJcbiAgICAgICAgJy1tcy1saW5lYXItZ3JhZGllbnQnOiBwcmVmaXhMaW5lYXJHcmFkaWVudCxcclxuICAgICAgICAnLW8tbGluZWFyLWdyYWRpZW50JzogcHJlZml4TGluZWFyR3JhZGllbnQsXHJcbiAgICAgICAgJy13ZWJraXQtbGluZWFyLWdyYWRpZW50JzogcHJlZml4TGluZWFyR3JhZGllbnQsXHJcbiAgICAgICAgJ3JhZGlhbC1ncmFkaWVudCc6IHJhZGlhbEdyYWRpZW50LFxyXG4gICAgICAgICctbW96LXJhZGlhbC1ncmFkaWVudCc6IHByZWZpeFJhZGlhbEdyYWRpZW50LFxyXG4gICAgICAgICctbXMtcmFkaWFsLWdyYWRpZW50JzogcHJlZml4UmFkaWFsR3JhZGllbnQsXHJcbiAgICAgICAgJy1vLXJhZGlhbC1ncmFkaWVudCc6IHByZWZpeFJhZGlhbEdyYWRpZW50LFxyXG4gICAgICAgICctd2Via2l0LXJhZGlhbC1ncmFkaWVudCc6IHByZWZpeFJhZGlhbEdyYWRpZW50LFxyXG4gICAgICAgICctd2Via2l0LWdyYWRpZW50Jzogd2Via2l0R3JhZGllbnRcclxuICAgIH07XG5cbiAgICB2YXIgYmFja2dyb3VuZEltYWdlID0ge1xyXG4gICAgICAgIG5hbWU6ICdiYWNrZ3JvdW5kLWltYWdlJyxcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICdub25lJyxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5MSVNULFxyXG4gICAgICAgIHByZWZpeDogZmFsc2UsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICAgICAgICAgICAgaWYgKHRva2Vucy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgZmlyc3QgPSB0b2tlbnNbMF07XHJcbiAgICAgICAgICAgIGlmIChmaXJzdC50eXBlID09PSBUb2tlblR5cGUuSURFTlRfVE9LRU4gJiYgZmlyc3QudmFsdWUgPT09ICdub25lJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbnMuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gbm9uRnVuY3Rpb25BcmdTZXBhcmF0b3IodmFsdWUpICYmIGlzU3VwcG9ydGVkSW1hZ2UodmFsdWUpOyB9KS5tYXAoaW1hZ2UucGFyc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH07XG5cbiAgICB2YXIgYmFja2dyb3VuZE9yaWdpbiA9IHtcclxuICAgICAgICBuYW1lOiAnYmFja2dyb3VuZC1vcmlnaW4nLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ2JvcmRlci1ib3gnLFxyXG4gICAgICAgIHByZWZpeDogZmFsc2UsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuTElTVCxcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHRva2Vucykge1xyXG4gICAgICAgICAgICByZXR1cm4gdG9rZW5zLm1hcChmdW5jdGlvbiAodG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIGlmIChpc0lkZW50VG9rZW4odG9rZW4pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0b2tlbi52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdwYWRkaW5nLWJveCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMSAvKiBQQURESU5HX0JPWCAqLztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29udGVudC1ib3gnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDIgLyogQ09OVEVOVF9CT1ggKi87XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAgLyogQk9SREVSX0JPWCAqLztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBiYWNrZ3JvdW5kUG9zaXRpb24gPSB7XHJcbiAgICAgICAgbmFtZTogJ2JhY2tncm91bmQtcG9zaXRpb24nLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJzAlIDAlJyxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5MSVNULFxyXG4gICAgICAgIHByZWZpeDogZmFsc2UsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRnVuY3Rpb25BcmdzKHRva2VucylcclxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKHZhbHVlcykgeyByZXR1cm4gdmFsdWVzLmZpbHRlcihpc0xlbmd0aFBlcmNlbnRhZ2UpOyB9KVxyXG4gICAgICAgICAgICAgICAgLm1hcChwYXJzZUxlbmd0aFBlcmNlbnRhZ2VUdXBsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBCQUNLR1JPVU5EX1JFUEVBVDtcclxuICAgIChmdW5jdGlvbiAoQkFDS0dST1VORF9SRVBFQVQpIHtcclxuICAgICAgICBCQUNLR1JPVU5EX1JFUEVBVFtCQUNLR1JPVU5EX1JFUEVBVFtcIlJFUEVBVFwiXSA9IDBdID0gXCJSRVBFQVRcIjtcclxuICAgICAgICBCQUNLR1JPVU5EX1JFUEVBVFtCQUNLR1JPVU5EX1JFUEVBVFtcIk5PX1JFUEVBVFwiXSA9IDFdID0gXCJOT19SRVBFQVRcIjtcclxuICAgICAgICBCQUNLR1JPVU5EX1JFUEVBVFtCQUNLR1JPVU5EX1JFUEVBVFtcIlJFUEVBVF9YXCJdID0gMl0gPSBcIlJFUEVBVF9YXCI7XHJcbiAgICAgICAgQkFDS0dST1VORF9SRVBFQVRbQkFDS0dST1VORF9SRVBFQVRbXCJSRVBFQVRfWVwiXSA9IDNdID0gXCJSRVBFQVRfWVwiO1xyXG4gICAgfSkoQkFDS0dST1VORF9SRVBFQVQgfHwgKEJBQ0tHUk9VTkRfUkVQRUFUID0ge30pKTtcclxuICAgIHZhciBiYWNrZ3JvdW5kUmVwZWF0ID0ge1xyXG4gICAgICAgIG5hbWU6ICdiYWNrZ3JvdW5kLXJlcGVhdCcsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAncmVwZWF0JyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLkxJU1QsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRnVuY3Rpb25BcmdzKHRva2VucylcclxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKHZhbHVlcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoaXNJZGVudFRva2VuKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKHRva2VuKSB7IHJldHVybiB0b2tlbi52YWx1ZTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAuam9pbignICcpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLm1hcChwYXJzZUJhY2tncm91bmRSZXBlYXQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB2YXIgcGFyc2VCYWNrZ3JvdW5kUmVwZWF0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgc3dpdGNoICh2YWx1ZSkge1xyXG4gICAgICAgICAgICBjYXNlICduby1yZXBlYXQnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJBQ0tHUk9VTkRfUkVQRUFULk5PX1JFUEVBVDtcclxuICAgICAgICAgICAgY2FzZSAncmVwZWF0LXgnOlxyXG4gICAgICAgICAgICBjYXNlICdyZXBlYXQgbm8tcmVwZWF0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBCQUNLR1JPVU5EX1JFUEVBVC5SRVBFQVRfWDtcclxuICAgICAgICAgICAgY2FzZSAncmVwZWF0LXknOlxyXG4gICAgICAgICAgICBjYXNlICduby1yZXBlYXQgcmVwZWF0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBCQUNLR1JPVU5EX1JFUEVBVC5SRVBFQVRfWTtcclxuICAgICAgICAgICAgY2FzZSAncmVwZWF0JzpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBCQUNLR1JPVU5EX1JFUEVBVC5SRVBFQVQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBCQUNLR1JPVU5EX1NJWkU7XHJcbiAgICAoZnVuY3Rpb24gKEJBQ0tHUk9VTkRfU0laRSkge1xyXG4gICAgICAgIEJBQ0tHUk9VTkRfU0laRVtcIkFVVE9cIl0gPSBcImF1dG9cIjtcclxuICAgICAgICBCQUNLR1JPVU5EX1NJWkVbXCJDT05UQUlOXCJdID0gXCJjb250YWluXCI7XHJcbiAgICAgICAgQkFDS0dST1VORF9TSVpFW1wiQ09WRVJcIl0gPSBcImNvdmVyXCI7XHJcbiAgICB9KShCQUNLR1JPVU5EX1NJWkUgfHwgKEJBQ0tHUk9VTkRfU0laRSA9IHt9KSk7XHJcbiAgICB2YXIgYmFja2dyb3VuZFNpemUgPSB7XHJcbiAgICAgICAgbmFtZTogJ2JhY2tncm91bmQtc2l6ZScsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnMCcsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5MSVNULFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZ1bmN0aW9uQXJncyh0b2tlbnMpLm1hcChmdW5jdGlvbiAodmFsdWVzKSB7IHJldHVybiB2YWx1ZXMuZmlsdGVyKGlzQmFja2dyb3VuZFNpemVJbmZvVG9rZW4pOyB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdmFyIGlzQmFja2dyb3VuZFNpemVJbmZvVG9rZW4gPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gaXNJZGVudFRva2VuKHZhbHVlKSB8fCBpc0xlbmd0aFBlcmNlbnRhZ2UodmFsdWUpO1xyXG4gICAgfTtcblxuICAgIHZhciBib3JkZXJDb2xvckZvclNpZGUgPSBmdW5jdGlvbiAoc2lkZSkgeyByZXR1cm4gKHtcclxuICAgICAgICBuYW1lOiBcImJvcmRlci1cIiArIHNpZGUgKyBcIi1jb2xvclwiLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ3RyYW5zcGFyZW50JyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLlRZUEVfVkFMVUUsXHJcbiAgICAgICAgZm9ybWF0OiAnY29sb3InXHJcbiAgICB9KTsgfTtcclxuICAgIHZhciBib3JkZXJUb3BDb2xvciA9IGJvcmRlckNvbG9yRm9yU2lkZSgndG9wJyk7XHJcbiAgICB2YXIgYm9yZGVyUmlnaHRDb2xvciA9IGJvcmRlckNvbG9yRm9yU2lkZSgncmlnaHQnKTtcclxuICAgIHZhciBib3JkZXJCb3R0b21Db2xvciA9IGJvcmRlckNvbG9yRm9yU2lkZSgnYm90dG9tJyk7XHJcbiAgICB2YXIgYm9yZGVyTGVmdENvbG9yID0gYm9yZGVyQ29sb3JGb3JTaWRlKCdsZWZ0Jyk7XG5cbiAgICB2YXIgYm9yZGVyUmFkaXVzRm9yU2lkZSA9IGZ1bmN0aW9uIChzaWRlKSB7IHJldHVybiAoe1xyXG4gICAgICAgIG5hbWU6IFwiYm9yZGVyLXJhZGl1cy1cIiArIHNpZGUsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnMCAwJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLkxJU1QsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh0b2tlbnMpIHsgcmV0dXJuIHBhcnNlTGVuZ3RoUGVyY2VudGFnZVR1cGxlKHRva2Vucy5maWx0ZXIoaXNMZW5ndGhQZXJjZW50YWdlKSk7IH1cclxuICAgIH0pOyB9O1xyXG4gICAgdmFyIGJvcmRlclRvcExlZnRSYWRpdXMgPSBib3JkZXJSYWRpdXNGb3JTaWRlKCd0b3AtbGVmdCcpO1xyXG4gICAgdmFyIGJvcmRlclRvcFJpZ2h0UmFkaXVzID0gYm9yZGVyUmFkaXVzRm9yU2lkZSgndG9wLXJpZ2h0Jyk7XHJcbiAgICB2YXIgYm9yZGVyQm90dG9tUmlnaHRSYWRpdXMgPSBib3JkZXJSYWRpdXNGb3JTaWRlKCdib3R0b20tcmlnaHQnKTtcclxuICAgIHZhciBib3JkZXJCb3R0b21MZWZ0UmFkaXVzID0gYm9yZGVyUmFkaXVzRm9yU2lkZSgnYm90dG9tLWxlZnQnKTtcblxuICAgIHZhciBCT1JERVJfU1RZTEU7XHJcbiAgICAoZnVuY3Rpb24gKEJPUkRFUl9TVFlMRSkge1xyXG4gICAgICAgIEJPUkRFUl9TVFlMRVtCT1JERVJfU1RZTEVbXCJOT05FXCJdID0gMF0gPSBcIk5PTkVcIjtcclxuICAgICAgICBCT1JERVJfU1RZTEVbQk9SREVSX1NUWUxFW1wiU09MSURcIl0gPSAxXSA9IFwiU09MSURcIjtcclxuICAgIH0pKEJPUkRFUl9TVFlMRSB8fCAoQk9SREVSX1NUWUxFID0ge30pKTtcclxuICAgIHZhciBib3JkZXJTdHlsZUZvclNpZGUgPSBmdW5jdGlvbiAoc2lkZSkgeyByZXR1cm4gKHtcclxuICAgICAgICBuYW1lOiBcImJvcmRlci1cIiArIHNpZGUgKyBcIi1zdHlsZVwiLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ3NvbGlkJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLklERU5UX1ZBTFVFLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAoc3R5bGUpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChzdHlsZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbm9uZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJPUkRFUl9TVFlMRS5OT05FO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBCT1JERVJfU1RZTEUuU09MSUQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7IH07XHJcbiAgICB2YXIgYm9yZGVyVG9wU3R5bGUgPSBib3JkZXJTdHlsZUZvclNpZGUoJ3RvcCcpO1xyXG4gICAgdmFyIGJvcmRlclJpZ2h0U3R5bGUgPSBib3JkZXJTdHlsZUZvclNpZGUoJ3JpZ2h0Jyk7XHJcbiAgICB2YXIgYm9yZGVyQm90dG9tU3R5bGUgPSBib3JkZXJTdHlsZUZvclNpZGUoJ2JvdHRvbScpO1xyXG4gICAgdmFyIGJvcmRlckxlZnRTdHlsZSA9IGJvcmRlclN0eWxlRm9yU2lkZSgnbGVmdCcpO1xuXG4gICAgdmFyIGJvcmRlcldpZHRoRm9yU2lkZSA9IGZ1bmN0aW9uIChzaWRlKSB7IHJldHVybiAoe1xyXG4gICAgICAgIG5hbWU6IFwiYm9yZGVyLVwiICsgc2lkZSArIFwiLXdpZHRoXCIsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnMCcsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuVkFMVUUsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0RpbWVuc2lvblRva2VuKHRva2VuKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuLm51bWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9KTsgfTtcclxuICAgIHZhciBib3JkZXJUb3BXaWR0aCA9IGJvcmRlcldpZHRoRm9yU2lkZSgndG9wJyk7XHJcbiAgICB2YXIgYm9yZGVyUmlnaHRXaWR0aCA9IGJvcmRlcldpZHRoRm9yU2lkZSgncmlnaHQnKTtcclxuICAgIHZhciBib3JkZXJCb3R0b21XaWR0aCA9IGJvcmRlcldpZHRoRm9yU2lkZSgnYm90dG9tJyk7XHJcbiAgICB2YXIgYm9yZGVyTGVmdFdpZHRoID0gYm9yZGVyV2lkdGhGb3JTaWRlKCdsZWZ0Jyk7XG5cbiAgICB2YXIgY29sb3IkMSA9IHtcclxuICAgICAgICBuYW1lOiBcImNvbG9yXCIsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAndHJhbnNwYXJlbnQnLFxyXG4gICAgICAgIHByZWZpeDogZmFsc2UsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuVFlQRV9WQUxVRSxcclxuICAgICAgICBmb3JtYXQ6ICdjb2xvcidcclxuICAgIH07XG5cbiAgICB2YXIgZGlzcGxheSA9IHtcclxuICAgICAgICBuYW1lOiAnZGlzcGxheScsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLkxJU1QsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRva2Vucy5maWx0ZXIoaXNJZGVudFRva2VuKS5yZWR1Y2UoZnVuY3Rpb24gKGJpdCwgdG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBiaXQgfCBwYXJzZURpc3BsYXlWYWx1ZSh0b2tlbi52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0sIDAgLyogTk9ORSAqLyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHZhciBwYXJzZURpc3BsYXlWYWx1ZSA9IGZ1bmN0aW9uIChkaXNwbGF5KSB7XHJcbiAgICAgICAgc3dpdGNoIChkaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyIC8qIEJMT0NLICovO1xyXG4gICAgICAgICAgICBjYXNlICdpbmxpbmUnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDQgLyogSU5MSU5FICovO1xyXG4gICAgICAgICAgICBjYXNlICdydW4taW4nOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDggLyogUlVOX0lOICovO1xyXG4gICAgICAgICAgICBjYXNlICdmbG93JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxNiAvKiBGTE9XICovO1xyXG4gICAgICAgICAgICBjYXNlICdmbG93LXJvb3QnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDMyIC8qIEZMT1dfUk9PVCAqLztcclxuICAgICAgICAgICAgY2FzZSAndGFibGUnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDY0IC8qIFRBQkxFICovO1xyXG4gICAgICAgICAgICBjYXNlICdmbGV4JzpcclxuICAgICAgICAgICAgY2FzZSAnLXdlYmtpdC1mbGV4JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxMjggLyogRkxFWCAqLztcclxuICAgICAgICAgICAgY2FzZSAnZ3JpZCc6XHJcbiAgICAgICAgICAgIGNhc2UgJy1tcy1ncmlkJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyNTYgLyogR1JJRCAqLztcclxuICAgICAgICAgICAgY2FzZSAncnVieSc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNTEyIC8qIFJVQlkgKi87XHJcbiAgICAgICAgICAgIGNhc2UgJ3N1YmdyaWQnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEwMjQgLyogU1VCR1JJRCAqLztcclxuICAgICAgICAgICAgY2FzZSAnbGlzdC1pdGVtJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyMDQ4IC8qIExJU1RfSVRFTSAqLztcclxuICAgICAgICAgICAgY2FzZSAndGFibGUtcm93LWdyb3VwJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA0MDk2IC8qIFRBQkxFX1JPV19HUk9VUCAqLztcclxuICAgICAgICAgICAgY2FzZSAndGFibGUtaGVhZGVyLWdyb3VwJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA4MTkyIC8qIFRBQkxFX0hFQURFUl9HUk9VUCAqLztcclxuICAgICAgICAgICAgY2FzZSAndGFibGUtZm9vdGVyLWdyb3VwJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxNjM4NCAvKiBUQUJMRV9GT09URVJfR1JPVVAgKi87XHJcbiAgICAgICAgICAgIGNhc2UgJ3RhYmxlLXJvdyc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMzI3NjggLyogVEFCTEVfUk9XICovO1xyXG4gICAgICAgICAgICBjYXNlICd0YWJsZS1jZWxsJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA2NTUzNiAvKiBUQUJMRV9DRUxMICovO1xyXG4gICAgICAgICAgICBjYXNlICd0YWJsZS1jb2x1bW4tZ3JvdXAnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEzMTA3MiAvKiBUQUJMRV9DT0xVTU5fR1JPVVAgKi87XHJcbiAgICAgICAgICAgIGNhc2UgJ3RhYmxlLWNvbHVtbic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjYyMTQ0IC8qIFRBQkxFX0NPTFVNTiAqLztcclxuICAgICAgICAgICAgY2FzZSAndGFibGUtY2FwdGlvbic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNTI0Mjg4IC8qIFRBQkxFX0NBUFRJT04gKi87XHJcbiAgICAgICAgICAgIGNhc2UgJ3J1YnktYmFzZSc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTA0ODU3NiAvKiBSVUJZX0JBU0UgKi87XHJcbiAgICAgICAgICAgIGNhc2UgJ3J1YnktdGV4dCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjA5NzE1MiAvKiBSVUJZX1RFWFQgKi87XHJcbiAgICAgICAgICAgIGNhc2UgJ3J1YnktYmFzZS1jb250YWluZXInOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDQxOTQzMDQgLyogUlVCWV9CQVNFX0NPTlRBSU5FUiAqLztcclxuICAgICAgICAgICAgY2FzZSAncnVieS10ZXh0LWNvbnRhaW5lcic6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gODM4ODYwOCAvKiBSVUJZX1RFWFRfQ09OVEFJTkVSICovO1xyXG4gICAgICAgICAgICBjYXNlICdjb250ZW50cyc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTY3NzcyMTYgLyogQ09OVEVOVFMgKi87XHJcbiAgICAgICAgICAgIGNhc2UgJ2lubGluZS1ibG9jayc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMzM1NTQ0MzIgLyogSU5MSU5FX0JMT0NLICovO1xyXG4gICAgICAgICAgICBjYXNlICdpbmxpbmUtbGlzdC1pdGVtJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA2NzEwODg2NCAvKiBJTkxJTkVfTElTVF9JVEVNICovO1xyXG4gICAgICAgICAgICBjYXNlICdpbmxpbmUtdGFibGUnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEzNDIxNzcyOCAvKiBJTkxJTkVfVEFCTEUgKi87XHJcbiAgICAgICAgICAgIGNhc2UgJ2lubGluZS1mbGV4JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyNjg0MzU0NTYgLyogSU5MSU5FX0ZMRVggKi87XHJcbiAgICAgICAgICAgIGNhc2UgJ2lubGluZS1ncmlkJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiA1MzY4NzA5MTIgLyogSU5MSU5FX0dSSUQgKi87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwIC8qIE5PTkUgKi87XHJcbiAgICB9O1xuXG4gICAgdmFyIEZMT0FUO1xyXG4gICAgKGZ1bmN0aW9uIChGTE9BVCkge1xyXG4gICAgICAgIEZMT0FUW0ZMT0FUW1wiTk9ORVwiXSA9IDBdID0gXCJOT05FXCI7XHJcbiAgICAgICAgRkxPQVRbRkxPQVRbXCJMRUZUXCJdID0gMV0gPSBcIkxFRlRcIjtcclxuICAgICAgICBGTE9BVFtGTE9BVFtcIlJJR0hUXCJdID0gMl0gPSBcIlJJR0hUXCI7XHJcbiAgICAgICAgRkxPQVRbRkxPQVRbXCJJTkxJTkVfU1RBUlRcIl0gPSAzXSA9IFwiSU5MSU5FX1NUQVJUXCI7XHJcbiAgICAgICAgRkxPQVRbRkxPQVRbXCJJTkxJTkVfRU5EXCJdID0gNF0gPSBcIklOTElORV9FTkRcIjtcclxuICAgIH0pKEZMT0FUIHx8IChGTE9BVCA9IHt9KSk7XHJcbiAgICB2YXIgZmxvYXQgPSB7XHJcbiAgICAgICAgbmFtZTogJ2Zsb2F0JyxcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICdub25lJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLklERU5UX1ZBTFVFLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAoZmxvYXQpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChmbG9hdCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZMT0FULkxFRlQ7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZMT0FULlJJR0hUO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaW5saW5lLXN0YXJ0JzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRkxPQVQuSU5MSU5FX1NUQVJUO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaW5saW5lLWVuZCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZMT0FULklOTElORV9FTkQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIEZMT0FULk5PTkU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBsZXR0ZXJTcGFjaW5nID0ge1xyXG4gICAgICAgIG5hbWU6ICdsZXR0ZXItc3BhY2luZycsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnMCcsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5WQUxVRSxcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuSURFTlRfVE9LRU4gJiYgdG9rZW4udmFsdWUgPT09ICdub3JtYWwnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLk5VTUJFUl9UT0tFTikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuLm51bWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkRJTUVOU0lPTl9UT0tFTikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuLm51bWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIExJTkVfQlJFQUs7XHJcbiAgICAoZnVuY3Rpb24gKExJTkVfQlJFQUspIHtcclxuICAgICAgICBMSU5FX0JSRUFLW1wiTk9STUFMXCJdID0gXCJub3JtYWxcIjtcclxuICAgICAgICBMSU5FX0JSRUFLW1wiU1RSSUNUXCJdID0gXCJzdHJpY3RcIjtcclxuICAgIH0pKExJTkVfQlJFQUsgfHwgKExJTkVfQlJFQUsgPSB7fSkpO1xyXG4gICAgdmFyIGxpbmVCcmVhayA9IHtcclxuICAgICAgICBuYW1lOiAnbGluZS1icmVhaycsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnbm9ybWFsJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLklERU5UX1ZBTFVFLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAobGluZUJyZWFrKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAobGluZUJyZWFrKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzdHJpY3QnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSU5FX0JSRUFLLlNUUklDVDtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ25vcm1hbCc6XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSU5FX0JSRUFLLk5PUk1BTDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XG5cbiAgICB2YXIgbGluZUhlaWdodCA9IHtcclxuICAgICAgICBuYW1lOiAnbGluZS1oZWlnaHQnLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ25vcm1hbCcsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5UT0tFTl9WQUxVRVxyXG4gICAgfTtcclxuICAgIHZhciBjb21wdXRlTGluZUhlaWdodCA9IGZ1bmN0aW9uICh0b2tlbiwgZm9udFNpemUpIHtcclxuICAgICAgICBpZiAoaXNJZGVudFRva2VuKHRva2VuKSAmJiB0b2tlbi52YWx1ZSA9PT0gJ25vcm1hbCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDEuMiAqIGZvbnRTaXplO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuTlVNQkVSX1RPS0VOKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmb250U2l6ZSAqIHRva2VuLm51bWJlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaXNMZW5ndGhQZXJjZW50YWdlKHRva2VuKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZ2V0QWJzb2x1dGVWYWx1ZSh0b2tlbiwgZm9udFNpemUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm9udFNpemU7XHJcbiAgICB9O1xuXG4gICAgdmFyIGxpc3RTdHlsZUltYWdlID0ge1xyXG4gICAgICAgIG5hbWU6ICdsaXN0LXN0eWxlLWltYWdlJyxcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICdub25lJyxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5WQUxVRSxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW4pIHtcclxuICAgICAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5JREVOVF9UT0tFTiAmJiB0b2tlbi52YWx1ZSA9PT0gJ25vbmUnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaW1hZ2UucGFyc2UodG9rZW4pO1xyXG4gICAgICAgIH1cclxuICAgIH07XG5cbiAgICB2YXIgTElTVF9TVFlMRV9QT1NJVElPTjtcclxuICAgIChmdW5jdGlvbiAoTElTVF9TVFlMRV9QT1NJVElPTikge1xyXG4gICAgICAgIExJU1RfU1RZTEVfUE9TSVRJT05bTElTVF9TVFlMRV9QT1NJVElPTltcIklOU0lERVwiXSA9IDBdID0gXCJJTlNJREVcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1BPU0lUSU9OW0xJU1RfU1RZTEVfUE9TSVRJT05bXCJPVVRTSURFXCJdID0gMV0gPSBcIk9VVFNJREVcIjtcclxuICAgIH0pKExJU1RfU1RZTEVfUE9TSVRJT04gfHwgKExJU1RfU1RZTEVfUE9TSVRJT04gPSB7fSkpO1xyXG4gICAgdmFyIGxpc3RTdHlsZVBvc2l0aW9uID0ge1xyXG4gICAgICAgIG5hbWU6ICdsaXN0LXN0eWxlLXBvc2l0aW9uJyxcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICdvdXRzaWRlJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLklERU5UX1ZBTFVFLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuICAgICAgICAgICAgc3dpdGNoIChwb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaW5zaWRlJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9QT1NJVElPTi5JTlNJREU7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdvdXRzaWRlJzpcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfUE9TSVRJT04uT1VUU0lERTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XG5cbiAgICB2YXIgTElTVF9TVFlMRV9UWVBFO1xyXG4gICAgKGZ1bmN0aW9uIChMSVNUX1NUWUxFX1RZUEUpIHtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiTk9ORVwiXSA9IC0xXSA9IFwiTk9ORVwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJESVNDXCJdID0gMF0gPSBcIkRJU0NcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiQ0lSQ0xFXCJdID0gMV0gPSBcIkNJUkNMRVwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJTUVVBUkVcIl0gPSAyXSA9IFwiU1FVQVJFXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIkRFQ0lNQUxcIl0gPSAzXSA9IFwiREVDSU1BTFwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJDSktfREVDSU1BTFwiXSA9IDRdID0gXCJDSktfREVDSU1BTFwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJERUNJTUFMX0xFQURJTkdfWkVST1wiXSA9IDVdID0gXCJERUNJTUFMX0xFQURJTkdfWkVST1wiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJMT1dFUl9ST01BTlwiXSA9IDZdID0gXCJMT1dFUl9ST01BTlwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJVUFBFUl9ST01BTlwiXSA9IDddID0gXCJVUFBFUl9ST01BTlwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJMT1dFUl9HUkVFS1wiXSA9IDhdID0gXCJMT1dFUl9HUkVFS1wiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJMT1dFUl9BTFBIQVwiXSA9IDldID0gXCJMT1dFUl9BTFBIQVwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJVUFBFUl9BTFBIQVwiXSA9IDEwXSA9IFwiVVBQRVJfQUxQSEFcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiQVJBQklDX0lORElDXCJdID0gMTFdID0gXCJBUkFCSUNfSU5ESUNcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiQVJNRU5JQU5cIl0gPSAxMl0gPSBcIkFSTUVOSUFOXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIkJFTkdBTElcIl0gPSAxM10gPSBcIkJFTkdBTElcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiQ0FNQk9ESUFOXCJdID0gMTRdID0gXCJDQU1CT0RJQU5cIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiQ0pLX0VBUlRITFlfQlJBTkNIXCJdID0gMTVdID0gXCJDSktfRUFSVEhMWV9CUkFOQ0hcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiQ0pLX0hFQVZFTkxZX1NURU1cIl0gPSAxNl0gPSBcIkNKS19IRUFWRU5MWV9TVEVNXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIkNKS19JREVPR1JBUEhJQ1wiXSA9IDE3XSA9IFwiQ0pLX0lERU9HUkFQSElDXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIkRFVkFOQUdBUklcIl0gPSAxOF0gPSBcIkRFVkFOQUdBUklcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiRVRISU9QSUNfTlVNRVJJQ1wiXSA9IDE5XSA9IFwiRVRISU9QSUNfTlVNRVJJQ1wiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJHRU9SR0lBTlwiXSA9IDIwXSA9IFwiR0VPUkdJQU5cIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiR1VKQVJBVElcIl0gPSAyMV0gPSBcIkdVSkFSQVRJXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIkdVUk1VS0hJXCJdID0gMjJdID0gXCJHVVJNVUtISVwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJIRUJSRVdcIl0gPSAyMl0gPSBcIkhFQlJFV1wiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJISVJBR0FOQVwiXSA9IDIzXSA9IFwiSElSQUdBTkFcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiSElSQUdBTkFfSVJPSEFcIl0gPSAyNF0gPSBcIkhJUkFHQU5BX0lST0hBXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIkpBUEFORVNFX0ZPUk1BTFwiXSA9IDI1XSA9IFwiSkFQQU5FU0VfRk9STUFMXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIkpBUEFORVNFX0lORk9STUFMXCJdID0gMjZdID0gXCJKQVBBTkVTRV9JTkZPUk1BTFwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJLQU5OQURBXCJdID0gMjddID0gXCJLQU5OQURBXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIktBVEFLQU5BXCJdID0gMjhdID0gXCJLQVRBS0FOQVwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJLQVRBS0FOQV9JUk9IQVwiXSA9IDI5XSA9IFwiS0FUQUtBTkFfSVJPSEFcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiS0hNRVJcIl0gPSAzMF0gPSBcIktITUVSXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIktPUkVBTl9IQU5HVUxfRk9STUFMXCJdID0gMzFdID0gXCJLT1JFQU5fSEFOR1VMX0ZPUk1BTFwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJLT1JFQU5fSEFOSkFfRk9STUFMXCJdID0gMzJdID0gXCJLT1JFQU5fSEFOSkFfRk9STUFMXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIktPUkVBTl9IQU5KQV9JTkZPUk1BTFwiXSA9IDMzXSA9IFwiS09SRUFOX0hBTkpBX0lORk9STUFMXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIkxBT1wiXSA9IDM0XSA9IFwiTEFPXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIkxPV0VSX0FSTUVOSUFOXCJdID0gMzVdID0gXCJMT1dFUl9BUk1FTklBTlwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJNQUxBWUFMQU1cIl0gPSAzNl0gPSBcIk1BTEFZQUxBTVwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJNT05HT0xJQU5cIl0gPSAzN10gPSBcIk1PTkdPTElBTlwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJNWUFOTUFSXCJdID0gMzhdID0gXCJNWUFOTUFSXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIk9SSVlBXCJdID0gMzldID0gXCJPUklZQVwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJQRVJTSUFOXCJdID0gNDBdID0gXCJQRVJTSUFOXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIlNJTVBfQ0hJTkVTRV9GT1JNQUxcIl0gPSA0MV0gPSBcIlNJTVBfQ0hJTkVTRV9GT1JNQUxcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiU0lNUF9DSElORVNFX0lORk9STUFMXCJdID0gNDJdID0gXCJTSU1QX0NISU5FU0VfSU5GT1JNQUxcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiVEFNSUxcIl0gPSA0M10gPSBcIlRBTUlMXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIlRFTFVHVVwiXSA9IDQ0XSA9IFwiVEVMVUdVXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIlRIQUlcIl0gPSA0NV0gPSBcIlRIQUlcIjtcclxuICAgICAgICBMSVNUX1NUWUxFX1RZUEVbTElTVF9TVFlMRV9UWVBFW1wiVElCRVRBTlwiXSA9IDQ2XSA9IFwiVElCRVRBTlwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJUUkFEX0NISU5FU0VfRk9STUFMXCJdID0gNDddID0gXCJUUkFEX0NISU5FU0VfRk9STUFMXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIlRSQURfQ0hJTkVTRV9JTkZPUk1BTFwiXSA9IDQ4XSA9IFwiVFJBRF9DSElORVNFX0lORk9STUFMXCI7XHJcbiAgICAgICAgTElTVF9TVFlMRV9UWVBFW0xJU1RfU1RZTEVfVFlQRVtcIlVQUEVSX0FSTUVOSUFOXCJdID0gNDldID0gXCJVUFBFUl9BUk1FTklBTlwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJESVNDTE9TVVJFX09QRU5cIl0gPSA1MF0gPSBcIkRJU0NMT1NVUkVfT1BFTlwiO1xyXG4gICAgICAgIExJU1RfU1RZTEVfVFlQRVtMSVNUX1NUWUxFX1RZUEVbXCJESVNDTE9TVVJFX0NMT1NFRFwiXSA9IDUxXSA9IFwiRElTQ0xPU1VSRV9DTE9TRURcIjtcclxuICAgIH0pKExJU1RfU1RZTEVfVFlQRSB8fCAoTElTVF9TVFlMRV9UWVBFID0ge30pKTtcclxuICAgIHZhciBsaXN0U3R5bGVUeXBlID0ge1xyXG4gICAgICAgIG5hbWU6ICdsaXN0LXN0eWxlLXR5cGUnLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ25vbmUnLFxyXG4gICAgICAgIHByZWZpeDogZmFsc2UsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuSURFTlRfVkFMVUUsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZGlzYyc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5ESVNDO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY2lyY2xlJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLkNJUkNMRTtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NxdWFyZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5TUVVBUkU7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkZWNpbWFsJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLkRFQ0lNQUw7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjamstZGVjaW1hbCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5DSktfREVDSU1BTDtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RlY2ltYWwtbGVhZGluZy16ZXJvJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLkRFQ0lNQUxfTEVBRElOR19aRVJPO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbG93ZXItcm9tYW4nOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuTE9XRVJfUk9NQU47XHJcbiAgICAgICAgICAgICAgICBjYXNlICd1cHBlci1yb21hbic6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5VUFBFUl9ST01BTjtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xvd2VyLWdyZWVrJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLkxPV0VSX0dSRUVLO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbG93ZXItYWxwaGEnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuTE9XRVJfQUxQSEE7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd1cHBlci1hbHBoYSc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5VUFBFUl9BTFBIQTtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2FyYWJpYy1pbmRpYyc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5BUkFCSUNfSU5ESUM7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdhcm1lbmlhbic6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5BUk1FTklBTjtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2JlbmdhbGknOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuQkVOR0FMSTtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2NhbWJvZGlhbic6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5DQU1CT0RJQU47XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjamstZWFydGhseS1icmFuY2gnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuQ0pLX0VBUlRITFlfQlJBTkNIO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY2prLWhlYXZlbmx5LXN0ZW0nOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuQ0pLX0hFQVZFTkxZX1NURU07XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjamstaWRlb2dyYXBoaWMnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuQ0pLX0lERU9HUkFQSElDO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZGV2YW5hZ2FyaSc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5ERVZBTkFHQVJJO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZXRoaW9waWMtbnVtZXJpYyc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5FVEhJT1BJQ19OVU1FUklDO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZ2VvcmdpYW4nOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuR0VPUkdJQU47XHJcbiAgICAgICAgICAgICAgICBjYXNlICdndWphcmF0aSc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5HVUpBUkFUSTtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2d1cm11a2hpJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLkdVUk1VS0hJO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaGVicmV3JzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLkhFQlJFVztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2hpcmFnYW5hJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLkhJUkFHQU5BO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaGlyYWdhbmEtaXJvaGEnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuSElSQUdBTkFfSVJPSEE7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdqYXBhbmVzZS1mb3JtYWwnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuSkFQQU5FU0VfRk9STUFMO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnamFwYW5lc2UtaW5mb3JtYWwnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuSkFQQU5FU0VfSU5GT1JNQUw7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdrYW5uYWRhJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLktBTk5BREE7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdrYXRha2FuYSc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5LQVRBS0FOQTtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2thdGFrYW5hLWlyb2hhJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLktBVEFLQU5BX0lST0hBO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAna2htZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuS0hNRVI7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdrb3JlYW4taGFuZ3VsLWZvcm1hbCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5LT1JFQU5fSEFOR1VMX0ZPUk1BTDtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2tvcmVhbi1oYW5qYS1mb3JtYWwnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuS09SRUFOX0hBTkpBX0ZPUk1BTDtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2tvcmVhbi1oYW5qYS1pbmZvcm1hbCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5LT1JFQU5fSEFOSkFfSU5GT1JNQUw7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsYW8nOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuTEFPO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbG93ZXItYXJtZW5pYW4nOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuTE9XRVJfQVJNRU5JQU47XHJcbiAgICAgICAgICAgICAgICBjYXNlICdtYWxheWFsYW0nOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuTUFMQVlBTEFNO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbW9uZ29saWFuJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLk1PTkdPTElBTjtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ215YW5tYXInOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuTVlBTk1BUjtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ29yaXlhJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLk9SSVlBO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncGVyc2lhbic6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5QRVJTSUFOO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc2ltcC1jaGluZXNlLWZvcm1hbCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5TSU1QX0NISU5FU0VfRk9STUFMO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc2ltcC1jaGluZXNlLWluZm9ybWFsJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLlNJTVBfQ0hJTkVTRV9JTkZPUk1BTDtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3RhbWlsJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLlRBTUlMO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndGVsdWd1JzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLlRFTFVHVTtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3RoYWknOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuVEhBSTtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3RpYmV0YW4nOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuVElCRVRBTjtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3RyYWQtY2hpbmVzZS1mb3JtYWwnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSVNUX1NUWUxFX1RZUEUuVFJBRF9DSElORVNFX0ZPUk1BTDtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3RyYWQtY2hpbmVzZS1pbmZvcm1hbCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5UUkFEX0NISU5FU0VfSU5GT1JNQUw7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd1cHBlci1hcm1lbmlhbic6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5VUFBFUl9BUk1FTklBTjtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Rpc2Nsb3N1cmUtb3Blbic6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5ESVNDTE9TVVJFX09QRU47XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkaXNjbG9zdXJlLWNsb3NlZCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJU1RfU1RZTEVfVFlQRS5ESVNDTE9TVVJFX0NMT1NFRDtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ25vbmUnOlxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTElTVF9TVFlMRV9UWVBFLk5PTkU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIG1hcmdpbkZvclNpZGUgPSBmdW5jdGlvbiAoc2lkZSkgeyByZXR1cm4gKHtcclxuICAgICAgICBuYW1lOiBcIm1hcmdpbi1cIiArIHNpZGUsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnMCcsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5UT0tFTl9WQUxVRVxyXG4gICAgfSk7IH07XHJcbiAgICB2YXIgbWFyZ2luVG9wID0gbWFyZ2luRm9yU2lkZSgndG9wJyk7XHJcbiAgICB2YXIgbWFyZ2luUmlnaHQgPSBtYXJnaW5Gb3JTaWRlKCdyaWdodCcpO1xyXG4gICAgdmFyIG1hcmdpbkJvdHRvbSA9IG1hcmdpbkZvclNpZGUoJ2JvdHRvbScpO1xyXG4gICAgdmFyIG1hcmdpbkxlZnQgPSBtYXJnaW5Gb3JTaWRlKCdsZWZ0Jyk7XG5cbiAgICB2YXIgT1ZFUkZMT1c7XHJcbiAgICAoZnVuY3Rpb24gKE9WRVJGTE9XKSB7XHJcbiAgICAgICAgT1ZFUkZMT1dbT1ZFUkZMT1dbXCJWSVNJQkxFXCJdID0gMF0gPSBcIlZJU0lCTEVcIjtcclxuICAgICAgICBPVkVSRkxPV1tPVkVSRkxPV1tcIkhJRERFTlwiXSA9IDFdID0gXCJISURERU5cIjtcclxuICAgICAgICBPVkVSRkxPV1tPVkVSRkxPV1tcIlNDUk9MTFwiXSA9IDJdID0gXCJTQ1JPTExcIjtcclxuICAgICAgICBPVkVSRkxPV1tPVkVSRkxPV1tcIkFVVE9cIl0gPSAzXSA9IFwiQVVUT1wiO1xyXG4gICAgfSkoT1ZFUkZMT1cgfHwgKE9WRVJGTE9XID0ge30pKTtcclxuICAgIHZhciBvdmVyZmxvdyA9IHtcclxuICAgICAgICBuYW1lOiAnb3ZlcmZsb3cnLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ3Zpc2libGUnLFxyXG4gICAgICAgIHByZWZpeDogZmFsc2UsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuTElTVCxcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHRva2Vucykge1xyXG4gICAgICAgICAgICByZXR1cm4gdG9rZW5zLmZpbHRlcihpc0lkZW50VG9rZW4pLm1hcChmdW5jdGlvbiAob3ZlcmZsb3cpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAob3ZlcmZsb3cudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdoaWRkZW4nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gT1ZFUkZMT1cuSElEREVOO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3Njcm9sbCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBPVkVSRkxPVy5TQ1JPTEw7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYXV0byc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBPVkVSRkxPVy5BVVRPO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3Zpc2libGUnOlxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBPVkVSRkxPVy5WSVNJQkxFO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIE9WRVJGTE9XX1dSQVA7XHJcbiAgICAoZnVuY3Rpb24gKE9WRVJGTE9XX1dSQVApIHtcclxuICAgICAgICBPVkVSRkxPV19XUkFQW1wiTk9STUFMXCJdID0gXCJub3JtYWxcIjtcclxuICAgICAgICBPVkVSRkxPV19XUkFQW1wiQlJFQUtfV09SRFwiXSA9IFwiYnJlYWstd29yZFwiO1xyXG4gICAgfSkoT1ZFUkZMT1dfV1JBUCB8fCAoT1ZFUkZMT1dfV1JBUCA9IHt9KSk7XHJcbiAgICB2YXIgb3ZlcmZsb3dXcmFwID0ge1xyXG4gICAgICAgIG5hbWU6ICdvdmVyZmxvdy13cmFwJyxcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICdub3JtYWwnLFxyXG4gICAgICAgIHByZWZpeDogZmFsc2UsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuSURFTlRfVkFMVUUsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uIChvdmVyZmxvdykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG92ZXJmbG93KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdicmVhay13b3JkJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gT1ZFUkZMT1dfV1JBUC5CUkVBS19XT1JEO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbm9ybWFsJzpcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE9WRVJGTE9XX1dSQVAuTk9STUFMO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBwYWRkaW5nRm9yU2lkZSA9IGZ1bmN0aW9uIChzaWRlKSB7IHJldHVybiAoe1xyXG4gICAgICAgIG5hbWU6IFwicGFkZGluZy1cIiArIHNpZGUsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnMCcsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5UWVBFX1ZBTFVFLFxyXG4gICAgICAgIGZvcm1hdDogJ2xlbmd0aC1wZXJjZW50YWdlJ1xyXG4gICAgfSk7IH07XHJcbiAgICB2YXIgcGFkZGluZ1RvcCA9IHBhZGRpbmdGb3JTaWRlKCd0b3AnKTtcclxuICAgIHZhciBwYWRkaW5nUmlnaHQgPSBwYWRkaW5nRm9yU2lkZSgncmlnaHQnKTtcclxuICAgIHZhciBwYWRkaW5nQm90dG9tID0gcGFkZGluZ0ZvclNpZGUoJ2JvdHRvbScpO1xyXG4gICAgdmFyIHBhZGRpbmdMZWZ0ID0gcGFkZGluZ0ZvclNpZGUoJ2xlZnQnKTtcblxuICAgIHZhciBURVhUX0FMSUdOO1xyXG4gICAgKGZ1bmN0aW9uIChURVhUX0FMSUdOKSB7XHJcbiAgICAgICAgVEVYVF9BTElHTltURVhUX0FMSUdOW1wiTEVGVFwiXSA9IDBdID0gXCJMRUZUXCI7XHJcbiAgICAgICAgVEVYVF9BTElHTltURVhUX0FMSUdOW1wiQ0VOVEVSXCJdID0gMV0gPSBcIkNFTlRFUlwiO1xyXG4gICAgICAgIFRFWFRfQUxJR05bVEVYVF9BTElHTltcIlJJR0hUXCJdID0gMl0gPSBcIlJJR0hUXCI7XHJcbiAgICB9KShURVhUX0FMSUdOIHx8IChURVhUX0FMSUdOID0ge30pKTtcclxuICAgIHZhciB0ZXh0QWxpZ24gPSB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtYWxpZ24nLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ2xlZnQnLFxyXG4gICAgICAgIHByZWZpeDogZmFsc2UsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuSURFTlRfVkFMVUUsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh0ZXh0QWxpZ24pIHtcclxuICAgICAgICAgICAgc3dpdGNoICh0ZXh0QWxpZ24pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVEVYVF9BTElHTi5SSUdIVDtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2NlbnRlcic6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdqdXN0aWZ5JzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVEVYVF9BTElHTi5DRU5URVI7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRFWFRfQUxJR04uTEVGVDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XG5cbiAgICB2YXIgUE9TSVRJT047XHJcbiAgICAoZnVuY3Rpb24gKFBPU0lUSU9OKSB7XHJcbiAgICAgICAgUE9TSVRJT05bUE9TSVRJT05bXCJTVEFUSUNcIl0gPSAwXSA9IFwiU1RBVElDXCI7XHJcbiAgICAgICAgUE9TSVRJT05bUE9TSVRJT05bXCJSRUxBVElWRVwiXSA9IDFdID0gXCJSRUxBVElWRVwiO1xyXG4gICAgICAgIFBPU0lUSU9OW1BPU0lUSU9OW1wiQUJTT0xVVEVcIl0gPSAyXSA9IFwiQUJTT0xVVEVcIjtcclxuICAgICAgICBQT1NJVElPTltQT1NJVElPTltcIkZJWEVEXCJdID0gM10gPSBcIkZJWEVEXCI7XHJcbiAgICAgICAgUE9TSVRJT05bUE9TSVRJT05bXCJTVElDS1lcIl0gPSA0XSA9IFwiU1RJQ0tZXCI7XHJcbiAgICB9KShQT1NJVElPTiB8fCAoUE9TSVRJT04gPSB7fSkpO1xyXG4gICAgdmFyIHBvc2l0aW9uID0ge1xyXG4gICAgICAgIG5hbWU6ICdwb3NpdGlvbicsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnc3RhdGljJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLklERU5UX1ZBTFVFLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAocG9zaXRpb24pIHtcclxuICAgICAgICAgICAgc3dpdGNoIChwb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncmVsYXRpdmUnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQT1NJVElPTi5SRUxBVElWRTtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Fic29sdXRlJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUE9TSVRJT04uQUJTT0xVVEU7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdmaXhlZCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFBPU0lUSU9OLkZJWEVEO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3RpY2t5JzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUE9TSVRJT04uU1RJQ0tZO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBQT1NJVElPTi5TVEFUSUM7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciB0ZXh0U2hhZG93ID0ge1xyXG4gICAgICAgIG5hbWU6ICd0ZXh0LXNoYWRvdycsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnbm9uZScsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuTElTVCxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbnMubGVuZ3RoID09PSAxICYmIGlzSWRlbnRXaXRoVmFsdWUodG9rZW5zWzBdLCAnbm9uZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRnVuY3Rpb25BcmdzKHRva2VucykubWFwKGZ1bmN0aW9uICh2YWx1ZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaGFkb3cgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IENPTE9SUy5UUkFOU1BBUkVOVCxcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRYOiBaRVJPX0xFTkdUSCxcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRZOiBaRVJPX0xFTkdUSCxcclxuICAgICAgICAgICAgICAgICAgICBibHVyOiBaRVJPX0xFTkdUSFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHZhciBjID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRva2VuID0gdmFsdWVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0xlbmd0aCh0b2tlbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYWRvdy5vZmZzZXRYID0gdG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYyA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhZG93Lm9mZnNldFkgPSB0b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYWRvdy5ibHVyID0gdG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYysrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hhZG93LmNvbG9yID0gY29sb3IucGFyc2UodG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBzaGFkb3c7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XG5cbiAgICB2YXIgVEVYVF9UUkFOU0ZPUk07XHJcbiAgICAoZnVuY3Rpb24gKFRFWFRfVFJBTlNGT1JNKSB7XHJcbiAgICAgICAgVEVYVF9UUkFOU0ZPUk1bVEVYVF9UUkFOU0ZPUk1bXCJOT05FXCJdID0gMF0gPSBcIk5PTkVcIjtcclxuICAgICAgICBURVhUX1RSQU5TRk9STVtURVhUX1RSQU5TRk9STVtcIkxPV0VSQ0FTRVwiXSA9IDFdID0gXCJMT1dFUkNBU0VcIjtcclxuICAgICAgICBURVhUX1RSQU5TRk9STVtURVhUX1RSQU5TRk9STVtcIlVQUEVSQ0FTRVwiXSA9IDJdID0gXCJVUFBFUkNBU0VcIjtcclxuICAgICAgICBURVhUX1RSQU5TRk9STVtURVhUX1RSQU5TRk9STVtcIkNBUElUQUxJWkVcIl0gPSAzXSA9IFwiQ0FQSVRBTElaRVwiO1xyXG4gICAgfSkoVEVYVF9UUkFOU0ZPUk0gfHwgKFRFWFRfVFJBTlNGT1JNID0ge30pKTtcclxuICAgIHZhciB0ZXh0VHJhbnNmb3JtID0ge1xyXG4gICAgICAgIG5hbWU6ICd0ZXh0LXRyYW5zZm9ybScsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnbm9uZScsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5JREVOVF9WQUxVRSxcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHRleHRUcmFuc2Zvcm0pIHtcclxuICAgICAgICAgICAgc3dpdGNoICh0ZXh0VHJhbnNmb3JtKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd1cHBlcmNhc2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBURVhUX1RSQU5TRk9STS5VUFBFUkNBU0U7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsb3dlcmNhc2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBURVhUX1RSQU5TRk9STS5MT1dFUkNBU0U7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjYXBpdGFsaXplJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVEVYVF9UUkFOU0ZPUk0uQ0FQSVRBTElaRTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gVEVYVF9UUkFOU0ZPUk0uTk9ORTtcclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIHRyYW5zZm9ybSA9IHtcclxuICAgICAgICBuYW1lOiAndHJhbnNmb3JtJyxcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICdub25lJyxcclxuICAgICAgICBwcmVmaXg6IHRydWUsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuVkFMVUUsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh0b2tlbikge1xyXG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLklERU5UX1RPS0VOICYmIHRva2VuLnZhbHVlID09PSAnbm9uZScpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuRlVOQ1RJT04pIHtcclxuICAgICAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1GdW5jdGlvbiA9IFNVUFBPUlRFRF9UUkFOU0ZPUk1fRlVOQ1RJT05TW3Rva2VuLm5hbWVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0cmFuc2Zvcm1GdW5jdGlvbiA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdHRlbXB0aW5nIHRvIHBhcnNlIGFuIHVuc3VwcG9ydGVkIHRyYW5zZm9ybSBmdW5jdGlvbiBcXFwiXCIgKyB0b2tlbi5uYW1lICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybUZ1bmN0aW9uKHRva2VuLnZhbHVlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHZhciBtYXRyaXggPSBmdW5jdGlvbiAoYXJncykge1xyXG4gICAgICAgIHZhciB2YWx1ZXMgPSBhcmdzLmZpbHRlcihmdW5jdGlvbiAoYXJnKSB7IHJldHVybiBhcmcudHlwZSA9PT0gVG9rZW5UeXBlLk5VTUJFUl9UT0tFTjsgfSkubWFwKGZ1bmN0aW9uIChhcmcpIHsgcmV0dXJuIGFyZy5udW1iZXI7IH0pO1xyXG4gICAgICAgIHJldHVybiB2YWx1ZXMubGVuZ3RoID09PSA2ID8gdmFsdWVzIDogbnVsbDtcclxuICAgIH07XHJcbiAgICAvLyBkb2Vzbid0IHN1cHBvcnQgM0QgdHJhbnNmb3JtcyBhdCB0aGUgbW9tZW50XHJcbiAgICB2YXIgbWF0cml4M2QgPSBmdW5jdGlvbiAoYXJncykge1xyXG4gICAgICAgIHZhciB2YWx1ZXMgPSBhcmdzLmZpbHRlcihmdW5jdGlvbiAoYXJnKSB7IHJldHVybiBhcmcudHlwZSA9PT0gVG9rZW5UeXBlLk5VTUJFUl9UT0tFTjsgfSkubWFwKGZ1bmN0aW9uIChhcmcpIHsgcmV0dXJuIGFyZy5udW1iZXI7IH0pO1xyXG4gICAgICAgIHZhciBhMSA9IHZhbHVlc1swXSwgYjEgPSB2YWx1ZXNbMV0sIF9hID0gdmFsdWVzWzJdLCBfYiA9IHZhbHVlc1szXSwgYTIgPSB2YWx1ZXNbNF0sIGIyID0gdmFsdWVzWzVdLCBfYyA9IHZhbHVlc1s2XSwgX2QgPSB2YWx1ZXNbN10sIF9lID0gdmFsdWVzWzhdLCBfZiA9IHZhbHVlc1s5XSwgX2cgPSB2YWx1ZXNbMTBdLCBfaCA9IHZhbHVlc1sxMV0sIGE0ID0gdmFsdWVzWzEyXSwgYjQgPSB2YWx1ZXNbMTNdLCBfaiA9IHZhbHVlc1sxNF0sIF9rID0gdmFsdWVzWzE1XTtcclxuICAgICAgICByZXR1cm4gdmFsdWVzLmxlbmd0aCA9PT0gMTYgPyBbYTEsIGIxLCBhMiwgYjIsIGE0LCBiNF0gOiBudWxsO1xyXG4gICAgfTtcclxuICAgIHZhciBTVVBQT1JURURfVFJBTlNGT1JNX0ZVTkNUSU9OUyA9IHtcclxuICAgICAgICBtYXRyaXg6IG1hdHJpeCxcclxuICAgICAgICBtYXRyaXgzZDogbWF0cml4M2RcclxuICAgIH07XG5cbiAgICB2YXIgREVGQVVMVF9WQUxVRSA9IHtcclxuICAgICAgICB0eXBlOiBUb2tlblR5cGUuUEVSQ0VOVEFHRV9UT0tFTixcclxuICAgICAgICBudW1iZXI6IDUwLFxyXG4gICAgICAgIGZsYWdzOiBGTEFHX0lOVEVHRVJcclxuICAgIH07XHJcbiAgICB2YXIgREVGQVVMVCA9IFtERUZBVUxUX1ZBTFVFLCBERUZBVUxUX1ZBTFVFXTtcclxuICAgIHZhciB0cmFuc2Zvcm1PcmlnaW4gPSB7XHJcbiAgICAgICAgbmFtZTogJ3RyYW5zZm9ybS1vcmlnaW4nLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJzUwJSA1MCUnLFxyXG4gICAgICAgIHByZWZpeDogdHJ1ZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5MSVNULFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgICAgIHZhciBvcmlnaW5zID0gdG9rZW5zLmZpbHRlcihpc0xlbmd0aFBlcmNlbnRhZ2UpO1xyXG4gICAgICAgICAgICBpZiAob3JpZ2lucy5sZW5ndGggIT09IDIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBERUZBVUxUO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBbb3JpZ2luc1swXSwgb3JpZ2luc1sxXV07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBWSVNJQklMSVRZO1xyXG4gICAgKGZ1bmN0aW9uIChWSVNJQklMSVRZKSB7XHJcbiAgICAgICAgVklTSUJJTElUWVtWSVNJQklMSVRZW1wiVklTSUJMRVwiXSA9IDBdID0gXCJWSVNJQkxFXCI7XHJcbiAgICAgICAgVklTSUJJTElUWVtWSVNJQklMSVRZW1wiSElEREVOXCJdID0gMV0gPSBcIkhJRERFTlwiO1xyXG4gICAgICAgIFZJU0lCSUxJVFlbVklTSUJJTElUWVtcIkNPTExBUFNFXCJdID0gMl0gPSBcIkNPTExBUFNFXCI7XHJcbiAgICB9KShWSVNJQklMSVRZIHx8IChWSVNJQklMSVRZID0ge30pKTtcclxuICAgIHZhciB2aXNpYmlsaXR5ID0ge1xyXG4gICAgICAgIG5hbWU6ICd2aXNpYmxlJyxcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICdub25lJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLklERU5UX1ZBTFVFLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodmlzaWJpbGl0eSkge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHZpc2liaWxpdHkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2hpZGRlbic6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFZJU0lCSUxJVFkuSElEREVOO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY29sbGFwc2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBWSVNJQklMSVRZLkNPTExBUFNFO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndmlzaWJsZSc6XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBWSVNJQklMSVRZLlZJU0lCTEU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIFdPUkRfQlJFQUs7XHJcbiAgICAoZnVuY3Rpb24gKFdPUkRfQlJFQUspIHtcclxuICAgICAgICBXT1JEX0JSRUFLW1wiTk9STUFMXCJdID0gXCJub3JtYWxcIjtcclxuICAgICAgICBXT1JEX0JSRUFLW1wiQlJFQUtfQUxMXCJdID0gXCJicmVhay1hbGxcIjtcclxuICAgICAgICBXT1JEX0JSRUFLW1wiS0VFUF9BTExcIl0gPSBcImtlZXAtYWxsXCI7XHJcbiAgICB9KShXT1JEX0JSRUFLIHx8IChXT1JEX0JSRUFLID0ge30pKTtcclxuICAgIHZhciB3b3JkQnJlYWsgPSB7XHJcbiAgICAgICAgbmFtZTogJ3dvcmQtYnJlYWsnLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ25vcm1hbCcsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5JREVOVF9WQUxVRSxcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHdvcmRCcmVhaykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHdvcmRCcmVhaykge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYnJlYWstYWxsJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gV09SRF9CUkVBSy5CUkVBS19BTEw7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdrZWVwLWFsbCc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFdPUkRfQlJFQUsuS0VFUF9BTEw7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdub3JtYWwnOlxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gV09SRF9CUkVBSy5OT1JNQUw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIHpJbmRleCA9IHtcclxuICAgICAgICBuYW1lOiAnei1pbmRleCcsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnYXV0bycsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5WQUxVRSxcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuSURFTlRfVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IGF1dG86IHRydWUsIG9yZGVyOiAwIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzTnVtYmVyVG9rZW4odG9rZW4pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyBhdXRvOiBmYWxzZSwgb3JkZXI6IHRva2VuLm51bWJlciB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgei1pbmRleCBudW1iZXIgcGFyc2VkXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XG5cbiAgICB2YXIgb3BhY2l0eSA9IHtcclxuICAgICAgICBuYW1lOiAnb3BhY2l0eScsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnMScsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuVkFMVUUsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHRva2VuKSB7XHJcbiAgICAgICAgICAgIGlmIChpc051bWJlclRva2VuKHRva2VuKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuLm51bWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIHRleHREZWNvcmF0aW9uQ29sb3IgPSB7XHJcbiAgICAgICAgbmFtZTogXCJ0ZXh0LWRlY29yYXRpb24tY29sb3JcIixcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5UWVBFX1ZBTFVFLFxyXG4gICAgICAgIGZvcm1hdDogJ2NvbG9yJ1xyXG4gICAgfTtcblxuICAgIHZhciB0ZXh0RGVjb3JhdGlvbkxpbmUgPSB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtZGVjb3JhdGlvbi1saW5lJyxcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICdub25lJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLkxJU1QsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRva2Vuc1xyXG4gICAgICAgICAgICAgICAgLmZpbHRlcihpc0lkZW50VG9rZW4pXHJcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uICh0b2tlbikge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0b2tlbi52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3VuZGVybGluZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxIC8qIFVOREVSTElORSAqLztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdvdmVybGluZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAyIC8qIE9WRVJMSU5FICovO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xpbmUtdGhyb3VnaCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAzIC8qIExJTkVfVEhST1VHSCAqLztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdub25lJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDQgLyogQkxJTksgKi87XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMCAvKiBOT05FICovO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAobGluZSkgeyByZXR1cm4gbGluZSAhPT0gMCAvKiBOT05FICovOyB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIGZvbnRGYW1pbHkgPSB7XHJcbiAgICAgICAgbmFtZTogXCJmb250LWZhbWlseVwiLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJycsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5MSVNULFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgICAgIHZhciBhY2N1bXVsYXRvciA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgICAgICB0b2tlbnMuZm9yRWFjaChmdW5jdGlvbiAodG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVG9rZW5UeXBlLklERU5UX1RPS0VOOlxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVG9rZW5UeXBlLlNUUklOR19UT0tFTjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjdW11bGF0b3IucHVzaCh0b2tlbi52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVG9rZW5UeXBlLk5VTUJFUl9UT0tFTjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjdW11bGF0b3IucHVzaCh0b2tlbi5udW1iZXIudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVG9rZW5UeXBlLkNPTU1BX1RPS0VOOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goYWNjdW11bGF0b3Iuam9pbignICcpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjdW11bGF0b3IubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoYWNjdW11bGF0b3IubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goYWNjdW11bGF0b3Iuam9pbignICcpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cy5tYXAoZnVuY3Rpb24gKHJlc3VsdCkgeyByZXR1cm4gKHJlc3VsdC5pbmRleE9mKCcgJykgPT09IC0xID8gcmVzdWx0IDogXCInXCIgKyByZXN1bHQgKyBcIidcIik7IH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XG5cbiAgICB2YXIgZm9udFNpemUgPSB7XHJcbiAgICAgICAgbmFtZTogXCJmb250LXNpemVcIixcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICcwJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLlRZUEVfVkFMVUUsXHJcbiAgICAgICAgZm9ybWF0OiAnbGVuZ3RoJ1xyXG4gICAgfTtcblxuICAgIHZhciBmb250V2VpZ2h0ID0ge1xyXG4gICAgICAgIG5hbWU6ICdmb250LXdlaWdodCcsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnbm9ybWFsJyxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5WQUxVRSxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW4pIHtcclxuICAgICAgICAgICAgaWYgKGlzTnVtYmVyVG9rZW4odG9rZW4pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ubnVtYmVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc0lkZW50VG9rZW4odG9rZW4pKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9sZCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA3MDA7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbm9ybWFsJzpcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gNDAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiA0MDA7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBmb250VmFyaWFudCA9IHtcclxuICAgICAgICBuYW1lOiAnZm9udC12YXJpYW50JyxcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICdub25lJyxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5MSVNULFxyXG4gICAgICAgIHByZWZpeDogZmFsc2UsXHJcbiAgICAgICAgcGFyc2U6IGZ1bmN0aW9uICh0b2tlbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRva2Vucy5maWx0ZXIoaXNJZGVudFRva2VuKS5tYXAoZnVuY3Rpb24gKHRva2VuKSB7IHJldHVybiB0b2tlbi52YWx1ZTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBGT05UX1NUWUxFO1xyXG4gICAgKGZ1bmN0aW9uIChGT05UX1NUWUxFKSB7XHJcbiAgICAgICAgRk9OVF9TVFlMRVtcIk5PUk1BTFwiXSA9IFwibm9ybWFsXCI7XHJcbiAgICAgICAgRk9OVF9TVFlMRVtcIklUQUxJQ1wiXSA9IFwiaXRhbGljXCI7XHJcbiAgICAgICAgRk9OVF9TVFlMRVtcIk9CTElRVUVcIl0gPSBcIm9ibGlxdWVcIjtcclxuICAgIH0pKEZPTlRfU1RZTEUgfHwgKEZPTlRfU1RZTEUgPSB7fSkpO1xyXG4gICAgdmFyIGZvbnRTdHlsZSA9IHtcclxuICAgICAgICBuYW1lOiAnZm9udC1zdHlsZScsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnbm9ybWFsJyxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLklERU5UX1ZBTFVFLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAob3ZlcmZsb3cpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChvdmVyZmxvdykge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnb2JsaXF1ZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZPTlRfU1RZTEUuT0JMSVFVRTtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2l0YWxpYyc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZPTlRfU1RZTEUuSVRBTElDO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbm9ybWFsJzpcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEZPTlRfU1RZTEUuTk9STUFMO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBjb250YWlucyA9IGZ1bmN0aW9uIChiaXQsIHZhbHVlKSB7IHJldHVybiAoYml0ICYgdmFsdWUpICE9PSAwOyB9O1xuXG4gICAgdmFyIGNvbnRlbnQgPSB7XHJcbiAgICAgICAgbmFtZTogJ2NvbnRlbnQnLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ25vbmUnLFxyXG4gICAgICAgIHR5cGU6IFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLkxJU1QsXHJcbiAgICAgICAgcHJlZml4OiBmYWxzZSxcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHRva2Vucykge1xyXG4gICAgICAgICAgICBpZiAodG9rZW5zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBmaXJzdCA9IHRva2Vuc1swXTtcclxuICAgICAgICAgICAgaWYgKGZpcnN0LnR5cGUgPT09IFRva2VuVHlwZS5JREVOVF9UT0tFTiAmJiBmaXJzdC52YWx1ZSA9PT0gJ25vbmUnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRva2VucztcclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIGNvdW50ZXJJbmNyZW1lbnQgPSB7XHJcbiAgICAgICAgbmFtZTogJ2NvdW50ZXItaW5jcmVtZW50JyxcclxuICAgICAgICBpbml0aWFsVmFsdWU6ICdub25lJyxcclxuICAgICAgICBwcmVmaXg6IHRydWUsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuTElTVCxcclxuICAgICAgICBwYXJzZTogZnVuY3Rpb24gKHRva2Vucykge1xyXG4gICAgICAgICAgICBpZiAodG9rZW5zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGZpcnN0ID0gdG9rZW5zWzBdO1xyXG4gICAgICAgICAgICBpZiAoZmlyc3QudHlwZSA9PT0gVG9rZW5UeXBlLklERU5UX1RPS0VOICYmIGZpcnN0LnZhbHVlID09PSAnbm9uZScpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBpbmNyZW1lbnRzID0gW107XHJcbiAgICAgICAgICAgIHZhciBmaWx0ZXJlZCA9IHRva2Vucy5maWx0ZXIobm9uV2hpdGVTcGFjZSk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsdGVyZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb3VudGVyID0gZmlsdGVyZWRbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGZpbHRlcmVkW2kgKyAxXTtcclxuICAgICAgICAgICAgICAgIGlmIChjb3VudGVyLnR5cGUgPT09IFRva2VuVHlwZS5JREVOVF9UT0tFTikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmNyZW1lbnQgPSBuZXh0ICYmIGlzTnVtYmVyVG9rZW4obmV4dCkgPyBuZXh0Lm51bWJlciA6IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50cy5wdXNoKHsgY291bnRlcjogY291bnRlci52YWx1ZSwgaW5jcmVtZW50OiBpbmNyZW1lbnQgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGluY3JlbWVudHM7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBjb3VudGVyUmVzZXQgPSB7XHJcbiAgICAgICAgbmFtZTogJ2NvdW50ZXItcmVzZXQnLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ25vbmUnLFxyXG4gICAgICAgIHByZWZpeDogdHJ1ZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5MSVNULFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHJlc2V0cyA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSB0b2tlbnMuZmlsdGVyKG5vbldoaXRlU3BhY2UpO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbHRlcmVkLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnRlciA9IGZpbHRlcmVkW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIG5leHQgPSBmaWx0ZXJlZFtpICsgMV07XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNJZGVudFRva2VuKGNvdW50ZXIpICYmIGNvdW50ZXIudmFsdWUgIT09ICdub25lJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXNldCA9IG5leHQgJiYgaXNOdW1iZXJUb2tlbihuZXh0KSA/IG5leHQubnVtYmVyIDogMDtcclxuICAgICAgICAgICAgICAgICAgICByZXNldHMucHVzaCh7IGNvdW50ZXI6IGNvdW50ZXIudmFsdWUsIHJlc2V0OiByZXNldCB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzZXRzO1xyXG4gICAgICAgIH1cclxuICAgIH07XG5cbiAgICB2YXIgcXVvdGVzID0ge1xyXG4gICAgICAgIG5hbWU6ICdxdW90ZXMnLFxyXG4gICAgICAgIGluaXRpYWxWYWx1ZTogJ25vbmUnLFxyXG4gICAgICAgIHByZWZpeDogdHJ1ZSxcclxuICAgICAgICB0eXBlOiBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5MSVNULFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgZmlyc3QgPSB0b2tlbnNbMF07XHJcbiAgICAgICAgICAgIGlmIChmaXJzdC50eXBlID09PSBUb2tlblR5cGUuSURFTlRfVE9LRU4gJiYgZmlyc3QudmFsdWUgPT09ICdub25lJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHF1b3RlcyA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSB0b2tlbnMuZmlsdGVyKGlzU3RyaW5nVG9rZW4pO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyZWQubGVuZ3RoICUgMiAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWx0ZXJlZC5sZW5ndGg7IGkgKz0gMikge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9wZW5fMSA9IGZpbHRlcmVkW2ldLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNsb3NlXzEgPSBmaWx0ZXJlZFtpICsgMV0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICBxdW90ZXMucHVzaCh7IG9wZW46IG9wZW5fMSwgY2xvc2U6IGNsb3NlXzEgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHF1b3RlcztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdmFyIGdldFF1b3RlID0gZnVuY3Rpb24gKHF1b3RlcywgZGVwdGgsIG9wZW4pIHtcclxuICAgICAgICBpZiAoIXF1b3Rlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBxdW90ZSA9IHF1b3Rlc1tNYXRoLm1pbihkZXB0aCwgcXVvdGVzLmxlbmd0aCAtIDEpXTtcclxuICAgICAgICBpZiAoIXF1b3RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9wZW4gPyBxdW90ZS5vcGVuIDogcXVvdGUuY2xvc2U7XHJcbiAgICB9O1xuXG4gICAgdmFyIGJveFNoYWRvdyA9IHtcclxuICAgICAgICBuYW1lOiAnYm94LXNoYWRvdycsXHJcbiAgICAgICAgaW5pdGlhbFZhbHVlOiAnbm9uZScsXHJcbiAgICAgICAgdHlwZTogUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuTElTVCxcclxuICAgICAgICBwcmVmaXg6IGZhbHNlLFxyXG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbiAodG9rZW5zKSB7XHJcbiAgICAgICAgICAgIGlmICh0b2tlbnMubGVuZ3RoID09PSAxICYmIGlzSWRlbnRXaXRoVmFsdWUodG9rZW5zWzBdLCAnbm9uZScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRnVuY3Rpb25BcmdzKHRva2VucykubWFwKGZ1bmN0aW9uICh2YWx1ZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaGFkb3cgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IDB4MDAwMDAwZmYsXHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0WDogWkVST19MRU5HVEgsXHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0WTogWkVST19MRU5HVEgsXHJcbiAgICAgICAgICAgICAgICAgICAgYmx1cjogWkVST19MRU5HVEgsXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByZWFkOiBaRVJPX0xFTkdUSCxcclxuICAgICAgICAgICAgICAgICAgICBpbnNldDogZmFsc2VcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgYyA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHZhbHVlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNJZGVudFdpdGhWYWx1ZSh0b2tlbiwgJ2luc2V0JykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hhZG93Lmluc2V0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNMZW5ndGgodG9rZW4pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFkb3cub2Zmc2V0WCA9IHRva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGMgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYWRvdy5vZmZzZXRZID0gdG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYyA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhZG93LmJsdXIgPSB0b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoYWRvdy5zcHJlYWQgPSB0b2tlbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGFkb3cuY29sb3IgPSBjb2xvci5wYXJzZSh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNoYWRvdztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBDU1NQYXJzZWREZWNsYXJhdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBDU1NQYXJzZWREZWNsYXJhdGlvbihkZWNsYXJhdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRDbGlwID0gcGFyc2UoYmFja2dyb3VuZENsaXAsIGRlY2xhcmF0aW9uLmJhY2tncm91bmRDbGlwKTtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBwYXJzZShiYWNrZ3JvdW5kQ29sb3IsIGRlY2xhcmF0aW9uLmJhY2tncm91bmRDb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZEltYWdlID0gcGFyc2UoYmFja2dyb3VuZEltYWdlLCBkZWNsYXJhdGlvbi5iYWNrZ3JvdW5kSW1hZ2UpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRPcmlnaW4gPSBwYXJzZShiYWNrZ3JvdW5kT3JpZ2luLCBkZWNsYXJhdGlvbi5iYWNrZ3JvdW5kT3JpZ2luKTtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kUG9zaXRpb24gPSBwYXJzZShiYWNrZ3JvdW5kUG9zaXRpb24sIGRlY2xhcmF0aW9uLmJhY2tncm91bmRQb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZFJlcGVhdCA9IHBhcnNlKGJhY2tncm91bmRSZXBlYXQsIGRlY2xhcmF0aW9uLmJhY2tncm91bmRSZXBlYXQpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRTaXplID0gcGFyc2UoYmFja2dyb3VuZFNpemUsIGRlY2xhcmF0aW9uLmJhY2tncm91bmRTaXplKTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJUb3BDb2xvciA9IHBhcnNlKGJvcmRlclRvcENvbG9yLCBkZWNsYXJhdGlvbi5ib3JkZXJUb3BDb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyUmlnaHRDb2xvciA9IHBhcnNlKGJvcmRlclJpZ2h0Q29sb3IsIGRlY2xhcmF0aW9uLmJvcmRlclJpZ2h0Q29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmJvcmRlckJvdHRvbUNvbG9yID0gcGFyc2UoYm9yZGVyQm90dG9tQ29sb3IsIGRlY2xhcmF0aW9uLmJvcmRlckJvdHRvbUNvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJMZWZ0Q29sb3IgPSBwYXJzZShib3JkZXJMZWZ0Q29sb3IsIGRlY2xhcmF0aW9uLmJvcmRlckxlZnRDb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyVG9wTGVmdFJhZGl1cyA9IHBhcnNlKGJvcmRlclRvcExlZnRSYWRpdXMsIGRlY2xhcmF0aW9uLmJvcmRlclRvcExlZnRSYWRpdXMpO1xyXG4gICAgICAgICAgICB0aGlzLmJvcmRlclRvcFJpZ2h0UmFkaXVzID0gcGFyc2UoYm9yZGVyVG9wUmlnaHRSYWRpdXMsIGRlY2xhcmF0aW9uLmJvcmRlclRvcFJpZ2h0UmFkaXVzKTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJCb3R0b21SaWdodFJhZGl1cyA9IHBhcnNlKGJvcmRlckJvdHRvbVJpZ2h0UmFkaXVzLCBkZWNsYXJhdGlvbi5ib3JkZXJCb3R0b21SaWdodFJhZGl1cyk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyQm90dG9tTGVmdFJhZGl1cyA9IHBhcnNlKGJvcmRlckJvdHRvbUxlZnRSYWRpdXMsIGRlY2xhcmF0aW9uLmJvcmRlckJvdHRvbUxlZnRSYWRpdXMpO1xyXG4gICAgICAgICAgICB0aGlzLmJvcmRlclRvcFN0eWxlID0gcGFyc2UoYm9yZGVyVG9wU3R5bGUsIGRlY2xhcmF0aW9uLmJvcmRlclRvcFN0eWxlKTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJSaWdodFN0eWxlID0gcGFyc2UoYm9yZGVyUmlnaHRTdHlsZSwgZGVjbGFyYXRpb24uYm9yZGVyUmlnaHRTdHlsZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyQm90dG9tU3R5bGUgPSBwYXJzZShib3JkZXJCb3R0b21TdHlsZSwgZGVjbGFyYXRpb24uYm9yZGVyQm90dG9tU3R5bGUpO1xyXG4gICAgICAgICAgICB0aGlzLmJvcmRlckxlZnRTdHlsZSA9IHBhcnNlKGJvcmRlckxlZnRTdHlsZSwgZGVjbGFyYXRpb24uYm9yZGVyTGVmdFN0eWxlKTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJUb3BXaWR0aCA9IHBhcnNlKGJvcmRlclRvcFdpZHRoLCBkZWNsYXJhdGlvbi5ib3JkZXJUb3BXaWR0aCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyUmlnaHRXaWR0aCA9IHBhcnNlKGJvcmRlclJpZ2h0V2lkdGgsIGRlY2xhcmF0aW9uLmJvcmRlclJpZ2h0V2lkdGgpO1xyXG4gICAgICAgICAgICB0aGlzLmJvcmRlckJvdHRvbVdpZHRoID0gcGFyc2UoYm9yZGVyQm90dG9tV2lkdGgsIGRlY2xhcmF0aW9uLmJvcmRlckJvdHRvbVdpZHRoKTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJMZWZ0V2lkdGggPSBwYXJzZShib3JkZXJMZWZ0V2lkdGgsIGRlY2xhcmF0aW9uLmJvcmRlckxlZnRXaWR0aCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm94U2hhZG93ID0gcGFyc2UoYm94U2hhZG93LCBkZWNsYXJhdGlvbi5ib3hTaGFkb3cpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbG9yID0gcGFyc2UoY29sb3IkMSwgZGVjbGFyYXRpb24uY29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkgPSBwYXJzZShkaXNwbGF5LCBkZWNsYXJhdGlvbi5kaXNwbGF5KTtcclxuICAgICAgICAgICAgdGhpcy5mbG9hdCA9IHBhcnNlKGZsb2F0LCBkZWNsYXJhdGlvbi5jc3NGbG9hdCk7XHJcbiAgICAgICAgICAgIHRoaXMuZm9udEZhbWlseSA9IHBhcnNlKGZvbnRGYW1pbHksIGRlY2xhcmF0aW9uLmZvbnRGYW1pbHkpO1xyXG4gICAgICAgICAgICB0aGlzLmZvbnRTaXplID0gcGFyc2UoZm9udFNpemUsIGRlY2xhcmF0aW9uLmZvbnRTaXplKTtcclxuICAgICAgICAgICAgdGhpcy5mb250U3R5bGUgPSBwYXJzZShmb250U3R5bGUsIGRlY2xhcmF0aW9uLmZvbnRTdHlsZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZm9udFZhcmlhbnQgPSBwYXJzZShmb250VmFyaWFudCwgZGVjbGFyYXRpb24uZm9udFZhcmlhbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmZvbnRXZWlnaHQgPSBwYXJzZShmb250V2VpZ2h0LCBkZWNsYXJhdGlvbi5mb250V2VpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5sZXR0ZXJTcGFjaW5nID0gcGFyc2UobGV0dGVyU3BhY2luZywgZGVjbGFyYXRpb24ubGV0dGVyU3BhY2luZyk7XHJcbiAgICAgICAgICAgIHRoaXMubGluZUJyZWFrID0gcGFyc2UobGluZUJyZWFrLCBkZWNsYXJhdGlvbi5saW5lQnJlYWspO1xyXG4gICAgICAgICAgICB0aGlzLmxpbmVIZWlnaHQgPSBwYXJzZShsaW5lSGVpZ2h0LCBkZWNsYXJhdGlvbi5saW5lSGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5saXN0U3R5bGVJbWFnZSA9IHBhcnNlKGxpc3RTdHlsZUltYWdlLCBkZWNsYXJhdGlvbi5saXN0U3R5bGVJbWFnZSk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdFN0eWxlUG9zaXRpb24gPSBwYXJzZShsaXN0U3R5bGVQb3NpdGlvbiwgZGVjbGFyYXRpb24ubGlzdFN0eWxlUG9zaXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RTdHlsZVR5cGUgPSBwYXJzZShsaXN0U3R5bGVUeXBlLCBkZWNsYXJhdGlvbi5saXN0U3R5bGVUeXBlKTtcclxuICAgICAgICAgICAgdGhpcy5tYXJnaW5Ub3AgPSBwYXJzZShtYXJnaW5Ub3AsIGRlY2xhcmF0aW9uLm1hcmdpblRvcCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFyZ2luUmlnaHQgPSBwYXJzZShtYXJnaW5SaWdodCwgZGVjbGFyYXRpb24ubWFyZ2luUmlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcmdpbkJvdHRvbSA9IHBhcnNlKG1hcmdpbkJvdHRvbSwgZGVjbGFyYXRpb24ubWFyZ2luQm90dG9tKTtcclxuICAgICAgICAgICAgdGhpcy5tYXJnaW5MZWZ0ID0gcGFyc2UobWFyZ2luTGVmdCwgZGVjbGFyYXRpb24ubWFyZ2luTGVmdCk7XHJcbiAgICAgICAgICAgIHRoaXMub3BhY2l0eSA9IHBhcnNlKG9wYWNpdHksIGRlY2xhcmF0aW9uLm9wYWNpdHkpO1xyXG4gICAgICAgICAgICB2YXIgb3ZlcmZsb3dUdXBsZSA9IHBhcnNlKG92ZXJmbG93LCBkZWNsYXJhdGlvbi5vdmVyZmxvdyk7XHJcbiAgICAgICAgICAgIHRoaXMub3ZlcmZsb3dYID0gb3ZlcmZsb3dUdXBsZVswXTtcclxuICAgICAgICAgICAgdGhpcy5vdmVyZmxvd1kgPSBvdmVyZmxvd1R1cGxlW292ZXJmbG93VHVwbGUubGVuZ3RoID4gMSA/IDEgOiAwXTtcclxuICAgICAgICAgICAgdGhpcy5vdmVyZmxvd1dyYXAgPSBwYXJzZShvdmVyZmxvd1dyYXAsIGRlY2xhcmF0aW9uLm92ZXJmbG93V3JhcCk7XHJcbiAgICAgICAgICAgIHRoaXMucGFkZGluZ1RvcCA9IHBhcnNlKHBhZGRpbmdUb3AsIGRlY2xhcmF0aW9uLnBhZGRpbmdUb3ApO1xyXG4gICAgICAgICAgICB0aGlzLnBhZGRpbmdSaWdodCA9IHBhcnNlKHBhZGRpbmdSaWdodCwgZGVjbGFyYXRpb24ucGFkZGluZ1JpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5wYWRkaW5nQm90dG9tID0gcGFyc2UocGFkZGluZ0JvdHRvbSwgZGVjbGFyYXRpb24ucGFkZGluZ0JvdHRvbSk7XHJcbiAgICAgICAgICAgIHRoaXMucGFkZGluZ0xlZnQgPSBwYXJzZShwYWRkaW5nTGVmdCwgZGVjbGFyYXRpb24ucGFkZGluZ0xlZnQpO1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gcGFyc2UocG9zaXRpb24sIGRlY2xhcmF0aW9uLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0QWxpZ24gPSBwYXJzZSh0ZXh0QWxpZ24sIGRlY2xhcmF0aW9uLnRleHRBbGlnbik7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dERlY29yYXRpb25Db2xvciA9IHBhcnNlKHRleHREZWNvcmF0aW9uQ29sb3IsIGRlY2xhcmF0aW9uLnRleHREZWNvcmF0aW9uQ29sb3IgfHwgZGVjbGFyYXRpb24uY29sb3IpO1xyXG4gICAgICAgICAgICB0aGlzLnRleHREZWNvcmF0aW9uTGluZSA9IHBhcnNlKHRleHREZWNvcmF0aW9uTGluZSwgZGVjbGFyYXRpb24udGV4dERlY29yYXRpb25MaW5lKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0U2hhZG93ID0gcGFyc2UodGV4dFNoYWRvdywgZGVjbGFyYXRpb24udGV4dFNoYWRvdyk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dFRyYW5zZm9ybSA9IHBhcnNlKHRleHRUcmFuc2Zvcm0sIGRlY2xhcmF0aW9uLnRleHRUcmFuc2Zvcm0pO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHBhcnNlKHRyYW5zZm9ybSwgZGVjbGFyYXRpb24udHJhbnNmb3JtKTtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1PcmlnaW4gPSBwYXJzZSh0cmFuc2Zvcm1PcmlnaW4sIGRlY2xhcmF0aW9uLnRyYW5zZm9ybU9yaWdpbik7XHJcbiAgICAgICAgICAgIHRoaXMudmlzaWJpbGl0eSA9IHBhcnNlKHZpc2liaWxpdHksIGRlY2xhcmF0aW9uLnZpc2liaWxpdHkpO1xyXG4gICAgICAgICAgICB0aGlzLndvcmRCcmVhayA9IHBhcnNlKHdvcmRCcmVhaywgZGVjbGFyYXRpb24ud29yZEJyZWFrKTtcclxuICAgICAgICAgICAgdGhpcy56SW5kZXggPSBwYXJzZSh6SW5kZXgsIGRlY2xhcmF0aW9uLnpJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIENTU1BhcnNlZERlY2xhcmF0aW9uLnByb3RvdHlwZS5pc1Zpc2libGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpc3BsYXkgPiAwICYmIHRoaXMub3BhY2l0eSA+IDAgJiYgdGhpcy52aXNpYmlsaXR5ID09PSBWSVNJQklMSVRZLlZJU0lCTEU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDU1NQYXJzZWREZWNsYXJhdGlvbi5wcm90b3R5cGUuaXNUcmFuc3BhcmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlzVHJhbnNwYXJlbnQodGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ1NTUGFyc2VkRGVjbGFyYXRpb24ucHJvdG90eXBlLmlzVHJhbnNmb3JtZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybSAhPT0gbnVsbDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIENTU1BhcnNlZERlY2xhcmF0aW9uLnByb3RvdHlwZS5pc1Bvc2l0aW9uZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uICE9PSBQT1NJVElPTi5TVEFUSUM7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDU1NQYXJzZWREZWNsYXJhdGlvbi5wcm90b3R5cGUuaXNQb3NpdGlvbmVkV2l0aFpJbmRleCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNQb3NpdGlvbmVkKCkgJiYgIXRoaXMuekluZGV4LmF1dG87XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDU1NQYXJzZWREZWNsYXJhdGlvbi5wcm90b3R5cGUuaXNGbG9hdGluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmxvYXQgIT09IEZMT0FULk5PTkU7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDU1NQYXJzZWREZWNsYXJhdGlvbi5wcm90b3R5cGUuaXNJbmxpbmVMZXZlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChjb250YWlucyh0aGlzLmRpc3BsYXksIDQgLyogSU5MSU5FICovKSB8fFxyXG4gICAgICAgICAgICAgICAgY29udGFpbnModGhpcy5kaXNwbGF5LCAzMzU1NDQzMiAvKiBJTkxJTkVfQkxPQ0sgKi8pIHx8XHJcbiAgICAgICAgICAgICAgICBjb250YWlucyh0aGlzLmRpc3BsYXksIDI2ODQzNTQ1NiAvKiBJTkxJTkVfRkxFWCAqLykgfHxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5zKHRoaXMuZGlzcGxheSwgNTM2ODcwOTEyIC8qIElOTElORV9HUklEICovKSB8fFxyXG4gICAgICAgICAgICAgICAgY29udGFpbnModGhpcy5kaXNwbGF5LCA2NzEwODg2NCAvKiBJTkxJTkVfTElTVF9JVEVNICovKSB8fFxyXG4gICAgICAgICAgICAgICAgY29udGFpbnModGhpcy5kaXNwbGF5LCAxMzQyMTc3MjggLyogSU5MSU5FX1RBQkxFICovKSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gQ1NTUGFyc2VkRGVjbGFyYXRpb247XHJcbiAgICB9KCkpO1xyXG4gICAgdmFyIENTU1BhcnNlZFBzZXVkb0RlY2xhcmF0aW9uID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIENTU1BhcnNlZFBzZXVkb0RlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudCA9IHBhcnNlKGNvbnRlbnQsIGRlY2xhcmF0aW9uLmNvbnRlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnF1b3RlcyA9IHBhcnNlKHF1b3RlcywgZGVjbGFyYXRpb24ucXVvdGVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIENTU1BhcnNlZFBzZXVkb0RlY2xhcmF0aW9uO1xyXG4gICAgfSgpKTtcclxuICAgIHZhciBDU1NQYXJzZWRDb3VudGVyRGVjbGFyYXRpb24gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gQ1NTUGFyc2VkQ291bnRlckRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY291bnRlckluY3JlbWVudCA9IHBhcnNlKGNvdW50ZXJJbmNyZW1lbnQsIGRlY2xhcmF0aW9uLmNvdW50ZXJJbmNyZW1lbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmNvdW50ZXJSZXNldCA9IHBhcnNlKGNvdW50ZXJSZXNldCwgZGVjbGFyYXRpb24uY291bnRlclJlc2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIENTU1BhcnNlZENvdW50ZXJEZWNsYXJhdGlvbjtcclxuICAgIH0oKSk7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gICAgdmFyIHBhcnNlID0gZnVuY3Rpb24gKGRlc2NyaXB0b3IsIHN0eWxlKSB7XHJcbiAgICAgICAgdmFyIHRva2VuaXplciA9IG5ldyBUb2tlbml6ZXIoKTtcclxuICAgICAgICB2YXIgdmFsdWUgPSBzdHlsZSAhPT0gbnVsbCAmJiB0eXBlb2Ygc3R5bGUgIT09ICd1bmRlZmluZWQnID8gc3R5bGUudG9TdHJpbmcoKSA6IGRlc2NyaXB0b3IuaW5pdGlhbFZhbHVlO1xyXG4gICAgICAgIHRva2VuaXplci53cml0ZSh2YWx1ZSk7XHJcbiAgICAgICAgdmFyIHBhcnNlciA9IG5ldyBQYXJzZXIodG9rZW5pemVyLnJlYWQoKSk7XHJcbiAgICAgICAgc3dpdGNoIChkZXNjcmlwdG9yLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5JREVOVF9WQUxVRTpcclxuICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHBhcnNlci5wYXJzZUNvbXBvbmVudFZhbHVlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvci5wYXJzZShpc0lkZW50VG9rZW4odG9rZW4pID8gdG9rZW4udmFsdWUgOiBkZXNjcmlwdG9yLmluaXRpYWxWYWx1ZSk7XHJcbiAgICAgICAgICAgIGNhc2UgUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuVkFMVUU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvci5wYXJzZShwYXJzZXIucGFyc2VDb21wb25lbnRWYWx1ZSgpKTtcclxuICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eURlc2NyaXB0b3JQYXJzaW5nVHlwZS5MSVNUOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3IucGFyc2UocGFyc2VyLnBhcnNlQ29tcG9uZW50VmFsdWVzKCkpO1xyXG4gICAgICAgICAgICBjYXNlIFByb3BlcnR5RGVzY3JpcHRvclBhcnNpbmdUeXBlLlRPS0VOX1ZBTFVFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlci5wYXJzZUNvbXBvbmVudFZhbHVlKCk7XHJcbiAgICAgICAgICAgIGNhc2UgUHJvcGVydHlEZXNjcmlwdG9yUGFyc2luZ1R5cGUuVFlQRV9WQUxVRTpcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZGVzY3JpcHRvci5mb3JtYXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdhbmdsZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhbmdsZS5wYXJzZShwYXJzZXIucGFyc2VDb21wb25lbnRWYWx1ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdjb2xvcic6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xvci5wYXJzZShwYXJzZXIucGFyc2VDb21wb25lbnRWYWx1ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdpbWFnZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbWFnZS5wYXJzZShwYXJzZXIucGFyc2VDb21wb25lbnRWYWx1ZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdsZW5ndGgnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoXzEgPSBwYXJzZXIucGFyc2VDb21wb25lbnRWYWx1ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXNMZW5ndGgobGVuZ3RoXzEpID8gbGVuZ3RoXzEgOiBaRVJPX0xFTkdUSDtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdsZW5ndGgtcGVyY2VudGFnZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZV8xID0gcGFyc2VyLnBhcnNlQ29tcG9uZW50VmFsdWUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzTGVuZ3RoUGVyY2VudGFnZSh2YWx1ZV8xKSA/IHZhbHVlXzEgOiBaRVJPX0xFTkdUSDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXR0ZW1wdGluZyB0byBwYXJzZSB1bnN1cHBvcnRlZCBjc3MgZm9ybWF0IHR5cGUgXCIgKyBkZXNjcmlwdG9yLmZvcm1hdCk7XHJcbiAgICB9O1xuXG4gICAgdmFyIEVsZW1lbnRDb250YWluZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gRWxlbWVudENvbnRhaW5lcihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzID0gbmV3IENTU1BhcnNlZERlY2xhcmF0aW9uKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQsIG51bGwpKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0Tm9kZXMgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50cyA9IFtdO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdHlsZXMudHJhbnNmb3JtICE9PSBudWxsICYmIGlzSFRNTEVsZW1lbnROb2RlKGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBnZXRCb3VuZGluZ0NsaWVudFJlY3QgdGFrZXMgdHJhbnNmb3JtcyBpbnRvIGFjY291bnRcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ25vbmUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYm91bmRzID0gcGFyc2VCb3VuZHMoZWxlbWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuZmxhZ3MgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRWxlbWVudENvbnRhaW5lcjtcclxuICAgIH0oKSk7XG5cbiAgICB2YXIgVGV4dEJvdW5kcyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBUZXh0Qm91bmRzKHRleHQsIGJvdW5kcykge1xyXG4gICAgICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgICAgICAgICB0aGlzLmJvdW5kcyA9IGJvdW5kcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFRleHRCb3VuZHM7XHJcbiAgICB9KCkpO1xyXG4gICAgdmFyIHBhcnNlVGV4dEJvdW5kcyA9IGZ1bmN0aW9uICh2YWx1ZSwgc3R5bGVzLCBub2RlKSB7XHJcbiAgICAgICAgdmFyIHRleHRMaXN0ID0gYnJlYWtUZXh0KHZhbHVlLCBzdHlsZXMpO1xyXG4gICAgICAgIHZhciB0ZXh0Qm91bmRzID0gW107XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IDA7XHJcbiAgICAgICAgdGV4dExpc3QuZm9yRWFjaChmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgICAgICAgICBpZiAoc3R5bGVzLnRleHREZWNvcmF0aW9uTGluZS5sZW5ndGggfHwgdGV4dC50cmltKCkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKEZFQVRVUkVTLlNVUFBPUlRfUkFOR0VfQk9VTkRTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEJvdW5kcy5wdXNoKG5ldyBUZXh0Qm91bmRzKHRleHQsIGdldFJhbmdlQm91bmRzKG5vZGUsIG9mZnNldCwgdGV4dC5sZW5ndGgpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVwbGFjZW1lbnROb2RlID0gbm9kZS5zcGxpdFRleHQodGV4dC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRleHRCb3VuZHMucHVzaChuZXcgVGV4dEJvdW5kcyh0ZXh0LCBnZXRXcmFwcGVyQm91bmRzKG5vZGUpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IHJlcGxhY2VtZW50Tm9kZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghRkVBVFVSRVMuU1VQUE9SVF9SQU5HRV9CT1VORFMpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLnNwbGl0VGV4dCh0ZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb2Zmc2V0ICs9IHRleHQubGVuZ3RoO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0ZXh0Qm91bmRzO1xyXG4gICAgfTtcclxuICAgIHZhciBnZXRXcmFwcGVyQm91bmRzID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICB2YXIgb3duZXJEb2N1bWVudCA9IG5vZGUub3duZXJEb2N1bWVudDtcclxuICAgICAgICBpZiAob3duZXJEb2N1bWVudCkge1xyXG4gICAgICAgICAgICB2YXIgd3JhcHBlciA9IG93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaHRtbDJjYW52YXN3cmFwcGVyJyk7XHJcbiAgICAgICAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQobm9kZS5jbG9uZU5vZGUodHJ1ZSkpO1xyXG4gICAgICAgICAgICB2YXIgcGFyZW50Tm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgaWYgKHBhcmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHdyYXBwZXIsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJvdW5kcyA9IHBhcnNlQm91bmRzKHdyYXBwZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdyYXBwZXIuZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHdyYXBwZXIuZmlyc3RDaGlsZCwgd3JhcHBlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYm91bmRzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgQm91bmRzKDAsIDAsIDAsIDApO1xyXG4gICAgfTtcclxuICAgIHZhciBnZXRSYW5nZUJvdW5kcyA9IGZ1bmN0aW9uIChub2RlLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gICAgICAgIHZhciBvd25lckRvY3VtZW50ID0gbm9kZS5vd25lckRvY3VtZW50O1xyXG4gICAgICAgIGlmICghb3duZXJEb2N1bWVudCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vZGUgaGFzIG5vIG93bmVyIGRvY3VtZW50Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByYW5nZSA9IG93bmVyRG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgICByYW5nZS5zZXRTdGFydChub2RlLCBvZmZzZXQpO1xyXG4gICAgICAgIHJhbmdlLnNldEVuZChub2RlLCBvZmZzZXQgKyBsZW5ndGgpO1xyXG4gICAgICAgIHJldHVybiBCb3VuZHMuZnJvbUNsaWVudFJlY3QocmFuZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xyXG4gICAgfTtcclxuICAgIHZhciBicmVha1RleHQgPSBmdW5jdGlvbiAodmFsdWUsIHN0eWxlcykge1xyXG4gICAgICAgIHJldHVybiBzdHlsZXMubGV0dGVyU3BhY2luZyAhPT0gMCA/IHRvQ29kZVBvaW50cyh2YWx1ZSkubWFwKGZ1bmN0aW9uIChpKSB7IHJldHVybiBmcm9tQ29kZVBvaW50KGkpOyB9KSA6IGJyZWFrV29yZHModmFsdWUsIHN0eWxlcyk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGJyZWFrV29yZHMgPSBmdW5jdGlvbiAoc3RyLCBzdHlsZXMpIHtcclxuICAgICAgICB2YXIgYnJlYWtlciA9IExpbmVCcmVha2VyKHN0ciwge1xyXG4gICAgICAgICAgICBsaW5lQnJlYWs6IHN0eWxlcy5saW5lQnJlYWssXHJcbiAgICAgICAgICAgIHdvcmRCcmVhazogc3R5bGVzLm92ZXJmbG93V3JhcCA9PT0gT1ZFUkZMT1dfV1JBUC5CUkVBS19XT1JEID8gJ2JyZWFrLXdvcmQnIDogc3R5bGVzLndvcmRCcmVha1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciB3b3JkcyA9IFtdO1xyXG4gICAgICAgIHZhciBiaztcclxuICAgICAgICB3aGlsZSAoIShiayA9IGJyZWFrZXIubmV4dCgpKS5kb25lKSB7XHJcbiAgICAgICAgICAgIGlmIChiay52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgd29yZHMucHVzaChiay52YWx1ZS5zbGljZSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gd29yZHM7XHJcbiAgICB9O1xuXG4gICAgdmFyIFRleHRDb250YWluZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gVGV4dENvbnRhaW5lcihub2RlLCBzdHlsZXMpIHtcclxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gdHJhbnNmb3JtJDEobm9kZS5kYXRhLCBzdHlsZXMudGV4dFRyYW5zZm9ybSk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dEJvdW5kcyA9IHBhcnNlVGV4dEJvdW5kcyh0aGlzLnRleHQsIHN0eWxlcywgbm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBUZXh0Q29udGFpbmVyO1xyXG4gICAgfSgpKTtcclxuICAgIHZhciB0cmFuc2Zvcm0kMSA9IGZ1bmN0aW9uICh0ZXh0LCB0cmFuc2Zvcm0pIHtcclxuICAgICAgICBzd2l0Y2ggKHRyYW5zZm9ybSkge1xyXG4gICAgICAgICAgICBjYXNlIFRFWFRfVFJBTlNGT1JNLkxPV0VSQ0FTRTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0LnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGNhc2UgVEVYVF9UUkFOU0ZPUk0uQ0FQSVRBTElaRTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoQ0FQSVRBTElaRSwgY2FwaXRhbGl6ZSk7XHJcbiAgICAgICAgICAgIGNhc2UgVEVYVF9UUkFOU0ZPUk0uVVBQRVJDQVNFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQudG9VcHBlckNhc2UoKTtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB2YXIgQ0FQSVRBTElaRSA9IC8oXnxcXHN8OnwtfFxcKHxcXCkpKFthLXpdKS9nO1xyXG4gICAgdmFyIGNhcGl0YWxpemUgPSBmdW5jdGlvbiAobSwgcDEsIHAyKSB7XHJcbiAgICAgICAgaWYgKG0ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcDEgKyBwMi50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbTtcclxuICAgIH07XG5cbiAgICB2YXIgSW1hZ2VFbGVtZW50Q29udGFpbmVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgICAgIF9fZXh0ZW5kcyhJbWFnZUVsZW1lbnRDb250YWluZXIsIF9zdXBlcik7XHJcbiAgICAgICAgZnVuY3Rpb24gSW1hZ2VFbGVtZW50Q29udGFpbmVyKGltZykge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBpbWcpIHx8IHRoaXM7XHJcbiAgICAgICAgICAgIF90aGlzLnNyYyA9IGltZy5jdXJyZW50U3JjIHx8IGltZy5zcmM7XHJcbiAgICAgICAgICAgIF90aGlzLmludHJpbnNpY1dpZHRoID0gaW1nLm5hdHVyYWxXaWR0aDtcclxuICAgICAgICAgICAgX3RoaXMuaW50cmluc2ljSGVpZ2h0ID0gaW1nLm5hdHVyYWxIZWlnaHQ7XHJcbiAgICAgICAgICAgIENhY2hlU3RvcmFnZS5nZXRJbnN0YW5jZSgpLmFkZEltYWdlKF90aGlzLnNyYyk7XHJcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEltYWdlRWxlbWVudENvbnRhaW5lcjtcclxuICAgIH0oRWxlbWVudENvbnRhaW5lcikpO1xuXG4gICAgdmFyIENhbnZhc0VsZW1lbnRDb250YWluZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICAgICAgX19leHRlbmRzKENhbnZhc0VsZW1lbnRDb250YWluZXIsIF9zdXBlcik7XHJcbiAgICAgICAgZnVuY3Rpb24gQ2FudmFzRWxlbWVudENvbnRhaW5lcihjYW52YXMpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgY2FudmFzKSB8fCB0aGlzO1xyXG4gICAgICAgICAgICBfdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICAgICAgICAgIF90aGlzLmludHJpbnNpY1dpZHRoID0gY2FudmFzLndpZHRoO1xyXG4gICAgICAgICAgICBfdGhpcy5pbnRyaW5zaWNIZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBDYW52YXNFbGVtZW50Q29udGFpbmVyO1xyXG4gICAgfShFbGVtZW50Q29udGFpbmVyKSk7XG5cbiAgICB2YXIgU1ZHRWxlbWVudENvbnRhaW5lciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgICAgICBfX2V4dGVuZHMoU1ZHRWxlbWVudENvbnRhaW5lciwgX3N1cGVyKTtcclxuICAgICAgICBmdW5jdGlvbiBTVkdFbGVtZW50Q29udGFpbmVyKGltZykge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBpbWcpIHx8IHRoaXM7XHJcbiAgICAgICAgICAgIHZhciBzID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcclxuICAgICAgICAgICAgX3RoaXMuc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWwsXCIgKyBlbmNvZGVVUklDb21wb25lbnQocy5zZXJpYWxpemVUb1N0cmluZyhpbWcpKTtcclxuICAgICAgICAgICAgX3RoaXMuaW50cmluc2ljV2lkdGggPSBpbWcud2lkdGguYmFzZVZhbC52YWx1ZTtcclxuICAgICAgICAgICAgX3RoaXMuaW50cmluc2ljSGVpZ2h0ID0gaW1nLmhlaWdodC5iYXNlVmFsLnZhbHVlO1xyXG4gICAgICAgICAgICBDYWNoZVN0b3JhZ2UuZ2V0SW5zdGFuY2UoKS5hZGRJbWFnZShfdGhpcy5zdmcpO1xyXG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBTVkdFbGVtZW50Q29udGFpbmVyO1xyXG4gICAgfShFbGVtZW50Q29udGFpbmVyKSk7XG5cbiAgICB2YXIgTElFbGVtZW50Q29udGFpbmVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgICAgIF9fZXh0ZW5kcyhMSUVsZW1lbnRDb250YWluZXIsIF9zdXBlcik7XHJcbiAgICAgICAgZnVuY3Rpb24gTElFbGVtZW50Q29udGFpbmVyKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgZWxlbWVudCkgfHwgdGhpcztcclxuICAgICAgICAgICAgX3RoaXMudmFsdWUgPSBlbGVtZW50LnZhbHVlO1xyXG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBMSUVsZW1lbnRDb250YWluZXI7XHJcbiAgICB9KEVsZW1lbnRDb250YWluZXIpKTtcblxuICAgIHZhciBPTEVsZW1lbnRDb250YWluZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICAgICAgX19leHRlbmRzKE9MRWxlbWVudENvbnRhaW5lciwgX3N1cGVyKTtcclxuICAgICAgICBmdW5jdGlvbiBPTEVsZW1lbnRDb250YWluZXIoZWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBlbGVtZW50KSB8fCB0aGlzO1xyXG4gICAgICAgICAgICBfdGhpcy5zdGFydCA9IGVsZW1lbnQuc3RhcnQ7XHJcbiAgICAgICAgICAgIF90aGlzLnJldmVyc2VkID0gdHlwZW9mIGVsZW1lbnQucmV2ZXJzZWQgPT09ICdib29sZWFuJyAmJiBlbGVtZW50LnJldmVyc2VkID09PSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBPTEVsZW1lbnRDb250YWluZXI7XHJcbiAgICB9KEVsZW1lbnRDb250YWluZXIpKTtcblxuICAgIHZhciBDSEVDS0JPWF9CT1JERVJfUkFESVVTID0gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdHlwZTogVG9rZW5UeXBlLkRJTUVOU0lPTl9UT0tFTixcclxuICAgICAgICAgICAgZmxhZ3M6IDAsXHJcbiAgICAgICAgICAgIHVuaXQ6ICdweCcsXHJcbiAgICAgICAgICAgIG51bWJlcjogM1xyXG4gICAgICAgIH1cclxuICAgIF07XHJcbiAgICB2YXIgUkFESU9fQk9SREVSX1JBRElVUyA9IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHR5cGU6IFRva2VuVHlwZS5QRVJDRU5UQUdFX1RPS0VOLFxyXG4gICAgICAgICAgICBmbGFnczogMCxcclxuICAgICAgICAgICAgbnVtYmVyOiA1MFxyXG4gICAgICAgIH1cclxuICAgIF07XHJcbiAgICB2YXIgcmVmb3JtYXRJbnB1dEJvdW5kcyA9IGZ1bmN0aW9uIChib3VuZHMpIHtcclxuICAgICAgICBpZiAoYm91bmRzLndpZHRoID4gYm91bmRzLmhlaWdodCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJvdW5kcyhib3VuZHMubGVmdCArIChib3VuZHMud2lkdGggLSBib3VuZHMuaGVpZ2h0KSAvIDIsIGJvdW5kcy50b3AsIGJvdW5kcy5oZWlnaHQsIGJvdW5kcy5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChib3VuZHMud2lkdGggPCBib3VuZHMuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQm91bmRzKGJvdW5kcy5sZWZ0LCBib3VuZHMudG9wICsgKGJvdW5kcy5oZWlnaHQgLSBib3VuZHMud2lkdGgpIC8gMiwgYm91bmRzLndpZHRoLCBib3VuZHMud2lkdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYm91bmRzO1xyXG4gICAgfTtcclxuICAgIHZhciBnZXRJbnB1dFZhbHVlID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICB2YXIgdmFsdWUgPSBub2RlLnR5cGUgPT09IFBBU1NXT1JEID8gbmV3IEFycmF5KG5vZGUudmFsdWUubGVuZ3RoICsgMSkuam9pbignXFx1MjAyMicpIDogbm9kZS52YWx1ZTtcclxuICAgICAgICByZXR1cm4gdmFsdWUubGVuZ3RoID09PSAwID8gbm9kZS5wbGFjZWhvbGRlciB8fCAnJyA6IHZhbHVlO1xyXG4gICAgfTtcclxuICAgIHZhciBDSEVDS0JPWCA9ICdjaGVja2JveCc7XHJcbiAgICB2YXIgUkFESU8gPSAncmFkaW8nO1xyXG4gICAgdmFyIFBBU1NXT1JEID0gJ3Bhc3N3b3JkJztcclxuICAgIHZhciBJTlBVVF9DT0xPUiA9IDB4MmEyYTJhZmY7XHJcbiAgICB2YXIgSW5wdXRFbGVtZW50Q29udGFpbmVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgICAgIF9fZXh0ZW5kcyhJbnB1dEVsZW1lbnRDb250YWluZXIsIF9zdXBlcik7XHJcbiAgICAgICAgZnVuY3Rpb24gSW5wdXRFbGVtZW50Q29udGFpbmVyKGlucHV0KSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGlucHV0KSB8fCB0aGlzO1xyXG4gICAgICAgICAgICBfdGhpcy50eXBlID0gaW5wdXQudHlwZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICBfdGhpcy5jaGVja2VkID0gaW5wdXQuY2hlY2tlZDtcclxuICAgICAgICAgICAgX3RoaXMudmFsdWUgPSBnZXRJbnB1dFZhbHVlKGlucHV0KTtcclxuICAgICAgICAgICAgaWYgKF90aGlzLnR5cGUgPT09IENIRUNLQk9YIHx8IF90aGlzLnR5cGUgPT09IFJBRElPKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zdHlsZXMuYmFja2dyb3VuZENvbG9yID0gMHhkZWRlZGVmZjtcclxuICAgICAgICAgICAgICAgIF90aGlzLnN0eWxlcy5ib3JkZXJUb3BDb2xvciA9IF90aGlzLnN0eWxlcy5ib3JkZXJSaWdodENvbG9yID0gX3RoaXMuc3R5bGVzLmJvcmRlckJvdHRvbUNvbG9yID0gX3RoaXMuc3R5bGVzLmJvcmRlckxlZnRDb2xvciA9IDB4YTVhNWE1ZmY7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zdHlsZXMuYm9yZGVyVG9wV2lkdGggPSBfdGhpcy5zdHlsZXMuYm9yZGVyUmlnaHRXaWR0aCA9IF90aGlzLnN0eWxlcy5ib3JkZXJCb3R0b21XaWR0aCA9IF90aGlzLnN0eWxlcy5ib3JkZXJMZWZ0V2lkdGggPSAxO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc3R5bGVzLmJvcmRlclRvcFN0eWxlID0gX3RoaXMuc3R5bGVzLmJvcmRlclJpZ2h0U3R5bGUgPSBfdGhpcy5zdHlsZXMuYm9yZGVyQm90dG9tU3R5bGUgPSBfdGhpcy5zdHlsZXMuYm9yZGVyTGVmdFN0eWxlID1cclxuICAgICAgICAgICAgICAgICAgICBCT1JERVJfU1RZTEUuU09MSUQ7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5zdHlsZXMuYmFja2dyb3VuZENsaXAgPSBbQkFDS0dST1VORF9DTElQLkJPUkRFUl9CT1hdO1xyXG4gICAgICAgICAgICAgICAgX3RoaXMuc3R5bGVzLmJhY2tncm91bmRPcmlnaW4gPSBbMCAvKiBCT1JERVJfQk9YICovXTtcclxuICAgICAgICAgICAgICAgIF90aGlzLmJvdW5kcyA9IHJlZm9ybWF0SW5wdXRCb3VuZHMoX3RoaXMuYm91bmRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzd2l0Y2ggKF90aGlzLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgQ0hFQ0tCT1g6XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc3R5bGVzLmJvcmRlclRvcFJpZ2h0UmFkaXVzID0gX3RoaXMuc3R5bGVzLmJvcmRlclRvcExlZnRSYWRpdXMgPSBfdGhpcy5zdHlsZXMuYm9yZGVyQm90dG9tUmlnaHRSYWRpdXMgPSBfdGhpcy5zdHlsZXMuYm9yZGVyQm90dG9tTGVmdFJhZGl1cyA9IENIRUNLQk9YX0JPUkRFUl9SQURJVVM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFJBRElPOlxyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnN0eWxlcy5ib3JkZXJUb3BSaWdodFJhZGl1cyA9IF90aGlzLnN0eWxlcy5ib3JkZXJUb3BMZWZ0UmFkaXVzID0gX3RoaXMuc3R5bGVzLmJvcmRlckJvdHRvbVJpZ2h0UmFkaXVzID0gX3RoaXMuc3R5bGVzLmJvcmRlckJvdHRvbUxlZnRSYWRpdXMgPSBSQURJT19CT1JERVJfUkFESVVTO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIElucHV0RWxlbWVudENvbnRhaW5lcjtcclxuICAgIH0oRWxlbWVudENvbnRhaW5lcikpO1xuXG4gICAgdmFyIFNlbGVjdEVsZW1lbnRDb250YWluZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICAgICAgX19leHRlbmRzKFNlbGVjdEVsZW1lbnRDb250YWluZXIsIF9zdXBlcik7XHJcbiAgICAgICAgZnVuY3Rpb24gU2VsZWN0RWxlbWVudENvbnRhaW5lcihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGVsZW1lbnQpIHx8IHRoaXM7XHJcbiAgICAgICAgICAgIHZhciBvcHRpb24gPSBlbGVtZW50Lm9wdGlvbnNbZWxlbWVudC5zZWxlY3RlZEluZGV4IHx8IDBdO1xyXG4gICAgICAgICAgICBfdGhpcy52YWx1ZSA9IG9wdGlvbiA/IG9wdGlvbi50ZXh0IHx8ICcnIDogJyc7XHJcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFNlbGVjdEVsZW1lbnRDb250YWluZXI7XHJcbiAgICB9KEVsZW1lbnRDb250YWluZXIpKTtcblxuICAgIHZhciBUZXh0YXJlYUVsZW1lbnRDb250YWluZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICAgICAgX19leHRlbmRzKFRleHRhcmVhRWxlbWVudENvbnRhaW5lciwgX3N1cGVyKTtcclxuICAgICAgICBmdW5jdGlvbiBUZXh0YXJlYUVsZW1lbnRDb250YWluZXIoZWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBlbGVtZW50KSB8fCB0aGlzO1xyXG4gICAgICAgICAgICBfdGhpcy52YWx1ZSA9IGVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgICAgIHJldHVybiBfdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFRleHRhcmVhRWxlbWVudENvbnRhaW5lcjtcclxuICAgIH0oRWxlbWVudENvbnRhaW5lcikpO1xuXG4gICAgdmFyIHBhcnNlQ29sb3IgPSBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIGNvbG9yLnBhcnNlKFBhcnNlci5jcmVhdGUodmFsdWUpLnBhcnNlQ29tcG9uZW50VmFsdWUoKSk7IH07XHJcbiAgICB2YXIgSUZyYW1lRWxlbWVudENvbnRhaW5lciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgICAgICBfX2V4dGVuZHMoSUZyYW1lRWxlbWVudENvbnRhaW5lciwgX3N1cGVyKTtcclxuICAgICAgICBmdW5jdGlvbiBJRnJhbWVFbGVtZW50Q29udGFpbmVyKGlmcmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBpZnJhbWUpIHx8IHRoaXM7XHJcbiAgICAgICAgICAgIF90aGlzLnNyYyA9IGlmcmFtZS5zcmM7XHJcbiAgICAgICAgICAgIF90aGlzLndpZHRoID0gcGFyc2VJbnQoaWZyYW1lLndpZHRoLCAxMCkgfHwgMDtcclxuICAgICAgICAgICAgX3RoaXMuaGVpZ2h0ID0gcGFyc2VJbnQoaWZyYW1lLmhlaWdodCwgMTApIHx8IDA7XHJcbiAgICAgICAgICAgIF90aGlzLmJhY2tncm91bmRDb2xvciA9IF90aGlzLnN0eWxlcy5iYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaWZyYW1lLmNvbnRlbnRXaW5kb3cgJiZcclxuICAgICAgICAgICAgICAgICAgICBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnRyZWUgPSBwYXJzZVRyZWUoaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLWJhY2tncm91bmQvI3NwZWNpYWwtYmFja2dyb3VuZHNcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZG9jdW1lbnRCYWNrZ3JvdW5kQ29sb3IgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBwYXJzZUNvbG9yKGdldENvbXB1dGVkU3R5bGUoaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmJhY2tncm91bmRDb2xvcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBDT0xPUlMuVFJBTlNQQVJFTlQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJvZHlCYWNrZ3JvdW5kQ29sb3IgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcGFyc2VDb2xvcihnZXRDb21wdXRlZFN0eWxlKGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmJvZHkpLmJhY2tncm91bmRDb2xvcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBDT0xPUlMuVFJBTlNQQVJFTlQ7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuYmFja2dyb3VuZENvbG9yID0gaXNUcmFuc3BhcmVudChkb2N1bWVudEJhY2tncm91bmRDb2xvcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBpc1RyYW5zcGFyZW50KGJvZHlCYWNrZ3JvdW5kQ29sb3IpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF90aGlzLnN0eWxlcy5iYWNrZ3JvdW5kQ29sb3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYm9keUJhY2tncm91bmRDb2xvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGRvY3VtZW50QmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7IH1cclxuICAgICAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gSUZyYW1lRWxlbWVudENvbnRhaW5lcjtcclxuICAgIH0oRWxlbWVudENvbnRhaW5lcikpO1xuXG4gICAgdmFyIExJU1RfT1dORVJTID0gWydPTCcsICdVTCcsICdNRU5VJ107XHJcbiAgICB2YXIgcGFyc2VOb2RlVHJlZSA9IGZ1bmN0aW9uIChub2RlLCBwYXJlbnQsIHJvb3QpIHtcclxuICAgICAgICBmb3IgKHZhciBjaGlsZE5vZGUgPSBub2RlLmZpcnN0Q2hpbGQsIG5leHROb2RlID0gdm9pZCAwOyBjaGlsZE5vZGU7IGNoaWxkTm9kZSA9IG5leHROb2RlKSB7XHJcbiAgICAgICAgICAgIG5leHROb2RlID0gY2hpbGROb2RlLm5leHRTaWJsaW5nO1xyXG4gICAgICAgICAgICBpZiAoaXNUZXh0Tm9kZShjaGlsZE5vZGUpICYmIGNoaWxkTm9kZS5kYXRhLnRyaW0oKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnQudGV4dE5vZGVzLnB1c2gobmV3IFRleHRDb250YWluZXIoY2hpbGROb2RlLCBwYXJlbnQuc3R5bGVzKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoaXNFbGVtZW50Tm9kZShjaGlsZE5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyID0gY3JlYXRlQ29udGFpbmVyKGNoaWxkTm9kZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyLnN0eWxlcy5pc1Zpc2libGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVzUmVhbFN0YWNraW5nQ29udGV4dChjaGlsZE5vZGUsIGNvbnRhaW5lciwgcm9vdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmZsYWdzIHw9IDQgLyogQ1JFQVRFU19SRUFMX1NUQUNLSU5HX0NPTlRFWFQgKi87XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNyZWF0ZXNTdGFja2luZ0NvbnRleHQoY29udGFpbmVyLnN0eWxlcykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmZsYWdzIHw9IDIgLyogQ1JFQVRFU19TVEFDS0lOR19DT05URVhUICovO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoTElTVF9PV05FUlMuaW5kZXhPZihjaGlsZE5vZGUudGFnTmFtZSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5mbGFncyB8PSA4IC8qIElTX0xJU1RfT1dORVIgKi87XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5lbGVtZW50cy5wdXNoKGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1RleHRhcmVhRWxlbWVudChjaGlsZE5vZGUpICYmICFpc1NWR0VsZW1lbnQoY2hpbGROb2RlKSAmJiAhaXNTZWxlY3RFbGVtZW50KGNoaWxkTm9kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VOb2RlVHJlZShjaGlsZE5vZGUsIGNvbnRhaW5lciwgcm9vdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHZhciBjcmVhdGVDb250YWluZXIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgIGlmIChpc0ltYWdlRWxlbWVudChlbGVtZW50KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEltYWdlRWxlbWVudENvbnRhaW5lcihlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzQ2FudmFzRWxlbWVudChlbGVtZW50KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENhbnZhc0VsZW1lbnRDb250YWluZXIoZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc1NWR0VsZW1lbnQoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTVkdFbGVtZW50Q29udGFpbmVyKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNMSUVsZW1lbnQoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBMSUVsZW1lbnRDb250YWluZXIoZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc09MRWxlbWVudChlbGVtZW50KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE9MRWxlbWVudENvbnRhaW5lcihlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzSW5wdXRFbGVtZW50KGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgSW5wdXRFbGVtZW50Q29udGFpbmVyKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNTZWxlY3RFbGVtZW50KGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgU2VsZWN0RWxlbWVudENvbnRhaW5lcihlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzVGV4dGFyZWFFbGVtZW50KGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGV4dGFyZWFFbGVtZW50Q29udGFpbmVyKGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNJRnJhbWVFbGVtZW50KGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgSUZyYW1lRWxlbWVudENvbnRhaW5lcihlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBFbGVtZW50Q29udGFpbmVyKGVsZW1lbnQpO1xyXG4gICAgfTtcclxuICAgIHZhciBwYXJzZVRyZWUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgIHZhciBjb250YWluZXIgPSBjcmVhdGVDb250YWluZXIoZWxlbWVudCk7XHJcbiAgICAgICAgY29udGFpbmVyLmZsYWdzIHw9IDQgLyogQ1JFQVRFU19SRUFMX1NUQUNLSU5HX0NPTlRFWFQgKi87XHJcbiAgICAgICAgcGFyc2VOb2RlVHJlZShlbGVtZW50LCBjb250YWluZXIsIGNvbnRhaW5lcik7XHJcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcclxuICAgIH07XHJcbiAgICB2YXIgY3JlYXRlc1JlYWxTdGFja2luZ0NvbnRleHQgPSBmdW5jdGlvbiAobm9kZSwgY29udGFpbmVyLCByb290KSB7XHJcbiAgICAgICAgcmV0dXJuIChjb250YWluZXIuc3R5bGVzLmlzUG9zaXRpb25lZFdpdGhaSW5kZXgoKSB8fFxyXG4gICAgICAgICAgICBjb250YWluZXIuc3R5bGVzLm9wYWNpdHkgPCAxIHx8XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zdHlsZXMuaXNUcmFuc2Zvcm1lZCgpIHx8XHJcbiAgICAgICAgICAgIChpc0JvZHlFbGVtZW50KG5vZGUpICYmIHJvb3Quc3R5bGVzLmlzVHJhbnNwYXJlbnQoKSkpO1xyXG4gICAgfTtcclxuICAgIHZhciBjcmVhdGVzU3RhY2tpbmdDb250ZXh0ID0gZnVuY3Rpb24gKHN0eWxlcykgeyByZXR1cm4gc3R5bGVzLmlzUG9zaXRpb25lZCgpIHx8IHN0eWxlcy5pc0Zsb2F0aW5nKCk7IH07XHJcbiAgICB2YXIgaXNUZXh0Tm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7IHJldHVybiBub2RlLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERTsgfTtcclxuICAgIHZhciBpc0VsZW1lbnROb2RlID0gZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFOyB9O1xyXG4gICAgdmFyIGlzSFRNTEVsZW1lbnROb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICByZXR1cm4gaXNFbGVtZW50Tm9kZShub2RlKSAmJiB0eXBlb2Ygbm9kZS5zdHlsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgIWlzU1ZHRWxlbWVudE5vZGUobm9kZSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGlzU1ZHRWxlbWVudE5vZGUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgZWxlbWVudC5jbGFzc05hbWUgPT09ICdvYmplY3QnO1xyXG4gICAgfTtcclxuICAgIHZhciBpc0xJRWxlbWVudCA9IGZ1bmN0aW9uIChub2RlKSB7IHJldHVybiBub2RlLnRhZ05hbWUgPT09ICdMSSc7IH07XHJcbiAgICB2YXIgaXNPTEVsZW1lbnQgPSBmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gbm9kZS50YWdOYW1lID09PSAnT0wnOyB9O1xyXG4gICAgdmFyIGlzSW5wdXRFbGVtZW50ID0gZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIG5vZGUudGFnTmFtZSA9PT0gJ0lOUFVUJzsgfTtcclxuICAgIHZhciBpc0hUTUxFbGVtZW50ID0gZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIG5vZGUudGFnTmFtZSA9PT0gJ0hUTUwnOyB9O1xyXG4gICAgdmFyIGlzU1ZHRWxlbWVudCA9IGZ1bmN0aW9uIChub2RlKSB7IHJldHVybiBub2RlLnRhZ05hbWUgPT09ICdzdmcnOyB9O1xyXG4gICAgdmFyIGlzQm9keUVsZW1lbnQgPSBmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gbm9kZS50YWdOYW1lID09PSAnQk9EWSc7IH07XHJcbiAgICB2YXIgaXNDYW52YXNFbGVtZW50ID0gZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIG5vZGUudGFnTmFtZSA9PT0gJ0NBTlZBUyc7IH07XHJcbiAgICB2YXIgaXNJbWFnZUVsZW1lbnQgPSBmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gbm9kZS50YWdOYW1lID09PSAnSU1HJzsgfTtcclxuICAgIHZhciBpc0lGcmFtZUVsZW1lbnQgPSBmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gbm9kZS50YWdOYW1lID09PSAnSUZSQU1FJzsgfTtcclxuICAgIHZhciBpc1N0eWxlRWxlbWVudCA9IGZ1bmN0aW9uIChub2RlKSB7IHJldHVybiBub2RlLnRhZ05hbWUgPT09ICdTVFlMRSc7IH07XHJcbiAgICB2YXIgaXNTY3JpcHRFbGVtZW50ID0gZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIG5vZGUudGFnTmFtZSA9PT0gJ1NDUklQVCc7IH07XHJcbiAgICB2YXIgaXNUZXh0YXJlYUVsZW1lbnQgPSBmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gbm9kZS50YWdOYW1lID09PSAnVEVYVEFSRUEnOyB9O1xyXG4gICAgdmFyIGlzU2VsZWN0RWxlbWVudCA9IGZ1bmN0aW9uIChub2RlKSB7IHJldHVybiBub2RlLnRhZ05hbWUgPT09ICdTRUxFQ1QnOyB9O1xuXG4gICAgdmFyIENvdW50ZXJTdGF0ZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBDb3VudGVyU3RhdGUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY291bnRlcnMgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgQ291bnRlclN0YXRlLnByb3RvdHlwZS5nZXRDb3VudGVyVmFsdWUgPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgICAgICB2YXIgY291bnRlciA9IHRoaXMuY291bnRlcnNbbmFtZV07XHJcbiAgICAgICAgICAgIGlmIChjb3VudGVyICYmIGNvdW50ZXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY291bnRlcltjb3VudGVyLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ291bnRlclN0YXRlLnByb3RvdHlwZS5nZXRDb3VudGVyVmFsdWVzID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGNvdW50ZXIgPSB0aGlzLmNvdW50ZXJzW25hbWVdO1xyXG4gICAgICAgICAgICByZXR1cm4gY291bnRlciA/IGNvdW50ZXIgOiBbXTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIENvdW50ZXJTdGF0ZS5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24gKGNvdW50ZXJzKSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgICAgIGNvdW50ZXJzLmZvckVhY2goZnVuY3Rpb24gKGNvdW50ZXIpIHsgcmV0dXJuIF90aGlzLmNvdW50ZXJzW2NvdW50ZXJdLnBvcCgpOyB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIENvdW50ZXJTdGF0ZS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoc3R5bGUpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgdmFyIGNvdW50ZXJJbmNyZW1lbnQgPSBzdHlsZS5jb3VudGVySW5jcmVtZW50O1xyXG4gICAgICAgICAgICB2YXIgY291bnRlclJlc2V0ID0gc3R5bGUuY291bnRlclJlc2V0O1xyXG4gICAgICAgICAgICB2YXIgY2FuUmVzZXQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoY291bnRlckluY3JlbWVudCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY291bnRlckluY3JlbWVudC5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb3VudGVyID0gX3RoaXMuY291bnRlcnNbZW50cnkuY291bnRlcl07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ZXIgJiYgZW50cnkuaW5jcmVtZW50ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhblJlc2V0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXJbTWF0aC5tYXgoMCwgY291bnRlci5sZW5ndGggLSAxKV0gKz0gZW50cnkuaW5jcmVtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBjb3VudGVyTmFtZXMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKGNhblJlc2V0KSB7XHJcbiAgICAgICAgICAgICAgICBjb3VudGVyUmVzZXQuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY291bnRlciA9IF90aGlzLmNvdW50ZXJzW2VudHJ5LmNvdW50ZXJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXJOYW1lcy5wdXNoKGVudHJ5LmNvdW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY291bnRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0gX3RoaXMuY291bnRlcnNbZW50cnkuY291bnRlcl0gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlci5wdXNoKGVudHJ5LnJlc2V0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBjb3VudGVyTmFtZXM7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gQ291bnRlclN0YXRlO1xyXG4gICAgfSgpKTtcclxuICAgIHZhciBST01BTl9VUFBFUiA9IHtcclxuICAgICAgICBpbnRlZ2VyczogWzEwMDAsIDkwMCwgNTAwLCA0MDAsIDEwMCwgOTAsIDUwLCA0MCwgMTAsIDksIDUsIDQsIDFdLFxyXG4gICAgICAgIHZhbHVlczogWydNJywgJ0NNJywgJ0QnLCAnQ0QnLCAnQycsICdYQycsICdMJywgJ1hMJywgJ1gnLCAnSVgnLCAnVicsICdJVicsICdJJ11cclxuICAgIH07XHJcbiAgICB2YXIgQVJNRU5JQU4gPSB7XHJcbiAgICAgICAgaW50ZWdlcnM6IFtcclxuICAgICAgICAgICAgOTAwMCxcclxuICAgICAgICAgICAgODAwMCxcclxuICAgICAgICAgICAgNzAwMCxcclxuICAgICAgICAgICAgNjAwMCxcclxuICAgICAgICAgICAgNTAwMCxcclxuICAgICAgICAgICAgNDAwMCxcclxuICAgICAgICAgICAgMzAwMCxcclxuICAgICAgICAgICAgMjAwMCxcclxuICAgICAgICAgICAgMTAwMCxcclxuICAgICAgICAgICAgOTAwLFxyXG4gICAgICAgICAgICA4MDAsXHJcbiAgICAgICAgICAgIDcwMCxcclxuICAgICAgICAgICAgNjAwLFxyXG4gICAgICAgICAgICA1MDAsXHJcbiAgICAgICAgICAgIDQwMCxcclxuICAgICAgICAgICAgMzAwLFxyXG4gICAgICAgICAgICAyMDAsXHJcbiAgICAgICAgICAgIDEwMCxcclxuICAgICAgICAgICAgOTAsXHJcbiAgICAgICAgICAgIDgwLFxyXG4gICAgICAgICAgICA3MCxcclxuICAgICAgICAgICAgNjAsXHJcbiAgICAgICAgICAgIDUwLFxyXG4gICAgICAgICAgICA0MCxcclxuICAgICAgICAgICAgMzAsXHJcbiAgICAgICAgICAgIDIwLFxyXG4gICAgICAgICAgICAxMCxcclxuICAgICAgICAgICAgOSxcclxuICAgICAgICAgICAgOCxcclxuICAgICAgICAgICAgNyxcclxuICAgICAgICAgICAgNixcclxuICAgICAgICAgICAgNSxcclxuICAgICAgICAgICAgNCxcclxuICAgICAgICAgICAgMyxcclxuICAgICAgICAgICAgMixcclxuICAgICAgICAgICAgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgdmFsdWVzOiBbXHJcbiAgICAgICAgICAgICfVlCcsXHJcbiAgICAgICAgICAgICfVkycsXHJcbiAgICAgICAgICAgICfVkicsXHJcbiAgICAgICAgICAgICfVkScsXHJcbiAgICAgICAgICAgICfVkCcsXHJcbiAgICAgICAgICAgICfVjycsXHJcbiAgICAgICAgICAgICfVjicsXHJcbiAgICAgICAgICAgICfVjScsXHJcbiAgICAgICAgICAgICfVjCcsXHJcbiAgICAgICAgICAgICfViycsXHJcbiAgICAgICAgICAgICfViicsXHJcbiAgICAgICAgICAgICfViScsXHJcbiAgICAgICAgICAgICfViCcsXHJcbiAgICAgICAgICAgICfVhycsXHJcbiAgICAgICAgICAgICfVhicsXHJcbiAgICAgICAgICAgICfVhScsXHJcbiAgICAgICAgICAgICfVhCcsXHJcbiAgICAgICAgICAgICfVgycsXHJcbiAgICAgICAgICAgICfVgicsXHJcbiAgICAgICAgICAgICfVgScsXHJcbiAgICAgICAgICAgICfVgCcsXHJcbiAgICAgICAgICAgICfUvycsXHJcbiAgICAgICAgICAgICfUvicsXHJcbiAgICAgICAgICAgICfUvScsXHJcbiAgICAgICAgICAgICfUvCcsXHJcbiAgICAgICAgICAgICfUuycsXHJcbiAgICAgICAgICAgICfUuicsXHJcbiAgICAgICAgICAgICfUuScsXHJcbiAgICAgICAgICAgICfUuCcsXHJcbiAgICAgICAgICAgICfUtycsXHJcbiAgICAgICAgICAgICfUticsXHJcbiAgICAgICAgICAgICfUtScsXHJcbiAgICAgICAgICAgICfUtCcsXHJcbiAgICAgICAgICAgICfUsycsXHJcbiAgICAgICAgICAgICfUsicsXHJcbiAgICAgICAgICAgICfUsSdcclxuICAgICAgICBdXHJcbiAgICB9O1xyXG4gICAgdmFyIEhFQlJFVyA9IHtcclxuICAgICAgICBpbnRlZ2VyczogW1xyXG4gICAgICAgICAgICAxMDAwMCxcclxuICAgICAgICAgICAgOTAwMCxcclxuICAgICAgICAgICAgODAwMCxcclxuICAgICAgICAgICAgNzAwMCxcclxuICAgICAgICAgICAgNjAwMCxcclxuICAgICAgICAgICAgNTAwMCxcclxuICAgICAgICAgICAgNDAwMCxcclxuICAgICAgICAgICAgMzAwMCxcclxuICAgICAgICAgICAgMjAwMCxcclxuICAgICAgICAgICAgMTAwMCxcclxuICAgICAgICAgICAgNDAwLFxyXG4gICAgICAgICAgICAzMDAsXHJcbiAgICAgICAgICAgIDIwMCxcclxuICAgICAgICAgICAgMTAwLFxyXG4gICAgICAgICAgICA5MCxcclxuICAgICAgICAgICAgODAsXHJcbiAgICAgICAgICAgIDcwLFxyXG4gICAgICAgICAgICA2MCxcclxuICAgICAgICAgICAgNTAsXHJcbiAgICAgICAgICAgIDQwLFxyXG4gICAgICAgICAgICAzMCxcclxuICAgICAgICAgICAgMjAsXHJcbiAgICAgICAgICAgIDE5LFxyXG4gICAgICAgICAgICAxOCxcclxuICAgICAgICAgICAgMTcsXHJcbiAgICAgICAgICAgIDE2LFxyXG4gICAgICAgICAgICAxNSxcclxuICAgICAgICAgICAgMTAsXHJcbiAgICAgICAgICAgIDksXHJcbiAgICAgICAgICAgIDgsXHJcbiAgICAgICAgICAgIDcsXHJcbiAgICAgICAgICAgIDYsXHJcbiAgICAgICAgICAgIDUsXHJcbiAgICAgICAgICAgIDQsXHJcbiAgICAgICAgICAgIDMsXHJcbiAgICAgICAgICAgIDIsXHJcbiAgICAgICAgICAgIDFcclxuICAgICAgICBdLFxyXG4gICAgICAgIHZhbHVlczogW1xyXG4gICAgICAgICAgICAn15nXsycsXHJcbiAgICAgICAgICAgICfXmNezJyxcclxuICAgICAgICAgICAgJ9eX17MnLFxyXG4gICAgICAgICAgICAn15bXsycsXHJcbiAgICAgICAgICAgICfXldezJyxcclxuICAgICAgICAgICAgJ9eU17MnLFxyXG4gICAgICAgICAgICAn15PXsycsXHJcbiAgICAgICAgICAgICfXktezJyxcclxuICAgICAgICAgICAgJ9eR17MnLFxyXG4gICAgICAgICAgICAn15DXsycsXHJcbiAgICAgICAgICAgICfXqicsXHJcbiAgICAgICAgICAgICfXqScsXHJcbiAgICAgICAgICAgICfXqCcsXHJcbiAgICAgICAgICAgICfXpycsXHJcbiAgICAgICAgICAgICfXpicsXHJcbiAgICAgICAgICAgICfXpCcsXHJcbiAgICAgICAgICAgICfXoicsXHJcbiAgICAgICAgICAgICfXoScsXHJcbiAgICAgICAgICAgICfXoCcsXHJcbiAgICAgICAgICAgICfXnicsXHJcbiAgICAgICAgICAgICfXnCcsXHJcbiAgICAgICAgICAgICfXmycsXHJcbiAgICAgICAgICAgICfXmdeYJyxcclxuICAgICAgICAgICAgJ9eZ15cnLFxyXG4gICAgICAgICAgICAn15nXlicsXHJcbiAgICAgICAgICAgICfXmNeWJyxcclxuICAgICAgICAgICAgJ9eY15UnLFxyXG4gICAgICAgICAgICAn15knLFxyXG4gICAgICAgICAgICAn15gnLFxyXG4gICAgICAgICAgICAn15cnLFxyXG4gICAgICAgICAgICAn15YnLFxyXG4gICAgICAgICAgICAn15UnLFxyXG4gICAgICAgICAgICAn15QnLFxyXG4gICAgICAgICAgICAn15MnLFxyXG4gICAgICAgICAgICAn15InLFxyXG4gICAgICAgICAgICAn15EnLFxyXG4gICAgICAgICAgICAn15AnXHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuICAgIHZhciBHRU9SR0lBTiA9IHtcclxuICAgICAgICBpbnRlZ2VyczogW1xyXG4gICAgICAgICAgICAxMDAwMCxcclxuICAgICAgICAgICAgOTAwMCxcclxuICAgICAgICAgICAgODAwMCxcclxuICAgICAgICAgICAgNzAwMCxcclxuICAgICAgICAgICAgNjAwMCxcclxuICAgICAgICAgICAgNTAwMCxcclxuICAgICAgICAgICAgNDAwMCxcclxuICAgICAgICAgICAgMzAwMCxcclxuICAgICAgICAgICAgMjAwMCxcclxuICAgICAgICAgICAgMTAwMCxcclxuICAgICAgICAgICAgOTAwLFxyXG4gICAgICAgICAgICA4MDAsXHJcbiAgICAgICAgICAgIDcwMCxcclxuICAgICAgICAgICAgNjAwLFxyXG4gICAgICAgICAgICA1MDAsXHJcbiAgICAgICAgICAgIDQwMCxcclxuICAgICAgICAgICAgMzAwLFxyXG4gICAgICAgICAgICAyMDAsXHJcbiAgICAgICAgICAgIDEwMCxcclxuICAgICAgICAgICAgOTAsXHJcbiAgICAgICAgICAgIDgwLFxyXG4gICAgICAgICAgICA3MCxcclxuICAgICAgICAgICAgNjAsXHJcbiAgICAgICAgICAgIDUwLFxyXG4gICAgICAgICAgICA0MCxcclxuICAgICAgICAgICAgMzAsXHJcbiAgICAgICAgICAgIDIwLFxyXG4gICAgICAgICAgICAxMCxcclxuICAgICAgICAgICAgOSxcclxuICAgICAgICAgICAgOCxcclxuICAgICAgICAgICAgNyxcclxuICAgICAgICAgICAgNixcclxuICAgICAgICAgICAgNSxcclxuICAgICAgICAgICAgNCxcclxuICAgICAgICAgICAgMyxcclxuICAgICAgICAgICAgMixcclxuICAgICAgICAgICAgMVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgdmFsdWVzOiBbXHJcbiAgICAgICAgICAgICfhg7UnLFxyXG4gICAgICAgICAgICAn4YOwJyxcclxuICAgICAgICAgICAgJ+GDrycsXHJcbiAgICAgICAgICAgICfhg7QnLFxyXG4gICAgICAgICAgICAn4YOuJyxcclxuICAgICAgICAgICAgJ+GDrScsXHJcbiAgICAgICAgICAgICfhg6wnLFxyXG4gICAgICAgICAgICAn4YOrJyxcclxuICAgICAgICAgICAgJ+GDqicsXHJcbiAgICAgICAgICAgICfhg6knLFxyXG4gICAgICAgICAgICAn4YOoJyxcclxuICAgICAgICAgICAgJ+GDpycsXHJcbiAgICAgICAgICAgICfhg6YnLFxyXG4gICAgICAgICAgICAn4YOlJyxcclxuICAgICAgICAgICAgJ+GDpCcsXHJcbiAgICAgICAgICAgICfhg7MnLFxyXG4gICAgICAgICAgICAn4YOiJyxcclxuICAgICAgICAgICAgJ+GDoScsXHJcbiAgICAgICAgICAgICfhg6AnLFxyXG4gICAgICAgICAgICAn4YOfJyxcclxuICAgICAgICAgICAgJ+GDnicsXHJcbiAgICAgICAgICAgICfhg50nLFxyXG4gICAgICAgICAgICAn4YOyJyxcclxuICAgICAgICAgICAgJ+GDnCcsXHJcbiAgICAgICAgICAgICfhg5snLFxyXG4gICAgICAgICAgICAn4YOaJyxcclxuICAgICAgICAgICAgJ+GDmScsXHJcbiAgICAgICAgICAgICfhg5gnLFxyXG4gICAgICAgICAgICAn4YOXJyxcclxuICAgICAgICAgICAgJ+GDsScsXHJcbiAgICAgICAgICAgICfhg5YnLFxyXG4gICAgICAgICAgICAn4YOVJyxcclxuICAgICAgICAgICAgJ+GDlCcsXHJcbiAgICAgICAgICAgICfhg5MnLFxyXG4gICAgICAgICAgICAn4YOSJyxcclxuICAgICAgICAgICAgJ+GDkScsXHJcbiAgICAgICAgICAgICfhg5AnXHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuICAgIHZhciBjcmVhdGVBZGRpdGl2ZUNvdW50ZXIgPSBmdW5jdGlvbiAodmFsdWUsIG1pbiwgbWF4LCBzeW1ib2xzLCBmYWxsYmFjaywgc3VmZml4KSB7XHJcbiAgICAgICAgaWYgKHZhbHVlIDwgbWluIHx8IHZhbHVlID4gbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVDb3VudGVyVGV4dCh2YWx1ZSwgZmFsbGJhY2ssIHN1ZmZpeC5sZW5ndGggPiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIChzeW1ib2xzLmludGVnZXJzLnJlZHVjZShmdW5jdGlvbiAoc3RyaW5nLCBpbnRlZ2VyLCBpbmRleCkge1xyXG4gICAgICAgICAgICB3aGlsZSAodmFsdWUgPj0gaW50ZWdlcikge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgLT0gaW50ZWdlcjtcclxuICAgICAgICAgICAgICAgIHN0cmluZyArPSBzeW1ib2xzLnZhbHVlc1tpbmRleF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZztcclxuICAgICAgICB9LCAnJykgKyBzdWZmaXgpO1xyXG4gICAgfTtcclxuICAgIHZhciBjcmVhdGVDb3VudGVyU3R5bGVXaXRoU3ltYm9sUmVzb2x2ZXIgPSBmdW5jdGlvbiAodmFsdWUsIGNvZGVQb2ludFJhbmdlTGVuZ3RoLCBpc051bWVyaWMsIHJlc29sdmVyKSB7XHJcbiAgICAgICAgdmFyIHN0cmluZyA9ICcnO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgaWYgKCFpc051bWVyaWMpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlLS07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RyaW5nID0gcmVzb2x2ZXIodmFsdWUpICsgc3RyaW5nO1xyXG4gICAgICAgICAgICB2YWx1ZSAvPSBjb2RlUG9pbnRSYW5nZUxlbmd0aDtcclxuICAgICAgICB9IHdoaWxlICh2YWx1ZSAqIGNvZGVQb2ludFJhbmdlTGVuZ3RoID49IGNvZGVQb2ludFJhbmdlTGVuZ3RoKTtcclxuICAgICAgICByZXR1cm4gc3RyaW5nO1xyXG4gICAgfTtcclxuICAgIHZhciBjcmVhdGVDb3VudGVyU3R5bGVGcm9tUmFuZ2UgPSBmdW5jdGlvbiAodmFsdWUsIGNvZGVQb2ludFJhbmdlU3RhcnQsIGNvZGVQb2ludFJhbmdlRW5kLCBpc051bWVyaWMsIHN1ZmZpeCkge1xyXG4gICAgICAgIHZhciBjb2RlUG9pbnRSYW5nZUxlbmd0aCA9IGNvZGVQb2ludFJhbmdlRW5kIC0gY29kZVBvaW50UmFuZ2VTdGFydCArIDE7XHJcbiAgICAgICAgcmV0dXJuICgodmFsdWUgPCAwID8gJy0nIDogJycpICtcclxuICAgICAgICAgICAgKGNyZWF0ZUNvdW50ZXJTdHlsZVdpdGhTeW1ib2xSZXNvbHZlcihNYXRoLmFicyh2YWx1ZSksIGNvZGVQb2ludFJhbmdlTGVuZ3RoLCBpc051bWVyaWMsIGZ1bmN0aW9uIChjb2RlUG9pbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmcm9tQ29kZVBvaW50KE1hdGguZmxvb3IoY29kZVBvaW50ICUgY29kZVBvaW50UmFuZ2VMZW5ndGgpICsgY29kZVBvaW50UmFuZ2VTdGFydCk7XHJcbiAgICAgICAgICAgIH0pICtcclxuICAgICAgICAgICAgICAgIHN1ZmZpeCkpO1xyXG4gICAgfTtcclxuICAgIHZhciBjcmVhdGVDb3VudGVyU3R5bGVGcm9tU3ltYm9scyA9IGZ1bmN0aW9uICh2YWx1ZSwgc3ltYm9scywgc3VmZml4KSB7XHJcbiAgICAgICAgaWYgKHN1ZmZpeCA9PT0gdm9pZCAwKSB7IHN1ZmZpeCA9ICcuICc7IH1cclxuICAgICAgICB2YXIgY29kZVBvaW50UmFuZ2VMZW5ndGggPSBzeW1ib2xzLmxlbmd0aDtcclxuICAgICAgICByZXR1cm4gKGNyZWF0ZUNvdW50ZXJTdHlsZVdpdGhTeW1ib2xSZXNvbHZlcihNYXRoLmFicyh2YWx1ZSksIGNvZGVQb2ludFJhbmdlTGVuZ3RoLCBmYWxzZSwgZnVuY3Rpb24gKGNvZGVQb2ludCkgeyByZXR1cm4gc3ltYm9sc1tNYXRoLmZsb29yKGNvZGVQb2ludCAlIGNvZGVQb2ludFJhbmdlTGVuZ3RoKV07IH0pICsgc3VmZml4KTtcclxuICAgIH07XHJcbiAgICB2YXIgQ0pLX1pFUk9TID0gMSA8PCAwO1xyXG4gICAgdmFyIENKS19URU5fQ09FRkZJQ0lFTlRTID0gMSA8PCAxO1xyXG4gICAgdmFyIENKS19URU5fSElHSF9DT0VGRklDSUVOVFMgPSAxIDw8IDI7XHJcbiAgICB2YXIgQ0pLX0hVTkRSRURfQ09FRkZJQ0lFTlRTID0gMSA8PCAzO1xyXG4gICAgdmFyIGNyZWF0ZUNKS0NvdW50ZXIgPSBmdW5jdGlvbiAodmFsdWUsIG51bWJlcnMsIG11bHRpcGxpZXJzLCBuZWdhdGl2ZVNpZ24sIHN1ZmZpeCwgZmxhZ3MpIHtcclxuICAgICAgICBpZiAodmFsdWUgPCAtOTk5OSB8fCB2YWx1ZSA+IDk5OTkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJUZXh0KHZhbHVlLCBMSVNUX1NUWUxFX1RZUEUuQ0pLX0RFQ0lNQUwsIHN1ZmZpeC5sZW5ndGggPiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRtcCA9IE1hdGguYWJzKHZhbHVlKTtcclxuICAgICAgICB2YXIgc3RyaW5nID0gc3VmZml4O1xyXG4gICAgICAgIGlmICh0bXAgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bWJlcnNbMF0gKyBzdHJpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGRpZ2l0ID0gMDsgdG1wID4gMCAmJiBkaWdpdCA8PSA0OyBkaWdpdCsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2VmZmljaWVudCA9IHRtcCAlIDEwO1xyXG4gICAgICAgICAgICBpZiAoY29lZmZpY2llbnQgPT09IDAgJiYgY29udGFpbnMoZmxhZ3MsIENKS19aRVJPUykgJiYgc3RyaW5nICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgc3RyaW5nID0gbnVtYmVyc1tjb2VmZmljaWVudF0gKyBzdHJpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoY29lZmZpY2llbnQgPiAxIHx8XHJcbiAgICAgICAgICAgICAgICAoY29lZmZpY2llbnQgPT09IDEgJiYgZGlnaXQgPT09IDApIHx8XHJcbiAgICAgICAgICAgICAgICAoY29lZmZpY2llbnQgPT09IDEgJiYgZGlnaXQgPT09IDEgJiYgY29udGFpbnMoZmxhZ3MsIENKS19URU5fQ09FRkZJQ0lFTlRTKSkgfHxcclxuICAgICAgICAgICAgICAgIChjb2VmZmljaWVudCA9PT0gMSAmJiBkaWdpdCA9PT0gMSAmJiBjb250YWlucyhmbGFncywgQ0pLX1RFTl9ISUdIX0NPRUZGSUNJRU5UUykgJiYgdmFsdWUgPiAxMDApIHx8XHJcbiAgICAgICAgICAgICAgICAoY29lZmZpY2llbnQgPT09IDEgJiYgZGlnaXQgPiAxICYmIGNvbnRhaW5zKGZsYWdzLCBDSktfSFVORFJFRF9DT0VGRklDSUVOVFMpKSkge1xyXG4gICAgICAgICAgICAgICAgc3RyaW5nID0gbnVtYmVyc1tjb2VmZmljaWVudF0gKyAoZGlnaXQgPiAwID8gbXVsdGlwbGllcnNbZGlnaXQgLSAxXSA6ICcnKSArIHN0cmluZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChjb2VmZmljaWVudCA9PT0gMSAmJiBkaWdpdCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHN0cmluZyA9IG11bHRpcGxpZXJzW2RpZ2l0IC0gMV0gKyBzdHJpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdG1wID0gTWF0aC5mbG9vcih0bXAgLyAxMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAodmFsdWUgPCAwID8gbmVnYXRpdmVTaWduIDogJycpICsgc3RyaW5nO1xyXG4gICAgfTtcclxuICAgIHZhciBDSElORVNFX0lORk9STUFMX01VTFRJUExJRVJTID0gJ+WNgeeZvuWNg+iQrCc7XHJcbiAgICB2YXIgQ0hJTkVTRV9GT1JNQUxfTVVMVElQTElFUlMgPSAn5ou+5L2w5Luf6JCsJztcclxuICAgIHZhciBKQVBBTkVTRV9ORUdBVElWRSA9ICfjg57jgqTjg4rjgrknO1xyXG4gICAgdmFyIEtPUkVBTl9ORUdBVElWRSA9ICfrp4jsnbTrhIjsiqQnO1xyXG4gICAgdmFyIGNyZWF0ZUNvdW50ZXJUZXh0ID0gZnVuY3Rpb24gKHZhbHVlLCB0eXBlLCBhcHBlbmRTdWZmaXgpIHtcclxuICAgICAgICB2YXIgZGVmYXVsdFN1ZmZpeCA9IGFwcGVuZFN1ZmZpeCA/ICcuICcgOiAnJztcclxuICAgICAgICB2YXIgY2prU3VmZml4ID0gYXBwZW5kU3VmZml4ID8gJ+OAgScgOiAnJztcclxuICAgICAgICB2YXIga29yZWFuU3VmZml4ID0gYXBwZW5kU3VmZml4ID8gJywgJyA6ICcnO1xyXG4gICAgICAgIHZhciBzcGFjZVN1ZmZpeCA9IGFwcGVuZFN1ZmZpeCA/ICcgJyA6ICcnO1xyXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5ESVNDOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICfigKInICsgc3BhY2VTdWZmaXg7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLkNJUkNMRTpcclxuICAgICAgICAgICAgICAgIHJldHVybiAn4pemJyArIHNwYWNlU3VmZml4O1xyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5TUVVBUkU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ+KXvicgKyBzcGFjZVN1ZmZpeDtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuREVDSU1BTF9MRUFESU5HX1pFUk86XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RyaW5nID0gY3JlYXRlQ291bnRlclN0eWxlRnJvbVJhbmdlKHZhbHVlLCA0OCwgNTcsIHRydWUsIGRlZmF1bHRTdWZmaXgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZy5sZW5ndGggPCA0ID8gXCIwXCIgKyBzdHJpbmcgOiBzdHJpbmc7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLkNKS19ERUNJTUFMOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJTdHlsZUZyb21TeW1ib2xzKHZhbHVlLCAn44CH5LiA5LqM5LiJ5Zub5LqU5YWt5LiD5YWr5LmdJywgY2prU3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuTE9XRVJfUk9NQU46XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQWRkaXRpdmVDb3VudGVyKHZhbHVlLCAxLCAzOTk5LCBST01BTl9VUFBFUiwgTElTVF9TVFlMRV9UWVBFLkRFQ0lNQUwsIGRlZmF1bHRTdWZmaXgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLlVQUEVSX1JPTUFOOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUFkZGl0aXZlQ291bnRlcih2YWx1ZSwgMSwgMzk5OSwgUk9NQU5fVVBQRVIsIExJU1RfU1RZTEVfVFlQRS5ERUNJTUFMLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuTE9XRVJfR1JFRUs6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVJhbmdlKHZhbHVlLCA5NDUsIDk2OSwgZmFsc2UsIGRlZmF1bHRTdWZmaXgpO1xyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5MT1dFUl9BTFBIQTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDb3VudGVyU3R5bGVGcm9tUmFuZ2UodmFsdWUsIDk3LCAxMjIsIGZhbHNlLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuVVBQRVJfQUxQSEE6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVJhbmdlKHZhbHVlLCA2NSwgOTAsIGZhbHNlLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuQVJBQklDX0lORElDOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJTdHlsZUZyb21SYW5nZSh2YWx1ZSwgMTYzMiwgMTY0MSwgdHJ1ZSwgZGVmYXVsdFN1ZmZpeCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLkFSTUVOSUFOOlxyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5VUFBFUl9BUk1FTklBTjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVBZGRpdGl2ZUNvdW50ZXIodmFsdWUsIDEsIDk5OTksIEFSTUVOSUFOLCBMSVNUX1NUWUxFX1RZUEUuREVDSU1BTCwgZGVmYXVsdFN1ZmZpeCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLkxPV0VSX0FSTUVOSUFOOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUFkZGl0aXZlQ291bnRlcih2YWx1ZSwgMSwgOTk5OSwgQVJNRU5JQU4sIExJU1RfU1RZTEVfVFlQRS5ERUNJTUFMLCBkZWZhdWx0U3VmZml4KS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5CRU5HQUxJOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJTdHlsZUZyb21SYW5nZSh2YWx1ZSwgMjUzNCwgMjU0MywgdHJ1ZSwgZGVmYXVsdFN1ZmZpeCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLkNBTUJPRElBTjpcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuS0hNRVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVJhbmdlKHZhbHVlLCA2MTEyLCA2MTIxLCB0cnVlLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuQ0pLX0VBUlRITFlfQlJBTkNIOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJTdHlsZUZyb21TeW1ib2xzKHZhbHVlLCAn5a2Q5LiR5a+F5Y2v6L6w5bez5Y2I5pyq55Sz6YWJ5oiM5LqlJywgY2prU3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuQ0pLX0hFQVZFTkxZX1NURU06XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVN5bWJvbHModmFsdWUsICfnlLLkuZnkuJnkuIHmiIrlt7Hluprovpvlo6znmbgnLCBjamtTdWZmaXgpO1xyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5DSktfSURFT0dSQVBISUM6XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLlRSQURfQ0hJTkVTRV9JTkZPUk1BTDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDSktDb3VudGVyKHZhbHVlLCAn6Zu25LiA5LqM5LiJ5Zub5LqU5YWt5LiD5YWr5LmdJywgQ0hJTkVTRV9JTkZPUk1BTF9NVUxUSVBMSUVSUywgJ+iyoCcsIGNqa1N1ZmZpeCwgQ0pLX1RFTl9DT0VGRklDSUVOVFMgfCBDSktfVEVOX0hJR0hfQ09FRkZJQ0lFTlRTIHwgQ0pLX0hVTkRSRURfQ09FRkZJQ0lFTlRTKTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuVFJBRF9DSElORVNFX0ZPUk1BTDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDSktDb3VudGVyKHZhbHVlLCAn6Zu25aO56LKz5Y+D6IKG5LyN6Zm45p+S5o2M546WJywgQ0hJTkVTRV9GT1JNQUxfTVVMVElQTElFUlMsICfosqAnLCBjamtTdWZmaXgsIENKS19aRVJPUyB8IENKS19URU5fQ09FRkZJQ0lFTlRTIHwgQ0pLX1RFTl9ISUdIX0NPRUZGSUNJRU5UUyB8IENKS19IVU5EUkVEX0NPRUZGSUNJRU5UUyk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLlNJTVBfQ0hJTkVTRV9JTkZPUk1BTDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDSktDb3VudGVyKHZhbHVlLCAn6Zu25LiA5LqM5LiJ5Zub5LqU5YWt5LiD5YWr5LmdJywgQ0hJTkVTRV9JTkZPUk1BTF9NVUxUSVBMSUVSUywgJ+i0nycsIGNqa1N1ZmZpeCwgQ0pLX1RFTl9DT0VGRklDSUVOVFMgfCBDSktfVEVOX0hJR0hfQ09FRkZJQ0lFTlRTIHwgQ0pLX0hVTkRSRURfQ09FRkZJQ0lFTlRTKTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuU0lNUF9DSElORVNFX0ZPUk1BTDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDSktDb3VudGVyKHZhbHVlLCAn6Zu25aO56LSw5Y+B6IKG5LyN6ZmG5p+S5o2M546WJywgQ0hJTkVTRV9GT1JNQUxfTVVMVElQTElFUlMsICfotJ8nLCBjamtTdWZmaXgsIENKS19aRVJPUyB8IENKS19URU5fQ09FRkZJQ0lFTlRTIHwgQ0pLX1RFTl9ISUdIX0NPRUZGSUNJRU5UUyB8IENKS19IVU5EUkVEX0NPRUZGSUNJRU5UUyk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLkpBUEFORVNFX0lORk9STUFMOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNKS0NvdW50ZXIodmFsdWUsICfjgIfkuIDkuozkuInlm5vkupTlha3kuIPlhavkuZ0nLCAn5Y2B55m+5Y2D5LiHJywgSkFQQU5FU0VfTkVHQVRJVkUsIGNqa1N1ZmZpeCwgMCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLkpBUEFORVNFX0ZPUk1BTDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDSktDb3VudGVyKHZhbHVlLCAn6Zu25aOx5byQ5Y+C5Zub5LyN5YWt5LiD5YWr5LmdJywgJ+aLvueZvuWNg+S4hycsIEpBUEFORVNFX05FR0FUSVZFLCBjamtTdWZmaXgsIENKS19aRVJPUyB8IENKS19URU5fQ09FRkZJQ0lFTlRTIHwgQ0pLX1RFTl9ISUdIX0NPRUZGSUNJRU5UUyk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLktPUkVBTl9IQU5HVUxfRk9STUFMOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNKS0NvdW50ZXIodmFsdWUsICfsmIHsnbzsnbTsgrzsgqzsmKTsnKHsuaDtjJTqtawnLCAn7Iut67Cx7LKc66eMJywgS09SRUFOX05FR0FUSVZFLCBrb3JlYW5TdWZmaXgsIENKS19aRVJPUyB8IENKS19URU5fQ09FRkZJQ0lFTlRTIHwgQ0pLX1RFTl9ISUdIX0NPRUZGSUNJRU5UUyk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLktPUkVBTl9IQU5KQV9JTkZPUk1BTDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDSktDb3VudGVyKHZhbHVlLCAn6Zu25LiA5LqM5LiJ5Zub5LqU5YWt5LiD5YWr5LmdJywgJ+WNgeeZvuWNg+iQrCcsIEtPUkVBTl9ORUdBVElWRSwga29yZWFuU3VmZml4LCAwKTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuS09SRUFOX0hBTkpBX0ZPUk1BTDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDSktDb3VudGVyKHZhbHVlLCAn6Zu25aO56LKz5Y+D5Zub5LqU5YWt5LiD5YWr5LmdJywgJ+aLvueZvuWNgycsIEtPUkVBTl9ORUdBVElWRSwga29yZWFuU3VmZml4LCBDSktfWkVST1MgfCBDSktfVEVOX0NPRUZGSUNJRU5UUyB8IENKS19URU5fSElHSF9DT0VGRklDSUVOVFMpO1xyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5ERVZBTkFHQVJJOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJTdHlsZUZyb21SYW5nZSh2YWx1ZSwgMHg5NjYsIDB4OTZmLCB0cnVlLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuR0VPUkdJQU46XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQWRkaXRpdmVDb3VudGVyKHZhbHVlLCAxLCAxOTk5OSwgR0VPUkdJQU4sIExJU1RfU1RZTEVfVFlQRS5ERUNJTUFMLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuR1VKQVJBVEk6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVJhbmdlKHZhbHVlLCAweGFlNiwgMHhhZWYsIHRydWUsIGRlZmF1bHRTdWZmaXgpO1xyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5HVVJNVUtISTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDb3VudGVyU3R5bGVGcm9tUmFuZ2UodmFsdWUsIDB4YTY2LCAweGE2ZiwgdHJ1ZSwgZGVmYXVsdFN1ZmZpeCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLkhFQlJFVzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVBZGRpdGl2ZUNvdW50ZXIodmFsdWUsIDEsIDEwOTk5LCBIRUJSRVcsIExJU1RfU1RZTEVfVFlQRS5ERUNJTUFMLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuSElSQUdBTkE6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVN5bWJvbHModmFsdWUsICfjgYLjgYTjgYbjgYjjgYrjgYvjgY3jgY/jgZHjgZPjgZXjgZfjgZnjgZvjgZ3jgZ/jgaHjgaTjgabjgajjgarjgavjgazjga3jga7jga/jgbLjgbXjgbjjgbvjgb7jgb/jgoDjgoHjgoLjgoTjgobjgojjgonjgorjgovjgozjgo3jgo/jgpDjgpHjgpLjgpMnKTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuSElSQUdBTkFfSVJPSEE6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVN5bWJvbHModmFsdWUsICfjgYTjgo3jga/jgavjgbvjgbjjgajjgaHjgorjgazjgovjgpLjgo/jgYvjgojjgZ/jgozjgZ3jgaTjga3jgarjgonjgoDjgYbjgpDjga7jgYrjgY/jgoTjgb7jgZHjgbXjgZPjgYjjgabjgYLjgZXjgY3jgobjgoHjgb/jgZfjgpHjgbLjgoLjgZvjgZknKTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuS0FOTkFEQTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDb3VudGVyU3R5bGVGcm9tUmFuZ2UodmFsdWUsIDB4Y2U2LCAweGNlZiwgdHJ1ZSwgZGVmYXVsdFN1ZmZpeCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLktBVEFLQU5BOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJTdHlsZUZyb21TeW1ib2xzKHZhbHVlLCAn44Ki44Kk44Km44Ko44Kq44Kr44Kt44Kv44Kx44Kz44K144K344K544K744K944K/44OB44OE44OG44OI44OK44OL44OM44ON44OO44OP44OS44OV44OY44Ob44Oe44Of44Og44Oh44Oi44Ok44Om44Oo44Op44Oq44Or44Os44Ot44Ov44Ow44Ox44Oy44OzJywgY2prU3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuS0FUQUtBTkFfSVJPSEE6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVN5bWJvbHModmFsdWUsICfjgqTjg63jg4/jg4vjg5vjg5jjg4jjg4Hjg6rjg4zjg6vjg7Ljg6/jgqvjg6jjgr/jg6zjgr3jg4Tjg43jg4rjg6njg6Djgqbjg7Djg47jgqrjgq/jg6Tjg57jgrHjg5XjgrPjgqjjg4bjgqLjgrXjgq3jg6bjg6Hjg5/jgrfjg7Hjg5Ljg6LjgrvjgrknLCBjamtTdWZmaXgpO1xyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5MQU86XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVJhbmdlKHZhbHVlLCAweGVkMCwgMHhlZDksIHRydWUsIGRlZmF1bHRTdWZmaXgpO1xyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5NT05HT0xJQU46XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVJhbmdlKHZhbHVlLCAweDE4MTAsIDB4MTgxOSwgdHJ1ZSwgZGVmYXVsdFN1ZmZpeCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLk1ZQU5NQVI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVJhbmdlKHZhbHVlLCAweDEwNDAsIDB4MTA0OSwgdHJ1ZSwgZGVmYXVsdFN1ZmZpeCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLk9SSVlBOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJTdHlsZUZyb21SYW5nZSh2YWx1ZSwgMHhiNjYsIDB4YjZmLCB0cnVlLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuUEVSU0lBTjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDb3VudGVyU3R5bGVGcm9tUmFuZ2UodmFsdWUsIDB4NmYwLCAweDZmOSwgdHJ1ZSwgZGVmYXVsdFN1ZmZpeCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLlRBTUlMOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJTdHlsZUZyb21SYW5nZSh2YWx1ZSwgMHhiZTYsIDB4YmVmLCB0cnVlLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuVEVMVUdVOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJTdHlsZUZyb21SYW5nZSh2YWx1ZSwgMHhjNjYsIDB4YzZmLCB0cnVlLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICAgICAgY2FzZSBMSVNUX1NUWUxFX1RZUEUuVEhBSTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVDb3VudGVyU3R5bGVGcm9tUmFuZ2UodmFsdWUsIDB4ZTUwLCAweGU1OSwgdHJ1ZSwgZGVmYXVsdFN1ZmZpeCk7XHJcbiAgICAgICAgICAgIGNhc2UgTElTVF9TVFlMRV9UWVBFLlRJQkVUQU46XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQ291bnRlclN0eWxlRnJvbVJhbmdlKHZhbHVlLCAweGYyMCwgMHhmMjksIHRydWUsIGRlZmF1bHRTdWZmaXgpO1xyXG4gICAgICAgICAgICBjYXNlIExJU1RfU1RZTEVfVFlQRS5ERUNJTUFMOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUNvdW50ZXJTdHlsZUZyb21SYW5nZSh2YWx1ZSwgNDgsIDU3LCB0cnVlLCBkZWZhdWx0U3VmZml4KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIElHTk9SRV9BVFRSSUJVVEUgPSAnZGF0YS1odG1sMmNhbnZhcy1pZ25vcmUnO1xyXG4gICAgdmFyIERvY3VtZW50Q2xvbmVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIERvY3VtZW50Q2xvbmVyKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxlZEVsZW1lbnRzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMucmVmZXJlbmNlRWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHRoaXMuY291bnRlcnMgPSBuZXcgQ291bnRlclN0YXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMucXVvdGVEZXB0aCA9IDA7XHJcbiAgICAgICAgICAgIGlmICghZWxlbWVudC5vd25lckRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nsb25lZCBlbGVtZW50IGRvZXMgbm90IGhhdmUgYW4gb3duZXIgZG9jdW1lbnQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50RWxlbWVudCA9IHRoaXMuY2xvbmVOb2RlKGVsZW1lbnQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEb2N1bWVudENsb25lci5wcm90b3R5cGUudG9JRnJhbWUgPSBmdW5jdGlvbiAob3duZXJEb2N1bWVudCwgd2luZG93U2l6ZSkge1xyXG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgaWZyYW1lID0gY3JlYXRlSUZyYW1lQ29udGFpbmVyKG93bmVyRG9jdW1lbnQsIHdpbmRvd1NpemUpO1xyXG4gICAgICAgICAgICBpZiAoIWlmcmFtZS5jb250ZW50V2luZG93KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJVbmFibGUgdG8gZmluZCBpZnJhbWUgd2luZG93XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBzY3JvbGxYID0gb3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldy5wYWdlWE9mZnNldDtcclxuICAgICAgICAgICAgdmFyIHNjcm9sbFkgPSBvd25lckRvY3VtZW50LmRlZmF1bHRWaWV3LnBhZ2VZT2Zmc2V0O1xyXG4gICAgICAgICAgICB2YXIgY2xvbmVXaW5kb3cgPSBpZnJhbWUuY29udGVudFdpbmRvdztcclxuICAgICAgICAgICAgdmFyIGRvY3VtZW50Q2xvbmUgPSBjbG9uZVdpbmRvdy5kb2N1bWVudDtcclxuICAgICAgICAgICAgLyogQ2hyb21lIGRvZXNuJ3QgZGV0ZWN0IHJlbGF0aXZlIGJhY2tncm91bmQtaW1hZ2VzIGFzc2lnbmVkIGluIGlubGluZSA8c3R5bGU+IHNoZWV0cyB3aGVuIGZldGNoZWQgdGhyb3VnaCBnZXRDb21wdXRlZFN0eWxlXHJcbiAgICAgICAgICAgICBpZiB3aW5kb3cgdXJsIGlzIGFib3V0OmJsYW5rLCB3ZSBjYW4gYXNzaWduIHRoZSB1cmwgdG8gY3VycmVudCBieSB3cml0aW5nIG9udG8gdGhlIGRvY3VtZW50XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB2YXIgaWZyYW1lTG9hZCA9IGlmcmFtZUxvYWRlcihpZnJhbWUpLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gX19hd2FpdGVyKF90aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9uY2xvbmU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbGVkRWxlbWVudHMuZm9yRWFjaChyZXN0b3JlTm9kZVNjcm9sbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2xvbmVXaW5kb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9uZVdpbmRvdy5zY3JvbGxUbyh3aW5kb3dTaXplLmxlZnQsIHdpbmRvd1NpemUudG9wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoLyhpUGFkfGlQaG9uZXxpUG9kKS9nLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNsb25lV2luZG93LnNjcm9sbFkgIT09IHdpbmRvd1NpemUudG9wIHx8IGNsb25lV2luZG93LnNjcm9sbFggIT09IHdpbmRvd1NpemUubGVmdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnRDbG9uZS5kb2N1bWVudEVsZW1lbnQuc3R5bGUudG9wID0gLXdpbmRvd1NpemUudG9wICsgJ3B4JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnRDbG9uZS5kb2N1bWVudEVsZW1lbnQuc3R5bGUubGVmdCA9IC13aW5kb3dTaXplLmxlZnQgKyAncHgnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudENsb25lLmRvY3VtZW50RWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbG9uZSA9IHRoaXMub3B0aW9ucy5vbmNsb25lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNsb25lZFJlZmVyZW5jZUVsZW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIFByb21pc2UucmVqZWN0KFwiRXJyb3IgZmluZGluZyB0aGUgXCIgKyB0aGlzLnJlZmVyZW5jZUVsZW1lbnQubm9kZU5hbWUgKyBcIiBpbiB0aGUgY2xvbmVkIGRvY3VtZW50XCIpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGRvY3VtZW50Q2xvbmUuZm9udHMgJiYgZG9jdW1lbnRDbG9uZS5mb250cy5yZWFkeSkpIHJldHVybiBbMyAvKmJyZWFrKi8sIDJdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgZG9jdW1lbnRDbG9uZS5mb250cy5yZWFkeV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hLmxhYmVsID0gMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvbmNsb25lID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7IHJldHVybiBvbmNsb25lKGRvY3VtZW50Q2xvbmUpOyB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gaWZyYW1lOyB9KV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgaWZyYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7IH0pO1xyXG4gICAgICAgICAgICBkb2N1bWVudENsb25lLm9wZW4oKTtcclxuICAgICAgICAgICAgZG9jdW1lbnRDbG9uZS53cml0ZShzZXJpYWxpemVEb2N0eXBlKGRvY3VtZW50LmRvY3R5cGUpICsgXCI8aHRtbD48L2h0bWw+XCIpO1xyXG4gICAgICAgICAgICAvLyBDaHJvbWUgc2Nyb2xscyB0aGUgcGFyZW50IGRvY3VtZW50IGZvciBzb21lIHJlYXNvbiBhZnRlciB0aGUgd3JpdGUgdG8gdGhlIGNsb25lZCB3aW5kb3c/Pz9cclxuICAgICAgICAgICAgcmVzdG9yZU93bmVyU2Nyb2xsKHRoaXMucmVmZXJlbmNlRWxlbWVudC5vd25lckRvY3VtZW50LCBzY3JvbGxYLCBzY3JvbGxZKTtcclxuICAgICAgICAgICAgZG9jdW1lbnRDbG9uZS5yZXBsYWNlQ2hpbGQoZG9jdW1lbnRDbG9uZS5hZG9wdE5vZGUodGhpcy5kb2N1bWVudEVsZW1lbnQpLCBkb2N1bWVudENsb25lLmRvY3VtZW50RWxlbWVudCk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50Q2xvbmUuY2xvc2UoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGlmcmFtZUxvYWQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBEb2N1bWVudENsb25lci5wcm90b3R5cGUuY3JlYXRlRWxlbWVudENsb25lID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKGlzQ2FudmFzRWxlbWVudChub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ2FudmFzQ2xvbmUobm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgaWYgKGlzSUZyYW1lRWxlbWVudChub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlSUZyYW1lQ2xvbmUobm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICovXHJcbiAgICAgICAgICAgIGlmIChpc1N0eWxlRWxlbWVudChub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlU3R5bGVDbG9uZShub2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgY2xvbmUgPSBub2RlLmNsb25lTm9kZShmYWxzZSk7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgaWYgKGlzSW1hZ2VFbGVtZW50KGNsb25lKSAmJiBjbG9uZS5sb2FkaW5nID09PSAnbGF6eScpIHtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgICAgIGNsb25lLmxvYWRpbmcgPSAnZWFnZXInO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBjbG9uZTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIERvY3VtZW50Q2xvbmVyLnByb3RvdHlwZS5jcmVhdGVTdHlsZUNsb25lID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhciBzaGVldCA9IG5vZGUuc2hlZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2hlZXQgJiYgc2hlZXQuY3NzUnVsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3NzID0gW10uc2xpY2UuY2FsbChzaGVldC5jc3NSdWxlcywgMCkucmVkdWNlKGZ1bmN0aW9uIChjc3MsIHJ1bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUgJiYgdHlwZW9mIHJ1bGUuY3NzVGV4dCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjc3MgKyBydWxlLmNzc1RleHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNzcztcclxuICAgICAgICAgICAgICAgICAgICB9LCAnJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0eWxlID0gbm9kZS5jbG9uZU5vZGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gY3NzO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHlsZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYWNjZXNzaW5nIG5vZGUuc2hlZXQuY3NzUnVsZXMgdGhyb3dzIGEgRE9NRXhjZXB0aW9uXHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2UodGhpcy5vcHRpb25zLmlkKS5lcnJvcignVW5hYmxlIHRvIGFjY2VzcyBjc3NSdWxlcyBwcm9wZXJ0eScsIGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGUubmFtZSAhPT0gJ1NlY3VyaXR5RXJyb3InKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5jbG9uZU5vZGUoZmFsc2UpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgRG9jdW1lbnRDbG9uZXIucHJvdG90eXBlLmNyZWF0ZUNhbnZhc0Nsb25lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlubGluZUltYWdlcyAmJiBjYW52YXMub3duZXJEb2N1bWVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGltZyA9IGNhbnZhcy5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBpbWcuc3JjID0gY2FudmFzLnRvRGF0YVVSTCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbWc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5nZXRJbnN0YW5jZSh0aGlzLm9wdGlvbnMuaWQpLmluZm8oXCJVbmFibGUgdG8gY2xvbmUgY2FudmFzIGNvbnRlbnRzLCBjYW52YXMgaXMgdGFpbnRlZFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgY2xvbmVkQ2FudmFzID0gY2FudmFzLmNsb25lTm9kZShmYWxzZSk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjbG9uZWRDYW52YXMud2lkdGggPSBjYW52YXMud2lkdGg7XHJcbiAgICAgICAgICAgICAgICBjbG9uZWRDYW52YXMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuICAgICAgICAgICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICAgICAgICAgIHZhciBjbG9uZWRDdHggPSBjbG9uZWRDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICAgICAgICAgIGlmIChjbG9uZWRDdHgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3R4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lZEN0eC5wdXRJbWFnZURhdGEoY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpLCAwLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lZEN0eC5kcmF3SW1hZ2UoY2FudmFzLCAwLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xvbmVkQ2FudmFzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7IH1cclxuICAgICAgICAgICAgcmV0dXJuIGNsb25lZENhbnZhcztcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8qXHJcbiAgICAgICAgY3JlYXRlSUZyYW1lQ2xvbmUoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCkge1xyXG4gICAgICAgICAgICBjb25zdCB0ZW1wSWZyYW1lID0gPEhUTUxJRnJhbWVFbGVtZW50PmlmcmFtZS5jbG9uZU5vZGUoZmFsc2UpO1xyXG4gICAgICAgICAgICBjb25zdCBpZnJhbWVLZXkgPSBnZW5lcmF0ZUlmcmFtZUtleSgpO1xyXG4gICAgICAgICAgICB0ZW1wSWZyYW1lLnNldEF0dHJpYnV0ZSgnZGF0YS1odG1sMmNhbnZhcy1pbnRlcm5hbC1pZnJhbWUta2V5JywgaWZyYW1lS2V5KTtcclxuXG4gICAgICAgICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBwYXJzZUJvdW5kcyhpZnJhbWUpO1xyXG5cbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VMb2FkZXIuY2FjaGVbaWZyYW1lS2V5XSA9IGdldElmcmFtZURvY3VtZW50RWxlbWVudChpZnJhbWUsIHRoaXMub3B0aW9ucylcclxuICAgICAgICAgICAgICAgIC50aGVuKGRvY3VtZW50RWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dUYWludDogdGhpcy5vcHRpb25zLmFsbG93VGFpbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhczogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVGltZW91dDogdGhpcy5vcHRpb25zLmltYWdlVGltZW91dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dpbmc6IHRoaXMub3B0aW9ucy5sb2dnaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJveHk6IHRoaXMub3B0aW9ucy5wcm94eSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUNvbnRhaW5lcjogdGhpcy5vcHRpb25zLnJlbW92ZUNvbnRhaW5lcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlOiB0aGlzLm9wdGlvbnMuc2NhbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JlaWduT2JqZWN0UmVuZGVyaW5nOiB0aGlzLm9wdGlvbnMuZm9yZWlnbk9iamVjdFJlbmRlcmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZUNPUlM6IHRoaXMub3B0aW9ucy51c2VDT1JTLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBuZXcgQ2FudmFzUmVuZGVyZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dXaWR0aDogZG9jdW1lbnRFbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcuaW5uZXJXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvd0hlaWdodDogZG9jdW1lbnRFbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcuaW5uZXJIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxYOiBkb2N1bWVudEVsZW1lbnQub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldy5wYWdlWE9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFk6IGRvY3VtZW50RWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3LnBhZ2VZT2Zmc2V0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCkgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWZyYW1lQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZnJhbWVDYW52YXMub25sb2FkID0gKCkgPT4gcmVzb2x2ZShjYW52YXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWZyYW1lQ2FudmFzLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFbXB0eSBpZnJhbWVzIG1heSByZXN1bHQgaW4gZW1wdHkgXCJkYXRhOixcIiBVUkxzLCB3aGljaCBhcmUgaW52YWxpZCBmcm9tIHRoZSA8aW1nPidzIHBvaW50IG9mIHZpZXdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmQgaW5zdGVhZCBvZiBgb25sb2FkYCBjYXVzZSBgb25lcnJvcmAgYW5kIHVuaGFuZGxlZCByZWplY3Rpb24gd2FybmluZ3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbmlrbGFzdmgvaHRtbDJjYW52YXMvaXNzdWVzLzE1MDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZnJhbWVDYW52YXMuc3JjID09ICdkYXRhOiwnID8gcmVzb2x2ZShjYW52YXMpIDogcmVqZWN0KGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZnJhbWVDYW52YXMuc3JjID0gY2FudmFzLnRvRGF0YVVSTCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRlbXBJZnJhbWUucGFyZW50Tm9kZSAmJiBpZnJhbWUub3duZXJEb2N1bWVudCAmJiBpZnJhbWUub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBJZnJhbWUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlDU1NTdHlsZXMoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZnJhbWUub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGlmcmFtZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZnJhbWVDYW52YXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcElmcmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gdGVtcElmcmFtZTtcclxuICAgICAgICB9XHJcbiAgICAqL1xyXG4gICAgICAgIERvY3VtZW50Q2xvbmVyLnByb3RvdHlwZS5jbG9uZU5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgICAgICBpZiAoaXNUZXh0Tm9kZShub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5vZGUuZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFub2RlLm93bmVyRG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlLmNsb25lTm9kZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHdpbmRvdyA9IG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldztcclxuICAgICAgICAgICAgaWYgKHdpbmRvdyAmJiBpc0VsZW1lbnROb2RlKG5vZGUpICYmIChpc0hUTUxFbGVtZW50Tm9kZShub2RlKSB8fCBpc1NWR0VsZW1lbnROb2RlKG5vZGUpKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNsb25lID0gdGhpcy5jcmVhdGVFbGVtZW50Q2xvbmUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcclxuICAgICAgICAgICAgICAgIHZhciBzdHlsZUJlZm9yZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG5vZGUsICc6YmVmb3JlJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGVBZnRlciA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG5vZGUsICc6YWZ0ZXInKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlZmVyZW5jZUVsZW1lbnQgPT09IG5vZGUgJiYgaXNIVE1MRWxlbWVudE5vZGUoY2xvbmUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9uZWRSZWZlcmVuY2VFbGVtZW50ID0gY2xvbmU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNCb2R5RWxlbWVudChjbG9uZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVQc2V1ZG9IaWRlU3R5bGVzKGNsb25lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBjb3VudGVycyA9IHRoaXMuY291bnRlcnMucGFyc2UobmV3IENTU1BhcnNlZENvdW50ZXJEZWNsYXJhdGlvbihzdHlsZSkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJlZm9yZSA9IHRoaXMucmVzb2x2ZVBzZXVkb0NvbnRlbnQobm9kZSwgY2xvbmUsIHN0eWxlQmVmb3JlLCBQc2V1ZG9FbGVtZW50VHlwZS5CRUZPUkUpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY2hpbGQgPSBub2RlLmZpcnN0Q2hpbGQ7IGNoaWxkOyBjaGlsZCA9IGNoaWxkLm5leHRTaWJsaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0VsZW1lbnROb2RlKGNoaWxkKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWlzU2NyaXB0RWxlbWVudChjaGlsZCkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFjaGlsZC5oYXNBdHRyaWJ1dGUoSUdOT1JFX0FUVFJJQlVURSkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0eXBlb2YgdGhpcy5vcHRpb25zLmlnbm9yZUVsZW1lbnRzICE9PSAnZnVuY3Rpb24nIHx8ICF0aGlzLm9wdGlvbnMuaWdub3JlRWxlbWVudHMoY2hpbGQpKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuY29weVN0eWxlcyB8fCAhaXNFbGVtZW50Tm9kZShjaGlsZCkgfHwgIWlzU3R5bGVFbGVtZW50KGNoaWxkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQodGhpcy5jbG9uZU5vZGUoY2hpbGQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChiZWZvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbG9uZS5pbnNlcnRCZWZvcmUoYmVmb3JlLCBjbG9uZS5maXJzdENoaWxkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBhZnRlciA9IHRoaXMucmVzb2x2ZVBzZXVkb0NvbnRlbnQobm9kZSwgY2xvbmUsIHN0eWxlQWZ0ZXIsIFBzZXVkb0VsZW1lbnRUeXBlLkFGVEVSKTtcclxuICAgICAgICAgICAgICAgIGlmIChhZnRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGFmdGVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY291bnRlcnMucG9wKGNvdW50ZXJzKTtcclxuICAgICAgICAgICAgICAgIGlmIChzdHlsZSAmJiAodGhpcy5vcHRpb25zLmNvcHlTdHlsZXMgfHwgaXNTVkdFbGVtZW50Tm9kZShub2RlKSkgJiYgIWlzSUZyYW1lRWxlbWVudChub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvcHlDU1NTdHlsZXMoc3R5bGUsIGNsb25lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vdGhpcy5pbmxpbmVBbGxJbWFnZXMoY2xvbmUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuc2Nyb2xsVG9wICE9PSAwIHx8IG5vZGUuc2Nyb2xsTGVmdCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsZWRFbGVtZW50cy5wdXNoKFtjbG9uZSwgbm9kZS5zY3JvbGxMZWZ0LCBub2RlLnNjcm9sbFRvcF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKChpc1RleHRhcmVhRWxlbWVudChub2RlKSB8fCBpc1NlbGVjdEVsZW1lbnQobm9kZSkpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKGlzVGV4dGFyZWFFbGVtZW50KGNsb25lKSB8fCBpc1NlbGVjdEVsZW1lbnQoY2xvbmUpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb25lLnZhbHVlID0gbm9kZS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjbG9uZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5jbG9uZU5vZGUoZmFsc2UpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgRG9jdW1lbnRDbG9uZXIucHJvdG90eXBlLnJlc29sdmVQc2V1ZG9Db250ZW50ID0gZnVuY3Rpb24gKG5vZGUsIGNsb25lLCBzdHlsZSwgcHNldWRvRWx0KSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgICAgIGlmICghc3R5bGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBzdHlsZS5jb250ZW50O1xyXG4gICAgICAgICAgICB2YXIgZG9jdW1lbnQgPSBjbG9uZS5vd25lckRvY3VtZW50O1xyXG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50IHx8ICF2YWx1ZSB8fCB2YWx1ZSA9PT0gJ25vbmUnIHx8IHZhbHVlID09PSAnLW1vei1hbHQtY29udGVudCcgfHwgc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jb3VudGVycy5wYXJzZShuZXcgQ1NTUGFyc2VkQ291bnRlckRlY2xhcmF0aW9uKHN0eWxlKSk7XHJcbiAgICAgICAgICAgIHZhciBkZWNsYXJhdGlvbiA9IG5ldyBDU1NQYXJzZWRQc2V1ZG9EZWNsYXJhdGlvbihzdHlsZSk7XHJcbiAgICAgICAgICAgIHZhciBhbm9ueW1vdXNSZXBsYWNlZEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sMmNhbnZhc3BzZXVkb2VsZW1lbnQnKTtcclxuICAgICAgICAgICAgY29weUNTU1N0eWxlcyhzdHlsZSwgYW5vbnltb3VzUmVwbGFjZWRFbGVtZW50KTtcclxuICAgICAgICAgICAgZGVjbGFyYXRpb24uY29udGVudC5mb3JFYWNoKGZ1bmN0aW9uICh0b2tlbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5TVFJJTkdfVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgICAgICBhbm9ueW1vdXNSZXBsYWNlZEVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodG9rZW4udmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRva2VuLnR5cGUgPT09IFRva2VuVHlwZS5VUkxfVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1nLnNyYyA9IHRva2VuLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGltZy5zdHlsZS5vcGFjaXR5ID0gJzEnO1xyXG4gICAgICAgICAgICAgICAgICAgIGFub255bW91c1JlcGxhY2VkRWxlbWVudC5hcHBlbmRDaGlsZChpbWcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodG9rZW4udHlwZSA9PT0gVG9rZW5UeXBlLkZVTkNUSU9OKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRva2VuLm5hbWUgPT09ICdhdHRyJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXR0ciA9IHRva2VuLnZhbHVlcy5maWx0ZXIoaXNJZGVudFRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbm9ueW1vdXNSZXBsYWNlZEVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZS5nZXRBdHRyaWJ1dGUoYXR0clswXS52YWx1ZSkgfHwgJycpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0b2tlbi5uYW1lID09PSAnY291bnRlcicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9hID0gdG9rZW4udmFsdWVzLmZpbHRlcihub25GdW5jdGlvbkFyZ1NlcGFyYXRvciksIGNvdW50ZXIgPSBfYVswXSwgY291bnRlclN0eWxlID0gX2FbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3VudGVyICYmIGlzSWRlbnRUb2tlbihjb3VudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvdW50ZXJTdGF0ZSA9IF90aGlzLmNvdW50ZXJzLmdldENvdW50ZXJWYWx1ZShjb3VudGVyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3VudGVyVHlwZSA9IGNvdW50ZXJTdHlsZSAmJiBpc0lkZW50VG9rZW4oY291bnRlclN0eWxlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gbGlzdFN0eWxlVHlwZS5wYXJzZShjb3VudGVyU3R5bGUudmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBMSVNUX1NUWUxFX1RZUEUuREVDSU1BTDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFub255bW91c1JlcGxhY2VkRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjcmVhdGVDb3VudGVyVGV4dChjb3VudGVyU3RhdGUsIGNvdW50ZXJUeXBlLCBmYWxzZSkpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0b2tlbi5uYW1lID09PSAnY291bnRlcnMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfYiA9IHRva2VuLnZhbHVlcy5maWx0ZXIobm9uRnVuY3Rpb25BcmdTZXBhcmF0b3IpLCBjb3VudGVyID0gX2JbMF0sIGRlbGltID0gX2JbMV0sIGNvdW50ZXJTdHlsZSA9IF9iWzJdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY291bnRlciAmJiBpc0lkZW50VG9rZW4oY291bnRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3VudGVyU3RhdGVzID0gX3RoaXMuY291bnRlcnMuZ2V0Q291bnRlclZhbHVlcyhjb3VudGVyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3VudGVyVHlwZV8xID0gY291bnRlclN0eWxlICYmIGlzSWRlbnRUb2tlbihjb3VudGVyU3R5bGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBsaXN0U3R5bGVUeXBlLnBhcnNlKGNvdW50ZXJTdHlsZS52YWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IExJU1RfU1RZTEVfVFlQRS5ERUNJTUFMO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlcGFyYXRvciA9IGRlbGltICYmIGRlbGltLnR5cGUgPT09IFRva2VuVHlwZS5TVFJJTkdfVE9LRU4gPyBkZWxpbS52YWx1ZSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRleHQgPSBjb3VudGVyU3RhdGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIGNyZWF0ZUNvdW50ZXJUZXh0KHZhbHVlLCBjb3VudGVyVHlwZV8xLCBmYWxzZSk7IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmpvaW4oc2VwYXJhdG9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFub255bW91c1JlcGxhY2VkRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0b2tlbi50eXBlID09PSBUb2tlblR5cGUuSURFTlRfVE9LRU4pIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ29wZW4tcXVvdGUnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5vbnltb3VzUmVwbGFjZWRFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGdldFF1b3RlKGRlY2xhcmF0aW9uLnF1b3RlcywgX3RoaXMucXVvdGVEZXB0aCsrLCB0cnVlKSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Nsb3NlLXF1b3RlJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFub255bW91c1JlcGxhY2VkRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShnZXRRdW90ZShkZWNsYXJhdGlvbi5xdW90ZXMsIC0tX3RoaXMucXVvdGVEZXB0aCwgZmFsc2UpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNhZmFyaSBkb2Vzbid0IHBhcnNlIHN0cmluZyB0b2tlbnMgY29ycmVjdGx5IGJlY2F1c2Ugb2YgbGFjayBvZiBxdW90ZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFub255bW91c1JlcGxhY2VkRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0b2tlbi52YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGFub255bW91c1JlcGxhY2VkRWxlbWVudC5jbGFzc05hbWUgPSBQU0VVRE9fSElERV9FTEVNRU5UX0NMQVNTX0JFRk9SRSArIFwiIFwiICsgUFNFVURPX0hJREVfRUxFTUVOVF9DTEFTU19BRlRFUjtcclxuICAgICAgICAgICAgdmFyIG5ld0NsYXNzTmFtZSA9IHBzZXVkb0VsdCA9PT0gUHNldWRvRWxlbWVudFR5cGUuQkVGT1JFXHJcbiAgICAgICAgICAgICAgICA/IFwiIFwiICsgUFNFVURPX0hJREVfRUxFTUVOVF9DTEFTU19CRUZPUkVcclxuICAgICAgICAgICAgICAgIDogXCIgXCIgKyBQU0VVRE9fSElERV9FTEVNRU5UX0NMQVNTX0FGVEVSO1xyXG4gICAgICAgICAgICBpZiAoaXNTVkdFbGVtZW50Tm9kZShjbG9uZSkpIHtcclxuICAgICAgICAgICAgICAgIGNsb25lLmNsYXNzTmFtZS5iYXNlVmFsdWUgKz0gbmV3Q2xhc3NOYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY2xvbmUuY2xhc3NOYW1lICs9IG5ld0NsYXNzTmFtZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYW5vbnltb3VzUmVwbGFjZWRFbGVtZW50O1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgRG9jdW1lbnRDbG9uZXIuZGVzdHJveSA9IGZ1bmN0aW9uIChjb250YWluZXIpIHtcclxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIERvY3VtZW50Q2xvbmVyO1xyXG4gICAgfSgpKTtcclxuICAgIHZhciBQc2V1ZG9FbGVtZW50VHlwZTtcclxuICAgIChmdW5jdGlvbiAoUHNldWRvRWxlbWVudFR5cGUpIHtcclxuICAgICAgICBQc2V1ZG9FbGVtZW50VHlwZVtQc2V1ZG9FbGVtZW50VHlwZVtcIkJFRk9SRVwiXSA9IDBdID0gXCJCRUZPUkVcIjtcclxuICAgICAgICBQc2V1ZG9FbGVtZW50VHlwZVtQc2V1ZG9FbGVtZW50VHlwZVtcIkFGVEVSXCJdID0gMV0gPSBcIkFGVEVSXCI7XHJcbiAgICB9KShQc2V1ZG9FbGVtZW50VHlwZSB8fCAoUHNldWRvRWxlbWVudFR5cGUgPSB7fSkpO1xyXG4gICAgdmFyIGNyZWF0ZUlGcmFtZUNvbnRhaW5lciA9IGZ1bmN0aW9uIChvd25lckRvY3VtZW50LCBib3VuZHMpIHtcclxuICAgICAgICB2YXIgY2xvbmVJZnJhbWVDb250YWluZXIgPSBvd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xyXG4gICAgICAgIGNsb25lSWZyYW1lQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdodG1sMmNhbnZhcy1jb250YWluZXInO1xyXG4gICAgICAgIGNsb25lSWZyYW1lQ29udGFpbmVyLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcclxuICAgICAgICBjbG9uZUlmcmFtZUNvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XHJcbiAgICAgICAgY2xvbmVJZnJhbWVDb250YWluZXIuc3R5bGUubGVmdCA9ICctMTAwMDBweCc7XHJcbiAgICAgICAgY2xvbmVJZnJhbWVDb250YWluZXIuc3R5bGUudG9wID0gJzBweCc7XHJcbiAgICAgICAgY2xvbmVJZnJhbWVDb250YWluZXIuc3R5bGUuYm9yZGVyID0gJzAnO1xyXG4gICAgICAgIGNsb25lSWZyYW1lQ29udGFpbmVyLndpZHRoID0gYm91bmRzLndpZHRoLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgY2xvbmVJZnJhbWVDb250YWluZXIuaGVpZ2h0ID0gYm91bmRzLmhlaWdodC50b1N0cmluZygpO1xyXG4gICAgICAgIGNsb25lSWZyYW1lQ29udGFpbmVyLnNjcm9sbGluZyA9ICdubyc7IC8vIGlvcyB3b24ndCBzY3JvbGwgd2l0aG91dCBpdFxyXG4gICAgICAgIGNsb25lSWZyYW1lQ29udGFpbmVyLnNldEF0dHJpYnV0ZShJR05PUkVfQVRUUklCVVRFLCAndHJ1ZScpO1xyXG4gICAgICAgIG93bmVyRG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjbG9uZUlmcmFtZUNvbnRhaW5lcik7XHJcbiAgICAgICAgcmV0dXJuIGNsb25lSWZyYW1lQ29udGFpbmVyO1xyXG4gICAgfTtcclxuICAgIHZhciBpZnJhbWVMb2FkZXIgPSBmdW5jdGlvbiAoaWZyYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgdmFyIGNsb25lV2luZG93ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3c7XHJcbiAgICAgICAgICAgIGlmICghY2xvbmVXaW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoXCJObyB3aW5kb3cgYXNzaWduZWQgZm9yIGlmcmFtZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgZG9jdW1lbnRDbG9uZSA9IGNsb25lV2luZG93LmRvY3VtZW50O1xyXG4gICAgICAgICAgICBjbG9uZVdpbmRvdy5vbmxvYWQgPSBpZnJhbWUub25sb2FkID0gZG9jdW1lbnRDbG9uZS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBjbG9uZVdpbmRvdy5vbmxvYWQgPSBpZnJhbWUub25sb2FkID0gZG9jdW1lbnRDbG9uZS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudENsb25lLmJvZHkuY2hpbGROb2Rlcy5sZW5ndGggPiAwICYmIGRvY3VtZW50Q2xvbmUucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShpZnJhbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIDUwKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICB2YXIgY29weUNTU1N0eWxlcyA9IGZ1bmN0aW9uIChzdHlsZSwgdGFyZ2V0KSB7XHJcbiAgICAgICAgLy8gRWRnZSBkb2VzIG5vdCBwcm92aWRlIHZhbHVlIGZvciBjc3NUZXh0XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0eWxlLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciBwcm9wZXJ0eSA9IHN0eWxlLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIC8vIFNhZmFyaSBzaG93cyBwc2V1ZG9lbGVtZW50cyBpZiBjb250ZW50IGlzIHNldFxyXG4gICAgICAgICAgICBpZiAocHJvcGVydHkgIT09ICdjb250ZW50Jykge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLnNldFByb3BlcnR5KHByb3BlcnR5LCBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgIH07XHJcbiAgICB2YXIgc2VyaWFsaXplRG9jdHlwZSA9IGZ1bmN0aW9uIChkb2N0eXBlKSB7XHJcbiAgICAgICAgdmFyIHN0ciA9ICcnO1xyXG4gICAgICAgIGlmIChkb2N0eXBlKSB7XHJcbiAgICAgICAgICAgIHN0ciArPSAnPCFET0NUWVBFICc7XHJcbiAgICAgICAgICAgIGlmIChkb2N0eXBlLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHN0ciArPSBkb2N0eXBlLm5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRvY3R5cGUuaW50ZXJuYWxTdWJzZXQpIHtcclxuICAgICAgICAgICAgICAgIHN0ciArPSBkb2N0eXBlLmludGVybmFsU3Vic2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkb2N0eXBlLnB1YmxpY0lkKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgKz0gXCJcXFwiXCIgKyBkb2N0eXBlLnB1YmxpY0lkICsgXCJcXFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRvY3R5cGUuc3lzdGVtSWQpIHtcclxuICAgICAgICAgICAgICAgIHN0ciArPSBcIlxcXCJcIiArIGRvY3R5cGUuc3lzdGVtSWQgKyBcIlxcXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdHIgKz0gJz4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfTtcclxuICAgIHZhciByZXN0b3JlT3duZXJTY3JvbGwgPSBmdW5jdGlvbiAob3duZXJEb2N1bWVudCwgeCwgeSkge1xyXG4gICAgICAgIGlmIChvd25lckRvY3VtZW50ICYmXHJcbiAgICAgICAgICAgIG93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcgJiZcclxuICAgICAgICAgICAgKHggIT09IG93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcucGFnZVhPZmZzZXQgfHwgeSAhPT0gb3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldy5wYWdlWU9mZnNldCkpIHtcclxuICAgICAgICAgICAgb3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldy5zY3JvbGxUbyh4LCB5KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdmFyIHJlc3RvcmVOb2RlU2Nyb2xsID0gZnVuY3Rpb24gKF9hKSB7XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBfYVswXSwgeCA9IF9hWzFdLCB5ID0gX2FbMl07XHJcbiAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ID0geDtcclxuICAgICAgICBlbGVtZW50LnNjcm9sbFRvcCA9IHk7XHJcbiAgICB9O1xyXG4gICAgdmFyIFBTRVVET19CRUZPUkUgPSAnOmJlZm9yZSc7XHJcbiAgICB2YXIgUFNFVURPX0FGVEVSID0gJzphZnRlcic7XHJcbiAgICB2YXIgUFNFVURPX0hJREVfRUxFTUVOVF9DTEFTU19CRUZPUkUgPSAnX19faHRtbDJjYW52YXNfX19wc2V1ZG9lbGVtZW50X2JlZm9yZSc7XHJcbiAgICB2YXIgUFNFVURPX0hJREVfRUxFTUVOVF9DTEFTU19BRlRFUiA9ICdfX19odG1sMmNhbnZhc19fX3BzZXVkb2VsZW1lbnRfYWZ0ZXInO1xyXG4gICAgdmFyIFBTRVVET19ISURFX0VMRU1FTlRfU1RZTEUgPSBcIntcXG4gICAgY29udGVudDogXFxcIlxcXCIgIWltcG9ydGFudDtcXG4gICAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xcbn1cIjtcclxuICAgIHZhciBjcmVhdGVQc2V1ZG9IaWRlU3R5bGVzID0gZnVuY3Rpb24gKGJvZHkpIHtcclxuICAgICAgICBjcmVhdGVTdHlsZXMoYm9keSwgXCIuXCIgKyBQU0VVRE9fSElERV9FTEVNRU5UX0NMQVNTX0JFRk9SRSArIFBTRVVET19CRUZPUkUgKyBQU0VVRE9fSElERV9FTEVNRU5UX1NUWUxFICsgXCJcXG4gICAgICAgICAuXCIgKyBQU0VVRE9fSElERV9FTEVNRU5UX0NMQVNTX0FGVEVSICsgUFNFVURPX0FGVEVSICsgUFNFVURPX0hJREVfRUxFTUVOVF9TVFlMRSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGNyZWF0ZVN0eWxlcyA9IGZ1bmN0aW9uIChib2R5LCBzdHlsZXMpIHtcclxuICAgICAgICB2YXIgZG9jdW1lbnQgPSBib2R5Lm93bmVyRG9jdW1lbnQ7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gc3R5bGVzO1xyXG4gICAgICAgICAgICBib2R5LmFwcGVuZENoaWxkKHN0eWxlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIFBhdGhUeXBlO1xyXG4gICAgKGZ1bmN0aW9uIChQYXRoVHlwZSkge1xyXG4gICAgICAgIFBhdGhUeXBlW1BhdGhUeXBlW1wiVkVDVE9SXCJdID0gMF0gPSBcIlZFQ1RPUlwiO1xyXG4gICAgICAgIFBhdGhUeXBlW1BhdGhUeXBlW1wiQkVaSUVSX0NVUlZFXCJdID0gMV0gPSBcIkJFWklFUl9DVVJWRVwiO1xyXG4gICAgfSkoUGF0aFR5cGUgfHwgKFBhdGhUeXBlID0ge30pKTtcclxuICAgIHZhciBlcXVhbFBhdGggPSBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIGlmIChhLmxlbmd0aCA9PT0gYi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuc29tZShmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gdiA9PT0gYltpXTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICB2YXIgdHJhbnNmb3JtUGF0aCA9IGZ1bmN0aW9uIChwYXRoLCBkZWx0YVgsIGRlbHRhWSwgZGVsdGFXLCBkZWx0YUgpIHtcclxuICAgICAgICByZXR1cm4gcGF0aC5tYXAoZnVuY3Rpb24gKHBvaW50LCBpbmRleCkge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvaW50LmFkZChkZWx0YVgsIGRlbHRhWSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvaW50LmFkZChkZWx0YVggKyBkZWx0YVcsIGRlbHRhWSk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvaW50LmFkZChkZWx0YVggKyBkZWx0YVcsIGRlbHRhWSArIGRlbHRhSCk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvaW50LmFkZChkZWx0YVgsIGRlbHRhWSArIGRlbHRhSCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBvaW50O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcblxuICAgIHZhciBWZWN0b3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gVmVjdG9yKHgsIHkpIHtcclxuICAgICAgICAgICAgdGhpcy50eXBlID0gUGF0aFR5cGUuVkVDVE9SO1xyXG4gICAgICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBWZWN0b3IucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChkZWx0YVgsIGRlbHRhWSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKyBkZWx0YVgsIHRoaXMueSArIGRlbHRhWSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gVmVjdG9yO1xyXG4gICAgfSgpKTtcblxuICAgIHZhciBsZXJwID0gZnVuY3Rpb24gKGEsIGIsIHQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcihhLnggKyAoYi54IC0gYS54KSAqIHQsIGEueSArIChiLnkgLSBhLnkpICogdCk7XHJcbiAgICB9O1xyXG4gICAgdmFyIEJlemllckN1cnZlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIEJlemllckN1cnZlKHN0YXJ0LCBzdGFydENvbnRyb2wsIGVuZENvbnRyb2wsIGVuZCkge1xyXG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBQYXRoVHlwZS5CRVpJRVJfQ1VSVkU7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcclxuICAgICAgICAgICAgdGhpcy5zdGFydENvbnRyb2wgPSBzdGFydENvbnRyb2w7XHJcbiAgICAgICAgICAgIHRoaXMuZW5kQ29udHJvbCA9IGVuZENvbnRyb2w7XHJcbiAgICAgICAgICAgIHRoaXMuZW5kID0gZW5kO1xyXG4gICAgICAgIH1cclxuICAgICAgICBCZXppZXJDdXJ2ZS5wcm90b3R5cGUuc3ViZGl2aWRlID0gZnVuY3Rpb24gKHQsIGZpcnN0SGFsZikge1xyXG4gICAgICAgICAgICB2YXIgYWIgPSBsZXJwKHRoaXMuc3RhcnQsIHRoaXMuc3RhcnRDb250cm9sLCB0KTtcclxuICAgICAgICAgICAgdmFyIGJjID0gbGVycCh0aGlzLnN0YXJ0Q29udHJvbCwgdGhpcy5lbmRDb250cm9sLCB0KTtcclxuICAgICAgICAgICAgdmFyIGNkID0gbGVycCh0aGlzLmVuZENvbnRyb2wsIHRoaXMuZW5kLCB0KTtcclxuICAgICAgICAgICAgdmFyIGFiYmMgPSBsZXJwKGFiLCBiYywgdCk7XHJcbiAgICAgICAgICAgIHZhciBiY2NkID0gbGVycChiYywgY2QsIHQpO1xyXG4gICAgICAgICAgICB2YXIgZGVzdCA9IGxlcnAoYWJiYywgYmNjZCwgdCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmaXJzdEhhbGYgPyBuZXcgQmV6aWVyQ3VydmUodGhpcy5zdGFydCwgYWIsIGFiYmMsIGRlc3QpIDogbmV3IEJlemllckN1cnZlKGRlc3QsIGJjY2QsIGNkLCB0aGlzLmVuZCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBCZXppZXJDdXJ2ZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGRlbHRhWCwgZGVsdGFZKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmV6aWVyQ3VydmUodGhpcy5zdGFydC5hZGQoZGVsdGFYLCBkZWx0YVkpLCB0aGlzLnN0YXJ0Q29udHJvbC5hZGQoZGVsdGFYLCBkZWx0YVkpLCB0aGlzLmVuZENvbnRyb2wuYWRkKGRlbHRhWCwgZGVsdGFZKSwgdGhpcy5lbmQuYWRkKGRlbHRhWCwgZGVsdGFZKSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBCZXppZXJDdXJ2ZS5wcm90b3R5cGUucmV2ZXJzZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCZXppZXJDdXJ2ZSh0aGlzLmVuZCwgdGhpcy5lbmRDb250cm9sLCB0aGlzLnN0YXJ0Q29udHJvbCwgdGhpcy5zdGFydCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gQmV6aWVyQ3VydmU7XHJcbiAgICB9KCkpO1xyXG4gICAgdmFyIGlzQmV6aWVyQ3VydmUgPSBmdW5jdGlvbiAocGF0aCkgeyByZXR1cm4gcGF0aC50eXBlID09PSBQYXRoVHlwZS5CRVpJRVJfQ1VSVkU7IH07XG5cbiAgICB2YXIgQm91bmRDdXJ2ZXMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gQm91bmRDdXJ2ZXMoZWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgc3R5bGVzID0gZWxlbWVudC5zdHlsZXM7XHJcbiAgICAgICAgICAgIHZhciBib3VuZHMgPSBlbGVtZW50LmJvdW5kcztcclxuICAgICAgICAgICAgdmFyIF9hID0gZ2V0QWJzb2x1dGVWYWx1ZUZvclR1cGxlKHN0eWxlcy5ib3JkZXJUb3BMZWZ0UmFkaXVzLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQpLCB0bGggPSBfYVswXSwgdGx2ID0gX2FbMV07XHJcbiAgICAgICAgICAgIHZhciBfYiA9IGdldEFic29sdXRlVmFsdWVGb3JUdXBsZShzdHlsZXMuYm9yZGVyVG9wUmlnaHRSYWRpdXMsIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCksIHRyaCA9IF9iWzBdLCB0cnYgPSBfYlsxXTtcclxuICAgICAgICAgICAgdmFyIF9jID0gZ2V0QWJzb2x1dGVWYWx1ZUZvclR1cGxlKHN0eWxlcy5ib3JkZXJCb3R0b21SaWdodFJhZGl1cywgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0KSwgYnJoID0gX2NbMF0sIGJydiA9IF9jWzFdO1xyXG4gICAgICAgICAgICB2YXIgX2QgPSBnZXRBYnNvbHV0ZVZhbHVlRm9yVHVwbGUoc3R5bGVzLmJvcmRlckJvdHRvbUxlZnRSYWRpdXMsIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCksIGJsaCA9IF9kWzBdLCBibHYgPSBfZFsxXTtcclxuICAgICAgICAgICAgdmFyIGZhY3RvcnMgPSBbXTtcclxuICAgICAgICAgICAgZmFjdG9ycy5wdXNoKCh0bGggKyB0cmgpIC8gYm91bmRzLndpZHRoKTtcclxuICAgICAgICAgICAgZmFjdG9ycy5wdXNoKChibGggKyBicmgpIC8gYm91bmRzLndpZHRoKTtcclxuICAgICAgICAgICAgZmFjdG9ycy5wdXNoKCh0bHYgKyBibHYpIC8gYm91bmRzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIGZhY3RvcnMucHVzaCgodHJ2ICsgYnJ2KSAvIGJvdW5kcy5oZWlnaHQpO1xyXG4gICAgICAgICAgICB2YXIgbWF4RmFjdG9yID0gTWF0aC5tYXguYXBwbHkoTWF0aCwgZmFjdG9ycyk7XHJcbiAgICAgICAgICAgIGlmIChtYXhGYWN0b3IgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICB0bGggLz0gbWF4RmFjdG9yO1xyXG4gICAgICAgICAgICAgICAgdGx2IC89IG1heEZhY3RvcjtcclxuICAgICAgICAgICAgICAgIHRyaCAvPSBtYXhGYWN0b3I7XHJcbiAgICAgICAgICAgICAgICB0cnYgLz0gbWF4RmFjdG9yO1xyXG4gICAgICAgICAgICAgICAgYnJoIC89IG1heEZhY3RvcjtcclxuICAgICAgICAgICAgICAgIGJydiAvPSBtYXhGYWN0b3I7XHJcbiAgICAgICAgICAgICAgICBibGggLz0gbWF4RmFjdG9yO1xyXG4gICAgICAgICAgICAgICAgYmx2IC89IG1heEZhY3RvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdG9wV2lkdGggPSBib3VuZHMud2lkdGggLSB0cmg7XHJcbiAgICAgICAgICAgIHZhciByaWdodEhlaWdodCA9IGJvdW5kcy5oZWlnaHQgLSBicnY7XHJcbiAgICAgICAgICAgIHZhciBib3R0b21XaWR0aCA9IGJvdW5kcy53aWR0aCAtIGJyaDtcclxuICAgICAgICAgICAgdmFyIGxlZnRIZWlnaHQgPSBib3VuZHMuaGVpZ2h0IC0gYmx2O1xyXG4gICAgICAgICAgICB2YXIgYm9yZGVyVG9wV2lkdGggPSBzdHlsZXMuYm9yZGVyVG9wV2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBib3JkZXJSaWdodFdpZHRoID0gc3R5bGVzLmJvcmRlclJpZ2h0V2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBib3JkZXJCb3R0b21XaWR0aCA9IHN0eWxlcy5ib3JkZXJCb3R0b21XaWR0aDtcclxuICAgICAgICAgICAgdmFyIGJvcmRlckxlZnRXaWR0aCA9IHN0eWxlcy5ib3JkZXJMZWZ0V2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wID0gZ2V0QWJzb2x1dGVWYWx1ZShzdHlsZXMucGFkZGluZ1RvcCwgZWxlbWVudC5ib3VuZHMud2lkdGgpO1xyXG4gICAgICAgICAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gZ2V0QWJzb2x1dGVWYWx1ZShzdHlsZXMucGFkZGluZ1JpZ2h0LCBlbGVtZW50LmJvdW5kcy53aWR0aCk7XHJcbiAgICAgICAgICAgIHZhciBwYWRkaW5nQm90dG9tID0gZ2V0QWJzb2x1dGVWYWx1ZShzdHlsZXMucGFkZGluZ0JvdHRvbSwgZWxlbWVudC5ib3VuZHMud2lkdGgpO1xyXG4gICAgICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSBnZXRBYnNvbHV0ZVZhbHVlKHN0eWxlcy5wYWRkaW5nTGVmdCwgZWxlbWVudC5ib3VuZHMud2lkdGgpO1xyXG4gICAgICAgICAgICB0aGlzLnRvcExlZnRCb3JkZXJCb3ggPVxyXG4gICAgICAgICAgICAgICAgdGxoID4gMCB8fCB0bHYgPiAwXHJcbiAgICAgICAgICAgICAgICAgICAgPyBnZXRDdXJ2ZVBvaW50cyhib3VuZHMubGVmdCwgYm91bmRzLnRvcCwgdGxoLCB0bHYsIENPUk5FUi5UT1BfTEVGVClcclxuICAgICAgICAgICAgICAgICAgICA6IG5ldyBWZWN0b3IoYm91bmRzLmxlZnQsIGJvdW5kcy50b3ApO1xyXG4gICAgICAgICAgICB0aGlzLnRvcFJpZ2h0Qm9yZGVyQm94ID1cclxuICAgICAgICAgICAgICAgIHRyaCA+IDAgfHwgdHJ2ID4gMFxyXG4gICAgICAgICAgICAgICAgICAgID8gZ2V0Q3VydmVQb2ludHMoYm91bmRzLmxlZnQgKyB0b3BXaWR0aCwgYm91bmRzLnRvcCwgdHJoLCB0cnYsIENPUk5FUi5UT1BfUklHSFQpXHJcbiAgICAgICAgICAgICAgICAgICAgOiBuZXcgVmVjdG9yKGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoLCBib3VuZHMudG9wKTtcclxuICAgICAgICAgICAgdGhpcy5ib3R0b21SaWdodEJvcmRlckJveCA9XHJcbiAgICAgICAgICAgICAgICBicmggPiAwIHx8IGJydiA+IDBcclxuICAgICAgICAgICAgICAgICAgICA/IGdldEN1cnZlUG9pbnRzKGJvdW5kcy5sZWZ0ICsgYm90dG9tV2lkdGgsIGJvdW5kcy50b3AgKyByaWdodEhlaWdodCwgYnJoLCBicnYsIENPUk5FUi5CT1RUT01fUklHSFQpXHJcbiAgICAgICAgICAgICAgICAgICAgOiBuZXcgVmVjdG9yKGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoLCBib3VuZHMudG9wICsgYm91bmRzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tTGVmdEJvcmRlckJveCA9XHJcbiAgICAgICAgICAgICAgICBibGggPiAwIHx8IGJsdiA+IDBcclxuICAgICAgICAgICAgICAgICAgICA/IGdldEN1cnZlUG9pbnRzKGJvdW5kcy5sZWZ0LCBib3VuZHMudG9wICsgbGVmdEhlaWdodCwgYmxoLCBibHYsIENPUk5FUi5CT1RUT01fTEVGVClcclxuICAgICAgICAgICAgICAgICAgICA6IG5ldyBWZWN0b3IoYm91bmRzLmxlZnQsIGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy50b3BMZWZ0UGFkZGluZ0JveCA9XHJcbiAgICAgICAgICAgICAgICB0bGggPiAwIHx8IHRsdiA+IDBcclxuICAgICAgICAgICAgICAgICAgICA/IGdldEN1cnZlUG9pbnRzKGJvdW5kcy5sZWZ0ICsgYm9yZGVyTGVmdFdpZHRoLCBib3VuZHMudG9wICsgYm9yZGVyVG9wV2lkdGgsIE1hdGgubWF4KDAsIHRsaCAtIGJvcmRlckxlZnRXaWR0aCksIE1hdGgubWF4KDAsIHRsdiAtIGJvcmRlclRvcFdpZHRoKSwgQ09STkVSLlRPUF9MRUZUKVxyXG4gICAgICAgICAgICAgICAgICAgIDogbmV3IFZlY3Rvcihib3VuZHMubGVmdCArIGJvcmRlckxlZnRXaWR0aCwgYm91bmRzLnRvcCArIGJvcmRlclRvcFdpZHRoKTtcclxuICAgICAgICAgICAgdGhpcy50b3BSaWdodFBhZGRpbmdCb3ggPVxyXG4gICAgICAgICAgICAgICAgdHJoID4gMCB8fCB0cnYgPiAwXHJcbiAgICAgICAgICAgICAgICAgICAgPyBnZXRDdXJ2ZVBvaW50cyhib3VuZHMubGVmdCArIE1hdGgubWluKHRvcFdpZHRoLCBib3VuZHMud2lkdGggKyBib3JkZXJMZWZ0V2lkdGgpLCBib3VuZHMudG9wICsgYm9yZGVyVG9wV2lkdGgsIHRvcFdpZHRoID4gYm91bmRzLndpZHRoICsgYm9yZGVyTGVmdFdpZHRoID8gMCA6IHRyaCAtIGJvcmRlckxlZnRXaWR0aCwgdHJ2IC0gYm9yZGVyVG9wV2lkdGgsIENPUk5FUi5UT1BfUklHSFQpXHJcbiAgICAgICAgICAgICAgICAgICAgOiBuZXcgVmVjdG9yKGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoIC0gYm9yZGVyUmlnaHRXaWR0aCwgYm91bmRzLnRvcCArIGJvcmRlclRvcFdpZHRoKTtcclxuICAgICAgICAgICAgdGhpcy5ib3R0b21SaWdodFBhZGRpbmdCb3ggPVxyXG4gICAgICAgICAgICAgICAgYnJoID4gMCB8fCBicnYgPiAwXHJcbiAgICAgICAgICAgICAgICAgICAgPyBnZXRDdXJ2ZVBvaW50cyhib3VuZHMubGVmdCArIE1hdGgubWluKGJvdHRvbVdpZHRoLCBib3VuZHMud2lkdGggLSBib3JkZXJMZWZ0V2lkdGgpLCBib3VuZHMudG9wICsgTWF0aC5taW4ocmlnaHRIZWlnaHQsIGJvdW5kcy5oZWlnaHQgKyBib3JkZXJUb3BXaWR0aCksIE1hdGgubWF4KDAsIGJyaCAtIGJvcmRlclJpZ2h0V2lkdGgpLCBicnYgLSBib3JkZXJCb3R0b21XaWR0aCwgQ09STkVSLkJPVFRPTV9SSUdIVClcclxuICAgICAgICAgICAgICAgICAgICA6IG5ldyBWZWN0b3IoYm91bmRzLmxlZnQgKyBib3VuZHMud2lkdGggLSBib3JkZXJSaWdodFdpZHRoLCBib3VuZHMudG9wICsgYm91bmRzLmhlaWdodCAtIGJvcmRlckJvdHRvbVdpZHRoKTtcclxuICAgICAgICAgICAgdGhpcy5ib3R0b21MZWZ0UGFkZGluZ0JveCA9XHJcbiAgICAgICAgICAgICAgICBibGggPiAwIHx8IGJsdiA+IDBcclxuICAgICAgICAgICAgICAgICAgICA/IGdldEN1cnZlUG9pbnRzKGJvdW5kcy5sZWZ0ICsgYm9yZGVyTGVmdFdpZHRoLCBib3VuZHMudG9wICsgbGVmdEhlaWdodCwgTWF0aC5tYXgoMCwgYmxoIC0gYm9yZGVyTGVmdFdpZHRoKSwgYmx2IC0gYm9yZGVyQm90dG9tV2lkdGgsIENPUk5FUi5CT1RUT01fTEVGVClcclxuICAgICAgICAgICAgICAgICAgICA6IG5ldyBWZWN0b3IoYm91bmRzLmxlZnQgKyBib3JkZXJMZWZ0V2lkdGgsIGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0IC0gYm9yZGVyQm90dG9tV2lkdGgpO1xyXG4gICAgICAgICAgICB0aGlzLnRvcExlZnRDb250ZW50Qm94ID1cclxuICAgICAgICAgICAgICAgIHRsaCA+IDAgfHwgdGx2ID4gMFxyXG4gICAgICAgICAgICAgICAgICAgID8gZ2V0Q3VydmVQb2ludHMoYm91bmRzLmxlZnQgKyBib3JkZXJMZWZ0V2lkdGggKyBwYWRkaW5nTGVmdCwgYm91bmRzLnRvcCArIGJvcmRlclRvcFdpZHRoICsgcGFkZGluZ1RvcCwgTWF0aC5tYXgoMCwgdGxoIC0gKGJvcmRlckxlZnRXaWR0aCArIHBhZGRpbmdMZWZ0KSksIE1hdGgubWF4KDAsIHRsdiAtIChib3JkZXJUb3BXaWR0aCArIHBhZGRpbmdUb3ApKSwgQ09STkVSLlRPUF9MRUZUKVxyXG4gICAgICAgICAgICAgICAgICAgIDogbmV3IFZlY3Rvcihib3VuZHMubGVmdCArIGJvcmRlckxlZnRXaWR0aCArIHBhZGRpbmdMZWZ0LCBib3VuZHMudG9wICsgYm9yZGVyVG9wV2lkdGggKyBwYWRkaW5nVG9wKTtcclxuICAgICAgICAgICAgdGhpcy50b3BSaWdodENvbnRlbnRCb3ggPVxyXG4gICAgICAgICAgICAgICAgdHJoID4gMCB8fCB0cnYgPiAwXHJcbiAgICAgICAgICAgICAgICAgICAgPyBnZXRDdXJ2ZVBvaW50cyhib3VuZHMubGVmdCArIE1hdGgubWluKHRvcFdpZHRoLCBib3VuZHMud2lkdGggKyBib3JkZXJMZWZ0V2lkdGggKyBwYWRkaW5nTGVmdCksIGJvdW5kcy50b3AgKyBib3JkZXJUb3BXaWR0aCArIHBhZGRpbmdUb3AsIHRvcFdpZHRoID4gYm91bmRzLndpZHRoICsgYm9yZGVyTGVmdFdpZHRoICsgcGFkZGluZ0xlZnQgPyAwIDogdHJoIC0gYm9yZGVyTGVmdFdpZHRoICsgcGFkZGluZ0xlZnQsIHRydiAtIChib3JkZXJUb3BXaWR0aCArIHBhZGRpbmdUb3ApLCBDT1JORVIuVE9QX1JJR0hUKVxyXG4gICAgICAgICAgICAgICAgICAgIDogbmV3IFZlY3Rvcihib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCAtIChib3JkZXJSaWdodFdpZHRoICsgcGFkZGluZ1JpZ2h0KSwgYm91bmRzLnRvcCArIGJvcmRlclRvcFdpZHRoICsgcGFkZGluZ1RvcCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tUmlnaHRDb250ZW50Qm94ID1cclxuICAgICAgICAgICAgICAgIGJyaCA+IDAgfHwgYnJ2ID4gMFxyXG4gICAgICAgICAgICAgICAgICAgID8gZ2V0Q3VydmVQb2ludHMoYm91bmRzLmxlZnQgKyBNYXRoLm1pbihib3R0b21XaWR0aCwgYm91bmRzLndpZHRoIC0gKGJvcmRlckxlZnRXaWR0aCArIHBhZGRpbmdMZWZ0KSksIGJvdW5kcy50b3AgKyBNYXRoLm1pbihyaWdodEhlaWdodCwgYm91bmRzLmhlaWdodCArIGJvcmRlclRvcFdpZHRoICsgcGFkZGluZ1RvcCksIE1hdGgubWF4KDAsIGJyaCAtIChib3JkZXJSaWdodFdpZHRoICsgcGFkZGluZ1JpZ2h0KSksIGJydiAtIChib3JkZXJCb3R0b21XaWR0aCArIHBhZGRpbmdCb3R0b20pLCBDT1JORVIuQk9UVE9NX1JJR0hUKVxyXG4gICAgICAgICAgICAgICAgICAgIDogbmV3IFZlY3Rvcihib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCAtIChib3JkZXJSaWdodFdpZHRoICsgcGFkZGluZ1JpZ2h0KSwgYm91bmRzLnRvcCArIGJvdW5kcy5oZWlnaHQgLSAoYm9yZGVyQm90dG9tV2lkdGggKyBwYWRkaW5nQm90dG9tKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tTGVmdENvbnRlbnRCb3ggPVxyXG4gICAgICAgICAgICAgICAgYmxoID4gMCB8fCBibHYgPiAwXHJcbiAgICAgICAgICAgICAgICAgICAgPyBnZXRDdXJ2ZVBvaW50cyhib3VuZHMubGVmdCArIGJvcmRlckxlZnRXaWR0aCArIHBhZGRpbmdMZWZ0LCBib3VuZHMudG9wICsgbGVmdEhlaWdodCwgTWF0aC5tYXgoMCwgYmxoIC0gKGJvcmRlckxlZnRXaWR0aCArIHBhZGRpbmdMZWZ0KSksIGJsdiAtIChib3JkZXJCb3R0b21XaWR0aCArIHBhZGRpbmdCb3R0b20pLCBDT1JORVIuQk9UVE9NX0xFRlQpXHJcbiAgICAgICAgICAgICAgICAgICAgOiBuZXcgVmVjdG9yKGJvdW5kcy5sZWZ0ICsgYm9yZGVyTGVmdFdpZHRoICsgcGFkZGluZ0xlZnQsIGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0IC0gKGJvcmRlckJvdHRvbVdpZHRoICsgcGFkZGluZ0JvdHRvbSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gQm91bmRDdXJ2ZXM7XHJcbiAgICB9KCkpO1xyXG4gICAgdmFyIENPUk5FUjtcclxuICAgIChmdW5jdGlvbiAoQ09STkVSKSB7XHJcbiAgICAgICAgQ09STkVSW0NPUk5FUltcIlRPUF9MRUZUXCJdID0gMF0gPSBcIlRPUF9MRUZUXCI7XHJcbiAgICAgICAgQ09STkVSW0NPUk5FUltcIlRPUF9SSUdIVFwiXSA9IDFdID0gXCJUT1BfUklHSFRcIjtcclxuICAgICAgICBDT1JORVJbQ09STkVSW1wiQk9UVE9NX1JJR0hUXCJdID0gMl0gPSBcIkJPVFRPTV9SSUdIVFwiO1xyXG4gICAgICAgIENPUk5FUltDT1JORVJbXCJCT1RUT01fTEVGVFwiXSA9IDNdID0gXCJCT1RUT01fTEVGVFwiO1xyXG4gICAgfSkoQ09STkVSIHx8IChDT1JORVIgPSB7fSkpO1xyXG4gICAgdmFyIGdldEN1cnZlUG9pbnRzID0gZnVuY3Rpb24gKHgsIHksIHIxLCByMiwgcG9zaXRpb24pIHtcclxuICAgICAgICB2YXIga2FwcGEgPSA0ICogKChNYXRoLnNxcnQoMikgLSAxKSAvIDMpO1xyXG4gICAgICAgIHZhciBveCA9IHIxICoga2FwcGE7IC8vIGNvbnRyb2wgcG9pbnQgb2Zmc2V0IGhvcml6b250YWxcclxuICAgICAgICB2YXIgb3kgPSByMiAqIGthcHBhOyAvLyBjb250cm9sIHBvaW50IG9mZnNldCB2ZXJ0aWNhbFxyXG4gICAgICAgIHZhciB4bSA9IHggKyByMTsgLy8geC1taWRkbGVcclxuICAgICAgICB2YXIgeW0gPSB5ICsgcjI7IC8vIHktbWlkZGxlXHJcbiAgICAgICAgc3dpdGNoIChwb3NpdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIENPUk5FUi5UT1BfTEVGVDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQmV6aWVyQ3VydmUobmV3IFZlY3Rvcih4LCB5bSksIG5ldyBWZWN0b3IoeCwgeW0gLSBveSksIG5ldyBWZWN0b3IoeG0gLSBveCwgeSksIG5ldyBWZWN0b3IoeG0sIHkpKTtcclxuICAgICAgICAgICAgY2FzZSBDT1JORVIuVE9QX1JJR0hUOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCZXppZXJDdXJ2ZShuZXcgVmVjdG9yKHgsIHkpLCBuZXcgVmVjdG9yKHggKyBveCwgeSksIG5ldyBWZWN0b3IoeG0sIHltIC0gb3kpLCBuZXcgVmVjdG9yKHhtLCB5bSkpO1xyXG4gICAgICAgICAgICBjYXNlIENPUk5FUi5CT1RUT01fUklHSFQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJlemllckN1cnZlKG5ldyBWZWN0b3IoeG0sIHkpLCBuZXcgVmVjdG9yKHhtLCB5ICsgb3kpLCBuZXcgVmVjdG9yKHggKyBveCwgeW0pLCBuZXcgVmVjdG9yKHgsIHltKSk7XHJcbiAgICAgICAgICAgIGNhc2UgQ09STkVSLkJPVFRPTV9MRUZUOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCZXppZXJDdXJ2ZShuZXcgVmVjdG9yKHhtLCB5bSksIG5ldyBWZWN0b3IoeG0gLSBveCwgeW0pLCBuZXcgVmVjdG9yKHgsIHkgKyBveSksIG5ldyBWZWN0b3IoeCwgeSkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB2YXIgY2FsY3VsYXRlQm9yZGVyQm94UGF0aCA9IGZ1bmN0aW9uIChjdXJ2ZXMpIHtcclxuICAgICAgICByZXR1cm4gW2N1cnZlcy50b3BMZWZ0Qm9yZGVyQm94LCBjdXJ2ZXMudG9wUmlnaHRCb3JkZXJCb3gsIGN1cnZlcy5ib3R0b21SaWdodEJvcmRlckJveCwgY3VydmVzLmJvdHRvbUxlZnRCb3JkZXJCb3hdO1xyXG4gICAgfTtcclxuICAgIHZhciBjYWxjdWxhdGVDb250ZW50Qm94UGF0aCA9IGZ1bmN0aW9uIChjdXJ2ZXMpIHtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBjdXJ2ZXMudG9wTGVmdENvbnRlbnRCb3gsXHJcbiAgICAgICAgICAgIGN1cnZlcy50b3BSaWdodENvbnRlbnRCb3gsXHJcbiAgICAgICAgICAgIGN1cnZlcy5ib3R0b21SaWdodENvbnRlbnRCb3gsXHJcbiAgICAgICAgICAgIGN1cnZlcy5ib3R0b21MZWZ0Q29udGVudEJveFxyXG4gICAgICAgIF07XHJcbiAgICB9O1xyXG4gICAgdmFyIGNhbGN1bGF0ZVBhZGRpbmdCb3hQYXRoID0gZnVuY3Rpb24gKGN1cnZlcykge1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIGN1cnZlcy50b3BMZWZ0UGFkZGluZ0JveCxcclxuICAgICAgICAgICAgY3VydmVzLnRvcFJpZ2h0UGFkZGluZ0JveCxcclxuICAgICAgICAgICAgY3VydmVzLmJvdHRvbVJpZ2h0UGFkZGluZ0JveCxcclxuICAgICAgICAgICAgY3VydmVzLmJvdHRvbUxlZnRQYWRkaW5nQm94XHJcbiAgICAgICAgXTtcclxuICAgIH07XG5cbiAgICB2YXIgVHJhbnNmb3JtRWZmZWN0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIFRyYW5zZm9ybUVmZmVjdChvZmZzZXRYLCBvZmZzZXRZLCBtYXRyaXgpIHtcclxuICAgICAgICAgICAgdGhpcy50eXBlID0gMCAvKiBUUkFOU0ZPUk0gKi87XHJcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0WCA9IG9mZnNldFg7XHJcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0WSA9IG9mZnNldFk7XHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4ID0gbWF0cml4O1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldCA9IDIgLyogQkFDS0dST1VORF9CT1JERVJTICovIHwgNCAvKiBDT05URU5UICovO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gVHJhbnNmb3JtRWZmZWN0O1xyXG4gICAgfSgpKTtcclxuICAgIHZhciBDbGlwRWZmZWN0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIENsaXBFZmZlY3QocGF0aCwgdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IDEgLyogQ0xJUCAqLztcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcbiAgICAgICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBDbGlwRWZmZWN0O1xyXG4gICAgfSgpKTtcclxuICAgIHZhciBpc1RyYW5zZm9ybUVmZmVjdCA9IGZ1bmN0aW9uIChlZmZlY3QpIHtcclxuICAgICAgICByZXR1cm4gZWZmZWN0LnR5cGUgPT09IDAgLyogVFJBTlNGT1JNICovO1xyXG4gICAgfTtcclxuICAgIHZhciBpc0NsaXBFZmZlY3QgPSBmdW5jdGlvbiAoZWZmZWN0KSB7IHJldHVybiBlZmZlY3QudHlwZSA9PT0gMSAvKiBDTElQICovOyB9O1xuXG4gICAgdmFyIFN0YWNraW5nQ29udGV4dCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBTdGFja2luZ0NvbnRleHQoY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGNvbnRhaW5lcjtcclxuICAgICAgICAgICAgdGhpcy5pbmxpbmVMZXZlbCA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLm5vbklubGluZUxldmVsID0gW107XHJcbiAgICAgICAgICAgIHRoaXMubmVnYXRpdmVaSW5kZXggPSBbXTtcclxuICAgICAgICAgICAgdGhpcy56ZXJvT3JBdXRvWkluZGV4T3JUcmFuc2Zvcm1lZE9yT3BhY2l0eSA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aXZlWkluZGV4ID0gW107XHJcbiAgICAgICAgICAgIHRoaXMubm9uUG9zaXRpb25lZEZsb2F0cyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLm5vblBvc2l0aW9uZWRJbmxpbmVMZXZlbCA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gU3RhY2tpbmdDb250ZXh0O1xyXG4gICAgfSgpKTtcclxuICAgIHZhciBFbGVtZW50UGFpbnQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gRWxlbWVudFBhaW50KGVsZW1lbnQsIHBhcmVudFN0YWNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gZWxlbWVudDtcclxuICAgICAgICAgICAgdGhpcy5lZmZlY3RzID0gcGFyZW50U3RhY2suc2xpY2UoMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VydmVzID0gbmV3IEJvdW5kQ3VydmVzKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5zdHlsZXMudHJhbnNmb3JtICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IGVsZW1lbnQuYm91bmRzLmxlZnQgKyBlbGVtZW50LnN0eWxlcy50cmFuc2Zvcm1PcmlnaW5bMF0ubnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBlbGVtZW50LmJvdW5kcy50b3AgKyBlbGVtZW50LnN0eWxlcy50cmFuc2Zvcm1PcmlnaW5bMV0ubnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hdHJpeCA9IGVsZW1lbnQuc3R5bGVzLnRyYW5zZm9ybTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWZmZWN0cy5wdXNoKG5ldyBUcmFuc2Zvcm1FZmZlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgbWF0cml4KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuc3R5bGVzLm92ZXJmbG93WCAhPT0gT1ZFUkZMT1cuVklTSUJMRSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJvcmRlckJveCA9IGNhbGN1bGF0ZUJvcmRlckJveFBhdGgodGhpcy5jdXJ2ZXMpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhZGRpbmdCb3ggPSBjYWxjdWxhdGVQYWRkaW5nQm94UGF0aCh0aGlzLmN1cnZlcyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXF1YWxQYXRoKGJvcmRlckJveCwgcGFkZGluZ0JveCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVmZmVjdHMucHVzaChuZXcgQ2xpcEVmZmVjdChib3JkZXJCb3gsIDIgLyogQkFDS0dST1VORF9CT1JERVJTICovIHwgNCAvKiBDT05URU5UICovKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVmZmVjdHMucHVzaChuZXcgQ2xpcEVmZmVjdChib3JkZXJCb3gsIDIgLyogQkFDS0dST1VORF9CT1JERVJTICovKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZmZlY3RzLnB1c2gobmV3IENsaXBFZmZlY3QocGFkZGluZ0JveCwgNCAvKiBDT05URU5UICovKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgRWxlbWVudFBhaW50LnByb3RvdHlwZS5nZXRQYXJlbnRFZmZlY3RzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgZWZmZWN0cyA9IHRoaXMuZWZmZWN0cy5zbGljZSgwKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29udGFpbmVyLnN0eWxlcy5vdmVyZmxvd1ggIT09IE9WRVJGTE9XLlZJU0lCTEUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBib3JkZXJCb3ggPSBjYWxjdWxhdGVCb3JkZXJCb3hQYXRoKHRoaXMuY3VydmVzKTtcclxuICAgICAgICAgICAgICAgIHZhciBwYWRkaW5nQm94ID0gY2FsY3VsYXRlUGFkZGluZ0JveFBhdGgodGhpcy5jdXJ2ZXMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFlcXVhbFBhdGgoYm9yZGVyQm94LCBwYWRkaW5nQm94KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVmZmVjdHMucHVzaChuZXcgQ2xpcEVmZmVjdChwYWRkaW5nQm94LCAyIC8qIEJBQ0tHUk9VTkRfQk9SREVSUyAqLyB8IDQgLyogQ09OVEVOVCAqLykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBlZmZlY3RzO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIEVsZW1lbnRQYWludDtcclxuICAgIH0oKSk7XHJcbiAgICB2YXIgcGFyc2VTdGFja1RyZWUgPSBmdW5jdGlvbiAocGFyZW50LCBzdGFja2luZ0NvbnRleHQsIHJlYWxTdGFja2luZ0NvbnRleHQsIGxpc3RJdGVtcykge1xyXG4gICAgICAgIHBhcmVudC5jb250YWluZXIuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcclxuICAgICAgICAgICAgdmFyIHRyZWF0QXNSZWFsU3RhY2tpbmdDb250ZXh0ID0gY29udGFpbnMoY2hpbGQuZmxhZ3MsIDQgLyogQ1JFQVRFU19SRUFMX1NUQUNLSU5HX0NPTlRFWFQgKi8pO1xyXG4gICAgICAgICAgICB2YXIgY3JlYXRlc1N0YWNraW5nQ29udGV4dCA9IGNvbnRhaW5zKGNoaWxkLmZsYWdzLCAyIC8qIENSRUFURVNfU1RBQ0tJTkdfQ09OVEVYVCAqLyk7XHJcbiAgICAgICAgICAgIHZhciBwYWludENvbnRhaW5lciA9IG5ldyBFbGVtZW50UGFpbnQoY2hpbGQsIHBhcmVudC5nZXRQYXJlbnRFZmZlY3RzKCkpO1xyXG4gICAgICAgICAgICBpZiAoY29udGFpbnMoY2hpbGQuc3R5bGVzLmRpc3BsYXksIDIwNDggLyogTElTVF9JVEVNICovKSkge1xyXG4gICAgICAgICAgICAgICAgbGlzdEl0ZW1zLnB1c2gocGFpbnRDb250YWluZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBsaXN0T3duZXJJdGVtcyA9IGNvbnRhaW5zKGNoaWxkLmZsYWdzLCA4IC8qIElTX0xJU1RfT1dORVIgKi8pID8gW10gOiBsaXN0SXRlbXM7XHJcbiAgICAgICAgICAgIGlmICh0cmVhdEFzUmVhbFN0YWNraW5nQ29udGV4dCB8fCBjcmVhdGVzU3RhY2tpbmdDb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50U3RhY2sgPSB0cmVhdEFzUmVhbFN0YWNraW5nQ29udGV4dCB8fCBjaGlsZC5zdHlsZXMuaXNQb3NpdGlvbmVkKCkgPyByZWFsU3RhY2tpbmdDb250ZXh0IDogc3RhY2tpbmdDb250ZXh0O1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YWNrID0gbmV3IFN0YWNraW5nQ29udGV4dChwYWludENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuc3R5bGVzLmlzUG9zaXRpb25lZCgpIHx8IGNoaWxkLnN0eWxlcy5vcGFjaXR5IDwgMSB8fCBjaGlsZC5zdHlsZXMuaXNUcmFuc2Zvcm1lZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9yZGVyXzEgPSBjaGlsZC5zdHlsZXMuekluZGV4Lm9yZGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcmRlcl8xIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXhfMSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFN0YWNrLm5lZ2F0aXZlWkluZGV4LnNvbWUoZnVuY3Rpb24gKGN1cnJlbnQsIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmRlcl8xID4gY3VycmVudC5lbGVtZW50LmNvbnRhaW5lci5zdHlsZXMuekluZGV4Lm9yZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhfMSA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5kZXhfMSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFN0YWNrLm5lZ2F0aXZlWkluZGV4LnNwbGljZShpbmRleF8xLCAwLCBzdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9yZGVyXzEgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleF8yID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50U3RhY2sucG9zaXRpdmVaSW5kZXguc29tZShmdW5jdGlvbiAoY3VycmVudCwgaSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9yZGVyXzEgPj0gY3VycmVudC5lbGVtZW50LmNvbnRhaW5lci5zdHlsZXMuekluZGV4Lm9yZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhfMiA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluZGV4XzIgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRTdGFjay5wb3NpdGl2ZVpJbmRleC5zcGxpY2UoaW5kZXhfMiwgMCwgc3RhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50U3RhY2suemVyb09yQXV0b1pJbmRleE9yVHJhbnNmb3JtZWRPck9wYWNpdHkucHVzaChzdGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLnN0eWxlcy5pc0Zsb2F0aW5nKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50U3RhY2subm9uUG9zaXRpb25lZEZsb2F0cy5wdXNoKHN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFN0YWNrLm5vblBvc2l0aW9uZWRJbmxpbmVMZXZlbC5wdXNoKHN0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwYXJzZVN0YWNrVHJlZShwYWludENvbnRhaW5lciwgc3RhY2ssIHRyZWF0QXNSZWFsU3RhY2tpbmdDb250ZXh0ID8gc3RhY2sgOiByZWFsU3RhY2tpbmdDb250ZXh0LCBsaXN0T3duZXJJdGVtcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuc3R5bGVzLmlzSW5saW5lTGV2ZWwoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YWNraW5nQ29udGV4dC5pbmxpbmVMZXZlbC5wdXNoKHBhaW50Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YWNraW5nQ29udGV4dC5ub25JbmxpbmVMZXZlbC5wdXNoKHBhaW50Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHBhcnNlU3RhY2tUcmVlKHBhaW50Q29udGFpbmVyLCBzdGFja2luZ0NvbnRleHQsIHJlYWxTdGFja2luZ0NvbnRleHQsIGxpc3RPd25lckl0ZW1zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29udGFpbnMoY2hpbGQuZmxhZ3MsIDggLyogSVNfTElTVF9PV05FUiAqLykpIHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NMaXN0SXRlbXMoY2hpbGQsIGxpc3RPd25lckl0ZW1zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHZhciBwcm9jZXNzTGlzdEl0ZW1zID0gZnVuY3Rpb24gKG93bmVyLCBlbGVtZW50cykge1xyXG4gICAgICAgIHZhciBudW1iZXJpbmcgPSBvd25lciBpbnN0YW5jZW9mIE9MRWxlbWVudENvbnRhaW5lciA/IG93bmVyLnN0YXJ0IDogMTtcclxuICAgICAgICB2YXIgcmV2ZXJzZWQgPSBvd25lciBpbnN0YW5jZW9mIE9MRWxlbWVudENvbnRhaW5lciA/IG93bmVyLnJldmVyc2VkIDogZmFsc2U7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgaXRlbSA9IGVsZW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5jb250YWluZXIgaW5zdGFuY2VvZiBMSUVsZW1lbnRDb250YWluZXIgJiZcclxuICAgICAgICAgICAgICAgIHR5cGVvZiBpdGVtLmNvbnRhaW5lci52YWx1ZSA9PT0gJ251bWJlcicgJiZcclxuICAgICAgICAgICAgICAgIGl0ZW0uY29udGFpbmVyLnZhbHVlICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBudW1iZXJpbmcgPSBpdGVtLmNvbnRhaW5lci52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpdGVtLmxpc3RWYWx1ZSA9IGNyZWF0ZUNvdW50ZXJUZXh0KG51bWJlcmluZywgaXRlbS5jb250YWluZXIuc3R5bGVzLmxpc3RTdHlsZVR5cGUsIHRydWUpO1xyXG4gICAgICAgICAgICBudW1iZXJpbmcgKz0gcmV2ZXJzZWQgPyAtMSA6IDE7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHZhciBwYXJzZVN0YWNraW5nQ29udGV4dHMgPSBmdW5jdGlvbiAoY29udGFpbmVyKSB7XHJcbiAgICAgICAgdmFyIHBhaW50Q29udGFpbmVyID0gbmV3IEVsZW1lbnRQYWludChjb250YWluZXIsIFtdKTtcclxuICAgICAgICB2YXIgcm9vdCA9IG5ldyBTdGFja2luZ0NvbnRleHQocGFpbnRDb250YWluZXIpO1xyXG4gICAgICAgIHZhciBsaXN0SXRlbXMgPSBbXTtcclxuICAgICAgICBwYXJzZVN0YWNrVHJlZShwYWludENvbnRhaW5lciwgcm9vdCwgcm9vdCwgbGlzdEl0ZW1zKTtcclxuICAgICAgICBwcm9jZXNzTGlzdEl0ZW1zKHBhaW50Q29udGFpbmVyLmNvbnRhaW5lciwgbGlzdEl0ZW1zKTtcclxuICAgICAgICByZXR1cm4gcm9vdDtcclxuICAgIH07XG5cbiAgICB2YXIgcGFyc2VQYXRoRm9yQm9yZGVyID0gZnVuY3Rpb24gKGN1cnZlcywgYm9yZGVyU2lkZSkge1xyXG4gICAgICAgIHN3aXRjaCAoYm9yZGVyU2lkZSkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlUGF0aEZyb21DdXJ2ZXMoY3VydmVzLnRvcExlZnRCb3JkZXJCb3gsIGN1cnZlcy50b3BMZWZ0UGFkZGluZ0JveCwgY3VydmVzLnRvcFJpZ2h0Qm9yZGVyQm94LCBjdXJ2ZXMudG9wUmlnaHRQYWRkaW5nQm94KTtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVBhdGhGcm9tQ3VydmVzKGN1cnZlcy50b3BSaWdodEJvcmRlckJveCwgY3VydmVzLnRvcFJpZ2h0UGFkZGluZ0JveCwgY3VydmVzLmJvdHRvbVJpZ2h0Qm9yZGVyQm94LCBjdXJ2ZXMuYm90dG9tUmlnaHRQYWRkaW5nQm94KTtcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVBhdGhGcm9tQ3VydmVzKGN1cnZlcy5ib3R0b21SaWdodEJvcmRlckJveCwgY3VydmVzLmJvdHRvbVJpZ2h0UGFkZGluZ0JveCwgY3VydmVzLmJvdHRvbUxlZnRCb3JkZXJCb3gsIGN1cnZlcy5ib3R0b21MZWZ0UGFkZGluZ0JveCk7XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVQYXRoRnJvbUN1cnZlcyhjdXJ2ZXMuYm90dG9tTGVmdEJvcmRlckJveCwgY3VydmVzLmJvdHRvbUxlZnRQYWRkaW5nQm94LCBjdXJ2ZXMudG9wTGVmdEJvcmRlckJveCwgY3VydmVzLnRvcExlZnRQYWRkaW5nQm94KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdmFyIGNyZWF0ZVBhdGhGcm9tQ3VydmVzID0gZnVuY3Rpb24gKG91dGVyMSwgaW5uZXIxLCBvdXRlcjIsIGlubmVyMikge1xyXG4gICAgICAgIHZhciBwYXRoID0gW107XHJcbiAgICAgICAgaWYgKGlzQmV6aWVyQ3VydmUob3V0ZXIxKSkge1xyXG4gICAgICAgICAgICBwYXRoLnB1c2gob3V0ZXIxLnN1YmRpdmlkZSgwLjUsIGZhbHNlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwYXRoLnB1c2gob3V0ZXIxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzQmV6aWVyQ3VydmUob3V0ZXIyKSkge1xyXG4gICAgICAgICAgICBwYXRoLnB1c2gob3V0ZXIyLnN1YmRpdmlkZSgwLjUsIHRydWUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBhdGgucHVzaChvdXRlcjIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNCZXppZXJDdXJ2ZShpbm5lcjIpKSB7XHJcbiAgICAgICAgICAgIHBhdGgucHVzaChpbm5lcjIuc3ViZGl2aWRlKDAuNSwgdHJ1ZSkucmV2ZXJzZSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBhdGgucHVzaChpbm5lcjIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNCZXppZXJDdXJ2ZShpbm5lcjEpKSB7XHJcbiAgICAgICAgICAgIHBhdGgucHVzaChpbm5lcjEuc3ViZGl2aWRlKDAuNSwgZmFsc2UpLnJldmVyc2UoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwYXRoLnB1c2goaW5uZXIxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9O1xuXG4gICAgdmFyIHBhZGRpbmdCb3ggPSBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgIHZhciBib3VuZHMgPSBlbGVtZW50LmJvdW5kcztcclxuICAgICAgICB2YXIgc3R5bGVzID0gZWxlbWVudC5zdHlsZXM7XHJcbiAgICAgICAgcmV0dXJuIGJvdW5kcy5hZGQoc3R5bGVzLmJvcmRlckxlZnRXaWR0aCwgc3R5bGVzLmJvcmRlclRvcFdpZHRoLCAtKHN0eWxlcy5ib3JkZXJSaWdodFdpZHRoICsgc3R5bGVzLmJvcmRlckxlZnRXaWR0aCksIC0oc3R5bGVzLmJvcmRlclRvcFdpZHRoICsgc3R5bGVzLmJvcmRlckJvdHRvbVdpZHRoKSk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGNvbnRlbnRCb3ggPSBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgIHZhciBzdHlsZXMgPSBlbGVtZW50LnN0eWxlcztcclxuICAgICAgICB2YXIgYm91bmRzID0gZWxlbWVudC5ib3VuZHM7XHJcbiAgICAgICAgdmFyIHBhZGRpbmdMZWZ0ID0gZ2V0QWJzb2x1dGVWYWx1ZShzdHlsZXMucGFkZGluZ0xlZnQsIGJvdW5kcy53aWR0aCk7XHJcbiAgICAgICAgdmFyIHBhZGRpbmdSaWdodCA9IGdldEFic29sdXRlVmFsdWUoc3R5bGVzLnBhZGRpbmdSaWdodCwgYm91bmRzLndpZHRoKTtcclxuICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IGdldEFic29sdXRlVmFsdWUoc3R5bGVzLnBhZGRpbmdUb3AsIGJvdW5kcy53aWR0aCk7XHJcbiAgICAgICAgdmFyIHBhZGRpbmdCb3R0b20gPSBnZXRBYnNvbHV0ZVZhbHVlKHN0eWxlcy5wYWRkaW5nQm90dG9tLCBib3VuZHMud2lkdGgpO1xyXG4gICAgICAgIHJldHVybiBib3VuZHMuYWRkKHBhZGRpbmdMZWZ0ICsgc3R5bGVzLmJvcmRlckxlZnRXaWR0aCwgcGFkZGluZ1RvcCArIHN0eWxlcy5ib3JkZXJUb3BXaWR0aCwgLShzdHlsZXMuYm9yZGVyUmlnaHRXaWR0aCArIHN0eWxlcy5ib3JkZXJMZWZ0V2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodCksIC0oc3R5bGVzLmJvcmRlclRvcFdpZHRoICsgc3R5bGVzLmJvcmRlckJvdHRvbVdpZHRoICsgcGFkZGluZ1RvcCArIHBhZGRpbmdCb3R0b20pKTtcclxuICAgIH07XG5cbiAgICB2YXIgY2FsY3VsYXRlQmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYSA9IGZ1bmN0aW9uIChiYWNrZ3JvdW5kT3JpZ2luLCBlbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKGJhY2tncm91bmRPcmlnaW4gPT09IDAgLyogQk9SREVSX0JPWCAqLykge1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5ib3VuZHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChiYWNrZ3JvdW5kT3JpZ2luID09PSAyIC8qIENPTlRFTlRfQk9YICovKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb250ZW50Qm94KGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFkZGluZ0JveChlbGVtZW50KTtcclxuICAgIH07XHJcbiAgICB2YXIgY2FsY3VsYXRlQmFja2dyb3VuZFBhaW50aW5nQXJlYSA9IGZ1bmN0aW9uIChiYWNrZ3JvdW5kQ2xpcCwgZWxlbWVudCkge1xyXG4gICAgICAgIGlmIChiYWNrZ3JvdW5kQ2xpcCA9PT0gQkFDS0dST1VORF9DTElQLkJPUkRFUl9CT1gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuYm91bmRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYmFja2dyb3VuZENsaXAgPT09IEJBQ0tHUk9VTkRfQ0xJUC5DT05URU5UX0JPWCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29udGVudEJveChlbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhZGRpbmdCb3goZWxlbWVudCk7XHJcbiAgICB9O1xyXG4gICAgdmFyIGNhbGN1bGF0ZUJhY2tncm91bmRSZW5kZXJpbmcgPSBmdW5jdGlvbiAoY29udGFpbmVyLCBpbmRleCwgaW50cmluc2ljU2l6ZSkge1xyXG4gICAgICAgIHZhciBiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhID0gY2FsY3VsYXRlQmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYShnZXRCYWNrZ3JvdW5kVmFsdWVGb3JJbmRleChjb250YWluZXIuc3R5bGVzLmJhY2tncm91bmRPcmlnaW4sIGluZGV4KSwgY29udGFpbmVyKTtcclxuICAgICAgICB2YXIgYmFja2dyb3VuZFBhaW50aW5nQXJlYSA9IGNhbGN1bGF0ZUJhY2tncm91bmRQYWludGluZ0FyZWEoZ2V0QmFja2dyb3VuZFZhbHVlRm9ySW5kZXgoY29udGFpbmVyLnN0eWxlcy5iYWNrZ3JvdW5kQ2xpcCwgaW5kZXgpLCBjb250YWluZXIpO1xyXG4gICAgICAgIHZhciBiYWNrZ3JvdW5kSW1hZ2VTaXplID0gY2FsY3VsYXRlQmFja2dyb3VuZFNpemUoZ2V0QmFja2dyb3VuZFZhbHVlRm9ySW5kZXgoY29udGFpbmVyLnN0eWxlcy5iYWNrZ3JvdW5kU2l6ZSwgaW5kZXgpLCBpbnRyaW5zaWNTaXplLCBiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhKTtcclxuICAgICAgICB2YXIgc2l6ZVdpZHRoID0gYmFja2dyb3VuZEltYWdlU2l6ZVswXSwgc2l6ZUhlaWdodCA9IGJhY2tncm91bmRJbWFnZVNpemVbMV07XHJcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gZ2V0QWJzb2x1dGVWYWx1ZUZvclR1cGxlKGdldEJhY2tncm91bmRWYWx1ZUZvckluZGV4KGNvbnRhaW5lci5zdHlsZXMuYmFja2dyb3VuZFBvc2l0aW9uLCBpbmRleCksIGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEud2lkdGggLSBzaXplV2lkdGgsIGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEuaGVpZ2h0IC0gc2l6ZUhlaWdodCk7XHJcbiAgICAgICAgdmFyIHBhdGggPSBjYWxjdWxhdGVCYWNrZ3JvdW5kUmVwZWF0UGF0aChnZXRCYWNrZ3JvdW5kVmFsdWVGb3JJbmRleChjb250YWluZXIuc3R5bGVzLmJhY2tncm91bmRSZXBlYXQsIGluZGV4KSwgcG9zaXRpb24sIGJhY2tncm91bmRJbWFnZVNpemUsIGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEsIGJhY2tncm91bmRQYWludGluZ0FyZWEpO1xyXG4gICAgICAgIHZhciBvZmZzZXRYID0gTWF0aC5yb3VuZChiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhLmxlZnQgKyBwb3NpdGlvblswXSk7XHJcbiAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEudG9wICsgcG9zaXRpb25bMV0pO1xyXG4gICAgICAgIHJldHVybiBbcGF0aCwgb2Zmc2V0WCwgb2Zmc2V0WSwgc2l6ZVdpZHRoLCBzaXplSGVpZ2h0XTtcclxuICAgIH07XHJcbiAgICB2YXIgaXNBdXRvID0gZnVuY3Rpb24gKHRva2VuKSB7IHJldHVybiBpc0lkZW50VG9rZW4odG9rZW4pICYmIHRva2VuLnZhbHVlID09PSBCQUNLR1JPVU5EX1NJWkUuQVVUTzsgfTtcclxuICAgIHZhciBoYXNJbnRyaW5zaWNWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJzsgfTtcclxuICAgIHZhciBjYWxjdWxhdGVCYWNrZ3JvdW5kU2l6ZSA9IGZ1bmN0aW9uIChzaXplLCBfYSwgYm91bmRzKSB7XHJcbiAgICAgICAgdmFyIGludHJpbnNpY1dpZHRoID0gX2FbMF0sIGludHJpbnNpY0hlaWdodCA9IF9hWzFdLCBpbnRyaW5zaWNQcm9wb3J0aW9uID0gX2FbMl07XHJcbiAgICAgICAgdmFyIGZpcnN0ID0gc2l6ZVswXSwgc2Vjb25kID0gc2l6ZVsxXTtcclxuICAgICAgICBpZiAoaXNMZW5ndGhQZXJjZW50YWdlKGZpcnN0KSAmJiBzZWNvbmQgJiYgaXNMZW5ndGhQZXJjZW50YWdlKHNlY29uZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtnZXRBYnNvbHV0ZVZhbHVlKGZpcnN0LCBib3VuZHMud2lkdGgpLCBnZXRBYnNvbHV0ZVZhbHVlKHNlY29uZCwgYm91bmRzLmhlaWdodCldO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaGFzSW50cmluc2ljUHJvcG9ydGlvbiA9IGhhc0ludHJpbnNpY1ZhbHVlKGludHJpbnNpY1Byb3BvcnRpb24pO1xyXG4gICAgICAgIGlmIChpc0lkZW50VG9rZW4oZmlyc3QpICYmIChmaXJzdC52YWx1ZSA9PT0gQkFDS0dST1VORF9TSVpFLkNPTlRBSU4gfHwgZmlyc3QudmFsdWUgPT09IEJBQ0tHUk9VTkRfU0laRS5DT1ZFUikpIHtcclxuICAgICAgICAgICAgaWYgKGhhc0ludHJpbnNpY1ZhbHVlKGludHJpbnNpY1Byb3BvcnRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0UmF0aW8gPSBib3VuZHMud2lkdGggLyBib3VuZHMuaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFJhdGlvIDwgaW50cmluc2ljUHJvcG9ydGlvbiAhPT0gKGZpcnN0LnZhbHVlID09PSBCQUNLR1JPVU5EX1NJWkUuQ09WRVIpXHJcbiAgICAgICAgICAgICAgICAgICAgPyBbYm91bmRzLndpZHRoLCBib3VuZHMud2lkdGggLyBpbnRyaW5zaWNQcm9wb3J0aW9uXVxyXG4gICAgICAgICAgICAgICAgICAgIDogW2JvdW5kcy5oZWlnaHQgKiBpbnRyaW5zaWNQcm9wb3J0aW9uLCBib3VuZHMuaGVpZ2h0XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gW2JvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBoYXNJbnRyaW5zaWNXaWR0aCA9IGhhc0ludHJpbnNpY1ZhbHVlKGludHJpbnNpY1dpZHRoKTtcclxuICAgICAgICB2YXIgaGFzSW50cmluc2ljSGVpZ2h0ID0gaGFzSW50cmluc2ljVmFsdWUoaW50cmluc2ljSGVpZ2h0KTtcclxuICAgICAgICB2YXIgaGFzSW50cmluc2ljRGltZW5zaW9ucyA9IGhhc0ludHJpbnNpY1dpZHRoIHx8IGhhc0ludHJpbnNpY0hlaWdodDtcclxuICAgICAgICAvLyBJZiB0aGUgYmFja2dyb3VuZC1zaXplIGlzIGF1dG8gb3IgYXV0byBhdXRvOlxyXG4gICAgICAgIGlmIChpc0F1dG8oZmlyc3QpICYmICghc2Vjb25kIHx8IGlzQXV0byhzZWNvbmQpKSkge1xyXG4gICAgICAgICAgICAvLyBJZiB0aGUgaW1hZ2UgaGFzIGJvdGggaG9yaXpvbnRhbCBhbmQgdmVydGljYWwgaW50cmluc2ljIGRpbWVuc2lvbnMsIGl0J3MgcmVuZGVyZWQgYXQgdGhhdCBzaXplLlxyXG4gICAgICAgICAgICBpZiAoaGFzSW50cmluc2ljV2lkdGggJiYgaGFzSW50cmluc2ljSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2ludHJpbnNpY1dpZHRoLCBpbnRyaW5zaWNIZWlnaHRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSBpbWFnZSBoYXMgbm8gaW50cmluc2ljIGRpbWVuc2lvbnMgYW5kIGhhcyBubyBpbnRyaW5zaWMgcHJvcG9ydGlvbnMsXHJcbiAgICAgICAgICAgIC8vIGl0J3MgcmVuZGVyZWQgYXQgdGhlIHNpemUgb2YgdGhlIGJhY2tncm91bmQgcG9zaXRpb25pbmcgYXJlYS5cclxuICAgICAgICAgICAgaWYgKCFoYXNJbnRyaW5zaWNQcm9wb3J0aW9uICYmICFoYXNJbnRyaW5zaWNEaW1lbnNpb25zKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2JvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gVE9ETyBJZiB0aGUgaW1hZ2UgaGFzIG5vIGludHJpbnNpYyBkaW1lbnNpb25zIGJ1dCBoYXMgaW50cmluc2ljIHByb3BvcnRpb25zLCBpdCdzIHJlbmRlcmVkIGFzIGlmIGNvbnRhaW4gaGFkIGJlZW4gc3BlY2lmaWVkIGluc3RlYWQuXHJcbiAgICAgICAgICAgIC8vIElmIHRoZSBpbWFnZSBoYXMgb25seSBvbmUgaW50cmluc2ljIGRpbWVuc2lvbiBhbmQgaGFzIGludHJpbnNpYyBwcm9wb3J0aW9ucywgaXQncyByZW5kZXJlZCBhdCB0aGUgc2l6ZSBjb3JyZXNwb25kaW5nIHRvIHRoYXQgb25lIGRpbWVuc2lvbi5cclxuICAgICAgICAgICAgLy8gVGhlIG90aGVyIGRpbWVuc2lvbiBpcyBjb21wdXRlZCB1c2luZyB0aGUgc3BlY2lmaWVkIGRpbWVuc2lvbiBhbmQgdGhlIGludHJpbnNpYyBwcm9wb3J0aW9ucy5cclxuICAgICAgICAgICAgaWYgKGhhc0ludHJpbnNpY0RpbWVuc2lvbnMgJiYgaGFzSW50cmluc2ljUHJvcG9ydGlvbikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoXzEgPSBoYXNJbnRyaW5zaWNXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgID8gaW50cmluc2ljV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICA6IGludHJpbnNpY0hlaWdodCAqIGludHJpbnNpY1Byb3BvcnRpb247XHJcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0XzEgPSBoYXNJbnRyaW5zaWNIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICA/IGludHJpbnNpY0hlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgIDogaW50cmluc2ljV2lkdGggLyBpbnRyaW5zaWNQcm9wb3J0aW9uO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt3aWR0aF8xLCBoZWlnaHRfMV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSWYgdGhlIGltYWdlIGhhcyBvbmx5IG9uZSBpbnRyaW5zaWMgZGltZW5zaW9uIGJ1dCBoYXMgbm8gaW50cmluc2ljIHByb3BvcnRpb25zLFxyXG4gICAgICAgICAgICAvLyBpdCdzIHJlbmRlcmVkIHVzaW5nIHRoZSBzcGVjaWZpZWQgZGltZW5zaW9uIGFuZCB0aGUgb3RoZXIgZGltZW5zaW9uIG9mIHRoZSBiYWNrZ3JvdW5kIHBvc2l0aW9uaW5nIGFyZWEuXHJcbiAgICAgICAgICAgIHZhciB3aWR0aF8yID0gaGFzSW50cmluc2ljV2lkdGggPyBpbnRyaW5zaWNXaWR0aCA6IGJvdW5kcy53aWR0aDtcclxuICAgICAgICAgICAgdmFyIGhlaWdodF8yID0gaGFzSW50cmluc2ljSGVpZ2h0ID8gaW50cmluc2ljSGVpZ2h0IDogYm91bmRzLmhlaWdodDtcclxuICAgICAgICAgICAgcmV0dXJuIFt3aWR0aF8yLCBoZWlnaHRfMl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIElmIHRoZSBpbWFnZSBoYXMgaW50cmluc2ljIHByb3BvcnRpb25zLCBpdCdzIHN0cmV0Y2hlZCB0byB0aGUgc3BlY2lmaWVkIGRpbWVuc2lvbi5cclxuICAgICAgICAvLyBUaGUgdW5zcGVjaWZpZWQgZGltZW5zaW9uIGlzIGNvbXB1dGVkIHVzaW5nIHRoZSBzcGVjaWZpZWQgZGltZW5zaW9uIGFuZCB0aGUgaW50cmluc2ljIHByb3BvcnRpb25zLlxyXG4gICAgICAgIGlmIChoYXNJbnRyaW5zaWNQcm9wb3J0aW9uKSB7XHJcbiAgICAgICAgICAgIHZhciB3aWR0aF8zID0gMDtcclxuICAgICAgICAgICAgdmFyIGhlaWdodF8zID0gMDtcclxuICAgICAgICAgICAgaWYgKGlzTGVuZ3RoUGVyY2VudGFnZShmaXJzdCkpIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoXzMgPSBnZXRBYnNvbHV0ZVZhbHVlKGZpcnN0LCBib3VuZHMud2lkdGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzTGVuZ3RoUGVyY2VudGFnZShzZWNvbmQpKSB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHRfMyA9IGdldEFic29sdXRlVmFsdWUoc2Vjb25kLCBib3VuZHMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNBdXRvKGZpcnN0KSkge1xyXG4gICAgICAgICAgICAgICAgd2lkdGhfMyA9IGhlaWdodF8zICogaW50cmluc2ljUHJvcG9ydGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghc2Vjb25kIHx8IGlzQXV0byhzZWNvbmQpKSB7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHRfMyA9IHdpZHRoXzMgLyBpbnRyaW5zaWNQcm9wb3J0aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBbd2lkdGhfMywgaGVpZ2h0XzNdO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJZiB0aGUgaW1hZ2UgaGFzIG5vIGludHJpbnNpYyBwcm9wb3J0aW9ucywgaXQncyBzdHJldGNoZWQgdG8gdGhlIHNwZWNpZmllZCBkaW1lbnNpb24uXHJcbiAgICAgICAgLy8gVGhlIHVuc3BlY2lmaWVkIGRpbWVuc2lvbiBpcyBjb21wdXRlZCB1c2luZyB0aGUgaW1hZ2UncyBjb3JyZXNwb25kaW5nIGludHJpbnNpYyBkaW1lbnNpb24sXHJcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgb25lLiBJZiB0aGVyZSBpcyBubyBzdWNoIGludHJpbnNpYyBkaW1lbnNpb24sXHJcbiAgICAgICAgLy8gaXQgYmVjb21lcyB0aGUgY29ycmVzcG9uZGluZyBkaW1lbnNpb24gb2YgdGhlIGJhY2tncm91bmQgcG9zaXRpb25pbmcgYXJlYS5cclxuICAgICAgICB2YXIgd2lkdGggPSBudWxsO1xyXG4gICAgICAgIHZhciBoZWlnaHQgPSBudWxsO1xyXG4gICAgICAgIGlmIChpc0xlbmd0aFBlcmNlbnRhZ2UoZmlyc3QpKSB7XHJcbiAgICAgICAgICAgIHdpZHRoID0gZ2V0QWJzb2x1dGVWYWx1ZShmaXJzdCwgYm91bmRzLndpZHRoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoc2Vjb25kICYmIGlzTGVuZ3RoUGVyY2VudGFnZShzZWNvbmQpKSB7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IGdldEFic29sdXRlVmFsdWUoc2Vjb25kLCBib3VuZHMuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHdpZHRoICE9PSBudWxsICYmICghc2Vjb25kIHx8IGlzQXV0byhzZWNvbmQpKSkge1xyXG4gICAgICAgICAgICBoZWlnaHQgPVxyXG4gICAgICAgICAgICAgICAgaGFzSW50cmluc2ljV2lkdGggJiYgaGFzSW50cmluc2ljSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgPyAod2lkdGggLyBpbnRyaW5zaWNXaWR0aCkgKiBpbnRyaW5zaWNIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICA6IGJvdW5kcy5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoZWlnaHQgIT09IG51bGwgJiYgaXNBdXRvKGZpcnN0KSkge1xyXG4gICAgICAgICAgICB3aWR0aCA9XHJcbiAgICAgICAgICAgICAgICBoYXNJbnRyaW5zaWNXaWR0aCAmJiBoYXNJbnRyaW5zaWNIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICA/IChoZWlnaHQgLyBpbnRyaW5zaWNIZWlnaHQpICogaW50cmluc2ljV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICA6IGJvdW5kcy53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHdpZHRoICE9PSBudWxsICYmIGhlaWdodCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW3dpZHRoLCBoZWlnaHRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gY2FsY3VsYXRlIGJhY2tncm91bmQtc2l6ZSBmb3IgZWxlbWVudFwiKTtcclxuICAgIH07XHJcbiAgICB2YXIgZ2V0QmFja2dyb3VuZFZhbHVlRm9ySW5kZXggPSBmdW5jdGlvbiAodmFsdWVzLCBpbmRleCkge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlc1tpbmRleF07XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlc1swXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfTtcclxuICAgIHZhciBjYWxjdWxhdGVCYWNrZ3JvdW5kUmVwZWF0UGF0aCA9IGZ1bmN0aW9uIChyZXBlYXQsIF9hLCBfYiwgYmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYSwgYmFja2dyb3VuZFBhaW50aW5nQXJlYSkge1xyXG4gICAgICAgIHZhciB4ID0gX2FbMF0sIHkgPSBfYVsxXTtcclxuICAgICAgICB2YXIgd2lkdGggPSBfYlswXSwgaGVpZ2h0ID0gX2JbMV07XHJcbiAgICAgICAgc3dpdGNoIChyZXBlYXQpIHtcclxuICAgICAgICAgICAgY2FzZSBCQUNLR1JPVU5EX1JFUEVBVC5SRVBFQVRfWDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcihNYXRoLnJvdW5kKGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEubGVmdCksIE1hdGgucm91bmQoYmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYS50b3AgKyB5KSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcihNYXRoLnJvdW5kKGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEubGVmdCArIGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEud2lkdGgpLCBNYXRoLnJvdW5kKGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEudG9wICsgeSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoTWF0aC5yb3VuZChiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhLmxlZnQgKyBiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhLndpZHRoKSwgTWF0aC5yb3VuZChoZWlnaHQgKyBiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhLnRvcCArIHkpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKE1hdGgucm91bmQoYmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYS5sZWZ0KSwgTWF0aC5yb3VuZChoZWlnaHQgKyBiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhLnRvcCArIHkpKVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgY2FzZSBCQUNLR1JPVU5EX1JFUEVBVC5SRVBFQVRfWTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcihNYXRoLnJvdW5kKGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEubGVmdCArIHgpLCBNYXRoLnJvdW5kKGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEudG9wKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcihNYXRoLnJvdW5kKGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEubGVmdCArIHggKyB3aWR0aCksIE1hdGgucm91bmQoYmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYS50b3ApKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKE1hdGgucm91bmQoYmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYS5sZWZ0ICsgeCArIHdpZHRoKSwgTWF0aC5yb3VuZChiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhLmhlaWdodCArIGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEudG9wKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcihNYXRoLnJvdW5kKGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEubGVmdCArIHgpLCBNYXRoLnJvdW5kKGJhY2tncm91bmRQb3NpdGlvbmluZ0FyZWEuaGVpZ2h0ICsgYmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYS50b3ApKVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgY2FzZSBCQUNLR1JPVU5EX1JFUEVBVC5OT19SRVBFQVQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoTWF0aC5yb3VuZChiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhLmxlZnQgKyB4KSwgTWF0aC5yb3VuZChiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhLnRvcCArIHkpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKE1hdGgucm91bmQoYmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYS5sZWZ0ICsgeCArIHdpZHRoKSwgTWF0aC5yb3VuZChiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhLnRvcCArIHkpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKE1hdGgucm91bmQoYmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYS5sZWZ0ICsgeCArIHdpZHRoKSwgTWF0aC5yb3VuZChiYWNrZ3JvdW5kUG9zaXRpb25pbmdBcmVhLnRvcCArIHkgKyBoZWlnaHQpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKE1hdGgucm91bmQoYmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYS5sZWZ0ICsgeCksIE1hdGgucm91bmQoYmFja2dyb3VuZFBvc2l0aW9uaW5nQXJlYS50b3AgKyB5ICsgaGVpZ2h0KSlcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoTWF0aC5yb3VuZChiYWNrZ3JvdW5kUGFpbnRpbmdBcmVhLmxlZnQpLCBNYXRoLnJvdW5kKGJhY2tncm91bmRQYWludGluZ0FyZWEudG9wKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcihNYXRoLnJvdW5kKGJhY2tncm91bmRQYWludGluZ0FyZWEubGVmdCArIGJhY2tncm91bmRQYWludGluZ0FyZWEud2lkdGgpLCBNYXRoLnJvdW5kKGJhY2tncm91bmRQYWludGluZ0FyZWEudG9wKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3RvcihNYXRoLnJvdW5kKGJhY2tncm91bmRQYWludGluZ0FyZWEubGVmdCArIGJhY2tncm91bmRQYWludGluZ0FyZWEud2lkdGgpLCBNYXRoLnJvdW5kKGJhY2tncm91bmRQYWludGluZ0FyZWEuaGVpZ2h0ICsgYmFja2dyb3VuZFBhaW50aW5nQXJlYS50b3ApKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKE1hdGgucm91bmQoYmFja2dyb3VuZFBhaW50aW5nQXJlYS5sZWZ0KSwgTWF0aC5yb3VuZChiYWNrZ3JvdW5kUGFpbnRpbmdBcmVhLmhlaWdodCArIGJhY2tncm91bmRQYWludGluZ0FyZWEudG9wKSlcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcblxuICAgIHZhciBTTUFMTF9JTUFHRSA9ICdkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFBQUFBUC8vL3lINUJBRUFBQUFBTEFBQUFBQUJBQUVBQUFJQlJBQTcnO1xuXG4gICAgdmFyIFNBTVBMRV9URVhUID0gJ0hpZGRlbiBUZXh0JztcclxuICAgIHZhciBGb250TWV0cmljcyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBGb250TWV0cmljcyhkb2N1bWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEZvbnRNZXRyaWNzLnByb3RvdHlwZS5wYXJzZU1ldHJpY3MgPSBmdW5jdGlvbiAoZm9udEZhbWlseSwgZm9udFNpemUpIHtcclxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICB2YXIgaW1nID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgICAgIHZhciBzcGFuID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xyXG4gICAgICAgICAgICB2YXIgYm9keSA9IHRoaXMuX2RvY3VtZW50LmJvZHk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zdHlsZS5mb250RmFtaWx5ID0gZm9udEZhbWlseTtcclxuICAgICAgICAgICAgY29udGFpbmVyLnN0eWxlLmZvbnRTaXplID0gZm9udFNpemU7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zdHlsZS5tYXJnaW4gPSAnMCc7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zdHlsZS5wYWRkaW5nID0gJzAnO1xyXG4gICAgICAgICAgICBib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIGltZy5zcmMgPSBTTUFMTF9JTUFHRTtcclxuICAgICAgICAgICAgaW1nLndpZHRoID0gMTtcclxuICAgICAgICAgICAgaW1nLmhlaWdodCA9IDE7XHJcbiAgICAgICAgICAgIGltZy5zdHlsZS5tYXJnaW4gPSAnMCc7XHJcbiAgICAgICAgICAgIGltZy5zdHlsZS5wYWRkaW5nID0gJzAnO1xyXG4gICAgICAgICAgICBpbWcuc3R5bGUudmVydGljYWxBbGlnbiA9ICdiYXNlbGluZSc7XHJcbiAgICAgICAgICAgIHNwYW4uc3R5bGUuZm9udEZhbWlseSA9IGZvbnRGYW1pbHk7XHJcbiAgICAgICAgICAgIHNwYW4uc3R5bGUuZm9udFNpemUgPSBmb250U2l6ZTtcclxuICAgICAgICAgICAgc3Bhbi5zdHlsZS5tYXJnaW4gPSAnMCc7XHJcbiAgICAgICAgICAgIHNwYW4uc3R5bGUucGFkZGluZyA9ICcwJztcclxuICAgICAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZCh0aGlzLl9kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShTQU1QTEVfVEVYVCkpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoc3Bhbik7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbWcpO1xyXG4gICAgICAgICAgICB2YXIgYmFzZWxpbmUgPSBpbWcub2Zmc2V0VG9wIC0gc3Bhbi5vZmZzZXRUb3AgKyAyO1xyXG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoc3Bhbik7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShTQU1QTEVfVEVYVCkpO1xyXG4gICAgICAgICAgICBjb250YWluZXIuc3R5bGUubGluZUhlaWdodCA9ICdub3JtYWwnO1xyXG4gICAgICAgICAgICBpbWcuc3R5bGUudmVydGljYWxBbGlnbiA9ICdzdXBlcic7XHJcbiAgICAgICAgICAgIHZhciBtaWRkbGUgPSBpbWcub2Zmc2V0VG9wIC0gY29udGFpbmVyLm9mZnNldFRvcCArIDI7XHJcbiAgICAgICAgICAgIGJvZHkucmVtb3ZlQ2hpbGQoY29udGFpbmVyKTtcclxuICAgICAgICAgICAgcmV0dXJuIHsgYmFzZWxpbmU6IGJhc2VsaW5lLCBtaWRkbGU6IG1pZGRsZSB9O1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgRm9udE1ldHJpY3MucHJvdG90eXBlLmdldE1ldHJpY3MgPSBmdW5jdGlvbiAoZm9udEZhbWlseSwgZm9udFNpemUpIHtcclxuICAgICAgICAgICAgdmFyIGtleSA9IGZvbnRGYW1pbHkgKyBcIiBcIiArIGZvbnRTaXplO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuX2RhdGFba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IHRoaXMucGFyc2VNZXRyaWNzKGZvbnRGYW1pbHksIGZvbnRTaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtrZXldO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIEZvbnRNZXRyaWNzO1xyXG4gICAgfSgpKTtcblxuICAgIHZhciBNQVNLX09GRlNFVCA9IDEwMDAwO1xyXG4gICAgdmFyIENhbnZhc1JlbmRlcmVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIENhbnZhc1JlbmRlcmVyKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0cyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcyA9IG9wdGlvbnMuY2FudmFzID8gb3B0aW9ucy5jYW52YXMgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMuY2FudmFzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IE1hdGguZmxvb3Iob3B0aW9ucy53aWR0aCAqIG9wdGlvbnMuc2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gTWF0aC5mbG9vcihvcHRpb25zLmhlaWdodCAqIG9wdGlvbnMuc2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSBvcHRpb25zLndpZHRoICsgXCJweFwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgKyBcInB4XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5mb250TWV0cmljcyA9IG5ldyBGb250TWV0cmljcyhkb2N1bWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnNjYWxlKHRoaXMub3B0aW9ucy5zY2FsZSwgdGhpcy5vcHRpb25zLnNjYWxlKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKC1vcHRpb25zLnggKyBvcHRpb25zLnNjcm9sbFgsIC1vcHRpb25zLnkgKyBvcHRpb25zLnNjcm9sbFkpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnYm90dG9tJztcclxuICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0cyA9IFtdO1xyXG4gICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2Uob3B0aW9ucy5pZCkuZGVidWcoXCJDYW52YXMgcmVuZGVyZXIgaW5pdGlhbGl6ZWQgKFwiICsgb3B0aW9ucy53aWR0aCArIFwieFwiICsgb3B0aW9ucy5oZWlnaHQgKyBcIiBhdCBcIiArIG9wdGlvbnMueCArIFwiLFwiICsgb3B0aW9ucy55ICsgXCIpIHdpdGggc2NhbGUgXCIgKyBvcHRpb25zLnNjYWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLmFwcGx5RWZmZWN0cyA9IGZ1bmN0aW9uIChlZmZlY3RzLCB0YXJnZXQpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuX2FjdGl2ZUVmZmVjdHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcEVmZmVjdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVmZmVjdHMuZmlsdGVyKGZ1bmN0aW9uIChlZmZlY3QpIHsgcmV0dXJuIGNvbnRhaW5zKGVmZmVjdC50YXJnZXQsIHRhcmdldCk7IH0pLmZvckVhY2goZnVuY3Rpb24gKGVmZmVjdCkgeyByZXR1cm4gX3RoaXMuYXBwbHlFZmZlY3QoZWZmZWN0KTsgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYW52YXNSZW5kZXJlci5wcm90b3R5cGUuYXBwbHlFZmZlY3QgPSBmdW5jdGlvbiAoZWZmZWN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcclxuICAgICAgICAgICAgaWYgKGlzVHJhbnNmb3JtRWZmZWN0KGVmZmVjdCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZShlZmZlY3Qub2Zmc2V0WCwgZWZmZWN0Lm9mZnNldFkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgudHJhbnNmb3JtKGVmZmVjdC5tYXRyaXhbMF0sIGVmZmVjdC5tYXRyaXhbMV0sIGVmZmVjdC5tYXRyaXhbMl0sIGVmZmVjdC5tYXRyaXhbM10sIGVmZmVjdC5tYXRyaXhbNF0sIGVmZmVjdC5tYXRyaXhbNV0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKC1lZmZlY3Qub2Zmc2V0WCwgLWVmZmVjdC5vZmZzZXRZKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNDbGlwRWZmZWN0KGVmZmVjdCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGF0aChlZmZlY3QucGF0aCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5jbGlwKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fYWN0aXZlRWZmZWN0cy5wdXNoKGVmZmVjdCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYW52YXNSZW5kZXJlci5wcm90b3R5cGUucG9wRWZmZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVFZmZlY3RzLnBvcCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYW52YXNSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyU3RhY2sgPSBmdW5jdGlvbiAoc3RhY2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlcztcclxuICAgICAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlcyA9IHN0YWNrLmVsZW1lbnQuY29udGFpbmVyLnN0eWxlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc3R5bGVzLmlzVmlzaWJsZSgpKSByZXR1cm4gWzMgLypicmVhayovLCAyXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gc3R5bGVzLm9wYWNpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnJlbmRlclN0YWNrQ29udGVudChzdGFjayldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYS5sYWJlbCA9IDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIENhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJOb2RlID0gZnVuY3Rpb24gKHBhaW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGFpbnQuY29udGFpbmVyLnN0eWxlcy5pc1Zpc2libGUoKSkgcmV0dXJuIFszIC8qYnJlYWsqLywgM107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnJlbmRlck5vZGVCYWNrZ3JvdW5kQW5kQm9yZGVycyhwYWludCldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnJlbmRlck5vZGVDb250ZW50KHBhaW50KV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hLmxhYmVsID0gMztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gWzIgLypyZXR1cm4qL107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlclRleHRXaXRoTGV0dGVyU3BhY2luZyA9IGZ1bmN0aW9uICh0ZXh0LCBsZXR0ZXJTcGFjaW5nKSB7XHJcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgICAgIGlmIChsZXR0ZXJTcGFjaW5nID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCh0ZXh0LnRleHQsIHRleHQuYm91bmRzLmxlZnQsIHRleHQuYm91bmRzLnRvcCArIHRleHQuYm91bmRzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGV0dGVycyA9IHRvQ29kZVBvaW50cyh0ZXh0LnRleHQpLm1hcChmdW5jdGlvbiAoaSkgeyByZXR1cm4gZnJvbUNvZGVQb2ludChpKTsgfSk7XHJcbiAgICAgICAgICAgICAgICBsZXR0ZXJzLnJlZHVjZShmdW5jdGlvbiAobGVmdCwgbGV0dGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3R4LmZpbGxUZXh0KGxldHRlciwgbGVmdCwgdGV4dC5ib3VuZHMudG9wICsgdGV4dC5ib3VuZHMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdCArIF90aGlzLmN0eC5tZWFzdXJlVGV4dChsZXR0ZXIpLndpZHRoO1xyXG4gICAgICAgICAgICAgICAgfSwgdGV4dC5ib3VuZHMubGVmdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIENhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVGb250U3R5bGUgPSBmdW5jdGlvbiAoc3R5bGVzKSB7XHJcbiAgICAgICAgICAgIHZhciBmb250VmFyaWFudCA9IHN0eWxlcy5mb250VmFyaWFudFxyXG4gICAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAodmFyaWFudCkgeyByZXR1cm4gdmFyaWFudCA9PT0gJ25vcm1hbCcgfHwgdmFyaWFudCA9PT0gJ3NtYWxsLWNhcHMnOyB9KVxyXG4gICAgICAgICAgICAgICAgLmpvaW4oJycpO1xyXG4gICAgICAgICAgICB2YXIgZm9udEZhbWlseSA9IHN0eWxlcy5mb250RmFtaWx5LmpvaW4oJywgJyk7XHJcbiAgICAgICAgICAgIHZhciBmb250U2l6ZSA9IGlzRGltZW5zaW9uVG9rZW4oc3R5bGVzLmZvbnRTaXplKVxyXG4gICAgICAgICAgICAgICAgPyBcIlwiICsgc3R5bGVzLmZvbnRTaXplLm51bWJlciArIHN0eWxlcy5mb250U2l6ZS51bml0XHJcbiAgICAgICAgICAgICAgICA6IHN0eWxlcy5mb250U2l6ZS5udW1iZXIgKyBcInB4XCI7XHJcbiAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICBbc3R5bGVzLmZvbnRTdHlsZSwgZm9udFZhcmlhbnQsIHN0eWxlcy5mb250V2VpZ2h0LCBmb250U2l6ZSwgZm9udEZhbWlseV0uam9pbignICcpLFxyXG4gICAgICAgICAgICAgICAgZm9udEZhbWlseSxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYW52YXNSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyVGV4dE5vZGUgPSBmdW5jdGlvbiAodGV4dCwgc3R5bGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBfYSwgZm9udCwgZm9udEZhbWlseSwgZm9udFNpemU7XHJcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYikge1xyXG4gICAgICAgICAgICAgICAgICAgIF9hID0gdGhpcy5jcmVhdGVGb250U3R5bGUoc3R5bGVzKSwgZm9udCA9IF9hWzBdLCBmb250RmFtaWx5ID0gX2FbMV0sIGZvbnRTaXplID0gX2FbMl07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZm9udCA9IGZvbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dC50ZXh0Qm91bmRzLmZvckVhY2goZnVuY3Rpb24gKHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3R4LmZpbGxTdHlsZSA9IGFzU3RyaW5nKHN0eWxlcy5jb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnJlbmRlclRleHRXaXRoTGV0dGVyU3BhY2luZyh0ZXh0LCBzdHlsZXMubGV0dGVyU3BhY2luZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZXh0U2hhZG93cyA9IHN0eWxlcy50ZXh0U2hhZG93O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGV4dFNoYWRvd3MubGVuZ3RoICYmIHRleHQudGV4dC50cmltKCkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0U2hhZG93c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZSgwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXZlcnNlKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbiAodGV4dFNoYWRvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmN0eC5zaGFkb3dDb2xvciA9IGFzU3RyaW5nKHRleHRTaGFkb3cuY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmN0eC5zaGFkb3dPZmZzZXRYID0gdGV4dFNoYWRvdy5vZmZzZXRYLm51bWJlciAqIF90aGlzLm9wdGlvbnMuc2NhbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3R4LnNoYWRvd09mZnNldFkgPSB0ZXh0U2hhZG93Lm9mZnNldFkubnVtYmVyICogX3RoaXMub3B0aW9ucy5zY2FsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdHguc2hhZG93Qmx1ciA9IHRleHRTaGFkb3cuYmx1ci5udW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3R4LmZpbGxUZXh0KHRleHQudGV4dCwgdGV4dC5ib3VuZHMubGVmdCwgdGV4dC5ib3VuZHMudG9wICsgdGV4dC5ib3VuZHMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3R4LnNoYWRvd0NvbG9yID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdHguc2hhZG93T2Zmc2V0WCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdHguc2hhZG93T2Zmc2V0WSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdHguc2hhZG93Qmx1ciA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0eWxlcy50ZXh0RGVjb3JhdGlvbkxpbmUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdHguZmlsbFN0eWxlID0gYXNTdHJpbmcoc3R5bGVzLnRleHREZWNvcmF0aW9uQ29sb3IgfHwgc3R5bGVzLmNvbG9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlcy50ZXh0RGVjb3JhdGlvbkxpbmUuZm9yRWFjaChmdW5jdGlvbiAodGV4dERlY29yYXRpb25MaW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0ZXh0RGVjb3JhdGlvbkxpbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxIC8qIFVOREVSTElORSAqLzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERyYXdzIGEgbGluZSBhdCB0aGUgYmFzZWxpbmUgb2YgdGhlIGZvbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gQXMgc29tZSBicm93c2VycyBkaXNwbGF5IHRoZSBsaW5lIGFzIG1vcmUgdGhhbiAxcHggaWYgdGhlIGZvbnQtc2l6ZSBpcyBiaWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIHRvIHRha2UgdGhhdCBpbnRvIGFjY291bnQgYm90aCBpbiBwb3NpdGlvbiBhbmQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2VsaW5lID0gX3RoaXMuZm9udE1ldHJpY3MuZ2V0TWV0cmljcyhmb250RmFtaWx5LCBmb250U2l6ZSkuYmFzZWxpbmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdHguZmlsbFJlY3QodGV4dC5ib3VuZHMubGVmdCwgTWF0aC5yb3VuZCh0ZXh0LmJvdW5kcy50b3AgKyBiYXNlbGluZSksIHRleHQuYm91bmRzLndpZHRoLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDIgLyogT1ZFUkxJTkUgKi86XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdHguZmlsbFJlY3QodGV4dC5ib3VuZHMubGVmdCwgTWF0aC5yb3VuZCh0ZXh0LmJvdW5kcy50b3ApLCB0ZXh0LmJvdW5kcy53aWR0aCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzIC8qIExJTkVfVEhST1VHSCAqLzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gdHJ5IGFuZCBmaW5kIGV4YWN0IHBvc2l0aW9uIGZvciBsaW5lLXRocm91Z2hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaWRkbGUgPSBfdGhpcy5mb250TWV0cmljcy5nZXRNZXRyaWNzKGZvbnRGYW1pbHksIGZvbnRTaXplKS5taWRkbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdHguZmlsbFJlY3QodGV4dC5ib3VuZHMubGVmdCwgTWF0aC5jZWlsKHRleHQuYm91bmRzLnRvcCArIG1pZGRsZSksIHRleHQuYm91bmRzLndpZHRoLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlclJlcGxhY2VkRWxlbWVudCA9IGZ1bmN0aW9uIChjb250YWluZXIsIGN1cnZlcywgaW1hZ2UpIHtcclxuICAgICAgICAgICAgaWYgKGltYWdlICYmIGNvbnRhaW5lci5pbnRyaW5zaWNXaWR0aCA+IDAgJiYgY29udGFpbmVyLmludHJpbnNpY0hlaWdodCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBib3ggPSBjb250ZW50Qm94KGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGF0aCA9IGNhbGN1bGF0ZVBhZGRpbmdCb3hQYXRoKGN1cnZlcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGgocGF0aCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5jbGlwKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDAsIGNvbnRhaW5lci5pbnRyaW5zaWNXaWR0aCwgY29udGFpbmVyLmludHJpbnNpY0hlaWdodCwgYm94LmxlZnQsIGJveC50b3AsIGJveC53aWR0aCwgYm94LmhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIENhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJOb2RlQ29udGVudCA9IGZ1bmN0aW9uIChwYWludCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyLCBjdXJ2ZXMsIHN0eWxlcywgX2ksIF9hLCBjaGlsZCwgaW1hZ2UsIGVfMSwgaW1hZ2UsIGVfMiwgaWZyYW1lUmVuZGVyZXIsIGNhbnZhcywgc2l6ZSwgYm91bmRzLCB4LCB0ZXh0Qm91bmRzLCBpbWcsIGltYWdlLCB1cmwsIGVfMywgYm91bmRzO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoX2IubGFiZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseUVmZmVjdHMocGFpbnQuZWZmZWN0cywgNCAvKiBDT05URU5UICovKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IHBhaW50LmNvbnRhaW5lcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnZlcyA9IHBhaW50LmN1cnZlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlcyA9IGNvbnRhaW5lci5zdHlsZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaSA9IDAsIF9hID0gY29udGFpbmVyLnRleHROb2RlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9iLmxhYmVsID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoX2kgPCBfYS5sZW5ndGgpKSByZXR1cm4gWzMgLypicmVhayovLCA0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkID0gX2FbX2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5yZW5kZXJUZXh0Tm9kZShjaGlsZCwgc3R5bGVzKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9iLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9iLmxhYmVsID0gMztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2krKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShjb250YWluZXIgaW5zdGFuY2VvZiBJbWFnZUVsZW1lbnRDb250YWluZXIpKSByZXR1cm4gWzMgLypicmVhayovLCA4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9iLmxhYmVsID0gNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2IudHJ5cy5wdXNoKFs1LCA3LCAsIDhdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMub3B0aW9ucy5jYWNoZS5tYXRjaChjb250YWluZXIuc3JjKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlID0gX2Iuc2VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSZXBsYWNlZEVsZW1lbnQoY29udGFpbmVyLCBjdXJ2ZXMsIGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlXzEgPSBfYi5zZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2UodGhpcy5vcHRpb25zLmlkKS5lcnJvcihcIkVycm9yIGxvYWRpbmcgaW1hZ2UgXCIgKyBjb250YWluZXIuc3JjKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyIGluc3RhbmNlb2YgQ2FudmFzRWxlbWVudENvbnRhaW5lcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUmVwbGFjZWRFbGVtZW50KGNvbnRhaW5lciwgY3VydmVzLCBjb250YWluZXIuY2FudmFzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGNvbnRhaW5lciBpbnN0YW5jZW9mIFNWR0VsZW1lbnRDb250YWluZXIpKSByZXR1cm4gWzMgLypicmVhayovLCAxMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYi5sYWJlbCA9IDk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgOTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9iLnRyeXMucHVzaChbOSwgMTEsICwgMTJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMub3B0aW9ucy5jYWNoZS5tYXRjaChjb250YWluZXIuc3ZnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZSA9IF9iLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUmVwbGFjZWRFbGVtZW50KGNvbnRhaW5lciwgY3VydmVzLCBpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCAxMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlXzIgPSBfYi5zZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2UodGhpcy5vcHRpb25zLmlkKS5lcnJvcihcIkVycm9yIGxvYWRpbmcgc3ZnIFwiICsgY29udGFpbmVyLnN2Zy5zdWJzdHJpbmcoMCwgMjU1KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCAxMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShjb250YWluZXIgaW5zdGFuY2VvZiBJRnJhbWVFbGVtZW50Q29udGFpbmVyICYmIGNvbnRhaW5lci50cmVlKSkgcmV0dXJuIFszIC8qYnJlYWsqLywgMTRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWZyYW1lUmVuZGVyZXIgPSBuZXcgQ2FudmFzUmVuZGVyZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLm9wdGlvbnMuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGU6IHRoaXMub3B0aW9ucy5zY2FsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGNvbnRhaW5lci5iYWNrZ3JvdW5kQ29sb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFg6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsWTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogY29udGFpbmVyLndpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogY29udGFpbmVyLmhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZTogdGhpcy5vcHRpb25zLmNhY2hlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvd1dpZHRoOiBjb250YWluZXIud2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93SGVpZ2h0OiBjb250YWluZXIuaGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIGlmcmFtZVJlbmRlcmVyLnJlbmRlcihjb250YWluZXIudHJlZSldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzID0gX2Iuc2VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci53aWR0aCAmJiBjb250YWluZXIuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGNhbnZhcywgMCwgMCwgY29udGFpbmVyLndpZHRoLCBjb250YWluZXIuaGVpZ2h0LCBjb250YWluZXIuYm91bmRzLmxlZnQsIGNvbnRhaW5lci5ib3VuZHMudG9wLCBjb250YWluZXIuYm91bmRzLndpZHRoLCBjb250YWluZXIuYm91bmRzLmhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYi5sYWJlbCA9IDE0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lciBpbnN0YW5jZW9mIElucHV0RWxlbWVudENvbnRhaW5lcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemUgPSBNYXRoLm1pbihjb250YWluZXIuYm91bmRzLndpZHRoLCBjb250YWluZXIuYm91bmRzLmhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci50eXBlID09PSBDSEVDS0JPWCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyLmNoZWNrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aChbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3Rvcihjb250YWluZXIuYm91bmRzLmxlZnQgKyBzaXplICogMC4zOTM2MywgY29udGFpbmVyLmJvdW5kcy50b3AgKyBzaXplICogMC43OSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3Rvcihjb250YWluZXIuYm91bmRzLmxlZnQgKyBzaXplICogMC4xNiwgY29udGFpbmVyLmJvdW5kcy50b3AgKyBzaXplICogMC41NTQ5KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKGNvbnRhaW5lci5ib3VuZHMubGVmdCArIHNpemUgKiAwLjI3MzQ3LCBjb250YWluZXIuYm91bmRzLnRvcCArIHNpemUgKiAwLjQ0MDcxKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKGNvbnRhaW5lci5ib3VuZHMubGVmdCArIHNpemUgKiAwLjM5Njk0LCBjb250YWluZXIuYm91bmRzLnRvcCArIHNpemUgKiAwLjU2NDkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoY29udGFpbmVyLmJvdW5kcy5sZWZ0ICsgc2l6ZSAqIDAuNzI5ODMsIGNvbnRhaW5lci5ib3VuZHMudG9wICsgc2l6ZSAqIDAuMjMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoY29udGFpbmVyLmJvdW5kcy5sZWZ0ICsgc2l6ZSAqIDAuODQsIGNvbnRhaW5lci5ib3VuZHMudG9wICsgc2l6ZSAqIDAuMzQwODUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoY29udGFpbmVyLmJvdW5kcy5sZWZ0ICsgc2l6ZSAqIDAuMzkzNjMsIGNvbnRhaW5lci5ib3VuZHMudG9wICsgc2l6ZSAqIDAuNzkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGFzU3RyaW5nKElOUFVUX0NPTE9SKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjb250YWluZXIudHlwZSA9PT0gUkFESU8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5jaGVja2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhjb250YWluZXIuYm91bmRzLmxlZnQgKyBzaXplIC8gMiwgY29udGFpbmVyLmJvdW5kcy50b3AgKyBzaXplIC8gMiwgc2l6ZSAvIDQsIDAsIE1hdGguUEkgKiAyLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGFzU3RyaW5nKElOUFVUX0NPTE9SKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1RleHRJbnB1dEVsZW1lbnQoY29udGFpbmVyKSAmJiBjb250YWluZXIudmFsdWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZm9udCA9IHRoaXMuY3JlYXRlRm9udFN0eWxlKHN0eWxlcylbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gYXNTdHJpbmcoc3R5bGVzLmNvbG9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSBjYW52YXNUZXh0QWxpZ24oY29udGFpbmVyLnN0eWxlcy50ZXh0QWxpZ24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kcyA9IGNvbnRlbnRCb3goY29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNvbnRhaW5lci5zdHlsZXMudGV4dEFsaWduKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgVEVYVF9BTElHTi5DRU5URVI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICs9IGJvdW5kcy53aWR0aCAvIDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBURVhUX0FMSUdOLlJJR0hUOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCArPSBib3VuZHMud2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEJvdW5kcyA9IGJvdW5kcy5hZGQoeCwgMCwgMCwgLWJvdW5kcy5oZWlnaHQgLyAyICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aChbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWZWN0b3IoYm91bmRzLmxlZnQsIGJvdW5kcy50b3ApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoLCBib3VuZHMudG9wKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZlY3Rvcihib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCwgYm91bmRzLnRvcCArIGJvdW5kcy5oZWlnaHQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVmVjdG9yKGJvdW5kcy5sZWZ0LCBib3VuZHMudG9wICsgYm91bmRzLmhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5jbGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUZXh0V2l0aExldHRlclNwYWNpbmcobmV3IFRleHRCb3VuZHMoY29udGFpbmVyLnZhbHVlLCB0ZXh0Qm91bmRzKSwgc3R5bGVzLmxldHRlclNwYWNpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnYm90dG9tJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSAnbGVmdCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5zKGNvbnRhaW5lci5zdHlsZXMuZGlzcGxheSwgMjA0OCAvKiBMSVNUX0lURU0gKi8pKSByZXR1cm4gWzMgLypicmVhayovLCAyMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShjb250YWluZXIuc3R5bGVzLmxpc3RTdHlsZUltYWdlICE9PSBudWxsKSkgcmV0dXJuIFszIC8qYnJlYWsqLywgMTldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nID0gY29udGFpbmVyLnN0eWxlcy5saXN0U3R5bGVJbWFnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGltZy50eXBlID09PSBDU1NJbWFnZVR5cGUuVVJMKSkgcmV0dXJuIFszIC8qYnJlYWsqLywgMThdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBpbWcudXJsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2IubGFiZWwgPSAxNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxNTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9iLnRyeXMucHVzaChbMTUsIDE3LCAsIDE4XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLm9wdGlvbnMuY2FjaGUubWF0Y2godXJsKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTY6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZSA9IF9iLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShpbWFnZSwgY29udGFpbmVyLmJvdW5kcy5sZWZ0IC0gKGltYWdlLndpZHRoICsgMTApLCBjb250YWluZXIuYm91bmRzLnRvcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCAxOF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlXzMgPSBfYi5zZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2UodGhpcy5vcHRpb25zLmlkKS5lcnJvcihcIkVycm9yIGxvYWRpbmcgbGlzdC1zdHlsZS1pbWFnZSBcIiArIHVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCAxOF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTg6IHJldHVybiBbMyAvKmJyZWFrKi8sIDIwXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYWludC5saXN0VmFsdWUgJiYgY29udGFpbmVyLnN0eWxlcy5saXN0U3R5bGVUeXBlICE9PSBMSVNUX1NUWUxFX1RZUEUuTk9ORSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZvbnQgPSB0aGlzLmNyZWF0ZUZvbnRTdHlsZShzdHlsZXMpWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGFzU3RyaW5nKHN0eWxlcy5jb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHgudGV4dEFsaWduID0gJ3JpZ2h0JztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3VuZHMgPSBuZXcgQm91bmRzKGNvbnRhaW5lci5ib3VuZHMubGVmdCwgY29udGFpbmVyLmJvdW5kcy50b3AgKyBnZXRBYnNvbHV0ZVZhbHVlKGNvbnRhaW5lci5zdHlsZXMucGFkZGluZ1RvcCwgY29udGFpbmVyLmJvdW5kcy53aWR0aCksIGNvbnRhaW5lci5ib3VuZHMud2lkdGgsIGNvbXB1dGVMaW5lSGVpZ2h0KHN0eWxlcy5saW5lSGVpZ2h0LCBzdHlsZXMuZm9udFNpemUubnVtYmVyKSAvIDIgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclRleHRXaXRoTGV0dGVyU3BhY2luZyhuZXcgVGV4dEJvdW5kcyhwYWludC5saXN0VmFsdWUsIGJvdW5kcyksIHN0eWxlcy5sZXR0ZXJTcGFjaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnYm90dG9tJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSAnbGVmdCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYi5sYWJlbCA9IDIwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDIwOiByZXR1cm4gWzIgLypyZXR1cm4qL107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlclN0YWNrQ29udGVudCA9IGZ1bmN0aW9uIChzdGFjaykge1xyXG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgX2ksIF9hLCBjaGlsZCwgX2IsIF9jLCBjaGlsZCwgX2QsIF9lLCBjaGlsZCwgX2YsIF9nLCBjaGlsZCwgX2gsIF9qLCBjaGlsZCwgX2ssIF9sLCBjaGlsZCwgX20sIF9vLCBjaGlsZDtcclxuICAgICAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX3ApIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKF9wLmxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDogXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9jc3MtcG9zaXRpb24tMy8jcGFpbnRpbmctb3JkZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMS4gdGhlIGJhY2tncm91bmQgYW5kIGJvcmRlcnMgb2YgdGhlIGVsZW1lbnQgZm9ybWluZyB0aGUgc3RhY2tpbmcgY29udGV4dC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5yZW5kZXJOb2RlQmFja2dyb3VuZEFuZEJvcmRlcnMoc3RhY2suZWxlbWVudCldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLXBvc2l0aW9uLTMvI3BhaW50aW5nLW9yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAxLiB0aGUgYmFja2dyb3VuZCBhbmQgYm9yZGVycyBvZiB0aGUgZWxlbWVudCBmb3JtaW5nIHRoZSBzdGFja2luZyBjb250ZXh0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Auc2VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2kgPSAwLCBfYSA9IHN0YWNrLm5lZ2F0aXZlWkluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3AubGFiZWwgPSAyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShfaSA8IF9hLmxlbmd0aCkpIHJldHVybiBbMyAvKmJyZWFrKi8sIDVdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQgPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnJlbmRlclN0YWNrKGNoaWxkKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9wLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9wLmxhYmVsID0gNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2krKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDJdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDU6IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAzLiBGb3IgYWxsIGl0cyBpbi1mbG93LCBub24tcG9zaXRpb25lZCwgYmxvY2stbGV2ZWwgZGVzY2VuZGFudHMgaW4gdHJlZSBvcmRlcjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5yZW5kZXJOb2RlQ29udGVudChzdGFjay5lbGVtZW50KV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMuIEZvciBhbGwgaXRzIGluLWZsb3csIG5vbi1wb3NpdGlvbmVkLCBibG9jay1sZXZlbCBkZXNjZW5kYW50cyBpbiB0cmVlIG9yZGVyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Auc2VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2IgPSAwLCBfYyA9IHN0YWNrLm5vbklubGluZUxldmVsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3AubGFiZWwgPSA3O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShfYiA8IF9jLmxlbmd0aCkpIHJldHVybiBbMyAvKmJyZWFrKi8sIDEwXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkID0gX2NbX2JdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5yZW5kZXJOb2RlKGNoaWxkKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgODpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9wLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9wLmxhYmVsID0gOTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2IrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDddO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDEwOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2QgPSAwLCBfZSA9IHN0YWNrLm5vblBvc2l0aW9uZWRGbG9hdHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcC5sYWJlbCA9IDExO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDExOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoX2QgPCBfZS5sZW5ndGgpKSByZXR1cm4gWzMgLypicmVhayovLCAxNF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZCA9IF9lW19kXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMucmVuZGVyU3RhY2soY2hpbGQpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9wLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9wLmxhYmVsID0gMTM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTM6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfZCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgMTFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2YgPSAwLCBfZyA9IHN0YWNrLm5vblBvc2l0aW9uZWRJbmxpbmVMZXZlbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9wLmxhYmVsID0gMTU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShfZiA8IF9nLmxlbmd0aCkpIHJldHVybiBbMyAvKmJyZWFrKi8sIDE4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkID0gX2dbX2ZdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5yZW5kZXJTdGFjayhjaGlsZCldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE2OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Auc2VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3AubGFiZWwgPSAxNztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxNzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9mKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCAxNV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaCA9IDAsIF9qID0gc3RhY2suaW5saW5lTGV2ZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcC5sYWJlbCA9IDE5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoX2ggPCBfai5sZW5ndGgpKSByZXR1cm4gWzMgLypicmVhayovLCAyMl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZCA9IF9qW19oXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMucmVuZGVyTm9kZShjaGlsZCldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDIwOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Auc2VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3AubGFiZWwgPSAyMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9oKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCAxOV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfayA9IDAsIF9sID0gc3RhY2suemVyb09yQXV0b1pJbmRleE9yVHJhbnNmb3JtZWRPck9wYWNpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcC5sYWJlbCA9IDIzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDIzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoX2sgPCBfbC5sZW5ndGgpKSByZXR1cm4gWzMgLypicmVhayovLCAyNl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZCA9IF9sW19rXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMucmVuZGVyU3RhY2soY2hpbGQpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyNDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9wLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9wLmxhYmVsID0gMjU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaysrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgMjNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI2OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX20gPSAwLCBfbyA9IHN0YWNrLnBvc2l0aXZlWkluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3AubGFiZWwgPSAyNztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyNzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKF9tIDwgX28ubGVuZ3RoKSkgcmV0dXJuIFszIC8qYnJlYWsqLywgMzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQgPSBfb1tfbV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLnJlbmRlclN0YWNrKGNoaWxkKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcC5zZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcC5sYWJlbCA9IDI5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX20rKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDI3XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzMDogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIENhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5tYXNrID0gZnVuY3Rpb24gKHBhdGhzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oMCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNhbnZhcy53aWR0aCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKDAsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbygwLCAwKTtcclxuICAgICAgICAgICAgdGhpcy5mb3JtYXRQYXRoKHBhdGhzLnNsaWNlKDApLnJldmVyc2UoKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnBhdGggPSBmdW5jdGlvbiAocGF0aHMpIHtcclxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0UGF0aChwYXRocyk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLmZvcm1hdFBhdGggPSBmdW5jdGlvbiAocGF0aHMpIHtcclxuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAgICAgcGF0aHMuZm9yRWFjaChmdW5jdGlvbiAocG9pbnQsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBpc0JlemllckN1cnZlKHBvaW50KSA/IHBvaW50LnN0YXJ0IDogcG9pbnQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdHgubW92ZVRvKHN0YXJ0LngsIHN0YXJ0LnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3R4LmxpbmVUbyhzdGFydC54LCBzdGFydC55KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpc0JlemllckN1cnZlKHBvaW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmN0eC5iZXppZXJDdXJ2ZVRvKHBvaW50LnN0YXJ0Q29udHJvbC54LCBwb2ludC5zdGFydENvbnRyb2wueSwgcG9pbnQuZW5kQ29udHJvbC54LCBwb2ludC5lbmRDb250cm9sLnksIHBvaW50LmVuZC54LCBwb2ludC5lbmQueSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlclJlcGVhdCA9IGZ1bmN0aW9uIChwYXRoLCBwYXR0ZXJuLCBvZmZzZXRYLCBvZmZzZXRZKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGF0aChwYXRoKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gcGF0dGVybjtcclxuICAgICAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKG9mZnNldFgsIG9mZnNldFkpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSgtb2Zmc2V0WCwgLW9mZnNldFkpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlc2l6ZUltYWdlID0gZnVuY3Rpb24gKGltYWdlLCB3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGlmIChpbWFnZS53aWR0aCA9PT0gd2lkdGggJiYgaW1hZ2UuaGVpZ2h0ID09PSBoZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbWFnZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXMub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCwgMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIHJldHVybiBjYW52YXM7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYW52YXNSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyQmFja2dyb3VuZEltYWdlID0gZnVuY3Rpb24gKGNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXgsIF9sb29wXzEsIHRoaXNfMSwgX2ksIF9hLCBiYWNrZ3JvdW5kSW1hZ2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9iKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChfYi5sYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGNvbnRhaW5lci5zdHlsZXMuYmFja2dyb3VuZEltYWdlLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbG9vcF8xID0gZnVuY3Rpb24gKGJhY2tncm91bmRJbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZSwgdXJsLCBlXzQsIF9hLCBwYXRoLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBwYXR0ZXJuLCBfYiwgcGF0aCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgX2MsIGxpbmVMZW5ndGgsIHgwLCB4MSwgeTAsIHkxLCBjYW52YXMsIGN0eCwgZ3JhZGllbnRfMSwgcGF0dGVybiwgX2QsIHBhdGgsIGxlZnQsIHRvcF8xLCB3aWR0aCwgaGVpZ2h0LCBwb3NpdGlvbiwgeCwgeSwgX2UsIHJ4LCByeSwgcmFkaWFsR3JhZGllbnRfMSwgbWlkWCwgbWlkWSwgZiwgaW52RjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9mKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoX2YubGFiZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShiYWNrZ3JvdW5kSW1hZ2UudHlwZSA9PT0gQ1NTSW1hZ2VUeXBlLlVSTCkpIHJldHVybiBbMyAvKmJyZWFrKi8sIDVdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGJhY2tncm91bmRJbWFnZS51cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2YubGFiZWwgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9mLnRyeXMucHVzaChbMSwgMywgLCA0XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpc18xLm9wdGlvbnMuY2FjaGUubWF0Y2godXJsKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UgPSBfZi5zZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZV80ID0gX2Yuc2VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIExvZ2dlci5nZXRJbnN0YW5jZSh0aGlzXzEub3B0aW9ucy5pZCkuZXJyb3IoXCJFcnJvciBsb2FkaW5nIGJhY2tncm91bmQtaW1hZ2UgXCIgKyB1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYSA9IGNhbGN1bGF0ZUJhY2tncm91bmRSZW5kZXJpbmcoY29udGFpbmVyLCBpbmRleCwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uud2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS53aWR0aCAvIGltYWdlLmhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgcGF0aCA9IF9hWzBdLCB4ID0gX2FbMV0sIHkgPSBfYVsyXSwgd2lkdGggPSBfYVszXSwgaGVpZ2h0ID0gX2FbNF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm4gPSB0aGlzXzEuY3R4LmNyZWF0ZVBhdHRlcm4odGhpc18xLnJlc2l6ZUltYWdlKGltYWdlLCB3aWR0aCwgaGVpZ2h0KSwgJ3JlcGVhdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEucmVuZGVyUmVwZWF0KHBhdGgsIHBhdHRlcm4sIHgsIHkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA2XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNMaW5lYXJHcmFkaWVudChiYWNrZ3JvdW5kSW1hZ2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9iID0gY2FsY3VsYXRlQmFja2dyb3VuZFJlbmRlcmluZyhjb250YWluZXIsIGluZGV4LCBbbnVsbCwgbnVsbCwgbnVsbF0pLCBwYXRoID0gX2JbMF0sIHggPSBfYlsxXSwgeSA9IF9iWzJdLCB3aWR0aCA9IF9iWzNdLCBoZWlnaHQgPSBfYls0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2MgPSBjYWxjdWxhdGVHcmFkaWVudERpcmVjdGlvbihiYWNrZ3JvdW5kSW1hZ2UuYW5nbGUsIHdpZHRoLCBoZWlnaHQpLCBsaW5lTGVuZ3RoID0gX2NbMF0sIHgwID0gX2NbMV0sIHgxID0gX2NbMl0sIHkwID0gX2NbM10sIHkxID0gX2NbNF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50XzEgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoeDAsIHkwLCB4MSwgeTEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzQ29sb3JTdG9wcyhiYWNrZ3JvdW5kSW1hZ2Uuc3RvcHMsIGxpbmVMZW5ndGgpLmZvckVhY2goZnVuY3Rpb24gKGNvbG9yU3RvcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdyYWRpZW50XzEuYWRkQ29sb3JTdG9wKGNvbG9yU3RvcC5zdG9wLCBhc1N0cmluZyhjb2xvclN0b3AuY29sb3IpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBncmFkaWVudF8xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aWR0aCA+IDAgJiYgaGVpZ2h0ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybiA9IHRoaXNfMS5jdHguY3JlYXRlUGF0dGVybihjYW52YXMsICdyZXBlYXQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNfMS5yZW5kZXJSZXBlYXQocGF0aCwgcGF0dGVybiwgeCwgeSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNSYWRpYWxHcmFkaWVudChiYWNrZ3JvdW5kSW1hZ2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9kID0gY2FsY3VsYXRlQmFja2dyb3VuZFJlbmRlcmluZyhjb250YWluZXIsIGluZGV4LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIHBhdGggPSBfZFswXSwgbGVmdCA9IF9kWzFdLCB0b3BfMSA9IF9kWzJdLCB3aWR0aCA9IF9kWzNdLCBoZWlnaHQgPSBfZFs0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gPSBiYWNrZ3JvdW5kSW1hZ2UucG9zaXRpb24ubGVuZ3RoID09PSAwID8gW0ZJRlRZX1BFUkNFTlRdIDogYmFja2dyb3VuZEltYWdlLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ID0gZ2V0QWJzb2x1dGVWYWx1ZShwb3NpdGlvblswXSwgd2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0gZ2V0QWJzb2x1dGVWYWx1ZShwb3NpdGlvbltwb3NpdGlvbi5sZW5ndGggLSAxXSwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2UgPSBjYWxjdWxhdGVSYWRpdXMoYmFja2dyb3VuZEltYWdlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSwgcnggPSBfZVswXSwgcnkgPSBfZVsxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ4ID4gMCAmJiByeCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlhbEdyYWRpZW50XzEgPSB0aGlzXzEuY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KGxlZnQgKyB4LCB0b3BfMSArIHksIDAsIGxlZnQgKyB4LCB0b3BfMSArIHksIHJ4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NDb2xvclN0b3BzKGJhY2tncm91bmRJbWFnZS5zdG9wcywgcnggKiAyKS5mb3JFYWNoKGZ1bmN0aW9uIChjb2xvclN0b3ApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmFkaWFsR3JhZGllbnRfMS5hZGRDb2xvclN0b3AoY29sb3JTdG9wLnN0b3AsIGFzU3RyaW5nKGNvbG9yU3RvcC5jb2xvcikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEucGF0aChwYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNfMS5jdHguZmlsbFN0eWxlID0gcmFkaWFsR3JhZGllbnRfMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyeCAhPT0gcnkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWRYID0gY29udGFpbmVyLmJvdW5kcy5sZWZ0ICsgMC41ICogY29udGFpbmVyLmJvdW5kcy53aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWRZID0gY29udGFpbmVyLmJvdW5kcy50b3AgKyAwLjUgKiBjb250YWluZXIuYm91bmRzLmhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmID0gcnkgLyByeDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZGID0gMSAvIGY7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLmN0eC50cmFuc2xhdGUobWlkWCwgbWlkWSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLmN0eC50cmFuc2Zvcm0oMSwgMCwgMCwgZiwgMCwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLmN0eC50cmFuc2xhdGUoLW1pZFgsIC1taWRZKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEuY3R4LmZpbGxSZWN0KGxlZnQsIGludkYgKiAodG9wXzEgLSBtaWRZKSArIG1pZFksIHdpZHRoLCBoZWlnaHQgKiBpbnZGKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEuY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNfMS5jdHguZmlsbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9mLmxhYmVsID0gNjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleC0tO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNfMSA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaSA9IDAsIF9hID0gY29udGFpbmVyLnN0eWxlcy5iYWNrZ3JvdW5kSW1hZ2Uuc2xpY2UoMCkucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2IubGFiZWwgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShfaSA8IF9hLmxlbmd0aCkpIHJldHVybiBbMyAvKmJyZWFrKi8sIDRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlID0gX2FbX2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs1IC8qeWllbGQqKi8sIF9sb29wXzEoYmFja2dyb3VuZEltYWdlKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9iLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9iLmxhYmVsID0gMztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2krKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6IHJldHVybiBbMiAvKnJldHVybiovXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBDYW52YXNSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyQm9yZGVyID0gZnVuY3Rpb24gKGNvbG9yLCBzaWRlLCBjdXJ2ZVBvaW50cykge1xyXG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXRoKHBhcnNlUGF0aEZvckJvcmRlcihjdXJ2ZVBvaW50cywgc2lkZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGFzU3RyaW5nKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlck5vZGVCYWNrZ3JvdW5kQW5kQm9yZGVycyA9IGZ1bmN0aW9uIChwYWludCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGVzLCBoYXNCYWNrZ3JvdW5kLCBib3JkZXJzLCBiYWNrZ3JvdW5kUGFpbnRpbmdBcmVhLCBzaWRlLCBfaSwgYm9yZGVyc18xLCBib3JkZXI7XHJcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseUVmZmVjdHMocGFpbnQuZWZmZWN0cywgMiAvKiBCQUNLR1JPVU5EX0JPUkRFUlMgKi8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzID0gcGFpbnQuY29udGFpbmVyLnN0eWxlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0JhY2tncm91bmQgPSAhaXNUcmFuc3BhcmVudChzdHlsZXMuYmFja2dyb3VuZENvbG9yKSB8fCBzdHlsZXMuYmFja2dyb3VuZEltYWdlLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcnMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLmJvcmRlclRvcFN0eWxlLCBjb2xvcjogc3R5bGVzLmJvcmRlclRvcENvbG9yIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLmJvcmRlclJpZ2h0U3R5bGUsIGNvbG9yOiBzdHlsZXMuYm9yZGVyUmlnaHRDb2xvciB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5ib3JkZXJCb3R0b21TdHlsZSwgY29sb3I6IHN0eWxlcy5ib3JkZXJCb3R0b21Db2xvciB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5ib3JkZXJMZWZ0U3R5bGUsIGNvbG9yOiBzdHlsZXMuYm9yZGVyTGVmdENvbG9yIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kUGFpbnRpbmdBcmVhID0gY2FsY3VsYXRlQmFja2dyb3VuZEN1cnZlZFBhaW50aW5nQXJlYShnZXRCYWNrZ3JvdW5kVmFsdWVGb3JJbmRleChzdHlsZXMuYmFja2dyb3VuZENsaXAsIDApLCBwYWludC5jdXJ2ZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoaGFzQmFja2dyb3VuZCB8fCBzdHlsZXMuYm94U2hhZG93Lmxlbmd0aCkpIHJldHVybiBbMyAvKmJyZWFrKi8sIDJdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXRoKGJhY2tncm91bmRQYWludGluZ0FyZWEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguY2xpcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1RyYW5zcGFyZW50KHN0eWxlcy5iYWNrZ3JvdW5kQ29sb3IpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gYXNTdHJpbmcoc3R5bGVzLmJhY2tncm91bmRDb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5yZW5kZXJCYWNrZ3JvdW5kSW1hZ2UocGFpbnQuY29udGFpbmVyKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlcy5ib3hTaGFkb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmV2ZXJzZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKHNoYWRvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGJvcmRlckJveEFyZWEgPSBjYWxjdWxhdGVCb3JkZXJCb3hQYXRoKHBhaW50LmN1cnZlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hc2tPZmZzZXQgPSBzaGFkb3cuaW5zZXQgPyAwIDogTUFTS19PRkZTRVQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNoYWRvd1BhaW50aW5nQXJlYSA9IHRyYW5zZm9ybVBhdGgoYm9yZGVyQm94QXJlYSwgLW1hc2tPZmZzZXQgKyAoc2hhZG93Lmluc2V0ID8gMSA6IC0xKSAqIHNoYWRvdy5zcHJlYWQubnVtYmVyLCAoc2hhZG93Lmluc2V0ID8gMSA6IC0xKSAqIHNoYWRvdy5zcHJlYWQubnVtYmVyLCBzaGFkb3cuc3ByZWFkLm51bWJlciAqIChzaGFkb3cuaW5zZXQgPyAtMiA6IDIpLCBzaGFkb3cuc3ByZWFkLm51bWJlciAqIChzaGFkb3cuaW5zZXQgPyAtMiA6IDIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2hhZG93Lmluc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnBhdGgoYm9yZGVyQm94QXJlYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmN0eC5jbGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1hc2soc2hhZG93UGFpbnRpbmdBcmVhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1hc2soYm9yZGVyQm94QXJlYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmN0eC5jbGlwKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnBhdGgoc2hhZG93UGFpbnRpbmdBcmVhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3R4LnNoYWRvd09mZnNldFggPSBzaGFkb3cub2Zmc2V0WC5udW1iZXIgKyBtYXNrT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmN0eC5zaGFkb3dPZmZzZXRZID0gc2hhZG93Lm9mZnNldFkubnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmN0eC5zaGFkb3dDb2xvciA9IGFzU3RyaW5nKHNoYWRvdy5jb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3R4LnNoYWRvd0JsdXIgPSBzaGFkb3cuYmx1ci5udW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3R4LmZpbGxTdHlsZSA9IHNoYWRvdy5pbnNldCA/IGFzU3RyaW5nKHNoYWRvdy5jb2xvcikgOiAncmdiYSgwLDAsMCwxKSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdHgucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYS5sYWJlbCA9IDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2kgPSAwLCBib3JkZXJzXzEgPSBib3JkZXJzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2EubGFiZWwgPSAzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShfaSA8IGJvcmRlcnNfMS5sZW5ndGgpKSByZXR1cm4gWzMgLypicmVhayovLCA3XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlciA9IGJvcmRlcnNfMVtfaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShib3JkZXIuc3R5bGUgIT09IEJPUkRFUl9TVFlMRS5OT05FICYmICFpc1RyYW5zcGFyZW50KGJvcmRlci5jb2xvcikpKSByZXR1cm4gWzMgLypicmVhayovLCA1XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMucmVuZGVyQm9yZGVyKGJvcmRlci5jb2xvciwgc2lkZSwgcGFpbnQuY3VydmVzKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hLmxhYmVsID0gNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2EubGFiZWwgPSA2O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgM107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNzogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIENhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RhY2s7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2tncm91bmRDb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGFzU3RyaW5nKHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHRoaXMub3B0aW9ucy54IC0gdGhpcy5vcHRpb25zLnNjcm9sbFgsIHRoaXMub3B0aW9ucy55IC0gdGhpcy5vcHRpb25zLnNjcm9sbFksIHRoaXMub3B0aW9ucy53aWR0aCwgdGhpcy5vcHRpb25zLmhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjayA9IHBhcnNlU3RhY2tpbmdDb250ZXh0cyhlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMucmVuZGVyU3RhY2soc3RhY2spXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2Euc2VudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseUVmZmVjdHMoW10sIDIgLyogQkFDS0dST1VORF9CT1JERVJTICovKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCB0aGlzLmNhbnZhc107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIENhbnZhc1JlbmRlcmVyO1xyXG4gICAgfSgpKTtcclxuICAgIHZhciBpc1RleHRJbnB1dEVsZW1lbnQgPSBmdW5jdGlvbiAoY29udGFpbmVyKSB7XHJcbiAgICAgICAgaWYgKGNvbnRhaW5lciBpbnN0YW5jZW9mIFRleHRhcmVhRWxlbWVudENvbnRhaW5lcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY29udGFpbmVyIGluc3RhbmNlb2YgU2VsZWN0RWxlbWVudENvbnRhaW5lcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY29udGFpbmVyIGluc3RhbmNlb2YgSW5wdXRFbGVtZW50Q29udGFpbmVyICYmIGNvbnRhaW5lci50eXBlICE9PSBSQURJTyAmJiBjb250YWluZXIudHlwZSAhPT0gQ0hFQ0tCT1gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICB2YXIgY2FsY3VsYXRlQmFja2dyb3VuZEN1cnZlZFBhaW50aW5nQXJlYSA9IGZ1bmN0aW9uIChjbGlwLCBjdXJ2ZXMpIHtcclxuICAgICAgICBzd2l0Y2ggKGNsaXApIHtcclxuICAgICAgICAgICAgY2FzZSBCQUNLR1JPVU5EX0NMSVAuQk9SREVSX0JPWDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBjYWxjdWxhdGVCb3JkZXJCb3hQYXRoKGN1cnZlcyk7XHJcbiAgICAgICAgICAgIGNhc2UgQkFDS0dST1VORF9DTElQLkNPTlRFTlRfQk9YOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGN1bGF0ZUNvbnRlbnRCb3hQYXRoKGN1cnZlcyk7XHJcbiAgICAgICAgICAgIGNhc2UgQkFDS0dST1VORF9DTElQLlBBRERJTkdfQk9YOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGN1bGF0ZVBhZGRpbmdCb3hQYXRoKGN1cnZlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHZhciBjYW52YXNUZXh0QWxpZ24gPSBmdW5jdGlvbiAodGV4dEFsaWduKSB7XHJcbiAgICAgICAgc3dpdGNoICh0ZXh0QWxpZ24pIHtcclxuICAgICAgICAgICAgY2FzZSBURVhUX0FMSUdOLkNFTlRFUjpcclxuICAgICAgICAgICAgICAgIHJldHVybiAnY2VudGVyJztcclxuICAgICAgICAgICAgY2FzZSBURVhUX0FMSUdOLlJJR0hUOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdyaWdodCc7XHJcbiAgICAgICAgICAgIGNhc2UgVEVYVF9BTElHTi5MRUZUOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdsZWZ0JztcclxuICAgICAgICB9XHJcbiAgICB9O1xuXG4gICAgdmFyIEZvcmVpZ25PYmplY3RSZW5kZXJlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmdW5jdGlvbiBGb3JlaWduT2JqZWN0UmVuZGVyZXIob3B0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcyA9IG9wdGlvbnMuY2FudmFzID8gb3B0aW9ucy5jYW52YXMgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IE1hdGguZmxvb3Iob3B0aW9ucy53aWR0aCAqIG9wdGlvbnMuc2NhbGUpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBNYXRoLmZsb29yKG9wdGlvbnMuaGVpZ2h0ICogb3B0aW9ucy5zY2FsZSk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gb3B0aW9ucy53aWR0aCArIFwicHhcIjtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgKyBcInB4XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LnNjYWxlKHRoaXMub3B0aW9ucy5zY2FsZSwgdGhpcy5vcHRpb25zLnNjYWxlKTtcclxuICAgICAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKC1vcHRpb25zLnggKyBvcHRpb25zLnNjcm9sbFgsIC1vcHRpb25zLnkgKyBvcHRpb25zLnNjcm9sbFkpO1xyXG4gICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2Uob3B0aW9ucy5pZCkuZGVidWcoXCJFWFBFUklNRU5UQUwgRm9yZWlnbk9iamVjdCByZW5kZXJlciBpbml0aWFsaXplZCAoXCIgKyBvcHRpb25zLndpZHRoICsgXCJ4XCIgKyBvcHRpb25zLmhlaWdodCArIFwiIGF0IFwiICsgb3B0aW9ucy54ICsgXCIsXCIgKyBvcHRpb25zLnkgKyBcIikgd2l0aCBzY2FsZSBcIiArIG9wdGlvbnMuc2NhbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBGb3JlaWduT2JqZWN0UmVuZGVyZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdmcsIGltZztcclxuICAgICAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2ZyA9IGNyZWF0ZUZvcmVpZ25PYmplY3RTVkcoTWF0aC5tYXgodGhpcy5vcHRpb25zLndpbmRvd1dpZHRoLCB0aGlzLm9wdGlvbnMud2lkdGgpICogdGhpcy5vcHRpb25zLnNjYWxlLCBNYXRoLm1heCh0aGlzLm9wdGlvbnMud2luZG93SGVpZ2h0LCB0aGlzLm9wdGlvbnMuaGVpZ2h0KSAqIHRoaXMub3B0aW9ucy5zY2FsZSwgdGhpcy5vcHRpb25zLnNjcm9sbFggKiB0aGlzLm9wdGlvbnMuc2NhbGUsIHRoaXMub3B0aW9ucy5zY3JvbGxZICogdGhpcy5vcHRpb25zLnNjYWxlLCBlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIGxvYWRTZXJpYWxpemVkU1ZHJDEoc3ZnKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZyA9IF9hLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja2dyb3VuZENvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gYXNTdHJpbmcodGhpcy5vcHRpb25zLmJhY2tncm91bmRDb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5vcHRpb25zLndpZHRoICogdGhpcy5vcHRpb25zLnNjYWxlLCB0aGlzLm9wdGlvbnMuaGVpZ2h0ICogdGhpcy5vcHRpb25zLnNjYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShpbWcsIC10aGlzLm9wdGlvbnMueCAqIHRoaXMub3B0aW9ucy5zY2FsZSwgLXRoaXMub3B0aW9ucy55ICogdGhpcy5vcHRpb25zLnNjYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCB0aGlzLmNhbnZhc107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIEZvcmVpZ25PYmplY3RSZW5kZXJlcjtcclxuICAgIH0oKSk7XHJcbiAgICB2YXIgbG9hZFNlcmlhbGl6ZWRTVkckMSA9IGZ1bmN0aW9uIChzdmcpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGltZyk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gcmVqZWN0O1xyXG4gICAgICAgICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudChuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKHN2ZykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcblxuICAgIHZhciBfdGhpcyA9IHVuZGVmaW5lZDtcclxuICAgIHZhciBwYXJzZUNvbG9yJDEgPSBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIGNvbG9yLnBhcnNlKFBhcnNlci5jcmVhdGUodmFsdWUpLnBhcnNlQ29tcG9uZW50VmFsdWUoKSk7IH07XHJcbiAgICB2YXIgaHRtbDJjYW52YXMgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XHJcbiAgICAgICAgcmV0dXJuIHJlbmRlckVsZW1lbnQoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgICB9O1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgQ2FjaGVTdG9yYWdlLnNldENvbnRleHQod2luZG93KTtcclxuICAgIH1cclxuICAgIHZhciByZW5kZXJFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdHMpIHsgcmV0dXJuIF9fYXdhaXRlcihfdGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3duZXJEb2N1bWVudCwgZGVmYXVsdFZpZXcsIGluc3RhbmNlTmFtZSwgX2EsIHdpZHRoLCBoZWlnaHQsIGxlZnQsIHRvcCwgZGVmYXVsdFJlc291cmNlT3B0aW9ucywgcmVzb3VyY2VPcHRpb25zLCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgd2luZG93Qm91bmRzLCBkb2N1bWVudENsb25lciwgY2xvbmVkRWxlbWVudCwgY29udGFpbmVyLCBkb2N1bWVudEJhY2tncm91bmRDb2xvciwgYm9keUJhY2tncm91bmRDb2xvciwgYmdDb2xvciwgZGVmYXVsdEJhY2tncm91bmRDb2xvciwgYmFja2dyb3VuZENvbG9yLCByZW5kZXJPcHRpb25zLCBjYW52YXMsIHJlbmRlcmVyLCByb290LCByZW5kZXJlcjtcclxuICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9iKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoX2IubGFiZWwpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICBvd25lckRvY3VtZW50ID0gZWxlbWVudC5vd25lckRvY3VtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghb3duZXJEb2N1bWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IGlzIG5vdCBhdHRhY2hlZCB0byBhIERvY3VtZW50XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VmlldyA9IG93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkZWZhdWx0Vmlldykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEb2N1bWVudCBpcyBub3QgYXR0YWNoZWQgdG8gYSBXaW5kb3dcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlTmFtZSA9IChNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwKSArIERhdGUubm93KCkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICAgICAgICAgICAgICBfYSA9IGlzQm9keUVsZW1lbnQoZWxlbWVudCkgfHwgaXNIVE1MRWxlbWVudChlbGVtZW50KSA/IHBhcnNlRG9jdW1lbnRTaXplKG93bmVyRG9jdW1lbnQpIDogcGFyc2VCb3VuZHMoZWxlbWVudCksIHdpZHRoID0gX2Eud2lkdGgsIGhlaWdodCA9IF9hLmhlaWdodCwgbGVmdCA9IF9hLmxlZnQsIHRvcCA9IF9hLnRvcDtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0UmVzb3VyY2VPcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxvd1RhaW50OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VUaW1lb3V0OiAxNTAwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJveHk6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlQ09SUzogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlT3B0aW9ucyA9IF9fYXNzaWduKHt9LCBkZWZhdWx0UmVzb3VyY2VPcHRpb25zLCBvcHRzKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlOiBvcHRzLmNhY2hlID8gb3B0cy5jYWNoZSA6IENhY2hlU3RvcmFnZS5jcmVhdGUoaW5zdGFuY2VOYW1lLCByZXNvdXJjZU9wdGlvbnMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnaW5nOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVDb250YWluZXI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmVpZ25PYmplY3RSZW5kZXJpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZTogZGVmYXVsdFZpZXcuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dXaWR0aDogZGVmYXVsdFZpZXcuaW5uZXJXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93SGVpZ2h0OiBkZWZhdWx0Vmlldy5pbm5lckhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsWDogZGVmYXVsdFZpZXcucGFnZVhPZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFk6IGRlZmF1bHRWaWV3LnBhZ2VZT2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBsZWZ0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB0b3AsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBNYXRoLmNlaWwod2lkdGgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IE1hdGguY2VpbChoZWlnaHQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogaW5zdGFuY2VOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zID0gX19hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCByZXNvdXJjZU9wdGlvbnMsIG9wdHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvd0JvdW5kcyA9IG5ldyBCb3VuZHMob3B0aW9ucy5zY3JvbGxYLCBvcHRpb25zLnNjcm9sbFksIG9wdGlvbnMud2luZG93V2lkdGgsIG9wdGlvbnMud2luZG93SGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuY3JlYXRlKHsgaWQ6IGluc3RhbmNlTmFtZSwgZW5hYmxlZDogb3B0aW9ucy5sb2dnaW5nIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5nZXRJbnN0YW5jZShpbnN0YW5jZU5hbWUpLmRlYnVnKFwiU3RhcnRpbmcgZG9jdW1lbnQgY2xvbmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnRDbG9uZXIgPSBuZXcgRG9jdW1lbnRDbG9uZXIoZWxlbWVudCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogaW5zdGFuY2VOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsb25lOiBvcHRpb25zLm9uY2xvbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlnbm9yZUVsZW1lbnRzOiBvcHRpb25zLmlnbm9yZUVsZW1lbnRzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmxpbmVJbWFnZXM6IG9wdGlvbnMuZm9yZWlnbk9iamVjdFJlbmRlcmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29weVN0eWxlczogb3B0aW9ucy5mb3JlaWduT2JqZWN0UmVuZGVyaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvbmVkRWxlbWVudCA9IGRvY3VtZW50Q2xvbmVyLmNsb25lZFJlZmVyZW5jZUVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbG9uZWRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCBQcm9taXNlLnJlamVjdChcIlVuYWJsZSB0byBmaW5kIGVsZW1lbnQgaW4gY2xvbmVkIGlmcmFtZVwiKV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIGRvY3VtZW50Q2xvbmVyLnRvSUZyYW1lKG93bmVyRG9jdW1lbnQsIHdpbmRvd0JvdW5kcyldO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IF9iLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudEJhY2tncm91bmRDb2xvciA9IG93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcGFyc2VDb2xvciQxKGdldENvbXB1dGVkU3R5bGUob3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmJhY2tncm91bmRDb2xvcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBDT0xPUlMuVFJBTlNQQVJFTlQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9keUJhY2tncm91bmRDb2xvciA9IG93bmVyRG9jdW1lbnQuYm9keVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHBhcnNlQ29sb3IkMShnZXRDb21wdXRlZFN0eWxlKG93bmVyRG9jdW1lbnQuYm9keSkuYmFja2dyb3VuZENvbG9yKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IENPTE9SUy5UUkFOU1BBUkVOVDtcclxuICAgICAgICAgICAgICAgICAgICBiZ0NvbG9yID0gb3B0cy5iYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdEJhY2tncm91bmRDb2xvciA9IHR5cGVvZiBiZ0NvbG9yID09PSAnc3RyaW5nJyA/IHBhcnNlQ29sb3IkMShiZ0NvbG9yKSA6IGJnQ29sb3IgPT09IG51bGwgPyBDT0xPUlMuVFJBTlNQQVJFTlQgOiAweGZmZmZmZmZmO1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvciA9IGVsZW1lbnQgPT09IG93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gaXNUcmFuc3BhcmVudChkb2N1bWVudEJhY2tncm91bmRDb2xvcilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gaXNUcmFuc3BhcmVudChib2R5QmFja2dyb3VuZENvbG9yKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZGVmYXVsdEJhY2tncm91bmRDb2xvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYm9keUJhY2tncm91bmRDb2xvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBkb2N1bWVudEJhY2tncm91bmRDb2xvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGRlZmF1bHRCYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGluc3RhbmNlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGU6IG9wdGlvbnMuY2FjaGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhczogb3B0aW9ucy5jYW52YXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYmFja2dyb3VuZENvbG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2FsZTogb3B0aW9ucy5zY2FsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeDogb3B0aW9ucy54LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBvcHRpb25zLnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFg6IG9wdGlvbnMuc2Nyb2xsWCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsWTogb3B0aW9ucy5zY3JvbGxZLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogb3B0aW9ucy53aWR0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBvcHRpb25zLmhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93V2lkdGg6IG9wdGlvbnMud2luZG93V2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvd0hlaWdodDogb3B0aW9ucy53aW5kb3dIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5mb3JlaWduT2JqZWN0UmVuZGVyaW5nKSByZXR1cm4gWzMgLypicmVhayovLCAzXTtcclxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2UoaW5zdGFuY2VOYW1lKS5kZWJ1ZyhcIkRvY3VtZW50IGNsb25lZCwgdXNpbmcgZm9yZWlnbiBvYmplY3QgcmVuZGVyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVyID0gbmV3IEZvcmVpZ25PYmplY3RSZW5kZXJlcihyZW5kZXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCByZW5kZXJlci5yZW5kZXIoY2xvbmVkRWxlbWVudCldO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcyA9IF9iLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA1XTtcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2UoaW5zdGFuY2VOYW1lKS5kZWJ1ZyhcIkRvY3VtZW50IGNsb25lZCwgdXNpbmcgY29tcHV0ZWQgcmVuZGVyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIENhY2hlU3RvcmFnZS5hdHRhY2hJbnN0YW5jZShvcHRpb25zLmNhY2hlKTtcclxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2UoaW5zdGFuY2VOYW1lKS5kZWJ1ZyhcIlN0YXJ0aW5nIERPTSBwYXJzaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJvb3QgPSBwYXJzZVRyZWUoY2xvbmVkRWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2FjaGVTdG9yYWdlLmRldGFjaEluc3RhbmNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhY2tncm91bmRDb2xvciA9PT0gcm9vdC5zdHlsZXMuYmFja2dyb3VuZENvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3Quc3R5bGVzLmJhY2tncm91bmRDb2xvciA9IENPTE9SUy5UUkFOU1BBUkVOVDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgTG9nZ2VyLmdldEluc3RhbmNlKGluc3RhbmNlTmFtZSkuZGVidWcoXCJTdGFydGluZyByZW5kZXJlclwiKTtcclxuICAgICAgICAgICAgICAgICAgICByZW5kZXJlciA9IG5ldyBDYW52YXNSZW5kZXJlcihyZW5kZXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCByZW5kZXJlci5yZW5kZXIocm9vdCldO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcyA9IF9iLnNlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBfYi5sYWJlbCA9IDU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucmVtb3ZlQ29udGFpbmVyID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghRG9jdW1lbnRDbG9uZXIuZGVzdHJveShjb250YWluZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZ2V0SW5zdGFuY2UoaW5zdGFuY2VOYW1lKS5lcnJvcihcIkNhbm5vdCBkZXRhY2ggY2xvbmVkIGlmcmFtZSBhcyBpdCBpcyBub3QgaW4gdGhlIERPTSBhbnltb3JlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5nZXRJbnN0YW5jZShpbnN0YW5jZU5hbWUpLmRlYnVnKFwiRmluaXNoZWQgcmVuZGVyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5kZXN0cm95KGluc3RhbmNlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgQ2FjaGVTdG9yYWdlLmRlc3Ryb3koaW5zdGFuY2VOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgY2FudmFzXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7IH07XG5cbiAgICByZXR1cm4gaHRtbDJjYW52YXM7XG5cbn0pKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0bWwyY2FudmFzLmpzLm1hcFxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvaHRtbDJjYW52YXMvZGlzdC9odG1sMmNhbnZhcy5qc1xuLy8gbW9kdWxlIGlkID0gMjA4N1xuLy8gbW9kdWxlIGNodW5rcyA9IDIiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QSIsInNvdXJjZVJvb3QiOiIifQ==