import React from 'react';

export const authorNameAndRep = (author, authorRepLog10) => (
    <span>
        <strong>{author}</strong>
        {authorRepLog10 != null && (
            <span style={{ fontWeight: 'normal' }}> ({authorRepLog10})</span>
        )}
    </span>
);
