/*global describe, it, before, beforeEach, after, afterEach */

import chai, {expect} from "chai";
import dirtyChai from "dirty-chai";
import sinon from "sinon";
import {call, put} from "redux-saga/effects";
import Apis from "shared/api_client/ApiInstances";
import {fetchState} from "./FetchDataSaga";
chai.use(dirtyChai);

sinon.stub(Apis, "instance", () => ({ db_api: { exec: () => {} } }));

const action = { payload: { pathname: "/recent", search: "", action: "PUSH" } };

describe("sagas", () => {});