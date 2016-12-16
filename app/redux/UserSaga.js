import {fromJS, Set, List} from 'immutable'
import {takeLatest} from 'redux-saga';
import {call, put, select, fork} from 'redux-saga/effects';
import {accountAuthLookup} from 'app/redux/AuthSaga'
import {PrivateKey, Signature, hash} from 'shared/ecc'
import user from 'app/redux/User'
import {getAccount} from 'app/redux/SagaShared'
import {browserHistory} from 'react-router'
import {serverApiLogin, serverApiLogout} from 'app/utils/ServerApiClient';
import {Apis} from 'shared/api_client';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';
import {loadFollows} from 'app/redux/FollowSaga'

export const userWatches = [
    watchRemoveHighSecurityKeys, // keep first to remove keys early when a page change happens
    loginWatch,
    saveLoginWatch,
    logoutWatch,
    // getCurrentAccountWatch,
    loginErrorWatch,
    lookupPreviousOwnerAuthorityWatch,
    watchLoadSavingsWithdraw,
    uploadImageWatch,
]

const highSecurityPages = Array(/\/market/, /\/@.+\/(transfers|permissions|password)/, /\/~witnesses/)

function* lookupPreviousOwnerAuthorityWatch() {
    yield* takeLatest('user/lookupPreviousOwnerAuthority', lookupPreviousOwnerAuthority);
}
function* loginWatch() {
    yield* takeLatest('user/USERNAME_PASSWORD_LOGIN', usernamePasswordLogin);
}
function* saveLoginWatch() {
    yield* takeLatest('user/SAVE_LOGIN', saveLogin_localStorage);
}
function* logoutWatch() {
    yield* takeLatest('user/LOGOUT', logout);
}

function* loginErrorWatch() {
    yield* takeLatest('user/LOGIN_ERROR', loginError);
}

function* watchLoadSavingsWithdraw() {
    yield* takeLatest('user/LOAD_SAVINGS_WITHDRAW', loadSavingsWithdraw);
}

export function* watchRemoveHighSecurityKeys() {
    yield* takeLatest('@@router/LOCATION_CHANGE', removeHighSecurityKeys);
}

function* loadSavingsWithdraw() {
    const username = yield select(state => state.user.getIn(['current', 'username']))
    const to = yield call(Apis.db_api, 'get_savings_withdraw_to', username)
    const fro = yield call(Apis.db_api, 'get_savings_withdraw_from', username)

    const m = {}
    for(const v of to) m[v.id] = v
    for(const v of fro) m[v.id] = v

    const withdraws = List(fromJS(m).values())
        .sort((a, b) => strCmp(a.get('complete'), b.get('complete')))

    yield put(user.actions.set({
        key: 'savings_withdraws',
        value: withdraws,
    }))
}

const strCmp = (a, b) => a > b ? 1 : a < b ? -1 : 0

// function* getCurrentAccountWatch() {
//     // yield* takeLatest('user/SHOW_TRANSFER', getCurrentAccount);
// }

function* removeHighSecurityKeys({payload: {pathname}}) {
    const highSecurityPage = highSecurityPages.find(p => p.test(pathname)) != null
    // Let the user keep the active key when going from one high security page to another.  This helps when
    // the user logins into the Wallet then the Permissions tab appears (it was hidden).  This keeps them
    // from getting logged out when they click on Permissions (which is really bad because that tab
    // disappears again).
    if(!highSecurityPage)
        yield put(user.actions.removeHighSecurityKeys())
}

/**
    @arg {object} action.username - Unless a WIF is provided, this is hashed with the password and key_type to create private keys.
    @arg {object} action.password - Password or WIF private key.  A WIF becomes the posting key, a password can create all three
        key_types: active, owner, posting keys.
*/
function* usernamePasswordLogin(action) {
    // Sets 'loading' while the login is taking place.  The key generation can take a while on slow computers.
    yield call(usernamePasswordLogin2, action)
    const current = yield select(state => state.user.get('current'))
    if(current) {
        const username = current.get('username')
        yield fork(loadFollows, "get_following", username, 'blog')
        yield fork(loadFollows, "get_following", username, 'ignore')
    }
}

// const isHighSecurityOperations = ['transfer', 'transfer_to_vesting', 'withdraw_vesting',
//     'limit_order_create', 'limit_order_cancel', 'account_update', 'account_witness_vote']


const clean = (value) => value == null || value === '' || /null|undefined/.test(value) ? undefined : value

