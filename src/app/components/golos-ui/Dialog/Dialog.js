import styled from 'styled-components';
import is from 'styled-is';

import Card from 'golos-ui/Card';

export const Dialog = styled(Card)`
    flex-basis: 576px;
    max-width: 100%;
`;
Dialog.displayName = 'Dialog';

export const DialogHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

    padding-top: 10px;
    height: 70px;

    font-size: 18px;
    font-weight: 500;
`;

export const DialogContent = styled.div`
    padding: 10px 30px 18px;
    line-height: 1.5em;
    color: #666;
`;

export const DialogFooter = styled.div`
    display: flex;
    height: 50px;

    border-radius: 0 0 8px 8px;
    box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.1);
    background-color: #ffffff;

    margin-top: 10px;
    overflow: hidden;
    z-index: 1;

    @media (max-width: 576px) {
        border-radius: 0;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
    }
`;

export const DialogButton = styled.button`
    position: relative;
    flex: 1;

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

    &:disabled,
    &[disabled]{
        color: rgba(0,0,0,0.3);
        background: rgba(0,0,0,0.03);
        cursor: default;
    }

    ${is('primary')`
        color: #2879ff;

        &:hover,
        &:focus {
          background: #ddebff;
        }
    `} ${is('warning')`
        color: #ff4641;

        &:hover,
        &:focus {
          background: #ffe3dd;
        }
    `};
`;
