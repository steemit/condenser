/* eslint react/prop-types: 0 */
import React, { PropTypes, Component } from 'react';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import { translate } from 'app/Translator';
import { Tos } from 'app/components/pages/Tos';
import { connect } from 'react-redux';
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

                    <Tos />

                    <br />
                    <button
                        type="submit"
                        className="button"
                        onClick={this.termsAgree}
                    >
                        I Agree To These Terms // FIXME i18n
                    </button>
                    <button
                        type="button float-right"
                        className="button hollow"
                        onClick={this.termsCancel}
                    >
                        Cancel // FIXME i18n
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
