/*global describe, it, before, beforeEach, after, afterEach */

require('co-mocha');
import server from './server';
import {agent} from 'co-supertest';
import chai from 'chai';
import dirtyChai from 'dirty-chai';
const expect = chai.expect;
const request = agent(server.listen());

chai.use(dirtyChai);

describe('/favicon.ico', function () {
/* not maintained
    it('should return image', function *() {
        const res = yield request.get('/favicon.ico').end();
        expect(res.status).to.equal(200);
        expect(res.body).to.be.ok();
        expect(res.headers['content-type']).to.equal('image/x-icon');
    });
*/
});
