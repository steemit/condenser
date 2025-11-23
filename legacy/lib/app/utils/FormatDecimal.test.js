'use strict';

var _ParsersAndFormatters = require('./ParsersAndFormatters');

describe('formatDecimal', function () {
    it('should format decimals', function () {
        var test_cases = [[100.0, '100.00'], [101, '101.00'], ['102', '102.00'], [1000.12, '1,000.12'], [100000, '100,000.00'], [1000000000000.0, '1,000,000,000,000.00'], [-1000, '-1,000.00'], [501695.505, '501,695.51'], [5.0, '5.00'], [5, '5.00']];
        test_cases.forEach(function (v) {
            expect((0, _ParsersAndFormatters.formatDecimal)(v[0]).join('')).toBe(v[1]);
        });
    });
});