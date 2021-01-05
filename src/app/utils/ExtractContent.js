import remarkableStripper from 'app/utils/RemarkableStripper';
import links from 'app/utils/Links';
import sanitize from 'sanitize-html';
import { htmlDecode } from 'app/utils/Html';
import HtmlReady from 'shared/HtmlReady';
import Remarkable from 'remarkable';

const remarkable = new Remarkable({ html: true, linkify: false });

const getValidImage = array => {
    return array &&
        Array.isArray(array) &&
        array.length >= 1 &&
        typeof array[0] === 'string'
        ? array[0]
        : null;
};

export function extractImageLink(json_metadata, body = null) {
    let json = json_metadata || {};
    let image_link;

    try {
        image_link = json && json.image ? getValidImage(json.image) : null;
    } catch (error) {}

    // If nothing found in json metadata, parse body and check images/links
    if (!image_link) {
        let rtags;
        {
            const isHtml = /^<html>([\S\s]*)<\/html>$/.test(body);
            const htmlText = isHtml
                ? body
                : remarkable.render(
                      body
                          ? body.replace(
                                /<!--([\s\S]+?)(-->|$)/g,
                                '(html comment removed: $1)'
                            )
                          : null
                  );
            rtags = HtmlReady(htmlText, { mutate: false });
        }

        [image_link] = Array.from(rtags.images);
    }

    // Was causing broken thumnails.  IPFS was not finding images uploaded to another server until a restart.
    // if(config.ipfs_prefix && image_link) // allow localhost nodes to see ipfs images
    //     image_link = image_link.replace(links.ipfsPrefix, config.ipfs_prefix)

    return image_link;
}

/**
 * Short description - remove bold and header, links with titles.
 *
 * if `strip_quotes`, try to remove any block quotes at beginning of body.
 */
export function extractBodySummary(body, strip_quotes = false) {
    let desc = body;
    if (strip_quotes)
        desc = desc.replace(/(^(\n|\r|\s)*)>([\s\S]*?).*\s*/g, '');
    desc = remarkableStripper.render(desc); // render markdown to html
    desc = sanitize(desc, { allowedTags: [] }); // remove all html, leaving text
    desc = htmlDecode(desc);

    // Strip any raw URLs from preview text
    desc = desc.replace(/https?:\/\/[^\s]+/g, '');

    // Grab only the first line (not working as expected. does rendering/sanitizing strip newlines?)
    desc = desc.trim().split('\n')[0];

    if (desc.length > 140) {
        desc = desc.substring(0, 140).trim();

        // Truncate, remove the last (likely partial) word (along with random punctuation), and add ellipses
        desc = desc
            .substring(0, 120)
            .trim()
            .replace(/[,!\?]?\s+[^\s]+$/, '…');
    }

    return desc;
}

export function highlightKeyword(text, keyword, color) {
    if (!text) return '';
    var content = text.split(keyword);
    var newText = content.join(
        `<span style="background: ${color};">${keyword}</span>`
    );
    return newText;
}
