import React, { PropTypes } from "react";
import {connect} from 'react-redux';
import big from "bignumber.js";
import tt from 'counterpart';
import {Tabs, Tab} from 'app/components/elements/Tabs'
import AmountSelector from 'app/components/elements/AmountSelector'
import assetConstants from "app/utils/Assets/Constants";
import assetUtils from "app/utils/Assets/AssetsUtils";
import utils from 'app/utils/Assets/utils';
import FormattedAsset from "app/components/elements/FormattedAsset";
import {validate_asset_symbol} from 'app/utils/ChainValidation';

let MAX_SAFE_INT = new big("9007199254740991");

class BitAssetOptions extends React.Component {

    static propTypes = {
        isUpdate: PropTypes.bool
    };

    static defaultProps = {
        isUpdate: false
    };

    constructor(props) {
        super(props);
        this.state = {
            backingAsset: props.backingAsset.symbol,
            error: null
        };
    }

    onInputBackingAsset(event) {
        const asset = event.target.value;
        this.setState({
            backingAsset: asset.toUpperCase(),
            error: null
        });
        //TODO
        // if (asset) {
        //     if (asset.get("id") === "1.3.0" || (asset.get("bitasset_data_id") && !asset.getIn(["bitasset", "is_prediction_market"]))) {
        //         if (asset.get("precision") !== parseInt(this.props.assetPrecision, 10)) {
        //             this.setState({
        //                 error: tt('account.user_issued_assets.error_precision', {asset: this.props.assetSymbol})
        //             });
        //         } else {
        //             this.props.onUpdate("short_backing_asset", asset.get("id"));
        //         }
        //     } else {
        //         this.setState({
        //             error: tt('account.user_issued_assets.error_invalid')
        //         });
        //     }
        // }
    }

    render() {
        let {bitasset_opts} = this.props;
        let {error} = this.state;

        return (
            <div className="column small-12">
                <div className="row margin">
                    <div className="column small-12">
                        <label>{tt('user_issued_assets.feed_lifetime_sec')}
                            <input
                                type="number"
                                value={bitasset_opts.feed_lifetime_sec / 60}
                                onChange={this.props.onUpdate.bind(this, "feed_lifetime_sec")}/>
                        </label>
                    </div>
                </div>

                 <div className="row margin">
                    <div className="column small-12">
                        <label>{tt('user_issued_assets.minimum_feeds')}
                            <input
                                type="number"
                                value={bitasset_opts.minimum_feeds}
                                onChange={this.props.onUpdate.bind(this, "minimum_feeds")}/>
                        </label>
                    </div>
                </div>

                <div className="row margin">
                    <div className="column small-12">
                        <label>{tt('user_issued_assets.force_settlement_delay_sec')}
                            <input type="number"
                                   value={bitasset_opts.force_settlement_delay_sec / 60}
                                   onChange={this.props.onUpdate.bind(this, "force_settlement_delay_sec")}/>
                        </label>
                    </div>
                </div>

                <div className="row margin">
                    <div className="column small-12">
                        <label>{tt('user_issued_assets.force_settlement_offset_percent')}
                            <input type="number"
                                   value={bitasset_opts.force_settlement_offset_percent / assetConstants.GRAPHENE_1_PERCENT}
                                   onChange={this.props.onUpdate.bind(this, "force_settlement_offset_percent")}/>
                        </label>
                    </div>
                </div>

                <div className="row margin">
                    <div className="column small-12">
                        <label>{tt('user_issued_assets.maximum_force_settlement_volume')}
                            <input type="number"
                                   value={bitasset_opts.maximum_force_settlement_volume / assetConstants.GRAPHENE_1_PERCENT}
                                   onChange={this.props.onUpdate.bind(this, "maximum_force_settlement_volume")}/>
                        </label>
                    </div>
                </div>

                <div className="row margin">
                    <div className="column small-12">
                        <label>
                            {tt('user_issued_assets.backing')}
                            <input /*AssetSelector*/
                                type="text"
                                value={this.state.backingAsset || ""}
                                placeholder={tt('user_issued_assets.backing')}
                                onChange={this.onInputBackingAsset.bind(this)}
                            />
                        </label>
                        {error ? <div className="error">{error}</div> : null}
                    </div>
                </div>
            </div>
        );
    }
}

