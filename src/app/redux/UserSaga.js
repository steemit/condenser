import { fromJS, Set, List } from 'immutable';
import { call, put, select, fork, takeLatest } from 'redux-saga/effects';
import { api } from '@steemit/steem-js';
import { PrivateKey, Signature, hash } from '@steemit/steem-js/lib/auth/ecc';

import { accountAuthLookup } from 'app/redux/AuthSaga';
import { getAccount } from 'app/redux/SagaShared';
import * as userActions from 'app/redux/UserReducer';
import { receiveFeatureFlags } from 'app/redux/AppReducer';
import { browserHistory } from 'react-router';
import {
    serverApiLogin,
    serverApiLogout,
    serverApiRecordEvent,
    isTosAccepted,
    acceptTos,
} from 'app/utils/ServerApiClient';
import { loadFollows } from 'app/redux/FollowSaga';
import { translate } from 'app/Translator';
import DMCAUserList from 'app/utils/DMCAUserList';

export const userWatches = [
    takeLatest('@@router/LOCATION_CHANGE', removeHighSecurityKeys), // keep first to remove keys early when a page change happens
    takeLatest(
        'user/lookupPreviousOwnerAuthority',
        lookupPreviousOwnerAuthority
    ),
    takeLatest(userActions.USERNAME_PASSWORD_LOGIN, usernamePasswordLogin),
    takeLatest(userActions.SAVE_LOGIN, saveLogin_localStorage),
    takeLatest(userActions.LOGOUT, logout),
    takeLatest(userActions.LOGIN_ERROR, loginError),
    takeLatest(userActions.LOAD_SAVINGS_WITHDRAW, loadSavingsWithdraw),
    takeLatest(userActions.UPLOAD_IMAGE, uploadImage),
    takeLatest(userActions.ACCEPT_TERMS, function*() {
        try {
            yield call(acceptTos);
        } catch (e) {
            // TODO: log error to server, conveyor is unavailable
        }
    }),
    function* getLatestFeedPrice() {
        try {
            const history = yield call([api, api.getFeedHistoryAsync]);
            const feed = history['price_history'];
            const last = fromJS(feed[feed.length - 1]);
            yield put(userActions.setLatestFeedPrice(last));
        } catch (error) {
            // (exceedingly rare) ignore, UI will fall back to feed_price
        }
    },
];

const highSecurityPages = [
    /\/market/,
    /\/@.+\/(transfers|permissions|password)/,
    /\/~witnesses/,
];

function* loadSavingsWithdraw() {
    const username = yield select(state =>
        state.user.getIn(['current', 'username'])
    );
    const to = yield call([api, api.getSavingsWithdrawToAsync], username);
    const fro = yield call([api, api.getSavingsWithdrawFromAsync], username);

    const m = {};
    for (const v of to) m[v.id] = v;
    for (const v of fro) m[v.id] = v;

    const withdraws = List(fromJS(m).values()).sort((a, b) =>
        strCmp(a.get('complete'), b.get('complete'))
    );

    yield put(
        userActions.set({
            key: 'savings_withdraws',
            value: withdraws,
        })
    );
}

const strCmp = (a, b) => (a > b ? 1 : a < b ? -1 : 0);

// function* getCurrentAccountWatch() {
//     // yield* takeLatest('user/SHOW_TRANSFER', getCurrentAccount);
// }

function* removeHighSecurityKeys({ payload: { pathname } }) {
    const highSecurityPage =
        highSecurityPages.find(p => p.test(pathname)) != null;
    // Let the user keep the active key when going from one high security page to another.  This helps when
    // the user logins into the Wallet then the Permissions tab appears (it was hidden).  This keeps them
    // from getting logged out when they click on Permissions (which is really bad because that tab
    // disappears again).
    if (!highSecurityPage) yield put(userActions.removeHighSecurityKeys());
}

