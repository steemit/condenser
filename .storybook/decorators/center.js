import React from 'react';

const center = {
    display: 'flex',
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
};

export const Center = story => <div style={center}>{story()}</div>;
