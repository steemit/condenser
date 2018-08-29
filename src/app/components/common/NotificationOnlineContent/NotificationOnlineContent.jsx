import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';
import { Map } from 'immutable';

import tt from 'counterpart';
import Interpolate from 'react-interpolate-component';
import normalizeProfile from 'app/utils/NormalizeProfile';

import Avatar from 'src/app/components/common/Avatar';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
`;

const AvatarWrapper = styled.div`
    margin-right: 18px;
`;

const Message = styled.div`
    font-family: ${theme => theme.fontFamily};
    font-size: 14px;
`;

export default class NotificationOnlineContent extends PureComponent {
    static propTypes = {
        type: PropTypes.string,
        account: PropTypes.instanceOf(Map),

        title: PropTypes.string,
        link: PropTypes.string,
        amount: PropTypes.number,

        golos: PropTypes.number,
        golosPower: PropTypes.number,
        gbg: PropTypes.number,
    };

    getPropsForInterpolation() {
        const {
            type,
            account,

            title,
            link,
            amount,

            golos,
            golosPower,
            gbg,
        } = this.props;
        const userName = account.get('name');

        switch (type) {
            case 'vote':
            case 'flag':
            case 'reply':
            case 'mention':
            case 'repost':
                return {
                    user: <Link to={`/@${userName}`}>@{userName}</Link>,
                    content: <Link to={link}>{title}</Link>,
                };

            case 'transfer':
                return {
                    user: <Link to={`/@${userName}`}>@{userName}</Link>,
                    amount,
                };

            case 'reward':
                const awards = [];
                if (golos) awards.push(`${golos} Голосов`);
                if (golosPower) awards.push(`${golosPower} Силы Голоса`);
                if (gbg) awards.push(`${gbg} GBG`);
                return {
                    content: <Link to={link}>{title}</Link>,
                    amount: awards.join(','),
                };
            case 'curatorReward':
                return {
                    content: <Link to={link}>{title}</Link>,
                    amount,
                };

            case 'subscribe':
            case 'unsubscribe':
            case 'witnessVote':
            case 'witnessCancelVote':
                return {
                    user: <Link to={`/@${userName}`}>@{userName}</Link>,
                };

            default:
                return {};
        }
    }

    render() {
        const { account, type } = this.props;

        let avatarLink = null;
        if (account) {
            const { profile_image } = normalizeProfile(account.toJS());
            avatarLink = (
                <AvatarWrapper>
                    <Link to={`/@${account.get('name')}`}>
                        <Avatar avatarUrl={profile_image} size={40} />
                    </Link>
                </AvatarWrapper>
            );
        }

        return (
            <Wrapper>
                {avatarLink}
                <Message>
                    <Interpolate with={this.getPropsForInterpolation()} component="div">
                        {tt(['notifications', 'online', type], { count: 1, interpolate: false })}
                    </Interpolate>
                </Message>
            </Wrapper>
        );
    }
}
