import {Map, Set, List, fromJS, Iterable} from 'immutable';
import {emptyContent} from 'app/redux/EmptyState';
import constants from './constants';
import {contentStats} from 'app/utils/StateFunctions';

const emptyContentMap = Map(emptyContent);

const defaultState = Map({status: {}});

export default function reducer(state = defaultState, action) {
    const payload = action.payload;

    if (action.type === 'global/SET_COLLAPSED') {
        return state.withMutations(map => {
            map.updateIn(['content', payload.post], value => {
                value.merge(Map({collapsed: payload.collapsed}));
            });
        });
    }

    if (action.type === 'global/RECEIVE_STATE') {
        let new_state = fromJS(payload)
        if(new_state.has('content')) {
            const content = new_state.get('content').withMutations(c => {
                c.forEach((cc, key) => {
                    cc = emptyContentMap.mergeDeep(cc)
                    const stats = fromJS(contentStats(cc))
                    c.setIn([key, 'stats'], stats)
                })
            })
            new_state = new_state.set('content', content)
        }
        return state.mergeDeep(new_state);
    }

    if (action.type === 'global/RECEIVE_ACCOUNT') {
        const account = fromJS(payload.account, (key, value) => {
            if (key === 'witness_votes') return value.toSet()
            const isIndexed = Iterable.isIndexed(value);
            return isIndexed ? value.toList() : value.toOrderedMap();
        })
        // Merging accounts: A get_state will provide a very full account but a get_accounts will provide a smaller version
        return state.updateIn(['accounts', account.get('name')], Map(), a => a.mergeDeep(account));
    }

    if (action.type === 'global/RECEIVE_COMMENT') {
        const {author, permlink, parent_author = '', parent_permlink = '', title = '', body} = payload.op;
        const key = author + '/' + permlink;
        let updatedState = state.updateIn(['content', key], Map(emptyContent), r => r.merge({
            author, permlink, parent_author, parent_permlink,
            title: title.toString('utf-8'),
            body: body.toString('utf-8'),
        }));
        if (parent_author !== '' && parent_permlink !== '') {
            const parent_key = parent_author + '/' + parent_permlink;
            updatedState = updatedState.updateIn(['content', parent_key, 'replies'], List(), r => r.insert(0, key));
            const children = updatedState.getIn(['content', parent_key, 'replies'], List()).size;
            updatedState = updatedState.updateIn(['content', parent_key, 'children'], 0, () => children);
        }
        return updatedState;
    }

    if (action.type === 'global/RECEIVE_CONTENT') {
        const content = fromJS(payload.content)
        const key = content.get('author') + '/' + content.get('permlink')
        return state.updateIn(['content', key], Map(), c => {
            c = emptyContentMap.mergeDeep(c)
            c = c.delete('active_votes')
            c = c.mergeDeep(content)
            c = c.set('stats', fromJS(contentStats(c)))
            return c
        });
    }

    if (action.type === 'global/LINK_REPLY') {
        const {author, permlink, parent_author = '', parent_permlink = ''} = payload;
        if (parent_author === '' || parent_permlink === '') return state;
        const key = author + '/' + permlink;
        const parent_key = parent_author + '/' + parent_permlink;
        // Add key if not exist
        let updatedState = state.updateIn(['content', parent_key, 'replies'], List(),
            l => (l.findIndex(i => i === key) === -1 ? l.push(key) : l))
        const children = updatedState.getIn(['content', parent_key, 'replies'], List()).size;
        updatedState = updatedState.updateIn(['content', parent_key, 'children'], 0, () => children);
        return updatedState;
    }

    if (action.type === 'global/UPDATE_ACCOUNT_WITNESS_VOTE') {
        const {account, witness, approve} = payload;
        return state.updateIn(['accounts', account, 'witness_votes'], Set(),
            votes => (approve ? Set(votes).add(witness) : Set(votes).remove(witness)));
    }

    if (action.type === 'global/UPDATE_ACCOUNT_WITNESS_PROXY') {
        const {account, proxy} = payload;
        return state.setIn(['accounts', account, 'proxy'], proxy);
    }

    if (action.type === 'global/DELETE_CONTENT') {
        const {author, permlink} = payload;
        const key = author + '/' + permlink
        const content = state.getIn(['content', key])
        const parent_author = content.get('parent_author') || ''
        const parent_permlink = content.get('parent_permlink') || ''
        let updatedState = state.deleteIn(['content', key])
        if (parent_author !== '' && parent_permlink !== '') {
            const parent_key = parent_author + '/' + parent_permlink
            updatedState = updatedState.updateIn(['content', parent_key, 'replies'],
                List(), r => r.filter(i => i !== key))
        }
        return updatedState;
    }

    if (action.type === 'global/VOTED') {
        const {username, author, permlink, weight} = payload;
        const key = ['content', author + '/' + permlink, 'active_votes'];
        let active_votes = state.getIn(key, List());
        const idx = active_votes.findIndex(v => v.get('voter') === username);
        // steemd flips weight into percent
        if(idx === -1) {
            active_votes = active_votes.push(Map({voter: username, percent: weight}));
        } else {
            active_votes = active_votes.set(idx, Map({voter: username, percent: weight}));
        }
        state.setIn(key, active_votes);
        return state;
    }

    if (action.type === 'global/FETCHING_DATA') {
        const {order, category} = payload;
        const new_state = state.updateIn(['status', category || '', order], () => {
            return {fetching: true};
        });
        return new_state;
    }

    if (action.type === 'global/RECEIVE_DATA') {
        const {data, order, category, accountname} = payload;
        let new_state;
        if (order === 'by_author' || order === 'by_feed' || order === 'by_comments' || order === 'by_replies') {
            // category is either "blog", "feed", "comments", or "recent_replies" (respectively) -- and all posts are keyed under current profile
            const key = ['accounts', accountname, category]
            new_state = state.updateIn(key, List(), list => {
                return list.withMutations(posts => {
                    data.forEach(value => {
                        const key2 = `${value.author}/${value.permlink}`
                        if (!posts.includes(key2)) posts.push(key2);
                    });
                });
            });
        } else {
            new_state = state.updateIn(['discussion_idx', category || '', order], list => {
                return list.withMutations(posts => {
                    data.forEach(value => {
                        const entry = `${value.author}/${value.permlink}`;
                        if (!posts.includes(entry)) posts.push(entry);
                    });
                });
            });
        }
        new_state = new_state.updateIn(['content'], content => {
            return content.withMutations(map => {
                data.forEach(value => {
                    const key = `${value.author}/${value.permlink}`;
                    value = fromJS(value)
                    value = value.set('stats', fromJS(contentStats(value)))
                    map.set(key, value);
                });
            });
        });
        new_state = new_state.updateIn(['status', category || '', order], () => {
            if (data.length < constants.FETCH_DATA_BATCH_SIZE) {
                return {fetching: false, last_fetch: new Date()};
            }
            return {fetching: false};
        });
        return new_state;
    }

    if (action.type === 'global/RECEIVE_RECENT_POSTS') {
        const {data} = payload;
        let new_state = state.updateIn(['discussion_idx', '', 'created'], list => {
            if (!list) list = List();
            return list.withMutations(posts => {
                data.forEach(value => {
                    const entry = `${value.author}/${value.permlink}`;
                    if (!posts.includes(entry)) posts.unshift(entry);
                });
            });
        });
        new_state = new_state.updateIn(['content'], content => {
            return content.withMutations(map => {
                data.forEach(value => {
                    const key = `${value.author}/${value.permlink}`;
                    if (!map.has(key)) {
                        value = fromJS(value)
                        value = value.set('stats', fromJS(contentStats(value)))
                        map.set(key, value);
                    }
                });
            });
        });
        return new_state;
    }

    if (action.type === 'global/REQUEST_META') {
        const {id, link} = payload;
        return state.setIn(['metaLinkData', id], Map({link}));
    }

    if (action.type === 'global/RECEIVE_META') {
        const {id, meta} = payload;
        return state.updateIn(['metaLinkData', id], data => data.merge(meta));
    }

    if (action.type === 'global/SET') {
        const {key, value} = payload;
        const key_array = Array.isArray(key) ? key : [key];
        return state.setIn(key_array, fromJS(value));
    }

    if (action.type === 'global/REMOVE') {
        const key = Array.isArray(payload.key) ? payload.key : [payload.key];
        return state.removeIn(key);
    }

    if (action.type === 'global/UPDATE') {
        const {key, notSet = Map(), updater} = payload;
        return state.updateIn(key, notSet, updater);
    }

    if (action.type === 'global/SET_META_DATA') {
        const {id, meta} = payload;
        return state.setIn(['metaLinkData', id], fromJS(meta));
    }

    if (action.type === 'global/CLEAR_META') {
        return state.deleteIn(['metaLinkData', payload.id]);
    }

    if (action.type === 'global/CLEAR_META_ELEMENT') {
        const {formId, element} = payload;
        return state.updateIn(['metaLinkData', formId], data => data.remove(element));
    }

    if (action.type === 'global/FETCH_JSON') {
        return state;
    }

    if (action.type === 'global/FETCH_JSON_RESULT') {
        const {id, result, error} = payload;
        return state.set(id, fromJS({result, error}));
    }

    if (action.type === 'global/SHOW_DIALOG') {
        const {name, params = {}} = payload;
        return state.update('active_dialogs', Map(), d => d.set(name, fromJS({params})));
    }

    if (action.type === 'global/HIDE_DIALOG') {
        return state.update('active_dialogs', d => d.delete(payload.name));
    }

    return state;
}
