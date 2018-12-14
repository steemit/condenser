import Post from 'app/components/Steemit/pages/Post';

module.exports = {
    path: '/(:category/)@:username/:slug',
    component: Post,
};
