import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';

import tt from 'counterpart';
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

export default class ActivityItem extends Component {
    static propTypes = {
        // account: PropTypes.object,
    };

    render() {
        const { notification, accounts } = this.props;

        // Создала новый пост “Блокчейн”.
        // У вас осталось 30 неизрасходованных апвоутов за…

        // vote               // лайк (голос)
        // Поставил лайк вашему посту “Блокчейн”.
        // Ваш пост “Блокчейн” получил 3 дизлайкa.

        // flag               // флаг (дизлайк, жалоба)
        // Поставил дизлайк вашему посту “Блокчейн”.

        // transfer           // перевод средств
        // Отблагодарил вас за пост “Пигмалион” и перевел вам 1000$.
        // Перевел на ваш счет 100$.

        // reply              // ответ на пост или комментарий
        // Ответил на комментарий к вашему посту “Пигмалион”.
        // Ответил на ваш комментарий поста “Пигмалион”.

        // subscribe          // подписка на блог
        // Подписался на ваш блог.

        // unsubscribe        // отписка от блога

        // mention            // упоминание в посте, заголовке поста или в комменте (через @)
        // Упомянул вас в посте “Пигмалион”.

        // repost             // репост
        // Cделал репост вашего поста “Блокчейн”.

        // award              // награда пользователю (не реализованно в данной версии)
        // Ваш пост “Блокчейн” заработал больше 100$.
        // Ваш пост “Пигмалион” собрал 150 голосов и заработал 20$.

        // curatorAward       // награда куратору     (не реализованно в данной версии)
        // Ваши  оценочные кураторские награды за последнюю неделю…

        // message            // личное сообщение     (не реализованно в данной версии)
        // witnessVote        // голос за делегата
        // witnessCancelVote  // отмена голоса за делегата

        let msg = '';
        let icon = null;

        const userName = notification
            .get('fromUsers')
            .get(0)
            .toLowerCase();
        const account = accounts.getIn([userName]);
        const { name, profile_image } = normalizeProfile(account.toJS());

        // TODO:
        switch (notification.get('eventType')) {
            case 'vote':
                msg = 'Поставил лайк вашему посту “Блокчейн”.';
                icon = {
                    name: 'like',
                    width: 14,
                    height: 14,
                };
                break;
            case 'flag':
                msg = 'Поставил дизлайк вашему посту “Блокчейн”.';
                icon = {
                    name: 'dislike',
                    width: 14,
                    height: 14,
                };
                break;
            case 'transfer':
                msg = 'Перевел на ваш счет 100$.';
                icon = {
                    name: 'coins',
                    width: 14,
                    height: 11,
                };
                break;
            case 'reply':
                msg = 'Ответил на комментарий к вашему посту “Пигмалион”.';
                icon = {
                    name: 'comment',
                    width: 12,
                    height: 12,
                }
                break;
            case 'subscribe':
                msg = 'Подписался на ваш блог.';
                icon = {
                    name: 'radion-checked',
                    width: 14,
                    height: 14,
                };
                break;
            case 'unsubscribe':
                msg = 'Отписался от вашего блога.';
                icon = {
                    name: 'round-cross',
                    width: 14,
                    height: 14,
                };
                break;
            case 'mention':
                msg = 'Упомянул вас в посте “Пигмалион”.';
                icon = {
                    name: 'avatar',
                    width: 14,
                    height: 14,
                };
                break;
            case 'repost':
                msg = 'Сделал репост вашего поста';
                icon = {
                    name: 'avatar',
                    width: 14,
                    height: 14,
                };
                break;
            case 'witnessVote':
                msg = 'test';
                break;
            case 'witnessCancelVote':
                msg = 'test';
                break;
        }

        return (
            <Wrapper>
                <Link to={`/@${userName}`}>
                    <Avatar  avatarUrl={profile_image} size={40} icon={icon} />
                </Link>
                <ActivityDesc>
                    <ActivityTop>
                        <AuthorName to={`/@${userName}`}>{name || userName}</AuthorName>
                        <ActivityDate>
                            <TimeAgoWrapper date={notification.get('createdAt')} />
                        </ActivityDate>
                    </ActivityTop>
                    <ActivityText>{msg}</ActivityText>
                </ActivityDesc>
            </Wrapper>
        );
    }
}
