
const PrivateKey = require('./key_private');
const hash = require('./hash');
const secureRandom = require('secure-random');

// hash for .25 second
const HASH_POWER_MILLS = 250;

let entropyPos = 0, entropyCount = 0
const entropyArray = secureRandom.randomBuffer(101)

module.exports = {

    addEntropy(...ints) {
        entropyCount++
        for(const i of ints) {
            const pos = entropyPos++ % 101
            const i2 = entropyArray[pos] += i
            if(i2 > 9007199254740991)
                entropyArray[pos] = 0
        }
    },

    /**
        A week random number generator can run out of entropy.  This should ensure even the worst random number implementation will be reasonably safe.

        @param1 string entropy of at least 32 bytes
    */
    random32ByteBuffer(entropy = this.browserEntropy()) {

        if (!(typeof entropy === 'string')) {
            throw new Error("string required for entropy");
        }

        if (entropy.length < 32) {
            throw new Error("expecting at least 32 bytes of entropy");
        }

        const start_t = Date.now();

        while (Date.now() - start_t < HASH_POWER_MILLS)
            entropy = hash.sha256(entropy);

        const hash_array = [];
        hash_array.push(entropy);

        // Hashing for 1 second may helps the computer is not low on entropy (this method may be called back-to-back).
        hash_array.push(secureRandom.randomBuffer(32));

        return hash.sha256(Buffer.concat(hash_array));
    },

    get_random_key(entropy) {
        return PrivateKey.fromBuffer(this.random32ByteBuffer(entropy));
    },

    // Turn invisible space like characters into a single space
    // normalize_brain_key(brain_key){
    //     if (!(typeof brain_key === 'string')) {
    //         throw new Error("string required for brain_key");
    //     }
    //     brain_key = brain_key.trim();
    //     return brain_key.split(/[\t\n\v\f\r ]+/).join(' ');
    // },

    browserEntropy() {
        let entropyStr = Array(entropyArray).join()
        try {
            entropyStr += (new Date()).toString() + " " + window.screen.height + " " + window.screen.width + " " +
                window.screen.colorDepth + " " + " " + window.screen.availHeight + " " + window.screen.availWidth + " " +
                window.screen.pixelDepth + navigator.language + " " + window.location + " " + window.history.length;

            for (let i = 0, mimeType; i < navigator.mimeTypes.length; i++) {
                mimeType = navigator.mimeTypes[i];
                entropyStr += mimeType.description + " " + mimeType.type + " " + mimeType.suffixes + " ";
            }
            console.log("INFO\tbrowserEntropy gathered", entropyCount, 'events')
        } catch(error) {
            //nodejs:ReferenceError: window is not defined
            entropyStr += hash.sha256((new Date()).toString())
        }

        const b = new Buffer(entropyStr);
        entropyStr += b.toString('binary') + " " + (new Date()).toString();
        return entropyStr;
    },

};
