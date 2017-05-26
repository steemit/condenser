import {WebEvent, esc} from 'db/models';

export default function recordWebEvent(ctx, event_type, value) {
    if (ctx.state.isBot) return;
    const s = ctx.session;
    const r = ctx.req;
    let new_session = true;
    if (ctx.last_visit) {
        new_session = ((new Date()).getTime() / 1000 - ctx.last_visit) > 1800;
    }
    const remote_address = r.headers['x-forwarded-for'] || r.connection.remoteAddress;
    const ip_match = remote_address ? remote_address.match(/(\d+\.\d+\.\d+\.\d+)/) : null;
    const d = {
        event_type: esc(event_type, 1000),
        user_id: s.user,
        uid: s.uid,
        account_name: null,
        first_visit: ctx.first_visit,
        new_session,
        ip: ip_match ? ip_match[1] : null,
        value: value ? esc(value, 1000) : esc(r.originalUrl),
        refurl: esc(r.headers.referrer || r.headers.referer),
        user_agent: esc(r.headers['user-agent']),
        status: ctx.status,
        channel: esc(s.ch, 64),
        referrer: esc(s.r, 64),
        campaign: esc(s.cn, 64)
    };
    WebEvent.create(d, {logging: false}).catch(error => {
        console.error('!!! Can\'t create web event record', error);
    });
}
