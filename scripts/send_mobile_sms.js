import models from '../db/models';
import teleSign from 'server/teleSign';

function smsUser(u, mobile) {
    const confirmation_code = Math.random().toString().slice(14);
    const query = {
        attributes: ['email'],
        where: {mobile}
    };
    models.Identity.findOne(query).then(identity => {
    })
    console.log(`\n***** sms #${mobile} ***** `, u.id, mobile, confirmation_code);
    const i_attrs = {
        provider: 'mobile',
        user_id: u.id,
        email: mobile,
        verified: false,
        confirmation_code
    };
    models.Identity.create(i_attrs).then(() => {
        teleSign.verifySms({mobile, confirmation_code, ip});
    });
}

models.User.findAll({
    attributes: ['id', 'email'],
    where: {waiting_list: true, email: {$ne: null}, id: {$gt: 0}},
    order: 'id',
    limit: 1000
}).then(users => {
    let counter = 1;
    for(let u of users) {
        const email = u.email.toLowerCase();
        if (email.match(/\@qq\.com$/)) continue;
        const m = email.match(/\.(\w+)$/);
        if (!m || m[1] === 'ru') continue;
        const number = counter;
        setTimeout(() => inviteUser(u, email, number), counter * 1000);
        counter += 1;
    }
});
