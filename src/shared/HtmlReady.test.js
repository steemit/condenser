/* eslint no-undef:0 no-unused-vars:0 */
/* global describe, it, before, beforeEach, after, afterEach */
import chai, { expect } from 'chai';

import HtmlReady from './HtmlReady';

describe('htmlready', () => {
    it('should return plain text without html unmolested', () => {
        const teststring = 'teststring lol';
        expect(HtmlReady(teststring).html).to.equal(teststring);
    });

    it('should allow links where the text portion and href contains steemit.com', () => {
        const dirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        const res = HtmlReady(dirty).html
        expect(res).to.equal(dirty);
    });

    it('should not allow links where the text portion contains steemit.com but the link does not', () => {
        const dirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        const cleansed = '<xml xmlns="http://www.w3.org/1999/xhtml"><span class="phishy">https://steamit.com/signup</span></xml>';
        const res = HtmlReady(dirty).html
        expect(res).to.equal(cleansed);
    });
});