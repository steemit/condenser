
// This file is merge updated from steemd's js_operation_serializer program.

// npm i -g decaffeinate
// ./js_operation_serializer |sed 's/void/future_extensions/g'>tmp.coffee
// coffee tmp.coffee # fix any indenting errors
// decaffeinate tmp.coffee

// Merge tmp.js - See "Generated code follows" below

import types from "./types"
import SerializerImpl from "./serializer"

const {
    //id_type,
    //varint32, uint8, int64, fixed_array, object_id_type, vote_id, address,
    uint16, uint32, int16, uint64,
    string, string_binary, bytes, bool, array,
    protocol_id_type,
    static_variant, map, set,
    public_key,
    time_point_sec,
    optional,
    asset,
} = types

const future_extensions = types.void
const hardfork_version_vote = types.void
const version = types.void

// Place-holder, their are dependencies on "operation" .. The final list of
// operations is not avialble until the very end of the generated code.
// See: operation.st_operations = ...
const operation = static_variant();
module.exports.operation = operation;

// For module.exports
const Serializer=function(operation_name, serilization_types_object){
    const s = new SerializerImpl(operation_name, serilization_types_object);
    return module.exports[operation_name] = s;
}

// Custom-types after Generated code

// ##  Generated code follows
// -------------------------------
/*
When updating generated code (fix closing notation)
Replace:  let operation = static_variant([
with:     operation.st_operations = [

Delete (these are custom types instead):
let public_key = new Serializer( 
    "public_key",
    {key_data: bytes(33)}
);

let asset = new Serializer( 
    "asset",
    {amount: int64,
    symbol: uint64}
);

// Make sure all local tests pass
npm run mocha -- shared/serializer/test/*.js

*/
let signed_transaction = new Serializer( 
    "signed_transaction",{
    ref_block_num: uint16,
    ref_block_prefix: uint32,
    expiration: time_point_sec,
    operations: array(operation),
    extensions: set(future_extensions),
    signatures: array(bytes(65))
}
);

let signed_block = new Serializer( 
    "signed_block",{
    previous: bytes(20),
    timestamp: time_point_sec,
    witness: string,
    transaction_merkle_root: bytes(20),
    extensions: set(static_variant([
        future_extensions,    
        version,    
        hardfork_version_vote
    ])),
    witness_signature: bytes(65),
    transactions: array(signed_transaction)
}
);

let block_header = new Serializer( 
    "block_header",{
    previous: bytes(20),
    timestamp: time_point_sec,
    witness: string,
    transaction_merkle_root: bytes(20),
    extensions: set(static_variant([
        future_extensions,    
        version,    
        hardfork_version_vote
    ]))
}
);

let signed_block_header = new Serializer( 
    "signed_block_header",{
    previous: bytes(20),
    timestamp: time_point_sec,
    witness: string,
    transaction_merkle_root: bytes(20),
    extensions: set(static_variant([
        future_extensions,    
        version,    
        hardfork_version_vote
    ])),
    witness_signature: bytes(65)
}
);

let vote = new Serializer( 
    "vote",{
    voter: string,
    author: string,
    permlink: string,
    weight: int16
}
);

let comment = new Serializer( 
    "comment",{
    parent_author: string,
    parent_permlink: string,
    author: string,
    permlink: string,
    title: string,
    body: string,
    json_metadata: string
}
);

let transfer = new Serializer( 
    "transfer",{
    from: string,
    to: string,
    amount: asset,
    memo: string
}
);

let transfer_to_vesting = new Serializer( 
    "transfer_to_vesting",{
    from: string,
    to: string,
    amount: asset
}
);

let withdraw_vesting = new Serializer( 
    "withdraw_vesting",{
    account: string,
    vesting_shares: asset
}
);

let limit_order_create = new Serializer( 
    "limit_order_create",{
    owner: string,
    orderid: uint32,
    amount_to_sell: asset,
    min_to_receive: asset,
    fill_or_kill: bool,
    expiration: time_point_sec
}
);

let limit_order_cancel = new Serializer( 
    "limit_order_cancel",{
    owner: string,
    orderid: uint32
}
);

let price = new Serializer( 
    "price",{
    base: asset,
    quote: asset
}
);

let feed_publish = new Serializer( 
    "feed_publish",{
    publisher: string,
    exchange_rate: price
}
);

