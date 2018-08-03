import React, { PureComponent } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import Icon from 'golos-ui/Icon';
import { vestsToSteem } from 'app/utils/StateFunctions';

const Root = styled.div`
    height: 240px;
`;

const DelegationLine = styled.div`
    display: flex;
    align-items: center;
    padding: 4px 0;
`;

const DelegationsHeader = DelegationLine.extend`
    font-weight: bold;
`;

const Delegatee = styled.div`
    min-width: 200px;
    flex-basis: 200px;
    flex-grow: 2;
    margin-right: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Value = styled.div`
    margin-right: 12px;
    flex-basis: 150px;
    flex-grow: 1;
    text-align: right;
`;

const Action = styled.div`
    flex-basis: 120px;
    flex-grow: 0;
    flex-shrink: 0;
    text-align: right;
`;

const ActionButton = styled.button`
    display: inline-flex;
    align-items: center;
    height: 28px;
    border-radius: 100px;
    padding: 0 10px;
    font-size: 14px;
    color: #fff;
    background: #fc544e;
    cursor: pointer;

    &:hover {
        background: #fb150d;
    }
`;

const CancelIcon = Icon.extend`
    margin-right: 6px;
    color: #fff;
    font-weight: 500;
`;

export default class DelegationsList extends PureComponent {
    render() {
        const { globalProps, data } = this.props;

        return (
            <Root>
                <DelegationsHeader>
                    <Delegatee>Кому</Delegatee>
                    <Value>Силы Голоса</Value>
                    <Action>Действие</Action>
                </DelegationsHeader>
                {data.map(info => (
                    <DelegationLine key={info.id}>
                        <Delegatee>
                            <Link to={'@' + info.delegatee} onClick={this._onLinkClick}>
                                {info.delegatee}
                            </Link>
                        </Delegatee>
                        <Value>
                            {vestsToSteem(info.vesting_shares, globalProps)}
                            {' GOLOS'}
                        </Value>
                        <Action>
                            <ActionButton onClick={this._onCancelDelegationClick}>
                                <CancelIcon name="cross" size={12} />
                                Отозвать
                            </ActionButton>
                        </Action>
                    </DelegationLine>
                ))}
            </Root>
        );
    }

    _onCancelDelegationClick = () => {
        debugger;
    };

    _onLinkClick = () => {
        this.props.onClose();
    };
}
