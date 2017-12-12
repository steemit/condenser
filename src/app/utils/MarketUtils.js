function roundUp(num, precision) {
    let satoshis = parseFloat(num) * Math.pow(10, precision);

    // Attempt to correct floating point: 1.0001 satoshis should not round up.
    satoshis = satoshis - 0.0001;

    // Round up, restore precision
    return Math.ceil(satoshis) / Math.pow(10, precision);
}

function roundDown(num, precision) {
    let satoshis = parseFloat(num) * Math.pow(10, precision);

    // Attempt to correct floating point: 1.9999 satoshis should not round down.
    satoshis = satoshis + 0.0001;

    // Round down, restore precision
    return Math.floor(satoshis) / Math.pow(10, precision);
}

/**
 * Returns a sorting function which uses a given column and value-fetcher.
 *
 * @param {Function} getValue
 * @param {String} columnName
 * @param {Number} dir either 1 or -1
 */
const createOrderSorter = (getValue, columnName, dir) => (a, b) => {
    if (getValue(a[columnName]) < getValue(b[columnName])) {
        return -1 * dir;
    }

    if (getValue(a[columnName]) > getValue(b[columnName])) {
        return 1 * dir;
    }

    return 0;
};

module.exports = {
    roundUp,
    roundDown,
    createOrderSorter,
};
