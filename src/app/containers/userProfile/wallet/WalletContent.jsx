import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import throttle from 'lodash/throttle';
import styled from 'styled-components';
import { api } from 'golos-js';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Card from 'golos-ui/Card';
import { vestsToGolosEasy } from 'app/utils/StateFunctions';
import { vestsToGolos } from 'app/utils/StateFunctions';
import transaction from 'app/redux/Transaction';
import WalletTabs from 'src/app/components/userProfile/wallet/WalletTabs';
import WalletLine from 'src/app/components/userProfile/wallet/WalletLine';
import { APP_DOMAIN } from 'app/client_config';

const DEFAULT_ROWS_LIMIT = 25;
const LOAD_LIMIT = 500;

export const MAIN_TABS = {
    TRANSACTIONS: 'TRANSACTIONS',
    POWER: 'POWER',
    REWARDS: 'REWARDS',
};

export const CURRENCY = {
    ALL: 'ALL',
    GOLOS: 'GOLOS',
    GBG: 'GBG',
    GOLOS_POWER: 'GOLOS_POWER',
    SAFE: 'SAFE',
};

export const CURRENCY_TRANSLATE = {
    GOLOS: 'Голос',
    GBG: 'Золото',
    GOLOS_POWER: 'Сила Голоса',
};

export const CURRENCY_COLOR = {
    GOLOS: '#2879ff',
    GBG: '#ffb839',
    GOLOS_POWER: '#f57c02',
    SAFE: '#583652',
};

export const REWARDS_TABS = {
    HISTORY: 'HISTORY',
    STATISTIC: 'STATISTIC',
};

export const REWARDS_TYPES = {
    CURATORIAL: 'CURATORIAL',
    AUTHOR: 'AUTHOR',
};

export const DIRECTION = {
    ALL: 'ALL',
    SENT: 'SENT',
    RECEIVE: 'RECEIVE',
};

const CardStyled = styled(Card)`
    max-width: 618px;
`;

const Content = styled.div`
    font-family: Roboto, sans-serif;
`;

const Lines = styled.div``;

const WhoPostLink = styled(Link)`
    display: block;
    color: #333;
    white-space: nowrap;
    text-decoration: underline;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const EmptyBlock = styled.div`
    padding: 28px 20px 30px;
    font-size: 20px;
    font-weight: 500;
    color: #c5c5c5;
`;

const EmptySubText = styled.div`
    margin-top: 10px;
    line-height: 1.2em;
    font-size: 18px;
`;

const LoaderWrapper = styled.div`
    display: flex;
    padding: 20px 0;
    justify-content: center;
    opacity: 0;
    animation: fade-in 0.25s forwards;
    animation-delay: 0.25s;
`;

const Stub = styled.div`
    padding: 20px;
    color: #777;
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
        const { mainTab, currency, rewardType, direction } = this.state;

        return (
            <CardStyled auto>
                <WalletTabs
                    mainTab={mainTab}
                    currency={currency}
                    rewardType={rewardType}
                    direction={direction}
                    onMainTabChange={this._onMainTabChange}
                    onCurrencyChange={this._onCurrencyChange}
                    onRewardTypeChange={this._onRewardTypeChange}
                    onDirectionChange={this._onDirectionChange}
                />
                <Content innerRef={this._onContentRef}>{this._renderContent()}</Content>
            </CardStyled>
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
        const { pageAccount, isOwner } = this.props;
        const { mainTab, rewardTab, rewardType } = this.state;

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
            const { myAccountName } = this.props;
            const { delegationData } = this.state;

            for (let i = 0; i < list.length; ++i) {
                const line = list[i];
                const stamp = line.stamp;

                line.day = [stamp.getFullYear(), stamp.getMonth(), stamp.getDate()].join('-');
                line.addDate = i > 0 && list[i - 1].day !== line.day;
            }

            return (
                <Lines>
                    {list.map((item, i) => (
                        <WalletLine
                            key={i}
                            data={item}
                            myAccountName={myAccountName}
                            account={pageAccount}
                            delegationData={delegationData}
                            globalProps={this._globalProps}
                            delegate={this.props.delegate}
                            onLoadDelegationsData={this._onLoadDelegationsData}
                        />
                    ))}
                </Lines>
            );
        } else {
            if (mainTab === MAIN_TABS.REWARDS) {
                if (rewardType === REWARDS_TYPES.AUTHOR) {
                    return (
                        <EmptyBlock>
                            Тут пока пусто
                            <EmptySubText>
                                {isOwner
                                    ? 'Начни писать посты, чтобы получать награду.'
                                    : 'Пользователь еще не начал писать посты, чтобы получать награду.'}
                            </EmptySubText>
                        </EmptyBlock>
                    );
                } else {
                    return (
                        <EmptyBlock>
                            Тут пока пусто
                            <EmptySubText>
                                {isOwner
                                    ? 'Начни комментировать и ставить лайки, чтобы получать награду.'
                                    : 'Пользователь еще не начал комментировать и оценивать посты, чтобы получать награду.'}
                            </EmptySubText>
                        </EmptyBlock>
                    );
                }
            }

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

    _onLoadDelegationsData = () => {
        return this._loadDelegationsData();
    };

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

    _renderPostLink(post) {
        const fullLink = post.author + '/' + post.permLink;

        return <WhoPostLink onClick={() => this._onPostClick(post)}>{fullLink}</WhoPostLink>;
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
                    let memo = data.memo;
                    let memoIconText = null;

                    if (memo && memo.startsWith('{')) {
                        try {
                            const data = JSON.parse(memo);

                            if (data.donate && data.donate.post) {
                                memo = `https://${APP_DOMAIN}${data.donate.post}`;
                                memoIconText = 'Благодарность';
                            }
                        } catch (err) {}
                    }

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
                        memo: memo || null,
                        memoIconText: memoIconText || null,
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
            isOwner: pageAccountName === myAccountName,
            globalProps,
        };
    },
    {
        delegate(operation, callback) {
            return transaction.actions.broadcastOperation({
                type: 'delegate_vesting_shares',
                operation,
                successCallback() {
                    callback(null);
                },
                errorCallback(err) {
                    callback(err);
                },
            });
        },
    }
)(WalletContent);

function addValueIfNotZero(list, amount, currency) {
    if (!/^0+\.0+$/.test(amount)) {
        list.push({
            amount,
            currency,
        });
    }
}
