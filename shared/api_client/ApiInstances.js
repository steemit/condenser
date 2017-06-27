import WebSocketClient from './WebSocketClient';
import { ops } from 'shared/serializer'
import { List } from 'immutable'
import { hash } from 'shared/ecc'

const { signed_transaction } = ops

export const apiNames = [
    { local: 'db_api', remote: 'database_api'},
    { local: 'network', remote: 'network_broadcast_api'},
    { local: 'follow', remote: 'follow_api'},
    { local: 'market', remote: 'market_history_api'},
]

class SteemApi {

    /**
        @arg {WebSocketClient} ws_rpc
        @arg {string} api_name like 'database'
    */
    constructor(ws_rpc, api_name) {
        this.ws_rpc = ws_rpc;
        this.api_name = api_name;
    }

    /** Obtain an API ID required prior to call exec calls..
        @private
        @return {Promise}
    */
    init() {
        if(this.api_id != null) return Promise.resolve(this)
        return this.ws_rpc.call(1, 'get_api_by_name', [this.api_name]).then(response => {
            this.api_id = response;
            return this;
        });
    }

    /**
     @arg {string} method - Valid RPC method name per this API_name (see constructor)
     @arg {array} params - JSON object parameters (various types)
     @arg {function} callback - only some RPC calls will use a later callback
     */
    exec(method, params = [], callback = null) {
        return this.init().then(() => {
            // console.log('SteemApi exec', this.api_id, method, '(', JSON.stringify(params), ')');
            return this.ws_rpc.call(this.api_id, method, params, callback);
        })
    }
}

class Apis {
    connect() {
        if (this.ws_rpc) return; // already connected
        const ws_connection = process.env.BROWSER ? $STM_Config.ws_connection_client : $STM_Config.ws_connection_server;
        this.ws_rpc = new WebSocketClient(
            ws_connection,
            ws_connection,
            this.update_rpc_connection_status_callback,
            this.onReconnect.bind(this),
            this.update_rpc_request_status_callback
        );
        this.login();
    }

    onReconnect() {
        this.login();
    }

    login() {
        this.init_promise = this.ws_rpc.call(1, 'login', ['', '']).then(() => {
            const promises = []
            for (const name of apiNames) {
                this[name.local] = new SteemApi(this.ws_rpc, name.remote);
            }
            return Promise.all(promises)
        });
    }

    close() {
        this.ws_rpc.close();
        this.ws_rpc = null;
    }

    setRpcConnectionStatusCallback(callback) {
        this.update_rpc_connection_status_callback = callback;
    }

    setRpcRequestStatusCallback(callback) {
        this.update_rpc_request_status_callback = callback;
    }

    init() {
        return this.init_promise;
    }

    connect_promise() {
        return this.ws_rpc.connect_promise;
    }
}

let apis_instance;

export default {
    instance(update_rpc_connection_status_callback, update_rpc_request_status_callback) {
        if (!apis_instance) {
            apis_instance = new Apis();
            apis_instance.setRpcConnectionStatusCallback(update_rpc_connection_status_callback);
            apis_instance.setRpcRequestStatusCallback(update_rpc_request_status_callback);
            apis_instance.connect();

            // usage: Apis.db_api("get_state", "/")
            for (const name of apiNames) {
                this[name.local] = (method, ...args) => {
                    // Consider console completion (instead of this function).  That involves adding functions for each
                    // API method name (build time). (Usage: Apis.db_api.get_state("/") )
                    return apis_instance[name.local].exec(method, toStrings(args))
                }
            }
        }
        return apis_instance;
    },
    broadcastTransaction(sx, callback) {
        const tr_object = signed_transaction.toObject(sx)
        // callback(); return Promise.resolve() // DEBUG
        return this.instance().network.exec(
            'broadcast_transaction' + (callback ? '_with_callback' : ''),
            [tr_object], callback ? res => callback(res) : null
        )
        .catch(error => {
            // console.error may be redundant for network errors, however, other errors could occur
            console.error(error)
            let message = error.message
            if (! message) message = ''
            const buf = signed_transaction.toBuffer(sx)
            throw new Error((
                message + '\n' +
                ' digest ' + hash.sha256(buf).toString('hex') +
                ' transaction ' + buf.toString('hex') +
                ' ' + JSON.stringify(tr_object)
            ))
        })
    }
};

const toStrings = array => List(array)
    .reduce((r, p) => r.push(
        Buffer.isBuffer(p) ? p.toString("hex") :
        p.high !== undefined ? p.toString() : // Long.toString()
        p.Q !== undefined ? p.toString() : // PublicKey.toString()
        p
    ), List())
    .toJS()
