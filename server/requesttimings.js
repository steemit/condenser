module.exports = requestTime;

function requestTime() {
	return function *requestTime(next) {
    	let start = Date.now();
    	yield* next;
    	let delta = Math.ceil(Date.now() - start);
    	// log all requests that take longer than 150ms
    	if(delta > 150)
    		console.log('Request took too long! ' + delta + 'ms: ' + this.request.method + ' ' + this.request.path);
  	}
}