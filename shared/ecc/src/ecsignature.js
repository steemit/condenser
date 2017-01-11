var assert = require("assert");
// from https://github.com/bitcoinjs/bitcoinjs-lib
var enforceType = require("./enforce_types");

var BigInteger = require("bigi");

function ECSignature(r, s) {
    enforceType(BigInteger, r);
    enforceType(BigInteger, s);

    this.r = r;
    this.s = s;
}

// Import operations
ECSignature.parseCompact = function(buffer) {
    assert.equal(buffer.length, 65, "Invalid signature length");
    var i = buffer.readUInt8(0) - 27;

    // At most 3 bits
    assert.equal(i, i & 7, "Invalid signature parameter");
    var compressed = !!(i & 4);

    // Recovery param only
    i = i & 3;

    var r = BigInteger.fromBuffer(buffer.slice(1, 33));
    var s = BigInteger.fromBuffer(buffer.slice(33));

    return { compressed: compressed, i: i, signature: new ECSignature(r, s) };
};

ECSignature.fromDER = function(buffer) {
    assert.equal(buffer.readUInt8(0), 48, "Not a DER sequence");
    assert.equal(
        buffer.readUInt8(1),
        buffer.length - 2,
        "Invalid sequence length"
    );
    assert.equal(buffer.readUInt8(2), 2, "Expected a DER integer");

    var rLen = buffer.readUInt8(3);
    assert(rLen > 0, "R length is zero");

    var offset = 4 + rLen;
    assert.equal(buffer.readUInt8(offset), 2, "Expected a DER integer (2)");

    var sLen = buffer.readUInt8(offset + 1);
    assert(sLen > 0, "S length is zero");

    var rB = buffer.slice(4, offset);
    var sB = buffer.slice(offset + 2);
    offset += 2 + sLen;

    if (rLen > 1 && rB.readUInt8(0) === 0) {
        assert(rB.readUInt8(1) & 128, "R value excessively padded");
    }

    if (sLen > 1 && sB.readUInt8(0) === 0) {
        assert(sB.readUInt8(1) & 128, "S value excessively padded");
    }

    assert.equal(offset, buffer.length, "Invalid DER encoding");
    var r = BigInteger.fromDERInteger(rB);
    var s = BigInteger.fromDERInteger(sB);

    assert(r.signum() >= 0, "R value is negative");
    assert(s.signum() >= 0, "S value is negative");

    return new ECSignature(r, s);
};

// FIXME: 0x00, 0x04, 0x80 are SIGHASH_* boundary constants, importing Transaction causes a circular dependency
ECSignature.parseScriptSignature = function(buffer) {
    var hashType = buffer.readUInt8(buffer.length - 1);
    var hashTypeMod = hashType & ~128;

    assert(hashTypeMod > 0 && hashTypeMod < 4, "Invalid hashType");

    return {
        signature: ECSignature.fromDER(buffer.slice(0, -1)),
        hashType: hashType
    };
};

// Export operations
ECSignature.prototype.toCompact = function(i, compressed) {
    if (compressed)
        i += 4;
    i += 27;

    var buffer = new Buffer(65);
    buffer.writeUInt8(i, 0);

    this.r.toBuffer(32).copy(buffer, 1);
    this.s.toBuffer(32).copy(buffer, 33);

    return buffer;
};

ECSignature.prototype.toDER = function() {
    var rBa = this.r.toDERInteger();
    var sBa = this.s.toDERInteger();

    var sequence = [];

    // INTEGER
    sequence.push(2, rBa.length);
    sequence = sequence.concat(rBa);

    // INTEGER
    sequence.push(2, sBa.length);
    sequence = sequence.concat(sBa);

    // SEQUENCE
    sequence.unshift(48, sequence.length);

    return new Buffer(sequence);
};

ECSignature.prototype.toScriptSignature = function(hashType) {
    var hashTypeBuffer = new Buffer(1);
    hashTypeBuffer.writeUInt8(hashType, 0);

    return Buffer.concat([ this.toDER(), hashTypeBuffer ]);
};

module.exports = ECSignature;