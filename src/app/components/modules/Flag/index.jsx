import React, { Component } from 'react';

const Flag = ({ flagged, FlagComponent, Fallback = null, children }) => {
    if (flagged && children) return { ...children };
    else return flagged ? FlagComponent : Fallback;
};

Flag.propTypes = {
    flagged: React.PropTypes.bool.isRequired,
    FlagComponent: (props, propName, componentName) => {
        // First ensure it is a React element
        React.PropTypes.checkPropTypes(
            { FlagComponent: React.PropTypes.element },
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
    Fallback: React.PropTypes.element,
};

export default Flag;
