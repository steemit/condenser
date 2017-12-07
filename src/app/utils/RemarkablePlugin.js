// import {validate_account_name} from 'app/utils/ChainValidation'
// import linksRe from 'app/utils/Links'
// import config from 'config'

/** usage
<code>
import {plugin, tagRules} from 'app/utils/RemarkablePlugin'
import Remarkable from 'remarkable'
const remarkable = new Remarkable()
remarkable.use(plugin(tagRules))
const renderedText = remarkable.render(`#jsc @user`)
console.log('hashtags', tagRules.hashtags())
console.log('usertags', tagRules.usertags())
console.log('renderedText', renderedText)
</code>
*/
// export const tagRules = {
//     done: () => {
//         const ret = {
//             tags: Array.from(hashtags),
//             users: Array.from(usertags),
//         }
//         hashtags = new Set()
//         usertags = new Set()
//         return ret
//     },
//     link_open: (tokens, i, options, env, renderer) => {
//         tagLinkOpen = true
//         const link = tokens[i + 1].content
//         tagRules.youtubeId = null
//         tagRules.youtubeTime = null
//         if(link) link.replace(linksRe.youTube, url => {
//             const match = url.match(linksRe.youTubeId)
//             if(match && match.length >= 2) {
//                 const id = match[1]
//                 tagRules.youtubeId = id
//                 const [, query] = link.split('?')
//                 if(query) {
//                     const params = query.split('&')
//                     for(const param of params) {
//                         if(/^t=/.test(param)) tagRules.youtubeTime = param.substring(2)
//                     }
//                 }
//                 return
//             }
//             console.log("Youtube link without ID?", url);
//         })
//         if(tagRules.youtubeId) return ''
//         return renderer.rules.link_open(tokens, i, options, env, renderer)
//     },
//     text: (tokens, i, options, env, renderer) => {
//         if(tagRules.youtubeId)
//             return `youtube:${tagRules.youtubeId}${tagRules.youtubeTime ? ',' + tagRules.youtubeTime : ''}`
//
//         if(tagLinkOpen)
//             return renderer.rules.text(tokens, i, options, env, renderer)
//         let content = tokens[i].content
//         // hashtag
//         content = content.replace(/(^|\s)(#[-a-z\d]+)/ig, tag => {
//             if(/#[\d]+$/.test(tag)) return tag // Don't allow numbers to be tags
//             const space = /^\s/.test(tag) ? tag[0] : ''
//             tag = tag.trim().substring(1)
//             hashtags.add(tag)
//             return space + `<a href="/trending/${tag.toLowerCase()}">#${tag}</a>`
//         })
//         // usertag (mention)
//         content = content.replace(/(^|\s)(@[-\.a-z\d]+)/ig, user => {
//             const space = /^\s/.test(user) ? user[0] : ''
//             user = user.trim().substring(1)
//             const valid = validate_account_name(user) == null
//             if(valid) usertags.add(user)
//             return space + (valid ?
//                 `<a href="/@${user}">@${user}</a>` :
//                 '@' + user
//             )
//         })
//         // unescapted ipfs links (temp, until the reply editor categorizes the image)
//         //if(config.ipfs_prefix)
//         //    content = content.replace(linksRe.ipfsPrefix, config.ipfs_prefix)
//
//         return content
//     },
//     link_close: (tokens, i, options, env, renderer) => {
//         tagLinkOpen = false
//         if(tagRules.youtubeId) {
//             tagRules.youtubeId = null
//             tagRules.youtubeTime = null
//             return ''
//         }
//         return renderer.rules.link_close(tokens, i, options, env, renderer)
//     },
// }
// let hashtags = new Set()
// let usertags = new Set()
// let tagLinkOpen
//
// export const imageLinks = {
//     done: () => {
//         if(image.length > 1) links.delete(image[1])
//         const ret = {
//             image: Array.from(image),
//             links: Array.from(links)
//         }
//         image = []
//         links = new Set()
//         return ret
//     },
//     image: (tokens, i) => {
//         // ![Image Alt](https://duckduckgo.com/assets/badges/logo_square.64.png)
//         const token = tokens[i]
//         const {content} = token
//         if(image.length) return content // only first one
//         image.push(token.src)
//         return content
//     },
//     link_open: (tokens, i) => {
//         // [inline link](http://www.duckduckgo.com "Example Title")
//         const token = tokens[i]
//         const {content} = token
//         // console.log('token(link_open)', token)
//         const {href} = token
//         if(linksRe.image.test(href) && !image.length)
//             // looks like an image link, no markup though
//             image.push(href)
//         else
//             links.add(href)
//         // [![Foo](http://www.google.com.au/images/nav_logo7.png)](http://google.com.au/)
//         if(image.length) return content // only the first image and link combo
//         // link around an image
//         const next = tokens[i + 1]
//         if(next && next.type === 'image') {
//             const {src} = next
//             image.push(src)
//             image.push(href)
//         }
//         return content
//     }
// }
// let image = []
// let links = new Set()

/**
Usage...
<code>
import Remarkable from 'remarkable'
const remarkable = new Remarkable()
const customRules = {
    text: (tokens, i, options, env, ctx) => {
        const token = tokens[i]
        const content = token.content
        console.log('token(2)', token)
        return content
    }
}
remarkable.use(plugin(customRules))
const renderedText = remarkable.render(`#jsc`)
console.log('renderedText', renderedText)
</code>
*/
// export const plugin = rules => md => {
//     // const render = md.renderer.render
//     md.renderer.render = (tokens, options, env) => {
//         let str = ''
//         for (let i = 0; i < tokens.length; i++) {
//             if (tokens[i].type === 'inline') {
//                 str += md.renderer.render(tokens[i].children, options, env);
//             } else {
//                 const token = tokens[i]
//                 // console.log('token(plugin)', token, rules)
//                 const customRule = rules[token.type]
//                 if(customRule)
//                     str += customRule(tokens, i, options, env, md.renderer)
//                 else {
//                     str += md.renderer.rules[token.type](tokens, i, options, env, md.renderer)
//                 }
//             }
//         }
//         return str
//     }
// }
