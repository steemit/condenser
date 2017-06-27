import React from 'react';
import {connect} from 'react-redux';
import SvgImage from 'app/components/elements/SvgImage';
import AddToWaitingList from 'app/components/modules/AddToWaitingList';
import { translate } from 'app/Translator';
import { formatCoins } from 'app/utils/FormatCoins';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from 'config/client_config';
import LocalizedCurrency from 'app/components/elements/LocalizedCurrency';

class SignUp extends React.Component {
    constructor() {
        super();
        this.state = {waiting_list: false};
    }
    render() {
        if ($STM_Config.read_only_mode) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>{translate("read_only_mode")}</p>
                    </div>
                </div>
            </div>;
        }

        if (this.props.serverBusy || $STM_Config.disable_signups) {
            return <div className="row">
                <div className="column callout" style={{margin: '20px', padding: '40px'}}>
                    <p>
                        {translate("membership_invitation_only") + ' ' + translate("submit_email_to_get_on_waiting_list")}
                    </p>
                    <AddToWaitingList />
                </div>
            </div>;
        }

        return <div className="SignUp">
            <div className="row">
                <div className="column">
                    <h3>{translate("sign_up")}</h3>
                    <p>
                        {translate("we_require_social_account1")}
                        <LocalizedCurrency amount={this.props.signup_bonus} />
                        {translate("we_require_social_account2")}
                        <br />
                        {translate("personal_info_will_be_private")}
                        {' '}
                        <a href={TERMS_OF_SERVICE_URL} target="_blank">
                            {translate("personal_info_will_be_private_link")}
                        </a>.
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <p className="callout alert">
                      {translate('technical_reasons')}
                    </p>
                </div>
            </div>
            {/*
            <div className="row">
                <div className="column large-4 shrink">
                    <SvgImage name="vk" width="64px" height="64px" />
                </div>
                <div className="column large-8">
                    <a href="/connect/vk" className="button SignUp--vk-button">
                        {translate("continue_with_vk")}
                    </a>
                </div>
                &nbsp;
            </div>
            <div className="row">
            </div>
            <div className="row">
                <div className="column large-4 shrink">
                      <SvgImage name="facebook" width="64px" height="64px" />
                </div>
                <div className="column large-8">
                      <a href="/connect/facebook" className="button SignUp--fb-button">{translate("continue_with_facebook")}</a>
                </div>
            </div>
            <div className="row">
              &nbsp;
            </div>
            <div className="row">
                <div className="column large-4 shrink">
                    <SvgImage name="reddit" width="64px" height="64px" />
                </div>
                <div className="column large-8">
                    <a href="/connect/reddit" className="button SignUp--reddit-button">
                        {translate("continue_with_reddit")}
                    </a>
                    <br />
                    <span className="secondary">
                        ({translate("requires_5_or_more_reddit_comment_karma")})
                    </span>
                </div>
            </div>*/}

            {/*<div className="row">
                <div className="column">
                      <br />
                    translate("dont_have_facebook") <br />
                    {this.state.waiting_list ? <AddToWaitingList /> : <a href="#" onClick={() => this.setState({waiting_list: true})}>
                        <strong> {translate("subscribe_to_get_sms_confirm")}.</strong>
                    </a>}
                </div>
            </div>*/}
            <div className="row">
                <div className="column large-4 shrink">
                    <SvgImage name="golos" width="64px" height="64px" />
                </div>
                <div className="column large-8">
                    <a href="/create_account" className="button secondary">{translate("continue_with_email")}</a>
                </div>
            </div>
            <div className="row">
                <div className="column">
                      <br />
                    <p className="secondary">
                        {translate('by_verifying_you_agree_with') + ' '}
                        <a href={PRIVACY_POLICY_URL} target="_blank">
                            {translate('by_verifying_you_agree_with_privacy_policy')}
                        </a>
                        {' ' + translate('by_verifying_you_agree_with_privacy_policy_of_website_APP_URL')}.
                    </p>
                </div>
            </div>
        </div>
    }
}

export default connect(
    state => {
        return {
            signup_bonus: state.offchain.get('signup_bonus'),
            serverBusy: state.offchain.get('serverBusy')
        };
    }
)(SignUp);
