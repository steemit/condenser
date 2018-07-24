import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import reactForm from 'app/utils/ReactForm';
import { SUBMIT_FORM_ID } from 'shared/constants';
import tt from 'counterpart';
import { fromJS } from 'immutable';

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
            validation: values => {},
        });
    }

    handlePayoutChange = event => {
        this.setState({ payoutType: event.target.value });
    };

    render() {
        const {
            formId,
            username,
            defaultPayoutType,
            initialPayoutType,
        } = this.props;
        const { payoutType } = this.state;
        const { submitting, valid, handleSubmit } = this.state.advancedSettings;
        const disabled =
            submitting || !(valid || payoutType !== initialPayoutType);

        const form = (
            <form
                onSubmit={handleSubmit(({ data }) => {
                    this.props.setPayoutType(formId, payoutType);
                    this.props.hideAdvancedSettings();
                })}
            >
                <div className="row">
                    <div className="column">
                        <h4>
                            {tt(
                                'post_advanced_settings_jsx.payout_option_header'
                            )}
                        </h4>
                        <p>
                            {tt(
                                'post_advanced_settings_jsx.payout_option_description'
                            )}
                        </p>
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
                    <div className="column">
                        {tt('post_advanced_settings_jsx.current_default')}:{' '}
                        {defaultPayoutType === '0%'
                            ? tt('reply_editor.decline_payout')
                            : defaultPayoutType === '50%'
                              ? tt('reply_editor.default_50_50')
                              : tt('reply_editor.power_up_100')}
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <a href={'/@' + username + '/settings'}>
                            {tt(
                                'post_advanced_settings_jsx.update_default_in_settings'
                            )}
                        </a>
                    </div>
                </div>
                <br />
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
        const username = state.user.getIn(['current', 'username']);
        const isStory = formId === SUBMIT_FORM_ID;
        const defaultPayoutType = state.app.getIn(
            [
                'user_preferences',
                isStory ? 'defaultBlogPayout' : 'defaultCommentPayout',
            ],
            '50%'
        );
        const initialPayoutType = state.user.getIn([
            'current',
            'post',
            formId,
            'payoutType',
        ]);
        return {
            ...ownProps,
            fields: [],
            defaultPayoutType,
            initialPayoutType,
            username,
            initialValues: {},
        };
    },

    // mapDispatchToProps
    dispatch => ({
        hideAdvancedSettings: () =>
            dispatch(userActions.hidePostAdvancedSettings()),
        setPayoutType: (formId, payoutType) =>
            dispatch(
                userActions.set({
                    key: ['current', 'post', formId, 'payoutType'],
                    value: payoutType,
                })
            ),
    })
)(PostAdvancedSettings);
