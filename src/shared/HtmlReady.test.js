/* global describe, it, before, beforeEach, after, afterEach */
import HtmlReady from './HtmlReady';

beforeEach(() => {
    global.$STM_Config = {};
});

describe('htmlready', () => {
    it('should return an empty string if input cannot be parsed', () => {
        const teststring = 'teststring lol'; // this string causes the xmldom parser to fail & error out
        expect(HtmlReady(teststring).html).toEqual('');
    });

    it('should allow links where the text portion and href contains steemit.com', () => {
        const dirty =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        const res = HtmlReady(dirty).html;
        expect(res).toEqual(dirty);
    });

    it('should allow in-page links ', () => {
        const dirty =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="#some-link" xmlns="http://www.w3.org/1999/xhtml">a link location</a></xml>';
        const res = HtmlReady(dirty).html;
        expect(res).toEqual(dirty);

        const externalDomainDirty =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://anotherwebsite.com/apples#some-link" xmlns="http://www.w3.org/1999/xhtml">Another website\'s apple section</a></xml>';
        const externalDomainResult = HtmlReady(externalDomainDirty).html;
        expect(externalDomainResult).toEqual(externalDomainDirty);
    });

    it('should not allow links where the text portion contains steemit.com but the link does not', () => {
        // There isn't an easy way to mock counterpart, even with proxyquire, so we just test for the missing translation message -- ugly but ok

        const dirty =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        const cleansed =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com/signup / https://steamit.com/signup</div></xml>';
        const res = HtmlReady(dirty).html;
        expect(res).toEqual(cleansed);

        const cased =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://Steemit.com/signup</a></xml>';
        const cleansedcased =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://Steemit.com/signup / https://steamit.com/signup</div></xml>';
        const rescased = HtmlReady(cased).html;
        expect(rescased).toEqual(cleansedcased);

        const withuser =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://official@steemit.com/signup</a></xml>';
        const cleansedwithuser =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://official@steemit.com/signup / https://steamit.com/signup</div></xml>';
        const reswithuser = HtmlReady(withuser).html;
        expect(reswithuser).toEqual(cleansedwithuser);

        const noendingslash =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com</a></xml>';
        const cleansednoendingslash =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com / https://steamit.com</div></xml>';
        const resnoendingslash = HtmlReady(noendingslash).html;
        expect(resnoendingslash).toEqual(cleansednoendingslash);

        //make sure extra-domain in-page links are also caught by our phishy link scan.
        const domainInpage =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com#really-evil-inpage-component" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com</a></xml>';
        const cleanDomainInpage =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com / https://steamit.com#really-evil-inpage-component</div></xml>';
        const resDomainInpage = HtmlReady(domainInpage).html;
        expect(resDomainInpage).toEqual(cleanDomainInpage);

        // anchor links including steemit.com should be allowed
        const inpage =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="#https://steamit.com/unlikelyinpagelink" xmlns="http://www.w3.org/1999/xhtml">Go down lower for https://steemit.com info!</a></xml>';
        const cleanInpage =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="#https://steamit.com/unlikelyinpagelink" xmlns="http://www.w3.org/1999/xhtml">Go down lower for https://steemit.com info!</a></xml>';
        const resinpage = HtmlReady(inpage).html;
        expect(resinpage).toEqual(cleanInpage);

        const noprotocol =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/" xmlns="http://www.w3.org/1999/xhtml">for a good time, visit steemit.com today</a></xml>';
        const cleansednoprotocol =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">for a good time, visit steemit.com today / https://steamit.com/</div></xml>';
        const resnoprotocol = HtmlReady(noprotocol).html;
        expect(resnoprotocol).toEqual(cleansednoprotocol);
    });

    it('should allow more than one link per post', () => {
        const somanylinks =
            '<xml xmlns="http://www.w3.org/1999/xhtml">https://foo.com and https://blah.com</xml>';
        const htmlified =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><span><a href="https://foo.com">https://foo.com</a> and <a href="https://blah.com">https://blah.com</a></span></xml>';
        const res = HtmlReady(somanylinks).html;
        expect(res).toEqual(htmlified);
    });

    it('should link usernames', () => {
        const textwithmentions =
            '<xml xmlns="http://www.w3.org/1999/xhtml">@username (@a1b2, whatever</xml>';
        const htmlified =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><span><a href="/@username">@username</a> (<a href="/@a1b2">@a1b2</a>, whatever</span></xml>';
        const res = HtmlReady(textwithmentions).html;
        expect(res).toEqual(htmlified);
    });

    it('should detect only valid mentions', () => {
        const textwithmentions =
            '@abc @xx (@aaa1) @_x @eee, @fff! https://x.com/@zzz/test';
        const res = HtmlReady(textwithmentions, { mutate: false });
        const usertags = Array.from(res.usertags).join(',');
        expect(usertags).toEqual('abc,aaa1,eee,fff');
    });

    it('should not link usernames at the front of linked text', () => {
        const nameinsidelinkfirst =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup">@hihi</a></xml>';
        const htmlified =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup">@hihi</a></xml>';
        const res = HtmlReady(nameinsidelinkfirst).html;
        expect(res).toEqual(htmlified);
    });

    it('should not link usernames in the middle of linked text', () => {
        const nameinsidelinkmiddle =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup">hi @hihi</a></xml>';
        const htmlified =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup">hi @hihi</a></xml>';
        const res = HtmlReady(nameinsidelinkmiddle).html;
        expect(res).toEqual(htmlified);
    });

    it('should make relative links absolute with https by default', () => {
        const noRelativeHttpHttpsOrSteem =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="land.com"> zippy </a> </xml>';
        const cleansedRelativeHttpHttpsOrSteem =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://land.com"> zippy </a> </xml>';
        const resNoRelativeHttpHttpsOrSteem = HtmlReady(
            noRelativeHttpHttpsOrSteem
        ).html;
        expect(resNoRelativeHttpHttpsOrSteem).toEqual(
            cleansedRelativeHttpHttpsOrSteem
        );
    });

    it('should allow the steem uri scheme for vessel links', () => {
        const noRelativeHttpHttpsOrSteem =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="steem://veins.com"> arteries </a> </xml>';
        const cleansedRelativeHttpHttpsOrSteem =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="steem://veins.com"> arteries </a> </xml>';
        const resNoRelativeHttpHttpsOrSteem = HtmlReady(
            noRelativeHttpHttpsOrSteem
        ).html;
        expect(resNoRelativeHttpHttpsOrSteem).toEqual(
            cleansedRelativeHttpHttpsOrSteem
        );
    });

    it('should not mistake usernames in valid comment urls as mentions', () => {
        const url =
            'https://steemit.com/spam/@test-safari/34gfex-december-spam#@test-safari/re-test-safari-34gfex-december-spam-20180110t234627522z';
        const prefix = '<xml xmlns="http://www.w3.org/1999/xhtml">';
        const suffix = '</xml>';
        const input = prefix + url + suffix;
        const expected =
            prefix +
            '<span><a href="' +
            url +
            '">' +
            url +
            '</a></span>' +
            suffix;
        const result = HtmlReady(input).html;
        expect(result).toEqual(expected);
    });

    it('should not modify text when mention contains invalid username', () => {
        const body =
            'valid mention match but invalid username..@usernamewaytoolong';
        const prefix = '<xml xmlns="http://www.w3.org/1999/xhtml">';
        const suffix = '</xml>';
        const input = prefix + body + suffix;
        const result = HtmlReady(input).html;
        expect(result).toEqual(input);
    });

    it('should detect urls that are phishy', () => {
        const dirty =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steewit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        const cleansed =
            '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com/signup / https://steewit.com/signup</div></xml>';
        const res = HtmlReady(dirty).html;
        expect(res).toEqual(cleansed);
    });

    it('should not omit text on same line as youtube link', () => {
        const testString =
            '<html><p>before text https://www.youtube.com/watch?v=NrS9vvNgx7I after text</p></html>';
        const htmlified =
            '<html xmlns="http://www.w3.org/1999/xhtml"><p>before text ~~~ embed:NrS9vvNgx7I youtube ~~~ after text</p></html>';
        const res = HtmlReady(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should not omit text on same line as vimeo link', () => {
        const testString =
            '<html><p>before text https://vimeo.com/193628816/ after text</p></html>';
        const htmlified =
            '<html xmlns="http://www.w3.org/1999/xhtml"><p>before text ~~~ embed:193628816 vimeo ~~~ after text</p></html>';
        const res = HtmlReady(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle short youtube link start time', () => {
        const testString =
            '<html><p>https://youtu.be/ToQfmnj7FR8?t=4572s</p></html>';
        const htmlified =
            '<html xmlns="http://www.w3.org/1999/xhtml"><p>~~~ embed:ToQfmnj7FR8 youtube 4572 ~~~</p></html>';
        const res = HtmlReady(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle youtube link start time', () => {
        const testString =
            '<html><p>https://youtube.com/watch?v=ToQfmnj7FR8&t=4572</p></html>';
        const htmlified =
            '<html xmlns="http://www.w3.org/1999/xhtml"><p>~~~ embed:ToQfmnj7FR8 youtube 4572 ~~~</p></html>';
        const res = HtmlReady(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle vimeo link', () => {
        const testString = '<html><p>https://vimeo.com/193628816/</p></html>';
        const htmlified =
            '<html xmlns="http://www.w3.org/1999/xhtml"><p>~~~ embed:193628816 vimeo ~~~</p></html>';
        const res = HtmlReady(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle vimeo link start time', () => {
        const testString =
            '<html><p>https://vimeo.com/193628816/#t=4572s</p></html>';
        const htmlified =
            '<html xmlns="http://www.w3.org/1999/xhtml"><p>~~~ embed:193628816 vimeo 4572 ~~~</p></html>';
        const res = HtmlReady(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle twitch link', () => {
        const testString =
            '<html><p>https://www.twitch.tv/videos/1234567890</p></html>';
        const htmlified =
            '<html xmlns="http://www.w3.org/1999/xhtml"><p>~~~ embed:?video=1234567890 twitch ~~~</p></html>';
        const res = HtmlReady(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should not omit text on same line as dtube link', () => {
        const testString =
            '<html><p>before text https://d.tube/#!/v/tibfox/mvh7g26e after text</p></html>';
        const htmlified =
            '<html xmlns="http://www.w3.org/1999/xhtml"><p>before text ~~~ embed:tibfox/mvh7g26e dtube ~~~ after text</p></html>';
        const res = HtmlReady(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle dtube embed', () => {
        const testString =
            '<html><iframe width="560" height="315" src="https://emb.d.tube/#!/dbroze/8lsh5nf7" frameborder="0" allowfullscreen></iframe></html>';
        const htmlified =
            '<html xmlns="http://www.w3.org/1999/xhtml"><div class="videoWrapper"><iframe width="560" height="315" src="https://emb.d.tube/#!/dbroze/8lsh5nf7" frameborder="0" allowfullscreen="allowfullscreen" xmlns="http://www.w3.org/1999/xhtml"></iframe></div></html>';
        const res = HtmlReady(testString).html;
        expect(res).toEqual(htmlified);
    });
});
