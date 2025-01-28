import { Map, List, fromJS, Iterable } from 'immutable';

export const defaultState = Map({
    status: {},
});

// Action constants
const SET_COLLAPSED = 'global/SET_COLLAPSED';
const RECEIVE_STATE = 'global/RECEIVE_STATE';
const RECEIVE_NOTIFICATIONS = 'global/RECEIVE_NOTIFICATIONS';
const RECEIVE_UNREAD_NOTIFICATIONS = 'global/RECEIVE_UNREAD_NOTIFICATIONS';
const NOTIFICATIONS_LOADING = 'global/NOTIFICATIONS_LOADING';
const RECEIVE_ACCOUNT = 'global/RECEIVE_ACCOUNT';
const RECEIVE_ACCOUNTS = 'global/RECEIVE_ACCOUNTS';
const RECEIVE_POST_HEADER = 'global/RECEIVE_POST_HEADER';
const RECEIVE_COMMUNITY = 'global/RECEIVE_COMMUNITY';
const RECEIVE_COMMUNITIES = 'global/RECEIVE_COMMUNITIES';
const LOADING_SUBSCRIPTIONS = 'global/LOADING_SUBSCRIPTIONS';
const RECEIVE_SUBSCRIPTIONS = 'global/RECEIVE_SUBSCRIPTIONS';
const SYNC_SPECIAL_POSTS = 'global/SYNC_SPECIAL_POSTS';
const RECEIVE_CONTENT = 'global/RECEIVE_CONTENT';
const LINK_REPLY = 'global/LINK_REPLY';
const DELETE_CONTENT = 'global/DELETE_CONTENT';
const VOTED = 'global/VOTED';
const FETCHING_DATA = 'global/FETCHING_DATA';
const RECEIVE_DATA = 'global/RECEIVE_DATA';
const SET = 'global/SET';
const REMOVE = 'global/REMOVE';
const UPDATE = 'global/UPDATE';
const FETCH_JSON = 'global/FETCH_JSON';
const FETCH_JSON_RESULT = 'global/FETCH_JSON_RESULT';
const SHOW_DIALOG = 'global/SHOW_DIALOG';
const HIDE_DIALOG = 'global/HIDE_DIALOG';
const RECEIVE_REWARDS = 'global/RECEIVE_REWARDS';
export const GET_DGP = 'global/GET_DGP';
export const SET_DGP = 'global/SET_DGP';
const SET_VESTS_PER_STEEM = 'global/SET_VESTS_PER_STEEM';
const NOTICES = 'global/NOTICES';
const TAGSLIST = 'global/TAGSLIST';
const FOLLOWERSLIST = 'global/FOLLOWERSLIST';

const postKey = (author, permlink) => {
    if ((author || '') === '' || (permlink || '') === '') return null;
    return author + '/' + permlink;
};

/**
 * Transfrom nested JS object to appropriate immutable collection.
 *
 * @param {Object} account
 */

const transformAccount = account =>
    fromJS(account, (key, value) => {
        if (key === 'witness_votes') return value.toSet();
        const isIndexed = Iterable.isIndexed(value);
        return isIndexed ? value.toList() : value.toOrderedMap();
    });

/**
 * Merging accounts: A get_state will provide a very full account but a get_accounts will provide a smaller version this makes sure we don't overwrite
 *
 * @param {Immutable.Map} state
 * @param {Immutable.Map} account
 *
 */

const mergeAccounts = (state, account) => {
    return state.updateIn(['accounts', account.get('name')], Map(), a =>
        a.mergeDeep(account)
    );
};

