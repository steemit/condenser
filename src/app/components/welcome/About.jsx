import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Root = styled.section`
    padding: 20px 0;
`;

const Row = styled.div`
    min-height: 500px;
`;

const Header = styled.div`
    font-family: ${a => a.theme.fontFamilySerif};
    font-size: 36px;
    line-height: 1.06;
    letter-spacing: 0.6px;
    color: #333;
    margin-bottom: 22px;
`;

const SubHeader = styled.div`
    font-family: 'Open Sans', sans-serif;
    font-size: 20px;
    line-height: 1.5;
    margin-bottom: 55px;
    color: #9fa3a7;
`;

const Image = styled.div`
    display: flex;
    align-items: center;
    height: 100px;
    margin-bottom: 48px;

    @media screen and (max-width: 63.9375em) {
        justify-content: center;
    }
`;

const Description = styled.div`
    font-family: ${a => a.theme.fontFamilySerif};
    font-size: 18px;
    line-height: 1.42;
    color: #212121;

    @media screen and (max-width: 63.9375em) {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 20px;
    }
`;

const Stroke = styled.span`
    position: relative;
    display: inline-block;
    white-space: nowrap;

    &:before {
        content: '';
        position: absolute;
        width: 100%;
        top: 55%;
        opacity: 0.75;
        border-bottom: 2px solid #fd3a28;
    }
`;

export default class About extends PureComponent {
    render() {
        return (
            <Root>
                <Row className="row align-middle">
                    <div className="columns">
                        <Header>Golos.io</Header>
                        <SubHeader>
                            Это уникальные тексты и мысли, которых нет в других
                            частях Интернета. <br />
                            Это сила сообщества, генерирующая смыслы и действия.
                        </SubHeader>
                        <div className="row small-up-1 medium-up-2 large-up-4">
                            {this._renderItem(
                                'Оригинальные идеи,',
                                'а не проплаченные статьи',
                                'startup'
                            )}
                            {this._renderItem(
                                'Посты и комментарии,',
                                'а не баннеры и реклама',
                                'post'
                            )}
                            {this._renderItem(
                                'Удобство выдачи,',
                                'а не закрытые алгоритмы',
                                'book'
                            )}
                            {this._renderItem(
                                'Информация принадлежит вам,',
                                'а не модерируется',
                                'teamwork'
                            )}
                        </div>
                    </div>
                </Row>
            </Root>
        );
    }

    _renderItem(text, neg, icon) {
        return (
            <div className="columns">
                <Image>
                    <img src={`images/new/welcome/${icon}.svg`} />
                </Image>
                <Description>
                    {text} <Stroke>{neg}</Stroke>
                </Description>
            </div>
        );
    }
}
