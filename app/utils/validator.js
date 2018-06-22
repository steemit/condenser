import { allowedTags } from './SanitizeConfig';

export function checkPostHtml(rtags) {
    for (let tag of allowedTags) {
        rtags.htmltags.delete(tag);
    }

    if (rtags.htmltags.size) {
        return {
            text: 'Please remove the following HTML elements from your post: ' +
                Array(...rtags.htmltags)
                    .map(tag => `<${tag}>`)
                    .join(', '),
        };
    }
}