let convert = new Serializer( 
    "convert",{
    owner: string,
    requestid: uint32,
    amount: asset
}
);

let authority = new Serializer( 
    "authority",{
    weight_threshold: uint32,
    account_auths: map((string), (uint16)),
    key_auths: map((public_key), (uint16))
}
);

let account_create = new Serializer( 
    "account_create",{
    fee: asset,
    creator: string,
    new_account_name: string,
    owner: authority,
    active: authority,
    posting: authority,
    memo_key: public_key,
    json_metadata: string
}
);

let account_update = new Serializer( 
    "account_update",{
    account: string,
    owner: optional(authority),
    active: optional(authority),
    posting: optional(authority),
    memo_key: public_key,
    json_metadata: string
}
);

let chain_properties = new Serializer( 
    "chain_properties",{
    account_creation_fee: asset,
    maximum_block_size: uint32,
    sbd_interest_rate: uint16
}
);

let witness_update = new Serializer( 
    "witness_update",{
    owner: string,
    url: string,
    block_signing_key: public_key,
    props: chain_properties,
    fee: asset
}
);

let account_witness_vote = new Serializer( 
    "account_witness_vote",{
    account: string,
    witness: string,
    approve: bool
}
);

let account_witness_proxy = new Serializer( 
    "account_witness_proxy",{
    account: string,
    proxy: string
}
);

let pow = new Serializer( 
    "pow",{
    worker: public_key,
    input: bytes(32),
    signature: bytes(65),
    work: bytes(32)
}
);

let custom = new Serializer( 
    "custom",{
    required_auths: set(string),
    id: uint16,
    data: bytes()
}
);

let report_over_production = new Serializer( 
    "report_over_production",{
    reporter: string,
    first_block: signed_block_header,
    second_block: signed_block_header
}
);

let delete_comment = new Serializer( 
    "delete_comment",{
    author: string,
    permlink: string
}
);

let custom_json = new Serializer( 
    "custom_json",{
    required_auths: set(string),
    required_posting_auths: set(string),
    id: string,
    json: string
}
);

let comment_options = new Serializer( 
    "comment_options",{
    author: string,
    permlink: string,
    max_accepted_payout: asset,
    percent_steem_dollars: uint16,
    allow_votes: bool,
    allow_curation_rewards: bool,
    extensions: set(future_extensions)
}
);

let set_withdraw_vesting_route = new Serializer( 
    "set_withdraw_vesting_route",{
    from_account: string,
    to_account: string,
    percent: uint16,
    auto_vest: bool
}
);

let limit_order_create2 = new Serializer( 
    "limit_order_create2",{
    owner: string,
    orderid: uint32,
    amount_to_sell: asset,
    exchange_rate: price,
    fill_or_kill: bool,
    expiration: time_point_sec
}
);

let challenge_authority = new Serializer( 
    "challenge_authority",{
    challenger: string,
    challenged: string,
    require_owner: bool
}
);

let prove_authority = new Serializer( 
    "prove_authority",{
    challenged: string,
    require_owner: bool
}
);

let request_account_recovery = new Serializer( 
    "request_account_recovery",{
    recovery_account: string,
    account_to_recover: string,
    new_owner_authority: authority,
    extensions: set(future_extensions)
}
);

let recover_account = new Serializer( 
    "recover_account",{
    account_to_recover: string,
    new_owner_authority: authority,
    recent_owner_authority: authority,
    extensions: set(future_extensions)
}
);

let change_recovery_account = new Serializer( 
    "change_recovery_account",{
    account_to_recover: string,
    new_recovery_account: string,
    extensions: set(future_extensions)
}
);

let escrow_transfer = new Serializer( 
    "escrow_transfer",{
    from: string,
    to: string,
    sbd_amount: asset,
    steem_amount: asset,
    escrow_id: uint32,
    agent: string,
    fee: asset,
    json_meta: string,
    ratification_deadline: time_point_sec,
    escrow_expiration: time_point_sec
}
);

let escrow_dispute = new Serializer( 
    "escrow_dispute",{
    from: string,
    to: string,
    who: string,
    escrow_id: uint32
}
);

let escrow_release = new Serializer( 
    "escrow_release",{
    from: string,
    to: string,
    who: string,
    escrow_id: uint32,
    sbd_amount: asset,
    steem_amount: asset
}
);

