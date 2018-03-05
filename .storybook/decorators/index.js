import React from 'react';

const container = {
    display: 'table',
    position: 'absolute',
    height: '100%',
    width: '100%',
};

const middle = {
    display: 'table-cell',
    verticalAlign: 'middle',
};

const center = {
    marginLeft: 'auto',
    marginRight: 'auto',
    //border: 'solid black',
    width: '300px',
};

export const Center = (storyFn) => (
    <div style={container}>
        <div style={middle}>
            <div style={center}>{storyFn()}</div>
        </div>
    </div>
);
