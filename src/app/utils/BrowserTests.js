import assert from 'assert';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import { PrivateKey, PublicKey } from '@steemit/steem-js/lib/auth/ecc';
import { config } from '@steemit/steem-js';

export const browserTests = {};

export default function runTests() {
    let rpt = '';
    let pass = true;
    function it(name, fn) {
        console.log('Testing', name);
        rpt += 'Testing ' + name + '\n';
        try {
            fn();
        } catch (error) {
            console.error(error);
            pass = false;
            rpt += error.stack + '\n\n';
            serverApiRecordEvent('client_error', error);
        }
    }

    let private_key, public_key;
    const wif = '5JdeC9P7Pbd1uGdFVEsJ41EkEnADbbHGq6p1BwFxm6txNBsQnsw';
    const pubkey =
        config.get('address_prefix') +
        '8m5UgaFAAYQRuaNejYdS8FVLVp9Ss3K1qAVk5de6F8s3HnVbvA';

    it('create private key', () => {
        private_key = PrivateKey.fromSeed('1');
        assert.equal(private_key.toWif(), wif);
    });
    it('supports WIF format', () => {
        assert(PrivateKey.fromWif(wif));
    });
    it('finds public from private key', () => {
        public_key = private_key.toPublicKey();
        // substring match ignore prefix
        assert.equal(public_key.toString(), pubkey, 'Public key did not match');
    });
    it('parses public key', () => {
        assert(PublicKey.fromString(public_key.toString()));
    });
    if (!pass) return rpt;
}