export default function reducer(state = defaultState, action = {}) {
    const payload = action.payload;

    switch (action.type) {
        case SET_COLLAPSED: {
            return state.withMutations(map => {
                map.updateIn(['content', payload.post], value =>
                    value.merge(Map({ collapsed: payload.collapsed }))
                );
            });
        }

        case RECEIVE_STATE: {
            console.log(
                'Merging state',
                state.mergeDeep(fromJS(payload)).toJS()
            );
            return state.mergeDeep(fromJS(payload));
        }

        case RECEIVE_NOTIFICATIONS: {
            console.log('Receive notifications', payload);
            return state.updateIn(['notifications', payload.name], Map(), n =>
                n.withMutations(nmut =>
                    nmut
                        .update('notifications', List(), a =>
                            a.concat(fromJS(payload.notifications))
                        )
                        .set('isLastPage', payload.isLastPage)
                )
            );
        }

        case RECEIVE_UNREAD_NOTIFICATIONS: {
            return state.setIn(
                ['notifications', payload.name, 'unreadNotifications'],
                Map(payload.unreadNotifications)
            );
        }

        case NOTIFICATIONS_LOADING: {
            return state.setIn(['notifications', 'loading'], payload);
        }

        case RECEIVE_ACCOUNT: {
            const account = transformAccount(payload.account);
            return mergeAccounts(state, account);
        }

        case RECEIVE_ACCOUNTS: {
            return payload.accounts.reduce((acc, curr) => {
                const transformed = transformAccount(curr);
                return mergeAccounts(acc, transformed);
            }, state);
        }

        case RECEIVE_POST_HEADER: {
            return state.update('headers', Map(), a =>
                a.mergeDeep(fromJS(payload))
            );
        }

        case RECEIVE_COMMUNITIES: {
            const map = Map(payload.map(c => [c.name, fromJS(c)]));
            const idx = List(payload.map(c => c.name));

            return state
                .setIn(['community'], map)
                .setIn(['community_idx'], idx);
        }

        case RECEIVE_COMMUNITY: {
            return state.update('community', Map(), a => a.mergeDeep(payload));
        }

        case LOADING_SUBSCRIPTIONS: {
            return state.setIn(['subscriptions', 'loading'], payload);
        }

        case RECEIVE_SUBSCRIPTIONS: {
            return state.setIn(
                ['subscriptions', payload.username],
                fromJS(payload.subscriptions)
            );
        }
        case RECEIVE_REWARDS: {
            return state.set('rewards', fromJS(payload.rewards));
        }
        case NOTICES: {
            return state.set('notices', fromJS(payload));
        }
        case TAGSLIST: {
            console.log('SETTING STATE OF TAGSLIST', payload);
            return state.set('tagsList', fromJS(payload));
        }
        case FOLLOWERSLIST: {
            return state.set('followersList', fromJS(payload));
        }
        // Interleave special posts into the map of posts.
        case SYNC_SPECIAL_POSTS: {
            return payload.featuredPosts
                .concat(payload.promotedPosts)
                .reduce((acc, specialPost) => {
                    const author = specialPost.get('author');
                    const permlink = specialPost.get('permlink');
                    return acc.updateIn(
                        ['content', `${author}/${permlink}`],
                        Map(),
                        p => p.mergeDeep(specialPost)
                    );
                }, state);
        }

        case RECEIVE_CONTENT: {
            const content = fromJS(payload.content);
            const key = content.get('author') + '/' + content.get('permlink');
            console.log('received content...', payload.content);

            // merge content object into map
            let new_state = state.updateIn(['content', key], Map(), c =>
                c.mergeDeep(content)
            );

            // set creation-pending key (optimistic UI update)
            if (content.get('depth') == 0) {
                const category = content.get('category');
                const dkey = ['discussion_idx', category, '_created'];
                new_state = new_state.setIn(dkey, key);
            }

            return new_state;
        }

        case LINK_REPLY: {
            const {
                author,
                permlink,
                parent_author = '',
                parent_permlink = '',
            } = payload;
            const parent_key = postKey(parent_author, parent_permlink);
            if (!parent_key) return state;
            const key = author + '/' + permlink;
            // Add key if not exist
            let updatedState = state.updateIn(
                ['content', parent_key, 'replies'],
                List(),
                l => (l.findIndex(i => i === key) === -1 ? l.push(key) : l)
            );
            const children = updatedState.getIn(
                ['content', parent_key, 'replies'],
                List()
            ).size;
            updatedState = updatedState.updateIn(
                ['content', parent_key, 'children'],
                0,
                () => children
            );
            return updatedState;
        }

        case DELETE_CONTENT: {
            const { author, permlink } = payload;
            const key = author + '/' + permlink;
            const content = state.getIn(['content', key]);
            const parent_key = postKey(
                content.get('parent_author'),
                content.get('parent_permlink')
            );
            let updatedState = state.deleteIn(['content', key]);
            if (parent_key) {
                updatedState = updatedState.updateIn(
                    ['content', parent_key, 'replies'],
                    List(),
                    r => r.filter(i => i !== key)
                );
            }
            return updatedState;
        }

        case VOTED: {
            const { voter, author, permlink, weight } = payload;
            const vote = Map({ voter, percent: weight });
            const key = ['content', author + '/' + permlink, 'active_votes'];
            let votes = state.getIn(key, List());

            const idx = votes.findIndex(v => v.get('voter') === voter);
            votes = idx === -1 ? votes.push(vote) : votes.set(idx, vote);
            console.log('Applying vote @ idx', idx, payload);

            // TODO: new state never returned -- masked by RECEIVE_CONTENT
            state.setIn(key, votes);
            return state;
        }

        case FETCHING_DATA: {
            const { order, category } = payload;
            const new_state = state.updateIn(
                ['status', category || '', order],
                () => {
                    return { fetching: true };
                }
            );
            return new_state;
        }

        case RECEIVE_DATA: {
            const { data, order, category, fetching, endOfData } = payload;
            let new_state;

            // append content keys to `discussion_idx` list
            const key = ['discussion_idx', category || '', order];
            new_state = state.updateIn(key, List(), list => {
                return list.withMutations(posts => {
                    data.forEach(value => {
                        const key = `${value.author}/${value.permlink}`;
                        if (!posts.includes(key)) posts.push(key);
                    });
                });
            });

            // append content to `content` map
            new_state = new_state.updateIn(['content'], content => {
                return content.withMutations(map => {
                    data.forEach(value => {
                        const key = `${value.author}/${value.permlink}`;
                        map.set(key, fromJS(value));
                    });
                });
            });

            // update status
            new_state = new_state.updateIn(
                ['status', category || '', order],
                () => {
                    if (endOfData) {
                        return { fetching, last_fetch: new Date() };
                    }
                    return { fetching };
                }
            );
            return new_state;
        }

        case SET: {
            const { key, value } = payload;
            const key_array = Array.isArray(key) ? key : [key];
            return state.setIn(key_array, fromJS(value));
        }

        case REMOVE: {
            const key = Array.isArray(payload.key)
                ? payload.key
                : [payload.key];
            return state.removeIn(key);
        }

        case UPDATE: {
            const { key, notSet = Map(), updater } = payload;
            return state.updateIn(key, notSet, updater);
        }

        case FETCH_JSON: {
            return state;
        }

        case FETCH_JSON_RESULT: {
            const { id, result, error } = payload;
            return state.set(id, fromJS({ result, error }));
        }

        case SHOW_DIALOG: {
            const { name, params = {} } = payload;
            return state.update('active_dialogs', Map(), d =>
                d.set(name, fromJS({ params }))
            );
        }

        case HIDE_DIALOG: {
            return state.update('active_dialogs', d => d.delete(payload.name));
        }

        case GET_DGP:
            return state;

        case SET_DGP:
            return state.set('dgp', fromJS(payload));

        case SET_VESTS_PER_STEEM:
            return state.set('vests_per_steem', payload);

        default:
            return state;
    }
}

