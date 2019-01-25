import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Input extends Component {
  render() {
    const { refer, example } = this.props;
    const pp = Object.assign({}, this.props);
    delete pp.refer;
    delete pp.example;

    return (
      <div className="InputWrapper">
        <div className="Label" dangerouslySetInnerHTML={{ __html: pp.label }} />
        {pp.type === 'password' ? (
          <input
            {...pp}
            placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
            ref={refer}
          />
        ) : (
          <input {...pp} ref={refer} />
        )}
        {example || null}
        {pp.children}
      </div>
    );
  }
}

Input.defaultProps = {
  label: '',
  onChange: () => {},
  placeholder: '',
  value: '',
  type: 'text',

  autoComplete: 'on',
  disabled: false,
  refer: '',
  required: true,
};

Input.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,

  autoComplete: PropTypes.string,
  disabled: PropTypes.bool,
  refer: PropTypes.string,
  required: PropTypes.bool,
};

export default Input;
