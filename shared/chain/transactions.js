
import {Signature} from '../ecc'
import {Apis, ChainConfig} from '../api_client'
import {select} from 'redux-saga/effects'
import {ops} from '../serializer'
import {fromJS} from 'immutable'

const {transaction} = ops

/**
    @arg {array} operations - valid json operation(s) (see serilizer operations.js)
    @arg {number} [head = head_block_id] (from get_dynamic_global_properties)
    @arg {number} [expire_epoc] - blockchain time (or NTP synced time) + expiration seconds
    @arg {number} [num] - recent block number & 0xFFFF
*/
export function* createTransaction(operations, head, expire_epoc, num) {
    if(head == null || expire_epoc == null || num == null) {
        const props = yield Apis.db_api('get_dynamic_global_properties')
        // state.global is not available on the server.
        // In the client, use state.global.props incase the user was on a fork the last time they refreshed the state.  This will help the transaction to fail.
        const props2 = process.env.BROWSER ? yield select(state => state.global.get('props')) : fromJS(props)
        if(head == null) {
            if(!props2.has('head_block_id')) {
                throw new Error('props is missing head_block_id')
            }
            head = props2.get('head_block_id')
        }
        if(expire_epoc == null) {
            // Use the newest time possible (just props not props2)
            const time = new Date(props.time + 'Z')
            expire_epoc = Math.ceil(time.getTime() / 1000) + ChainConfig.expire_in_secs
        }
        if(num == null) {
            if(!props2.has('head_block_number')) {
                throw new Error('props is missing head_block_number')
            }
            num = props2.get('head_block_number')
        }
    }
    if (! /^[a-f0-9]{40}$/.test(head))
        throw new TypeError('Expecting head block id (40 hex chars), instead got: head = ' + head)

    if (! typeof expire_epoc === 'number')
        throw new TypeError('Expecting expire_epoc number, instead got: ' + expire_epoc)

    if (! typeof num === 'number')
        throw new TypeError('Expecting block number, instead got: num = ' + num)

    const ref_block_num = num & 0xFFFF
    const ref_block_prefix = new Buffer(head, 'hex').readUInt32LE(4)
    return { ref_block_num, ref_block_prefix, operations, expiration: expire_epoc }
}

export function signTransaction(tx, keys) {
    if (tx.ref_block_num == null)
        throw new TypeError('Expecting transaction object, instead got tx = ' + tx)

    if (! Array.isArray(keys))
        keys = [keys]

    const signatures = []
    if (tx.signatures)
        for (const sig of tx.signatures)
            signatures.push(sig)

    const cid = new Buffer(ChainConfig.chain_id, 'hex')
    const buf = transaction.toBuffer(tx)
    for (const key of keys) {
        const sig = Signature.signBuffer(Buffer.concat([cid, buf]), key)
        signatures.push(sig.toBuffer())
    }
    return { ...tx, signatures }
}
