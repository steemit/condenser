import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import styled from 'styled-components';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Card, { CardContent } from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';
import Icon from 'golos-ui/Icon';
import { last } from 'ramda';

const MAIN_TABS = {
    TRANSACTIONS: 'TRANSACTIONS',
    POWER: 'POWER',
    REWARDS: 'REWARDS',
};

const CURRENCY = {
    ALL: 'ALL',
    GOLOS: 'GOLOS',
    GBG: 'GBG',
    SAFE: 'SAFE',
};

const CURRENCY_TRANSLATE = {
    GOLOS: 'Голос',
    GBG: 'Золото',
};

const CURRENCY_COLOR = {
    GOLOS: '#2879ff',
    GBG: '#ffb839',
    SAFE: '#583652',
};

const DIRECTION = {
    ALL: 'ALL',
    SENT: 'SENT',
    RECEIVE: 'RECEIVE',
};

const MONTHS = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
];

const CardContentStyled = styled(CardContent)`
    display: block;
    padding: 0;
`;

const TabsContent = styled.div``;

const Content = styled.div`
    font-family: Roboto, sans-serif;
`;

const Lines = styled.div``;

const LineWrapper = styled.div`
    &:nth-child(even) {
        background: #f8f8f8;
    }
`;

const Line = styled.div`
    display: flex;
    align-items: center;
    height: 80px;
    padding: 0 20px;
`;

const LineIcon = styled(Icon)`
    flex-shrink: 0;
    width: 24px;
    margin-right: 16px;
    color: ${props => props.color || '#b7b7ba'};
`;

const Who = styled.div`
    flex-grow: 1;
    flex-basis: 10px;
    overflow: hidden;
`;

const WhoName = styled.div``;

const WhoTitle = styled.div``;

const WhoLink = styled(Link)`
    color: #333;
`;

const TimeStamp = styled.div`
    font-size: 12px;
    color: #959595;
`;

const Memo = styled.div`
    flex-shrink: 0;
    width: 24px;
    margin-right: 12px;
`;

const MemoIcon = styled(Icon)`
    display: block;
    color: #333;
    transition: color 0.15s;

    &:hover {
        color: #2879ff;
    }
`;

const DataLink = styled(Link)`
    flex-grow: 1;
    flex-basis: 10px;
    max-height: 40px;
    margin-right: 8px;
    line-height: 1.3em;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Value = styled.div`
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    align-items: flex-end;
    width: 80px;
`;

const Amount = styled.div`
    line-height: 24px;
    font-size: 20px;
    font-weight: bold;
    color: ${props => props.color || '#b7b7ba'};
    white-space: nowrap;
    overflow: hidden;
`;

const Currency = styled.div`
    font-size: 12px;
    color: #757575;
    white-space: nowrap;
    overflow: hidden;
`;

const DateWrapper = styled.div`
    display: flex;
    justify-content: center;
`;

const DateSplitter = styled.div`
    height: 30px;
    line-height: 30px;
    padding: 0 10px;
    margin: -15px 0;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 300;
    color: #333;
    background: #fff;
    box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.3);
    cursor: default;
`;

const EmptyBlock = styled.div`
    padding: 28px 20px 30px;
    font-size: 20px;
    font-weight: 500;
    color: #c5c5c5;
