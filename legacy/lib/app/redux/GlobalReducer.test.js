'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _immutable = require('immutable');

var _GlobalReducer = require('./GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Global reducer', function () {
    it('should provide a nice initial state', function () {
        var initial = (0, globalActions.default)();
        expect(initial).toEqual(_GlobalReducer.defaultState);
    });
    it('should return correct state for a SET_COLLAPSED action', function () {
        // Arrange
        var payload = {
            post: 'the city',
            collapsed: 'is now collapsed'
        };
        var initial = (0, globalActions.default)().set('content', (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.post, (0, _immutable.Map)({}))));
        // Act
        var actual = (0, globalActions.default)(initial, globalActions.setCollapsed(payload));
        // Assert
        expect(actual.getIn(['content', payload.post, 'collapsed'])).toEqual(payload.collapsed);
    });
    it('should return correct state for a RECEIVE_STATE action', function () {
        // Arrange
        var payload = {
            content: (0, _immutable.Map)({ barman: (0, _immutable.Map)({ foo: 'choo', stats: {} }) })
        };
        var initial = (0, globalActions.default)();
        // Act
        var actual = (0, globalActions.default)(initial, globalActions.receiveState(payload));
        // Assert
        expect(actual.getIn(['content', 'barman', 'foo'])).toEqual('choo');
    });

    it('should return correct state for a RECEIVE_ACCOUNT action', function () {
        // Arrange
        var payload = {
            account: {
                name: 'foo',
                beList: ['alice', 'bob', 'claire'],
                beOrderedMap: { foo: 'barman' }
            }
        };
        var initial = (0, globalActions.default)();
        var expected = (0, _immutable.Map)({
            status: {},
            accounts: (0, _immutable.Map)({
                foo: (0, _immutable.Map)({
                    name: 'foo',
                    be_List: (0, _immutable.List)(['alice', 'bob', 'claire']),
                    be_orderedMap: (0, _immutable.OrderedMap)({ foo: 'barman' })
                })
            })
        });
        // Act
        var actual = (0, globalActions.default)(initial, globalActions.receiveAccount(payload));
        // Assert
        expect(actual.getIn(['accounts', payload.account.name, 'name'])).toEqual(payload.account.name);
        expect(actual.getIn(['accounts', payload.account.name, 'beList'])).toEqual((0, _immutable.List)(payload.account.beList));
        expect(actual.getIn(['accounts', payload.account.name, 'beOrderedMap'])).toEqual((0, _immutable.OrderedMap)(payload.account.beOrderedMap));
    });

    it('should return correct state for a RECEIVE_ACCOUNTS action', function () {
        // Arrange
        var payload = {
            accounts: [{
                name: 'foo',
                beList: ['alice', 'bob', 'claire'],
                beorderedMap: { foo: 'barman' }
            }, {
                name: 'bar',
                beList: ['james', 'billy', 'samantha'],
                beOrderedMap: { kewl: 'snoop' }
            }]
        };

        var initState = (0, _immutable.Map)({
            status: {},
            seagull: (0, _immutable.Map)({ result: 'fulmar', error: 'stuka' }),
            accounts: (0, _immutable.Map)({
                sergei: (0, _immutable.Map)({
                    name: 'sergei',
                    beList: (0, _immutable.List)(['foo', 'carl', 'hanna']),
                    beorderedMap: (0, _immutable.OrderedMap)({ foo: 'cramps' })
                })
            })
        });

        var initial = (0, globalActions.default)(initState);

        var expected = (0, _immutable.Map)({
            status: {},
            accounts: (0, _immutable.Map)({
                sergei: (0, _immutable.Map)({
                    name: 'sergei',
                    beList: (0, _immutable.List)(['foo', 'carl', 'hanna']),
                    beorderedMap: (0, _immutable.OrderedMap)({
                        foo: 'cramps'
                    })
                }),
                foo: (0, _immutable.Map)({
                    name: 'foo',
                    beList: (0, _immutable.List)(['alice', 'bob', 'claire']),
                    beorderedMap: (0, _immutable.OrderedMap)({ foo: 'barman' })
                }),
                bar: (0, _immutable.Map)({
                    name: 'bar',
                    beList: (0, _immutable.List)(['james', 'billy', 'samantha']),
                    beOrderedMap: (0, _immutable.OrderedMap)({ kewl: 'snoop' })
                })
            })
        });
        // Act
        var actual = (0, globalActions.default)(initial, globalActions.receiveAccounts(payload));
        // Assert
        expect(actual.get('accounts')).toEqual(expected.get('accounts'));
    });

    it('should return correct state for a RECEIVE_CONTENT action', function () {
        // Arrange
        var payload = {
            content: {
                author: 'sebald',
                permlink: 'rings-of-saturn',
                active_votes: { one: { percent: 30 }, two: { percent: 70 } }
            }
        };
        var _payload$content = payload.content,
            author = _payload$content.author,
            permlink = _payload$content.permlink,
            active_votes = _payload$content.active_votes;
        // Act

        var actual = (0, globalActions.default)((0, globalActions.default)(), globalActions.receiveContent(payload));
        // Assert
        expect(actual.getIn(['content', author + '/' + permlink, 'author'])).toEqual(payload.content.author);
        expect(actual.getIn(['content', author + '/' + permlink, 'permlink'])).toEqual(payload.content.permlink);
        expect(actual.getIn(['content', author + '/' + permlink, 'active_votes'])).toEqual((0, _immutable.fromJS)(active_votes));
    });

    it('should return correct state for a LINK_REPLY action', function () {
        // Arrange
        var payload = {
            author: 'critic',
            permlink: 'critical-comment',
            parent_author: 'Yerofeyev',
            parent_permlink: 'moscow-stations',
            title: 'moscow to the end of the line',
            body: 'corpus of the text'
        };
        var initial = (0, globalActions.default)();
        var expected = (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.parent_author + '/' + payload.parent_permlink, (0, _immutable.Map)({
            replies: (0, _immutable.List)([payload.author + '/' + payload.permlink]),
            children: 1
        })));
        // Act
        var actual = (0, globalActions.default)(initial, globalActions.linkReply(payload));
        // Assert
        expect(actual.get('content')).toEqual(expected);
        // Arrange
        // Remove parent
        payload.parent_author = '';
        // Act
        actual = (0, globalActions.default)(initial, globalActions.linkReply(payload));
        // Assert
        expect(actual).toEqual(initial);
    });
    it('should return correct state for a DELETE_CONTENT action', function () {
        // Arrange
        var payload = {
            author: 'sebald',
            permlink: 'rings-of-saturn'
        };
        var initial = (0, globalActions.default)();
        // Act
        // add content
        var initWithContent = initial.setIn(['content', payload.author + '/' + payload.permlink], (0, _immutable.Map)({
            author: 'sebald',
            permlink: 'rings-of-saturn',
            parent_author: '',
            active_votes: { one: { percent: 30 }, two: { percent: 70 } },
            replies: (0, _immutable.List)(['cool', 'mule'])
        }));
        var expected = (0, _immutable.Map)({});
        // Act
        var actual = (0, globalActions.default)(initWithContent, globalActions.deleteContent(payload));
        // Assert
        expect(actual.get('content')).toEqual(expected);
        // Arrange
        var initWithContentAndParent = initial.setIn(['content', payload.author + '/' + payload.permlink], (0, _immutable.Map)({
            author: 'sebald',
            permlink: 'rings-of-saturn',
            parent_author: 'alice',
            parent_permlink: 'bob',
            active_votes: { one: { percent: 30 }, two: { percent: 70 } }
        }));
        var initWithParentKeyContent = initWithContentAndParent.setIn(['content', 'alice/bob'], (0, _immutable.Map)({
            replies: [payload.author + '/' + payload.permlink, 'dorothy-hughes/in-a-lonely-place', 'artichoke/hearts']
        }));
        expected = (0, _immutable.Map)({
            replies: ['dorothy-hughes/in-a-lonely-place', 'artichoke/hearts']
        });
        // Act
        actual = (0, globalActions.default)(initWithParentKeyContent, globalActions.deleteContent(payload));
        // Assert
        expect(actual.getIn(['content', 'alice/bob', 'replies'])).toHaveLength(2);
        expect(actual.getIn(['content', 'alice/bob', 'replies'])).toEqual(['dorothy-hughes/in-a-lonely-place', 'artichoke/hearts']);
    });
    it('should return correct state for a FETCHING_DATA action', function () {
        // Arrange
        var payload = {
            order: 'cheeseburger',
            category: 'life'
        };
        var initWithCategory = (0, globalActions.default)().set('status', (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.category, (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.order, { fetching: false })))));
        // Act
        var actual = (0, globalActions.default)(initWithCategory, globalActions.fetchingData(payload));
        // Assert
        expect(actual.getIn(['status', payload.category, payload.order])).toEqual({ fetching: true });
    });
    it('should return correct state for a RECEIVE_DATA action', function () {
        var _Map8;

        //Arrange
        var postData = {
            author: 'smudge',
            permlink: 'klop',
            active_votes: {
                one: { percent: 30 },
                two: { percent: 70 }
            }
        };
        var payload = {
            data: [postData],
            order: 'blog',
            category: '@smudge'
        };
        var initWithData = (0, globalActions.default)().merge({
            accounts: (0, _immutable.Map)({}),
            content: (0, _immutable.Map)({}),
            status: (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.category, (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.order, {})))),
            discussion_idx: (0, _immutable.Map)((_Map8 = {}, (0, _defineProperty3.default)(_Map8, payload.category, (0, _immutable.Map)({
                UnusualOrder: (0, _immutable.List)([{ data: { author: 'ship', permlink: 'bridge' } }])
            })), (0, _defineProperty3.default)(_Map8, payload.accountname, (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.order, (0, _immutable.List)([{ data: { author: 'farm', permlink: 'barn' } }])))), (0, _defineProperty3.default)(_Map8, '', (0, _immutable.Map)({
                FebrileFriday: (0, _immutable.List)([])
            })), _Map8))
        });

        //Act
        var actual1 = (0, globalActions.default)(initWithData, globalActions.receiveData(payload));

        var postKey = postData.author + '/' + postData.permlink;

        //Assert
        expect(actual1.getIn(['content', postKey, 'author'])).toEqual(postData.author);
        expect(actual1.getIn(['content', postKey, 'permlink'])).toEqual(postData.permlink);
        expect(actual1.getIn(['content', postKey, 'active_votes'])).toEqual((0, _immutable.fromJS)(postData.active_votes));

        // Push new key to posts list, If order meets the condition.
        expect(actual1.getIn(['discussion_idx', payload.category, payload.order])).toEqual((0, _immutable.List)(['smudge/klop']));

        // Arrange
        payload.order = 'UnusualOrder';
        //Act.
        // Push new key to discussion_idx list, If order does not meet the condition.
        var actual2 = (0, globalActions.default)(initWithData, globalActions.receiveData(payload));

        // Assert
        expect(actual2.getIn(['discussion_idx', payload.category, payload.order])).toEqual((0, _immutable.List)([{ data: { author: 'ship', permlink: 'bridge' } }, 'smudge/klop']));
        // Arrange
        // handle falsey payload category by setting empty string at keypath location typically occupied by category.
        payload.order = 'FebrileFriday';
        payload.category = '';
        // Act
        var actual3 = (0, globalActions.default)(initWithData, globalActions.receiveData(payload));
        // Assert.
        expect(actual3.getIn(['discussion_idx', '', payload.order])).toEqual((0, _immutable.List)(['smudge/klop']));
    });
    it('should handle fetch status for a RECEIVE_DATA action', function () {
        var _Map13;

        //Arrange
        var payload = {
            data: [],
            order: 'by_blog',
            category: 'blog',
            accountname: 'alice'
        };
        var initWithData = (0, globalActions.default)().merge({
            accounts: (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.accountname, (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.category, (0, _immutable.List)([]))))),
            content: (0, _immutable.Map)({}),
            status: (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.category, (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.order, {})))),
            discussion_idx: (0, _immutable.Map)((_Map13 = {}, (0, _defineProperty3.default)(_Map13, payload.category, (0, _immutable.Map)({
                UnusualOrder: (0, _immutable.List)([{ data: { author: 'ship', permlink: 'bridge' } }])
            })), (0, _defineProperty3.default)(_Map13, '', (0, _immutable.Map)({
                FebrileFriday: (0, _immutable.List)([])
            })), _Map13))
        });

        //Act
        var actual1 = (0, globalActions.default)(initWithData, globalActions.receiveData(payload));

        //Assert
        expect(actual1.getIn(['status', payload.category, payload.order]).fetching).toBeFalsy();
        expect(actual1.getIn(['status', payload.category, payload.order]).last_fetch).toBeFalsy();

        // Arrange
        payload.fetching = true;
        //Act.
        var actual2 = (0, globalActions.default)(initWithData, globalActions.receiveData(payload));

        // Assert
        expect(actual2.getIn(['status', payload.category, payload.order]).fetching).toBeTruthy();
        expect(actual2.getIn(['status', payload.category, payload.order]).last_fetch).toBeFalsy();

        // Arrange
        payload.endOfData = true;
        // Act
        var actual3 = (0, globalActions.default)(initWithData, globalActions.receiveData(payload));
        // Assert.
        expect(actual3.getIn(['status', payload.category, payload.order]).fetching).toBeTruthy();
        expect(actual3.getIn(['status', payload.category, payload.order]).last_fetch).toBeTruthy();

        // Arrange
        payload.fetching = false;
        // Act
        var actual4 = (0, globalActions.default)(initWithData, globalActions.receiveData(payload));
        // Assert.
        expect(actual4.getIn(['status', payload.category, payload.order]).fetching).toBeFalsy();
        expect(actual4.getIn(['status', payload.category, payload.order]).last_fetch).toBeTruthy();
    });

    it('should return correct state for a SET action', function () {
        // Arrange
        var payload = {
            key: ['europe', 'east', 'soup'],
            value: 'borscht'
        };
        var initial = (0, globalActions.default)();
        // Act
        var actual = (0, globalActions.default)(initial, globalActions.set(payload));
        // Assert
        expect(actual.getIn(payload.key)).toEqual(payload.value);
        // Arrange
        // Make the key a non-array.
        payload = {
            key: 'hello',
            value: 'world'
        };
        // Assert
        var actual2 = (0, globalActions.default)(initial, globalActions.set(payload));
        expect(actual2.getIn([payload.key])).toEqual(payload.value);
    });
    it('should return correct state for a REMOVE action', function () {
        // Arrange
        var payload = {
            key: ['europe', 'east', 'soup']
        };
        var initial = (0, globalActions.default)();
        initial.setIn(payload.key, 'potato');
        // Act
        var actual = (0, globalActions.default)(initial, globalActions.remove(payload));
        // Assert
        expect(actual.getIn(payload.key)).toEqual(undefined);
    });

    it('should return correct state for a UPDATE action', function () {
        // Arrange
        var payload = {
            key: ['oak'],
            updater: function updater() {
                return 'acorn';
            }
        };
        var initial = (0, globalActions.default)();
        initial.setIn(payload.key, 'acorn');
        // Act
        var actual = (0, globalActions.default)(initial, globalActions.update(payload));
        // Assert
        expect(actual.getIn(payload.key)).toEqual(payload.updater());
    });

    it('should return correct state for a FETCH_JSON action', function () {
        var initial = (0, globalActions.default)();
        var actual = (0, globalActions.default)(initial, globalActions.fetchJson(_GlobalReducer.defaultState));
        expect(initial).toEqual(actual);
    });

    it('should return correct state for a FETCH_JSON_RESULT action', function () {
        var payload = {
            id: 'seagull',
            result: 'fulmar',
            error: 'stuka'
        };
        var initial = (0, globalActions.default)();
        var actual = (0, globalActions.default)(initial, globalActions.fetchJsonResult(payload));
        expect(actual).toEqual((0, _immutable.Map)({
            status: {},
            seagull: (0, _immutable.Map)({ result: 'fulmar', error: 'stuka' })
        }));
    });

    it('should return correct state for a SHOW_DIALOG action', function () {
        var payload = {
            name: 'Iris',
            params: { cheap: 'seats' }
        };
        var initial = (0, globalActions.default)().set('active_dialogs', (0, _immutable.Map)({ chimney: 'smoke' }));
        var actual = (0, globalActions.default)(initial, globalActions.showDialog(payload));
        expect(actual.get('active_dialogs')).toEqual((0, _immutable.Map)({
            chimney: 'smoke',
            Iris: (0, _immutable.Map)({ params: (0, _immutable.Map)({ cheap: 'seats' }) })
        }));
    });

    it('should return correct state for a HIDE_DIALOG action', function () {
        var payload = { name: 'dolphin' };
        var initial = (0, globalActions.default)().set('active_dialogs', (0, _immutable.Map)((0, _defineProperty3.default)({}, payload.name, 'flipper')));
        var actual = (0, globalActions.default)(initial, globalActions.hideDialog(payload));
        expect(actual.get('active_dialogs')).toEqual((0, _immutable.Map)({}));
    });
});