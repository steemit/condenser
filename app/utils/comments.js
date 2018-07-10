import { Long } from 'bytebuffer';
import { parsePayoutAmount } from './ParsersAndFormatters';

export function sortComments(cont, comments, sortOrder) {
    let sortFunc = null;

    if (sortOrder === 'votes') {
        comments.sort((a, b) => {
            const aactive = countUpvotes(cont.get(a));
            const bactive = countUpvotes(cont.get(b));

            return bactive - aactive;
        });
    } else if (sortOrder === 'new') {
        comments.sort((a, b) => {
            const acontent = cont.get(a);
            const bcontent = cont.get(b);

            if (netNegative(acontent)) {
                return 1;
            } else if (netNegative(bcontent)) {
                return -1;
            }
            const aactive = Date.parse(acontent.get('created'));
            const bactive = Date.parse(bcontent.get('created'));
            return bactive - aactive;
        });
    } else if (sortOrder === 'trending') {
        comments.sort((a, b) => {
            const acontent = cont.get(a);
            const bcontent = cont.get(b);

            if (netNegative(acontent)) {
                return 1;
            } else if (netNegative(bcontent)) {
                return -1;
            }

            const apayout = totalPayout(acontent);
            const bpayout = totalPayout(bcontent);

            if (apayout !== bpayout) {
                return bpayout - apayout;
            }

            // If SBD payouts were equal, fall back to rshares sorting
            return netRshares(bcontent).compare(netRshares(acontent));
        });
    } else if (sortOrder === 'old') {
        comments.sort((a, b) => {
            const acontent = cont.get(a);
            const bcontent = cont.get(b);

            if (netNegative(acontent)) {
                return 1;
            } else if (netNegative(bcontent)) {
                return -1;
            }

            const aactive = Date.parse(acontent.get('created'));
            const bactive = Date.parse(bcontent.get('created'));

            return aactive - bactive;
        });
    }
}

function netRshares(a) {
    return Long.fromString(String(a.get('net_rshares')));
}

function totalPayout(a) {
    return (
        parsePayoutAmount(a.get('pending_payout_value')) +
        parsePayoutAmount(a.get('total_payout_value')) +
        parsePayoutAmount(a.get('curator_payout_value'))
    );
}

function countUpvotes(a) {
    return a.get('active_votes').filter(vote => vote.get('percent') > 0).size;
}

function netNegative(a) {
    return a.get('net_rshares') < 0;
}
