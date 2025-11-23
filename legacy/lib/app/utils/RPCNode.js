'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LOCALSTORAGE_RPC_NODE_KEY = undefined;
exports.changeRPCNodeToDefault = changeRPCNodeToDefault;
exports.getCurrentRPCNode = getCurrentRPCNode;

var _steemJs = require('@steemit/steem-js');

var LOCALSTORAGE_RPC_NODE_KEY = exports.LOCALSTORAGE_RPC_NODE_KEY = 'steemSelectedRpc';

function changeRPCNodeToDefault() {
    var rpcNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $STM_Config.steemd_connection_client;

    console.log('>> RPC Node changed to ' + rpcNode);

    localStorage.setItem(LOCALSTORAGE_RPC_NODE_KEY, rpcNode);

    _steemJs.api.setOptions({
        url: rpcNode
    });
}

function getCurrentRPCNode() {
    return localStorage.getItem(LOCALSTORAGE_RPC_NODE_KEY);
}