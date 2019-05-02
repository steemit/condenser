import React from 'react';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';

class XSS extends React.Component {
    render() {
        if (!process.env.NODE_ENV === 'development') return <div />;
        let tests = xss.map((test, i) => (
            <div key={i}>
                <h2>Test {i}</h2>
                <MarkdownViewer formId={'xsstest' + i} text={test} />
                <hr />
            </div>
        ));
        return (
            <div className="row">
                <div className="column column-12">{tests}</div>
            </div>
        );
        // return <div dangerouslySetInnerHTML={{__html: xss}} />
    }
}

module.exports = {
    path: '/xss/test',
    component: XSS,
};

// https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet#Image_XSS_using_the_JavaScript_directive
// July 14 2016
const xss = [
    `<SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>`,

    `<DIV STYLE="background-image:url(javascript:alert('XSS'))">`,

    `<div style="background-image:url(javascript:alert('XSS'))">`,

    `<FRAMESET><FRAME SRC="javascript:alert('XSS') ;"></FRAMESET>`,

    `<IFRAME SRC="javascript:alert('XSS') ;"></IFRAME>`,

    `<INPUT TYPE="IMAGE" SRC="javascript:alert('XSS') ;">`,

    `<IMG DYNSRC="javascript:alert('XSS');">`,

    `<LINK REL="stylesheet" HREF="javascript:alert('XSS');">`,

    `<STYLE>li {list-style-image: url("javascript:alert('XSS') ");}</STYLE><UL><LI>XSS`,

    `<META HTTP-EQUIV="refresh" CONTENT="0;url=data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K">`,

    `<OBJECT classid=clsid:ae24fdae-03c6-11d1-8b76-0080c744f389><param name=url value=javascript:alert('XSS')></OBJECT>`,

    `<EMBED SRC="http://ha.ckers.org/xss.swf" AllowScriptAccess="always"></EMBED>`,

    `<table background="javascript:alert('XSS')"><tr><td style="background-image:url(javascript:alert('XSS'))">*</td></tr></table>`,

    `<a href="javascript:alert('XSS')">XSS</a>`,

    `';alert(String.fromCharCode(88,83,83))//';alert(String.fromCharCode(88,83,83))//";
alert(String.fromCharCode(88,83,83))//";alert(String.fromCharCode(88,83,83))//--
></SCRIPT>">'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>`,

    `'';!--"<XSS>=&{()}`,

    `<SCRIPT SRC=https://steemd.com/xss.js></SCRIPT>`,

    `onnerr w/ clearly invalid img: <img src="awesome.jpg" onerror="alert('xss')" /><br />
good image: <img src="https://steem.io/images/press/press-theblkchn.png" onerror="alert('xss')" /><br />
good url, bad img: <img src="https://steem.io/testing-does-not-exist.png" onerror="alert('xss')" /> 
(results will vary if using image proxy -- it rewrites 'src')`,

    `**test**!%3Cimg%20src=%22awsome.jpg%22%20onerror=%22alert(1)%22/%3E`,

    `<html>test!%3Cimg%20src=%22awsome.jpg%22%20onerror=%22alert(1)%22/%3E</html>`,

    '<IMG SRC=`javascript:alert("RSnake says, \'XSS\'")`>',

    '<html><a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;">Hax</a></html>',

    '<a href="/not-a-domain.com/local-page" rel="fffffffff">Link to a local page with bad rel attr</a>',
    '<a href="//relative-protocol-domain.com/some-page" target="fffffffff">Link to domain (relative protocol) and bad target attr</a>',
];
