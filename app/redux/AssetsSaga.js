import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import AssetsReducer from './AssetsReducer';
import big from "bignumber.js";
import utils from 'app/utils/Assets/utils';
import Immutable from "immutable";

import {getAssets} from 'app/utils/Assets/assets_fake_data';

export const assetsWatches = [
    watchLocationChange,
    watchGetAsset,
    watchCreateAsset,
    watchUpdateAsset,
    watchIssueAsset,
    watchReserveAsset
];

export function* watchLocationChange() {
    yield* takeLatest('@@router/LOCATION_CHANGE', fetchAssets);
}

export function* watchGetAsset() {
    yield* takeLatest('GET_ASSET', fetchAsset);
}

export function* watchCreateAsset() {
    yield* takeLatest('CREATE_ASSET', createAsset);
}

export function* watchUpdateAsset() {
    yield* takeLatest('UPDATE_ASSET', updateAsset);
}

export function* watchIssueAsset() {
    yield* takeLatest('ISSUE_ASSET', issueAsset);
}

export function* watchReserveAsset() {
    yield* takeLatest('RESERVE_ASSET', reserveAsset);
}

export function* fetchAssets() {
    const state = getAssets();

    yield put(AssetsReducer.actions.receiveAssets(state));
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

export function* createAsset({payload: {account, createObject, flags, permissions, coreExchangeRate, isBitAsset, isPredictionMarket, bitassetOpts, description}}) {
    console.log("createAsset", account, createObject, flags, permissions, coreExchangeRate, isBitAsset, isPredictionMarket, bitassetOpts, description);

    const precision = utils.get_asset_precision(createObject.precision);
    big.config({DECIMAL_PLACES: createObject.precision});
    let max_supply = (new big(createObject.max_supply)).times(precision).toString();
    let max_market_fee = (new big(createObject.max_market_fee || 0)).times(precision).toString();
    // console.log("max_supply:", max_supply);
    // console.log("max_market_fee:", max_market_fee);

    const corePrecision = 0 //TODO utils.get_asset_precision(getAsset(cer.base.asset_name).get("precision"));

    const operationJSON = {
        fee: {
            amount: 0,
            asset_name: 0
        },
        issuer: account,
        symbol: createObject.symbol,
        precision: parseInt(createObject.precision, 10),
        common_options: {
            max_supply: max_supply,
            market_fee_percent: createObject.market_fee_percent * 100 || 0,
            max_market_fee: max_market_fee,
            issuer_permissions: permissions,
            flags: flags,
            core_exchange_rate: {
                base: {
                    amount: coreExchangeRate.base.amount * corePrecision,
                    asset_name: coreExchangeRate.base.asset_name
                },
                quote: {
                    amount: coreExchangeRate.quote.amount * precision,
                    asset_name: "" //FIXME
                }
            },
            whitelist_authorities: [],
            blacklist_authorities: [],
            whitelist_markets: [],
            blacklist_markets: [],
            description: description,
            extensions: null
        },
        is_prediction_market: isPredictionMarket,
        extensions: null
    };

    if (isBitAsset) {
        operationJSON.bitasset_opts = bitassetOpts;
    }

    //TODO asset_create operationJSON
}

export function* updateAsset({payload: {issuer, new_issuer, update, coreExchangeRate, asset, flags, permissions,
    isBitAsset, bitassetOpts, originalBitassetOpts, description}}) {

    const quotePrecision = utils.get_asset_precision(asset.get("precision"));

    big.config({DECIMAL_PLACES: asset.get("precision")});
    const maxSupply = (new big(update.max_supply)).times(quotePrecision).toString();
    const maxMarketFee = (new big(update.max_market_fee || 0)).times(quotePrecision).toString();

    const coreQuoteAsset = "" //TODO getAsset(core_exchange_rate.quote.asset_asset_name);
    const coreQuotePrecision = utils.get_asset_precision(coreQuoteAsset.get("precision"));
    const coreBaseAsset = "" //TODO getAsset(core_exchange_rate.base.asset_name);
    const coreBasePrecision = utils.get_asset_precision(coreBaseAsset.get("precision"));

    const coreQuoteAmount = (new big(coreExchangeRate.quote.amount)).times(coreQuotePrecision).toString();
    const coreBaseAmount = (new big(coreExchangeRate.base.amount)).times(coreBasePrecision).toString();

    const updateObject = {
        fee: {
            amount: 0,
            asset_name: 0
        },
        asset_to_update: asset.get("asset_name"),
        extensions: asset.get("extensions"),
        issuer: issuer,
        new_issuer: new_issuer,
        new_options: {
            max_supply: maxSupply,
            max_market_fee: maxMarketFee,
            market_fee_percent: update.market_fee_percent * 100,
            description: description,
            issuer_permissions: permissions,
            flags: flags,
            whitelist_authorities: asset.getIn(["options", "whitelist_authorities"]),
            blacklist_authorities: asset.getIn(["options", "blacklist_authorities"]),
            whitelist_markets: asset.getIn(["options", "whitelist_markets"]),
            blacklist_markets: asset.getIn(["options", "blacklist_markets"]),
            extensions: asset.getIn(["options", "extensions"]),
            core_exchange_rate: {
                quote: {
                    amount: coreQuoteAmount,
                    asset_name: coreExchangeRate.quote.asset_name
                },
                base: {
                    amount: coreBaseAmount,
                    asset_name: coreExchangeRate.base.asset_name
                }
            }
        }
    };

    if (issuer === new_issuer || !new_issuer) {
        delete updateObject.new_issuer;
    }
    //TODO asset_update updateObject

    //console.log("bitassetOpts:", bitassetOpts, "originalBitassetOpts:", originalBitassetOpts);

    if (isBitAsset && (
        bitassetOpts.feed_lifetime_sec !== originalBitassetOpts.feed_lifetime_sec ||
        bitassetOpts.minimum_feeds !== originalBitassetOpts.minimum_feeds ||
        bitassetOpts.force_settlement_delay_sec !== originalBitassetOpts.force_settlement_delay_sec ||
        bitassetOpts.force_settlement_offset_percent !== originalBitassetOpts.force_settlement_offset_percent ||
        bitassetOpts.maximum_force_settlement_volume !== originalBitassetOpts.maximum_force_settlement_volume ||
        bitassetOpts.short_backing_asset !== originalBitassetOpts.short_backing_asset)) {

        const bitAssetUpdateObject = {
            fee: {
                amount: 0,
                asset_name: 0
            },
            asset_to_update: asset.get("asset_name"),
            issuer: issuer,
            new_options: bitassetOpts
        };

        //TODO asset_update_bitasset bitAssetUpdateObject
    }
}

export function* issueAsset({payload: {to, from, assetName, amount, memo}}) {

    const memoObject = {
        //TODO implement
    };

    const issueAssetObject ={
        fee: {
            amount: 0,
            asset_name: 0
        },
        issuer: from,
        asset_to_issue: {
            amount: amount,
            asset_name: assetName
        },
        issue_to_account: to,
        memo: memoObject
    };
    //TODO implement asset_issue issueAssetObject
}

export function* reserveAsset({payload: {amount, assetName, payer}}) {
    const reserveAssetObject = {
        fee: {
            amount: 0,
            asset_name: 0
        },
        payer,
        amount_to_reserve: {
            amount: amount,
            asset_name: assetName
        },
        extensions: []
    };

    //TODO implement asset_reserve reserveAssetObject
}
