/* Stub content (or objects) that may be inserted into the UI before being accepted by the blockchain. */

//TODO!
import { LIQUID_TICKER, DEBT_TICKER } from 'app/client_config';
export const emptyContent = {
    fetched: new Date(), /// the date at which this data was requested from the server
    id: '2.8.0',
    author: '',
    permlink: '',
    category: '',
    i18n_category: '',
    parent_author: '',
    parent_permlink: '',
    title: '',
    body: '',
    json_metadata: '{}',
    last_update: new Date().toISOString(),
    created: new Date().toISOString(),
    depth: 0,
    children: 0,
    children_rshares2: '0',
    net_rshares: 0,
    abs_rshares: 0,
    cashout_time: new Date().toISOString(),
    total_vote_weight: '0',
    total_payout_value: ['0.000', DEBT_TICKER].join(' '),
    pending_payout_value: ['0.000', LIQUID_TICKER].join(' '),
    total_pending_payout_value: ['0.000', LIQUID_TICKER].join(' '),
    active_votes: [],
    replies: [],
    stats: {
        authorRepLog10: 86,
        gray: false,
        hasPendingPayout: false,
        allowDelete: true,
        hide: false,
    },
};