class AssetCreate extends React.Component {

    static propTypes = {
        core: PropTypes.any.isRequired,
        globalObject: PropTypes.any.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = this.resetState();
    }

    resetState() {
        let isBitAsset = false;
        let {flagBooleans, permissionBooleans} = this.getPermissions({isBitAsset});

        return {

            update: {
                symbol: "",
                precision: 4,
                max_supply: 100000,
                max_market_fee: 0,
                market_fee_percent: 0,
                description: {main: ""}
            },
            errors: {
                max_supply: null
            },
            isValid: true,
            flagBooleans: flagBooleans,
            permissionBooleans: permissionBooleans,
            isBitAsset: isBitAsset,
            is_prediction_market: false,
            core_exchange_rate: {
                quote: {
                    asset_id: null,
                    amount: 1
                },
                base: {
                    asset_id: "1.3.0",
                    amount: 1
                }
            },
            bitasset_opts: {
                feed_lifetime_sec : 60 * 60 * 24,
                minimum_feeds : 7,
                force_settlement_delay_sec : 60 * 60 * 24,
                force_settlement_offset_percent : 1 * assetConstants.GRAPHENE_1_PERCENT,
                maximum_force_settlement_volume : 20 * assetConstants.GRAPHENE_1_PERCENT,
                short_backing_asset : "1.3.0"
            },
            marketInput: ""
        };
    }

    getPermissions(state) {
        const flagBooleans = assetUtils.getFlagBooleans(0, state.isBitAsset);
        const permissionBooleans = assetUtils.getFlagBooleans("all", state.isBitAsset);

        return {
            flagBooleans,
            permissionBooleans
        }
    }

    forcePositive(number) {
        return parseFloat(number) < 0 ? "0" : number;
    }

    onInputMarket(event) {
        let asset = event.target.value.trim().substr(0, 16).toUpperCase();
        this.setState({marketInput: asset});

        //TODO
        //this.onUpdateDescription("market", asset.get("symbol"));
    }

    onChangeBitAssetOpts(value, e) {
        let {bitasset_opts} = this.state;

        switch (value) {
            case "force_settlement_offset_percent":
            case "maximum_force_settlement_volume":
                bitasset_opts[value] = parseFloat(e.target.value) * assetConstants.GRAPHENE_1_PERCENT;
                break;

            case "feed_lifetime_sec":
            case "force_settlement_delay_sec":
                bitasset_opts[value] = parseInt(parseFloat(e.target.value) * 60, 10);
                break;

            case "short_backing_asset":
                bitasset_opts[value] = e;
                break;

            default:
                bitasset_opts[value] = e.target.value;
                break;
        }

        this.forceUpdate();
    }

    onUpdateInput(value, e) {
        let {update} = this.state;
        let updateState = true;
        let precision = utils.get_asset_precision(this.state.update.precision);
        switch (value) {
            case "market_fee_percent":
                update[value] = this.forcePositive(e.target.value);
                break;

            case "max_market_fee":
                if ((new big(e.target.value)).times(precision).gt(MAX_SAFE_INT)) {
                    return this.setState({errors: {max_market_fee: "The number you tried to enter is too large"}});
                }
                e.target.value = utils.limitByPrecision(e.target.value, this.state.update.precision);
                update[value] = e.target.value;
                break;

            case "precision":
                // Enforce positive number
                update[value] = this.forcePositive(e.target.value);
                break;

            case "max_supply":
                if ((new big(e.target.value)).times(precision).gt(MAX_SAFE_INT)) {
                    return this.setState({errors: {max_supply: "The number you tried to enter is too large"}});
                }
                e.target.value = utils.limitByPrecision(e.target.value, this.state.update.precision);
                update[value] = e.target.value;
                break;

            case "symbol":
                // Enforce uppercase
                e.target.value = e.target.value.toUpperCase();
                // Enforce characters
                let regexp = new RegExp("^[\.A-Z]+$");
                if (e.target.value !== "" && !regexp.test(e.target.value)) {
                    break;
                }
                //TODO Store.getAsset(e.target.value);
                update[value] = this.forcePositive(e.target.value);
                break;

            default:
                update[value] = e.target.value;
                break;
        }

        if (updateState) {
            this.setState({update: update});
            this.validateEditFields(update);
        }
    }

