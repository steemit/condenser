const providers = /\b(?:coub\.com|facebook\.com|instagram\.com|vk\.com|twitch\.tv|imdb\.com|tripadvisor\.com|codepen\.io|slideshare\.net|speakerdeck\.com|kickstarter\.com|indiegogo\.com)$/i;

export function isWhite (url) { return providers.test(url) }

