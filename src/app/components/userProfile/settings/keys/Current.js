import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Map, List } from 'immutable';

import tt from 'counterpart';
import user from 'app/redux/User';
import g from 'app/redux/GlobalReducer';

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

const emptyMap = Map();
const emptyList = List();

@connect(
    state => {
        const current = state.user.get('current');

        let privateKeys = emptyMap;
        if (current) {
            privateKeys = current.getIn(['private_keys'], emptyMap); // not bound to one account
        }

        return { privateKeys };
    },
    dispatch => ({
        showLogin: ({ username, authType }) => {
            dispatch(user.actions.showLogin({ loginDefault: { username, authType } }));
        },
        showQRKey: ({ type, isPrivate, text }) => {
            dispatch(g.actions.showDialog({ name: 'qr_key', params: { type, isPrivate, text } }));
        },
    })
)
export default class Current extends Component {
    static propTypes = {
        account: PropTypes.object.isRequired,
    };

    getPubKeys(authType) {
        const { account } = this.props;

        if (authType === 'memo') {
            return List([account.get('memo_key')]);
        } else {
            return account.getIn([authType, 'key_auths'], emptyList).map(a => a.get(0));
        }
    }

    renderKey(authType) {
        const { account, privateKeys, showQRKey, showLogin } = this.props;

        const pubkeys = this.getPubKeys(authType);
        return (
            <KeysBlock>
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
    }

    render() {
        return (
            <CardContent column>
                <Info>
                    Важно сохранить свой ключ-пароль. Golos.io не хранит ваши пароли. Убедитесь, что
                    надежно сохранили ваши ключ.
                </Info>

                {this.renderKey('posting')}
                {this.renderKey('active')}
                {this.renderKey('owner')}
                {this.renderKey('memo')}
            </CardContent>
        );
    }
}
