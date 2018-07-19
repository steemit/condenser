import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

if (process.env.BROWSER) {
    const files = require.context('!svg-sprite-loader!./assets', false, /.*\.svg$/);
    files.keys().forEach(files);
}

const Icon = ({ name, size, height, width, ...props = {} }) => {
    props.height = `${size || height}px`;
    props.width = `${size || width}px`;

    return (
        <svg { ...props }>
            <use xlinkHref={`#${name}`} />
        </svg>
    );
};

Icon.propTypes = {
    name: PropTypes.string,
    size: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    height: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    width: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
}

Icon.defaultProps = {
    height: '24',
    width: '24',
}

const StyledIcon = styled(Icon)``;

export default StyledIcon;