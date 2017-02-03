import xmldom from 'xmldom'
import linksRe from 'app/utils/Links'
import {validate_account_name} from 'app/utils/ChainValidation'

const noop = () => {}
const DOMParser = new xmldom.DOMParser({
    errorHandler: {warning: noop, error: noop}
})
const XMLSerializer = new xmldom.XMLSerializer()

/**
 * Functions performed by HTMLReady
 *
 * State reporting
 *  - hashtags: collect all #tags in content
 *  - usertags: collect all @mentions in content
 *  - htmltags: collect all html <tags> used (for validation)
 *  - images: collect all image URLs in content
 *  - links: collect all href URLs in content
 *
 * Mutations
 *  - link()
 *    - ensure all <a> href's begin with a protocol. prepend https:// otherwise.
 *  - iframe()
 *    - wrap all <iframe>s in <div class="videoWrapper"> for responsive sizing
 *  - img()
 *    - convert any <img> src IPFS prefixes to standard URL
 *    - change relative protocol to https://
 *  - linkifyNode()
 *    - scans text content to be turned into rich content
 *    - embedYouTubeNode()
 *      - identify plain youtube URLs and prep them for "rich embed"
 *    - linkify()
 *      - scan text for:
 *        - #tags, convert to <a> links
 *        - @mentions, convert to <a> links
 *        - naked URLs
 *          - if img URL, normalize URL and convert to <img> tag
 *          - otherwise, normalize URL and convert to <a> link
 *  - proxifyImages()
 *    - prepend proxy URL to any non-local <img> src's
 *
 * We could implement 2 levels of HTML mutation for maximum reuse:
 *  1. Normalization of HTML - non-proprietary, pre-rendering cleanup/normalization
 *    - (state reporting done at this level)
 *    - normalize URL protocols
 *    - convert naked URLs to images/links
 *    - convert embeddable URLs to <iframe>s
 *    - basic sanitization?
 *  2. Steemit.com Rendering - add in proprietary Steemit.com functions/links
 *    - convert <iframe>s to custom objects
 *    - linkify #tags and @mentions
 *    - proxify images
 *
 * TODO:
 *  - change ipfsPrefix(url) to normalizeUrl(url)
 *    - rewrite IPFS prefixes to valid URLs
 *    - schema normalization
 *    - gracefully handle protocols like ftp, mailto
 */

/** Split the HTML on top-level elements. This allows react to compare separately, preventing excessive re-rendering.
 * Used in MarkdownViewer.jsx
 */
// export function sectionHtml (html) {
//   const doc = DOMParser.parseFromString(html, 'text/html')
//   const sections = Array(...doc.childNodes).map(child => XMLSerializer.serializeToString(child))
//   return sections
// }

/** Embed videos, link mentions and hashtags, etc...
*/
export default function (html, {mutate = true} = {}) {
    const state = {mutate}
    state.hashtags = new Set()
    state.usertags = new Set()
    state.htmltags = new Set()
    state.images = new Set()
    state.links = new Set()
    try {
        const doc = DOMParser.parseFromString(html, 'text/html')
        traverse(doc, state)
        if(mutate) proxifyImages(doc)
        // console.log('state', state)
        if(!mutate) return state
        return {html: (doc) ? XMLSerializer.serializeToString(doc) : '', ...state}
    }catch(error) {
        // Not Used, parseFromString might throw an error in the future
        console.error(error.toString())
        return {html}
    }
}

function traverse(node, state, depth = 0) {
    if(!node || !node.childNodes) return
    Array(...node.childNodes).forEach(child => {
        // console.log(depth, 'child.tag,data', child.tagName, child.data)
        const tag = child.tagName ? child.tagName.toLowerCase() : null
        if(tag) state.htmltags.add(tag)

        if(tag === 'img')
            img(state, child)
        else if(tag === 'iframe')
            iframe(state, child)
        else if(tag === 'a')
            link(state, child)
        else if(child.nodeName === '#text')
            linkifyNode(child, state)

        traverse(child, state, depth + 1)
    })
}

function link(state, child) {
    const url = child.getAttribute('href')
    if(url) {
        state.links.add(url)
        if(state.mutate) {
            // If this link is not relative, http, or https -- add https.
            if(! /^\/(?!\/)|(https?:)?\/\//.test(url)) {
                child.setAttribute('href', "https://"+url)
            }
        }
    }
}

// wrap iframes in div.videoWrapper to control size/aspect ratio
function iframe(state, child) {
    const url = child.getAttribute('src')
    if(url) {
        const {images, links} = state
        const yt = youTubeId(url)
        if(yt && images && links) {
            links.add(yt.url)
            images.add('https://img.youtube.com/vi/' + yt.id + '/0.jpg')
        }
    }

    const {mutate} = state
    if(!mutate) return

    const tag = child.parentNode.tagName ? child.parentNode.tagName.toLowerCase() : child.parentNode.tagName
    if(tag == 'div' && child.parentNode.getAttribute('class') == 'videoWrapper') return;
    const html = XMLSerializer.serializeToString(child)
    child.parentNode.replaceChild(DOMParser.parseFromString(`<div class="videoWrapper">${html}</div>`), child)
}

