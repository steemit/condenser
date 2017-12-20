import React from 'react';

export default ({ children, className, t }) => {
    return (
        <span title={t} className={className}>
            {children}
        </span>
    );
};
