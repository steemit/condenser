import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';

const Root = styled.div`
    display: flex;
    margin-top: 14px;
    border-top: 1px solid #e1e1e1;
    border-bottom: 1px solid #e1e1e1;
    user-select: none;
    
    ${is('mobilecolumn')`
        @media (max-width: 600px) {
            display: block;    
        }
    `}
`;

const TypeButton = styled.div.attrs({ role: 'button' })`
    flex-basis: 100px;
    flex-grow: 1;
    height: 38px;
    line-height: 38px;
    text-align: center;
    border-left: 1px solid #e1e1e1;
    font-size: 15px;
    color: #b7b7ba;
    user-select: none;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:first-child {
        border-left: none;
    }

    ${is('active')`
        color: #333;
    `};
`;

export default class DialogTypeSelect extends PureComponent {
    render() {
        const { buttons } = this.props;

        return (
            <Root mobilecolumn={this.props.mobileColumn}>
                {buttons.map(this._renderButton)}
            </Root>
        );
    }

    _renderButton = btn => {
        const { activeId } = this.props;

        const isActive = btn.id === activeId;

        return (
            <TypeButton
                key={btn.id}
                active={isActive}
                onClick={
                    isActive
                        ? null
                        : () => this.props.onClick(btn.id)
                }
            >
                {btn.title}
            </TypeButton>
        );
    };
}