function img(state, child) {
    const url = child.getAttribute('src')
    if(url) {
        state.images.add(url)
        if(state.mutate) {
            let url2 = ipfsPrefix(url)
            if(/^\/\//.test(url2)) {
                // Change relative protocol imgs to https
                url2 = "https:" + url2
            }
            if(url2 !== url) {
                child.setAttribute('src', url2)
            }
        }
    }
}

// For all img elements with non-local URLs, prepend the proxy URL (e.g. `https://img0.steemit.com/1680x8400/`)
function proxifyImages(doc) {
    if (!$STM_Config.img_proxy_prefix) return
    if (!doc) return;
    [...doc.getElementsByTagName('img')].forEach(node => {
        const url = node.getAttribute('src')
        if(! linksRe.local.test(url))
            node.setAttribute('src', $STM_Config.img_proxy_prefix + '1680x8400/' + url)
    })
}

function linkifyNode(child, state) {try{
    const tag = child.parentNode.tagName ? child.parentNode.tagName.toLowerCase() : child.parentNode.tagName
    if(tag === 'code') return
    if(tag === 'a') return

    const {mutate} = state
    if(!child.data) return
    if(embedYouTubeNode(child, state.links, state.images)) return
    if(embedVimeoNode(child, state.links, state.images)) return

    const data = XMLSerializer.serializeToString(child)
    const content = linkify(data, state.mutate, state.hashtags, state.usertags, state.images, state.links)
    if(mutate && content !== data) {
        child.parentNode.replaceChild(DOMParser.parseFromString(`<span>${content}</span>`), child)
    }
} catch(error) {console.log(error)}}

function linkify(content, mutate, hashtags, usertags, images, links) {
    // hashtag
    content = content.replace(/(^|\s)(#[-a-z\d]+)/ig, tag => {
        if(/#[\d]+$/.test(tag)) return tag // Don't allow numbers to be tags
        const space = /^\s/.test(tag) ? tag[0] : ''
        const tag2 = tag.trim().substring(1)
        const tagLower = tag2.toLowerCase()
        if(hashtags) hashtags.add(tagLower)
        if(!mutate) return tag
        return space + `<a href="/trending/${tagLower}">${tag}</a>`
    })

    // usertag (mention)
    content = content.replace(/(^|\s)(@[a-z][-\.a-z\d]+[a-z\d])/ig, user => {
        const space = /^\s/.test(user) ? user[0] : ''
        const user2 = user.trim().substring(1)
        const userLower = user2.toLowerCase()
        const valid = validate_account_name(userLower) == null
        if(valid && usertags) usertags.add(userLower)
        if(!mutate) return user
        return space + (valid ?
            `<a href="/@${userLower}">@${user2}</a>` :
            '@' + user2
        )
    })

    content = content.replace(linksRe.any, ln => {
        if(linksRe.image.test(ln)) {
            if(images) images.add(ln)
            return `<img src="${ipfsPrefix(ln)}" />`
        }
        if(links) links.add(ln)
        return `<a href="${ipfsPrefix(ln)}">${ln}</a>`
    })
    return content
}

function embedYouTubeNode(child, links, images) {try{
    if(!child.data) return false
    const data = child.data
    const yt = youTubeId(data)
    if(!yt) return false

    const v = DOMParser.parseFromString(`~~~ embed:${yt.id} youtube ~~~`)
    child.parentNode.replaceChild(v, child)
    if(links) links.add(yt.url)
    if(images) images.add('https://img.youtube.com/vi/' + yt.id + '/0.jpg')
    return true
} catch(error) {console.log(error); return false}}

/** @return {id, url} or <b>null</b> */
function youTubeId(data) {
    if(!data) return null

    const m1 = data.match(linksRe.youTube)
    const url = m1 ? m1[0] : null
    if(!url) return null

    const m2 = url.match(linksRe.youTubeId)
    const id = m2 && m2.length >= 2 ? m2[1] : null
    if(!id) return null

    return {id, url}
}

function embedVimeoNode(child, links, /*images*/) {try{
    if(!child.data) return false
    const data = child.data

    let id
    {
        const m = data.match(linksRe.vimeoId)
        id = m && m.length >= 2 ? m[1] : null
    }
    if(!id) return false;

    const url = `https://player.vimeo.com/video/${id}`
    const v = DOMParser.parseFromString(`~~~ embed:${id} vimeo ~~~`)
    child.parentNode.replaceChild(v, child)
    if(links) links.add(url)

    // Preview image requires a callback.. http://stackoverflow.com/questions/1361149/get-img-thumbnails-from-vimeo
    // if(images) images.add('https://.../vi/' + id + '/0.jpg')

    return true
} catch(error) {console.log(error); return false}}

function ipfsPrefix(url) {
    if($STM_Config.ipfs_prefix) {
        // Convert //ipfs/xxx  or /ipfs/xxx  into  https://steemit.com/ipfs/xxxxx
        if(/^\/?\/ipfs\//.test(url)) {
            const slash = url.charAt(1) === '/' ? 1 : 0
            url = url.substring(slash + '/ipfs/'.length) // start with only 1 /
            return $STM_Config.ipfs_prefix + '/' + url
        }
    }
    return url
}
