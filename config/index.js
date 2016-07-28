const config = {};

if (process.env.BROWSER) throw new Error('config should stay on server!');

Object.assign(config, require(process.env.NODE_ENV === 'production' ? './steem.json' : './steem-dev.json'));

export default config;
