import React from 'react';
import styled from 'styled-components';

const Label = styled.label`
    display: block;
`;

export default function Checkbox(props) {
    return (
        <Label>
            <input
                type="checkbox"
                checked={props.checked}
                onChange={() => props.onChange(!props.checked)}
            />
            {' '}
            {props.title}
        </Label>
    );
}