// Action creators

export const setCollapsed = payload => ({
    type: SET_COLLAPSED,
    payload,
});

export const receiveState = payload => ({
    type: RECEIVE_STATE,
    payload,
});

export const receiveNotifications = payload => ({
    type: RECEIVE_NOTIFICATIONS,
    payload,
});

export const receiveUnreadNotifications = payload => ({
    type: RECEIVE_UNREAD_NOTIFICATIONS,
    payload,
});

export const notificationsLoading = payload => ({
    type: NOTIFICATIONS_LOADING,
    payload,
});

export const receiveRewards = payload => ({
    type: RECEIVE_REWARDS,
    payload,
});

export const receiveNotices = payload => ({
    type: NOTICES,
    payload,
});

export const receiveTagsList = payload => ({
    type: TAGSLIST,
    payload,
});

export const receiveFollowersList = payload => ({
    type: FOLLOWERSLIST,
    payload,
});

export const receiveAccount = payload => ({
    type: RECEIVE_ACCOUNT,
    payload,
});

export const receiveAccounts = payload => ({
    type: RECEIVE_ACCOUNTS,
    payload,
});

export const receivePostHeader = payload => ({
    type: RECEIVE_POST_HEADER,
    payload,
});

export const receiveCommunities = payload => ({
    type: RECEIVE_COMMUNITIES,
    payload,
});

export const receiveCommunity = payload => ({
    type: RECEIVE_COMMUNITY,
    payload,
});

export const receiveSubscriptions = payload => ({
    type: RECEIVE_SUBSCRIPTIONS,
    payload,
});
export const loadingSubscriptions = payload => ({
    type: LOADING_SUBSCRIPTIONS,
    payload,
});

export const syncSpecialPosts = payload => ({
    type: SYNC_SPECIAL_POSTS,
    payload,
});

export const receiveContent = payload => ({
    type: RECEIVE_CONTENT,
    payload,
});

export const linkReply = payload => ({
    type: LINK_REPLY,
    payload,
});

export const deleteContent = payload => ({
    type: DELETE_CONTENT,
    payload,
});

export const voted = payload => ({
    type: VOTED,
    payload,
});

export const fetchingData = payload => ({
    type: FETCHING_DATA,
    payload,
});

export const receiveData = payload => ({
    type: RECEIVE_DATA,
    payload,
});

// TODO: Find a better name for this
export const set = payload => ({
    type: SET,
    payload,
});

export const remove = payload => ({
    type: REMOVE,
    payload,
});

export const update = payload => ({
    type: UPDATE,
    payload,
});

export const fetchJson = payload => ({
    type: FETCH_JSON,
    payload,
});

export const fetchJsonResult = payload => ({
    type: FETCH_JSON_RESULT,
    payload,
});

export const showDialog = payload => ({
    type: SHOW_DIALOG,
    payload,
});

export const hideDialog = payload => ({
    type: HIDE_DIALOG,
    payload,
});

export const getDGP = payload => ({
    type: GET_DGP,
    payload,
});

export const setDGP = payload => ({
    type: SET_DGP,
    payload,
});

export const setVestsPerSteem = payload => ({
    type: SET_VESTS_PER_STEEM,
    payload,
});
