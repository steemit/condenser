import React from 'react';

export default ({value}) => {
    if (!value) return null;
    return <span className="Reputation" title="Reputation">{value}</span>;
}
