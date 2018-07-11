import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import Flex from 'golos-ui/Flex';

export const formControlStyles = css`
    position: relative;
    width: 100%;
    height: auto;
    min-height: 34px;

    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 14px;
    line-height: 1;
    color: #363636;

    border: 1px solid #e1e1e1;
    border-radius: 6px;
    box-shadow: none;

    padding: 9px 33px 9px 14px;
    outline: 0;
    -webkit-appearance: inherit;

    &:focus {
        box-shadow: 0 0 3px #e1e1e1;
        transition: box-shadow 0.1s ease-in-out;
        border: 1px solid #e1e1e1;
    }
`;

const labelStyles = css`
    display: flex;
    color: #757575;
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 14px;
    line-height: 1;
    text-transform: initial;
`;

export const Label = styled.label`
    margin-bottom: 10px;
    ${labelStyles};
`;

export const LabelRow = styled.label`
    justify-content: center;
    margin-right: 20px;
    margin-bottom: 0;
    ${labelStyles};
`;

export const Input = styled.input`
    ${formControlStyles};
`;

export const Select = styled.select`
    ${formControlStyles};
`;

export const Textarea = styled.textarea`
    ${formControlStyles};
    line-height: 17px;
`;

export const FormGroup = styled(Flex)`
    :not(:last-child) {
        margin-bottom: 20px;
    }
`;
FormGroup.defaultProps = {
    column: true,
};

export const FormGroupRow = styled(Flex)`
    :not(:last-child) {
        margin-bottom: 20px;
    }

    ${Input} {
        flex: 1;
    }
`;
FormGroupRow.defaultProps = {
    align: 'center',
};
