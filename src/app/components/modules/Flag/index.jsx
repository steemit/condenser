import React from 'react';
const Flag = (Component, Fallback = null) => ({ flag, ...props }) => {
    const opts = {
        true: <Component {...props} />,
        false: <Fallback {...props} />,
    };
    return opts[flag];
};

export default Flag;
