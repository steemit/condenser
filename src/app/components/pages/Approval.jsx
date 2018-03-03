import React from 'react';
import { connect } from 'react-redux';
import { VIEW_MODE_WHISTLE, WHISTLE_SIGNUP_COMPLETE } from 'shared/constants';
import tt from 'counterpart';

class Approval extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirm_email: false,
        };
    }

    componentWillMount() {
        if (this.props.location.query.confirm_email) {
            this.setState({ confirm_email: true });
        }
    }

    render() {
        if (process.env.BROWSER && this.props.viewMode === VIEW_MODE_WHISTLE) {
            window.postMessage(WHISTLE_SIGNUP_COMPLETE);
        }
        let body = '';
        if (this.state.confirm_email && false) {
            body = (
                <div>
                    <h4>
                        {tt('approval_jsx.thanks_for_confirming_your_email')}
                    </h4>
                    <p>
                        {tt(
                            'approval_jsx.after_validating_signup_look_for_approval'
                        )}
                    </p>
                    <p>
                        {tt('approval_jsx.youll_be_among_the_earliest_members')}
                    </p>
                </div>
            );
        } else {
            body = (
                <div>
                    <h4>
                        {tt(
                            'approval_jsx.thanks_for_confirming_your_phone_number'
                        )}
                    </h4>
                    <p>{tt('approval_jsx.your_a_few_steps_away')}</p>
                    <p>
                        {tt(
                            'approval_jsx.after_validating_signup_look_for_approval'
                        )}
                    </p>
                    <p>
                        {tt('approval_jsx.youll_be_among_the_earliest_members')}
                    </p>
                </div>
            );
        }
        return (
            <div className="row">
                <div
                    className="column"
                    style={{ maxWidth: '36rem', margin: '0 auto' }}
                >
                    <div>{body}</div>
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
                viewMode: state.app.get('viewMode'),
            };
        },
        dispatch => ({})
    )(Approval),
};
