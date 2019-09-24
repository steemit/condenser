import { Map } from 'immutable';
import assert from 'assert';
import constants from 'app/redux/constants';
import { parsePayoutAmount } from 'app/utils/ParsersAndFormatters';
import { Long } from 'bytebuffer';
import { VEST_TICKER, LIQUID_TICKER } from 'app/client_config';
import { fromJS } from 'immutable';
import { formatter } from '@steemit/steem-js';

export const numberWithCommas = x => x.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function ifHive(category) {
    return category && category.substring(0, 5) == 'hive-' ? category : null;
}

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
    if (!(comment instanceof Map)) comment = fromJS(comment);
    const rshares = String(comment.get('net_rshares'));
    const hasPayout = !(rshares[0] == '0' || rshares[0] == '-');
    const hasChildren = comment.get('children') !== 0;
    return !(hasPayout || hasChildren);
}

export function hasNsfwTag(content) {
    // Combine tags+category to check nsfw status
    const json = content.get('json_metadata');
    let tags = [];
    try {
        tags = (json && JSON.parse(json).tags) || [];
        if (typeof tags == 'string') {
            tags = [tags];
        }
        if (!Array.isArray(tags)) {
            tags = [];
        }
    } catch (e) {
        tags = [];
    }
    tags.push(content.get('category'));
    tags = filterTags(tags);
    const isNsfw = tags.filter(tag => tag && tag.match(/^nsfw$/i)).length > 0;
    return isNsfw;
}

export function contentStats(content) {
    if (!content) return {};
    if (!(content instanceof Map)) content = fromJS(content);

    let stats = content.get('stats', Map());

    let net_rshares_adj = Long.ZERO;
    let total_votes = 0;

    // TODO: breaks if content has no active_votes attribute.
    content.get('active_votes').forEach(v => {
        const sign = Math.sign(v.get('percent'));
        if (sign === 0) return;
        total_votes += 1;

        // For graying: ignore tiny downvotes (9 digits or less)
        const rshares = String(v.get('rshares'));
        if (!(rshares.substring(0, 1) === '-' && rshares.length < 11)) {
            net_rshares_adj = net_rshares_adj.add(rshares);
        }
    });

    // post must have non-trivial negative rshares to be grayed out. (more than 10 digits)
    const grayThreshold = -9999999999;
    const meetsGrayThreshold = net_rshares_adj.compare(grayThreshold) < 0;

    const hasPendingPayout =
        parsePayoutAmount(content.get('pending_payout_value')) >= 0.02;
    const authorRep = content.get('author_reputation');

    // TODO: remove 'gray' and 'hide' entirely when served by API
    if (!stats.has('gray')) {
        console.log('append internal stats values', stats, content.toJS());
        stats['gray'] =
            !hasPendingPayout && (authorRep < 1 || meetsGrayThreshold);
        stats['hide'] = !hasPendingPayout && authorRep < 0; // rephide
    }

    stats['total_votes'] = total_votes;

    return stats;
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
