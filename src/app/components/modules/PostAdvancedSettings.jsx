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
        this.state = {};
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

    render() {
        const { formId } = this.props;
        const { beneficiaries } = this.state;
        const { submitting, valid, handleSubmit } = this.state.advancedSettings;

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
                                disabled={submitting || !valid}
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
    })
)(PostAdvancedSettings);
