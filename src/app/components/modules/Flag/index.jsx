import React, { Component } from 'react';

const Flag = ({ flagged, FlagComponent, Fallback = null, children }) => {
    if (flagged && children) return { ...children };
    else return flagged ? FlagComponent : Fallback;
};

export default Flag;