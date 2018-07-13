import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import is from 'styled-is';
import tt from 'counterpart';
import extractContent from 'app/utils/ExtractContent';
import { immutableAccessor } from 'app/utils/Accessors';
import Userpic from 'app/components/elements/Userpic';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import { detransliterate } from 'app/utils/ParsersAndFormatters';
import likeSvg from 'app/assets/icons/profile/like2.svg';
import brilliantSvg from 'app/assets/icons/profile/brilliant.svg';
import starSvg from 'app/assets/icons/profile/star.svg';
import clipSvg from 'app/assets/icons/profile/clip.svg';
import DialogManager from 'app/components/elements/common/DialogManager';
import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';

const Root = styled.div`
    position: relative;
    margin-bottom: 20px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
`;

const Header = styled.div`
    display: flex;
    position: relative;
    align-items: center;
    padding: 12px 18px 8px;
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
const Icon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: ${a => (a.withImage ? '#fff' : '#393636')};
    cursor: pointer;
    transition: transform 0.15s;

    &:hover {
        transform: scale(1.15);
    }
`;
const IconClip = Icon.extend`
    & > svg {
        width: 12px;
        height: 22px;
    }
`;

const IconStar = Icon.extend`
    & > svg {
        width: 20px;
        height: 20px;
    }

    #bg {
        display: none;
    }

    ${is('active')`
        #bg {
            display: initial;
        }
    `};
`;

const BodyLink = styled.a`
    display: block;
    //text-decoration: none;
`;

const Body = styled.div`
    position: relative;
    padding: 0 18px 12px;
    border-bottom: 2px solid #f3f3f3;

    ${is('half')`
        width: 50%;
    `};
`;
const PostTitle = styled.div`
    font-size: 20px;
    font-family: ${a => a.theme.fontFamilyBold};
    color: #212121;
    line-height: 34px;
    margin-bottom: 8px;
`;
const PostBody = styled.div`
    font-family: ${a => a.theme.fontFamily};
    color: #959595;
`;

const Footer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    padding: 12px 18px;
    z-index: 1;
    pointer-events: none;

    & > * {
        pointer-events: initial;
    }
`;

const Brilliant = styled.div`
    width: 64px;
    height: 62px;
    margin: -10px -10px -10px 0;
`;

const LikeCount = styled.span`
    color: #959595;
    transition: color 0.15s;
`;

const LikeIcon = styled.div`
    margin-right: 8px;
    vertical-align: middle;
    color: #393636;
    transition: color 0.2s;

    & > svg {
        width: 20px;
        height: 20px;
    }
`;

const LikeIconNeg = LikeIcon.extend`
    transform: scale(1, -1);
`;

const LikeBlock = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    padding-right: 4px;
    
    .filler {
        display: none;
    }

    ${is('active')` .filler {
        display: initial;
    }`}

    &:hover, &:hover ${LikeCount}, &:hover ${LikeIcon}, &:hover ${LikeIconNeg} {
        color: #000 !important;
    }
    //color: #74b94d;
    //color: #f93131;
`;

const Money = styled.div`
    height: 26px;
    padding: 0 9px;
    margin: 0 10px;
    border-radius: 100px;
    border: 1px solid #959595;
    color: #393636;
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
    //
    //&:hover:after {
    //    background-color: rgba(127,127,127,0);
    //}
`;

const Filler = styled.div`
    flex-grow: 1;
`;

class PostCard extends PureComponent {
    static propTypes = {
        permLink: PropTypes.string,
        myAccount: PropTypes.string,
        data: PropTypes.object,
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
        const { data } = this.props;

        const p = extractContent(immutableAccessor, data);
        const withImage = Boolean(p.image_link);

        if (withImage) {
            p.desc = p.desc.replace(p.image_link, '');
        }

        return (
            <Root>
                {this._renderHeader(withImage)}
                {this._renderBody(withImage, p)}
                {this._renderFooter()}
            </Root>
        );
    }

