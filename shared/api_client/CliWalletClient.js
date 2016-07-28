// deprecated, will be removed soon

import WebSocketClient from './WebSocketClient';

class Api {
    connect(connection_string = config.cli_wallet_connection) {
        if (this.ws_rpc) return; // already connected
        console.log(`connecting to cli_wallet ${connection_string}`);
        this.ws_rpc = new WebSocketClient(connection_string, connection_string);
    }

    close() {
        this.ws_rpc.close();
        this.ws_rpc = null;
    }

    exec(method, params = []) {
        console.log('CliWalletClient exec', method, '(', params, ')');
        return this.ws_rpc.call(0, method, params);
    }

    connect_promise() {
        return this.ws_rpc.connect_promise;
    }
}

let api_instance;

export default {
    instance(connection_string) {
        if (!api_instance) {
            api_instance = new Api();
            api_instance.connect(connection_string);
        }
        return api_instance;
    }
};
