import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';
import { Map } from 'immutable';

import tt from 'counterpart';
import Interpolate from 'react-interpolate-component';
import normalizeProfile from 'app/utils/NormalizeProfile';
import { DEBT_TOKEN_SHORT } from 'app/client_config';

import Avatar from 'src/app/components/common/Avatar';
import Icon from 'golos-ui/Icon';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
`;

const LeftSide = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    margin-right: 18px;
    color: #2879ff;
`;

const Message = styled.div`
    font-size: 14px;
    line-height: 20px;
`;

const icons = {
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
};

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

        const interProps = {};

        if (['vote', 'flag', 'reply', 'mention', 'repost'].includes(type)) {
            const userName = account.get('name');

            interProps.user = <Link to={`/@${userName}`}>@{userName}</Link>;
            interProps.content = <Link to={link}>{title}</Link>;
        } else if (['transfer'].includes(type)) {
            const userName = account.get('name');

            interProps.user = <Link to={`/@${userName}`}>@{userName}</Link>;
            interProps.amount = amount;
        } else if (['reward'].includes(type)) {
            const awards = [];
            if (golos) awards.push(`${golos} ${tt('token_names.LIQUID_TOKEN_PLURALIZE', { count: golos})}`);
            if (golosPower) awards.push(`${golosPower} ${tt('token_names.VESTING_TOKEN_PLURALIZE', { count: golosPower})}`);
            if (gbg) awards.push(`${gbg} ${DEBT_TOKEN_SHORT}`);

            interProps.content = <Link to={link}>{title}</Link>;
            interProps.amount = awards.join(', ');
        } else if (['curatorReward'].includes(type)) {
            interProps.content = <Link to={link}>{title}</Link>;
            interProps.amount = amount;
        } else if (['subscribe', 'unsubscribe', 'witnessVote', 'witnessCancelVote'].includes(type)) {
            const userName = account.get('name');
            interProps.user = <Link to={`/@${userName}`}>@{userName}</Link>;
        }

        return interProps;
    }

    render() {
        const { account, type } = this.props;

        let leftSide = null;

        if (['reward', 'curatorReward'].includes(type)) {
            leftSide = (
                <LeftSide>
                    <Icon {...icons[type]} />
                </LeftSide>
            );
        }

        if (account) {
            const { profile_image } = normalizeProfile(account.toJS());
            leftSide = (
                <LeftSide>
                    <Link to={`/@${account.get('name')}`}>
                        <Avatar avatarUrl={profile_image} size={40} />
                    </Link>
                </LeftSide>
            );
        }

        return (
            <Wrapper>
                {leftSide}
                <Message>
                    <Interpolate with={this.getPropsForInterpolation()} component="div">
                        {tt(['notifications', 'online', type], { count: 1, interpolate: false })}
                    </Interpolate>
                </Message>
            </Wrapper>
        );
    }
}
