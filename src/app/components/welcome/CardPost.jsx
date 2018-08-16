import React, { Component } from 'react';
import styled from 'styled-components';
import Userpic from 'app/components/elements/Userpic';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import LocalizedCurrency from 'app/components/elements/LocalizedCurrency';
import Icon from 'app/components/elements/Icon';
import { parsePayoutAmount } from 'app/utils/ParsersAndFormatters';
import extractContent from 'app/utils/ExtractContent';
import { objAccessor } from 'app/utils/Accessors';

const Root = styled.div`
    border-radius: 8.5px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: box-shadow 0.3s ease 0s;

    &:hover {
        box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1);
    }
`;

const Main = styled.a`
    display: block;
    height: 342px;
    overflow: hidden;

    & > img {
        width: 100%;
        z-index: 1;
        position: relative;
    }
`;

const Content = styled.div`
    display: block;
    height: 100%;
    padding: 26px 46px 26px 26px;
`;

const ContentTitle = styled.div`
    font-family: ${a => a.theme.fontFamilySerif};
    font-size: 17px;
    line-height: 1.2;
    color: #212121;
    margin-bottom: 15px;
`;

const ContentText = styled.div`
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    line-height: 1.57;
    color: #9fa3a7;
`;

const Footer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    padding: 0 16px;
    box-shadow: 0px -7px 20px #fff;
`;

const FooterProfile = styled.a`
    display: flex;
    align-items: center;
`;

const FooterInfo = styled.div`
    margin-left: 5px;
`;

const FooterName = styled.div`
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    color: #333333;
    margin-bottom: 7px;
`;

const FooterTime = styled.div`
    font-size: 12px;
    font-weight: 300;
    line-height: 1;
    color: #9fa3a7;
`;

const FooterActions = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const FooterVotes = styled.div`
    display: flex;
    align-items: center;
    margin: 3px 5px;
    font-size: 12px;
    font-weight: 300;
    line-height: 1.28;
    color: #757575;

    .Icon {
        fill: #333;
        margin-right: 5px;
    }

    &:hover {
        .Icon {
            fill: #222;
        }
    }
`;

const FooterPayout = styled.div`
    padding: 4px 7px;
    border: 1px solid #e1e1e1;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 300;
    line-height: 1;
    text-align: center;
    color: #757575;
    white-space: nowrap;
`;

export default class CardPost extends Component {
    render() {
        const { post } = this.props;

        const p = extractContent(objAccessor, post);

        const max_payout = parsePayoutAmount(post.max_accepted_payout);
        const pending_payout = parsePayoutAmount(post.pending_payout_value);
        const total_author_payout = parsePayoutAmount(post.total_payout_value);
        const total_curator_payout = parsePayoutAmount(
            post.curator_payout_value
        );

        let payout =
            pending_payout + total_author_payout + total_curator_payout;
        if (payout < 0.0) payout = 0.0;
        if (payout > max_payout) payout = max_payout;

        return (
            <Root>
                <Main href={p.link}>
                    {p.image_link && (
                        <img src={p.image_link} alt="" title={p.title} />
                    )}
                    <Content>
                        <ContentTitle>{p.title}</ContentTitle>
                        <ContentText>{p.desc}</ContentText>
                    </Content>
                </Main>
                <Footer>
                    <FooterProfile href={`/@${p.author}`} title={p.author}>
                        <Userpic account={p.author} />
                        <FooterInfo>
                            <FooterName>{p.author}</FooterName>
                            <FooterTime>
                                <TimeAgoWrapper date={p.created} />
                            </FooterTime>
                        </FooterInfo>
                    </FooterProfile>
                    <FooterActions>
                        <FooterVotes>
                            <Icon name="new/like" />
                            {post.net_votes}
                        </FooterVotes>
                        <FooterPayout>
                            <LocalizedCurrency amount={payout} />
                        </FooterPayout>
                    </FooterActions>
                </Footer>
            </Root>
        );
    }
}
