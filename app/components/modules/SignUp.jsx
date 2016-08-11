import React from 'react';
import {connect} from 'react-redux';
import SvgImage from 'app/components/elements/SvgImage';
import AddToWaitingList from 'app/components/modules/AddToWaitingList';

export default class SignUp extends React.Component {
    constructor() {
        super();
        this.state = {waiting_list: false};
    }
    render() {
        if ($STM_Config.read_only_mode) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>Due to server maintenance we are running in read only mode. We are sorry for the inconvenience.</p></div>
                </div>
            </div>;
        }
        
        if (this.props.serverBusy || $STM_Config.disable_signups) {
            return <div className="row">
                <div className="column callout" style={{margin: '20px', padding: '40px'}}>
                    <p>Membership to Steemit.com is now under invitation only because of unexpectedly high sign up rate.
                        Submit your email to get on the waiting list.</p>
                    <AddToWaitingList />
                </div>
            </div>;
        }

        return <div className="SignUp">
            <div className="row">
                <div className="column">
                    <h3>Sign Up</h3>
                    <p>Steemit funds each account with over $5 worth of Steem Power; to prevent abuse, we
                        require new users to login via social media.<br />
                        Your personal information will be kept <a href="/privacy.html" target="_blank">private</a>.
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="column large-4 shrink">
                    <SvgImage name="facebook" width="64px" height="64px" />
                </div>
                <div className="column large-8">
                    <a href="/connect/facebook" className="button SignUp--fb-button">Continue with Facebook</a>
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
                    <a href="/connect/reddit" className="button SignUp--reddit-button">Continue with Reddit</a>
                    <br /><span className="secondary">(requires positive Reddit comment karma)</span>
                </div>
            </div>
            <div className="row">
                <div className="column">
                      <br />
                    Don't have a Facebook or Reddit account? <br />
                    {this.state.waiting_list ? <AddToWaitingList /> : <a href="#" onClick={() => this.setState({waiting_list: true})}>
                        <strong> Subscribe to get a notification when SMS confirmation is available.</strong>
                    </a>}
                </div>
            </div>
            <div className="row">
                <div className="column">
                      <br />
                    <p className="secondary">By verifying your account you agree to the Steemit <a href="/tos.html" target="_blank">terms and conditions</a>.</p>
                </div>
            </div>
        </div>
    }
}

export default connect(
    state => {
        return {
            serverBusy: state.offchain.get('serverBusy')
        };
    }
)(SignUp);
