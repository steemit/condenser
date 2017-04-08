import secureRandom from 'secure-random'
import ByteBuffer from 'bytebuffer'

const PublicKey = require('./key_public')
const PrivateKey = require('./key_private')

// https://code.google.com/p/crypto-js
const CryptoJS = require("crypto-js");
const assert = require("assert");
const hash = require('./hash');

const Long = ByteBuffer.Long

/**
    Spec: http://localhost:3002/steem/@dantheman/how-to-encrypt-a-memo-when-transferring-steem
    @throws {Error|TypeError} - "Invalid Key, ..."
    @arg {PrivateKey} private_key - required and used for decryption
    @arg {PublicKey} public_key - required and used to calcualte the shared secret
    @arg {string} [nonce = uniqueNonce()] - assigned a random unique uint64

    @return {object}
    @property {string} nonce - random or unique uint64, provides entropy when re-using the same private/public keys.
    @property {Buffer} message - Plain text message
    @property {number} checksum - shared secret checksum
*/
export function encrypt(private_key, public_key, message, nonce = uniqueNonce()) {
    return crypt(private_key, public_key, nonce, message)
}

/**
    Spec: http://localhost:3002/steem/@dantheman/how-to-encrypt-a-memo-when-transferring-steem
    @arg {PrivateKey} private_key - required and used for decryption
    @arg {PublicKey} public_key - required and used to calcualte the shared secret
    @arg {string} nonce - random or unique uint64, provides entropy when re-using the same private/public keys.
    @arg {Buffer} message - Encrypted or plain text message
    @arg {number} checksum - shared secret checksum
    @throws {Error|TypeError} - "Invalid Key, ..."
    @return {Buffer} - message
*/
export function decrypt(private_key, public_key, nonce, message, checksum) {
    return crypt(private_key, public_key, nonce, message, checksum).message
}

/**
    @arg {Buffer} message - Encrypted or plain text message (see checksum)
    @arg {number} checksum - shared secret checksum (null to encrypt, non-null to decrypt)
*/
function crypt(private_key, public_key, nonce, message, checksum) {
    private_key = toPrivateObj(private_key)
    if (!private_key)
        throw new TypeError('private_key is required')

    public_key = toPublicObj(public_key)
    if (!public_key)
        throw new TypeError('public_key is required')

    nonce = toLongObj(nonce)
    if (!nonce)
        throw new TypeError('nonce is required')

    if (!Buffer.isBuffer(message)) {
        if (typeof message !== 'string')
            throw new TypeError('message should be buffer or string')
        message = new Buffer(message, 'binary')
    }
    if (checksum && typeof checksum !== 'number')
        throw new TypeError('checksum should be a number')

    const S = private_key.get_shared_secret(public_key);
    let ebuf = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    ebuf.writeUint64(nonce)
    ebuf.append(S.toString('binary'), 'binary')
    ebuf = new Buffer(ebuf.copy(0, ebuf.offset).toBinary(), 'binary')
    const encryption_key = hash.sha512(ebuf)

    // D E B U G
    // console.log('crypt', {
    //     priv_to_pub: private_key.toPublicKey().toString(),
    //     pub: public_key.toString(),
    //     nonce: nonce.toString(),
    //     message: message.length,
    //     checksum,
    //     S: S.toString('hex'),
    //     encryption_key: encryption_key.toString('hex'),
    // })

    const iv = CryptoJS.enc.Hex.parse(encryption_key.toString('hex').substring(64, 96))
    const key = CryptoJS.enc.Hex.parse(encryption_key.toString('hex').substring(0, 64))

    // check is first 64 bit of sha256 hash treated as uint64_t truncated to 32 bits.
    let check = hash.sha256(encryption_key)
    check = check.slice(0, 4)
    const cbuf = ByteBuffer.fromBinary(check.toString('binary'), ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN)
    check = cbuf.readUint32()

    if (checksum) {
        if (check !== checksum)
            throw new Error('Invalid key')
        message = cryptoJsDecrypt(message, key, iv)
    } else {
        message = cryptoJsEncrypt(message, key, iv)
    }
    return {nonce, message, checksum: check}
}

/** This method does not use a checksum, the returned data must be validated some other way.
    @arg {string|Buffer} ciphertext - binary format
    @return {Buffer} hex
*/
function cryptoJsDecrypt(message, key, iv) {
    assert(message, "Missing cipher text")
    message = toBinaryBuffer(message)
    message = CryptoJS.enc.Base64.parse(message.toString('base64'))
    message = CryptoJS.AES.decrypt({ciphertext: message, salt: null}, key, {iv})
    return new Buffer(message.toString(), 'hex')
}

/** This method does not use a checksum, the returned data must be validated some other way.
    @arg {string|Buffer} plaintext - binary format
    @return {Buffer} binary
*/
function cryptoJsEncrypt(message, key, iv) {
    assert(message, "Missing plain text")
    message = toBinaryBuffer(message)
    message = CryptoJS.lib.WordArray.create(message)
    // https://code.google.com/p/crypto-js/#Custom_Key_and_IV
    message = CryptoJS.AES.encrypt(message, key, {iv})
    return new Buffer(message.toString(), 'base64')
}

/** @return {string} unique 64 bit unsigned number string.  Being time based, this is careful to never choose the same nonce twice.  This value could be recorded in the blockchain for a long time.
*/
function uniqueNonce() {
    if(unique_nonce_entropy === null) {
        const b = secureRandom.randomUint8Array(2)
        unique_nonce_entropy = parseInt(b[0] << 8 | b[1], 10)
    }
    let long = Long.fromNumber(Date.now())
    const entropy = ++unique_nonce_entropy % 0xFFFF
    // console.log('uniqueNonce date\t', ByteBuffer.allocate(8).writeUint64(long).toHex(0))
    // console.log('uniqueNonce entropy\t', ByteBuffer.allocate(8).writeUint64(Long.fromNumber(entropy)).toHex(0))
    long = long.shiftLeft(16).or(Long.fromNumber(entropy));
    // console.log('uniqueNonce final\t', ByteBuffer.allocate(8).writeUint64(long).toHex(0))
    return long.toString()
}
let unique_nonce_entropy = null
// for(let i=1; i < 10; i++) key.uniqueNonce()

const toPrivateObj = o => (o ? o.d ? o : PrivateKey.fromWif(o) : o/*null or undefined*/)
const toPublicObj = o => (o ? o.Q ? o : PublicKey.fromString(o) : o/*null or undefined*/)
const toLongObj = o => (o ? Long.isLong(o) ? o : Long.fromString(o) : o)
const toBinaryBuffer = o => (o ? Buffer.isBuffer(o) ? o : new Buffer(o, 'binary') : o)
