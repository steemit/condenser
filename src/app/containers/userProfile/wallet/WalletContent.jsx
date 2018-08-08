import React, { Component } from 'react';
import styled from 'styled-components';
import Card, { CardContent } from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';

const CardContentStyled = styled(CardContent)`
    display: block;
    padding: 0;
`;

const TabsContent = styled.div``;

const Content = styled.div`
    padding: 20px;
`;

export default class WalletContent extends Component {
    render() {
        return (
            <Card auto>
                <Tabs activeTab={{ id: 'transactions' }}>
                    <CardContentStyled>
                        <TabContainer id="transactions" title="История транзакций">
                            {this._renderTransactions()}
                        </TabContainer>
                        <TabContainer id="power" title="Сила голоса">
                            LOL2
                        </TabContainer>
                        <TabContainer id="rewards" title="Награды">
                            LOL2
                        </TabContainer>
                    </CardContentStyled>
                </Tabs>
            </Card>
        );
    }

    _renderTransactions() {
        return (
            <Tabs activeTab={{ id: 'all' }}>
                <TabsContent>
                    <TabContainer id="all" title="Все">
                        {this._renderTransactionsType('all')}
                    </TabContainer>
                    <TabContainer id="golos" title="Голос">
                        {this._renderTransactionsType('golos')}
                    </TabContainer>
                    <TabContainer id="gbg" title="Золото">
                        {this._renderTransactionsType('gbg')}
                    </TabContainer>
                    <TabContainer id="safe" title="Сейф">
                        {this._renderTransactionsType('safe')}
                    </TabContainer>
                </TabsContent>
            </Tabs>
        );
    }

    _renderTransactionsType() {
        return (
            <Tabs activeTab={{ id: 'all' }}>
                <Content>
                    <TabContainer id="all" title="Все">
                        {this._renderList('all')}
                    </TabContainer>
                    <TabContainer id="sent" title="Отправленные">
                        {this._renderList('sent')}
                    </TabContainer>
                    <TabContainer id="receive" title="Полученные">
                        {this._renderList('receive')}
                    </TabContainer>
                </Content>
            </Tabs>
        );
    }

    _renderList(filter) {
        return (
            <div>
                <div>LOL1</div>
                <div>LOL2</div>
                <div>LOL3</div>
                <div>LOL4</div>
                <div>LOL5</div>
            </div>
        );
    }
}
