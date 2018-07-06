import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';

import normalizeProfile from 'app/utils/NormalizeProfile';

import Icon from 'golos-ui/Icon';
import Card, { CardTitle } from 'golos-ui/Card';

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    margin: 17px 20px;
`;

const CardContentCounters = CardContent.extend`
    margin: 0;
`;

const Row = styled.div`
    position: relative;
    display: flex;
    height: 70px;

    &:not(:last-of-type) {
        margin-top: 1px;

        &:after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 20px;
            right: 20px;
            height: 1px;
            background: #e1e1e1;
        }
    }
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
    align-items: center;
    text-align: center;
`;

const Divider = styled.div`
    margin: 10px 0;
    width: 1px;
    background: #e1e1e1;
`;

const Bold = styled.div`
    color: #333;
    font-family: ${props => props.theme.fontFamily};
    font-size: 20px;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 5px;
`;

const Title = styled.div`
    color: #393636;
    font-family: ${props => props.theme.fontFamily};
    font-size: 14px;
    font-weight: 300;
    line-height: 1;
    text-transform: lowercase;
`;

const UserCardCity = styled.div`
    color: #393636;
    font-family: ${props => props.theme.fontFamily};
    font-size: 13px;
    font-weight: 400;
    line-height: 1;
    text-transform: initial;
`;

const UserCardSite = styled(Link)`
    color: #2879ff;
    font-family: 'Open Sans';
    font-size: 14px;
    letter-spacing: 0.25px;
    line-height: 1;
    margin-bottom: 12px;
    text-decoration: underline;
`;
const UserCardBio = styled.div`
    font-family: 'Open Sans';
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: #7d7d7d;
`;

const SocialLink = styled(Link)`
    color: #333;
`;

const UserCardAbout = ({ account, followerCount, followingCount }) => {
    const { location, about, website } = normalizeProfile(account);

    // set account join date
    let accountJoin = account.created;
    const transferFromSteemToGolosDate = '2016-09-29T12:00:00';
    if (new Date(accountJoin) < new Date(transferFromSteemToGolosDate)) {
        accountJoin = transferFromSteemToGolosDate;
    }

    const websiteLabel = website
        ? website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
        : null;

    return (
        <Card style={{ width: '273px' }}>
            <CardTitle>Краткая информация</CardTitle>
            <CardContentCounters>
                <Row>
                    <Column>
                        <Bold>{account.post_count}</Bold>
                        <Title>Постов</Title>
                    </Column>
                    <Divider />
                    <Column>
                        <Bold>{followingCount}</Bold>
                        <Title>Подписчиков</Title>
                    </Column>
                </Row>

                <Row>
                    <Column>
                        <Bold>{followerCount}</Bold>
                        <Title>Подписок</Title>
                    </Column>
                    <Divider />
                    <Column>
                        <Bold>85</Bold>
                        <Title>Рейтинг</Title>
                    </Column>
                </Row>

                <Row>
                    <Column>
                        <Bold>43</Bold>
                        <Title>Статус</Title>
                    </Column>
                    <Divider />
                    <Column>
                        <Bold>22.07.17</Bold>
                        <Title>Дата регистрации</Title>
                    </Column>
                </Row>
            </CardContentCounters>

            {(website || about || location) && (
                <CardTitle justify="space-between">
                    О себе{location && <UserCardCity>{location}</UserCardCity>}
                </CardTitle>
            )}
            {(website || about) && (
                <CardContent>
                    {website && (
                        <UserCardSite to={website}>{websiteLabel}</UserCardSite>
                    )}
                    {about && <UserCardBio>{about}</UserCardBio>}
                </CardContent>
            )}

            <CardTitle justify="space-between">
                <SocialLink to="#">
                    <Icon name="facebook" width="13px" height="24px" />
                </SocialLink>
                <SocialLink to="#">
                    <Icon name="vk" width="28px" height="18px" />
                </SocialLink>
                <SocialLink to="#">
                    <Icon name="instagram" size="23px" />
                </SocialLink>
                <SocialLink to="#">
                    <Icon name="twitter" width="26px" height="22px" />
                </SocialLink>
            </CardTitle>
        </Card>
    );
};

UserCardAbout.propTypes = {
    account: PropTypes.object,
    follow: PropTypes.object,
};

export default UserCardAbout;
