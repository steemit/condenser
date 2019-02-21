import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { VIEW_MODE_WHISTLE, WHISTLE_SIGNUP_COMPLETE } from 'shared/constants';

import knowledgr from 'assets/images/static/knowledgr.png';

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
    if (this.state.confirm_email) {
      body = (
        <div className="Description">
          <h4>Thanks for confirming your email!</h4>
          <p>
            After validating your sign up request with us we{"'"}ll look it over
            for approval. As soon as your turn is up and you{"'"}re approved,
            you{"'"}ll be sent a link to finalize your account!
          </p>
          <p>
            You{"'"}ll be among the earliest members of the Knowledgr community!
          </p>
        </div>
      );
    } else {
      body = (
        <div className="Description">
          <h4>Thanks for confirming your phone number!</h4>
          <p>
            You{"'"}re a few steps away from getting to the top of the list.
            Check your email and click the email validation link.
          </p>
          <p>
            After validating your sign up request with us we{"'"}ll look it over
            for approval. As soon as your turn is up and you{"'"}re approved,
            you{"'"}ll be sent a link to finalize your account!
          </p>
          <p>
            You{"'"}ll be among the earliest members of the Knowledgr community!
          </p>
          <div className="login-link">
            <Link to="/login.html">Get into Knowledgr</Link>
          </div>
        </div>
      );
    }
    return (
      <div className="AuthWrapper">
        <div className="Left">
          <div className="AuthForm">{body}</div>
        </div>
        <div className="Right">
          <img className="Knowledgr" src={knowledgr} alt="Knowledgr Logo" />
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
    }
    // dispatch => ({})
  )(Approval),
};
