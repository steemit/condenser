import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { darken } from 'polished';

const Button = styled.button`
  display: inline-flex;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;

  height: 34px;
  border-radius: 100px;

  margin: 0;
  padding: 0 12px;
  border: 0;
  outline: none;

  color: #fff;
  background: #2879FF;

  font-family: ${props => props.theme.fontFamilyBold};
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  text-overflow: ellipsis;
  text-decoration: none;
  text-transform: uppercase;
  line-height: 1;
  letter-spacing: 1.4px;
  white-space: nowrap;

  cursor: pointer;

  &::-moz-focus-inner {
    padding: 0;
    border: 0;
  }

  &:hover {
    background: ${darken(0.05, '#2879FF')};
  }

  svg {
    margin-right: 6px;
  }

  &:disabled {
    opacity: 0.8;
    cursor: default;
  }

  ${props =>
      props.auto &&
      `
    width: 100%;
  `}

  ${props =>
      props.light &&
      `
    color: #393636;
    background: #fff;
    border: 1px solid rgba(57,54,54,0.30);
    &:hover {
      background: #fff;
      border: 1px solid ${darken(0.05, 'rgba(57,54,54,0.30)')};
    }
  `}
`;

Button.propTypes = {
    type: PropTypes.string,
    auto: PropTypes.bool,
    light: PropTypes.bool,
};

Button.defaultProps = {
    type: 'button',
};

export default Button;
