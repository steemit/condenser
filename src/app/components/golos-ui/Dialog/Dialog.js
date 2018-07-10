import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';

import Card from 'golos-ui/Card';

const Wrapper = Card.extend`
    min-width: 460px;
    max-width: 100%;
`;

const DialogHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 10px;
    height: 70px;
    font-size: 18px;
    font-weight: 500;
`;

const DialogContent = styled.div`
    padding: 10px 30px 28px;
    line-height: 1.5em;
    color: #666;
`;

const DialogFooter = styled.div`
    display: flex;
    height: 50px;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 0px 15px 0 rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const DialogButton = styled.button`
    position: relative;
    flex: 1;

    /* font-size: 15px; */

    font-family: Roboto;
    font-size: 12px;
    font-weight: bold;
    line-height: 1;
    letter-spacing: 1.4px;
    text-align: center;
    color: #b7b7ba;

    border-radius: 0;
    cursor: pointer;
    outline: none;

    :not(:last-child) {
        margin-right: -1px;

        &::after {
            content: '';
            position: absolute;
            top: 7px;
            bottom: 7px;
            right: 0;
            width: 1px;
            background: #f3f3f3;
        }
    }

    &:hover,
    &:focus {
        background: #fafafa;
    }

    ${is('primary')`
        color: #2879ff;

        &:hover,
        &:focus {
          background: #ddebff;
        }
    `} 
    
    ${is('warning')`
        color: #ff4641;

        &:hover,
        &:focus {
          background: #ffe3dd;
        }
    `};
`;

const Dialog = () => {
    return (
        <Wrapper>
            <DialogHeader>Header</DialogHeader>
            <DialogContent>Content</DialogContent>
            <DialogFooter>
                <DialogButton>Cancel</DialogButton>
                <DialogButton primary>OK</DialogButton>
            </DialogFooter>
        </Wrapper>
    );
};

Dialog.propTypes = {};

export default Dialog;

// .Dialog {
//   &__close {
//     position: absolute;
//     right: 8px;
//     top: 8px;
//     width: 30px;
//     height: 30px;
//     padding-top: 7px;
//     text-align: center;
//     color: #e1e1e1;
//     cursor: pointer;
//     transition: color 0.1s;

//     &:hover {
//       color: #000;
//     }

//     & > svg {
//       width: 14px;
//       height: 14px;
//     }
//   }
