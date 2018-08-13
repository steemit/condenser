import styled from 'styled-components';
import is from 'styled-is';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import React from 'react';

const Root = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(155, 155, 155, 0.2);
    opacity: 0;
    animation: fade-in 0.5s forwards;
    animation-delay: 0.2s;
    z-index: 1;

    ${is('light')`
        background: rgba(255, 255, 255, 0.09);
    `};
`;

export default function SplashLoader(props) {
    return (
        <Root {...props}>
            <LoadingIndicator type="circle" size={60} />
        </Root>
    );
};
