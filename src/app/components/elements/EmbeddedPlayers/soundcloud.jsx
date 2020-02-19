/**
 * Regular expressions for detecting and validating provider URLs
 * @type {{htmlReplacement: RegExp, main: RegExp, sanitize: RegExp}}
 */
const regex = {
    sanitize: /^https:\/\/w.soundcloud.com\/player\/.*?url=(.+?)&.*/i,
};

export default regex;

/**
 * Check if the iframe code in the post editor is to an allowed URL
 * <iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/257659076&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>
 * @param url
 * @returns {boolean|*}
 */
export function validateIframeUrl(url) {
    const match = url.match(regex.sanitize);

    if (!match || match.length !== 2) {
        return false;
    }

    return `https://w.soundcloud.com/player/?url=${
        match[1]
    }&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`;
}
