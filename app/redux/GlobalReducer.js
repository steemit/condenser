import {Map, Set, List, fromJS, Iterable} from 'immutable';
import createModule from 'redux-modules';
import {emptyContent} from 'app/redux/EmptyState';
import constants from './constants';
import {contentStats, fromJSGreedy} from 'app/utils/StateFunctions'

const emptyContentMap = Map(emptyContent)

export default createModule({
    name: 'global',
    initialState: Map({status: {}}),
    transformations: [
        {
            action: 'SET_COLLAPSED',
            reducer: (state, action) => {
                return state.withMutations(map => {
                    map.updateIn(['content', action.payload.post], value => {
                        value.merge(Map({collapsed: action.payload.collapsed}));
                    });
                });
            }
        },
        {
            action: 'FETCHING_STATE',
            reducer: (state, {payload: fetching}) => {
                return state.mergeDeep({fetching: fetching});
            }
        },
        {
            action: 'RECEIVE_STATE',
            reducer: (state, action) => {
                let payload = fromJS(action.payload)
                if(payload.has('content')) {
                    const content = payload.get('content').withMutations(c => {
                        c.forEach((cc, key) => {
                            cc = emptyContentMap.mergeDeep(cc)
                            const stats = fromJS(contentStats(cc))
                            c.setIn([key, 'stats'], stats)
                        })
                    })
                    payload = payload.set('content', content)

                    // TODO reserved words used in account names, find correct solution
                    if (!Map.isMap(payload.get('accounts'))) {
                      const accounts = payload.get('accounts')
                      payload = payload.set('accounts', fromJSGreedy(accounts))
                    }
                  }
                // console.log('state.mergeDeep(action.payload).toJS(), action.payload', state.mergeDeep(action.payload).toJS(), action.payload)
                return state.mergeDeep(payload);
            }
        },
        {
            action: 'RECEIVE_ACCOUNT',
            reducer: (state, {payload: {account}}) => {
                account = fromJS(account, (key, value) => {
                    if (key === 'witness_votes') return value.toSet()
                    const isIndexed = Iterable.isIndexed(value);
                    return isIndexed ? value.toList() : value.toOrderedMap();
                })
                // Merging accounts: A get_state will provide a very full account but a get_accounts will provide a smaller version
                return state.updateIn(['accounts', account.get('name')], Map(), a => a.mergeDeep(account))
            }
        },
        {
            action: 'RECEIVE_COMMENT',
            reducer: (state, {payload: op}) => {
                const {author, permlink, parent_author = '', parent_permlink = '', title = '', body} = op
                const key = author + '/' + permlink

                let updatedState = state.updateIn(['content', key], Map(emptyContent), r => r.merge({
                    author, permlink, parent_author, parent_permlink,
                    title: title.toString('utf-8'),
                    body: body.toString('utf-8'),
                }))
                // console.log('<----------- updatedState content :', updatedState.getIn(['content', key]).toJS())

                if (parent_author !== '' && parent_permlink !== '') {
                    const parent_key = parent_author + '/' + parent_permlink
                    updatedState = updatedState.updateIn(['content', parent_key, 'replies'], List(), r => r.insert(0, key))
                    // console.log('updatedState parent', updatedState.toJS())
                }
                return updatedState
            }
        },
        {
            action: 'RECEIVE_CONTENT',
            reducer: (state, {payload: {content}}) => {
                // console.log('GlobalReducer -- RECEIVE_CONTENT content', content)
                content = fromJS(content)
                const key = content.get('author') + '/' + content.get('permlink')
                return state.updateIn(['content', key], Map(), c => {
                    c = emptyContentMap.mergeDeep(c)
                    c = c.delete('active_votes')
                    c = c.mergeDeep(content)
                    c = c.set('stats', fromJS(contentStats(c)))
                    return c
                })
            }
        },
        { // works...
            action: 'LINK_REPLY',
            reducer: (state, {payload: op}) => {
                const {author, permlink, parent_author = '', parent_permlink = ''} = op
                if (parent_author === '' || parent_permlink === '') return state
                const key = author + '/' + permlink
                const parent_key = parent_author + '/' + parent_permlink
                // Add key if not exist
                return state.updateIn(['content', parent_key, 'replies'], List(),
                    l => (l.findIndex(i => i === key) === -1 ? l.push(key) : l))
            }
        },
        { // works...
            action: 'UPDATE_ACCOUNT_WITNESS_VOTE',
            reducer: (state, {payload: {account, witness, approve}}) =>
                state.updateIn(['accounts', account, 'witness_votes'], Set(),
                    votes => (approve ? Set(votes).add(witness) : Set(votes).remove(witness)))
        },
        { // works...
            action: 'UPDATE_ACCOUNT_WITNESS_PROXY',
            reducer: (state, {payload: {account, proxy}}) =>
                    state.setIn(['accounts', account, 'proxy'], proxy)
        },
        {
            action: 'DELETE_CONTENT',
            reducer: (state, {payload: {author, permlink}}) => {
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
                return updatedState
            }
        },
        {
            action: 'VOTED',
            reducer: (state, {payload: {username, author, permlink, weight}}) => {
                const key = ['content', author + '/' + permlink, 'active_votes']
                let active_votes = state.getIn(key, List())
                const idx = active_votes.findIndex(v => v.get('voter') === username)
                // steemd flips weight into percent
                if(idx === -1)
                    active_votes = active_votes.push(Map({voter: username, percent: weight}))
                else {
                    active_votes = active_votes.set(idx, Map({voter: username, percent: weight}))
                }
                return state.setIn(key, active_votes)
            }
        },
        {
            action: 'FETCHING_DATA',
            reducer: (state, {payload: {order, category}}) => {
                const new_state = state.updateIn(['status', category || '', order], () => {
                    return {fetching: true};
                });
                return new_state;
            }
        },
        {
            action: 'RECEIVE_DATA',
            reducer: (state, {payload: {data, order, category, author, accountname, /*permlink*/}}) => {
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
                        if (!list) list = List();
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
                            // console.log('GlobalReducer -- RECEIVE_DATA', value)
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
                // console.log('-- new_state -->', new_state.toJS());
                return new_state;
            }
        },
        {
            action: 'RECEIVE_RECENT_POSTS',
            reducer: (state, {payload: {data}}) => {
                // console.log('-- RECEIVE_RECENT_POSTS state -->', state.toJS());
                // console.log('-- RECEIVE_RECENT_POSTS reducer -->', data);
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
                // console.log('-- new_state -->', new_state.toJS());
                return new_state;
            }
        },
        {
            action: 'REQUEST_META', // browser console debug
            reducer: (state, {payload: {id, link}}) =>
                state.setIn(['metaLinkData', id], Map({link}))
        },
        {
            action: 'RECEIVE_META', // browser console debug
            reducer: (state, {payload: {id, meta}}) =>
                state.updateIn(['metaLinkData', id], data => data.merge(meta))
        },
        {
            action: 'SET',
            reducer: (state, {payload: {key, value}}) => {
                key = Array.isArray(key) ? key : [key]
                return state.setIn(key, fromJS(value))
            }
        },
        {
            action: 'REMOVE',
            reducer: (state, {payload: {key}}) => {
                key = Array.isArray(key) ? key : [key]
                return state.removeIn(key)
            }
        },
        {
            action: 'UPDATE',
            reducer: (state, {payload: {key, notSet = Map(), updater}}) =>
                // key = Array.isArray(key) ? key : [key] // TODO enable and test
                state.updateIn(key, notSet, updater)
        },
        {
            action: 'SET_META_DATA', // browser console debug
            reducer: (state, {payload: {id, meta}}) =>
                state.setIn(['metaLinkData', id], fromJS(meta))
        },
        {
            action: 'CLEAR_META', // browser console debug
            reducer: (state, {payload: {id}}) =>
                state.deleteIn(['metaLinkData', id])
        },
        {
            action: 'CLEAR_META_ELEMENT', // browser console debug
            reducer: (state, {payload: {formId, element}}) =>
                state.updateIn(['metaLinkData', formId], data => data.remove(element))
        },
        {
            action: 'FETCH_JSON',
            reducer: state => state // saga
        },
        {
            action: 'FETCH_JSON_RESULT',
            reducer: (state, {payload: {id, result, error}}) =>
                state.set(id, fromJS({result, error}))
        },
        {
            action: 'SHOW_DIALOG',
            reducer: (state, {payload: {name, params = {}}}) =>
                state.update('active_dialogs', Map(), d => d.set(name, fromJS({params})))
        },
        {
            action: 'HIDE_DIALOG',
            reducer: (state, {payload: {name}}) =>
                state.update('active_dialogs', d => d.delete(name))
        },

    ]
});
