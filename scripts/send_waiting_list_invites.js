import models from '../db/models';
import sendEmail from '../server/sendEmail';
import secureRandom from 'secure-random'

function inviteUser(u, email, number) {
    const confirmation_code = secureRandom.randomBuffer(13).toString('hex');
    console.log(`\n***** invite #${number} ***** `, u.id, email, confirmation_code);
    const i_attrs = {
        provider: 'email',
        user_id: u.id,
        email,
        verified: false,
        confirmation_code
    };
    models.Identity.create(i_attrs).then(() => {
        sendEmail('waiting_list_invite', 'to@example.com', {confirmation_code}, 'from@example.com');
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
