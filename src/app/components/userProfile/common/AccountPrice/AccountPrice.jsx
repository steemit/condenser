import React, { PureComponent } from 'react';
import styled from 'styled-components';
import CollapsingCard from 'golos-ui/CollapsingCard';

const Body = styled.div`
    height: 103px;
    padding: 0 20px;
    line-height: 102px;
    text-align: center;
    font-size: 48px;
    font-weight: bold;
    color: #3684ff;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export default class AccountPrice extends PureComponent {
    render() {
        return (
            <CollapsingCard title={'Стоимость аккаунта'} saveStateKey="price">
                <Body>$ 13,65</Body>
            </CollapsingCard>
        );
    }
}
