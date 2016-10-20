import Tarantool from 'tarantool-driver';

const tarantool = new Tarantool({port: 3313});
tarantool.connect()
.then(() => tarantool.auth('guest', ''))
.catch(error => {
    console.error('failed to connect to tarantool server:', error);
});

export default tarantool;
