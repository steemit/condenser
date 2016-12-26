// 4567891123456789212345678931234567894123456789512345678961234567897123456789$
import winston from 'winston';

var logTransports = [];

if(process.env.NODE_ENV === 'production') {
    logTransports.push(new (winston.transports.Console)({ level: 'info' }));
} else {
    logTransports.push(new (winston.transports.Console)({ level: 'debug' }));
}

var log = new (winston.Logger)({
    transports: logTransports
});

log.info("initializing logging");

export default log;
