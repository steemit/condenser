import React from 'react';
import PropTypes from 'prop-types';

const SteemLogo = () => {
    return (
        <span className="logo">
            <svg width="89" height="40" viewBox="0 0 89 40" version="1.1">
                <title>vit.tube logo</title>
                <g id="vittube">
                    <path
                        className="logo__diamond"
                        d="M 6.2981159,21.624418 16.306193,1.290311 26.314271,20.645154 16.306193,40 Z"
                        id="path4560"
                    />
                    <path
                        className="logo__diamond"
                        d="M 48.780727,31.612912 39.323121,8.387075 H 43.85281 L 50.124964,24.065823 56.819613,8.387117 H 61.16223 L 51.04226,31.612912 Z"
                        id="path4558"
                    />
                    <path
                        className="logo__diamond"
                        d="M 63.725558,8.3871 H 67.59653 V 31.612912 H 63.725558 Z"
                        id="path4556"
                    />
                    <path
                        className="logo__diamond"
                        d="m 77.273953,12.258069 -7.015312,-0.02097 -0.08146,-3.849886 h 18.70968 v 3.870969 h -7.741944 v 19.354843 h -3.870959 z"
                        id="path4554"
                    />
                    <path
                        className="logo__sides"
                        d="M 0,10.004706 5.0302695,0 13.443697,6.98e-4 4.5411863,19.012521 Z"
                        id="path4552"
                    />
                    <path
                        className="logo__sides"
                        d="m 18.942524,0.027683 8.639594,-0.02767 5.030267,10.004706 -4.56576,8.704976 z"
                        id="path21"
                    />
                </g>
            </svg>
            <span className="logo__steemit" />
        </span>
    );
};

export default SteemLogo;
