import models from '../models';

function findByProvider(provider_user_id, resolve) {
    if (!provider_user_id) resolve(null);
    const query = {
        attributes: ['user_id'],
        where: {provider_user_id}
    };
    models.Identity.findOne(query).then(identity => {
        if (identity) {
            models.User.findOne({
                attributes: ['id'],
                where: {id: identity.user_id}
            }).then(u => resolve(u));
        } else {
            resolve(null);
        }
    });
}

export default function findUser({user_id, email, uid, provider_user_id}) {
    console.log('-- findUser  -->', user_id, email, uid, provider_user_id);
    return new Promise(resolve => {
        let query;
        const where_or = [];
        if (user_id) where_or.push({id: user_id});
        if (email) where_or.push({email});
        if (uid) where_or.push({uid});
        if (where_or.length > 0) {
            query = {
                attributes: ['id'],
                where: {$or: where_or}
            };
            console.log('-- findUser query -->', query);
            models.User.findOne(query).then(user => {
                if (user) resolve(user);
                else {
                    findByProvider(provider_user_id, resolve);
                }
            });
        } else {
            findByProvider(provider_user_id, resolve);
        }
    });
}
