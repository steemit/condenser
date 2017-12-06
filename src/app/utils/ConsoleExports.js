import {
    PrivateKey,
    PublicKey,
    Aes,
    key_utils,
} from '@steemit/steem-js/lib/auth/ecc';

// import secureRandom from 'secure-random'
// import links from 'app/utils/Links'
// import assert from 'assert'

module.exports = {
    PrivateKey,
    PublicKey,
    Aes,
    key_utils,

    // Run once to start, then again to stop and print a report
    // https://facebook.github.io/react/docs/perf.html
    perf: () => {
        const Perf = require('react-addons-perf');
        if (perfStarted) {
            Perf.stop();
            const lm = Perf.getLastMeasurements();
            Perf.printInclusive(lm);
            Perf.printExclusive(lm);
            Perf.printWasted(lm);
            perfStarted = false;
        } else {
            Perf.start();
            perfStarted = true;
        }
        return Perf;
    },

    resolve: (object, atty = '_') => {
        if (!object.then) {
            console.log(object);
            return object;
        }
        return new Promise((resolve, reject) => {
            object
                .then(result => {
                    console.log(result);
                    resolve(result);
                    window[atty] = result;
                })
                .catch(error => {
                    console.error(error);
                    reject(error);
                    window[atty] = error;
                });
        });
    },

    init: context => {
        if (!context) return;
        for (const obj in module.exports) {
            if (obj === 'init') continue;
            context[obj] = module.exports[obj];
        }
    },

    // retest: () => {
    //     const largeData = secureRandom.randomBuffer(1024 * 10).toString('hex')
    //     const all = links.any()
    //     for (let i = 0; i < 10000; i++) {
    //         const match = (largeData + 'https://example.com').match(all)
    //         assert(match, 'no match')
    //         assert(match[0] === 'https://example.com', 'no match')
    //     }
    // },
};

let perfStarted = false;
