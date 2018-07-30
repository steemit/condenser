import JsonRPC from 'simple-jsonrpc-js';
const jrpc = new JsonRPC();

export const createWebSocketConnection = () => {
    const socket = new WebSocket('ws://95.216.154.157:3000');
    socket.jrpc = jrpc;
    return socket;
};