/**
    @arg {object} action.username - Unless a WIF is provided, this is hashed with the password and key_type to create private keys.
    @arg {object} action.password - Password or WIF private key.  A WIF becomes the posting key, a password can create all three
        key_types: active, owner, posting keys.
*/
function* usernamePasswordLogin(action) {
    // This is a great place to mess with session-related user state (:
    // If the user hasn't previously hidden the announcement in this session,
    // or if the user's browser does not support session storage,
    // show the announcement.
    if (
        typeof sessionStorage === 'undefined' ||
        (typeof sessionStorage !== 'undefined' &&
            sessionStorage.getItem('hideAnnouncement') !== 'true')
    ) {
        // Uncomment to re-enable announcment
        // TODO: use config to enable/disable
        // yield put(userActions.showAnnouncement());
    }

    // Sets 'loading' while the login is taking place.  The key generation can take a while on slow computers.
    yield call(usernamePasswordLogin2, action.payload);
    const current = yield select(state => state.user.get('current'));
    if (current) {
        const username = current.get('username');
        yield fork(loadFollows, 'getFollowingAsync', username, 'blog');
        yield fork(loadFollows, 'getFollowingAsync', username, 'ignore');
    }
}

// const isHighSecurityOperations = ['transfer', 'transfer_to_vesting', 'withdraw_vesting',
//     'limit_order_create', 'limit_order_cancel', 'account_update', 'account_witness_vote']

const clean = value =>
    value == null || value === '' || /null|undefined/.test(value)
        ? undefined
        : value;

