import React, { Component } from 'react';
import PropTypes from 'prop-types';

const Flag = ({ flagged, FlagComponent, Fallback = null, children }) => {
    if (flagged && children) return { ...children };
    else return flagged ? FlagComponent : Fallback;
};

Flag.propTypes = {
    flagged: PropTypes.bool.isRequired,
    FlagComponent: (props, propName, componentName) => {
        // First ensure it is a React element
        PropTypes.checkPropTypes(
            { FlagComponent: PropTypes.element },
            props,
            'FlagComponent',
            'Flag'
        );
        // Also issue a warning if children are also supplied
        if (props[propName] && props.children) {
            return new Error(
                'Supplied both a FlagComponent and children to Flag; rendering children!'
            );
        }
    },
    Fallback: PropTypes.element,
};

export default Flag;
