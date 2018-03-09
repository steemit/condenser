import React from 'react';
import PropTypes from 'prop-types';

const IconButton = ({ icon }) => {
    const icons = {
        pencil: (
            <path
                className="icon-button icon-button__pencil"
                d="M19.5555556,10.7003165 L21.9259259,13.0706869 L22.6627455,12.3338673 C22.910371,12.0862418 22.910371,11.6847616 22.6627455,11.4371361 L21.1891063,9.96349689 C20.9414809,9.71587141 20.5400006,9.71587141 20.2923752,9.96349689 L19.5555556,10.7003165 Z M18.8571429,11.2929091 L11.015873,19.1341789 L9.77777778,22.8484646 L13.0793651,22.0230678 L21.3333333,13.7690995 L20.5079365,12.9437027 L12.6666667,20.7849726 L11.4285714,21.197671 L11.8412698,19.9595757 L19.6825397,12.1183059 L18.8571429,11.2929091 Z"
                id="icon-svg"
            />
        ),
        magnifyingGlass: (
            <path
                className="icon-button icon-button__magnifyingGlass"
                d="M14.3681591,18.5706017 L11.3928571,21.6 L14.3681591,18.5706017 C13.273867,17.6916019 12.5714286,16.3293241 12.5714286,14.8 C12.5714286,12.1490332 14.6820862,10 17.2857143,10 C19.8893424,10 22,12.1490332 22,14.8 C22,17.4509668 19.8893424,19.6 17.2857143,19.6 C16.1841009,19.6 15.1707389,19.215281 14.3681591,18.5706017 Z"
                id="icon-svg"
            />
        ),
    };

    return (
        <svg
            className="icon-button__svg"
            viewBox="0 0 32 32"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g>
                <circle
                    className="icon-button icon-button__border"
                    cx="16"
                    cy="16"
                    r="15"
                />
                {icons[icon]}
            </g>
        </svg>
    );
};

IconButton.propTypes = {
    icon: PropTypes.oneOf(['pencil', 'magnifyingGlass']),
};
IconButton.defaultProps = {
    icon: 'pencil',
};

export default IconButton;
