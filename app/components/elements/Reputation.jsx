import React from 'react';

export default ({value}) => {
    if (isNaN(value)) {
        console.log("Unexpected rep value:", value);
        return null;
    }
    return <span className="Reputation" title="Reputation">{value}</span>;
}
