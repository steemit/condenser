import React from 'react';
import tt from 'counterpart';

export default ({ value }) => {
    if (isNaN(value)) {
        console.log('Unexpected rep value:', value);
        return null;
    }
    return (
        <span className="Reputation" title={tt('g.reputation')}>
            ({value})
        </span>
    );
};
