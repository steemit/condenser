import React, { PureComponent } from 'react';
import styled from 'styled-components';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import CardPost from 'src/app/components/welcome/CardPost';

const Root = styled.section`
    padding: 20px 0;
    background-color: #f8f8f8;
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
    margin-bottom: 40px;
    line-height: 1.06;
    letter-spacing: 0.6px;
    font-size: 36px;
    font-family: ${a => a.theme.fontFamilySerif};
    color: #333;
`;

const SubHeader = styled.div`
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 1.4px;
    color: #333;
    text-transform: uppercase;
    margin-bottom: 30px;
`;

const Tags = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: wrap;

    @media screen and (max-width: 39.9375em) {
        flex-direction: row;
    }
`;

const Tag = styled.div`
    padding: 9px 17px;
    margin-bottom: 15px;
    margin-right: 10px;
    border-radius: 6px;
    background-color: #eeefff;
    border: 1px solid #848ade;
    font-size: 15px;
    line-height: 1;
    color: #3f46ad;
    cursor: pointer;
    transition: background-color 0.5s;

    &:hover,
    &.active {
        background-color: #fff;
    }
`;

export default class Initial extends PureComponent {
    render() {
        const {
            tags,
            tagsActiveId,
            tagsLoading,
            tagsCards,
            className,
        } = this.props;

        return (
            <Root className={className}>
                <Row className="row align-middle">
                    <div className="columns">
                        <Header>Что почитать?</Header>
                        <div className="row">
                            <div className="columns small-12 medium-3 large-2">
                                <SubHeader>Популярные темы:</SubHeader>
                                <Tags>
                                    {tags.map(tag => (
                                        <Tag
                                            key={tag.id}
                                            className={
                                                tag.id === tagsActiveId
                                                    ? 'active'
                                                    : ''
                                            }
                                            onClick={() =>
                                                this.fetchTagContents(tag)
                                            }
                                        >
                                            {tag.name}
                                        </Tag>
                                    ))}
                                </Tags>
                            </div>
                            {tagsLoading ? (
                                <div className="columns align-self-middle">
                                    <center>
                                        <LoadingIndicator type="circle" size="90px" />
                                    </center>
                                </div>
                            ) : (
                                <div className="columns">
                                    <div className="row small-up-1 medium-up-2 large-up-3">
                                        {tagsCards[tagsActiveId] &&
                                            tagsCards[tagsActiveId].map(
                                                post => (
                                                    <div
                                                        className="columns"
                                                        key={post.id}
                                                    >
                                                        <CardPost
                                                            className={
                                                                CardPost_W
                                                            }
                                                            post={post}
                                                        />
                                                    </div>
                                                )
                                            )}
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
