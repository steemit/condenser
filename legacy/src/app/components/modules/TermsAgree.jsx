/* eslint react/prop-types: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';

import { translate } from 'app/Translator';
import HelpContent from 'app/components/elements/HelpContent';
import * as userActions from 'app/redux/UserReducer';

class TermsAgree extends Component {
    constructor() {
        super();
        this.state = {
            tosChecked: false,
            privacyChecked: false,
        };
        this.termsAgree = this.termsAgree.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value =
            target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value,
        });
    }

    termsAgree(e) {
        // let user proceed
        this.props.acceptTerms(e);
    }

    static propTypes = {
        username: PropTypes.string.isRequired,
        acceptTerms: PropTypes.func.isRequired,
    };

    render() {
        const { username } = this.props;

        return (
            <div>
                <h4>{tt('termsagree_jsx.please_review')}</h4>
                <p>{tt('termsagree_jsx.hi_user', { username })}</p>
                <p>{tt('termsagree_jsx.blurb')}</p>
                <p>
                    <label>
                        <input
                            name="tosChecked"
                            type="checkbox"
                            checked={this.state.tosChecked}
                            onChange={this.handleInputChange}
                        />
                        {tt('termsagree_jsx.i_agree_to_steemits')}{' '}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="/tos.html"
                        >
                            {tt('termsagree_jsx.terms_of_service')}
                        </a>
                    </label>
                </p>
                <p>
                    <label>
                        <input
                            name="privacyChecked"
                            type="checkbox"
                            checked={this.state.privacyChecked}
                            onChange={this.handleInputChange}
                        />
                        {tt('termsagree_jsx.i_agree_to_steemits')}{' '}
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="/privacy.html"
                        >
                            {tt('termsagree_jsx.privacy_policy')}
                        </a>
                    </label>
                </p>
                <div>
                    <button
                        type="submit"
                        className="button"
                        onClick={this.termsAgree}
                        disabled={
                            !this.state.tosChecked || !this.state.privacyChecked
                        }
                    >
                        {tt('termsagree_jsx.continue')}
                    </button>
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        username: state.user.getIn(['current', 'username']),
    }),
    dispatch => ({
        acceptTerms: e => {
            if (e) e.preventDefault();
            dispatch(userActions.acceptTerms());
        },
    })
)(TermsAgree);
// mapStateToProps