    onUpdateDescription(value, e) {
        let {update} = this.state;
        let updateState = true;

        switch (value) {
            case "condition":
                if (e.target.value.length > 60) {
                    updateState = false;
                    return;
                }
                update.description[value] = e.target.value;
                break;

            case "short_name":
                if (e.target.value.length > 32) {
                    updateState = false;
                    return;
                }
                update.description[value] = e.target.value;
                break;

            case "market":
                update.description[value] = e;
                break;

            default:
                update.description[value] = e.target.value;
                break;
        }

        if (updateState) {
            this.forceUpdate();
            this.validateEditFields(update);
        }
    }

    onCoreRateChange(type, e) {
        let amount, asset;
        if (type === "quote") {
            amount = utils.limitByPrecision(e.target.value, this.state.update.precision);
            asset = null;
        } else {
            if (!e || !("amount" in e)) {
                return;
            }
            const precision = this.props.core.get("precision");
            amount = e.amount == ""
                ? "0"
                : utils.limitByPrecision(e.amount.toString().replace(/,/g, ""), precision);
            asset = e.asset.get("id");
        }

        const {core_exchange_rate} = this.state;
        core_exchange_rate[type] = {
            amount: amount,
            asset_id: asset
        };
        this.forceUpdate();
    }

    onToggleBitAsset() {
        this.state.isBitAsset = !this.state.isBitAsset;
        if (!this.state.isBitAsset) {
            this.setState({is_prediction_market :false})
        }

        const {flagBooleans, permissionBooleans} = this.getPermissions(this.state);
        this.setState({flagBooleans});
        this.setState({permissionBooleans});

        this.forceUpdate();
    }

    validateEditFields( new_state ) {
        const errors = {
            max_supply: null
        };

        errors.symbol = validate_asset_symbol(new_state.symbol);
        //TODO
        const existingAsset = ''; //Store.getAsset(new_state.symbol);
        if (existingAsset) {
            errors.symbol = tt('user_issued_assets.exists')
        }

        errors.max_supply = new_state.max_supply <= 0 ? tt('user_issued_assets.max_positive') : null;

        const isValid = !errors.symbol && !errors.max_supply;
        this.setState({isValid: isValid, errors: errors});
    }

    onFlagChange(key) {
        const booleans = this.state.flagBooleans;
        booleans[key] = !booleans[key];
        this.setState({ flagBooleans: booleans });
    }

    onPermissionChange(key) {
        const booleans = this.state.permissionBooleans;
        booleans[key] = !booleans[key];
        this.setState({ permissionBooleans: booleans });
    }

    onTogglePM() {
        this.state.is_prediction_market = !this.state.is_prediction_market;
        this.state.update.precision = this.props.core.get("precision");
        this.state.core_exchange_rate.base.asset_name = this.props.core.get("asset_name");
        this.forceUpdate();
    }

    createAsset(e) {
        e.preventDefault();
        const { update, flagBooleans, permissionBooleans, core_exchange_rate,
            isBitAsset, is_prediction_market, bitasset_opts } = this.state;

        const { account } = this.props;

        const flags = assetUtils.getFlags(flagBooleans, isBitAsset);
        const permissions = assetUtils.getPermissions(permissionBooleans, isBitAsset);

        if (this.state.marketInput !== update.description.market) {
            update.description.market = "";
        }
        const description = JSON.stringify(update.description);

        this.props.assetCreate(account.name, update, flags, permissions, core_exchange_rate, isBitAsset, is_prediction_market, bitasset_opts, description);
    }

