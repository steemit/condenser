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
                <h4 style={{ color: "#4078c0" }}>All set, your email is now
                confirmed.</h4>
                <p>You will receive an email confirmation soon when you can log into
                your shiny new account - usually less than one business day.
                Stay tuned!</p>
            </div>
        } else {
            body = <div>
                <h4 style={{ color: "#4078c0" }}><strong>Your account will be
                active soon!</strong></h4>
                <br />
                <p>Thank you! Please note that you must click the validation
                link in the email we just sent you to finish creating your account.</p>
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
