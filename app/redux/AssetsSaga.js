import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import AssetsReducer from './AssetsReducer';

import Immutable from "immutable";

import {getAssets} from 'app/utils/Assets/assets_fake_data';

export const assetsWatches = [watchLocationChange, watchGetAsset, watchCreateAsset];

export function* fetchAssets() {
    const state = getAssets();

    yield put(AssetsReducer.actions.receiveAssets(state));
}

export function* watchLocationChange() {
    yield* takeLatest('@@router/LOCATION_CHANGE', fetchAssets);
}

export function* fetchAsset({payload: {symbol}}) {
    let state = {};
    getAssets().forEach( (value, key, map) => {
       if (value.symbol === symbol) {
           state =  Immutable.fromJS(value);
       }
    });
    yield put(AssetsReducer.actions.getAsset(state));
}

export function* watchGetAsset() {
    yield* takeLatest('GET_ASSET', fetchAsset);
}

export function* createAsset({payload: {account, update, flags, permissions, core_exchange_rate, isBitAsset, is_prediction_market, bitasset_opts, description}}) {
    console.log(account, update, flags, permissions, core_exchange_rate, isBitAsset, is_prediction_market, bitasset_opts, description)
}

export function* watchCreateAsset() {
    yield* takeLatest('CREATE_ASSET', createAsset);
}



