module.exports = {
    'Ensure homepage loads without strange errors': browser => {
        browser
            .url('http://localhost:8080')
            .pause(300)
            //.assert.containsText('h1.articles__h1', 'Trending: All tags')
            .assert.containsText('a.Header__login-link', 'Login')
            .getLog('browser', function(result) {
                this.assert.ok(
                    reasonableErrorLog(result),
                    'error log is reasonable'
                );
            })
            .end();
    },
};

function reasonableErrorLog(logs) {
    const logsMinusNetworkErrors = logs.filter(log => log.source !== 'network');
    return logsMinusNetworkErrors.length === 0;
}
