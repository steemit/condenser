import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import reactForm from 'app/utils/ReactForm';
import tt from 'counterpart';
import { fromJS } from 'immutable';

import BeneficiarySelector from 'app/components/cards/BeneficiarySelector';
import { validateBeneficiaries } from 'app/components/cards/BeneficiarySelector';
import * as userActions from 'app/redux/UserReducer';

class PostAdvancedSettings extends Component {
    static propTypes = {
        formId: React.PropTypes.string.isRequired,
    };

    constructor(props) {
        super();
        this.state = { payoutType: props.initialPayoutType };
        this.initForm(props);
    }

    initForm(props) {
        const { fields } = props;
        reactForm({
            fields,
            instance: this,
            name: 'advancedSettings',
            initialValues: props.initialValues,
            validation: values => {
                return {
                    beneficiaries: validateBeneficiaries(
                        props.username,
                        values.beneficiaries,
                        false
                    ),
                };
            },
        });
    }

    handlePayoutChange = event => {
        this.setState({ payoutType: event.target.value });
    };

    render() {
        const { formId, initialPayoutType } = this.props;
        const { beneficiaries, payoutType } = this.state;
        const { submitting, valid, handleSubmit } = this.state.advancedSettings;
        const disabled =
            submitting || !(valid || payoutType !== initialPayoutType);

        const form = (
            <form
                onSubmit={handleSubmit(({ data }) => {
                    const err = validateBeneficiaries(
                        this.props.username,
                        data.beneficiaries,
                        true
                    );
                    if (!err) {
                        this.props.setBeneficiaries(formId, data.beneficiaries);
                        this.props.setPayoutType(formId, payoutType);
                        this.props.hideAdvancedSettings();
                    } else {
                        const newBeneficiaries = {
                            ...beneficiaries,
                            error: err,
                        };
                        this.setState({ beneficiaries: newBeneficiaries });
                    }
                })}
            >
                <div className="row">
                    <h4 className="column">
                        {tt('post_advanced_settings_jsx.payout_option_header')}
                    </h4>
                </div>
                <div className="row">
                    <div className="column">
                        {tt(
                            'post_advanced_settings_jsx.update_default_in_settings'
                        )}
                    </div>
                </div>
                <div className="row">
                    <div className="small-12 medium-6 large-12 columns">
                        <select
                            defaultValue={payoutType}
                            onChange={this.handlePayoutChange}
                        >
                            <option value="0%">
                                {tt('reply_editor.decline_payout')}
                            </option>
                            <option value="50%">
                                {tt('reply_editor.default_50_50')}
                            </option>
                            <option value="100%">
                                {tt('reply_editor.power_up_100')}
                            </option>
                        </select>
                    </div>
                </div>
                <br />
                <div className="row">
                    <h4 className="column">
                        {tt('beneficiary_selector_jsx.header')}
                    </h4>
                </div>
                <BeneficiarySelector {...beneficiaries.props} tabIndex={1} />
                <div className="error">
                    {(beneficiaries.touched || beneficiaries.value) &&
                        beneficiaries.error}&nbsp;
                </div>
                <div className="row">
                    <div className="column">
                        <span>
                            <button
                                type="submit"
                                className="button"
                                disabled={disabled}
                                tabIndex={2}
                            >
                                {tt('g.save')}
                            </button>
                        </span>
                    </div>
                </div>
            </form>
        );
        return (
            <div>
                <div className="row">
                    <h3 className="column">
                        {tt('reply_editor.advanced_settings')}
                    </h3>
                </div>
                <hr />
                {form}
            </div>
        );
    }
}

import { connect } from 'react-redux';

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const formId = ownProps.formId;
        const fields = ['beneficiaries'];
        const username = state.user.getIn(['current', 'username']);
        const initialPayoutType = state.user.getIn([
            'current',
            'post',
            formId,
            'payoutType',
        ]);
        let beneficiaries = state.user.getIn([
            'current',
            'post',
            formId,
            'beneficiaries',
        ]);
        beneficiaries = beneficiaries ? beneficiaries.toJS() : [];
        return {
            ...ownProps,
            fields,
            initialPayoutType,
            username,
            initialValues: { beneficiaries },
        };
    },

    // mapDispatchToProps
    dispatch => ({
        hideAdvancedSettings: () =>
            dispatch(userActions.hidePostAdvancedSettings()),
        setBeneficiaries: (formId, beneficiaries) =>
            dispatch(
                userActions.set({
                    key: ['current', 'post', formId, 'beneficiaries'],
                    value: fromJS(beneficiaries),
                })
            ),
        setPayoutType: (formId, payoutType) =>
            dispatch(
                userActions.set({
                    key: ['current', 'post', formId, 'payoutType'],
                    value: payoutType,
                })
            ),
    })
)(PostAdvancedSettings);
