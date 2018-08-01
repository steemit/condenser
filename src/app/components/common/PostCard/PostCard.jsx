import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Link } from 'react-router';
import styled from 'styled-components';
import { connect } from 'react-redux';
import is from 'styled-is';
import tt from 'counterpart';
import extractContent from 'app/utils/ExtractContent';
import { immutableAccessor } from 'app/utils/Accessors';
import Userpic from 'app/components/elements/Userpic';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import { detransliterate } from 'app/utils/ParsersAndFormatters';
import Icon from 'golos-ui/Icon';
import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';
import VotePanel from '../VotePanel';
import { confirmVote } from 'src/app/helpers/votes';

const Header = styled.div`
    padding: 10px 0 6px;
    flex-shrink: 0;
`;

const HeaderLine = styled.div`
    display: flex;
    position: relative;
    align-items: center;
    padding: 2px 18px;
    z-index: 1;
    pointer-events: none;

    & > * {
        pointer-events: initial;
    }
`;

const AuthorBlock = styled.div`
    display: flex;
    align-items: center;
`;
const Avatar = styled.a`
    display: block;
    width: 46px;
    height: 46px;
    margin-right: 10px;
    border-radius: 50%;

    //& .Userpic {
    //    border: 2px solid #aaa;
    //}
`;
const PostDesc = styled.div`
    padding-bottom: 2px;
    font-family: ${a => a.theme.fontFamily};
`;
const AuthorName = styled.a`
    display: block;
    font-size: 15px;
    font-weight: 500;
    color: #333;
    text-decoration: none;
`;
const PostDate = styled.div`
    font-size: 13px;
    color: #959595;
    cursor: default;
`;
const Category = styled.div`
    height: 28px;
    padding: 0 12px;
    margin-right: 14px;
    border-radius: 6px;
    line-height: 26px;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #fff;
    background: #789821;
    cursor: default;
`;
const Toolbar = styled.div`
    display: flex;
    align-items: center;
`;
const ToolbarAction = styled.div`
    margin-right: 6px;

    &:last-child {
        margin-right: 0;
    }
`;
const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: ${({ forceWhite }) => (forceWhite ? '#fff' : '#393636')};
    cursor: pointer;
    transition: transform 0.15s;

    &:hover {
        transform: scale(1.15);
    }
`;

const BodyLink = styled(Link)`
    display: block;
    transition: none !important;

    ${is('line')`
        border-bottom: 2px solid #f3f3f3;
    `};

    ${is('half')`
        width: 50%;
    `};

    ${is('grid')`
        flex-shrink: 1;
        flex-grow: 1;
        overflow: hidden;
    `};
`;

const Body = styled.div`
    position: relative;
    padding: 0 18px 12px;
`;
const PostTitle = styled.div`
    font-size: 20px;
    font-family: ${({ theme }) => theme.fontFamilyBold};
    color: #212121;
    //line-height: 34px;
    line-height: 29px;
    margin-bottom: 8px;
`;
const PostBody = styled.div`
    font-family: ${({ theme }) => theme.fontFamily};
    color: #959595;
`;

const Footer = styled.div`
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 12px 18px;
    z-index: 1;
    pointer-events: none;

    & > * {
        pointer-events: initial;
    }

    ${is('grid')`
        display: block;
    `};
`;

const VotePanelStyled = styled(VotePanel)`
    ${is('grid')`
        justify-content: space-around;
    `};
`;

const PostImage = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 50%;
    border-radius: 8px;
    background: url('${a => a.src}') no-repeat center;
    background-size: cover;
    z-index: 0;
    
    &:after {
        position: absolute;
        border-radius: 8px;
        content: '';
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(100,100,100,0.15);
        //transition: background-color 0.15s;
    }
    
    ${is('grid')`
        top: unset;
        left: 0;
        width: unset;
        height: 133px;
    `}
    
    //&:hover:after {
    //    background-color: rgba(127,127,127,0);
    //}
`;

const Filler = styled.div`
    flex-grow: 1;
`;

const Root = styled.div`
    position: relative;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);

    ${is('grid')`
        display: flex;
        flex-direction: column;
        height: 338px;
    `};

    &.PostCard_image.PostCard_grid {
        ${Footer} {
            opacity: 0;
            transition: opacity 0.25s;
        }

        &:hover ${Footer} {
            opacity: 1;
        }

        ${Footer} {
            margin-top: 82px;
        }

        ${PostImage}:after {
            background-color: rgba(0, 0, 0, 0);
            transition: background-color 0.15s;
        }

        &:hover ${PostImage}:after {
            background-color: rgba(0, 0, 0, 0.2);
        }

        &:after {
            position: absolute;
            content: '';
            height: 30px;
            left: 0;
            right: 0;
            bottom: 133px;
            background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
            pointer-events: none;
        }
    }
`;

class PostCard extends PureComponent {
    static propTypes = {
        permLink: PropTypes.string,
        myAccount: PropTypes.string,
        data: PropTypes.object,
        grid: PropTypes.bool,
        onClick: PropTypes.func,
    };

