import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Root = styled.section`
    padding: 20px 0;
`;

const Row = styled.div`
    min-height: 1200px;
`;

const MainHeader = styled.div`
    font-family: ${a => a.theme.fontFamilyBold};
    font-size: 36px;
    line-height: 1.06;
    letter-spacing: 0.6px;
    color: #333;
    margin-bottom: 60px;
`;

const Description = styled.div`
    font-family: 'Open Sans', 'sans-serif';
    font-size: 14px;
    line-height: 1.57;
    color: #9fa3a7;
`;

const Block = styled.div`
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
    padding: 40px 60px;
    min-height: 460px;
    margin: 0.9375rem 0;

    @media screen and (max-width: 63.9375em) {
        min-height: 500px;
    }
    @media screen and (max-width: 39.9375em) {
        min-height: 400px;
    }
`;

const Image = styled.div`
    height: 70px;
`;

const Header = styled.div`
    font-family: ${a => a.theme.fontFamilyBold};
    font-size: 22px;
    line-height: 1.42;
    color: #212121;
    margin: 20px 0;
`;

const Button = styled.a`
    margin: 30px 0 0;
    padding: 0.85em 1.5em;
    letter-spacing: 3px;
`;

const items = [
    {
        header: 'Ключи',
        pic: 'password',
        description:
            'Виртуальный паспорт в мире блокчейна. Ключи подтверждают, что ваш аккаунт и токены принадлежит только вам. Распечатайте ключи. В отличие от настоящего паспорта, никто не сможет вам их восстановить.',
        url:
            'https://wiki.golos.io/1-introduction/koshelek-klyuchi-viplati.html',
    },
    {
        header: 'Голосование',
        pic: 'monitor-like',
        description:
            'Каждый день у вас есть 40 голосов чтобы оценить чужие посты. Не упустите их, когда вы нажимаете кнопку «Вверх» рядом с постом — топ Golos.io становится интереснее, а вы получить награду за курирование.',
        url: 'https://wiki.golos.io/2-rewards/curation_rewards.html',
    },
    {
        header: 'Tеги',
        pic: 'monitor',
        description:
            'Это темы, по которым можно искать посты. Каждый пост должен иметь как минимум один тег. Вы можете подписаться не только на автора, но и на тег.',
        url:
            'https://wiki.golos.io/1-introduction/interfeis-lichnogo-bloga.html',
    },
    {
        header: 'Поста',
        pic: 'website',
        description:
            'В отличие от других соцсетей, у нас есть не одна, а несколько лент. Новое — все, что только что опубликовали, актуальное — посты с активным обсуждением и популярное — здесь посты с самым большим вознаграждением.',
        url:
            'https://wiki.golos.io/1-introduction/interfeis-lichnogo-bloga.html',
    },
    {
        header: 'Токены',
        pic: 'bitcoin',
        description:
            'Монеты блокчейна, на основе которого работает Golos.io. Все награды за посты, комментарии и курирование выплачиваются токенами. Их можно поменять на любые криптовалюты или привычные деньги на биржах.',
        url:
            'https://wiki.golos.io/1-introduction/koshelek-klyuchi-viplati.html',
    },
    {
        header: 'Посты не удаляются',
        pic: 'bitcoin-chain',
        description: 'Все, что написано на Golos.io, остается в блокчейне.',
    },
];

export default class Differences extends PureComponent {
    render() {
        return (
            <Root>
                <Row className="row align-middle">
                    <div className="columns">
                        <MainHeader>Наши отличия</MainHeader>
                        <div className="row small-up-1 medium-up-2 large-up-3">
                            {this._renderItems()}
                        </div>
                    </div>
                </Row>
            </Root>
        );
    }

    _renderItems() {
        return items.map(({ header, description, pic, url }, i) => (
            <div key={i} className="columns">
                <Block className="align-top align-justify flex-dir-column flex-container">
                    <div>
                        <Image>
                            <img src={`images/new/welcome/${pic}.svg`} />
                        </Image>
                        <Header>{header}</Header>
                        <Description>{description}</Description>
                    </div>
                    {url ? (
                        <Button
                            className="button small violet hollow"
                            href={url}
                        >
                            Подробнее
                        </Button>
                    ) : null}
                </Block>
            </div>
        ));
    }
}
