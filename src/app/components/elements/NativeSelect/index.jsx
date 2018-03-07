import React from 'react';
import PropTypes from 'prop-types';

const NativeSelect = ({ options, className, currentlySelected, onChange }) => {
    const handleChange = event => {
        onChange(event.target);
    };

    const opts = options.map(val => {
        return (
            <option key={val.name + val.label} value={val.value}>
                {val.label}
            </option>
        );
    });

    return (
        <select
            onChange={handleChange}
            className={`nativeSelect ${className}`}
            value={currentlySelected}
        >
            {opts}
        </select>
    );
};

NativeSelect.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            label: PropTypes.string,
            link: PropTypes.string,
        })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    currentlySelected: PropTypes.string.isRequired,
};
NativeSelect.defaultProps = {
    className: '',
};

export default NativeSelect;