    state = {
        myVote: this._getMyVote(this.props),
    };

    componentWillReceiveProps(newProps) {
        if (this.props.data !== newProps.data) {
            this.setState({
                myVote: this._getMyVote(newProps),
            });
        }
    }

    _getMyVote(props) {
        const { data, myAccount } = props;
        const votes = data.get('active_votes');

        for (let vote of votes) {
            if (vote.get('voter') === myAccount) {
                const v = vote.toJS();
                v.weight = parseInt(v.weight || 0, 10);
                return v;
            }
        }

        return null;
    }

    render() {
        const { data, className, grid } = this.props;

        const p = extractContent(immutableAccessor, data);
        const withImage = Boolean(p.image_link);

        this._url = p.link;

        if (withImage) {
            p.desc = p.desc.replace(p.image_link, '');
        }

        return (
            <Root
                className={cn(
                    {
                        PostCard_image: withImage,
                        PostCard_grid: grid,
                    },
                    className
                )}
                grid={grid}
            >
                {this._renderHeader(withImage)}
                {this._renderBody(withImage, p)}
                {this._renderFooter(withImage)}
            </Root>
        );
    }

    _renderHeader(withImage) {
        const { data, grid } = this.props;

        const author = data.get('author');
        const category = detransliterate(data.get('category'));

        return (
            <Header>
                <HeaderLine>
                    <AuthorBlock>
                        <Avatar href={`/@${author}`}>
                            <Userpic account={author} size={42} />
                        </Avatar>
                        <PostDesc>
                            <AuthorName href={`/@${author}`}>{author}</AuthorName>
                            <PostDate>
                                <TimeAgoWrapper date={data.get('created')} />
                            </PostDate>
                        </PostDesc>
                    </AuthorBlock>
                    <Filler />
                    {grid ? null : <Category>{category}</Category>}
                    <Toolbar>
                        <ToolbarAction>
                            <IconWrapper
                                forceWhite={withImage && !grid}
                                data-tooltip="Закрепить пост"
                            >
                                <Icon name="clip" width={12} height={22} />
                            </IconWrapper>
                        </ToolbarAction>
                        <ToolbarAction>
                            <IconWrapper forceWhite={withImage && !grid} data-tooltip="В избранное">
                                <Icon name="star" width={20} height={20} />
                            </IconWrapper>
                        </ToolbarAction>
                    </Toolbar>
                </HeaderLine>
                {grid ? (
                    <HeaderLine>
                        <Category>{category}</Category>
                        <Filler />
                        {/*<Brilliant dangerouslySetInnerHTML={{ __html: brilliantSvg }} />*/}
                    </HeaderLine>
                ) : null}
            </Header>
        );
    }

    _renderBody(withImage, p) {
        const { grid } = this.props;

        return (
            <BodyLink
                to={p.link}
                line={!grid || !withImage ? 1 : 0}
                half={withImage && !grid ? 1 : 0}
                grid={grid ? 1 : 0}
                onClick={this._onClick}
            >
                <Body>
                    <PostTitle>{p.title}</PostTitle>
                    <PostBody dangerouslySetInnerHTML={{ __html: p.desc }} />
                </Body>
                {withImage ? <PostImage grid={grid} src={p.image_link} /> : null}
            </BodyLink>
        );
    }

    _renderFooter(withImage) {
        const { data, myAccount, grid } = this.props;

        return (
            <Footer grid={grid}>
                <VotePanelStyled
                    data={data}
                    me={myAccount}
                    whiteTheme={withImage && grid}
                    grid={grid}
                    onChange={this._onVoteChange}
                />
                {grid ? null : (
                    <Fragment>
                        <Filler />
                        {/*<Brilliant dangerouslySetInnerHTML={{ __html: brilliantSvg }} />*/}
                    </Fragment>
                )}
            </Footer>
        );
    }

    _onClick = e => {
        if (this.props.onClick) {
            e.preventDefault();
            this.props.onClick({
                permLink: this.props.permLink,
                url: this._url,
            });
        }
    };

    _onVoteChange = async percent => {
        const props = this.props;
        const { myVote } = this.state;

        if (await confirmVote(myVote, percent)) {
            this.props.onVote(percent, {
                myAccount: props.myAccount,
                author: props.data.get('author'),
                permlink: props.data.get('permlink'),
            });
        }
    };
}

export default connect(
    (state, props) => {
        return {
            myAccount: state.user.getIn(['current', 'username']),
            data: state.global.getIn(['content', props.permLink]),
        };
    },
    dispatch => ({
        onVote: (percent, { myAccount, author, permlink }) => {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'vote',
                    operation: {
                        voter: myAccount,
                        author,
                        permlink,
                        weight: Math.round(percent * 10000),
                        __config: {
                            title: percent < 0 ? tt('voting_jsx.confirm_flag') : null,
                        },
                    },
                    successCallback: () => dispatch(user.actions.getAccount()),
                })
            );
        },
    })
)(PostCard);
