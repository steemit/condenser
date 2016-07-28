function roundUp(num, precision) {
    let n = Math.floor(parseFloat(num) * Math.pow(10, precision + 1))
    n = Math.round(n / 10.0)
    //console.log("roundup: ", num, " res: ", n);
    return Math.ceil(n) / Math.pow(10, precision)
}

function roundDown(num, precision) {
    let n = Math.floor(parseFloat(num) * Math.pow(10, precision + 1))
    n = Math.floor(n / 10.0)
    //console.log("rounddown: ", num, " res: ", n);
    return Math.floor(n) / Math.pow(10, precision)
}

module.exports = {
    roundUp,
    roundDown
}
