import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

if (process.env.BROWSER) {
    const files = require.context('!svg-sprite-loader!./assets', false, /.*\.svg$/);
    files.keys().forEach(files);
}

const Icon = ({ name, size, height, width, ...props = {} }) => {
    props.height = size || height;
    props.width = size || width;

    return (
        <svg { ...props }>
            <use xlinkHref={`#${name}`} />
        </svg>
    );
};

Icon.propTypes = {
    name: PropTypes.string,
    size: PropTypes.string,
    height: PropTypes.string,
    width: PropTypes.string,
}

Icon.defaultProps = {
    height: '24px',
    width: '24px',
}

const StyledIcon = styled(Icon)``;

export default StyledIcon;