    reset(e) {
        e.preventDefault();

        this.setState(
            this.resetState(this.props)
        );
    }

    render() {
        const { globalObject, core } = this.props;
        const { errors, isValid, update, flagBooleans, permissionBooleans,
            core_exchange_rate, is_prediction_market, isBitAsset, bitasset_opts } = this.state;

        //only for DEBUG
        // is_prediction_market = true;

        // Estimate the asset creation fee from the symbol character length
        let symbolLength = update.symbol.length;
        let createFee = "N/A";

        if(symbolLength === 3) {
            createFee = <FormattedAsset amount={utils.estimateFee("asset_create", ["symbol3"], globalObject)} asset={"1.3.0"} />;
        }
        else if(symbolLength === 4) {
            createFee = <FormattedAsset amount={utils.estimateFee("asset_create", ["symbol4"], globalObject)} asset={"1.3.0"} />;
        }
        else if(symbolLength > 4) {
            createFee = <FormattedAsset amount={utils.estimateFee("asset_create", ["long_symbol"], globalObject)} asset={"1.3.0"} />;
        }

        // Loop over flags
        let flags = [];
        for (let key in permissionBooleans) {
            if (permissionBooleans[key] && key !== "charge_market_fee") {
                flags.push(
                    <table key={"table_" + key} className="table">
                        <tbody>
                        <tr>
                            <td style={{border: "none", width: "80%"}}>{tt(`user_issued_assets.${key}`)}:</td>
                            <td style={{border: "none"}}>
                                <div className="switch"  onClick={this.onFlagChange.bind(this, key)}>
                                    <input type="checkbox" checked={flagBooleans[key]} />
                                    <label />
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                )
            }
        }

        // Loop over permissions
        let permissions = [];
        for (let key in permissionBooleans) {
            permissions.push(
                <table key={"table_" + key} className="table">
                    <tbody>
                    <tr>
                        <td style={{border: "none", width: "80%"}}>{tt(`user_issued_assets.${key}`)}:</td>
                        <td style={{border: "none"}}>
                            <div className="switch" onClick={this.onPermissionChange.bind(this, key)}>
                                <input type="checkbox" checked={permissionBooleans[key]} onChange={() => {}}/>
                                <label />
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            )
        }

        const price = utils.get_asset_price(
            core_exchange_rate.quote.amount * utils.get_asset_precision(update.precision),
            {precision: update.precision},
            core_exchange_rate.base.amount * utils.get_asset_precision(core),
            core);
        const formattedPrice = price.toFixed(2 + (parseInt(update.precision, 10) || 8));

        let tabs = <div className="AssetCreate_tabs">
            <h4>{tt('asset_create_jsx.header')}</h4>
            <Tabs>
                <Tab title={tt('user_issued_assets.primary')}>
                    <div className="row">
                        <div className="column small-12">
                            <div className="row margin">
                                <div className="column small-6">
                                    <label>{tt('user_issued_assets.symbol')}
                                        <input
                                            type="text"
                                            value={update.symbol}
                                            onChange={this.onUpdateInput.bind(this, "symbol")}
                                        />
                                    </label>
                                    { errors.symbol ? <p className="error">{errors.symbol}</p> : null}
                                </div>

                                <div className="column small-6">
                                    <label>{tt('user_issued_assets.max_supply')}
                                        <input
                                            type="number"
                                            value={update.max_supply}
                                            onChange={this.onUpdateInput.bind(this, "max_supply")}
                                        />
                                    </label>
                                    { errors.max_supply ? <p className="error">{errors.max_supply}</p> : null}
                                </div>
                            </div>
                            <div className="row margin">
                                <div className="column small-6">
                                    <label>{tt('user_issued_assets.decimals')}</label>
                                </div>
                                <div className="column small-6">
                                    <span style={{marginRight: "1.5rem"}}>{update.precision}</span>
                                    <input
                                        min="0"
                                        max="8"
                                        step="1"
                                        type="range"
                                        value={update.precision}
                                        onChange={this.onUpdateInput.bind(this, "precision")}
                                    />
                                </div>
                            </div>

                            <div className="txt-label warning">{tt('user_issued_assets.precision_warning')}</div>

                            <div className="row margin">
                                <div className="column small-6 medium-3">
                                    <div className="switch" onClick={this.onToggleBitAsset.bind(this)}>
                                        <label>{tt('user_issued_assets.mpa')}:
                                            <input
                                                type="checkbox"
                                                checked={isBitAsset} />
                                        </label>
                                    </div>
                                </div>

                                <div className="column small-6 medium-6">
                                    {isBitAsset
                                        ? (<div className="switch" onClick={this.onTogglePM.bind(this)}>
                                                <label>{tt('user_issued_assets.pm')}:
                                                    <input
                                                        type="checkbox"
                                                        checked={is_prediction_market}
                                                    />
                                                </label>
                                            </div>)
                                        : null
                                    }
                                </div>
                            </div>

                            <h5>{tt('user_issued_assets.core_exchange_rate')}</h5>

                            <label>
                                <div className="row margin">
                                    {errors.quote_asset ? <p className="error">{errors.quote_asset}</p> : null}
                                    {errors.base_asset ? <p className="error">{errors.base_asset}</p> : null}
                                    <div className="column small-12 medium-6">
                                        <div className="amount-selector" style={{width: "100%", paddingRight: "10px"}}>
                                            {tt('user_issued_assets.quote')}
                                            <div className="inline-label">
                                                <input
                                                    type="text"
                                                    placeholder="0.0"
                                                    onChange={this.onCoreRateChange.bind(this, "quote")}
                                                    value={core_exchange_rate.quote.amount}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                    <div className="column small-12 medium-6">
                                         <AmountSelector
                                            label={tt('user_issued_assets.base')}
                                            amount={core_exchange_rate.base.amount}
                                            onChange={this.onCoreRateChange.bind(this, "base")}
                                            asset={core_exchange_rate.base.asset_id}
                                            placeholder="0.0"
                                            tabIndex={1}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h5>
                                        {tt('asset_create_jsx.price')}
                                        <span>: {formattedPrice}</span>
                                        <span> {update.symbol}/{core.get("symbol")}</span>
                                    </h5>
                                </div>
                            </label>
                        </div>
                    </div>
                </Tab>

                <Tab title={tt('user_issued_assets.description')}>
                    <div className="row margin">
                        <div className="column small-12">
                            <label>
                                {tt('user_issued_assets.description')}
                                <textarea
                                    style={{height: "7rem"}}
                                    rows="1"
                                    value={update.description.main}
                                    onChange={this.onUpdateDescription.bind(this, "main")}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="row margin">
                        <div className="column small-12">
                            <label>
                                {tt('user_issued_assets.short')}
                                <input
                                    type="text"
                                    rows="1"
                                    value={update.description.short_name}
                                    onChange={this.onUpdateDescription.bind(this, "short_name")}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="row margin">
                        <div className="column small-12">
                            <h5>{tt('user_issued_assets.market')}</h5>
                            <input /*AssetSelector*/
                                type="text"
                                value={this.state.marketInput || ""}
                                placeholder={tt('asset_create_jsx.symbol')}
                                onChange={this.onInputMarket.bind(this)}
                            />
                            {is_prediction_market
                                ? (<div>
                                    <label>
                                        {tt('user_issued_assets.condition')}
                                        <input
                                            type="text"
                                            rows="1"
                                            value={update.description.condition}
                                            onChange={this.onUpdateDescription.bind(this, "condition")}
                                        />
                                    </label>

                                    <label>
                                        {tt('user_issued_assets.expiry')}
                                        <input
                                            type="date"
                                            value={update.description.expiry}
                                            onChange={this.onUpdateDescription.bind(this, "expiry")}
                                        />
                                    </label>
                                  </div>)
                                : null
                            }
                        </div>
                    </div>
                </Tab>

                {isBitAsset
                    ? (<Tab title={tt('user_issued_assets.bitasset_opts')}>
                            <BitAssetOptions
                                bitasset_opts={bitasset_opts}
                                onUpdate={this.onChangeBitAssetOpts.bind(this)}
                                backingAsset={bitasset_opts.short_backing_asset}
                                assetPrecision={update.precision}
                                assetSymbol={update.symbol}
                            />
                        </Tab>)
                    : null
                }

                <Tab title={tt('asset_create_jsx.permissions')}>
                    <div className="row margin">
                        <div className="column small-12">
                            <div className="help-content">{tt('asset_create_jsx.help.permissions_first')}</div>
                            <div className="help-content">{tt('asset_create_jsx.help.permissions_second')}</div>
                            {permissions}
                        </div>
                    </div>
                </Tab>

                <Tab title={tt('user_issued_assets.flags')}>
                    <div className="row margin">
                        <div className="column small-12">
                            <div className="row margin">
                                <div className="column small-12">
                                    {tt('asset_create_jsx.help.marker')}
                                </div>
                             </div>
                            {permissionBooleans["charge_market_fee"]
                                ? (<div className="row margin">
                                    <div className="column small-12">
                                        {tt('user_issued_assets.market_fee')}
                                        <table className="table">
                                            <tbody>
                                            <tr>
                                                <td style={{border: "none", width: "80%"}}>{tt('user_issued_assets.market_fee')}:</td>
                                                <td style={{border: "none"}}>
                                                    <div className="switch" onClick={this.onFlagChange.bind(this, "charge_market_fee")}>
                                                        <input type="checkbox" checked={flagBooleans.charge_market_fee} />
                                                        <label />
                                                    </div>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <div className={{disabled: !flagBooleans.charge_market_fee}}>
                                            <div className="row margin">
                                                <div className="column small-6">
                                                    <label>{tt('user_issued_assets.market_fee')} (%)
                                                        <input
                                                            type="number"
                                                            value={update.market_fee_percent}
                                                            onChange={this.onUpdateInput.bind(this, "market_fee_percent")}/>
                                                    </label>
                                                </div>
                                                <div className="column small-6">
                                                    <label>{tt('user_issued_assets.max_market_fee')} ({update.symbol})
                                                        <input
                                                            type="number"
                                                            value={update.max_market_fee}
                                                            onChange={this.onUpdateInput.bind(this, "max_market_fee")}/>
                                                    </label>
                                                </div>
                                                { errors.max_market_fee ? <p className="error">{errors.max_market_fee}</p> : null}
                                            </div>
                                        </div>
                                    </div>
                                 </div>)
                                : null
                            }

                            <h5>{tt('user_issued_assets.flags')}</h5>
                            {flags}

                        </div>
                    </div>
                </Tab>
            </Tabs>
        </div>

        return (
            <div className="row">
                <div className="column large-8 small-12">
                    {tabs}
                    <hr/>
                    <div style={{paddingTop: "0.5rem"}}>
                        <button className={"button " + {disabled: !isValid}} onClick={this.createAsset.bind(this)}>
                            {tt('asset_create_jsx.create_asset')}
                        </button>
                        <button className="button hollow" onClick={this.reset.bind(this)} value= {tt('asset_create.reset')}>
                            {tt('asset_create_jsx.reset')}
                        </button>
                        <p>{tt('user_issued_assets.approx_fee')}: {createFee}</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    state => {
        return {
            core: state.assets.get('core'),
            globalObject: state.assets.get('globalObject')
        }
    },
    dispatch => ({
        assetCreate : (account, createObject, flags, permissions, coreExchangeRate, isBitAsset, isPredictionMarket, bitassetOpts, description) => {
            dispatch({
                type: 'CREATE_ASSET',
                payload: {account, createObject, flags, permissions, coreExchangeRate, isBitAsset, isPredictionMarket, bitassetOpts, description}
            })
        },

        reserveAsset : (amount, assetId, account) =>{

        }
    })
)(AssetCreate);
