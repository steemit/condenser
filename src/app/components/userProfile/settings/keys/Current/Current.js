import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Map, List } from 'immutable';

import tt from 'counterpart';

import { CardContent } from 'golos-ui/Card';
// import KeysItem from './KeysItem';
import ShowKey from './ShowKey';

const KeysBlock = styled.div`
    &:not(:last-child) {
        margin-bottom: 40px;
    }
`;

const Info = styled.div`
    color: #959595;
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 40px;
`;

const Title = styled.div`
    color: #393636;
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
    text-transform: uppercase;
    margin-bottom: 20px;
`;

const emptyList = List();

const authTypes = ['posting', 'active', 'owner', 'memo'];

export default class Current extends Component {
    static propTypes = {
        account: PropTypes.object.isRequired,
        privateKeys: PropTypes.instanceOf(Map),

        showLogin: PropTypes.func,
        showQRKey: PropTypes.func,
    };

    getPubKeys(authType) {
        const { account } = this.props;

        if (authType === 'memo') {
            return List([account.get('memo_key')]);
        } else {
            return account.getIn([authType, 'key_auths'], emptyList).map(a => a.get(0));
        }
    }

    renderKeys() {
        const { account, privateKeys, showQRKey, showLogin } = this.props;

        return authTypes.map((authType, key) => {
            const pubkeys = this.getPubKeys(authType);
            return (
                <KeysBlock key={key}>
                    <Title>{tt('g.' + authType.toLowerCase())}</Title>
                    {pubkeys.map((pubkey, key) => (
                        <ShowKey
                            key={key}
                            authType={authType}
                            pubkey={pubkey}
                            privateKey={privateKeys.get(authType + '_private')}
                            accountName={account.get('name')}
                            showQRKey={showQRKey}
                            showLogin={showLogin}
                        />
                    ))}
                </KeysBlock>
            );
        });
    }

    render() {
        return (
            <CardContent column>
                <Info>{tt('settings_jsx.keys.info')}</Info>

                {this.renderKeys()}
            </CardContent>
        );
    }
}
