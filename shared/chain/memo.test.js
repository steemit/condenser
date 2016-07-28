import assert from 'assert'
import {encode, decode} from 'shared/chain/memo'
import {PrivateKey} from 'shared/ecc'

const testMemo = {
    private_key: PrivateKey.fromSeed(""),
    base58: '#HU6pdQ4Hh8cFrDVooekRPVZu4BdrhAe9RxrWrei2CwfAApAPdM4PT5mSV9cV3tTuWKotYQF6suyM4JHFBZz4pcwyezPzuZ2na7uwhRcLqFoqCam1VU3eCLjVNqcgUNbH3',
    nonce: '1462976530069648',
    text: '#爱'
}

describe('memo', ()=> {
    it('encodes', () => {
        const {private_key, base58, nonce, text} = testMemo
        const encodedMemo = encode(private_key, private_key.toPublicKey(), text, nonce)
        assert.equal(encodedMemo, base58)
    })
    it('decode', ()=> {
        const {private_key, base58, text} = testMemo
        const memo = decode(private_key, base58)
        assert.equal(memo, text.substring(1))
    })
})