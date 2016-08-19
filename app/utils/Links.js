
const urlChar = '[^\\s"\'<>\\]\\[\\(\\)]'
const imagePath = '(?:(?:\\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs/[a-z\\d]{40,}))'
const domainPath = '(?:[-a-zA-Z0-9\\._]+)'
const urlChars = '(?:' + urlChar + '*)'

const urlSet = ({domain = domainPath, path} = {}) => {
     // urlChars is everything but html or markdown stop chars
    return `https?:\/\/${domain}(?::\\d{2,5})?(?:[/\\?#]${urlChars}${path ? path + urlChars : ''})${path ? '' : '?'}`
}

/**
    Unless your using a 'g' (glob) flag you can store and re-use your regular expression.  Use the cache below.  If your using a glob (for example: replace all), the regex object becomes stateful and continues where it left off when called with the same string so naturally the regexp object can't be cached for long.
*/
export const any = (flags = 'i') => new RegExp(urlSet(), flags)
export const local = (flags = 'i') => new RegExp(urlSet({domain: '(?:localhost|(?:.*\\.)?steemit.com)'}), flags)
export const remote = (flags = 'i') => new RegExp(urlSet({domain: `(?!localhost|(?:.*\\.)?steemit.com)${domainPath}`}), flags)
export const youTube = (flags = 'i') => new RegExp(urlSet({domain: '(?:(?:.*\.)?youtube.com|youtu.be)'}), flags)
export const image = (flags = 'i') => new RegExp(urlSet({path: imagePath}), flags)
export const imageFile = (flags = 'i') => new RegExp(imagePath, flags)
// export const nonImage = (flags = 'i') => new RegExp(urlSet({path: '!' + imageFile}), flags)
// export const markDownImageRegExp = (flags = 'i') => new RegExp('\!\[[\w\s]*\]\(([^\)]+)\)', flags);

export default {
    any: any(),
    local: local(),
    remote: remote(),
    image: image(),
    imageFile: imageFile(),
    youTube: youTube(),
    youTubeId: /(?:(?:youtube.com\/watch\?v=)|(?:youtu.be\/)|(?:youtube.com\/embed\/))([A-Za-z0-9\_\-]+)/i,
    // simpleLink: new RegExp(`<a href="(.*)">(.*)<\/a>`, 'ig'),
    ipfsPrefix: /(https?:\/\/.*)?\/ipfs/i,
}

// Original regex
// const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';

// About performance
// Using exec on the same regex object requires a new regex to be created and compile for each text (ex: post).  Instead replace can be used `body.replace(remoteRe, l => {` discarding the result for better performance`}).  Re-compiling is a chrome bottleneck but did not effect nodejs.
