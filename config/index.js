const config = {};

if (process.env.BROWSER) throw new Error('config should stay on server!');

Object.assign(config, require(process.env.NODE_ENV === 'production' ? './golos.json' : './golos-dev.json'));

export default config;
