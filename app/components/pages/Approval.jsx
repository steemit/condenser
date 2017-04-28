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
                <p><strong>All set. Your email is now confirmed.</strong></p>
                <p>Please make sure your password is backed up and safely secure.</p>
                <p>You will receive an email confirmation when you can log into your new account.</p>
            </div>
        } else {
            body = <div>
                <p><strong>You've been added to the wait list and pending approval</strong> Please validate your email by clicking the link in your welcome email.</p>
                <p>You will receive an email confirmation when you can log into your new account.</p>
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
