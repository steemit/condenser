import React from 'react';
import Autocomplete from 'react-autocomplete';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import { validate_account_name } from 'app/utils/ChainValidation';
import reactForm from 'app/utils/ReactForm';
import { List, Set } from 'immutable';
import tt from 'counterpart';

export class BeneficiarySelector extends React.Component {
    static propTypes = {
        // HTML props
        id: React.PropTypes.string, // DOM id for active component (focusing, etc...)
        onChange: React.PropTypes.func.isRequired,
        onBlur: React.PropTypes.func.isRequired,
        value: React.PropTypes.array,
        tabIndex: React.PropTypes.number,

        // redux connect
        following: React.PropTypes.array.isRequired,
    };
    static defaultProps = {
        id: 'BeneficiarySelectorId',
    };
    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(
            this,
            'BeneficiarySelector'
        );
    }

    matchAutocompleteUser(item, value) {
        return item.toLowerCase().indexOf(value.toLowerCase()) > -1;
    }

    handleAddBeneficiary = e => {
        e.preventDefault();
        const beneficiaries = this.props.value;
        if (beneficiaries.length < 8) {
            this.props.onChange(
                beneficiaries.concat([{ username: '', percent: '' }])
            );
        }
    };

    handleRemoveBeneficiary = idx => e => {
        e.preventDefault();
        const beneficiaries = this.props.value;
        this.props.onChange(beneficiaries.filter((s, bidx) => idx != bidx));
    };

    handleBeneficiaryUserChange = idx => e => {
        e.preventDefault();
        const beneficiaries = this.props.value;
        const newBeneficiaries = beneficiaries.map((beneficiary, bidx) => {
            if (idx != bidx) return beneficiary;
            return { ...beneficiary, username: e.target.value };
        });
        this.props.onChange(newBeneficiaries);
    };

    handleBeneficiaryUserSelect = idx => val => {
        const beneficiaries = this.props.value;
        const newBeneficiaries = beneficiaries.map((beneficiary, bidx) => {
            if (idx != bidx) return beneficiary;
            return { ...beneficiary, username: val };
        });
        this.props.onChange(newBeneficiaries);
    };

    handleBeneficiaryPercentChange = idx => e => {
        e.preventDefault();
        const beneficiaries = this.props.value;
        const newBeneficiaries = beneficiaries.map((beneficiary, bidx) => {
            if (idx != bidx) return beneficiary;
            return { ...beneficiary, percent: e.target.value };
        });
        this.props.onChange(newBeneficiaries);
    };

    render() {
        const { username, following, tabIndex } = this.props;
        const beneficiaries = this.props.value;
        const remainingPercent =
            100 -
            beneficiaries
                .map(b => (b.percent ? parseInt(b.percent) : 0))
                .reduce((sum, elt) => sum + elt, 0);

        return (
            <span>
                <div className="row">
                    <div className="column small-2">
                        <div className="input-group">
                            <input
                                id="remainingPercent"
                                type="text"
                                pattern="[0-9]*"
                                value={remainingPercent}
                                disabled
                                className="BeneficiarySelector__percentbox"
                            />
                            <span className="BeneficiarySelector__percentrow">
                                %
                            </span>
                        </div>
                    </div>
                    <div className="column small-5">
                        <div className="input-group">
                            <span className="input-group-label">@</span>
                            <input
                                className="input-group-field bold"
                                type="text"
                                disabled
                                value={username}
                            />
                        </div>
                    </div>
                </div>
                {beneficiaries.map((beneficiary, idx) => (
                    <div className="row" key={idx}>
                        <div className="column small-2">
                            <div className="input-group">
                                <input
                                    id="percent"
                                    type="text"
                                    pattern="[0-9]*"
                                    value={beneficiary.percent}
                                    onChange={this.handleBeneficiaryPercentChange(
                                        idx
                                    )}
                                    className="BeneficiarySelector__percentbox"
                                />
                                <span className="BeneficiarySelector__percentrow">
                                    %
                                </span>
                            </div>
                        </div>
                        <div className="column small-5">
                            <div className="input-group">
                                <span className="input-group-label">@</span>
                                <Autocomplete
                                    wrapperStyle={{
                                        display: 'inline-block',
                                        width: '100%',
                                    }}
                                    inputProps={{
                                        id: 'user',
                                        type: 'text',
                                        className: 'input-group-field',
                                        autoComplete: 'off',
                                        autoCorrect: 'off',
                                        autoCapitalize: 'off',
                                        spellCheck: 'false',
                                    }}
                                    renderMenu={items => (
                                        <div
                                            className="react-autocomplete-input"
                                            children={items}
                                        />
                                    )}
                                    getItemValue={item => item}
                                    items={this.props.following}
                                    shouldItemRender={
                                        this.matchAutocompleteUser
                                    }
                                    renderItem={(item, isHighlighted) => (
                                        <div
                                            className={
                                                isHighlighted ? 'active' : ''
                                            }
                                        >
                                            {item}
                                        </div>
                                    )}
                                    value={beneficiary.username}
                                    onChange={this.handleBeneficiaryUserChange(
                                        idx
                                    )}
                                    onSelect={this.handleBeneficiaryUserSelect(
                                        idx
                                    )}
                                />
                            </div>
                        </div>
                        <div className="BeneficiarySelector__percentrow column small-5">
                            <a
                                id="remove"
                                href="#"
                                onClick={this.handleRemoveBeneficiary(idx)}
                            >
                                {tt('g.remove')}
                            </a>
                        </div>
                    </div>
                ))}
                <div className="row">
                    <div className="column">
                        <a
                            id="add"
                            href="#"
                            onClick={this.handleAddBeneficiary}
                            hidden={beneficiaries.length >= 8}
                        >
                            {tt('beneficiary_selector_jsx.add')}
                        </a>
                    </div>
                </div>
            </span>
        );
    }
}

export function validateBeneficiaries(
    username,
    beneficiaries,
    required = true
) {
    if (beneficiaries.length > 8) {
        return tt('beneficiary_selector_jsx.exceeds_max_beneficiaries');
    }
    var totalPercent = 0;

    var beneficiaryNames = Set();
    for (var i = 0; i < beneficiaries.length; i++) {
        const beneficiary = beneficiaries[i];
        const accountError = validate_account_name(beneficiary.username, '');
        if ((required || beneficiary.username) && accountError) {
            return accountError;
        }
        if (beneficiary.username === username) {
            return tt('beneficiary_selector_jsx.beneficiary_cannot_be_self');
        }
        if (beneficiaryNames.has(beneficiary.username)) {
            return tt(
                'beneficiary_selector_jsx.beneficiary_cannot_be_duplicate'
            );
        } else {
            beneficiaryNames = beneficiaryNames.add(beneficiary.username);
        }
        if (
            (required || beneficiary.percent) &&
            !/^[1-9]\d{0,2}$/.test(beneficiary.percent)
        ) {
            return tt('beneficiary_selector_jsx.beneficiary_percent_invalid');
        }
        totalPercent += parseInt(beneficiary.percent);
    }
    if (totalPercent > 100) {
        return tt('beneficiary_selector_jsx.beneficiary_percent_total_invalid');
    }
}

import { connect } from 'react-redux';

export default connect((state, ownProps) => {
    let following = List();
    const username = state.user.getIn(['current', 'username']);
    const follow = state.global.get('follow');
    if (follow) {
        const followingData = follow.getIn([
            'getFollowingAsync',
            username,
            'blog_result',
        ]);
        if (followingData) following = followingData.sort();
    }
    return {
        ...ownProps,
        username,
        following: following.toJS(),
    };
})(BeneficiarySelector);
