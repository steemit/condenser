import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { TabContainer, Tabs } from 'golos-ui/Tabs';
import { CardContent } from 'golos-ui/Card';
import {
    MAIN_TABS,
    CURRENCY,
    DIRECTION,
    REWARDS_TYPES,
} from 'src/app/containers/userProfile/wallet/WalletContent';

const CardContentStyled = styled(CardContent)`
    display: block;
    padding: 0;
`;

const TabsContent = styled.div``;

export default class WalletTabs extends PureComponent {
    render() {
        const { mainTab } = this.props;

        return (
            <Tabs activeTab={{ id: mainTab }} onChange={this.props.onMainTabChange}>
                <CardContentStyled>
                    <TabContainer id={MAIN_TABS.TRANSACTIONS} title="История транзакций">
                        {this._renderTransactionsTabs()}
                    </TabContainer>
                    <TabContainer id={MAIN_TABS.POWER} title="Делегирование">
                        {this._renderTransactionsType()}
                    </TabContainer>
                    <TabContainer id={MAIN_TABS.REWARDS} title="Награды">
                        {this._renderRewardsTabs()}
                    </TabContainer>
                </CardContentStyled>
            </Tabs>
        );
    }

    _renderTransactionsTabs() {
        const { currency } = this.props;

        const innerTabs = this._renderTransactionsType();

        return (
            <Tabs activeTab={{ id: currency }} onChange={this.props.onCurrencyChange}>
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

        // const { rewardTab } = this.props;
        //
        // return (
        //     <Tabs activeTab={{ id: rewardTab }} onChange={this.props.onRewardTabChange}>
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
        const { rewardType } = this.props;

        return (
            <Tabs activeTab={{ id: rewardType }} onChange={this.props.onRewardTypeChange}>
                <TabsContent>
                    <TabContainer id={REWARDS_TYPES.CURATORIAL} title="Кураторские" />
                    <TabContainer id={REWARDS_TYPES.AUTHOR} title="Авторские" />
                </TabsContent>
            </Tabs>
        );
    }

    _renderTransactionsType() {
        const { direction } = this.props;

        return (
            <Tabs activeTab={{ id: direction }} onChange={this.props.onDirectionChange}>
                <TabsContent>
                    <TabContainer id={DIRECTION.ALL} title="Все" />
                    <TabContainer id={DIRECTION.SENT} title="Отправленные" />
                    <TabContainer id={DIRECTION.RECEIVE} title="Полученные" />
                </TabsContent>
            </Tabs>
        );
    }
}
