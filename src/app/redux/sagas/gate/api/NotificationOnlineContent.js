import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';
import { Map } from 'immutable';

import tt from 'counterpart';
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

export default class NotificationContent extends PureComponent {
    static propTypes = {
        type: PropTypes.string,
        account: PropTypes.instanceOf(Map),

        title: PropTypes.string,
        link: PropTypes.string,
        amount: PropTypes.number,
    };

    renderMessage() {
        const {
            type,
            account,

            title,
            link,
            amount,
        } = this.props;

        const userName = account.get('name');

        if (type === 'vote') {
            return (
                <Fragment>
                    <Link to={`/@${userName}`}>@{userName}</Link> оценил вашу запись{' '}
                    <Link to={link}>{title}</Link>. 👍
                </Fragment>
            );
        } else if (type === 'flag') {
            return (
                <Fragment>
                    <Link to={`/@${userName}`}>@{userName}</Link> негативно оценил вашу запись{' '}
                    <Link to={link}>{title}</Link>. 😵 💸
                </Fragment>
            );
        } else if (type === 'transfer') {
            return (
                <Fragment>
                    <Link to={`/@${userName}`}>@{userName}</Link> перевел на ваш счет {amount}{' '}
                    Голосов. 💸
                </Fragment>
            );
        } else if (type === 'reply') {
            return (
                <Fragment>
                    <Link to={`/@${userName}`}>@{userName}</Link> ответил на вашу запись{' '}
                    <Link to={link}>{title}</Link>. ✌️
                </Fragment>
            );
        } else if (type === 'subscribe') {
            return (
                <Fragment>
                    <Link to={`/@${userName}`}>@{userName}</Link> подписался на ваш блог. 😊
                </Fragment>
            );
        } else if (type === 'unsubscribe') {
            return (
                <Fragment>
                    <Link to={`/@${userName}`}>@{userName}</Link> отписался от вашего блога. 😔
                </Fragment>
            );
        } else if (type === 'mention') {
            return (
                <Fragment>
                    <Link to={`/@${userName}`}>@{userName}</Link> упомянув вас в своей записи{' '}
                    <Link to={link}>{title}</Link>. 🤔
                </Fragment>
            );
        } else if (type === 'repost') {
            return (
                <Fragment>
                    <Link to={`/@${userName}`}>@{userName}</Link> сделал репост вашего поста{' '}
                    <Link to={link}>{title}</Link>. 😎
                </Fragment>
            );
        } else if (type === 'witnessVote') {
            return (
                <Fragment>
                    <Link to={`/@${userName}`}>@{userName}</Link> проголосовал за вас как за делегата. 🔥
                </Fragment>
            );
        } else if (type === 'witnessCancelVote') {
            return (
                <Fragment>
                    <Link to={`/@${userName}`}>@{userName}</Link> снял свой голос с вашей делегатской ноды. 🙈
                </Fragment>
            );
        }
    }

    render() {
        const { account } = this.props;
        const { profile_image } = normalizeProfile(account.toJS());

        return (
            <Wrapper>
                <AvatarWrapper>
                    <Link to={`/@${account.get('name')}`}>
                        <Avatar avatarUrl={profile_image} size={40} />
                    </Link>
                </AvatarWrapper>
                <Message>{this.renderMessage()}</Message>
            </Wrapper>
        );
    }
}
