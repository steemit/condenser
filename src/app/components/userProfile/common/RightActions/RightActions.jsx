import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import is from 'styled-is';
import { Link } from 'react-router';
import { Map } from 'immutable';
import Icon from 'golos-ui/Icon';
import DialogManager from 'app/components/elements/common/DialogManager';
import TransferDialog from 'src/app/components/userProfile/dialogs/TransferDialog';
import SafeDialog from 'src/app/components/userProfile/dialogs/SafeDialog';
import ConvertDialog from 'src/app/components/userProfile/dialogs/ConvertDialog';
import DelegateVestingDialog from 'src/app/components/userProfile/dialogs/DelegateVestingDialog';

const Root = styled.div`
    margin-bottom: 18px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
`;

const Action = styled.div`
    display: ${props => (props.isOwner ? 'flex' : 'none')};
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

    ${is('last')`
        border-bottom: none;
    `} &:hover {
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

class RightActions extends PureComponent {
    render() {
        const { isOwner } = this.props;

        return (
            <Root>
                <Link to="/market">
                    <Action isOwner={isOwner}>
                        <ActionIcon name="wallet" />
                        <ActionTitle>Купить или продать</ActionTitle>
                    </Action>
                </Link>
                <Action onClick={this._onTransferClick} isOwner={true}>
                    <ActionIcon name="coins" />
                    <ActionTitle>Передать</ActionTitle>
                </Action>
                <Action onClick={this._onSafeClick} isOwner={isOwner}>
                    <ActionIcon name="locked" />
                    <ActionTitle>Вывести/перевести в сейф</ActionTitle>
                </Action>
                <Action onClick={this._onDelegateClick} isOwner={true}>
                    <ActionIcon name="voice" />
                    <ActionTitle>Делегировать Силу Голоса</ActionTitle>
                </Action>
                <Action last onClick={this._onConvertClick} isOwner={isOwner}>
                    <ActionIcon name="refresh" />
                    <ActionTitle>Конвертировать</ActionTitle>
                </Action>
            </Root>
        );
    }

    _onTransferClick = () => {
        DialogManager.showDialog({
            component: TransferDialog,
            props: {
                pageAccountName: this.props.pageAccountName,
            },
        });
    };

    _onSafeClick = () => {
        DialogManager.showDialog({
            component: SafeDialog,
        });
    };

    _onConvertClick = () => {
        DialogManager.showDialog({
            component: ConvertDialog,
        });
    };

    _onDelegateClick = () => {
        DialogManager.showDialog({
            component: DelegateVestingDialog,
            props: {
                pageAccountName: this.props.pageAccountName,
            },
        });
    };
}

const mapStateToProps = (state, props) => {
    const currentUser = state.user.get('current') || Map();
    const isOwner = currentUser.get('username') === props.pageAccountName.toLowerCase();
    return {
        isOwner,
    };
};

export default connect(mapStateToProps)(RightActions);
