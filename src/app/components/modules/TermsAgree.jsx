/* eslint react/prop-types: 0 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';

import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import { translate } from 'app/Translator';
import HelpContent from 'app/components/elements/HelpContent';
import * as userActions from 'app/redux/UserReducer';

class TermsAgree extends Component {
    constructor() {
        super();
        this.termsAgree = this.termsAgree.bind(this);
        this.termsCancel = this.termsCancel.bind(this);
    }

    termsAgree(e) {
        // let user proceed
        serverApiRecordEvent('AgreeTerms', true);
        this.props.hideTerms(e);
    }

    termsCancel() {
        // do not allow to proceed
        serverApiRecordEvent('CancelTerms', true);
        window.location.href = '/';
    }

    static propTypes = {
        // redux
    };

    render() {
        return (
            <div>
                <h4>Terms of Service</h4>
                <div>
                    <hr />

                    <HelpContent path="tos" title="Terms of Service" />

                    <br />
                    <button
                        type="submit"
                        className="button"
                        onClick={this.termsAgree}
                    >
                        {tt('termsagree_jsx.i_agree_to_these_terms')}
                    </button>
                    <button
                        type="button float-right"
                        className="button hollow"
                        onClick={this.termsCancel}
                    >
                        {tt('termsagree_jsx.cancel')}
                    </button>
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({}),
    dispatch => ({
        hideTerms: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hideTerms());
        },
    })
)(TermsAgree);
// mapStateToProps
