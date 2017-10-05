import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';

import { byId, unread, unshown } from './NotificationReducer';

chai.use(chaiImmutable);

const notificationReceiveAllAction = {
    type: 'notification/RECEIVE_ALL',
    payload: [
        {"id":"UID","read":true,"shown":true,"notificationType":"powerDown","created":"2010-09-19T16:19:48","author":"roadscape","amount":10000.2},
        {"id":"UID1","read":false,"shown":false,"notificationType":"resteem","created":"2010-08-19T18:59:00","author":"roadscape","item":{"author":"wolfcat","category":"introduceyourself","depth":0,"permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}},
        {"id":"UID2","read":false,"shown":true,"notificationType":"vote","notificationTime":3,"author":"beanz","created":"2017-09-19T18:59:00","item":{"author":"wolfcat","category":"introduceyourself","depth":0,"permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}},
        {"id":"UID3","read":true,"shown":true,"notificationType":"receiveSteem","created":"2017-09-19T16:19:48","author":"roadscape","amount":10000.2},
        {"id":"UID4","read":true,"shown":true,"notificationType":"tag","created":"2020-09-19T07:48:03","author":"lovejoy","item":{"author":"lovejoy","category":"introduceyourself","depth":2,"permlink":"re-steemcleaners-re-steemcleaners-re-wolfcat-from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello-20170919t120245144z","summary":"@wolfcat is a new user who normally doesn't spend a lot of time online, plus we are "},"rootItem":{"author":"wolfcat","category":"introduceyourself","permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}},
        {"id":"UID5","read":false,"shown":false,"notificationType":"vote","created":"2020-11-19T11:59:39","author":"roadscape","item":{"author":"wolfcat","category":"introduceyourself","depth":0,"permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}},
        {"id":"UID6","read":true,"shown":true,"notificationType":"postReply","created":"2017-09-19T14:24:51","author":"lovejoy","item":{"author":"lovejoy","category":"introduceyourself","depth":2,"permlink":"re-steemcleaners-re-steemcleaners-re-wolfcat-from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello-20170919t120245144z","summary":"@wolfcat is a new user who normally doesn't spend a lot of time online, plus we are ","parentSummary":"You may want to retract your votes.The account has ignored our many requests to confirm the identity. It seems to be another case of fake identity. Thanks."},"rootItem":{"author":"wolfcat","category":"introduceyourself","permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}},
        {"id":"UID6.1","read":true,"shown":true,"notificationType":"securityNewMobileDevice","created":"2017-09-19T14:24:51","author":"security"},
        {"id":"UID7","read":false,"shown":true,"notificationType":"commentReply","created":"2017-09-18T17:21:18","author":"dbzfan4awhile","item":{"author":"dbzfan4awhile","category":"introduceyourself","depth":3,"permlink":"re-wolfcat-re-dbzfan4awhile-re-wolfcat-from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello-20170918t172118886z","summary":"Awesome!","parentSummary":"Yes! Ill look for you there :)"},"rootItem":{"author":"wolfcat","category":"introduceyourself","permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}}
    ],
};

const notificationAppendSomeAction = {
    type: 'notification/APPEND_SOME',
    payload: [
        {"id":"UID6.1","read":false,"shown":false,"notificationType":"securityNewMobileDevice","created":"2017-09-19T14:24:51","author":"security"},
        {"id":"UID8","read":false,"shown":false,"notificationType":"powerDown","created":"2000-09-19T16:19:48","author":"roadscape","amount":138},
        {"id":"UID9","read":true,"shown":true,"notificationType":"powerDown","created":"2000-09-20T16:19:48","author":"roadscape","amount":138},
        {"id":"UID10","read":false,"shown":true,"notificationType":"powerDown","created":"2000-09-21T16:19:48","author":"roadscape","amount":138},
    ],
};

describe('byId', () => {
    it('should create a new, immutable state when receiving all notifications', () => {
        const reduced = byId(undefined, notificationReceiveAllAction);

        expect(reduced).to.have.size(9);
    });

    it('should merge in some appended notifications', () => {
        const initial = byId(undefined, notificationReceiveAllAction);
        const reduced = byId(initial, notificationAppendSomeAction);

        expect(reduced).to.have.size(12);
    });
});

describe('unread', () => {
    it('should create a new, immutable state only including unreads when receiving all notifications', () => {
        const reduced = unread(undefined, notificationReceiveAllAction);

        expect(reduced).to.have.all.keys('UID1', 'UID2', 'UID5', 'UID7');
    });

    it('should merge in some appended notifications, but only unread ones, in the proper order', () => {
        const initial = unread(undefined, notificationReceiveAllAction);
        const reduced = unread(initial, notificationAppendSomeAction);

        expect(reduced).to.have.all.keys('UID1', 'UID2', 'UID5', 'UID7', 'UID6.1', 'UID8', 'UID10');
        expect(reduced.first().id).to.equal('UID5');
        expect(reduced.last().id).to.equal('UID8');
    });
});

describe('unshown', () => {
    it('should create a new, immutable state only including unshowns when receiving all notifications', () => {
        const reduced = unshown(undefined, notificationReceiveAllAction);

        expect(reduced).to.have.all.keys('UID1', 'UID5');
    });

    it('should merge in some appended notifications, but only unshown ones, in the proper order', () => {
        const initial = unshown(undefined, notificationReceiveAllAction);
        const reduced = unshown(initial, notificationAppendSomeAction);

        expect(reduced).to.have.all.keys('UID1', 'UID5', 'UID6.1', 'UID8');
        expect(reduced.first().id).to.equal('UID5');
        expect(reduced.last().id).to.equal('UID8');
    });
});