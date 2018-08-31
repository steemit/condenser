import React from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import is from 'styled-is';
import Icon from 'golos-ui/Icon';

const ReplyCounterBlock = styled.div`
    height: 100%;
    min-height: 50px;
    padding: 0 11px 0 18px;
    display: flex;
    align-items: center;
    flex-grow: 1;
    justify-content: flex-end;
`;

const ReplyCount = styled.div`
    font-size: 16px;
    font-weight: 500;
    color: #959595;
    cursor: default;
    user-select: none;
`;

const Splitter = styled.div`
    width: 1px;
    height: 26px;
    background: #e1e1e1;
`;

const ReplyLink = styled(Link)`
    height: 100%;
    min-height: 50px;
    padding: 0 18px 0 7px;
    display: flex;
    align-items: center;
    flex-grow: 1;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #393636 !important;
`;

const ReplyIcon = styled(Icon)`
    width: 20px;
    height: 20px;
    margin-right: 7px;
    margin-bottom: -2px;
`;

const Root = styled.div`
    display: flex;
    align-items: center;

    ${is('grid')`
        width: 100%;
        height: 56px;
        justify-content: center;
        border-top: 1px solid #e9e9e9;
    `};

    ${is('whiteTheme')`
        color: #fff;
        border-top-color: rgba(255, 255, 255, 0.3);
        
        ${ReplyCount} {
            color: #fff;
        }
        
        ${ReplyLink} {
            color: #fff !important;
        }
        
        ${Splitter} {
            height: 12px;
            background: #fff;
        }
    `};
`;

export default function ReplyBlock({ withImage, grid, count, link, text, className }) {
    return (
        <Root whiteTheme={withImage} grid={grid} className={className}>
            <ReplyCounterBlock data-tooltip="Количество комментариев">
                <ReplyIcon name="reply" />
                <ReplyCount>{count}</ReplyCount>
            </ReplyCounterBlock>
            <Splitter />
            <ReplyLink to={`${link}#comments`} whiteTheme={withImage}>
                {text}
            </ReplyLink>
        </Root>
    );
}
