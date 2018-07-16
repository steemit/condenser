import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';

import Flex from 'golos-ui/Flex';

const Card = styled(Flex)`
    position: relative;
    flex-shrink: 0;
    max-width: 100%;

    border-radius: 6px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
    background-color: #ffffff;

    overflow: hidden;

    ${is('transparent')`
        background-color: transparent;
    `} @media (max-width: 576px) {
        border-radius: 0;
        box-shadow: none;
        background-color: transparent;
    }
`;
Card.defaultProps = {
    column: true
}
export default Card;

export const CardTitle = styled(Flex)`
    align-items: center;

    padding: 0 20px;
    height: 50px;

    color: #333333;
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.78px;
    text-transform: uppercase;

    border-bottom: 1px solid #e9e9e9;

    &:not(:first-child) {
        border-top: 1px solid #e9e9e9;
    }
`;

export const CardRow = styled(Flex)`
    @media (max-width: 576px) {
        flex-direction: column;
    }
`;
CardRow.defaultProps = {
    auto: true,
};

export const CardColumn = styled(Flex)`
    position: relative;
    background-color: #ffffff;
    flex: 1;
    overflow: hidden;

    @media (min-width: 576px) {
        &:not(:last-child) {
            margin-right: -1px;

            &::after {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                right: 0;
                width: 1px;
                background: #f3f3f3;
                z-index: 1;
            }
        }
    }

    @media (max-width: 576px) {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
        margin-bottom: 10px;
    }
`;
CardColumn.defaultProps = {
    column: true,
};
