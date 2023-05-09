import React, { Component } from 'react';
import { connect } from 'react-redux';
import reactForm from 'app/utils/ReactForm';
import { SUBMIT_FORM_ID } from 'shared/constants';
import tt from 'counterpart';
import { fromJS } from 'immutable';

import * as userActions from 'app/redux/UserReducer';
import DraftSummary from '../cards/DraftSummary';

class PostDrafts extends Component {
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
        const { beneficiaries, payoutType } = this.state;
        const { submitting, valid, handleSubmit } = this.state.advancedSettings;
        const disabled =
            submitting || !(valid || payoutType !== initialPayoutType);

        let draftList = JSON.parse(localStorage.getItem('draft-list')) || [];
        draftList = draftList.filter(data => data.author === username);
        const drafts = draftList.map((draft, idx) => (
            <div key={idx} className="drafts-option">
                <DraftSummary post={draft} />
            </div>
        ));

        return (
            <div>
                <div className="row">
                    <h3 className="column">{tt('reply_editor.draft')}</h3>
                </div>
                <hr />
                <div className="drafts-list">{drafts}</div>
            </div>
        );
    }
}

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
        let beneficiaries = state.user.getIn([
            'current',
            'post',
            formId,
            'beneficiaries',
        ]);
        beneficiaries = beneficiaries ? beneficiaries.toJS() : [];
        return {
            ...ownProps,
            fields: ['beneficiaries'],
            defaultPayoutType,
            initialPayoutType,
            username,
            initialValues: { beneficiaries },
        };
    },

    // mapDispatchToProps
    dispatch => ({
        hideDrafts: () => dispatch(userActions.hideDrafts()),
    })
)(PostDrafts);
