import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import throttle from 'lodash/throttle';
import styled from 'styled-components';
import { api } from 'golos-js';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import TextCut from 'src/app/components/common/TextCut';
import Card, { CardContent } from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';
import Icon from 'golos-ui/Icon';
import { vestsToGolosEasy } from 'app/utils/StateFunctions';
import EditGolosPower from 'src/app/components/userProfile/common/EditGolosPower';
import DialogManager from 'app/components/elements/common/DialogManager';
import { MIN_VOICE_POWER } from 'app/client_config';
import { vestsToGolos, golosToVests, getVesting } from 'app/utils/StateFunctions';
import transaction from 'app/redux/Transaction';
import SplashLoader from 'src/app/components/golos-ui/SplashLoader';

const DEFAULT_ROWS_LIMIT = 25;
const LOAD_LIMIT = 500;

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
    overflow: hidden;
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
    width: 100%;
    padding: 4px 0;
    line-height: 1.4em;
    vertical-align: middle;
    word-wrap: break-word;
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
    margin-left: 6px;
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

const LoaderWrapper = styled.div`
    display: flex;
    padding: 20px 0;
    justify-content: center;
    opacity: 0;
    animation: fade-in 0.25s forwards;
    animation-delay: 0.25s;
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    flex-basis: 10px;
    flex-grow: 0.5;
    height: 80px;
`;

const ActionIcon = styled(Icon)`
    width: 36px;
    height: 36px;
    padding: 8px;
    margin-right: 20px;
    user-select: none;
    color: #333;
    cursor: pointer;
    transition: color 0.15s;

    &:last-child {
        margin-right: 0;
    }

    &:hover {
        color: ${props => props.color};
    }
`;

const Stub = styled.div`
    padding: 20px;
    color: #777;
`;

const EditDelegationBlock = styled.div`
    height: 0;
    padding: 0 20px;
    transition: height 0.15s;
    overflow: hidden;
    will-change: height;
`;

function Loader() {
    return (
        <LoaderWrapper>
            <LoadingIndicator type="circle" size={40} />
        </LoaderWrapper>
    );
}

class WalletContent extends Component {
    state = {
        mainTab: MAIN_TABS.TRANSACTIONS,
        currency: CURRENCY.ALL,
        direction: DIRECTION.ALL,
        rewardTab: REWARDS_TABS.HISTORY,
        rewardType: REWARDS_TYPES.CURATORIAL,
        editDelegationId: null,
        startEditDelegationGrow: false,
        limit: DEFAULT_ROWS_LIMIT,
    };

    constructor(props) {
        super(props);

        this._globalProps = props.globalProps.toJS();
    }

    componentDidMount() {
        this._loadDelegationsData();

        window.addEventListener('scroll', this._onScrollLazy);
    }