function* usernamePasswordLogin2({payload: {username, password, saveLogin,
        operationType /*high security*/, afterLoginRedirectToWelcome
}}) {
    // login, using saved password
    let autopost, memoWif, login_owner_pubkey, login_wif_owner_pubkey
    if (!username && !password) {
        const data = localStorage.getItem('autopost2')
        if (data) { // auto-login with a low security key (like a posting key)
            autopost = true; // must use simi-colon
            // The 'password' in this case must be the posting private wif .. See setItme('autopost')
            [username, password, memoWif, login_owner_pubkey] = new Buffer(data, 'hex').toString().split('\t');
            memoWif = clean(memoWif);
            login_owner_pubkey = clean(login_owner_pubkey);
        }
    }
    // no saved password
    if (!username || !password) {
        const offchain_account = yield select(state => state.offchain.get('account'))
        if (offchain_account) serverApiLogout()
        return
    }

    let userProvidedRole // login via:  username/owner
    if (username.indexOf('/') > -1) {
        // "alice/active" will login only with Alices active key
        [username, userProvidedRole] = username.split('/')
    }

    const pathname = yield select(state => state.global.get('pathname'))
    const highSecurityLogin =
        // /owner|active/.test(userProvidedRole) ||
        // isHighSecurityOperations.indexOf(operationType) !== -1 ||
        highSecurityPages.find(p => p.test(pathname)) != null

    const isRole = (role, fn) => (!userProvidedRole || role === userProvidedRole ? fn() : undefined)

    const account = yield call(getAccount, username)
    if (!account) {
        yield put(user.actions.loginError({ error: 'Username does not exist' }))
        return
    }

    let private_keys
    try {
        const private_key = PrivateKey.fromWif(password)
        login_wif_owner_pubkey = private_key.toPublicKey().toString()
        private_keys = fromJS({
            posting_private: isRole('posting', () => private_key),
            active_private: isRole('active', () => private_key),
            memo_private: private_key,
        })
    } catch (e) {
        // Password (non wif)
        login_owner_pubkey = PrivateKey.fromSeed(username + 'owner' + password).toPublicKey().toString()
        private_keys = fromJS({
            posting_private: isRole('posting', () => PrivateKey.fromSeed(username + 'posting' + password)),
            active_private: isRole('active', () => PrivateKey.fromSeed(username + 'active' + password)),
            memo_private: PrivateKey.fromSeed(username + 'memo' + password),
        })
    }
    if (memoWif)
        private_keys = private_keys.set('memo_private', PrivateKey.fromWif(memoWif))

    yield call(accountAuthLookup, {payload: {account, private_keys, highSecurityLogin, login_owner_pubkey}})
    let authority = yield select(state => state.user.getIn(['authority', username]))
    const hasActiveAuth = authority.get('active') === 'full'
    if(!highSecurityLogin) {
        const accountName = account.get('name')
        authority = authority.set('active', 'none')
        yield put(user.actions.setAuthority({accountName, auth: authority}))
    }
    const fullAuths = authority.reduce((r, auth, type) => (auth === 'full' ? r.add(type) : r), Set())
    if (!fullAuths.size) {
        localStorage.removeItem('autopost2')
        const owner_pub_key = account.getIn(['owner', 'key_auths', 0, 0]);
        // const pub_keys = yield select(state => state.user.get('pub_keys_used'))
        // serverApiRecordEvent('login_attempt', JSON.stringify({name: username, ...pub_keys, cur_owner: owner_pub_key}))
        if (owner_pub_key === 'STM7sw22HqsXbz7D2CmJfmMwt9rimtk518dRzsR1f8Cgw52dQR1pR') {
            yield put(user.actions.loginError({ error: 'Hello. Your account may have been compromised. We are working on restoring an access to your account. Please send an email to support@steemit.com.' }))
            return
        }
        if(login_owner_pubkey === owner_pub_key || login_wif_owner_pubkey === owner_pub_key) {
            yield put(user.actions.loginError({ error: 'owner_login_blocked' }))
        } else if(!highSecurityLogin && hasActiveAuth) {
            yield put(user.actions.loginError({ error: 'active_login_blocked' }))
        } else {
            const generated_type = password[0] === 'P' && password.length > 40;
            serverApiRecordEvent('login_attempt', JSON.stringify({name: username, login_owner_pubkey, owner_pub_key, generated_type}))
            yield put(user.actions.loginError({ error: 'Incorrect Password' }))
        }
        return
    }
    if (authority.get('posting') !== 'full')
        private_keys = private_keys.remove('posting_private')

    if(!highSecurityLogin || authority.get('active') !== 'full')
        private_keys = private_keys.remove('active_private')

    const owner_pubkey = account.getIn(['owner', 'key_auths', 0, 0])
    const active_pubkey = account.getIn(['active', 'key_auths', 0, 0])
    const posting_pubkey = account.getIn(['posting', 'key_auths', 0, 0])

    if (private_keys.get('memo_private') &&
        account.get('memo_key') !== private_keys.get('memo_private').toPublicKey().toString()
    )
        // provided password did not yield memo key
        private_keys = private_keys.remove('memo_private')

    if(!highSecurityLogin) {
        if(
            posting_pubkey === owner_pubkey ||
            posting_pubkey === active_pubkey
        ) {
            yield put(user.actions.loginError({ error: 'This login gives owner or active permissions and should not be used here.  Please provide a posting only login.' }))
            localStorage.removeItem('autopost2')
            return
        }
    }
    const memo_pubkey = private_keys.has('memo_private') ?
        private_keys.get('memo_private').toPublicKey().toString() : null

    if(
        memo_pubkey === owner_pubkey ||
        memo_pubkey === active_pubkey
    )
        // Memo key could be saved in local storage.. In RAM it is not purged upon LOCATION_CHANGE
        private_keys = private_keys.remove('memo_private')

    // If user is signing operation by operaion and has no saved login, don't save to RAM
    if(!operationType || saveLogin) {
        // Keep the posting key in RAM but only when not signing an operation.
        // No operation or the user has checked: Keep me logged in...
        yield put(user.actions.setUser({username, private_keys, login_owner_pubkey, vesting_shares: account.get('vesting_shares')}))
    } else {
        yield put(user.actions.setUser({username, vesting_shares: account.get('vesting_shares')}))
    }

    if (!autopost && saveLogin)
        yield put(user.actions.saveLogin());

    try {
        // const challengeString = yield serverApiLoginChallenge()
        const offchainData = yield select(state => state.offchain)
        const serverAccount = offchainData.get('account')
        const challengeString = offchainData.get('login_challenge')
        if (!serverAccount && challengeString) {
            const signatures = {}
            const challenge = {token: challengeString}
            const bufSha = hash.sha256(JSON.stringify(challenge, null, 0))
            const sign = (role, d) => {
                if (!d) return
                const sig = Signature.signBufferSha256(bufSha, d)
                signatures[role] = sig.toHex()
            }
            sign('posting', private_keys.get('posting_private'))
            // sign('active', private_keys.get('active_private'))
            serverApiLogin(username, signatures);
        }
    } catch(error) {
        // Does not need to be fatal
        console.error('Server Login Error', error);
    }
    if (afterLoginRedirectToWelcome) browserHistory.push('/welcome');
}

