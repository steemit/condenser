import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';
import Icon from 'golos-ui/Icon';
import { vestsToSteem } from 'app/utils/StateFunctions';

const Root = styled.div`
    height: 263px;
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
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-right: 4px;
    border-radius: 100px;
    font-size: 14px;
    background: transparent;
    color: #333;
    cursor: pointer;
    transition: color 0.15s, background-color 0.15s;

    &:last-child {
        margin-right: 0;
    }

    &:hover {
        color: #fff;
        background: ${props => props.red ? '#fc544e' : '#3684ff'};
        //background: #fb150d;
    }
`;

const ActionIcon = Icon.extend``;

export default class DelegationsList extends PureComponent {
    propTypes = {
        globalProps: PropTypes.object.isRequired,
        data: PropTypes.array.isRequired,
        onEditClick: PropTypes.func.isRequired,
        onCancelClick: PropTypes.func.isRequired,
    };

    render() {
        const { globalProps, data } = this.props;

        return (
            <Root>
                <DelegationsHeader>
                    <Delegatee>Кому</Delegatee>
                    <Value>Силы Голоса</Value>
                    <Action>Действия</Action>
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
                            <ActionButton
                                data-tooltip="Изменить"
                                onClick={() => this.props.onEditClick(info.delegatee)}
                            >
                                <ActionIcon name="pen" size={14} />
                            </ActionButton>
                            <ActionButton
                                red
                                data-tooltip="Отозвать"
                                onClick={() => this.props.onCancelClick(info.delegatee)}
                            >
                                <ActionIcon name="cross" size={12} />
                            </ActionButton>
                        </Action>
                    </DelegationLine>
                ))}
            </Root>
        );
    }

    _onLinkClick = () => {
        this.props.onClose();
    };
}
