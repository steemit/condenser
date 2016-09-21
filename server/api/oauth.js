import route from 'koa-route';
import Purest from 'purest';
import models from 'db/models';
import findUser from 'db/utils/find_user';
import {esc, escAttrs} from 'db/models';
import request from 'request'
import {getLogger} from '../../app/utils/Logger'

const print = getLogger('oauth').print

const facebook = new Purest({provider: 'facebook'});
const reddit = new Purest({provider: 'reddit'});
const vk = new Purest({provider: 'vk'})

function logErrorAndRedirect(ctx, where, error) {
    const s = ctx.session;
    let msg = 'unknown';
    if (error.toString()) msg = error.toString()
    else msg = error.error && error.error.message ? error.error.message : (error.msg || JSON.stringify(error));
    console.error(`oauth error [${where}|${s.user}|${s.uid}]|${ctx.req.headers['user-agent']}: ${msg}`);
    if (process.env.NODE_ENV === 'development') console.log(error.stack);
    ctx.flash = {alert: `${where} error: ${msg}`};
    ctx.redirect('/');
    return null;
}

function getRemoteIp(req) {
    const remote_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ip_match = remote_address ? remote_address.match(/(\d+\.\d+\.\d+\.\d+)/) : null;
    return ip_match ? ip_match[1] : esc(remote_address);
}

function retrieveFacebookUserData(access_token) {
    return new Promise((resolve, reject) => {
        facebook.query()
            .get('me?fields=name,email,location,picture{url},verified')
            .auth(access_token)
            .request((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.body);
                }
            });
    });
}

function* handleFacebookCallback() {
    console.log('-- /handle_facebook_callback -->', this.session.uid, this.query);
    let verified_email = false;
    try {
        if (this.query['error[error][message]']) {
            return logErrorAndRedirect(this, 'facebook:1', this.query['error[error][message]']);
        }
        const u = yield retrieveFacebookUserData(this.query.access_token);
        verified_email = !!(u.verified && u.email);
        const attrs = {
            uid: this.session.uid,
            name: u.name,
            email: u.email,
            first_name: u.first_name,
            last_name: u.last_name,
            birthday: u.birthday ? new Date(u.birthday) : null,
            gender: u.gender,
            picture_small: u.picture ? u.picture.data.url : null,
            location_id: u.location ? u.location.id : null,
            location_name: u.location ? u.location.name : null,
            locale: u.locale,
            timezone: u.timezone,
            remote_ip: getRemoteIp(this.request.req),
            verified: u.verified,
            waiting_list: false,
            facebook_id: u.id
        };
        const i_attrs = {
            provider: 'facebook',
            uid: u.id,
            name: u.name,
            email: u.email,
            verified: u.verified,
            provider_user_id: u.id
        };
        const i_attrs_email = {
            provider: 'email',
            email: u.email,
            verified: verified_email
        };

        let user = yield findUser({email: u.email, provider_user_id: u.id});
        console.log('-- /handle_facebook_callback user id -->', this.session.uid, user ? user.id : 'not found');

        let account_recovery_record = null;
        const provider = 'facebook';
        if (this.session.arec) {
            const arec = yield models.AccountRecoveryRequest.findOne({
                attributes: ['id', 'created_at', 'account_name', 'owner_key'],
                where: {id: this.session.arec}
            });
            if (arec) {
                const seconds_ago = (Date.now() - arec.created_at) / 1000;
                console.log('-- /handle_facebook_callback arec -->', this.session.uid, seconds_ago, arec.created_at);
                if (seconds_ago < 600) account_recovery_record = arec;
            }
        }
        if (account_recovery_record) {
            if (user) {
                const existing_account = yield models.Account.findOne({
                    attributes: ['id'],
                    where: {user_id: user.id, name: account_recovery_record.account_name},
                    order: 'id DESC'
                });
                if (existing_account) {
                    console.log('-- arec: confirmed user for account -->', this.session.uid, provider, account_recovery_record.id, existing_account.name, this.session.uid, account_recovery_record.owner_key);
                    account_recovery_record.update({user_id: user.id, status: 'confirmed'});
                    this.redirect('/recover_account_step_2');
                } else {
                    console.log('-- arec: failed to confirm user for account (no account) -->', this.session.uid, provider, account_recovery_record.id, user.id, this.session.uid, account_recovery_record.owner_key);
                    account_recovery_record.update({user_id: user.id, status: 'account not found'});
                    this.body = 'We cannot verify the user account. Please contact support@steemit.com';
                }
            } else {
                console.log('-- arec: failed to confirm user for account (no user) -->', this.session.uid, provider, this.session.uid, this.session.email);
                account_recovery_record.update({status: 'user not found'});
                this.body = 'We cannot verify the user account. Please contact support@steemit.com';
            }
            return null;
        }

        if (user) {
            i_attrs_email.user_id = attrs.id = user.id;
            yield models.User.update(attrs, {where: {id: user.id}});
            yield models.Identity.update(i_attrs, {where: {user_id: user.id, provider: 'facebook'}});
            if (verified_email) {
                const eid = yield models.Identity.findOne(
                    {attributes: ['id', 'verified'], where: {user_id: user.id, provider: 'email'}, order: 'id DESC'}
                );
                if (eid) {
                    if (!eid.verified) yield eid.update({email: u.email, verified: true});
                } else {
                    yield models.Identity.create(i_attrs_email);
                }
            }
            console.log('-- fb updated user -->', this.session.uid, user.id, u.name, u.email);
        } else {
            user = yield models.User.create(attrs);
            i_attrs_email.user_id = i_attrs.user_id = user.id;
            console.log('-- fb created user -->', user.id, u.name, u.email);
            const identity = yield models.Identity.create(i_attrs);
            console.log('-- fb created identity -->', this.session.uid, identity.id);
            if (i_attrs_email.email) {
                const email_identity = yield models.Identity.create(i_attrs_email);
                console.log('-- fb created email identity -->', this.session.uid, email_identity.id);
            }
        }
        this.session.user = user.id;
    } catch (error) {
        return logErrorAndRedirect(this, 'facebook:2', error);
    }
    this.flash = {success: 'Successfully authenticated with Facebook'};
    if (verified_email) {
        this.redirect('/create_account');
    } else {
        this.redirect('/enter_email');
    }
    return null;
}

