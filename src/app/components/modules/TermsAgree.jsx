/* eslint react/prop-types: 0 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';

import { translate } from 'app/Translator';
import HelpContent from 'app/components/elements/HelpContent';
import * as userActions from 'app/redux/UserReducer';

class TermsAgree extends Component {
    constructor() {
        super();
        this.termsAgree = this.termsAgree.bind(this);
    }

    termsAgree(e) {
        // let user proceed
        this.props.acceptTerms(e);
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
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({}),
    dispatch => ({
        acceptTerms: e => {
            if (e) e.preventDefault();
            dispatch(userActions.acceptTerms());
        },
    })
)(TermsAgree);
// mapStateToProps
