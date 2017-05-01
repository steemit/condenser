import React from 'react';
import {connect} from 'react-redux';

class Approval extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirm: false
        }
    }

    componentWillMount() {
        if (this.props.location.query.confirm) {
            this.setState({confirm: true});
        }
    }

    render() {
        let body = '';
        if (this.state.confirm) {
            body = <div>
                <h4 style={{ color: "#4078c0" }}>All set, your email is now confirmed.</h4>
                <p>Please make sure your <strong>password is backed up</strong> and safely secure.</p>
                <p>You will receive a final email confirmation when you can log into your new account.</p>
            </div>
        } else {
            body = <div>
                <h4 style={{ color: "#4078c0" }}><strong>You've been added to the wait list and pending approval.</strong></h4>
                <br />
                <p><strong>You must validate your email</strong> as the final step. Please click the confirmation link in your welcome email.</p>
            </div>
        }
        return (
            <div className="row">
                <div className="column" style={{maxWidth: '36rem', margin: '0 auto'}}>
                    <div>
                        {body}
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'approval',
    component: connect(
        state => {
            return {

            }
        },
        dispatch => ({
        })
    )(Approval)
};
