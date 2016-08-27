import types from "./types"
import SerializerImpl from "./serializer"

var {
    //id_type,
    //varint32,
    uint8, uint16, uint32, int16, int64, uint64,
    string, string_binary, bytes, bool, array, fixed_array,
    protocol_id_type, object_id_type, vote_id,
    future_extensions,
    static_variant, map, set,
    public_key, address,
    time_point_sec,
    optional,
    asset,
} = types

future_extensions = types.void

/*
When updating generated code
Replace:  var operation = static_variant([
with:     operation.st_operations = [

Replace:     encrypted: string}
with:     encrypted: string_binary}

Delete (these are custom types instead):
var public_key = new Serializer( 
    "public_key",
    {key_data: bytes(33)}
);

var asset = new Serializer( 
    "asset",
    {amount: int64,
    symbol: uint64}
);

*/
// Place-holder, their are dependencies on "operation" .. The final list of
// operations is not avialble until the very end of the generated code.
// See: operation.st_operations = ...
const operation = static_variant();
module.exports["operation"] = operation;

// For module.exports
var Serializer=function(operation_name, serilization_types_object){
    var s = new SerializerImpl(operation_name, serilization_types_object);
    return module.exports[operation_name] = s;
}

// Custom-types after Generated code

// ##  Generated code follows
// # npm i -g decaffeinate
// # ./js_operation_serializer | decaffeinate > tmp.js
// ## -------------------------------
var signed_transaction = new Serializer( 
    "signed_transaction",
    {ref_block_num: uint16,
    ref_block_prefix: uint32,
    expiration: time_point_sec,
    operations: array(operation),
    extensions: set(future_extensions),
    signatures: array(bytes(65))}
);

var signed_block = new Serializer( 
    "signed_block",
    {previous: bytes(20),
    timestamp: time_point_sec,
    witness: string,
    transaction_merkle_root: bytes(20),
    extensions: set(future_extensions),
    witness_signature: bytes(65),
    transactions: array(signed_transaction)}
);

var block_header = new Serializer( 
    "block_header",
    {previous: bytes(20),
    timestamp: time_point_sec,
    witness: string,
    transaction_merkle_root: bytes(20),
    extensions: set(future_extensions)}
);

var signed_block_header = new Serializer( 
    "signed_block_header",
    {previous: bytes(20),
    timestamp: time_point_sec,
    witness: string,
    transaction_merkle_root: bytes(20),
    extensions: set(future_extensions),
    witness_signature: bytes(65)}
);

var vote = new Serializer( 
    "vote",
    {voter: string,
    author: string,
    permlink: string,
    weight: int16}
);

var comment = new Serializer( 
    "comment",
    {parent_author: string,
    parent_permlink: string,
    author: string,
    permlink: string,
    title: string,
    body: string,
    json_metadata: string}
);

var transfer = new Serializer( 
    "transfer",
    {from: string,
    to: string,
    amount: asset,
    memo: string}
);

var transfer_to_vesting = new Serializer( 
    "transfer_to_vesting",
    {from: string,
    to: string,
    amount: asset}
);

var withdraw_vesting = new Serializer( 
    "withdraw_vesting",
    {account: string,
    vesting_shares: asset}
);

var limit_order_create = new Serializer( 
    "limit_order_create",
    {owner: string,
    orderid: uint32,
    amount_to_sell: asset,
    min_to_receive: asset,
    fill_or_kill: bool,
    expiration: time_point_sec}
);

var limit_order_cancel = new Serializer( 
    "limit_order_cancel",
    {owner: string,
    orderid: uint32}
);

var price = new Serializer( 
    "price",
    {base: asset,
    quote: asset}
);

var feed_publish = new Serializer( 
    "feed_publish",
    {publisher: string,
    exchange_rate: price}
);

var convert = new Serializer( 
    "convert",
    {owner: string,
    requestid: uint32,
    amount: asset}
);

var authority = new Serializer( 
    "authority",
    {weight_threshold: uint32,
    account_auths: map((string), (uint16)),
    key_auths: map((public_key), (uint16))}
);

var account_create = new Serializer( 
    "account_create",
    {fee: asset,
    creator: string,
    new_account_name: string,
    owner: authority,
    active: authority,
    posting: authority,
    memo_key: public_key,
    json_metadata: string}
);

var account_update = new Serializer( 
    "account_update",
    {account: string,
    owner: optional(authority),
    active: optional(authority),
    posting: optional(authority),
    memo_key: public_key,
    json_metadata: string}
);

var chain_properties = new Serializer( 
    "chain_properties",
    {account_creation_fee: asset,
    maximum_block_size: uint32,
    sbd_interest_rate: uint16}
);

var witness_update = new Serializer( 
    "witness_update",
    {owner: string,
    url: string,
    block_signing_key: public_key,
    props: chain_properties,
    fee: asset}
);

var account_witness_vote = new Serializer( 
    "account_witness_vote",
    {account: string,
    witness: string,
    approve: bool}
);

