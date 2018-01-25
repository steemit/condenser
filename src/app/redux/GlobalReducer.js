import { Map, Set, List, fromJS, Iterable } from 'immutable';
import { emptyContent } from 'app/redux/EmptyState';
import { contentStats } from 'app/utils/StateFunctions';
import constants from './constants';

export const emptyContentMap = Map(emptyContent);

export const defaultState = Map({ status: {} });

// Action constants
const SET_COLLAPSED = 'global/SET_COLLAPSED';
const RECEIVE_STATE = 'global/RECEIVE_STATE';
const RECEIVE_ACCOUNT = 'global/RECEIVE_ACCOUNT';
const RECEIVE_COMMENT = 'global/RECEIVE_COMMENT';
const RECEIVE_CONTENT = 'global/RECEIVE_CONTENT';
const LINK_REPLY = 'global/LINK_REPLY';
const UPDATE_ACCOUNT_WITNESS_VOTE = 'global/UPDATE_ACCOUNT_WITNESS_VOTE';
const UPDATE_ACCOUNT_WITNESS_PROXY = 'global/UPDATE_ACCOUNT_WITNESS_PROXY';
const DELETE_CONTENT = 'global/DELETE_CONTENT';
const VOTED = 'global/VOTED';
const FETCHING_DATA = 'global/FETCHING_DATA';
const RECEIVE_DATA = 'global/RECEIVE_DATA';
const RECEIVE_RECENT_POSTS = 'global/RECEIVE_RECENT_POSTS';
const REQUEST_META = 'global/REQUEST_META';
const RECEIVE_META = 'global/RECEIVE_META';
const SET = 'global/SET';
const REMOVE = 'global/REMOVE';
const UPDATE = 'global/UPDATE';
const SET_META_DATA = 'global/SET_META_DATA';
const CLEAR_META = 'global/CLEAR_META';
const CLEAR_META_ELEMENT = 'global/CLEAR_META_ELEMENT';
const FETCH_JSON = 'global/FETCH_JSON';
const FETCH_JSON_RESULT = 'global/FETCH_JSON_RESULT';
const SHOW_DIALOG = 'global/SHOW_DIALOG';
const HIDE_DIALOG = 'global/HIDE_DIALOG';
// Saga-related:
export const GET_STATE = 'global/GET_STATE';

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
            let new_state = fromJS(payload);
            if (new_state.has('content')) {
                const content = new_state.get('content').withMutations(c => {
                    c.forEach((cc, key) => {
                        cc = emptyContentMap.mergeDeep(cc);
                        const stats = fromJS(contentStats(cc));
                        c.setIn([key, 'stats'], stats);
                    });
                });
                new_state = new_state.set('content', content);
            }
            return state.mergeDeep(new_state);
        }

        case RECEIVE_ACCOUNT: {
            const account = fromJS(payload.account, (key, value) => {
                if (key === 'witness_votes') return value.toSet();
                const isIndexed = Iterable.isIndexed(value);
                return isIndexed ? value.toList() : value.toOrderedMap();
            });
            // Merging accounts: A get_state will provide a very full account but a get_accounts will provide a smaller version
            return state.updateIn(['accounts', account.get('name')], Map(), a =>
                a.mergeDeep(account)
            );
        }

        case RECEIVE_COMMENT: {
            const {
                author,
                permlink,
                parent_author = '',
                parent_permlink = '',
                title = '',
                body,
            } = payload.op;
            const key = author + '/' + permlink;
            let updatedState = state.updateIn(
                ['content', key],
                Map(emptyContent),
                r =>
                    r.merge({
                        author,
                        permlink,
                        parent_author,
                        parent_permlink,
                        title: title.toString('utf-8'),
                        body: body.toString('utf-8'),
                    })
            );
            if (parent_author !== '' && parent_permlink !== '') {
                const parent_key = parent_author + '/' + parent_permlink;
                updatedState = updatedState.updateIn(
                    ['content', parent_key, 'replies'],
                    List(),
                    r => r.insert(0, key)
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
            }
            return updatedState;
        }

        case RECEIVE_CONTENT: {
            const content = fromJS(payload.content);
            const key = content.get('author') + '/' + content.get('permlink');
            return state.updateIn(['content', key], Map(), c => {
                c = emptyContentMap.mergeDeep(c);
                c = c.delete('active_votes');
                c = c.mergeDeep(content);
                c = c.set('stats', fromJS(contentStats(c)));
                return c;
            });
        }

        case LINK_REPLY: {
            const {
                author,
                permlink,
                parent_author = '',
                parent_permlink = '',
            } = payload;
            if (parent_author === '' || parent_permlink === '') return state;
            const key = author + '/' + permlink;
            const parent_key = parent_author + '/' + parent_permlink;
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

        case UPDATE_ACCOUNT_WITNESS_VOTE: {
            const { account, witness, approve } = payload;
            return state.updateIn(
                ['accounts', account, 'witness_votes'],
                Set(),
                votes =>
                    approve
                        ? Set(votes).add(witness)
                        : Set(votes).remove(witness)
            );
        }

        case UPDATE_ACCOUNT_WITNESS_PROXY: {
            const { account, proxy } = payload;
            return state.setIn(['accounts', account, 'proxy'], proxy);
        }

        case DELETE_CONTENT: {
            const { author, permlink } = payload;
            const key = author + '/' + permlink;
            const content = state.getIn(['content', key]);
            const parent_author = content.get('parent_author') || '';
            const parent_permlink = content.get('parent_permlink') || '';
            let updatedState = state.deleteIn(['content', key]);
            if (parent_author !== '' && parent_permlink !== '') {
                const parent_key = parent_author + '/' + parent_permlink;
                updatedState = updatedState.updateIn(
                    ['content', parent_key, 'replies'],
                    List(),
                    r => r.filter(i => i !== key)
                );
            }
            return updatedState;
        }

        case VOTED: {
            const { username, author, permlink, weight } = payload;
            const key = ['content', author + '/' + permlink, 'active_votes'];
            let active_votes = state.getIn(key, List());
            const idx = active_votes.findIndex(
                v => v.get('voter') === username
            );
            // steemd flips weight into percent
            if (idx === -1) {
                active_votes = active_votes.push(
                    Map({ voter: username, percent: weight })
                );
            } else {
                active_votes = active_votes.set(
                    idx,
                    Map({ voter: username, percent: weight })
                );
            }
            state.setIn(key, active_votes);
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
            const { data, order, category, accountname } = payload;
            let new_state;
            if (
                order === 'by_author' ||
                order === 'by_feed' ||
                order === 'by_comments' ||
                order === 'by_replies'
            ) {
                // category is either "blog", "feed", "comments", or "recent_replies" (respectively) -- and all posts are keyed under current profile
                const key = ['accounts', accountname, category];
                new_state = state.updateIn(key, List(), list => {
                    return list.withMutations(posts => {
                        data.forEach(value => {
                            const key2 = `${value.author}/${value.permlink}`;
                            if (!posts.includes(key2)) posts.push(key2);
                        });
                    });
                });
            } else {
                new_state = state.updateIn(
                    ['discussion_idx', category || '', order],
                    list => {
                        return list.withMutations(posts => {
                            data.forEach(value => {
                                const entry = `${value.author}/${
                                    value.permlink
                                }`;
                                if (!posts.includes(entry)) posts.push(entry);
                            });
                        });
                    }
                );
            }
            new_state = new_state.updateIn(['content'], content => {
                return content.withMutations(map => {
                    data.forEach(value => {
                        const key = `${value.author}/${value.permlink}`;
                        value = fromJS(value);
                        value = value.set('stats', fromJS(contentStats(value)));
                        map.set(key, value);
                    });
                });
            });
            new_state = new_state.updateIn(
                ['status', category || '', order],
                () => {
                    if (data.length < constants.FETCH_DATA_BATCH_SIZE) {
                        return { fetching: false, last_fetch: new Date() };
                    }
                    return { fetching: false };
                }
            );
            return new_state;
        }
        case RECEIVE_RECENT_POSTS: {
            const { data } = payload;
            let new_state = state.updateIn(
                ['discussion_idx', '', 'created'],
                list => {
                    if (!list) list = List();
                    return list.withMutations(posts => {
                        data.forEach(value => {
                            const entry = `${value.author}/${value.permlink}`;
                            if (!posts.includes(entry)) posts.unshift(entry);
                        });
                    });
                }
            );
            new_state = new_state.updateIn(['content'], content => {
                return content.withMutations(map => {
                    data.forEach(value => {
                        const key = `${value.author}/${value.permlink}`;
                        if (!map.has(key)) {
                            value = fromJS(value);
                            value = value.set(
                                'stats',
                                fromJS(contentStats(value))
                            );

                            map.set(key, value);
                        }
                    });
                });
            });
            return new_state;
        }

        case REQUEST_META: {
            const { id, link } = payload;
            return state.setIn(['metaLinkData', id], Map({ link }));
        }

        case RECEIVE_META: {
            const { id, meta } = payload;
            return state.updateIn(['metaLinkData', id], data =>
                data.merge(meta)
            );
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

        case SET_META_DATA: {
            const { id, meta } = payload;
            return state.setIn(['metaLinkData', id], fromJS(meta));
        }

        case CLEAR_META: {
            return state.deleteIn(['metaLinkData', payload.id]);
        }

        case CLEAR_META_ELEMENT: {
            const { formId, element } = payload;
            return state.updateIn(['metaLinkData', formId], data =>
                data.remove(element)
            );
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

export const receiveAccount = payload => ({
    type: RECEIVE_ACCOUNT,
    payload,
});

export const receiveComment = payload => ({
    type: RECEIVE_COMMENT,
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

export const updateAccountWitnessVote = payload => ({
    type: UPDATE_ACCOUNT_WITNESS_VOTE,
    payload,
});

export const updateAccountWitnessProxy = payload => ({
    type: UPDATE_ACCOUNT_WITNESS_PROXY,
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

export const receiveRecentPosts = payload => ({
    type: RECEIVE_RECENT_POSTS,
    payload,
});

export const requestMeta = payload => ({
    type: REQUEST_META,
    payload,
});

export const receiveMeta = payload => ({
    type: RECEIVE_META,
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

export const setMetaData = payload => ({
    type: SET_META_DATA,
    payload,
});

export const clearMeta = payload => ({
    type: CLEAR_META,
    payload,
});

export const clearMetaElement = payload => ({
    type: CLEAR_META_ELEMENT,
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

export const getState = payload => ({
    type: GET_STATE,
    payload,
});
