const RWebSocket = require("./reconnecting-websocket");
let instance = 0;

export default class WebSocketClient {

    /**
        @arg {string} ws_server_url - WebSocket URL
        @arg {function} update_rpc_connection_status_callback called with ("open"|"error"|"closed").
    */
    constructor(ws_connection_client, ws_connection_server, update_rpc_connection_status_callback = null, on_reconnect = null, update_rpc_request_status_callback = null) {
        this.instance = ++instance
        this.socketDebug = false
        this.update_rpc_connection_status_callback = update_rpc_connection_status_callback;
        this.update_rpc_request_status_callback = update_rpc_request_status_callback;

        let ws_connection;
        const options = { server: false, debug: false };
        if (process.env.BROWSER) {
            ws_connection = ws_connection_client;
            options.WebSocket = WebSocket;
            options.idleTreshold = 60000;
        } else {
            ws_connection = ws_connection_server;
            options.WebSocket = require("websocket").w3cwebsocket;
            options.server = true;
            options.reconnectInterval = 1000;
            options.reconnectDecay = 1.2;
        }
        this.web_socket = new RWebSocket(ws_connection, [], options);
        this.current_reject = null;
        this.on_reconnect = on_reconnect;
        let initial_connect = true;
        const ws_url = process.env.BROWSER ? ws_connection_client : ws_connection_server
        this.connect_promise = new Promise((resolve, reject) => {
            this.current_reject = reject;
            this.web_socket.onopen = () => {
                if(this.update_rpc_connection_status_callback) this.update_rpc_connection_status_callback("open");
                if (initial_connect) {
                    initial_connect = false;
                    resolve();
                } else {
                    if(this.on_reconnect) this.on_reconnect();
                }
            }
            // Warning, onerror callback is over-written on each request.  Be cautious to dulicate some logic here.
            this.web_socket.onerror = evt => {
                console.error("ERROR\tWebSocketClient\tconstructor onerror\t", ws_url, evt)
                if(this.update_rpc_connection_status_callback)
                    this.update_rpc_connection_status_callback("error");

                // if (this.current_reject) this.current_reject("can't connect to " + ws_url);
            };
            this.web_socket.onmessage = (message) => {
                let data = {};
                try {
                    data = JSON.parse(message.data)
                } catch (e) {
                    console.error('WebSocketClient.onmessage - cannot parse json: ', message.data);
                    const match = message.data.match(/^\{\"id\"\:(\d+)/);
                    if (match && match.length > 1) data.id = match[1];
                    data.error = "can't parse steemd's response";
                }
                this.listener(data);
            }
            this.web_socket.onclose = () => {
                // web socket may re-connect
                for(var key in this.callbacks) {
                    var value = this.callbacks[key];
                    value.reject('connection closed');
                }
                this.callbacks = {};
                this.subscriptions = {};
                this.unsub = {};
                if(this.update_rpc_connection_status_callback)
                    this.update_rpc_connection_status_callback("closed");
            };
        });
        this.current_callback_id = 0;
        this.notice_id = 0;
        this.callbacks = {};
        this.notice_callback = {};
        this.subscriptions = {};
        this.unsub = {};

        if (process.env.BROWSER) {
            window.onbeforeunload = () => {
                if (this.web_socket) this.web_socket.close();
            };
        }
    }

    close() {
        const unsubs = []
        for (const id of this.subscriptions) {
            try {
                const { method, params, key } = this.subscriptions[id]
                unsubs.push(this.unsubscribe(method, params, key))
            } catch( error ) {
                console.error("WARN\tWebSocketClient\tclose\t", this.instance, "unsubscribe", error, "stack", error.stack)
            }
        }
        const unsub = Promise.all(unsubs)
        return unsub.then(() => new Promise(resolve => {
            this.web_socket.onclose = (/*closeEvent*/) => {
                // if(global.INFO) console.log("INFO\tWebSocketClient\tclose") // closeEvent.reason === connection failed
                if( Object.keys(this.subscriptions).length !== 0 )
                    console.error("WARN\tWebSocketClient\tclose\t", this.instance, "active subscriptions",
                        Object.keys(this.subscriptions).length)

                if(this.update_rpc_connection_status_callback)
                    this.update_rpc_connection_status_callback("closed");

                resolve()
            }
            this.web_socket.close()
        }))
    }

    /**
        @arg {number} api_id - API ID
        @arg {object} params - JSON serilizable parameters
        @return {Promise}
    */
    call(api_id, method, params = [], callback = null) {
        return this.request(++this.current_callback_id, api_id, method, params, callback);
    }

    /**
        Transmit's JSON.stringify(request) to the server
        @arg {number} id = current_callback_id, see this.callbacks
        @private
    */
    request(id, api_id, method, params = [], callback = null) {
        let notice_id = null;
        if(callback != null) {
            notice_id = this.notice_id++
            this.notice_callback[notice_id] = callback
        }

        const request = notice_id != null ?
            { id, method: "call", params: [api_id, method, [notice_id, ...params]] } :
            { id, method: "call", params: [api_id, method, [...params]] }

        if(this.socketDebug) {
            if(this.last_instance != this.instance) {
                this.last_instance = this.instance
                console.log()
            }
            let reqStr = JSON.stringify(request)
            if (reqStr.length > 200)
                reqStr = reqStr.substring(0, 100) + '.............' + reqStr.substring(reqStr.length - 100, reqStr.length)
            console.log("WebSocketClient("+this.instance+") ----- call " + id + " ---- >", reqStr);
        }

        return this.connect_promise.then(() => {
            const promise = new Promise( (resolve, reject) => {
                const time = new Date()
                this.callbacks[id] = { time, resolve, reject }

                this.web_socket.onerror = (evt) => {
                    if(this.update_rpc_connection_status_callback) {
                        this.update_rpc_connection_status_callback("error");
                    }
                    console.log("ERROR\tWebSocketClient request", this.instance, evt.data ? evt.data : "")
                    reject(evt);
                };
                this.web_socket.send(JSON.stringify(request));
            });
            if (this.update_rpc_request_status_callback) {
                this.update_rpc_request_status_callback({event: 'BEGIN', id, method});
                promise
                .then(() => this.update_rpc_request_status_callback({event: 'END', id, method}))
                .catch(() => this.update_rpc_request_status_callback({event: 'ERROR', id, method}));
            }
            return promise;
        })
    }

    /** @private */
    listener(response) {
        if (this.socketDebug) {
            if (this.last_instance != this.instance) {
                this.last_instance = this.instance;
            }
            let resStr = JSON.stringify(response)
            if (resStr.length > 200)
                resStr = resStr.substring(0, 100) + '.............' + resStr.substring(resStr.length - 100, resStr.length)
            console.log("WebSocketClient("+this.instance+") <--- reply "+(response.id||" ")+" ---- <", resStr);
        }
        if (response.method === "notice") {
            const id = response.params[0]
            const callback = this.notice_callback[id]
            if(!callback) {
                console.error("ERROR\tWebSocketClient listener", this.instance, "missing notice_callback id", id, "in response", response)
                return
            }
            delete this.notice_callback[id]
            try {
                callback(response.params[1])
            } catch(error) {
                console.error("ERROR\tWebSocketClient calling callabck", this.instance, error)
            }
        }
        const id = response.id;
        if( response.error ) {
            if( this.callbacks[id] ) {
                this.callbacks[id].reject(response.error)
                delete this.callbacks[id]
            }
        } else {
            if( this.callbacks[id] ) {
                const resolve = this.callbacks[id].resolve
                resolve(response.result)
                // for debuggin with delays: setTimeout(() => resolve( response.result ), process.env.BROWSER ? 4000 : 10)
                delete this.callbacks[id]
            }
        }
    }

}
