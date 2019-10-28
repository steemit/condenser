import constants from 'app/redux/constants';
import { formatter } from '@steemit/steem-js';

export const numberWithCommas = x =>
    String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function isFetchingOrRecentlyUpdated(global_status, order, category) {
    const status = global_status
        ? global_status.getIn([category || '', order])
        : null;
    if (!status) return false;
    if (status.fetching) return true;
    if (status.last_fetch) {
        const res =
            new Date() - status.last_fetch <
            constants.FETCH_DATA_EXPIRE_SEC * 1000;
        return res;
    }
    return false;
}

export function allowDelete(comment) {
    const rshares = String(comment.get('net_rshares'));
    const hasPayout = !(rshares[0] == '0' || rshares[0] == '-');
    const hasChildren = comment.get('children') !== 0;
    const archived = comment.get('is_paidout');
    return !(hasPayout || hasChildren) && !archived;
}

export function normalizeTags(metadata, category) {
    let tags = [];

    try {
        tags = (metadata && metadata.toJS().tags) || [];
        //if (typeof tags == 'string') tags = [tags];
        if (!Array.isArray(tags)) tags = [];
    } catch (e) {
        tags = [];
    }

    tags.unshift(category);

    return filterTags(tags);
}

export function parseJsonTags(post) {
    return normalizeTags(post.get('json_metadata'), post.get('category'));
}

export function hasNsfwTag(content) {
    return parseJsonTags(content).filter(t => t.match(/^nsfw$/i)).length > 0;
}

export function filterTags(tags) {
    return tags
        .filter(tag => typeof tag === 'string')
        .filter((value, index, self) => value && self.indexOf(value) === index);
}

export function pricePerSteem(state) {
    const feed_price = state.global.get('feed_price');
    if (feed_price && feed_price.has('base') && feed_price.has('quote')) {
        return formatter.pricePerSteem(feed_price.toJS());
    }
    return undefined;
}
