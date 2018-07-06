import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Flex from 'golos-ui/Flex';

const Card = styled.div`
    display: flex;
    flex-direction: column;

    border-radius: 6px;
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);

    overflow: hidden;
`;
Card.propTypes = {};
export default Card;

export const CardTitle = Flex.extend`
    display: flex;
    flex: 1;
    align-items: center;

    padding: 0 20px;
    height: 50px;

    color: #333333;
    font-family: ${props => props.theme.fontFamily};
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.78px;
    text-transform: uppercase;

    border-bottom: 1px solid #e9e9e9;

    &:not(:first-child) {
        border-top: 1px solid #e9e9e9;
    }
`;
CardTitle.propTypes = {};
CardTitle.defaultProps = {
    auto: true,
};
