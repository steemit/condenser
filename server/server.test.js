/*global describe, it, before, beforeEach, after, afterEach */

require("co-mocha");
import server from "./server";
import {agent} from "co-supertest";
import chai from "chai";
import dirtyChai from "dirty-chai";
const expect = chai.expect;
const request = agent(server.listen());

chai.use(dirtyChai);

describe("/favicon.ico", function() {});