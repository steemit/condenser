/*global describe, it, before, beforeEach, after, afterEach */

import chai, { expect } from 'chai';
import sanitizeConfig from './SanitizeConfig';

const actual = sanitizeConfig({
    large: true,
    highQualityPost: true,
    noImage: false,
    sanitizeErrors: [],
});

describe('SanitizeConfig', () => {
    it('should have the expected allowed schemes', () => {
        const expected = [
            'http',
            'https',
            'steem'
        ];
        expect(expected).to.deep.equal(actual.allowedSchemes);
    });
});
