import { auth } from '@steemit/steem-js';
import { Signature, PublicKey } from '@steemit/steem-js/lib/auth/ecc';
import { randomBytes } from 'crypto';
const DATA_TIMEOUT = 60 * 2; // second
function signData(data, privKey) {
    let d = '';
    if (typeof data === 'string') d = data;
    if (typeof data === 'object') d = JSON.stringify(data);
    if (!auth.isWif(privKey)) {
        throw new Error('unexpected_private_key');
    }

    const nonce = randomBytes(8).toString('hex');
    const timestamp = getUtcTimestamp();

    const sign = Signature.sign(`${d}${nonce}${timestamp}`, privKey);
    const signature = sign.toHex();
    return {
        ...data,
        nonce,
        timestamp,
        signature,
    };
}

function unsignData(data, pubKey) {
    const { nonce, timestamp, signature } = data;
    const currentTimestamp = getUtcTimestamp();
    if (nonce === undefined) {
        throw new Error('lost_nonce');
    }
    if (timestamp === undefined) {
        throw new Error('lost_timestamp');
    }
    if (signature === undefined) {
        throw new Error('lost_signature');
    }
    if (currentTimestamp - timestamp > DATA_TIMEOUT) {
        throw new Error('data_timeout');
    }
    const d = JSON.stringify(data, (k, v) => {
        if (['nonce', 'timestamp', 'signature'].indexOf(k) === -1) {
            return v;
        }
        return undefined;
    });
    const msg = new Buffer(`${d}${nonce}${timestamp}`);
    const sign = Signature.fromHex(signature);
    return sign.verifyBuffer(msg, PublicKey.fromString(pubKey));
}

function getUtcTimestamp() {
    const now = new Date();
    const utcTimestamp = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds()
    );
    return `${parseInt(utcTimestamp / 1000, 10)}`;
}

module.exports = {
    signData,
    unsignData,
};