function* saveLogin_localStorage() {
    if (!process.env.BROWSER) {
        console.error('Non-browser environment, skipping localstorage')
        return
    }
    localStorage.removeItem('autopost2')
    const [username, private_keys, login_owner_pubkey] = yield select(state => ([
        state.user.getIn(['current', 'username']),
        state.user.getIn(['current', 'private_keys']),
        state.user.getIn(['current', 'login_owner_pubkey']),
    ]))
    if (!username) {
        console.error('Not logged in')
        return
    }
    // Save the lowest security key
    const posting_private = private_keys.get('posting_private')
    if (!posting_private) {
        console.error('No posting key to save?')
        return
    }
    const account = yield select(state => state.global.getIn(['accounts', username]))
    if(!account) {
        console.error('Missing global.accounts[' + username + ']')
        return
    }
    const postingPubkey = posting_private.toPublicKey().toString()
    try {
        account.getIn(['active', 'key_auths']).forEach(auth => {
            if(auth.get(0) === postingPubkey)
                throw 'Login will not be saved, posting key is the same as active key'
        })
        account.getIn(['owner', 'key_auths']).forEach(auth => {
            if(auth.get(0) === postingPubkey)
                throw 'Login will not be saved, posting key is the same as owner key'
        })
    } catch(e) {
        console.error(e)
        return
    }
    const memoKey = private_keys.get('memo_private')
    const memoWif = memoKey && memoKey.toWif()
    const data = new Buffer(`${username}\t${posting_private.toWif()}\t${memoWif || ''}\t${login_owner_pubkey || ''}`).toString('hex')
    // autopost is a auto login for a low security key (like the posting key)
    localStorage.setItem('autopost2', data)
}

