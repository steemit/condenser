import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';
import { List } from 'immutable';

import tt from 'counterpart';
import Interpolate from 'react-interpolate-component';
import normalizeProfile from 'app/utils/NormalizeProfile';
import { DEBT_TOKEN_SHORT } from 'app/client_config';

import Avatar from 'src/app/components/common/Avatar';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Icon from 'golos-ui/Icon';

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
    flex: 1;
    text-align: right;
    font-size: 12px;
    color: #959595;
`;

const ActivityText = styled.div`
    color: #959595;
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 16px;
`;

const LeftSide = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    margin-left: 6px;
    color: #2879ff;
`;

const icons = {
    vote: {
        name: 'like',
        size: 14,
    },
    flag: {
        name: 'dislike',
        size: 14,
    },
    transfer: {
        name: 'coins',
        width: 14,
        height: 11,
    },
    reply: {
        name: 'comment',
        size: 12,
    },
    subscribe: {
        name: 'radion-checked',
        size: 14,
    },
    unsubscribe: {
        name: 'round-cross',
        size: 14,
    },
    mention: {
        name: 'round-user',
        size: 14,
    },
    repost: {
        name: 'avatar',
        size: 14,
    },
    reward: {
        name: 'coins',
        width: 23,
        height: 18,
    },
    curatorReward: {
        name: 'coins',
        width: 23,
        height: 18,
    },
    witnessVote: null,
    witnessCancelVote: null,
};

const emptyList = List();

export default class ActivityItem extends Component {
    getPropsForInterpolation() {
        const { notification } = this.props;

        const computed = notification.get('computed');
        const eventType = notification.get('eventType');
        const interProps = {};

        if (
            ['vote', 'flag', 'reply', 'mention', 'repost', 'reward', 'curatorReward'].includes(
                eventType
            )
        ) {
            interProps.content = <Link to={computed.get('link')}>{computed.get('title')}</Link>;
        }

        if (['reward'].includes(eventType)) {
            const awards = [];
            const golos = notification.getIn(['reward', 'golos'], null);
            const golosPower = notification.getIn(['reward', 'golosPower'], null);
            const gbg = notification.getIn(['reward', 'gbg'], null);
            if (golos) awards.push(`${golos} ${tt('token_names.LIQUID_TOKEN_PLURALIZE', { count: golos})}`);
            if (golosPower) awards.push(`${golosPower} ${tt('token_names.VESTING_TOKEN_PLURALIZE', { count: golosPower})}`);
            if (gbg) awards.push(`${gbg} ${DEBT_TOKEN_SHORT}`);
            interProps.amount = awards.join(', ');
        }

        if (['curatorReward'].includes(eventType)) {
            interProps.amount = notification.get('curatorReward');
        }

        if (['transfer'].includes(eventType)) {
            interProps.amount = notification.get('amount');
        }

        return interProps;
    }

    render() {
        const { notification } = this.props;

        let leftSide = null;
        let nameLink = null;

        if (['reward', 'curatorReward'].includes(notification.get('eventType'))) {
            leftSide = (
                <LeftSide>
                    <Icon {...icons[notification.get('eventType')]} />
                </LeftSide>
            );
        }

        const account = notification.getIn(['computed', 'accounts'], emptyList).get(0);
        if (account) {
            const userName = account.get('name');
            const { name, profile_image } = normalizeProfile(account.toJS());

            leftSide = (
                <Link to={`/@${userName}`}>
                    <Avatar
                        avatarUrl={profile_image}
                        size={40}
                        icon={icons[notification.get('eventType')]}
                    />
                </Link>
            );
            nameLink = <AuthorName to={`/@${userName}`}>{name || userName}</AuthorName>;
        }

        return (
            <Wrapper>
                {leftSide}
                <ActivityDesc>
                    <ActivityTop>
                        {nameLink}
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
