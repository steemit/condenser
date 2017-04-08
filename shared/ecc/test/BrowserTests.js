import assert from 'assert'
import {PrivateKey, PublicKey} from 'shared/ecc'
import {encode, decode} from 'shared/chain/memo'
import {serverApiRecordEvent} from 'app/utils/ServerApiClient'

export const browserTests = {}

export default function runTests() {
    let rpt = ''
    let pass = true
    function it(name, fn) {
        console.log('Testing', name)
        rpt += 'Testing ' + name + '\n'
        try {
            fn()
        } catch(error) {
            console.error(error)
            pass = false
            rpt += error.stack + '\n\n'
            serverApiRecordEvent('client_error', error)
        }
    }

    let private_key, public_key, encodedMemo
    const wif = '5JdeC9P7Pbd1uGdFVEsJ41EkEnADbbHGq6p1BwFxm6txNBsQnsw'
    const pubkey = 'STM8m5UgaFAAYQRuaNejYdS8FVLVp9Ss3K1qAVk5de6F8s3HnVbvA'

    it('create private key', () => {
        private_key = PrivateKey.fromSeed('1')
        assert.equal(private_key.toWif(), wif)
    })
    it('supports WIF format', () => {
        assert(PrivateKey.fromWif(wif))
    })
    it('finds public from private key', () => {
        public_key = private_key.toPublicKey()
        // substring match ignore prefix
        assert.equal(public_key.toString(), pubkey, 'Public key did not match')
    })
    it('parses public key', () => {
        assert(PublicKey.fromString(public_key.toString()))
    })
    it('encrypts memo', () => {
        encodedMemo = encode(private_key, public_key, '#memo')
        assert(encodedMemo)
    })
    it('decripts memo', () => {
        const dec = decode(private_key, encodedMemo)
        if(dec !== '#memo') {
            console.error('Decoded memo did not match (memo encryption is unavailable)')
            browserTests.memo_encryption = false
        }
    })
    if(!pass) return rpt
}
