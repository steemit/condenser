
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
    const len = mbuf.readVarint32() // remove the varint length prefix
    const remaining = mbuf.remaining()
    if(len !== remaining) // warn
        console.error(`Memo's length prefix ${len} does not match remaining bytes ${remaining}`)

    memo = new Buffer(mbuf.toString('binary'), 'binary').toString('utf-8')
    return memo
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

    // append the length prefix
    memo = new Buffer(memo, 'utf-8')
    const mbuf = ByteBuffer.fromBinary(memo.toString('binary'), ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    mbuf.writeVarint32(memo.length)
    mbuf.append(memo, 'binary')
    memo = mbuf.copy(0, mbuf.offset).toString('binary')

    const {nonce, message, checksum} = Aes.encrypt(private_key, public_key, memo, testNonce)
    memo = encMemo.fromObject({
        from: private_key.toPublicKey().toString(),
        to: public_key,
        nonce,
        check: checksum,
        encrypted: message
    })
    // serialize
    memo = encMemo.toBuffer(memo)
    return '#' + base58.encode(new Buffer(memo, 'binary'))
}
