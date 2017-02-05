const assert = require('assert');
const config = require('../config');
const hash = require('./hash');
const base58 = require('bs58');

/** Addresses are shortened non-reversable hashes of a public key.  The full PublicKey is preferred.
    @deprecated
*/
class Address {

    constructor(addy) { this.addy = addy; }

    static fromBuffer(buffer) {
        const _hash = hash.sha512(buffer);
        const addy = hash.ripemd160(_hash);
        return new Address(addy);
    }

    static fromString(string, address_prefix = config.address_prefix) {
        const prefix = string.slice(0, address_prefix.length);
        assert.equal(address_prefix, prefix, `Expecting key to begin with ${address_prefix}, instead got ${prefix}`);
        let addy = string.slice(address_prefix.length);
        addy = new Buffer(base58.decode(addy), 'binary');
        const checksum = addy.slice(-4);
        addy = addy.slice(0, -4);
        let new_checksum = hash.ripemd160(addy);
        new_checksum = new_checksum.slice(0, 4);
        assert.deepEqual(checksum, new_checksum, 'Checksum did not match');
        return new Address(addy);
    }

    /** @return Address - Compressed PTS format (by default) */
    static fromPublic(public_key, compressed = true, version = 56) {
        const sha2 = hash.sha256(public_key.toBuffer(compressed));
        const rep = hash.ripemd160(sha2);
        const versionBuffer = new Buffer(1);
        versionBuffer.writeUInt8((0xFF & version), 0);
        const addr = Buffer.concat([versionBuffer, rep]);
        let check = hash.sha256(addr);
        check = hash.sha256(check);
        const buffer = Buffer.concat([addr, check.slice(0, 4)]);
        return new Address(hash.ripemd160(buffer));
    }

    toBuffer() {
        return this.addy;
    }

    toString(address_prefix = config.address_prefix) {
        const checksum = hash.ripemd160(this.addy);
        const addy = Buffer.concat([this.addy, checksum.slice(0, 4)]);
        return address_prefix + base58.encode(addy);
    }
}

module.exports = Address;
