/* Stub content (or objects) that may be inserted into the UI before being accepted by the blockchain. */

//TODO!
import { LIQUID_TICKER, DEBT_TICKER } from 'app/client_config';
export const emptyContent = {
    id: '2.8.0',
    author: '',
    permlink: '',
    category: '',
    parent_author: '',
    parent_permlink: '',
    title: '',
    body: '',
    json_metadata: '{}',
    last_update: new Date().toISOString(),
    created: new Date().toISOString(),
    depth: 0,
    children: 0,
    net_rshares: 0,
    payout_at: new Date().toISOString(),
    total_payout_value: ['0.000', DEBT_TICKER].join(' '),
    pending_payout_value: ['0.000', LIQUID_TICKER].join(' '),
    total_pending_payout_value: ['0.000', LIQUID_TICKER].join(' '),
    active_votes: [],
    replies: [],
    stats: {
        gray: false,
        hide: false,
    },
};
