import React, { PropTypes } from "react";
import { Link } from 'react-router';
import { connect } from 'react-redux';
import tt from 'counterpart';
import debounce from 'lodash.debounce';
import FormattedAsset from "app/components/elements/FormattedAsset";
import assetUtils from "app/utils/Assets/AssetsUtils";

class AccountAssets extends React.Component {
    static defaultProps = {
        symbol: "",
        name: "",
        description: "",
        max_supply: 0,
        precision: 0
    };

    static propTypes = {
        symbol: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            create: {
                symbol: "",
                name: "",
                description: "",
                max_supply: 1000000000000000,
                precision: 4
            },
            issue: {
                amount: 0,
                to: "",
                to_id: "",
                asset_id: "",
                symbol: ""
            },
            errors: {
                symbol: null
            },
            isValid: false,
            searchTerm: ""
        };

        this.searchAccounts = debounce(this.searchAccounts, 150);
    }

    checkAssets(assets, force) {
        let lastAsset = assets.sort((a, b) => {
            if (a.symbol > b.symbol) {
                return 1;
            } else if (a.symbol < b.symbol) {
                return -1;
            } else {
                return 0;
            }
        }).last();

        if (assets.size === 0 || force) {
            //TODO
            // getAssetList.defer("A", 100);
            this.setState({assetsFetched: 100});
        } else if (assets.size >= this.state.assetsFetched) {
            //TODO
            // getAssetList.defer(lastAsset.symbol, 100);
            this.setState({assetsFetched: this.state.assetsFetched + 99});
        }
    }

    componentWillReceiveProps(nextProps) {
        this.checkAssets(nextProps.assets);
    }

    componentWillMount() {
        this.checkAssets(this.props.assets, true);
    }

    searchAccounts(searchTerm) {
        //TODO implement
    }

    reserveButtonClick(assetId, e) {
        e.preventDefault();
        this.setState({reserve: assetId});
        //TODO implement
    }

    issueButtonClick(asset_id, symbol, e) {
        e.preventDefault();
        let {issue} = this.state;
        issue.asset_id = asset_id;
        issue.symbol = symbol;
        this.setState({issue: issue});
        //TODO implement
    }

    editButtonClick(symbol, account_name, e) {
        e.preventDefault();
        //TODO implement
        //this.props.router.push(`${account_name}/update-asset/${symbol}`);
    }

    render() {
        let {account, account_name, searchAccounts, assets} = this.props;
        let {issue, errors, isValid, create} = this.state;

        let myAssets = assets
        //TODO need for debug
        // .filter(asset => {
        //     return asset.issuer === account.id;
        // })
        .sort((a, b) => {
            return parseInt(a.id.substring(4, a.id.length), 10) - parseInt(b.id.substring(4, b.id.length), 10);
        })
        .map(asset => {
            const description = assetUtils.parseDescription(asset.options.description);
            let desc = description.short_name ? description.short_name : description.main;

            if (desc.length > 100) {
                desc = desc.substr(0, 100) + "...";
            }
            return (
                <tr key={asset.symbol}>
                    <td><Link to={`/asset/${asset.symbol}`}>{asset.symbol}</Link></td>
                    <td style={{maxWidth: "250px"}}>{desc}</td>
                    <td>{<FormattedAsset amount={parseInt(asset.dynamic_data.current_supply, 10)} asset={asset} />}</td>
                    <td>{<FormattedAsset amount={parseInt(asset.options.max_supply, 10)} asset={asset} />}</td>
                    <td>
                        {!asset.bitasset_data_id
                            ? (<button onClick={this.issueButtonClick.bind(this, asset.id, asset.symbol)} className="tiny button slim">
                                    {tt('account_assets_jsx.asset_issue')}
                               </button>)
                            : null
                        }
                    </td>
                    <td>
                        {!asset.bitasset_data_id
                            ? (<button onClick={this.reserveButtonClick.bind(this, asset.id)} className="tiny button slim">
                                    {tt('account_assets_jsx.asset_reserve')}
                                </button>)
                            : null
                        }
                    </td>
                    <td>
                        <button onClick={this.editButtonClick.bind(this, asset.symbol, account_name)} className="tiny button slim">
                            {tt('account_assets_jsx.asset_update')}
                        </button>
                    </td>
                </tr>
            );
        }).toArray();

        return (
            <div className="row">
                <div className="column small-12">
                    <div className="row">
                        <div className="columns small-6 medium-12 medium-expand">
                            <h4>{tt('user_issued_assets.issued_assets')}</h4>
                        </div>
                        <div className="columns shrink right-column">
                            <Link to={`/@${account_name}/create-asset/`}>
                                <button className="button">{tt('account_assets_jsx.asset_create')}</button>
                            </Link>
                        </div>
                    </div>

                    <div className="row">
                        <div className="column small-12">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{tt('user_issued_assets.symbol')}</th>
                                        <th style={{maxWidth: "250px"}}>{tt('user_issued_assets.description')}</th>
                                        <th>{tt('account_assets_jsx.supply')}</th>
                                        <th style={{maxWidth: "140px"}}>{tt('user_issued_assets.max_supply')}</th>
                                        <th style={{textAlign: "center"}} colSpan="3">{tt('account_assets_jsx.action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myAssets}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/**TODO implement reactForm for asset_to_issue and reserve_asset */}

            </div>
        );
    }
}

export default connect(
    state => {
        return {
            assets: state.assets.get('assets')
        }
    },
    dispatch => ({
        //TODO dispatch reactForm
    })
)(AccountAssets)
