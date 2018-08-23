import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';
import Icon from 'golos-ui/Icon';
import { vestsToGolos } from 'app/utils/StateFunctions';

const Root = styled.div``;

const DelegationLines = styled.div`
    overflow-y: auto;
    height: 230px;
    margin-bottom: 1px;
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
    transition: color 0.15s, background-color 0.25s;

    &:last-child {
        margin-right: 0;
    }

    &:hover {
        color: #fff;
        background: ${props => (props.red ? '#fc544e' : '#3684ff')};
    }
`;

const EmptyList = styled.div`
    height: 264px;
    padding-top: 20px;
    text-align: center;
    font-weight: 500;
    font-size: 20px;
    color: #999;
`;

export default class DelegationsList extends PureComponent {
    static propTypes = {
        globalProps: PropTypes.object.isRequired,
        data: PropTypes.array.isRequired,
        onEditClick: PropTypes.func.isRequired,
        onCancelClick: PropTypes.func.isRequired,
    };

    render() {
        const { data, globalProps } = this.props;

        return (
            <Root>
                {data.length ? (
                    <Fragment>
                        <DelegationsHeader>
                            <Delegatee>Кому</Delegatee>
                            <Value>Силы Голоса</Value>
                            <Action>Действия</Action>
                        </DelegationsHeader>
                        <DelegationLines>
                            {data.map(info => (
                                <DelegationLine key={info.id}>
                                    <Delegatee>
                                        <Link to={'@' + info.delegatee} onClick={this._onLinkClick}>
                                            {info.delegatee}
                                        </Link>
                                    </Delegatee>
                                    <Value>
                                        {vestsToGolos(info.vesting_shares, globalProps)}
                                        {' GOLOS'}
                                    </Value>
                                    <Action>
                                        <ActionButton
                                            data-tooltip="Изменить"
                                            onClick={() => this.props.onEditClick(info.delegatee)}
                                        >
                                            <Icon name="pen" size={14} />
                                        </ActionButton>
                                        <ActionButton
                                            red
                                            data-tooltip="Отозвать"
                                            onClick={() => this.props.onCancelClick(info.delegatee)}
                                        >
                                            <Icon name="cross" size={12} />
                                        </ActionButton>
                                    </Action>
                                </DelegationLine>
                            ))}
                        </DelegationLines>
                    </Fragment>
                ) : (
                    <EmptyList>Список пуст</EmptyList>
                )}
            </Root>
        );
    }

    _onLinkClick = () => {
        this.props.onClose();
    };
}