var account_witness_proxy = new Serializer( 
    "account_witness_proxy",
    {account: string,
    proxy: string}
);

var pow = new Serializer( 
    "pow",
    {worker: public_key,
    input: bytes(32),
    signature: bytes(65),
    work: bytes(32)}
);

var custom = new Serializer( 
    "custom",
    {required_auths: set(string),
    id: uint16,
    data: bytes()}
);

var report_over_production = new Serializer( 
    "report_over_production",
    {reporter: string,
    first_block: signed_block_header,
    second_block: signed_block_header}
);

var delete_comment = new Serializer( 
    "delete_comment",
    {author: string,
    permlink: string}
);

var custom_json = new Serializer( 
    "custom_json",
    {required_auths: set(string),
    required_posting_auths: set(string),
    id: string,
    json: string}
);

var comment_options = new Serializer( 
    "comment_options",
    {author: string,
    permlink: string,
    max_accepted_payout: asset,
    percent_steem_dollars: uint16,
    allow_votes: bool,
    allow_curation_rewards: bool,
    extensions: set(future_extensions)}
);

var set_withdraw_vesting_route = new Serializer( 
    "set_withdraw_vesting_route",
    {from_account: string,
    to_account: string,
    percent: uint16,
    auto_vest: bool}
);

var limit_order_create2 = new Serializer( 
    "limit_order_create2",
    {owner: string,
    orderid: uint32,
    amount_to_sell: asset,
    exchange_rate: price,
    fill_or_kill: bool,
    expiration: time_point_sec}
);

var challenge_authority = new Serializer( 
    "challenge_authority",
    {challenger: string,
    challenged: string,
    require_owner: bool}
);

var prove_authority = new Serializer( 
    "prove_authority",
    {challenged: string,
    require_owner: bool}
);

var request_account_recovery = new Serializer( 
    "request_account_recovery",
    {recovery_account: string,
    account_to_recover: string,
    new_owner_authority: authority,
    extensions: set(future_extensions)}
);

var recover_account = new Serializer( 
    "recover_account",
    {account_to_recover: string,
    new_owner_authority: authority,
    recent_owner_authority: authority,
    extensions: set(future_extensions)}
);

var change_recovery_account = new Serializer( 
    "change_recovery_account",
    {account_to_recover: string,
    new_recovery_account: string,
    extensions: set(future_extensions)}
);

var escrow_transfer = new Serializer( 
    "escrow_transfer",
    {from: string,
    to: string,
    amount: asset,
    memo: string,
    escrow_id: uint32,
    agent: string,
    fee: asset,
    json_meta: string,
    expiration: time_point_sec}
);

var escrow_dispute = new Serializer( 
    "escrow_dispute",
    {from: string,
    to: string,
    escrow_id: uint32,
    who: string}
);

var escrow_release = new Serializer( 
    "escrow_release",
    {from: string,
    to: string,
    escrow_id: uint32,
    who: string,
    amount: asset}
);

var fill_convert_request = new Serializer( 
    "fill_convert_request",
    {owner: string,
    requestid: uint32,
    amount_in: asset,
    amount_out: asset}
);

var comment_reward = new Serializer( 
    "comment_reward",
    {author: string,
    permlink: string,
    sbd_payout: asset,
    vesting_payout: asset}
);

var curate_reward = new Serializer( 
    "curate_reward",
    {curator: string,
    reward: asset,
    comment_author: string,
    comment_permlink: string}
);

var liquidity_reward = new Serializer( 
    "liquidity_reward",
    {owner: string,
    payout: asset}
);

var interest = new Serializer( 
    "interest",
    {owner: string,
    interest: asset}
);

var fill_vesting_withdraw = new Serializer( 
    "fill_vesting_withdraw",
    {from_account: string,
    to_account: string,
    withdrawn: asset,
    deposited: asset}
);

var fill_order = new Serializer( 
    "fill_order",
    {current_owner: string,
    current_orderid: uint32,
    current_pays: asset,
    open_owner: string,
    open_orderid: uint32,
    open_pays: asset}
);

var comment_payout = new Serializer( 
    "comment_payout",
    {author: string,
    permlink: string,
    payout: asset}
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
    fill_convert_request,    
    comment_reward,    
    curate_reward,    
    liquidity_reward,    
    interest,    
    fill_vesting_withdraw,    
    fill_order,    
    comment_payout
]

var transaction = new Serializer( 
    "transaction",
    {ref_block_num: uint16,
    ref_block_prefix: uint32,
    expiration: time_point_sec,
    operations: array(operation),
    extensions: set(future_extensions)}
);

//# -------------------------------
//#  Generated code end
//# -------------------------------

// Custom Types

var transaction = new Serializer(
    "encrypted_memo",
    {from: public_key,
    to: public_key,
    nonce: uint64,
    check: uint32,
    encrypted: string_binary}
);
