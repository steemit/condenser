import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import normalizeProfile from 'app/utils/NormalizeProfile';

import Avatar from 'src/app/components/common/Avatar';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';

const Wrapper = styled.div`
    display: flex;
    flex: 1;
    align-items: center;
`;

const ActivityDesc = styled.div`
    flex: 1;
    flex-direction: column;
    margin-left: 10px;
`;

const AuthorName = styled.div`
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
    color: #757575;
`;

const ActivityText = styled.div`
    color: #757575;
    font-family: ${({ theme }) => theme.fontFamily};
    font-size: 16px;
    font-weight: 300;
`;

export default class ActivityItem extends Component {
    static propTypes = {
        account: PropTypes.object,
    };

    render() {
        const { account } = this.props;
        const { profile_image } = normalizeProfile(account);

        const icon = {
            name: 'subscribe_small',
            width: 14,
            height: 14
        }

        return (
            <Wrapper>
                <Avatar avatarUrl={profile_image} size={40} icon={icon} />
                <ActivityDesc>
                    <ActivityTop>
                        <AuthorName href={`/@test`}>Ivanov Dima</AuthorName>
                        <ActivityDate>
                            <TimeAgoWrapper date={new Date()} />
                        </ActivityDate>
                    </ActivityTop>
                    <ActivityText>Ваш пост “Блокчейн” заработал больше 100$.</ActivityText>
                </ActivityDesc>
            </Wrapper>
        );
    }
}
