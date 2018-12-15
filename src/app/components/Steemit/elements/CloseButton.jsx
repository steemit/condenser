import PropTypes from 'prop-types';
import React from 'react';

const CloseButton = ({ className, ...restProps }) => {
    return (
        <button {...restProps} className="close-button" type="button">
            &times;
        </button>
    );
};

CloseButton.propTypes = {
    className: PropTypes.string,
};

export default CloseButton;
