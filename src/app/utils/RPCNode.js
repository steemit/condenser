import { api } from '@steemit/steem-js';

export const LOCALSTORAGE_RPC_NODE_KEY = 'steemSelectedRpc';

export function changeRPCNodeToDefault(
    rpcNode = $STM_Config.steemd_connection_client
) {
    console.log(`>> RPC Node changed to ${rpcNode}`);

    localStorage.setItem(LOCALSTORAGE_RPC_NODE_KEY, rpcNode);

    api.setOptions({
        url: rpcNode,
    });
}

export function getCurrentRPCNode() {
    return localStorage.getItem(LOCALSTORAGE_RPC_NODE_KEY);
}
