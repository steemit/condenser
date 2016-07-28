var config = require(__dirname + '/../config').default.db;
var exec = require('child_process').spawn;

var args = ['-u', config.username];
if (config.password) {
    args.push('--password=' + config.password);
}
if (config.port) {
    args.push('-P'); args.push(config.port);
}
if (config.host) {
    args.push('-h'); args.push(config.host);
}
args.push(config.database);
exec('mysql', args, {
    stdio: 'inherit'
});
