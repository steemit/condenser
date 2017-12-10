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
        const dirty =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        const res = HtmlReady(dirty).html;
        expect(res).to.equal(dirty);
    });

    it('should allow in-page links ', () => {
        const dirty =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="#some-link" xmlns="http://www.w3.org/1999/xhtml">a link location</a></xml>';
        const res = HtmlReady(dirty).html;
        expect(res).to.equal(dirty);

        const externalDomainDirty =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://anotherwebsite.com/apples#some-link" xmlns="http://www.w3.org/1999/xhtml">Another website\'s apple section</a></xml>';
        const externalDomainResult = HtmlReady(externalDomainDirty).html;
        expect(externalDomainResult).to.equal(externalDomainDirty);
    });

    it('should not allow links where the text portion contains steemit.com but the link does not', () => {
        // There isn't an easy way to mock counterpart, even with proxyquire, so we just test for the missing translation message -- ugly but ok

        const dirty =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        const cleansed =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com/signup / https://steamit.com/signup</div></xml>';
        const res = HtmlReady(dirty).html;
        expect(res).to.equal(cleansed);

        const withuser =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://official@steemit.com/signup</a></xml>';
        const cleansedwithuser =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://official@steemit.com/signup / https://steamit.com/signup</div></xml>';
        const reswithuser = HtmlReady(withuser).html;
        expect(reswithuser).to.equal(cleansedwithuser);

        const noendingslash =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com</a></xml>';
        const cleansednoendingslash =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com / https://steamit.com</div></xml>';
        const resnoendingslash = HtmlReady(noendingslash).html;
        expect(resnoendingslash).to.equal(cleansednoendingslash);

        //make sure extra-domain in-page links are also caught by our phishy link scan.
        const domainInpage =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com#really-evil-inpage-component" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com</a></xml>';
        const cleanDomainInpage =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com / https://steamit.com#really-evil-inpage-component</div></xml>';
        const resDomainInpage = HtmlReady(domainInpage).html;
        expect(resDomainInpage).to.equal(cleanDomainInpage);

        //misleading in-page links should also be caught
        const inpage =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="#https://steamit.com/unlikelyinpagelink" xmlns="http://www.w3.org/1999/xhtml">Go down lower for https://steemit.com info!</a></xml>';
        const cleanInpage =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">Go down lower for https://steemit.com info! / #https://steamit.com/unlikelyinpagelink</div></xml>';
        const resinpage = HtmlReady(inpage).html;
        expect(resinpage).to.equal(cleanInpage);
    });

    it('should allow more than one link per post', () => {
        const somanylinks =
            '<xml xmlns="http://www.w3.org/1999/xhtml">https://foo.com and https://blah.com</xml>';
        const htmlified =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><span><a href="https://foo.com">https://foo.com</a> and <a href="https://blah.com">https://blah.com</a></span></xml>';
        const res = HtmlReady(somanylinks).html;
        expect(res).to.equal(htmlified);
    });

    it('should make relative links absolute with https by default', () => {
        const noRelativeHttpHttpsOrSteem = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="land.com"> zippy </a> </xml>';
        const cleansedRelativeHttpHttpsOrSteem = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://land.com"> zippy </a> </xml>';
        const resNoRelativeHttpHttpsOrSteem = HtmlReady(noRelativeHttpHttpsOrSteem).html;
        expect(resNoRelativeHttpHttpsOrSteem).to.equal(cleansedRelativeHttpHttpsOrSteem);
    });

    it('should allow the steem uri scheme for vessel links', () => {
        const noRelativeHttpHttpsOrSteem = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="steem://veins.com"> arteries </a> </xml>';
        const cleansedRelativeHttpHttpsOrSteem = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="steem://veins.com"> arteries </a> </xml>';
        const resNoRelativeHttpHttpsOrSteem = HtmlReady(noRelativeHttpHttpsOrSteem).html;
        expect(resNoRelativeHttpHttpsOrSteem).to.equal(cleansedRelativeHttpHttpsOrSteem);
    });
});
