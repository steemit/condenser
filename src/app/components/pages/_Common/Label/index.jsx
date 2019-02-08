import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Label extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labels: props.label.split(','),
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      labels: newProps.label.split(','),
    });
  }

  render() {
    const { labels } = this.state;

    return (
      <div className="LabelWrapper">
        {labels.map((label, index) => (
          <div className="Label" key={`${index}-${label}`}>
            {label}
          </div>
        ))}
      </div>
    );
  }
}

Label.propTypes = {
  label: PropTypes.string.isRequired,
};

export default Label;
