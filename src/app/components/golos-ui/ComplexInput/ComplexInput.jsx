import React from 'react';
import styled from 'styled-components';
import is from 'styled-is';

const Root = styled.div`
    display: flex;
    position: relative;
    height: 34px;
`;

const ComplexInnerInput = styled.input`
    min-width: 100px;
    height: 100%;
    padding: 0 11px;
    border: 1px solid #e1e1e1;
    outline: none;
    flex-grow: 1;
    flex-shrink: 1;
    font-size: 14px;
    border-radius: 6px 0 0 6px;
`;

const ComplexButton = styled.button`
    position: relative;
    height: 100%;
    padding: 0 8px;
    margin-left: -1px;
    flex-shrink: 0;
    border: 1px solid #e1e1e1;
    border-radius: 0;
    color: #b7b7ba;
    font-size: 13px;
    outline: none;
    cursor: pointer;

    &:last-child {
        border-radius: 0 6px 6px 0;
    }

    ${is('active')`
        border-color: #2879ff;
        color: #2879ff;
        z-index: 1;
    `}
`;

export default props => (
    <Root>
        <ComplexInnerInput placeholder={'Доступно 5.543'} />
        <ComplexButton active>GBG</ComplexButton>
        <ComplexButton>Голос</ComplexButton>
    </Root>
);
