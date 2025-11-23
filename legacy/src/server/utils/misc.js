import path from 'path';
import fs from 'fs';

function getRemoteIp(req) {
    const remote_address =
        req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ip_match = remote_address
        ? remote_address.match(/(\d+\.\d+\.\d+\.\d+)/)
        : null;
    return ip_match ? ip_match[1] : remote_address;
}

var ip_last_hit = new Map();
function rateLimitReq(ctx, req) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();

    // purge hits older than minutes_max
    ip_last_hit.forEach((v, k) => {
        const seconds = (now - v) / 1000;
        if (seconds > 1) {
            ip_last_hit.delete(ip);
        }
    });

    let result = false;
    // if ip is still in the map, abort
    if (ip_last_hit.has(ip)) {
        // console.log(`api rate limited for ${ip}: ${req}`);
        // throw new Error(`Rate limit reached: one call per ${minutes_max} minutes allowed.`);
        console.error(`Rate limit reached: one call per 1 second allowed.`);
        ctx.status = 429;
        ctx.body = 'Too Many Requests';
        result = true;
    }

    // record api hit
    ip_last_hit.set(ip, now);
    return result;
}

function checkCSRF(ctx, csrf) {
    try {
        ctx.assertCSRF(csrf);
    } catch (e) {
        ctx.status = 403;
        ctx.body = 'invalid csrf token';
        console.log(
            '-- invalid csrf token -->',
            ctx.request.method,
            ctx.request.url,
            ctx.session.uid
        );
        return false;
    }
    return true;
}

function getSupportedLocales() {
    const locales = [];
    const files = fs.readdirSync(
        path.join(__dirname, '../../..', 'src/app/locales')
    );
    for (const filename of files) {
        const match_res = filename.match(/(\w+)\.json?$/);
        if (match_res) locales.push(match_res[1]);
    }
    return locales;
}

module.exports = {
    getRemoteIp,
    rateLimitReq,
    checkCSRF,
    getSupportedLocales,
};
