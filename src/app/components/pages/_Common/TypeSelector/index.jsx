import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TypeSelector extends Component {
  render() {
    const { label, types, value, onChange } = this.props;
    return (
      <div className="TypeSelectorWrapper">
        <div className="Label">{label}</div>
        <div className="Types">
          {types.map(type => (
            <div
              role="button"
              className={`Type ${value === type.type ? 'Active' : ''}`}
              onClick={() => onChange(type.type)}
              key={type.type}
            >
              {type.render()}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

TypeSelector.propTypes = {
  label: PropTypes.string.isRequired,
  types: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TypeSelector;
