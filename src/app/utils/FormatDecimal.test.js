import { formatDecimal } from './ParsersAndFormatters';

describe('formatDecimal', () => {
    it('should format decimals', () => {
        const test_cases = [
            [100.0, '100.00'],
            [101, '101.00'],
            ['102', '102.00'],
            [1000.12, '1,000.12'],
            [100000, '100,000.00'],
            [1000000000000.0, '1,000,000,000,000.00'],
            [-1000, '-1,000.00'],
        ];
        test_cases.forEach(v => {
            expect(formatDecimal(v[0]).join('')).toBe(v[1]);
        });
    });
});
