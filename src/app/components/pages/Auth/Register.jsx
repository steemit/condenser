import React, { Component } from 'react';
// import { Link } from 'react-router';

import Input from 'app/components/pages/_Common/Input';

import knowledr from 'assets/images/static/knowledr.png';

const formFields = [
  {
    key: 'firstName',
    label: 'First Name',
    placeholder: 'John',
  },
  {
    key: 'lastName',
    label: 'Last Name',
    placeholder: 'Smith',
  },
  {
    key: 'email',
    label: 'Email Address',
    placeholder: 'john.smith@mail.com',
  },
  {
    key: 'password',
    label: 'Password',
    type: 'password',
  },
  {
    key: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
  },
];

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
    };
  }

  onInputChange(field) {
    return e => {
      this.setState({
        [field]:
          e.target.type === 'checkbox' ? e.target.checked : e.target.value,
      });
    };
  }

  render() {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      rememberMe,
    } = this.state;

    return (
      <div className="AuthWrapper">
        <div className="Left">
          <div className="AuthForm">
            <div className="Title">
              We are <span>Knowledr</span>
            </div>
            <div className="Description">Welcome, let us introduce!</div>
            <form>
              {formFields.map(field => (
                <Input
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  type={field.type}
                  value={this.state[field.key]}
                  onChange={this.onInputChange(field.key)}
                />
              ))}
            </form>
            <div className="Extra">
              <div className="RememberMe">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  className="css-checkbox"
                  checked={rememberMe}
                  onChange={this.onInputChange('rememberMe')}
                />
                <label htmlFor="rememberMe" className="css-label">
                  Remember Me
                </label>
              </div>
              <div className="ForgetPassword">Forget Password?</div>
            </div>
            <div className="Buttons">
              <button className="Black" type="submit">
                Sign Up
              </button>
              <a className="Button" href="/login.html">
                Log In
              </a>
            </div>
          </div>
        </div>
        <div className="Right">
          <img className="Knowledr" src={knowledr} alt="Knowledr Logo" />
        </div>
      </div>
    );
  }
}

Register.defaultProps = {
  refCode: null,
};

Register.propTypes = {
  // refCode: PropTypes.string,
};

module.exports = {
  path: '/register',
  component: Register,
};
