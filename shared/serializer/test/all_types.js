import { fromJS } from "immutable"
import { PrivateKey, PublicKey, Address } from "../../ecc"
import { Long } from "bytebuffer"
var assert = require('assert');
var Serilizer = require("../src/serializer")
var types = require('../src/types');
var ops = require('../src/operations');

var {
    //varint32,
    uint8, uint16, uint32, int16, int64, uint64,
    string, string_binary, bytes, bool, array, fixed_array,
    protocol_id_type, object_id_type, vote_id,
    // future_extensions,
    static_variant, map, set,
    public_key, address,
    time_point_sec,
    optional,
    asset
} = types

var { price, transfer } = ops

// Must stay in sync with allTypes below.
let AllTypes = new Serilizer("all_types", {
    uint8, uint16, uint32, int16, int64, uint64,
    string, string_binary, bytes: bytes(1), bool, array: array(uint8), fixed_array: fixed_array(2, uint8),
    protocol_id_type: protocol_id_type("base"), object_id_type, //vote_id,

    static_variant: array(static_variant( [transfer, price] )),
    map: map(uint8, uint8),
    set: set(uint8),

    public_key, address,

    time_optional: optional( time_point_sec ),
    time_point_sec1: time_point_sec,
    time_point_sec2: time_point_sec,
})

// Must stay in sync with AllTypes above.
let allTypes = {

    uint8: Math.pow(2,8)-1, uint16: Math.pow(2,16)-1, uint32: Math.pow(2,32)-1,
    int16: 30000, int64: "9223372036854775807", uint64: "9223372036854775807",

    string: "‘Quote’", string_binary: '\u0001', bytes: "ff", bool: true, array: [2, 1], fixed_array: [1, 0],
    protocol_id_type: "1.1.1", object_id_type: "1.1.1", //vote_id: "2:1",

    static_variant: [
        ["transfer", {from:"alice", to:"bob", amount: "1.000 STEEM", memo: ""}],
        ["price", {base: "1.000 STEEM", quote: "1.000 STEEM"}],
    ],

    map: [[4,3], [2,1]],
    set: [2,1],

    public_key: PrivateKey.fromSeed("").toPublicKey().toString(),
    address: Address.fromPublic(PrivateKey.fromSeed("").toPublicKey()).toString(),

    time_optional: undefined,
    time_point_sec1: new Date(),
    time_point_sec2: Math.floor(Date.now()/1000),
}

describe("all types", ()=> {

    let { toObject, fromObject, toBuffer, fromBuffer } = AllTypes

    toObject = toObject.bind(AllTypes)
    fromObject = fromObject.bind(AllTypes)
    toBuffer = toBuffer.bind(AllTypes)
    fromBuffer = fromBuffer.bind(AllTypes)

    it("from object", ()=> {
        assert(fromObject(allTypes), "serializable" )
        assert(fromObject(fromObject(allTypes)), "non-serializable")
    })

    it("to object", ()=> {
        assert(toObject(allTypes), "serializable" )
        assert.deepEqual(toObject(allTypes), toObject(allTypes), "serializable (single to)" )
        assert.deepEqual(toObject(toObject(allTypes)), toObject(allTypes), "serializable (double to)" )
        assert.deepEqual(toObject(fromObject(allTypes)), toObject(allTypes), "non-serializable" )
        assert.deepEqual(toObject(fromObject(fromObject(allTypes))), toObject(allTypes), "non-serializable (double from)")
    })

    it("to buffer", ()=>{
        assert(toBuffer(allTypes), "serializable" )
        assert(toBuffer(fromObject(allTypes)), "non-serializable")
        assert.equal(
            toBuffer( allTypes ).toString("hex"), // serializable
            toBuffer( fromObject( allTypes )).toString("hex"), // non-serializable
            "serializable and non-serializable"
        )
    })

    it("from buffer", ()=> {
        assert.deepEqual(toObject(fromBuffer(toBuffer(allTypes))), toObject(allTypes), "serializable" )
        assert.deepEqual(toObject(fromBuffer(toBuffer(fromObject(allTypes)))), toObject(allTypes), "non-serializable" )
    })

    it("template", ()=> {
        assert(toObject(allTypes, {use_default: true}))
        assert(toObject(allTypes, {annotate: true}))
        assert(toObject({}, {use_default: true}))
        assert(toObject({}, {use_default: true, annotate: true}))
    })

    // keep last
    it("visual check", ()=> {
        console.log(toObject(fromObject(allTypes)))
    })

})
