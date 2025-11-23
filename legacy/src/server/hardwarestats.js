import cpuStat from 'cpu-stat';
import memStat from 'mem-stat';
import diskStat from 'disk-stat';

module.exports = hardwareStats;

let stats = {};

function handleError(err) {
    // perpetually throws the same error down the chain for promises
    throw err;
}

function startPromise() {
    return new Promise(function(resolve, reject) {
        resolve();
    });
}

function getCpuUsage() {
    return new Promise(function(resolve, reject) {
        cpuStat.usagePercent(function(err, percent, seconds) {
            if (err) return err;
            stats.cpuPercent = percent;
            resolve();
        });
    });
}

function getMemoryUsage() {
    return new Promise(function(resolve, reject) {
        stats.memoryStatsInGiB = memStat.allStats('GiB');
        resolve();
    });
}

function getDiskUsage() {
    return new Promise(function(resolve, reject) {
        stats.diskStats = diskStat.raw();
        resolve();
    });
}

function hardwareStats() {
    return startPromise()
        .then(getCpuUsage, handleError)
        .then(getMemoryUsage, handleError)
        .then(getDiskUsage, handleError)
        .then(function() {
            console.log(JSON.stringify(stats));
        }, handleError)
        .then(null, function(err) {
            console.log('error getting hardware stats: ' + err);
        });
}
