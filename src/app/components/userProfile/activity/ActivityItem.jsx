import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';

import tt from 'counterpart';
import Interpolate from 'react-interpolate-component';
import normalizeProfile from 'app/utils/NormalizeProfile';

import Avatar from 'src/app/components/common/Avatar';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';

const Wrapper = styled.div`
    display: flex;
    flex: 1;
    align-items: center;

    :not(:last-child) {
        margin-bottom: 30px;
    }
`;

const ActivityDesc = styled.div`
    flex: 1;
    flex-direction: column;
    margin-left: 10px;
`;

const AuthorName = styled(Link)`
    font-size: 14px;
    font-weight: 500;
    color: #393636;
    text-decoration: none;
`;

const ActivityTop = styled.div`
    display: flex;
    flex: 1;
    justify-content: space-between;
`;

const ActivityDate = styled.div`
    font-size: 12px;
    color: #959595;
`;

const ActivityText = styled.div`
    color: #959595;
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 16px;
`;

const icons = {
    vote: {
        name: 'like',
        width: 14,
        height: 14,
    },
    flag: {
        name: 'dislike',
        width: 14,
        height: 14,
    },
    transfer: {
        name: 'coins',
        width: 14,
        height: 11,
    },
    reply: {
        name: 'comment',
        width: 12,
        height: 12,
    },
    subscribe: {
        name: 'radion-checked',
        width: 14,
        height: 14,
    },
    unsubscribe: {
        name: 'round-cross',
        width: 14,
        height: 14,
    },
    mention: {
        name: 'round-user',
        width: 14,
        height: 14,
    },
    repost: {
        name: 'avatar',
        width: 14,
        height: 14,
    },
    witnessVote: null,
    witnessCancelVote: null,
};

export default class ActivityItem extends Component {
    static propTypes = {
        // account: PropTypes.object,
    };

    getPropsForInterpolation() {
        const { notification } = this.props;

        const computed = notification.get('computed');
        if (
            ['vote', 'flag', 'reply', 'mention', 'repost'].includes(notification.get('eventType'))
        ) {
            return {
                content: <Link to={computed.get('link')}>{computed.get('title')}</Link>,
            };
        } else if (notification.get('eventType') === 'transfer') {
            return {
                amount: notification.get('amount'),
            };
        }

        return {};
    }

    render() {
        const { notification } = this.props;

        const account = notification.getIn(['computed', 'accounts']).get(0);
        const userName = account.get('name');
        const { name, profile_image } = normalizeProfile(account.toJS());

        return (
            <Wrapper>
                <Link to={`/@${userName}`}>
                    <Avatar
                        avatarUrl={profile_image}
                        size={40}
                        icon={icons[notification.get('eventType')]}
                    />
                </Link>
                <ActivityDesc>
                    <ActivityTop>
                        <AuthorName to={`/@${userName}`}>{name || userName}</AuthorName>
                        <ActivityDate>
                            <TimeAgoWrapper date={notification.get('createdAt')} />
                        </ActivityDate>
                    </ActivityTop>
                    <ActivityText>
                        <Interpolate with={this.getPropsForInterpolation()} component="div">
                            {tt(['notifications', 'activity', notification.get('eventType')], {
                                count: 1,
                                interpolate: false,
                            })}
                        </Interpolate>
                    </ActivityText>
                </ActivityDesc>
            </Wrapper>
        );
    }
}
