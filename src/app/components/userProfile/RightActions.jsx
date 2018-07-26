import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Icon from 'golos-ui/Icon';
import DialogManager from 'app/components/elements/common/DialogManager';
import TransferDialog from './dialogs/TransferDialog/TransferDialog';

const Root = styled.div`
    margin-bottom: 18px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
`;

const Action = styled.div`
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 20px;
    box-sizing: content-box;
    border-bottom: 1px solid #e9e9e9;
    font-size: 12px;
    font-weight: 500;
    color: #393636;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
    user-select: none;
    transition: color 0.15s;
    cursor: pointer;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        color: #000;
    }
`;

const ActionIcon = Icon.extend`
    width: 20px;
    height: 20px;
    margin-right: 10px;
    flex-shrink: 0;
`;

const ActionTitle = styled.div`
    letter-spacing: 0.5px;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export default class RightActions extends PureComponent {
    render() {
        return (
            <Root>
                <Action>
                    <ActionIcon name="wallet" />
                    <ActionTitle>Купить или продать</ActionTitle>
                </Action>
                <Action onClick={this._onTransferClick}>
                    <ActionIcon name="coins" />
                    <ActionTitle>Передать</ActionTitle>
                </Action>
                <Action>
                    <ActionIcon name="locked" />
                    <ActionTitle>Вывести/перевести в сейф</ActionTitle>
                </Action>
                <Action>
                    <ActionIcon name="voice" />
                    <ActionTitle>Делегировать/уменьшить СГ</ActionTitle>
                </Action>
                <Action>
                    <ActionIcon name="refresh" />
                    <ActionTitle>Конвертировать</ActionTitle>
                </Action>
            </Root>
        );
    }

    _onTransferClick = () => {
        DialogManager.showDialog({
            component: TransferDialog,
        });
    };
}