function* usernamePasswordLogin2({
    username,
    password,
    saveLogin,
    operationType /*high security*/,
    afterLoginRedirectToWelcome,
}) {
    // login, using saved password
    let feedURL = false;
    let autopost, memoWif, login_owner_pubkey, login_wif_owner_pubkey;
    if (!username && !password) {
        const data = localStorage.getItem('autopost2');
        if (data) {
            // auto-login with a low security key (like a posting key)
            autopost = true; // must use simi-colon
            // The 'password' in this case must be the posting private wif .. See setItme('autopost')
            [username, password, memoWif, login_owner_pubkey] = new Buffer(
                data,
                'hex'
            )
                .toString()
                .split('\t');
            memoWif = clean(memoWif);
            login_owner_pubkey = clean(login_owner_pubkey);
        }
    }
    // no saved password
    if (!username || !password) {
        const offchain_account = yield select(state =>
            state.offchain.get('account')
        );
        if (offchain_account) serverApiLogout();
        return;
    }

    let userProvidedRole; // login via:  username/owner
    if (username.indexOf('/') > -1) {
        // "alice/active" will login only with Alices active key
        [username, userProvidedRole] = username.split('/');
    }

    const pathname = yield select(state => state.global.get('pathname'));
    const highSecurityLogin =
        // /owner|active/.test(userProvidedRole) ||
        // isHighSecurityOperations.indexOf(operationType) !== -1 ||
        highSecurityPages.find(p => p.test(pathname)) != null;

    const isRole = (role, fn) =>
        !userProvidedRole || role === userProvidedRole ? fn() : undefined;

    const account = yield call(getAccount, username);
    if (!account) {
        yield put(userActions.loginError({ error: 'Username does not exist' }));
        return;
    }
    //dmca user block
    if (username && DMCAUserList.includes(username)) {
        yield put(
            userActions.loginError({ error: translate('terms_violation') })
        );
        return;
    }

    let private_keys;
    try {
        const private_key = PrivateKey.fromWif(password);
        login_wif_owner_pubkey = private_key.toPublicKey().toString();
        private_keys = fromJS({
            posting_private: isRole('posting', () => private_key),
            active_private: isRole('active', () => private_key),
            memo_private: private_key,
        });
    } catch (e) {
        // Password (non wif)
        login_owner_pubkey = PrivateKey.fromSeed(username + 'owner' + password)
            .toPublicKey()
            .toString();
        private_keys = fromJS({
            posting_private: isRole('posting', () =>
                PrivateKey.fromSeed(username + 'posting' + password)
            ),
            active_private: isRole('active', () =>
                PrivateKey.fromSeed(username + 'active' + password)
            ),
            memo_private: PrivateKey.fromSeed(username + 'memo' + password),
        });
    }
    if (memoWif)
        private_keys = private_keys.set(
            'memo_private',
            PrivateKey.fromWif(memoWif)
        );

    yield call(accountAuthLookup, {
        payload: {
            account,
            private_keys,
            highSecurityLogin,
            login_owner_pubkey,
        },
    });
    let authority = yield select(state =>
        state.user.getIn(['authority', username])
    );
    const hasActiveAuth = authority.get('active') === 'full';
    if (!highSecurityLogin) {
        const accountName = account.get('name');
        authority = authority.set('active', 'none');
        yield put(userActions.setAuthority({ accountName, auth: authority }));
    }
    const fullAuths = authority.reduce(
        (r, auth, type) => (auth === 'full' ? r.add(type) : r),
        Set()
    );
    if (!fullAuths.size) {
        localStorage.removeItem('autopost2');
        const owner_pub_key = account.getIn(['owner', 'key_auths', 0, 0]);
        if (
            login_owner_pubkey === owner_pub_key ||
            login_wif_owner_pubkey === owner_pub_key
        ) {
            yield put(userActions.loginError({ error: 'owner_login_blocked' }));
        } else if (!highSecurityLogin && hasActiveAuth) {
            yield put(
                userActions.loginError({ error: 'active_login_blocked' })
            );
        } else {
            const generated_type = password[0] === 'P' && password.length > 40;
            serverApiRecordEvent(
                'login_attempt',
                JSON.stringify({
                    name: username,
                    login_owner_pubkey,
                    owner_pub_key,
                    generated_type,
                })
            );
            yield put(userActions.loginError({ error: 'Incorrect Password' }));
        }
        return;
    }
    if (authority.get('posting') !== 'full')
        private_keys = private_keys.remove('posting_private');

    if (!highSecurityLogin || authority.get('active') !== 'full')
        private_keys = private_keys.remove('active_private');

    const owner_pubkey = account.getIn(['owner', 'key_auths', 0, 0]);
    const active_pubkey = account.getIn(['active', 'key_auths', 0, 0]);
    const posting_pubkey = account.getIn(['posting', 'key_auths', 0, 0]);

    if (
        private_keys.get('memo_private') &&
        account.get('memo_key') !==
            private_keys
                .get('memo_private')
                .toPublicKey()
                .toString()
    )
        // provided password did not yield memo key
        private_keys = private_keys.remove('memo_private');

    if (!highSecurityLogin) {
        if (
            posting_pubkey === owner_pubkey ||
            posting_pubkey === active_pubkey
        ) {
            yield put(
                userActions.loginError({
                    error:
                        'This login gives owner or active permissions and should not be used here.  Please provide a posting only login.',
                })
            );
            localStorage.removeItem('autopost2');
            return;
        }
    }
    const memo_pubkey = private_keys.has('memo_private')
        ? private_keys
              .get('memo_private')
              .toPublicKey()
              .toString()
        : null;

    if (memo_pubkey === owner_pubkey || memo_pubkey === active_pubkey)
        // Memo key could be saved in local storage.. In RAM it is not purged upon LOCATION_CHANGE
        private_keys = private_keys.remove('memo_private');

    // If user is signing operation by operaion and has no saved login, don't save to RAM
    if (!operationType || saveLogin) {
        if (username) feedURL = '/@' + username + '/feed';
        // Keep the posting key in RAM but only when not signing an operation.
        // No operation or the user has checked: Keep me logged in...
        yield put(
            userActions.setUser({
                username,
                private_keys,
                login_owner_pubkey,
                vesting_shares: account.get('vesting_shares'),
                received_vesting_shares: account.get('received_vesting_shares'),
                delegated_vesting_shares: account.get(
                    'delegated_vesting_shares'
                ),
            })
        );
    } else {
        if (username) feedURL = '/@' + username + '/feed';
        yield put(
            userActions.setUser({
                username,
                vesting_shares: account.get('vesting_shares'),
                received_vesting_shares: account.get('received_vesting_shares'),
                delegated_vesting_shares: account.get(
                    'delegated_vesting_shares'
                ),
            })
        );
    }

    if (!autopost && saveLogin) yield put(userActions.saveLogin());

    try {
        // const challengeString = yield serverApiLoginChallenge()
        const offchainData = yield select(state => state.offchain);
        const serverAccount = offchainData.get('account');
        const challengeString = offchainData.get('login_challenge');
        if (!serverAccount && challengeString) {
            const signatures = {};
            const challenge = { token: challengeString };
            const bufSha = hash.sha256(JSON.stringify(challenge, null, 0));
            const sign = (role, d) => {
                if (!d) return;
                const sig = Signature.signBufferSha256(bufSha, d);
                signatures[role] = sig.toHex();
            };
            sign('posting', private_keys.get('posting_private'));
            // sign('active', private_keys.get('active_private'))
            yield serverApiLogin(username, signatures);
        }
    } catch (error) {
        // Does not need to be fatal
        console.error('Server Login Error', error);
    }

    // Feature Flags
    if (private_keys.get('posting_private')) {
        yield fork(
            getFeatureFlags,
            username,
            private_keys.get('posting_private').toString()
        );
    }
    // TOS acceptance
    yield fork(promptTosAcceptance, username);
    if (afterLoginRedirectToWelcome) {
        browserHistory.push('/welcome');
    } else if (feedURL) {
        if (document.location.pathname === '/') browserHistory.push(feedURL);
    }
}

