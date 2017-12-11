import Post from 'app/components/pages/Post';

module.exports = {
    path: '/(:category/)@:username/:slug',
    component: Post,
};
