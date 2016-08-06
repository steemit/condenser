

const iframeWhitelist = [
    /^(https?:)?\/\/www.youtube.com\/embed\/.*/i,
    /^(https?:)?\/\/w.soundcloud.com\/player\/.*/i,
    // /^(https?:)?\/\/player.vimeo.com\/video\/.*/i, // <-- medium-editor branch
]

// Medium insert plugin uses: div, figure, figcaption, iframe
export default ({large = true, highQualityPost = true, noImage = false, sanitizeErrors = []}) => ({
    allowedTags: `
        div, iframe,
        a, p, b, q, br, ul, li, ol, img, h1, h2, h3, h4, h5, h6, hr,
        blockquote, pre, code, em, strong, center, table, thead, tbody, tr, th, td,
        strike, sup,
    `.trim().split(/,\s*/),
        // figure, figcaption,

    // SEE https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    allowedAttributes: {
        // "src" MUST pass a whitelist (below)
        iframe: ['src', 'width', 'height', 'frameBorder', 'allowFullScreen'], //'class'

        // style is subject to attack, filtering more below
        td: ['style'],
        img: ['src'],
        a: ['href', 'rel'],
    },
    transformTags: {
        iframe: (tagName, attribs) => {
            const src = attribs.src
            for(const re of iframeWhitelist)
                if(re.test(src)) {
                    return {
                        tagName: 'iframe',
                        attribs: {
                            src: src.replace(/\?.+$/, ''), // strip query string (yt: autoplay=1,controls=0,showinfo=0, etc)
                            width: large ? '640' : '384',
                            height: large ? '360' : '240',
                            allowFullScreen: 'on',
                            class: 'videoWrapper',
                            frameBorder: '0',
                        },
                    }
                }
            console.log('Blocked, did not match iframe "src" white list urls:', tagName, attribs)
            sanitizeErrors.push('Invalid iframe URL: ' + src)
            return {tagName: 'img', attribs: {src: 'brokenimg.jpg'}}
        },
        img: (tagName, attribs) => {
            if(noImage) return {tagName: 'div', text: '(Image removed)'}
            //See https://github.com/punkave/sanitize-html/issues/117
            let {src} = attribs
            if(!/^(https?:)?\/\//i.test(src)) {
                console.log('Blocked, image tag src does not appear to be a url', tagName, attribs)
                sanitizeErrors.push('Image URL does not appear to be valid: ' + src)
                return {tagName: 'img', attribs: {src: 'brokenimg.jpg'}}
            }

            // replace http:// with // to force https when needed
            src = src.replace(/^http:\/\//i, '//')

            return {tagName, attribs: {src}}
        },
        td: (tagName, attribs) => {
            const attys = {}
            if(attribs.style === 'text-align:right')
                attys.style = 'text-align:right'
            return {
                tagName,
                attribs: attys
            }
        },
        a: (tagName, attribs) => {
            let {href} = attribs
            if(! href) href = '#'
            const attys = {href}
            // If it's not a (relative or absolute) steemit URL...
            if (! href.match(/^(\/(?!\/)|https:\/\/steemit.com)/)) {
                // attys.target = '_blank' // pending iframe impl https://mathiasbynens.github.io/rel-noopener/
                attys.rel = highQualityPost ? 'noopener' : 'nofollow noopener'
            }
            return {
                tagName,
                attribs: attys
            }
        },
    }
})
