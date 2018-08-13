import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import styled from 'styled-components';
import { last } from 'ramda';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import TextCut from 'src/app/components/common/TextCut';
import Card, { CardContent } from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';
import Icon from 'golos-ui/Icon';
import { vestsToGolosEasy } from 'app/utils/StateFunctions';

const MAIN_TABS = {
    TRANSACTIONS: 'TRANSACTIONS',
    POWER: 'POWER',
    REWARDS: 'REWARDS',
};

const CURRENCY = {
    ALL: 'ALL',
    GOLOS: 'GOLOS',
    GBG: 'GBG',
    GOLOS_POWER: 'GOLOS_POWER',
    SAFE: 'SAFE',
};

const CURRENCY_TRANSLATE = {
    GOLOS: 'Голос',
    GBG: 'Золото',
    GOLOS_POWER: 'Сила Голоса',
};

const CURRENCY_COLOR = {
    GOLOS: '#2879ff',
    GBG: '#ffb839',
    GOLOS_POWER: '#f57c02',
    SAFE: '#583652',
};

const REWARDS_TABS = {
    HISTORY: 'HISTORY',
    STATISTIC: 'STATISTIC',
};

const REWARDS_TYPES = {
    CURATORIAL: 'CURATORIAL',
    AUTHOR: 'AUTHOR',
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

const CardStyled = styled(Card)`
    max-width: 618px;
`;

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
    align-items: flex-start;
    padding: 0 20px;
`;

const LineIcon = styled(Icon)`
    flex-shrink: 0;
    width: 24px;
    height: 80px;
    margin-right: 16px;
    color: ${props => props.color || '#b7b7ba'};
`;

const Who = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    flex-basis: 10px;
    height: 80px;
    overflow: hidden;
`;

const WhoName = styled.div``;

const WhoTitle = styled.div``;

const WhoLink = styled(Link)`
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const WhoPostLink = styled(Link)`
    display: block;
    color: #333;
    white-space: nowrap;
    text-decoration: underline;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const TimeStamp = styled.div`
    font-size: 12px;
    color: #959595;
`;

const Memo = styled.div`
    display: flex;
    flex-grow: 1;
    flex-basis: 10px;
`;

const MemoIcon = styled(Icon)`
    display: block;
    flex-shrink: 0;
    flex-basis: 24px;
    margin-top: 27px;
    margin-right: 12px;
    color: #333;
    transition: color 0.15s;
`;

const MemoCut = styled(TextCut)`
    flex-grow: 1;
    margin: 15px 0;
`;

const MemoCentrer = styled.div`
    &::after {
        display: inline-block;
        content: '';
        height: 50px;
        vertical-align: middle;
    }
`;

const MemoText = styled.div`
    display: inline-block;
    padding: 4px 0;
    line-height: 1.4em;
    vertical-align: middle;
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

const Currencies = styled.div`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: 80px;
    overflow: hidden;
`;

const ListValue = styled.div`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    flex-direction: column;
    margin-right: 9px;

    &:last-child {
        margin-right: 0;
    }
`;

const Value = styled.div`
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    align-items: flex-end;
    width: 80px;
    height: 80px;
    justify-content: center;
`;

const Amount = styled.div`
    margin-top: 2px;
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
    padding: 0 13px;
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
        rewardTab: REWARDS_TABS.HISTORY,
        rewardType: REWARDS_TYPES.CURATORIAL,
    };

    render() {
        const { mainTab } = this.state;

        return (
            <CardStyled auto>
                <Tabs activeTab={{ id: mainTab }} onChange={this._onMainTabChange}>
                    <CardContentStyled>
                        <TabContainer id={MAIN_TABS.TRANSACTIONS} title="История транзакций">
                            {this._renderTransactionsTabs()}
                        </TabContainer>
                        <TabContainer id={MAIN_TABS.POWER} title="Сила голоса" />
                        <TabContainer id={MAIN_TABS.REWARDS} title="Награды">
                            {this._renderRewardsTabs()}
                        </TabContainer>
                    </CardContentStyled>
                </Tabs>
                <Content>{this._renderList()}</Content>
            </CardStyled>
        );
    }

    _renderTransactionsTabs() {
        const { currency } = this.state;

        const innerTabs = this._renderTransactionsType();

        return (
            <Tabs activeTab={{ id: currency }} onChange={this._onCurrencyChange}>
                <TabsContent>
                    <TabContainer id={CURRENCY.ALL} title="Все">
                        {innerTabs}
                    </TabContainer>
                    <TabContainer id={CURRENCY.GOLOS} title="Голос">
                        {innerTabs}
                    </TabContainer>
                    <TabContainer id={CURRENCY.GBG} title="Золото">
                        {innerTabs}
                    </TabContainer>
                    <TabContainer id={CURRENCY.GOLOS_POWER} title="Сила Голоса">
                        {innerTabs}
                    </TabContainer>
                    <TabContainer id={CURRENCY.SAFE} title="Сейф">
                        {innerTabs}
                    </TabContainer>
                </TabsContent>
            </Tabs>
        );
    }

    _renderRewardsTabs() {
        const { rewardTab } = this.state;

        return (
            <Tabs activeTab={{ id: rewardTab }} onChange={this._onRewardTabChange}>
                <TabsContent>
                    <TabContainer id={REWARDS_TABS.HISTORY} title="История">
                        {this._renderRewardsType()}
                    </TabContainer>
                    <TabContainer id={REWARDS_TABS.STATISTIC} title="Статистика">
                        {this._renderRewardsType()}
                    </TabContainer>
                </TabsContent>
            </Tabs>
        );
    }

    _renderRewardsType() {
        const { rewardType } = this.state;

        return (
            <Tabs activeTab={{ id: rewardType }} onChange={this._onRewardTypeChange}>
                <TabsContent>
                    <TabContainer id={REWARDS_TYPES.CURATORIAL} title="Кураторские" />
                    <TabContainer id={REWARDS_TYPES.AUTHOR} title="Авторские" />
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
        const { mainTab, rewardTab } = this.state;

        if (!pageAccount) {
            return <LoadingIndicator type="circle" size={40} center />;
        }

        if (mainTab === MAIN_TABS.REWARDS && rewardTab === REWARDS_TABS.STATISTIC) {
            return <EmptyBlock>Функицонал пока что не готов</EmptyBlock>;
        }

        const transfers = pageAccount.get('transfer_history');

        if (!transfers) {
            return <LoadingIndicator type="circle" size={40} center />;
        }

        const list = [];

        for (let i = transfers.size - 1; i >= 0; --i) {
            const item = transfers.get(i);

            const operations = item.get(1);
            const stamp = new Date(operations.get('timestamp') + 'Z');

            const [type, data] = operations.get('op').toJS();

            let line = null;

            if (mainTab === MAIN_TABS.TRANSACTIONS) {
                if (
                    type === 'transfer' ||
                    type === 'transfer_to_savings' ||
                    type === 'transfer_from_savings' ||
                    type === 'transfer_to_vesting'
                ) {
                    line = this._processTransactions(type, data, stamp);
                }
            } else if (mainTab === MAIN_TABS.POWER) {

            } else if (mainTab === MAIN_TABS.REWARDS) {
                if (type === 'curation_reward' || type === 'author_reward') {
                    line = this._processRewards(type, data, stamp);
                }
            }

            if (process.env.BROWSER) {
                //console.log(type, data);
            }

            if (line) {
                line.stamp = stamp;
                line.day = [stamp.getFullYear(), stamp.getMonth(), stamp.getDate()].join('-');
                line.addDate = list.length && last(list).day !== line.day;

                list.push(line);
            }
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
                        {item.post ? (
                            <WhoPostLink to={`/${item.post}`}>{item.post}</WhoPostLink>
                        ) : null}
                        <TimeStamp>
                            <TimeAgoWrapper date={item.stamp} />
                        </TimeStamp>
                    </Who>
                    {item.memo ? (
                        <Memo>
                            <MemoIcon name="note" data-tooltip={'Пометка'} />
                            <MemoCut height={50}>
                                <MemoCentrer>
                                    <MemoText>
                                        {item.memo}
                                    </MemoText>
                                </MemoCentrer>
                            </MemoCut>
                        </Memo>
                    ) : null}
                    {item.data ? <DataLink to={item.link}>{item.data}</DataLink> : null}
                    {item.currencies ? (
                        <Currencies>
                            {item.currencies.map(({ amount, currency }) => (
                                <ListValue key={currency}>
                                    <Amount color={CURRENCY_COLOR[currency]}>{amount}</Amount>
                                    <Currency>{CURRENCY_TRANSLATE[currency]}</Currency>
                                </ListValue>
                            ))}
                        </Currencies>
                    ) : (
                        <Value>
                            <Amount color={item.color}>{item.amount}</Amount>
                            <Currency>{CURRENCY_TRANSLATE[item.currency]}</Currency>
                        </Value>
                    )}
                </Line>
            </LineWrapper>
        );
    }

    _processTransactions(type, data) {
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
            let [amount, opCurrency] = data.amount.split(' ');

            if (type === 'transfer_to_vesting') {
                opCurrency = CURRENCY.GOLOS_POWER;
            }

            if (/^0\.0+$/.test(amount)) {
                return;
            }

            const sign = isReceive || type === 'transfer_from_savings' ? '+' : '-';

            if (
                currency === CURRENCY.ALL ||
                (currency === CURRENCY.SAFE && isSafe) ||
                (currency === opCurrency && !isSafe)
            ) {
                if (type === 'transfer_to_vesting') {
                    return {
                        type: isReceive ? DIRECTION.RECEIVE : DIRECTION.SENT,
                        name: samePerson ? null : isReceive ? data.from : data.to,
                        amount: sign + amount,
                        currency: CURRENCY.GOLOS_POWER,
                        memo: data.memo || null,
                        icon: 'logo',
                        color: '#f57c02',
                    };
                } else {
                    return {
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
                        icon: isSafe ? 'lock' : opCurrency === CURRENCY.GOLOS ? 'logo' : 'brilliant',
                        color: isSafe
                            ? CURRENCY_COLOR.SAFE
                            : isReceive
                                ? CURRENCY_COLOR[opCurrency]
                                : null,
                    };
                }
            }
        }
    }

    _processRewards(type, data) {
        const { rewardType } = this.state;

        if (rewardType === REWARDS_TYPES.CURATORIAL && type === 'curation_reward') {
            const amount = vestsToGolosEasy(data.reward);

            if (/^0+\.0+$/.test(amount)) {
                return;
            }

            return {
                type: DIRECTION.RECEIVE,
                post: data.comment_author + '/' + data.comment_permlink,
                amount: '+' + amount,
                currency: CURRENCY.GOLOS_POWER,
                memo: data.memo || null,
                icon: 'k',
                color: '#f57c02',
            };
        } else if (rewardType === REWARDS_TYPES.AUTHOR && type === 'author_reward') {
            const currencies = [];

            const golos = data.steem_payout.split(' ')[0];
            const power = vestsToGolosEasy(data.vesting_payout);
            const gold = data.sbd_payout.split(' ')[0];

            addValueIfNotZero(currencies, golos, CURRENCY.GOLOS);
            addValueIfNotZero(currencies, power, CURRENCY.GOLOS_POWER);
            addValueIfNotZero(currencies, gold, CURRENCY.GBG);

            if (!currencies.length) {
                currencies.push({
                    amount: '0',
                    currency: CURRENCY.GOLOS,
                });
            }

            return {
                type: DIRECTION.RECEIVE,
                post: data.author + '/' + data.permlink,
                currencies,
                memo: data.memo || null,
                icon: 'a',
                color: '#f57c02',
            };
        }
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

    _onRewardTabChange = ({ id }) => {
        this.setState({
            rewardTab: id,
        });
    };

    _onRewardTypeChange = ({ id }) => {
        this.setState({
            rewardType: id,
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

function addValueIfNotZero(list, amount, currency) {
    if (!/^0+\.0+$/.test(amount)) {
        list.push({
            amount,
            currency,
        });
    }
}
