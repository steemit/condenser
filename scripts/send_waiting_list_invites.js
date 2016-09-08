import models from '../db/models';
import sendEmail from '../server/sendEmail';

models.User.findAll({
    attributes: ['id', 'email'],
    where: {waiting_list: true,  email: {$ne: null}},
    order: 'id DESC',
    limit: 2
}).then(users => {
    for(let u of users) {
        const email = u.email.toLowerCase();
        const m = email.match(/\.(\w+)$/);
        if (!m || m[1] === 'ru') continue;
        const confirmation_code = Math.random().toString(36).slice(2);
        const i_attrs = {
            provider: 'email',
            user_id: u.id,
            email,
            verified: false,
            confirmation_code
        };
        models.Identity.create(i_attrs).then(() => {
            sendEmail('waiting_list_invite', email, {confirmation_code});
        });
    }
});
