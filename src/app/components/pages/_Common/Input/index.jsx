import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Input extends Component {
    render() {
        const { label, onChange, placeholder, value, type } = this.props;

        return (
            <div className="InputWrapper">
                <div
                    className="Label"
                    dangerouslySetInnerHTML={{ __html: label }}
                />
                {type === 'password' ? (
                    <input
                        value={value}
                        onChange={onChange}
                        placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                        type={type}
                    />
                ) : (
                    <input
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        type={type}
                    />
                )}
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
};

Input.propTypes = {
    label: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    type: PropTypes.string,
};

export default Input;