function* logout() {
    yield put(user.actions.saveLoginConfirm(false)) // Just incase it is still showing
    if (process.env.BROWSER)
        localStorage.removeItem('autopost2')
    serverApiLogout();
}

function* loginError({payload: {/*error*/}}) {
    serverApiLogout();
}

/**
    If the owner key was changed after the login owner key, this function will find the next owner key history record after the change and store it under user.previous_owner_authority.
*/
function* lookupPreviousOwnerAuthority({payload: {}}) {
    const current = yield select(state => state.user.get('current'))
    if(!current) return

    const login_owner_pubkey = current.get('login_owner_pubkey')
    if(!login_owner_pubkey) return

    const username = current.get('username')
    const key_auths = yield select(state => state.global.getIn(['accounts', username, 'owner', 'key_auths']))
    if (key_auths && key_auths.find(key => key.get(0) === login_owner_pubkey)) {
        // console.log('UserSaga ---> Login matches current account owner');
        return
    }
    // Owner history since this index was installed July 14
    let owner_history = fromJS(yield call(Apis.db_api, 'get_owner_history', username))
    if(owner_history.count() === 0) return
    owner_history = owner_history.sort((b, a) => {//sort decending
        const aa = a.get('last_valid_time')
        const bb = b.get('last_valid_time')
        return aa < bb ? -1 : aa > bb ? 1 : 0
    })
    // console.log('UserSaga ---> owner_history', owner_history.toJS())
    const previous_owner_authority = owner_history.find(o => {
        const auth = o.get('previous_owner_authority')
        const weight_threshold = auth.get('weight_threshold')
        const key3 = auth.get('key_auths').find(key2 => key2.get(0) === login_owner_pubkey && key2.get(1) >= weight_threshold)
        return key3 ? auth : null
    })
    if(!previous_owner_authority) {
        console.log('UserSaga ---> Login owner does not match owner history');
        return
    }
    // console.log('UserSage ---> previous_owner_authority', previous_owner_authority.toJS())
    yield put(user.actions.setUser({previous_owner_authority}))
}

function* uploadImageWatch() {
    yield* takeLatest('user/UPLOAD_IMAGE', uploadImage);
}

function* uploadImage({payload: {file, dataUrl, filename = 'image.txt', progress}}) {
    const _progress = progress
    progress = msg => {
        console.log('Upload image progress', msg)
        _progress(msg)
    }

    const stateUser = yield select(state => state.user)
    const username = stateUser.getIn(['current', 'username'])
    const d = stateUser.getIn(['current', 'private_keys', 'posting_private'])
    if(!username) {
        progress({error: 'Not logged in'})
        return
    }
    if(!d) {
        progress({error: 'Login with your posting key'})
        return
    }

    if(!file && !dataUrl) {
        console.error('uploadImage required: file or dataUrl')
        return
    }

    let data, dataBs64
    if(file) {
        // drag and drop
        const reader = new FileReader()
        data = yield new Promise(resolve => {
            reader.addEventListener('load', () => {
                const result = new Buffer(reader.result, 'binary')
                resolve(result)
            })
            reader.readAsBinaryString(file)
        })
    } else {
        // recover from preview
        const commaIdx = dataUrl.indexOf(',')
        dataBs64 = dataUrl.substring(commaIdx + 1)
        data = new Buffer(dataBs64, 'base64')
    }

    const bufSha = hash.sha256(data)

    const formData = new FormData()
    if(file) {
        formData.append('file', file)
    } else {
        // formData.append('file', file, filename) <- Failed to add filename=xxx to Content-Disposition
        // Can't easily make this look like a file so this relies on the server supporting: filename and filebinary
        formData.append('filename', filename)
        formData.append('filebase64', dataBs64)
    }

    const sig = Signature.signBufferSha256(bufSha, d)
    const postUrl = `${$STM_Config.uploadImage}/${username}/${sig.toHex()}`

    fetch(postUrl, {
        method: 'post',
        body: formData
    })
    .then(r => r.json())
    .then(res => {
        const {error} = res
        if(error) {
            progress({error: 'Error: ' + error})
            return
        }
        const {url} = res
        progress({url})
    })
    .catch(error => {
        console.error(filename, error)
        progress({error: 'Unable to contact the server.'})
        return
    })
}


// function* getCurrentAccount() {
//     const current = yield select(state => state.user.get('current'))
//     if (!current) return
//     const [account] = yield call(Apis.db_api, 'get_accounts', [current.get('username')])
//     yield put(g.actions.receiveAccount({ account }))
// }
