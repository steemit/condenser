
import ByteBuffer from 'bytebuffer'
import {Aes} from 'shared/ecc'
import {ops} from 'shared/serializer'
import assert from 'assert'
import base58 from 'bs58'

const encMemo = ops.encrypted_memo

/**
    Some fields are only required if the memo is marked for decryption (starts with a hash).
    @arg {string|PrivateKey} private_key - WIF or PrivateKey object
    @arg {string} memo - plain text is returned, hash prefix base58 is decrypted
    @return {string} - utf8 decoded string (hash prefix)
*/
export function decode(private_key, memo) {
    assert(memo, 'memo is required')
    assert.equal(typeof memo, 'string', 'memo')
    if(!/^#/.test(memo)) return memo
    memo = memo.substring(1)

    assert(private_key, 'private_key is required')

    memo = base58.decode(memo)
    memo = encMemo.fromBuffer(new Buffer(memo, 'binary'))

    const {from, to, nonce, check, encrypted} = memo
    const pubkey = private_key.toPublicKey().toString()
    const otherpub = pubkey === from.toString() ? to.toString() : from.toString()
    memo = Aes.decrypt(private_key, otherpub, nonce, encrypted, check)

    // remove varint length prefix
    const mbuf = ByteBuffer.fromBinary(memo.toString('binary'), ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    try {
        mbuf.mark()
        return mbuf.readVString()
    } catch(e) {
        mbuf.reset()
        // Sender did not length-prefix the memo
        memo = new Buffer(mbuf.toString('binary'), 'binary').toString('utf-8')
        return memo
    }
}

/**
    Some fields are only required if the memo is marked for encryption (starts with a hash).
    @arg {string|PrivateKey} private_key - WIF or PrivateKey object
    @arg {string|PublicKey} public_key - Recipient
    @arg {string} memo - plain text is returned, hash prefix text is encrypted
    @arg {string} [testNonce = undefined] - just for testing
    @return {string} - base64 decoded string (or plain text)
*/
export function encode(private_key, public_key, memo, testNonce) {
    assert(memo, 'memo is required')
    assert.equal(typeof memo, 'string', 'memo')
    if(!/^#/.test(memo)) return memo
    memo = memo.substring(1)

    assert(private_key, 'private_key is required')
    assert(public_key, 'public_key is required')

    const mbuf = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    mbuf.writeVString(memo)
    memo = new Buffer(mbuf.copy(0, mbuf.offset).toBinary(), 'binary')

    const {nonce, message, checksum} = Aes.encrypt(private_key, public_key, memo, testNonce)
    memo = encMemo.fromObject({
        from: private_key.toPublicKey(),
        to: public_key,
        nonce,
        check: checksum,
        encrypted: message
    })
    // serialize
    memo = encMemo.toBuffer(memo)
    return '#' + base58.encode(new Buffer(memo, 'binary'))
}