    componentWillUnmount() {
        this._unmount = true;

        window.removeEventListener('scroll', this._onScrollLazy);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.globalProps !== newProps.globalProps) {
            this._globalProps = newProps.globalProps.toJS();
        }
    }

    render() {
        const { mainTab } = this.state;

        return (
            <CardStyled auto>
                <Tabs activeTab={{ id: mainTab }} onChange={this._onMainTabChange}>
                    <CardContentStyled>
                        <TabContainer id={MAIN_TABS.TRANSACTIONS} title="История транзакций">
                            {this._renderTransactionsTabs()}
                        </TabContainer>
                        <TabContainer id={MAIN_TABS.POWER} title="Сила голоса">
                            {this._renderTransactionsType()}
                        </TabContainer>
                        <TabContainer id={MAIN_TABS.REWARDS} title="Награды">
                            {this._renderRewardsTabs()}
                        </TabContainer>
                    </CardContentStyled>
                </Tabs>
                <Content innerRef={this._onContentRef}>{this._renderContent()}</Content>
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
        return this._renderRewardsType();

        // const { rewardTab } = this.state;
        //
        // return (
        //     <Tabs activeTab={{ id: rewardTab }} onChange={this._onRewardTabChange}>
        //         <TabsContent>
        //             <TabContainer id={REWARDS_TABS.HISTORY} title="История">
        //                 {this._renderRewardsType()}
        //             </TabContainer>
        //             <TabContainer id={REWARDS_TABS.STATISTIC} title="Статистика">
        //                 {this._renderRewardsType()}
        //             </TabContainer>
        //         </TabsContent>
        //     </Tabs>
        // );
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

    _renderContent() {
        const { mainTab, delegationData, delegationError } = this.state;

        if (mainTab === MAIN_TABS.POWER) {
            if (delegationError) {
                return <Stub>Ошибка при загрузке данных</Stub>;
            } else if (!delegationData) {
                return <Loader />;
            }
        }

        return this._renderList();
    }

    _renderList() {
        const { pageAccount } = this.props;
        const { mainTab, rewardTab } = this.state;

        if (!pageAccount) {
            return <Loader />;
        }

        if (mainTab === MAIN_TABS.REWARDS && rewardTab === REWARDS_TABS.STATISTIC) {
            return <EmptyBlock>Функционал пока что не готов</EmptyBlock>;
        }

        let list;

        if (mainTab === MAIN_TABS.POWER) {
            list = this._makeGolosPowerList();
        } else {
            list = this._makeTransferList();
        }

        if (list == null) {
            return <Loader />;
        }

        if (list.length) {
            for (let i = 0; i < list.length; ++i) {
                const line = list[i];
                const stamp = line.stamp;

                line.day = [stamp.getFullYear(), stamp.getMonth(), stamp.getDate()].join('-');
                line.addDate = i > 0 && list[i - 1].day !== line.day;
            }

            return <Lines>{list.map((item, i) => this._renderLine(item, i))}</Lines>;
        } else {
            return <EmptyBlock>Список пуст</EmptyBlock>;
        }
    }

    _makeTransferList() {
        const { pageAccount } = this.props;
        const { mainTab, limit } = this.state;

        const transfers = pageAccount.get('transfer_history');

        if (!transfers) {
            return null;
        }

        const list = [];

        this._hasMore = false;

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

            if (line) {
                line.stamp = stamp;
                list.push(line);

                if (list.length === limit) {
                    this._hasMore = true;
                    break;
                }
            }
        }

        return list;
    }

    _makeGolosPowerList() {
        const { myAccountName, pageAccountName } = this.props;
        const { delegationData, direction } = this.state;
        const globalProps = this._globalProps;

        const list = [];

        for (let item of delegationData) {
            const isReceive = item.delegatee === pageAccountName;
            const isSent = item.delegator === pageAccountName;

            if (
                direction === DIRECTION.ALL ||
                (direction === DIRECTION.SENT && isSent) ||
                (direction === DIRECTION.RECEIVE && isReceive)
            ) {
                const sign = isReceive ? '+' : '-';

                const amount = vestsToGolos(item.vesting_shares, globalProps);
                const currency = CURRENCY.GOLOS_POWER;

                const stamp = new Date(item.min_delegation_time + 'Z');

                list.push({
                    id: item.id,
                    type: isReceive ? DIRECTION.RECEIVE : DIRECTION.SENT,
                    name: isReceive ? item.delegator : item.delegatee,
                    amount: sign + amount,
                    currency,
                    memo: item.memo || null,
                    icon: 'voice',
                    color: isReceive ? CURRENCY_COLOR[currency] : null,
                    showDelegationActions: item.delegator === myAccountName,
                    stamp,
                });
            }
        }

        return list;
    }

    _renderLine(item, i) {
        const { loaderForId } = this.state;

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
                        {item.post ? this._renderPostLink(item.post) : null}
                        <TimeStamp>
                            <TimeAgoWrapper date={item.stamp} />
                        </TimeStamp>
                    </Who>
                    {item.memo ? (
                        <Memo>
                            <MemoIcon name="note" data-tooltip={'Пометка'} />
                            <MemoCut height={50}>
                                <MemoCentrer>
                                    <MemoText>{item.memo}</MemoText>
                                </MemoCentrer>
                            </MemoCut>
                        </Memo>
                    ) : null}
                    {item.data ? <DataLink to={item.link}>{item.data}</DataLink> : null}
                    {item.showDelegationActions ? this._renderDelegationActions(item.id) : null}
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
                {this._renderEditDelegation(item)}
                {loaderForId && loaderForId === item.id ? <SplashLoader light /> : null}
            </LineWrapper>
        );
    }

    _renderPostLink(post) {
        const fullLink = post.author + '/' + post.permLink;

        return <WhoPostLink onClick={() => this._onPostClick(post)}>{fullLink}</WhoPostLink>;
    }

    _renderDelegationActions(id) {
        const { loaderForId } = this.state;

        return (
            <Actions>
                <ActionIcon
                    color="#3684ff"
                    name="pen"
                    data-tooltip="Редактировать делегирование"
                    onClick={loaderForId ? null : () => this._onEditDelegationClick(id)}
                />
                <ActionIcon
                    color="#fc544e"
                    name="round-cross"
                    data-tooltip="Отменить делегирование"
                    onClick={loaderForId ? null : () => this._onCancelDelegationClick(id)}
                />
            </Actions>
        );
    }

    _renderEditDelegation(item) {
        const { editDelegationId } = this.state;

        if (editDelegationId === item.id) {
            const { pageAccount } = this.props;
            const { startEditDelegationGrow } = this.state;

            const { golos } = getVesting(pageAccount, this._globalProps);

            const availableBalance = Math.max(
                0,
                Math.round((parseFloat(golos) - MIN_VOICE_POWER) * 1000)
            );

            const value = Math.round(Math.abs(parseFloat(item.amount)) * 1000);

            const data = this.state.delegationData.find(data => data.id === item.id);

            return (
                <EditDelegationBlock style={{ height: startEditDelegationGrow ? 118 : 0 }}>
                    <EditGolosPower
                        value={value}
                        max={availableBalance + value}
                        onSave={value => this._onDelegationSaveClick(data, value)}
                        onCancel={this._onDelegationEditCancelClick}
                    />
                </EditDelegationBlock>
            );
        }
    }

    async _loadDelegationsData() {
        const { pageAccountName } = this.props;

        try {
            const [delegated, received] = await Promise.all([
                api.getVestingDelegationsAsync(pageAccountName, '', LOAD_LIMIT, 'delegated'),
                api.getVestingDelegationsAsync(pageAccountName, '', LOAD_LIMIT, 'received'),
            ]);

            const items = delegated.concat(received);

            for (let item of items) {
                item.id = item.delegator + '%' + item.delegatee;
                item.stamp = new Date(item.min_delegation_time + 'Z');
            }

            items.sort((a, b) => a.stamp - b.stamp);

            if (!this._unmount) {
                this.setState({
                    delegationError: null,
                    delegationData: items,
                });
            }
        } catch (err) {
            console.error(err);

            if (!this._unmount) {
                this.setState({
                    delegationError: err,
                    delegationData: null,
                });
            }
        }
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
                    const options = {};

                    if (samePerson) {
                        options.title = 'Увеличение Силы Голоса';
                        options.currencies = [
                            {
                                amount: '-' + amount,
                                currency: CURRENCY.GOLOS,
                            },
                            {
                                amount: '+' + amount,
                                currency: CURRENCY.GOLOS_POWER,
                            },
                        ];
                    } else {
                        options.name = samePerson ? null : isReceive ? data.from : data.to;
                        options.amount = sign + amount;
                        options.currency = CURRENCY.GOLOS_POWER;
                    }

                    return {
                        type: isReceive ? DIRECTION.RECEIVE : DIRECTION.SENT,
                        memo: data.memo || null,
                        icon: 'logo',
                        color: '#f57c02',
                        ...options,
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
                        icon: isSafe
                            ? 'lock'
                            : opCurrency === CURRENCY.GOLOS
                                ? 'logo'
                                : 'brilliant',
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
                post: { author: data.comment_author, permLink: data.comment_permlink },
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
                post: { author: data.author, permLink: data.permlink },
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
            currency: CURRENCY.ALL,
            direction: DIRECTION.ALL,
            editDelegationId: null,
            limit: DEFAULT_ROWS_LIMIT,
        });
    };

    _onCurrencyChange = ({ id }) => {
        this.setState({
            currency: id,
            limit: DEFAULT_ROWS_LIMIT,
        });
    };

    _onDirectionChange = ({ id }) => {
        this.setState({
            direction: id,
            limit: DEFAULT_ROWS_LIMIT,
        });
    };

    _onRewardTabChange = ({ id }) => {
        this.setState({
            rewardTab: id,
            limit: DEFAULT_ROWS_LIMIT,
        });
    };

    _onRewardTypeChange = ({ id }) => {
        this.setState({
            rewardType: id,
            limit: DEFAULT_ROWS_LIMIT,
        });
    };

    _onEditDelegationClick = id => {
        const { editDelegationId, startEditDelegationGrow } = this.state;

        if (editDelegationId === id && startEditDelegationGrow) {
            this.setState({
                startEditDelegationGrow: false,
            });
        } else {
            this.setState(
                {
                    editDelegationId: id,
                    startEditDelegationGrow: false,
                },
                () => {
                    setTimeout(() => {
                        this.setState({
                            startEditDelegationGrow: true,
                        });
                    }, 50);
                }
            );
        }
    };

    _onCancelDelegationClick = async id => {
        if (await DialogManager.dangerConfirm()) {
            const data = this.data.delegationData.find(data => data.id === id);

            this._updateDelegation(data, 0);
        }
    };

    _onDelegationSaveClick = (item, value) => {
        const { loaderForId } = this.state;

        if (loaderForId) {
            return;
        }

        this._updateDelegation(item, value);
    };

    _updateDelegation(item, value) {
        const { myAccountName } = this.props;

        const vesting = value > 0 ? golosToVests(value / 1000, this._globalProps) : '0.000000';

        const operation = {
            delegator: myAccountName,
            delegatee: item.delegatee,
            vesting_shares: vesting + ' GESTS',
        };

        this.setState({
            loaderForId: item.id,
        });

        this.props.delegate(operation, err => {
            if (err) {
                this.setState({
                    loaderForId: null,
                });

                if (err !== 'Canceled') {
                    DialogManager.alert(err.toString());
                }
            } else {
                this.setState({
                    loaderForId: null,
                    editDelegationId: null,
                });

                this._loadDelegationsData();
            }
        });
    }

    _onDelegationEditCancelClick = () => {
        this.setState({
            startEditDelegationGrow: false,
        });
    };

    _onPostClick = async post => {
        const postData = await api.getContentAsync(post.author, post.permLink, 0);
        browserHistory.push(postData.url);
    };

    _onScrollLazy = throttle(
        () => {
            if (this._hasMore) {
                if (this._content.getBoundingClientRect().bottom < window.innerHeight * 1.2) {
                    this.setState({
                        limit: this.state.limit + DEFAULT_ROWS_LIMIT,
                    });
                }
            }
        },
        100,
        { leading: false }
    );

    _onContentRef = el => {
        this._content = el;
    };
}

export default connect(
    (state, props) => {
        const globalProps = state.global.get('props');
        const pageAccountName = props.params.accountName.toLowerCase();
        const pageAccount = state.global.getIn(['accounts', pageAccountName]);
        const myAccountName = state.user.getIn(['current', 'username']);

        return {
            pageAccountName,
            pageAccount,
            myAccountName,
            globalProps,
        };
    },
    dispatch => ({
        delegate(operation, callback) {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'delegate_vesting_shares',
                    operation,
                    successCallback() {
                        callback(null);
                    },
                    errorCallback(err) {
                        callback(err);
                    },
                })
            );
        },
    })
)(WalletContent);

function addValueIfNotZero(list, amount, currency) {
    if (!/^0+\.0+$/.test(amount)) {
        list.push({
            amount,
            currency,
        });
    }
}
