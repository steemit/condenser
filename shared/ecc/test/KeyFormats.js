import {Aes, PrivateKey, PublicKey, Address} from ".."
import assert from "assert"

var test = function(key) {
    describe("key_formats", function() {
        
        it("Calcualtes public key from private key", function() {
            var private_key = PrivateKey.fromHex(key.private_key);
            var public_key = private_key.toPublicKey();
            assert.equal(key.public_key, public_key.toPublicKeyString());
        });

        it("Create BTS short address", function() {
            var public_key = PublicKey.fromString(key.public_key);
            assert.equal(key.bts_address, public_key.toAddressString());
        })

        it("Blockchain Address", function() {
            var public_key = PublicKey.fromString(key.public_key);
            assert.equal(key.blockchain_address, public_key.toBlockchainAddress().toString('hex'));
        });
            
        it("BTS public key import / export", function() {
            var public_key = PublicKey.fromString(key.public_key);
            assert.equal(key.public_key, public_key.toPublicKeyString());
        });

        it("PTS", function() {
            var private_key = PrivateKey.fromHex(key.private_key);
            var public_key = private_key.toPublicKey();
            assert.equal(key.pts_address, public_key.toPtsAddy());
        });
        
        it("To WIF", function() {
            var private_key = PrivateKey.fromHex(key.private_key);
            assert.equal(key.private_key_WIF_format, private_key.toWif());
        });

        it("From WIF", function() {
            var private_key = PrivateKey.fromWif(key.private_key_WIF_format);
            assert.equal(private_key.toHex(), key.private_key);
        });
            
        it("Calc public key", function() {
            var private_key = PrivateKey.fromHex(key.private_key);
            var public_key = private_key.toPublicKey();
            assert.equal(key.bts_address, public_key.toAddressString());
        });
            
        it("BTS/BTC uncompressed", function() {
            var public_key = PublicKey.fromString(key.public_key);
            var address = Address.fromPublic(public_key, false, 0);
            assert.equal(key.Uncompressed_BTC, address.toString());
        });
        
        it("BTS/BTC compressed", function() {
            var public_key = PublicKey.fromString(key.public_key);
            var address = Address.fromPublic(public_key, true, 0);
            assert.equal(key.Compressed_BTC, address.toString());
        });
        
        it("BTS/PTS uncompressed", function() {
            var public_key = PublicKey.fromString(key.public_key);
            var address = Address.fromPublic(public_key, false, 56);
            assert.equal(key.Uncompressed_PTS, address.toString());
        });
        
        it("BTS/PTS compressed", function() {
            var public_key = PublicKey.fromString(key.public_key);
            var address = Address.fromPublic(public_key, true, 56);
            assert.equal(key.Compressed_PTS, address.toString());
        });
    });
};

test({
    // delegate0
    // sourced from: ./bitshares/programs/utils/bts_create_key
    public_key: "STM7jDPoMwyjVH5obFmqzFNp4Ffp7G2nvC7FKFkrMBpo7Sy4uq5Mj", 
    private_key: "20991828d456b389d0768ed7fb69bf26b9bb87208dd699ef49f10481c20d3e18",
    private_key_WIF_format: "5J4eFhjREJA7hKG6KcvHofHMXyGQZCDpQE463PAaKo9xXY6UDPq",
    bts_address: "STM8DvGQqzbgCR5FHiNsFf8kotEXr8VKD3mR",
    pts_address: "Po3mqkgMzBL4F1VXJArwQxeWf3fWEpxUf3",
    encrypted_private_key: "5e1ae410919c450dce1c476ae3ed3e5fe779ad248081d85b3dcf2888e698744d0a4b60efb7e854453bec3f6883bcbd1d",
    blockchain_address: "4f3a560442a05e4fbb257e8dc5859b736306bace",
    // https://github.com/BitShares/bitshares/blob/2602504998dcd63788e106260895769697f62b07/libraries/wallet/wallet_db.cpp#L103-L108
    Uncompressed_BTC:	"STMLAFmEtM8as1mbmjVcj5dphLdPguXquimn",
    Compressed_BTC:	"STMANNTSEaUviJgWLzJBersPmyFZBY4jJETY",
    Uncompressed_PTS:	"STMEgj7RM6FBwSoccGaESJLC3Mi18785bM3T",
    Compressed_PTS:	"STMD5rYtofD6D4UHJH6mo953P5wpBfMhdMEi"
});

