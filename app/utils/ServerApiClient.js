
/**
    @return {string} parsable JSON login challenge.  A string is returned for accurate signing purposes.
*/
export function *serverApiLoginChallenge() {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return undefined;
    return yield fetch('/api/v1/login_challenge', {
        method: 'get',
        mode: 'no-cors',
        credentials: 'same-origin',
    })
    .then(r => r.text())
    .then(challengeString => {
        // challengeString should not be trusted.
        // Don't allow anything that could be a valid transaction.
        const challengeInConfig = $STM_Config.login_challenge_description

        // Make sure we have challenge description to validate
        if(!challengeInConfig || challengeInConfig.trim() === '')
            throw new Error('Missing required value: config.login_challenge_description')

        const o = JSON.parse(challengeString)
        const discriptionMatches = o.description === challengeInConfig
        if(!discriptionMatches)
            throw new Error(`Expecting login challenge '${challengeInConfig}', instead got '${o.login_challenge_description}'`)

        if(!o.token)
            throw new Error('Missing login challenge token')

        if(Object.keys(o).length !== 2)
            throw new Error('Login challenge object should have only two properties')

        return challengeString // return string for signing purposes
    })
}

export function serverApiLogin(account, signatures) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    fetch('/api/v1/login_account', {
        method: 'post',
        mode: 'no-cors',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({account, signatures, csrf: $STM_csrf})
    });
}

export function serverApiLogout() {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    fetch('/api/v1/logout_account', {
        method: 'post',
        mode: 'no-cors',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({csrf: $STM_csrf})
    });
}

let last_call;
export function serverApiRecordEvent(type, val) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    if (last_call && (new Date() - last_call < 60000)) return;
    last_call = new Date();
    const value = val && val.stack ? `${val.toString()} | ${val.stack}` : val;
    fetch('/api/v1/record_event', {
        method: 'post',
        mode: 'no-cors',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({csrf: $STM_csrf, type, value})
    });
}
