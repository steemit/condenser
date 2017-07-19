function requestTime(numProcesses) {
    let number_of_requests = 0;
    return function *(next) {
        number_of_requests += 1;
        const start = Date.now();
        yield* next;
        const delta = Math.ceil(Date.now() - start);
        // log all requests that take longer than 150ms
        if (delta > 150)
            console.log(`Request took too long! ${delta}ms: ${this.request.method} ${this.request.path}. Number of parallel requests: ${number_of_requests}, number of processes: ${numProcesses}`);
        number_of_requests -= 1;
    }
}

module.exports = requestTime;