function retrieveRedditUserData(access_token) {
    return new Promise((resolve, reject) => {
        reddit.query()
            .get('https://oauth.reddit.com/api/v1/me.json?raw_json=1')
            .headers({
                Authorization: `bearer ${access_token}`,
                'User-Agent': 'Steembot/1.0 (+http://steemit.com)',
                Accept: 'application/json',
                'Content-type': 'application/json'
            })
            .request((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    delete res.body.features;
                    resolve(res.body);
                }
            });
    });
}

function* handleRedditCallback() {
    try {
        const u = yield retrieveRedditUserData(this.query.access_token);
        console.log('-- /handle_reddit_callback  -->', this.session.uid, u);
        let user = yield findUser({provider_user_id: u.id});
        console.log('-- /handle_reddit_callback user id -->', this.session.uid, user ? user.id : 'not found');

        let account_recovery_record = null;
        const provider = 'reddit';
        if (this.session.arec) {
            const arec = yield models.AccountRecoveryRequest.findOne({
                attributes: ['id', 'created_at', 'account_name', 'owner_key'],
                where: {id: this.session.arec}
            });
            if (arec) {
                const seconds_ago = (Date.now() - arec.created_at) / 1000;
                if (seconds_ago < 600) account_recovery_record = arec;
            }
        }
        if (account_recovery_record) {
            if (user) {
                const existing_account = yield models.Account.findOne({
                    attributes: ['id'],
                    where: {user_id: user.id, name: account_recovery_record.account_name},
                    order: 'id DESC'
                });
                if (existing_account) {
                    console.log('-- arec: confirmed user for account -->', this.session.uid, provider, account_recovery_record.id, existing_account.name, this.session.uid, account_recovery_record.owner_key);
                    account_recovery_record.update({user_id: user.id, status: 'confirmed'});
                    this.redirect('/recover_account_step_2');
                } else {
                    console.log('-- arec: failed to confirm user for account (no account) -->', this.session.uid, provider, account_recovery_record.id, user.id, this.session.uid, account_recovery_record.owner_key);
                    account_recovery_record.update({user_id: user.id, status: 'account not found'});
                    this.body = 'We cannot verify the user account. Please contact support@steemit.com';
                }
            } else {
                console.log('-- arec: failed to confirm user for account (no user) -->', this.session.uid, provider, this.session.arec, this.session.email);
                account_recovery_record.update({status: 'user not found'});
                this.body = 'We cannot verify the user account. Please contact support@steemit.com';
            }
            return null;
        }

        const waiting_list = !u.comment_karma || u.comment_karma < 1;
        const i_attrs = {
            provider: 'reddit',
            provider_user_id: u.id,
            name: u.name,
            score: u.comment_karma
        };
        const attrs = {
            id: user ? user.id : null,
            uid: this.session.uid,
            name: u.name,
            remote_ip: getRemoteIp(this.req),
            verified: false
        };
        if (user) {
            if (!waiting_list) attrs.waiting_list = false;
            yield models.User.update(attrs, {where: {id: user.id}});
            yield models.Identity.update(i_attrs, {where: {user_id: user.id}});
            console.log('-- reddit updated user -->', this.session.uid, user.id, u.name);
        } else {
            attrs.waiting_list = waiting_list;
            user = yield models.User.create(attrs);
            console.log('-- reddit created user -->', this.session.uid, user.id, u.name);
            i_attrs.user_id = user.id;
            const identity = yield models.Identity.create(i_attrs);
            console.log('-- reddit created identity -->', this.session.uid, identity.id);
        }
        this.session.user = user.id;
        if (waiting_list) {
            this.redirect('/waiting_list.html');
            return null;
        }
    } catch (error) {
        return logErrorAndRedirect(this, 'reddit', error);
    }
    this.redirect('/enter_email');
    return null;
}


