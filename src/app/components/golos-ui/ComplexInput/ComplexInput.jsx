import React from 'react';
import styled from 'styled-components';
import is from 'styled-is';

const Root = styled.div`
    display: flex;
    position: relative;
    height: 34px;
`;

const ComplexInnerInput = styled.input`
    flex-grow: 1;
    flex-shrink: 1;
    min-width: 100px;
    height: 100%;
    padding: 0 11px;
    border: 1px solid #e1e1e1;
    border-radius: 6px 0 0 6px;
    outline: none;
    font-size: 14px;
    transition: border-color 0.25s;

    &:focus {
        border-color: #8a8a8a;

        + button,
        + button + button {
            border-color: #8a8a8a;
        }
    }

    ${is('error')`
        border-color: #fc544e !important;
    `}
`;

const ComplexButton = styled.button`
    position: relative;
    height: 100%;
    padding: 0 10px;
    margin-left: -1px;
    flex-shrink: 0;
    border: 1px solid #e1e1e1;
    border-radius: 0;
    color: #b7b7ba;
    font-size: 13px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.25s;

    &:last-child {
        border-radius: 0 6px 6px 0;
    }

    ${is('active')`
        border-color: #2879ff !important;
        color: #2879ff;
        z-index: 1;
    `};
`;

export default props => (
    <Root className={props.className}>
        <ComplexInnerInput {...{ ...props, className: null, activeId: null }} />
        {props.buttons.map(button => (
            <ComplexButton
                key={button.id}
                active={props.activeId === button.id}
                onClick={props.onActiveChange ? () => props.onActiveChange(button.id) : null}
            >
                {button.title}
            </ComplexButton>
        ))}
    </Root>
);
