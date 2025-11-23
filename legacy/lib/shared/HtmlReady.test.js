'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _HtmlReady = require('./HtmlReady');

var _HtmlReady2 = _interopRequireDefault(_HtmlReady);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

beforeEach(function () {
    global.$STM_Config = {};
}); /* global describe, it, before, beforeEach, after, afterEach */


describe('htmlready', function () {
    it('should return an empty string if input cannot be parsed', function () {
        var teststring = 'teststring lol'; // this string causes the xmldom parser to fail & error out
        expect((0, _HtmlReady2.default)(teststring).html).toEqual('');
    });

    it('should allow links where the text portion and href contains steemit.com', function () {
        var dirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        var res = (0, _HtmlReady2.default)(dirty).html;
        expect(res).toEqual(dirty);
    });

    it('should allow in-page links ', function () {
        var dirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="#some-link" xmlns="http://www.w3.org/1999/xhtml">a link location</a></xml>';
        var res = (0, _HtmlReady2.default)(dirty).html;
        expect(res).toEqual(dirty);

        var externalDomainDirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://anotherwebsite.com/apples#some-link" xmlns="http://www.w3.org/1999/xhtml">Another website\'s apple section</a></xml>';
        var externalDomainResult = (0, _HtmlReady2.default)(externalDomainDirty).html;
        expect(externalDomainResult).toEqual(externalDomainDirty);
    });

    it('should not allow links where the text portion contains steemit.com but the link does not', function () {
        // There isn't an easy way to mock counterpart, even with proxyquire, so we just test for the missing translation message -- ugly but ok

        var dirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        var cleansed = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com/signup / https://steamit.com/signup</div></xml>';
        var res = (0, _HtmlReady2.default)(dirty).html;
        expect(res).toEqual(cleansed);

        var cased = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://Steemit.com/signup</a></xml>';
        var cleansedcased = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://Steemit.com/signup / https://steamit.com/signup</div></xml>';
        var rescased = (0, _HtmlReady2.default)(cased).html;
        expect(rescased).toEqual(cleansedcased);

        var withuser = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://official@steemit.com/signup</a></xml>';
        var cleansedwithuser = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://official@steemit.com/signup / https://steamit.com/signup</div></xml>';
        var reswithuser = (0, _HtmlReady2.default)(withuser).html;
        expect(reswithuser).toEqual(cleansedwithuser);

        var noendingslash = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com</a></xml>';
        var cleansednoendingslash = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com / https://steamit.com</div></xml>';
        var resnoendingslash = (0, _HtmlReady2.default)(noendingslash).html;
        expect(resnoendingslash).toEqual(cleansednoendingslash);

        //make sure extra-domain in-page links are also caught by our phishy link scan.
        var domainInpage = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com#really-evil-inpage-component" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com</a></xml>';
        var cleanDomainInpage = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com / https://steamit.com#really-evil-inpage-component</div></xml>';
        var resDomainInpage = (0, _HtmlReady2.default)(domainInpage).html;
        expect(resDomainInpage).toEqual(cleanDomainInpage);

        // anchor links including steemit.com should be allowed
        var inpage = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="#https://steamit.com/unlikelyinpagelink" xmlns="http://www.w3.org/1999/xhtml">Go down lower for https://steemit.com info!</a></xml>';
        var cleanInpage = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="#https://steamit.com/unlikelyinpagelink" xmlns="http://www.w3.org/1999/xhtml">Go down lower for https://steemit.com info!</a></xml>';
        var resinpage = (0, _HtmlReady2.default)(inpage).html;
        expect(resinpage).toEqual(cleanInpage);

        var noprotocol = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steamit.com/" xmlns="http://www.w3.org/1999/xhtml">for a good time, visit steemit.com today</a></xml>';
        var cleansednoprotocol = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">for a good time, visit steemit.com today / https://steamit.com/</div></xml>';
        var resnoprotocol = (0, _HtmlReady2.default)(noprotocol).html;
        expect(resnoprotocol).toEqual(cleansednoprotocol);
    });

    it('should allow more than one link per post', function () {
        var somanylinks = '<xml xmlns="http://www.w3.org/1999/xhtml">https://foo.com and https://blah.com</xml>';
        var htmlified = '<xml xmlns="http://www.w3.org/1999/xhtml"><span><a href="https://foo.com">https://foo.com</a> and <a href="https://blah.com">https://blah.com</a></span></xml>';
        var res = (0, _HtmlReady2.default)(somanylinks).html;
        expect(res).toEqual(htmlified);
    });

    it('should link usernames', function () {
        var textwithmentions = '<xml xmlns="http://www.w3.org/1999/xhtml">@username (@a1b2, whatever</xml>';
        var htmlified = '<xml xmlns="http://www.w3.org/1999/xhtml"><span><a href="/@username">@username</a> (<a href="/@a1b2">@a1b2</a>, whatever</span></xml>';
        var res = (0, _HtmlReady2.default)(textwithmentions).html;
        expect(res).toEqual(htmlified);
    });

    it('should detect only valid mentions', function () {
        var textwithmentions = '@abc @xx (@aaa1) @_x @eee, @fff! https://x.com/@zzz/test';
        var res = (0, _HtmlReady2.default)(textwithmentions, { mutate: false });
        var usertags = (0, _from2.default)(res.usertags).join(',');
        expect(usertags).toEqual('abc,aaa1,eee,fff');
    });

    it('should not link usernames at the front of linked text', function () {
        var nameinsidelinkfirst = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup">@hihi</a></xml>';
        var htmlified = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup">@hihi</a></xml>';
        var res = (0, _HtmlReady2.default)(nameinsidelinkfirst).html;
        expect(res).toEqual(htmlified);
    });

    it('should not link usernames in the middle of linked text', function () {
        var nameinsidelinkmiddle = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup">hi @hihi</a></xml>';
        var htmlified = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steemit.com/signup">hi @hihi</a></xml>';
        var res = (0, _HtmlReady2.default)(nameinsidelinkmiddle).html;
        expect(res).toEqual(htmlified);
    });

    it('should make relative links absolute with https by default', function () {
        var noRelativeHttpHttpsOrSteem = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="land.com"> zippy </a> </xml>';
        var cleansedRelativeHttpHttpsOrSteem = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://land.com"> zippy </a> </xml>';
        var resNoRelativeHttpHttpsOrSteem = (0, _HtmlReady2.default)(noRelativeHttpHttpsOrSteem).html;
        expect(resNoRelativeHttpHttpsOrSteem).toEqual(cleansedRelativeHttpHttpsOrSteem);
    });

    it('should allow the steem uri scheme for vessel links', function () {
        var noRelativeHttpHttpsOrSteem = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="steem://veins.com"> arteries </a> </xml>';
        var cleansedRelativeHttpHttpsOrSteem = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="steem://veins.com"> arteries </a> </xml>';
        var resNoRelativeHttpHttpsOrSteem = (0, _HtmlReady2.default)(noRelativeHttpHttpsOrSteem).html;
        expect(resNoRelativeHttpHttpsOrSteem).toEqual(cleansedRelativeHttpHttpsOrSteem);
    });

    it('should not mistake usernames in valid comment urls as mentions', function () {
        var url = 'https://steemit.com/spam/@test-safari/34gfex-december-spam#@test-safari/re-test-safari-34gfex-december-spam-20180110t234627522z';
        var prefix = '<xml xmlns="http://www.w3.org/1999/xhtml">';
        var suffix = '</xml>';
        var input = prefix + url + suffix;
        var expected = prefix + '<span><a href="' + url + '">' + url + '</a></span>' + suffix;
        var result = (0, _HtmlReady2.default)(input).html;
        expect(result).toEqual(expected);
    });

    it('should not modify text when mention contains invalid username', function () {
        var body = 'valid mention match but invalid username..@usernamewaytoolong';
        var prefix = '<xml xmlns="http://www.w3.org/1999/xhtml">';
        var suffix = '</xml>';
        var input = prefix + body + suffix;
        var result = (0, _HtmlReady2.default)(input).html;
        expect(result).toEqual(input);
    });

    it('should detect urls that are phishy', function () {
        var dirty = '<xml xmlns="http://www.w3.org/1999/xhtml"><a href="https://steewit.com/signup" xmlns="http://www.w3.org/1999/xhtml">https://steemit.com/signup</a></xml>';
        var cleansed = '<xml xmlns="http://www.w3.org/1999/xhtml"><div title="missing translation: en.g.phishy_message" class="phishy">https://steemit.com/signup / https://steewit.com/signup</div></xml>';
        var res = (0, _HtmlReady2.default)(dirty).html;
        expect(res).toEqual(cleansed);
    });

    it('should not omit text on same line as youtube link', function () {
        var testString = '<html><p>before text https://www.youtube.com/watch?v=NrS9vvNgx7I after text</p></html>';
        var htmlified = '<html xmlns="http://www.w3.org/1999/xhtml"><p>before text ~~~ embed:NrS9vvNgx7I youtube ~~~ after text</p></html>';
        var res = (0, _HtmlReady2.default)(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should not omit text on same line as vimeo link', function () {
        var testString = '<html><p>before text https://vimeo.com/193628816/ after text</p></html>';
        var htmlified = '<html xmlns="http://www.w3.org/1999/xhtml"><p>before text ~~~ embed:193628816 vimeo ~~~ after text</p></html>';
        var res = (0, _HtmlReady2.default)(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle short youtube link start time', function () {
        var testString = '<html><p>https://youtu.be/ToQfmnj7FR8?t=4572s</p></html>';
        var htmlified = '<html xmlns="http://www.w3.org/1999/xhtml"><p>~~~ embed:ToQfmnj7FR8 youtube 4572 ~~~</p></html>';
        var res = (0, _HtmlReady2.default)(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle youtube link start time', function () {
        var testString = '<html><p>https://youtube.com/watch?v=ToQfmnj7FR8&t=4572</p></html>';
        var htmlified = '<html xmlns="http://www.w3.org/1999/xhtml"><p>~~~ embed:ToQfmnj7FR8 youtube 4572 ~~~</p></html>';
        var res = (0, _HtmlReady2.default)(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle vimeo link', function () {
        var testString = '<html><p>https://vimeo.com/193628816/</p></html>';
        var htmlified = '<html xmlns="http://www.w3.org/1999/xhtml"><p>~~~ embed:193628816 vimeo ~~~</p></html>';
        var res = (0, _HtmlReady2.default)(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle vimeo link start time', function () {
        var testString = '<html><p>https://vimeo.com/193628816/#t=4572s</p></html>';
        var htmlified = '<html xmlns="http://www.w3.org/1999/xhtml"><p>~~~ embed:193628816 vimeo 4572 ~~~</p></html>';
        var res = (0, _HtmlReady2.default)(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle twitch link', function () {
        var testString = '<html><p>https://www.twitch.tv/videos/1234567890</p></html>';
        var htmlified = '<html xmlns="http://www.w3.org/1999/xhtml"><p>~~~ embed:?video=1234567890 twitch ~~~</p></html>';
        var res = (0, _HtmlReady2.default)(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should not omit text on same line as dtube link', function () {
        var testString = '<html><p>before text https://d.tube/#!/v/tibfox/mvh7g26e after text</p></html>';
        var htmlified = '<html xmlns="http://www.w3.org/1999/xhtml"><p>before text ~~~ embed:tibfox/mvh7g26e dtube ~~~ after text</p></html>';
        var res = (0, _HtmlReady2.default)(testString).html;
        expect(res).toEqual(htmlified);
    });

    it('should handle dtube embed', function () {
        var testString = '<html><iframe width="560" height="315" src="https://emb.d.tube/#!/dbroze/8lsh5nf7" frameborder="0" allowfullscreen></iframe></html>';
        var htmlified = '<html xmlns="http://www.w3.org/1999/xhtml"><div class="videoWrapper"><iframe width="560" height="315" src="https://emb.d.tube/#!/dbroze/8lsh5nf7" frameborder="0" allowfullscreen="allowfullscreen" xmlns="http://www.w3.org/1999/xhtml"></iframe></div></html>';
        var res = (0, _HtmlReady2.default)(testString).html;
        expect(res).toEqual(htmlified);
    });
});