import React from 'react';
import PropTypes from 'prop-types';

const SteemLogo = () => {
    return (
        <span className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" version="1.1">
                <title>vit.tube logo</title>
                <g id="vittube">
                    <path
                        className="logo__lefthalftop"
                        d="M25.73 29.96L31.47 20L19.99 20L8.51 20L14.25 29.96L19.99 39.93L25.73 29.96Z"
                    />
                    <path
                        className="logo__righthalftop"
                        d="M25.73 10.04L31.47 20.01L19.99 20.01L8.51 20.01L14.25 10.04L19.99 0.08L25.73 10.04Z"
                    />
                    <path
                        className="logo__uptri"
                        d="M1.17 10.22L7.03 0.22L18.42 0.13L7.23 19.66L1.17 10.22Z"
                    />
                    <path
                        className="logo__downtri"
                        d="M38.72 10.18L32.86 0.17L21.47 0.08L32.66 19.61L38.72 10.18Z"
                    />
                </g>
            </svg>
            <span className="logo__steemit" />
        </span>
    );
};

export default SteemLogo;
