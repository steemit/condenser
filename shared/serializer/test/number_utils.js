import assert from "assert"
import { toImpliedDecimal, fromImpliedDecimal } from "../src/number_utils"

describe("Number utils", () => {
    

    it("to implied decimal", ()=> {
        assert.equal("1", toImpliedDecimal(1, 0))
        assert.equal("10", toImpliedDecimal(1, 1))
        assert.equal("100", toImpliedDecimal(1, 2))
        assert.equal("10", toImpliedDecimal(".1", 2))
        assert.equal("10", toImpliedDecimal("0.1", 2))
        assert.equal("10", toImpliedDecimal("00.1", 2))
        assert.equal("10", toImpliedDecimal("00.10", 2))
        assert.throws(()=> toImpliedDecimal("00.100", 2))
        assert.throws(()=> toImpliedDecimal(9007199254740991 + 1, 1))
    })
    
    it("from implied decimal", ()=> {
        assert.equal("1", fromImpliedDecimal(1, 0))
        assert.equal("0.1", fromImpliedDecimal(1, 1))
        assert.equal("0.01", fromImpliedDecimal(1, 2))
        // must have suffixing zeros
        assert.equal("0.100", fromImpliedDecimal(100, 3))
    })
        

})