let pow2_input = new Serializer( 
    "pow2_input",{
    worker_account: string,
    prev_block: bytes(20),
    nonce: uint64
}
);

let pow2 = new Serializer( 
    "pow2",{
    input: pow2_input,
    pow_summary: uint32
}
);

let escrow_approve = new Serializer( 
    "escrow_approve",{
    from: string,
    to: string,
    agent: string,
    who: string,
    escrow_id: uint32,
    approve: bool
}
);

let transfer_to_savings = new Serializer( 
    "transfer_to_savings",{
    from: string,
    to: string,
    amount: asset,
    memo: string
}
);

let transfer_from_savings = new Serializer( 
    "transfer_from_savings",{
    from: string,
    request_id: uint32,
    to: string,
    amount: asset,
    memo: string
}
);

let cancel_transfer_from_savings = new Serializer( 
    "cancel_transfer_from_savings",{
    from: string,
    request_id: uint32
}
);

let custom_binary = new Serializer( 
    "custom_binary",{
    required_owner_auths: set(string),
    required_active_auths: set(string),
    required_posting_auths: set(string),
    required_auths: array(authority),
    id: string,
    data: bytes()
}
);

let decline_voting_rights = new Serializer( 
    "decline_voting_rights",{
    account: string,
    decline: bool
}
);

let fill_convert_request = new Serializer( 
    "fill_convert_request",{
    owner: string,
    requestid: uint32,
    amount_in: asset,
    amount_out: asset
}
);

let author_reward = new Serializer( 
    "author_reward",{
    author: string,
    permlink: string,
    sbd_payout: asset,
    vesting_payout: asset
}
);

let curation_reward = new Serializer( 
    "curation_reward",{
    curator: string,
    reward: asset,
    comment_author: string,
    comment_permlink: string
}
);

let comment_reward = new Serializer( 
    "comment_reward",{
    author: string,
    permlink: string,
    payout: asset
}
);

let liquidity_reward = new Serializer( 
    "liquidity_reward",{
    owner: string,
    payout: asset
}
);

let interest = new Serializer( 
    "interest",{
    owner: string,
    interest: asset
}
);

let fill_vesting_withdraw = new Serializer( 
    "fill_vesting_withdraw",{
    from_account: string,
    to_account: string,
    withdrawn: asset,
    deposited: asset
}
);

let fill_order = new Serializer( 
    "fill_order",{
    current_owner: string,
    current_orderid: uint32,
    current_pays: asset,
    open_owner: string,
    open_orderid: uint32,
    open_pays: asset
}
);

operation.st_operations = [
    vote,    
    comment,    
    transfer,    
    transfer_to_vesting,    
    withdraw_vesting,    
    limit_order_create,    
    limit_order_cancel,    
    feed_publish,    
    convert,    
    account_create,    
    account_update,    
    witness_update,    
    account_witness_vote,    
    account_witness_proxy,    
    pow,    
    custom,    
    report_over_production,    
    delete_comment,    
    custom_json,    
    comment_options,    
    set_withdraw_vesting_route,    
    limit_order_create2,    
    challenge_authority,    
    prove_authority,    
    request_account_recovery,    
    recover_account,    
    change_recovery_account,    
    escrow_transfer,    
    escrow_dispute,    
    escrow_release,    
    pow2,    
    escrow_approve,    
    transfer_to_savings,    
    transfer_from_savings,    
    cancel_transfer_from_savings,    
    custom_binary,    
    decline_voting_rights,    
    fill_convert_request,    
    author_reward,    
    curation_reward,    
    comment_reward,    
    liquidity_reward,    
    interest,    
    fill_vesting_withdraw,    
    fill_order
];

let transaction = new Serializer( 
    "transaction",{
    ref_block_num: uint16,
    ref_block_prefix: uint32,
    expiration: time_point_sec,
    operations: array(operation),
    extensions: set(future_extensions)
}
);

//# -------------------------------
//#  Generated code end  S T O P
//# -------------------------------

// Custom Types (do not over-write)

const encrypted_memo = new Serializer(
    "encrypted_memo",
    {from: public_key,
    to: public_key,
    nonce: uint64,
    check: uint32,
    encrypted: string_binary}
);