    _renderHeader(withImage) {
        const { data } = this.props;

        const author = data.get('author');
        const category = detransliterate(data.get('category'));

        return (
            <Header>
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
                <Category>{category}</Category>
                <Toolbar>
                    <ToolbarAction>
                        <IconClip
                            withImage={withImage}
                            data-tooltip="Закрепить пост"
                            dangerouslySetInnerHTML={{ __html: clipSvg }}
                        />
                    </ToolbarAction>
                    <ToolbarAction>
                        <IconStar
                            withImage={withImage}
                            data-tooltip="В избранное"
                            active={false}
                            dangerouslySetInnerHTML={{ __html: starSvg }}
                        />
                    </ToolbarAction>
                </Toolbar>
            </Header>
        );
    }

    _renderBody(withImage, p) {
        return (
            <BodyLink href={p.link} onClick={e => this._onClick(e, p.link)}>
                <Body half={withImage}>
                    <PostTitle>{p.title}</PostTitle>
                    <PostBody dangerouslySetInnerHTML={{ __html: p.desc }} />
                </Body>
                {withImage ? <PostImage src={p.image_link} /> : null}
            </BodyLink>
        );
    }

    _renderFooter() {
        const { data, myAccount } = this.props;

        const votes = data.get('active_votes');
        let myVote;
        let dislikesCount = 0;

        for (let vote of votes.toJS()) {
            if (vote.percent < 0) {
                dislikesCount++;
            }

            if (vote.voter === myAccount) {
                myVote = vote;
            }
        }

        return (
            <Footer>
                <LikeBlock active={myVote && myVote.percent > 0} onClick={this._onLikeClick}>
                    <LikeIcon dangerouslySetInnerHTML={{ __html: likeSvg }} />
                    <LikeCount>{data.get('net_votes')}</LikeCount>
                </LikeBlock>
                <Money>$1.07</Money>
                <LikeBlock active={myVote && myVote.percent < 0} onClick={this._onDislikeClick}>
                    <LikeIconNeg dangerouslySetInnerHTML={{ __html: likeSvg }} />
                    <LikeCount>{dislikesCount}</LikeCount>
                </LikeBlock>
                <Filler />
                <Brilliant dangerouslySetInnerHTML={{ __html: brilliantSvg }} />
            </Footer>
        );
    }

    _onClick = (e, link) => {
        e.preventDefault();
        browserHistory.push(link);
    };

    _onLikeClick = () => {
        const { myVote } = this.state;

        if (myVote && myVote.percent > 0) {
            this._setVote(0);
        } else {
            this._setVote(1);
        }
    };

    _onDislikeClick = () => {
        const { myVote } = this.state;

        if (myVote && myVote.percent < 0) {
            this._setVote(0);
        } else {
            this._setVote(-1);
        }
    };

    async _setVote(weight) {
        const props = this.props;
        const { myVote } = this.state;

        if (myVote) {
            let action;

            if (weight === 0) {
                action = tt('voting_jsx.removing_your_vote');
            } else if (weight < 0 && myVote.percent > 0) {
                action = tt('voting_jsx.changing_to_a_downvote');
            } else if (weight > 0 && myVote.percent < 0) {
                action = tt('voting_jsx.changing_to_an_upvote');
            }

            if (action) {
                if (
                    !(await DialogManager.confirm(
                        action + tt('voting_jsx.we_will_reset_curation_rewards_for_this_post')
                    ))
                ) {
                    return;
                }
            }
        }

        this.props.onVote(weight, {
            myAccount: props.myAccount,
            author: props.data.get('author'),
            permlink: props.data.get('permlink'),
        });
    }
}

export default connect(
    (state, props) => {
        return {
            myAccount: state.user.getIn(['current', 'username']),
            data: state.global.getIn(['content', props.permLink]),
        };
    },
    dispatch => ({
        onVote: (weight, { myAccount, author, permlink }) => {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'vote',
                    operation: {
                        voter: myAccount,
                        author,
                        permlink,
                        weight: weight * 10000,
                        __config: {
                            title: weight < 0 ? tt('voting_jsx.confirm_flag') : null,
                        },
                    },
                    successCallback: () => dispatch(user.actions.getAccount()),
                })
            );
        },
    })
)(PostCard);