`;

class WalletContent extends Component {
    state = {
        mainTab: MAIN_TABS.TRANSACTIONS,
        currency: CURRENCY.ALL,
        direction: DIRECTION.ALL,
    };

    render() {
        const { mainTab } = this.state;

        return (
            <Card auto>
                <Tabs
                    activeTab={{ id: mainTab }}
                    onChange={this._onMainTabChange}
                >
                    <CardContentStyled>
                        <TabContainer id={MAIN_TABS.TRANSACTIONS} title="История транзакций">
                            {this._renderTransactions()}
                        </TabContainer>
                        <TabContainer id={MAIN_TABS.POWER} title="Сила голоса" />
                        <TabContainer id={MAIN_TABS.REWARDS} title="Награды" />
                    </CardContentStyled>
                </Tabs>
                <Content>{this._renderList()}</Content>
            </Card>
        );
    }

    _renderTransactions() {
        const { currency } = this.state;

        return (
            <Tabs activeTab={{ id: currency }} onChange={this._onCurrencyChange}>
                <TabsContent>
                    <TabContainer id={CURRENCY.ALL} title="Все">
                        {this._renderTransactionsType('all')}
                    </TabContainer>
                    <TabContainer id={CURRENCY.GOLOS} title="Голос">
                        {this._renderTransactionsType('golos')}
                    </TabContainer>
                    <TabContainer id={CURRENCY.GBG} title="Золото">
                        {this._renderTransactionsType('gbg')}
                    </TabContainer>
                    <TabContainer id={CURRENCY.SAFE} title="Сейф">
                        {this._renderTransactionsType('safe')}
                    </TabContainer>
                </TabsContent>
            </Tabs>
        );
    }

    _renderTransactionsType() {
        const { direction } = this.state;

        return (
            <Tabs activeTab={{ id: direction }} onChange={this._onDirectionChange}>
                <TabsContent>
                    <TabContainer id={DIRECTION.ALL} title="Все" />
                    <TabContainer id={DIRECTION.SENT} title="Отправленные" />
                    <TabContainer id={DIRECTION.RECEIVE} title="Полученные" />
                </TabsContent>
            </Tabs>
        );
    }

    _renderList() {
        const { pageAccount } = this.props;
        const { mainTab } = this.state;

        if (mainTab === MAIN_TABS.REWARDS) {
            return <EmptyBlock>Пока не готово</EmptyBlock>;
        }

        if (!pageAccount) {
            return <LoadingIndicator type="circle" size={40} center />;
        }

        const transfers = pageAccount.get('transfer_history');

        if (!transfers) {
            return <LoadingIndicator type="circle" size={40} center />;
        }

        const list = [];

        for (let i = transfers.size - 1; i >= 0; --i) {
            const item = transfers.get(i);

            const operations = item.get(1);
            const stamp = new Date(operations.get('timestamp'));

            const [type, data] = operations.get('op').toJS();

            if (mainTab === MAIN_TABS.TRANSACTIONS) {
                if (
                    type === 'transfer' ||
                    type === 'transfer_to_savings' ||
                    type === 'transfer_from_savings'
                ) {
                    this._processTransactions(type, data, stamp, list);
                }
            } else if (mainTab === MAIN_TABS.POWER) {
                if (type === 'transfer_to_vesting') {
                    this._processVesting(type, data, stamp, list);
                }
            }

            console.log(type);
        }

        if (list.length) {
            return <Lines>{list.map((item, i) => this._renderLine(item, i))}</Lines>;
        } else {
            return <EmptyBlock>Список пуст</EmptyBlock>;
        }
    }

    _renderLine(item, i) {
        return (
            <LineWrapper key={i}>
                {item.addDate ? (
                    <DateWrapper>
                        <DateSplitter>
                            {item.stamp.getDate() + ' ' + MONTHS[item.stamp.getMonth()]}
                        </DateSplitter>
                    </DateWrapper>
                ) : null}
                <Line>
                    <LineIcon name={item.icon} color={item.color} />
                    <Who>
                        {item.name ? (
                            <WhoName>
                                {item.type === DIRECTION.SENT ? 'Для ' : 'От '}
                                <WhoLink to={`/@${item.name}`}>@{item.name}</WhoLink>
                            </WhoName>
                        ) : null}
                        {item.title ? <WhoTitle>{item.title}</WhoTitle> : null}
                        <TimeStamp>
                            <TimeAgoWrapper date={item.stamp} />
                        </TimeStamp>
                    </Who>
                    <Memo>
                        {item.memo ? <MemoIcon name="note" data-tooltip={item.memo} /> : null}
                    </Memo>
                    {item.data ? <DataLink to={item.link}>{item.data}</DataLink> : null}
                    <Value>
                        <Amount color={item.color}>{item.amount}</Amount>
                        <Currency>{CURRENCY_TRANSLATE[item.currency]}</Currency>
                    </Value>
                </Line>
            </LineWrapper>
        );
    }

    _processTransactions(type, data, stamp, list) {
        const { pageAccountName } = this.props;
        const { currency, direction } = this.state;

        const samePerson = data.to === data.from;
        const isSent = data.from === pageAccountName;
        const isReceive = data.to === pageAccountName && !samePerson;

        const isSafe = type === 'transfer_to_savings' || type === 'transfer_from_savings';

        if (
            direction === DIRECTION.ALL ||
            (direction === DIRECTION.RECEIVE && isReceive) ||
            (direction === DIRECTION.SENT && isSent)
        ) {
            const [amount, opCurrency] = data.amount.split(' ');

            if (/^0\.0+$/.test(amount)) {
                return;
            }

            const sign = isReceive || type === 'transfer_from_savings' ? '+' : '-';

            if (
                currency === CURRENCY.ALL ||
                (currency === CURRENCY.SAFE && isSafe) ||
                (currency === opCurrency && !isSafe)
            ) {
                const day = [stamp.getFullYear(), stamp.getMonth(), stamp.getDate()].join('-');

                list.push({
                    type: isReceive ? DIRECTION.RECEIVE : DIRECTION.SENT,
                    name: samePerson && isSafe ? null : isReceive ? data.from : data.to,
                    title:
                        samePerson && isSafe
                            ? type === 'transfer_to_savings'
                                ? 'Перевод в сейф'
                                : 'Возврат из сейфа'
                            : null,
                    amount: sign + amount,
                    currency: opCurrency,
                    memo: data.memo || null,
                    icon: isSafe ? 'lock' : opCurrency === CURRENCY.GOLOS ? 'golos' : 'brilliant',
                    color: isSafe
                        ? CURRENCY_COLOR.SAFE
                        : isReceive
                            ? CURRENCY_COLOR[opCurrency]
                            : null,
                    data: isSafe
                        ? null
                        : 'Golos.io: Новый релиз бла бла бла бла бла бла бла бла бла бла бла бла',
                    stamp,
                    day,
                    addDate: list.length && last(list).day !== day,
                });
            }
        }
    }

    _processVesting(type, data, stamp, list) {
        const { pageAccountName } = this.props;

        const samePerson = data.to === data.from;
        const isSent = data.from === pageAccountName;
        const isReceive = data.to === pageAccountName && !samePerson;

        const [amount, opCurrency] = data.amount.split(' ');

        if (/^0\.0+$/.test(amount)) {
            return;
        }

        const sign = isReceive || type === 'transfer_from_savings' ? '+' : '-';

        const day = [stamp.getFullYear(), stamp.getMonth(), stamp.getDate()].join('-');

        list.push({
            type: isReceive ? DIRECTION.RECEIVE : DIRECTION.SENT,
            name: samePerson ? null : isReceive ? data.from : data.to,
            amount: sign + amount,
            currency: opCurrency,
            memo: data.memo || null,
            icon: 'logo',
            color: '#f57c02',
            data: null,
            stamp,
            day,
            addDate: list.length && last(list).day !== day,
        });
    }

    _onMainTabChange = ({ id }) => {
        this.setState({
            mainTab: id,
        });
    };

    _onCurrencyChange = ({ id }) => {
        this.setState({
            currency: id,
        });
    };

    _onDirectionChange = ({ id }) => {
        this.setState({
            direction: id,
        });
    };
}

export default connect((state, props) => {
    const pageAccountName = props.params.accountName.toLowerCase();
    const pageAccount = state.global.getIn(['accounts', pageAccountName]);

    return {
        pageAccountName,
        pageAccount,
    };
})(WalletContent);