function retrieveVkUserData(access_token, userId) {
    console.log('https://api.vk.com/method/account.getProfileInfo?v=5.53&user_ids='+userId)
    return new Promise((resolve, reject) => {
       vk.query().get('https://api.vk.com/method/users.get?v=5.53&user_ids='+userId+'&fields=verified,sex,bdate,city,country,timezone,screen_name')
       .request((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.body);
                }
            });
    });
}

function* handleVkCallback() {
    let print = getLogger('oauth - vk').print;
    print ('session id', this.session.uid);
    print ('query', this.query)
    //console.log('-- /handle_facebook_callback -->', this.session.uid, this.query);
    let verified_email = false;
    let vkData = this.query;
    try {
      //const u = yield retrieveVkUserData(this.query.access_token);
      //print ('received data', u)
      if (!vkData['raw[email]']) {
          return logErrorAndRedirect(this, 'Ошибка регистрации через vkontakte:', 'нам нужен ваш email, на случай если вы забудете пароль');
      }
      const provider = 'vkontakte'
      let providerId = vkData['raw[user_id]']
      let email = vkData['raw[email]']

      const u = yield retrieveVkUserData(vkData.access_token, providerId);
      print ('user dara', u);
      const userData = u.response[0]
      let country = userData.country && userData.country.title || '';
      let city = userData.city && userData.city.title || '';
      let birthday = (userData.bdate && userData.bdate.split('.').length == 3) ? userData.bdate.split('.') : null;
      if (birthday) birthday = new Date(birthday[2], birthday[1], birthday[0]);

      const attrs = {
          uid: this.session.uid,
          name: [userData.first_name, userData.last_name].join(' '),
          email: email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          birthday: birthday,
          gender: userData.gender,
          location_id: null,
          location_name: [country, city].joi(', '),
          locale: userData.locale,
          timezone: userData.timezone,
          remote_ip: getRemoteIp(this.request.req),
          verified: !!userData.verified,
          waiting_list: false,
          vk_id: userData.id
      };
      verified_email = !!(userData.verified && email);

        const i_attrs = {
            provider: provider,
            uid: userData.id,
            name: attrs.name,
            email: email,
            verified: !!userData.verified,
            provider_user_id: userData.id
        };
        const i_attrs_email = {
            provider: 'email',
            email: email,
            verified: verified_email
        };

        let user = yield findUser({email: email, provider_user_id: userData.id});
        console.log('-- /handle_vk_callback user id -->', this.session.uid, user ? user.id : 'not found');

        let account_recovery_record = null;
        if (this.session.arec) {
            const arec = yield models.AccountRecoveryRequest.findOne({
                attributes: ['id', 'created_at', 'account_name', 'owner_key'],
                where: {id: this.session.arec}
            });
            if (arec) {
                const seconds_ago = (Date.now() - arec.created_at) / 1000;
                console.log('-- /handle_vk_callback arec -->', this.session.uid, seconds_ago, arec.created_at);
                if (seconds_ago < 600) account_recovery_record = arec;
            }
        }

        if (account_recovery_record) {
            if (user) {
                const existing_account = yield models.Account.findOne({
                    attributes: ['id'],
                    where: {user_id: user.id, name: account_recovery_record.account_name},
                    order: 'id DESC'
                });
                if (existing_account) {
                    console.log('-- arec: confirmed user for account -->', this.session.uid, provider, account_recovery_record.id, existing_account.name, this.session.uid, account_recovery_record.owner_key);
                    account_recovery_record.update({user_id: user.id, status: 'confirmed'});
                    this.redirect('/recover_account_step_2');
                } else {
                    console.log('-- arec: failed to confirm user for account (no account) -->', this.session.uid, provider, account_recovery_record.id, user.id, this.session.uid, account_recovery_record.owner_key);
                    account_recovery_record.update({user_id: user.id, status: 'account not found'});
                    this.body = 'We cannot verify the user account. Please contact support@steemit.com';
                }
            } else {
                console.log('-- arec: failed to confirm user for account (no user) -->', this.session.uid, provider, this.session.uid, this.session.email);
                account_recovery_record.update({status: 'user not found'});
                this.body = 'We cannot verify the user account. Please contact support@golos.io';
            }
            return null;
        }

        if (user) {
            i_attrs_email.user_id = attrs.id = user.id;
            yield models.User.update(attrs, {where: {id: user.id}});
            yield models.Identity.update(i_attrs, {where: {user_id: user.id, provider: provider}});
            if (verified_email) {
                const eid = yield models.Identity.findOne(
                    {attributes: ['id', 'verified'], where: {user_id: user.id, provider: 'email'}, order: 'id DESC'}
                );
                if (eid) {
                    if (!eid.verified) yield eid.update({email: u.email, verified: true});
                } else {
                    yield models.Identity.create(i_attrs_email);
                }
            }
            console.log('-- vk updated user -->', this.session.uid, user.id, u.name, u.email);
        } else {
            user = yield models.User.create(attrs);
            i_attrs_email.user_id = i_attrs.user_id = user.id;
            console.log('-- vk created user -->', user.id, u.name, u.email);
            const identity = yield models.Identity.create(i_attrs);
            console.log('-- vk created identity -->', this.session.uid, identity.id);
            if (i_attrs_email.email) {
                const email_identity = yield models.Identity.create(i_attrs_email);
                console.log('-- vk created email identity -->', this.session.uid, email_identity.id);
            }
        }
        this.session.user = user.id;
    } catch (error) {
        return logErrorAndRedirect(this, 'vk:2', JSON.stringify(error));
    }
    this.flash = {success: 'Successfully authenticated with Vkontakte'};
    this.redirect('/')

    if (verified_email) {
        this.redirect('/create_account');
    } else {
        this.redirect('/enter_email');
    }
    return null;
}


export default function useOauthLogin(app) {
    app.use(route.get('/handle_facebook_callback', handleFacebookCallback));
    app.use(route.get('/handle_reddit_callback', handleRedditCallback));
    app.use(route.get('/handle_vk_callback', handleVkCallback));

}