function* promptTosAcceptance(username) {
    try {
        const accepted = yield call(isTosAccepted, username);
        if (!accepted) {
            yield put(userActions.showTerms());
        }
    } catch (e) {
        // TODO: log error to server, conveyor is unavailable
    }
}

function* getFeatureFlags(username, posting_private) {
    try {
        const flags = yield call(
            [api, api.signedCallAsync],
            'conveyor.get_feature_flags',
            { account: username },
            username,
            posting_private
        );
        yield put(receiveFeatureFlags(flags));
    } catch (error) {
        // Do nothing; feature flags are not ready yet. Or posting_private is not available.
    }
}

function* saveLogin_localStorage() {
    if (!process.env.BROWSER) {
        console.error('Non-browser environment, skipping localstorage');
        return;
    }
    localStorage.removeItem('autopost2');
    const [username, private_keys, login_owner_pubkey] = yield select(state => [
        state.user.getIn(['current', 'username']),
        state.user.getIn(['current', 'private_keys']),
        state.user.getIn(['current', 'login_owner_pubkey']),
    ]);
    if (!username) {
        console.error('Not logged in');
        return;
    }
    // Save the lowest security key
    const posting_private = private_keys.get('posting_private');
    if (!posting_private) {
        console.error('No posting key to save?');
        return;
    }
    const account = yield select(state =>
        state.global.getIn(['accounts', username])
    );
    if (!account) {
        console.error('Missing global.accounts[' + username + ']');
        return;
    }
    const postingPubkey = posting_private.toPublicKey().toString();
    try {
        account.getIn(['active', 'key_auths']).forEach(auth => {
            if (auth.get(0) === postingPubkey)
                throw 'Login will not be saved, posting key is the same as active key';
        });
        account.getIn(['owner', 'key_auths']).forEach(auth => {
            if (auth.get(0) === postingPubkey)
                throw 'Login will not be saved, posting key is the same as owner key';
        });
    } catch (e) {
        console.error(e);
        return;
    }
    const memoKey = private_keys.get('memo_private');
    const memoWif = memoKey && memoKey.toWif();
    const data = new Buffer(
        `${username}\t${posting_private.toWif()}\t${memoWif ||
            ''}\t${login_owner_pubkey || ''}`
    ).toString('hex');
    // autopost is a auto login for a low security key (like the posting key)
    localStorage.setItem('autopost2', data);
}

function* logout() {
    yield put(userActions.saveLoginConfirm(false)); // Just incase it is still showing
    if (process.env.BROWSER) localStorage.removeItem('autopost2');
    serverApiLogout();
}

function* loginError({
    payload: {
        /*error*/
    },
}) {
    serverApiLogout();
}

