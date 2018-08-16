import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Icon from 'app/components/elements/Icon';
import CardPost from 'src/app/components/welcome/CardPost';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { WIKI_URL } from 'app/client_config';

const Root = styled.section`
    padding: 20px 0;
    background: #f8f8f8;
`;

const CardPost_W = styled.div`
    @media screen and (max-width: 74.9375em) {
        margin-bottom: 10px;
    }
`;

const Row = styled.div`
    min-height: 600px;
`;

const Header = styled.div`
    margin-bottom: 10px;
    line-height: 1.06;
    font-size: 36px;
    letter-spacing: 0.6px;
    font-family: ${a => a.theme.fontFamilySerif};
    color: #333;
`;

const SubHeader = styled.div`
    font-family: 'Open Sans', sans-serif;
    font-size: 20px;
    line-height: 1.5;
    color: #9fa3a7;
    margin-bottom: 48px;
`;

const Link = styled.a`
    font-family: ${a => a.theme.fontFamily};
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1.4px;
    color: #333;
    margin-bottom: 15px;
    border-radius: 8.5px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
    text-transform: uppercase;
    line-height: 1.2;
    padding: 25px 5px 25px 20px;
    align-items: center;
    display: flex;
    min-height: 92px;

    @media screen and (max-width: 39.9375em) {
        min-height: unset;
    }

    .Icon {
        margin-right: 15px;
        fill: #ffc80a;
    }

    &:hover {
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
    }
`;

export default class Questions extends PureComponent {
    render() {
        const { questionsLoading, questionsCards } = this.props;

        return (
            <Root>
                <Row className="row align-middle">
                    <div className="columns">
                        <Header>Остались вопросы?</Header>
                        <SubHeader>
                            Посмотрите, что наше сообщество советует новичкам:
                        </SubHeader>
                        <div className="row">
                            <div className="columns small-12 medium-12 large-2">
                                <div className="row small-up-2 medium-up-2 large-up-1">
                                    <div className="columns">
                                        <Link href="https://t.me/golos_support">
                                            <Icon
                                                name="new/telegram"
                                                size="2x"
                                            />Спросите в телеграме
                                        </Link>
                                    </div>
                                    <div className="columns">
                                        <Link href={WIKI_URL}>
                                            <Icon
                                                name="new/wikipedia"
                                                size="2x"
                                            />Посмотрите нашу википедию
                                        </Link>
                                    </div>
                                    <div className="columns">
                                        <Link href="mailto:support@golos.io">
                                            <Icon
                                                name="new/envelope"
                                                size="2x"
                                            />Напишите на почту
                                        </Link>
                                    </div>
                                    <div className="columns">
                                        <Link href="/submit?type=submit_feedback">
                                            <Icon
                                                name="new/monitor"
                                                size="2x"
                                            />Уточните через сайт
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {questionsLoading ? (
                                <div className="columns align-self-middle">
                                    <center>
                                        <LoadingIndicator
                                            type="circle"
                                            size="90px"
                                        />
                                    </center>
                                </div>
                            ) : (
                                <div className="columns">
                                    <div className="row small-up-1 medium-up-2 large-up-3">
                                        {questionsCards.map(post => (
                                            <div
                                                className="columns"
                                                key={post.id}
                                            >
                                                <CardPost
                                                    className={CardPost_W}
                                                    post={post}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Row>
            </Root>
        );
    }
}
