/* eslint no-undef:0 no-unused-vars:0 */
/* global describe, it, before, beforeEach, after, afterEach */
import chai, { expect } from 'chai';

import HtmlReady from './HtmlReady';

describe('htmlready', () => {
    before(() => {
        global.$STM_Config = {};
    });

    it('should return plain text without html unmolested', () => {
        const teststring = 'teststring lol';
        expect(HtmlReady(teststring).html).to.equal(teststring);
    });

    it('should allow links where the text portion and href contains steemit.com', () => {
        const dirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        const res = HtmlReady(dirty).html;
        expect(res).to.equal(dirty);
    });

    it('should not allow links where the text portion contains steemit.com but the link does not', () => {
        // There isn't an easy way to mock counterpart, even with proxyquire, so we just test for the missing translation message -- ugly but ok

        const dirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        const cleansed = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com/signup / https://steamit.com/signup</div></xml>';
        const res = HtmlReady(dirty).html;
        expect(res).to.equal(cleansed);

        const withuser = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://official@steemit.com/signup</a></xml>';
        const cleansedwithuser = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://official@steemit.com/signup / https://steamit.com/signup</div></xml>';
        const reswithuser = HtmlReady(withuser).html;
        expect(reswithuser).to.equal(cleansedwithuser);

        const noendingslash = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com</a></xml>';
        const cleansednoendingslash = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com / https://steamit.com</div></xml>';
        const resnoendingslash = HtmlReady(noendingslash).html;
        expect(resnoendingslash).to.equal(cleansednoendingslash);
    });

    it('should allow more than one link per post', () => {
        const somanylinks = '<xml xmlns="http://www.w3.org/1999/xhtml">https://foo.com and https://blah.com</xml>';
        const htmlified = '<xml xmlns="http://www.w3.org/1999/xhtml"><span><a href="https://foo.com">https://foo.com</a> and <a href="https://blah.com">https://blah.com</a></span></xml>';
        const res = HtmlReady(somanylinks).html;
        expect(res).to.equal(htmlified);
    })
});