/**
    If the owner key was changed after the login owner key, this function will find the next owner key history record after the change and store it under user.previous_owner_authority.
*/
function* lookupPreviousOwnerAuthority({ payload: {} }) {
    const current = yield select(state => state.user.getIn(['current']));
    if (!current) return;

    const login_owner_pubkey = current.get('login_owner_pubkey');
    if (!login_owner_pubkey) return;

    const username = current.get('username');
    const key_auths = yield select(state =>
        state.global.getIn(['accounts', username, 'owner', 'key_auths'])
    );
    if (key_auths && key_auths.find(key => key.get(0) === login_owner_pubkey)) {
        // console.log('UserSaga ---> Login matches current account owner');
        return;
    }
    // Owner history since this index was installed July 14
    let owner_history = fromJS(
        yield call([api, api.getOwnerHistoryAsync], username)
    );
    if (owner_history.count() === 0) return;
    owner_history = owner_history.sort((b, a) => {
        //sort decending
        const aa = a.get('last_valid_time');
        const bb = b.get('last_valid_time');
        return aa < bb ? -1 : aa > bb ? 1 : 0;
    });
    // console.log('UserSaga ---> owner_history', owner_history.toJS())
    const previous_owner_authority = owner_history.find(o => {
        const auth = o.get('previous_owner_authority');
        const weight_threshold = auth.get('weight_threshold');
        const key3 = auth
            .get('key_auths')
            .find(
                key2 =>
                    key2.get(0) === login_owner_pubkey &&
                    key2.get(1) >= weight_threshold
            );
        return key3 ? auth : null;
    });
    if (!previous_owner_authority) {
        console.log('UserSaga ---> Login owner does not match owner history');
        return;
    }
    // console.log('UserSage ---> previous_owner_authority', previous_owner_authority.toJS())
    yield put(userActions.setUser({ previous_owner_authority }));
}

function* uploadImage({
    payload: { file, dataUrl, filename = 'image.txt', progress },
}) {
    const _progress = progress;
    progress = msg => {
        // console.log('Upload image progress', msg)
        _progress(msg);
    };

    const stateUser = yield select(state => state.user);
    const username = stateUser.getIn(['current', 'username']);
    const d = stateUser.getIn(['current', 'private_keys', 'posting_private']);
    if (!username) {
        progress({ error: 'Please login first.' });
        return;
    }
    if (!d) {
        progress({ error: 'Login with your posting key' });
        return;
    }

    if (!file && !dataUrl) {
        console.error('uploadImage required: file or dataUrl');
        return;
    }

    let data, dataBs64;
    if (file) {
        // drag and drop
        const reader = new FileReader();
        data = yield new Promise(resolve => {
            reader.addEventListener('load', () => {
                const result = new Buffer(reader.result, 'binary');
                resolve(result);
            });
            reader.readAsBinaryString(file);
        });
    } else {
        // recover from preview
        const commaIdx = dataUrl.indexOf(',');
        dataBs64 = dataUrl.substring(commaIdx + 1);
        data = new Buffer(dataBs64, 'base64');
    }

    // The challenge needs to be prefixed with a constant (both on the server and checked on the client) to make sure the server can't easily make the client sign a transaction doing something else.
    const prefix = new Buffer('ImageSigningChallenge');
    const bufSha = hash.sha256(Buffer.concat([prefix, data]));

    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    } else {
        // formData.append('file', file, filename) <- Failed to add filename=xxx to Content-Disposition
        // Can't easily make this look like a file so this relies on the server supporting: filename and filebinary
        formData.append('filename', filename);
        formData.append('filebase64', dataBs64);
    }

    const sig = Signature.signBufferSha256(bufSha, d);
    const postUrl = `${$STM_Config.upload_image}/${username}/${sig.toHex()}`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', postUrl);
    xhr.onload = function() {
        console.log(xhr.status, xhr.responseText);
        const res = JSON.parse(xhr.responseText);
        const { error } = res;
        if (error) {
            progress({ error: 'Error: ' + error });
            return;
        }
        const { url } = res;
        progress({ url });
    };
    xhr.onerror = function(error) {
        console.error(filename, error);
        progress({ error: 'Unable to contact the server.' });
    };
    xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
            const percent = Math.round(event.loaded / event.total * 100);
            progress({ message: `Uploading ${percent}%` });
            // console.log('Upload', percent)
        }
    };
    xhr.send(formData);
}

// function* getCurrentAccount() {
//     const current = yield select(state => state.user.get('current'))
//     if (!current) return
//     const [account] = yield call([api, api.getAccountsAsync], [current.get('username')])
//     yield put(g.actions.receiveAccount({ account }))
// }
