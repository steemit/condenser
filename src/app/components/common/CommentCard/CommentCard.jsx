import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Link } from 'react-router';
import styled from 'styled-components';
import { isNot } from 'styled-is';
import { connect } from 'react-redux';
import tt from 'counterpart';
import extractContent from 'app/utils/ExtractContent';
import { immutableAccessor } from 'app/utils/Accessors';
import Userpic from 'app/components/elements/Userpic';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import { detransliterate } from 'app/utils/ParsersAndFormatters';
import CommentFormLoader from 'app/components/modules/CommentForm/loader';
import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';
import Icon from 'golos-ui/Icon';
import Button from 'golos-ui/Button';
import VotePanel from '../VotePanel';
import { confirmVote } from 'src/app/helpers/votes';
import ReplyBlock from '../ReplyBlock';

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
    margin-right: 4px;
    border-radius: 6px;
    line-height: 26px;
    font-size: 14px;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #fff;
    background: #789821;
    cursor: default;
    overflow: hidden;

    ${isNot('isCommentOpen')`
        display: none;
    `};
`;

const Title = styled.div`
    display: flex;
    justify-content: space-between;
    position: relative;
    padding: 0 18px;
    margin-bottom: 8px;

    ${isNot('isCommentOpen')`
        display: none;
    `};
`;
const TitleIcon = Icon.extend`
    position: relative;
    height: 20px;
    min-width: 24px;
    margin-right: 6px;
    margin-bottom: -3px;
`;
const TitleLink = styled(Link)`
    color: #212121 !important;
    text-decoration: underline;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const PostBody = styled(Link)`
    display: block;
    padding: 0 18px;
    font-family: ${a => a.theme.fontFamily};
    color: #959595 !important;

    ${isNot('isCommentOpen')`
        display: none;
    `};
`;

const Footer = styled.div`
    position: relative;
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    padding: 12px 0 0 0;
    z-index: 1;
    pointer-events: none;

    & > * {
        pointer-events: initial;
    }

    ${isNot('isCommentOpen')`
        display: none;
    `};
`;

const Filler = styled.div`
    flex-grow: 1;
`;

const Root = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 8px;
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);

    ${isNot('isCommentOpen')`
        justify-content: center;
        height: 50px;
    `};
`;

const Reply = styled.div`
    padding: 0 18px 18px 18px;
`;

const IconEditWrapper = styled.div`
    min-width: 30px;
    min-height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #aaa;
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
        color: #333;
    }
`;

const ButtonStyled = styled(Button)`
    margin-left: 18px;
`;

const ToggleCommentOpen = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 30px;
    min-height: 30px;
    cursor: pointer;

    ${isNot('isCommentOpen')`
        transform: rotate(180deg); 
        color: #b7b7ba;
    `};
`;

const ReLinkWrapper = styled.div`
    padding-right: 10px;
    display: flex;
    align-items: center;
    line-height: 29px;
    font-family: ${a => a.theme.fontFamily};
    font-size: 20px;
    font-weight: bold;
    color: #212121;
    overflow: hidden;
`;

const CommentVotePanel = styled(VotePanel)`
    width: 257px;

    @media (min-width: 890px) and (max-width: 1087px), (max-width: 502px) {
        flex-grow: 1;
        justify-content: space-between;
    }
`;

const CommentReplyBlock = styled(ReplyBlock)`
    margin: 0;

    @media (min-width: 890px) and (max-width: 1087px), (max-width: 502px) {
        flex-grow: 1;
        justify-content: center;
    }
`;

class CommentCard extends PureComponent {
    static propTypes = {
        permLink: PropTypes.string,
        myAccountName: PropTypes.string,
        data: PropTypes.object,
        grid: PropTypes.bool,
        allowInlineReply: PropTypes.bool,
    };

    state = {
        myVote: this._getMyVote(this.props),
        showReply: false,
        edit: false,
        isCommentOpen: true,
    };

    componentWillReceiveProps(newProps) {
        if (this.props.data !== newProps.data) {
            this.setState({
                myVote: this._getMyVote(newProps),
            });
        }
    }

    _getMyVote(props) {
        const { data, myAccountName } = props;
        const votes = data.get('active_votes');

        for (let vote of votes) {
            if (vote.get('voter') === myAccountName) {
                const v = vote.toJS();
                v.weight = parseInt(v.weight || 0, 10);
                return v;
            }
        }

        return null;
    }

    render() {
        const { className } = this.props;
        const { showReply, isCommentOpen } = this.state;

        return (
            <Root className={cn(className)} isCommentOpen={isCommentOpen}>
                {this._renderHeader()}
                {this._renderBodyRe()}
                {this._renderBodyText()}
                {this._renderFooter()}
                {Boolean(showReply) && this._renderReplyEditor()}
            </Root>
        );
    }

    _renderHeader() {
        const { isCommentOpen } = this.state;
        const { parentLink, title, _data } = this.props;
        const author = _data.author;
        const category = detransliterate(_data.category);

        return (
            <Header isCommentOpen={isCommentOpen}>
                <HeaderLine>
                    {isCommentOpen ? (
                        <AuthorBlock>
                            <Avatar href={`/@${author}`}>
                                <Userpic account={author} size={42} />
                            </Avatar>
                            <PostDesc>
                                <AuthorName href={`/@${author}`}>{author}</AuthorName>
                                <PostDate>
                                    <TimeAgoWrapper date={_data.created} />
                                </PostDate>
                            </PostDesc>
                        </AuthorBlock>
                    ) : (
                        <ReLinkWrapper>
                            <TitleIcon name="comment" />
                            {tt('g.re2')}:{' '}
                            <TitleLink to={parentLink} onClick={this._onTitleClick}>
                                {title}
                            </TitleLink>
                        </ReLinkWrapper>
                    )}
                    <Filler />
                    <Category isCommentOpen={isCommentOpen}>{category}</Category>
                    <ToggleCommentOpen onClick={this._toggleComment} isCommentOpen={isCommentOpen}>
                        <Icon name="chevron" width="12" height="7" />
                    </ToggleCommentOpen>
                </HeaderLine>
            </Header>
        );
    }

    _renderBodyRe() {
        const { myAccountName } = this.props;
        const { edit, isCommentOpen } = this.state;
        const { parentLink, title, _data } = this.props;
        const showEditButton = myAccountName === _data.author;

        return (
            <Title isCommentOpen={isCommentOpen}>
                <ReLinkWrapper>
                    <TitleIcon name="comment" />
                    {tt('g.re2')}:{' '}
                    <TitleLink to={parentLink} onClick={this._onTitleClick}>
                        {title}
                    </TitleLink>
                </ReLinkWrapper>
                {Boolean(showEditButton && !edit) && (
                    <IconEditWrapper
                        onClick={this._onEditClick}
                        data-tooltip={'Редактировать комментарий'}
                    >
                        <Icon name="pen" size={20} />
                    </IconEditWrapper>
                )}
            </Title>
        );
    }

    _renderBodyText() {
        const { edit, isCommentOpen } = this.state;
        const { _content, _data, htmlContent } = this.props;

        return (
            <Fragment>
                {edit ? (
                    <CommentFormLoader
                        reply
                        editMode
                        params={_data}
                        onSuccess={this._onEditDone}
                        onCancel={this._onEditDone}
                    />
                ) : (
                    <PostBody
                        to={_content.link}
                        onClick={this._onClick}
                        dangerouslySetInnerHTML={htmlContent}
                        isCommentOpen={isCommentOpen}
                    />
                )}
            </Fragment>
        );
    }

    _renderFooter() {
        const { data, myAccountName, allowInlineReply, _content, _data } = this.props;

        return (
            <Footer isCommentOpen={this.state.isCommentOpen}>
                <CommentVotePanel data={data} me={myAccountName} onChange={this._onVoteChange} />
                <CommentReplyBlock
                    count={data.get('children')}
                    link={_content.link}
                    text="Комментарии"
                />
                {Boolean(allowInlineReply && _data.author !== myAccountName) && (
                    <ButtonStyled light onClick={this._onReplyClick}>
                        <Icon name="comment" size={18} /> Ответить
                    </ButtonStyled>
                )}
            </Footer>
        );
    }

    _renderReplyEditor() {
        const { _data } = this.props;

        return (
            <Reply>
                <CommentFormLoader
                    reply
                    params={_data}
                    onSuccess={this._onReplySuccess}
                    onCancel={this._onReplyCancel}
                />
            </Reply>
        );
    }

    _onTitleClick = e => {
        const { _data } = this.props;
        if (this.props.onClick) {
            e.preventDefault();

            const url = e.currentTarget.href;

            if (_data.parent_author) {
                this.props.onClick({
                    permLink: `${_data.parent_author}/${_data.parent_permlink}`,
                    url,
                });
            } else {
                this.props.onClick({
                    permLink: this.props.permLink,
                    url,
                });
            }
        }
    };

    _onClick = e => {
        if (this.props.onClick) {
            e.preventDefault();
            this.props.onClick({
                permLink: this.props.permLink,
                url: this.props._content.link,
            });
        }
    };

    _onReplySuccess = () => {
        this.setState({
            showReply: false,
        });

        this.props.onNotify('Ответ опубликован');
    };

    _onReplyCancel = () => {
        this.setState({
            showReply: false,
        });
    };

    _onEditClick = () => {
        this.setState({
            edit: true,
        });
    };

    _onEditDone = () => {
        this.setState({
            edit: false,
        });
    };

    _onVoteChange = async percent => {
        const { data, myAccountName } = this.props;
        const { myVote } = this.state;

        if (await confirmVote(myVote, percent)) {
            this.props.onVote(percent, {
                myAccountName: myAccountName,
                author: data.get('author'),
                permlink: data.get('permlink'),
            });
        }
    };

    _onReplyClick = () => {
        this.setState({
            showReply: true,
        });
    };

    _toggleComment = () => {
        this.setState({
            edit: false,
            isCommentOpen: !this.state.isCommentOpen,
        });
    };
}

export default connect(
    (state, props) => {
        const data = state.global.getIn(['content', props.permLink]);
        const _data = data.toJS();
        const _content = extractContent(immutableAccessor, data);
        const htmlContent = { __html: _content.desc };

        let parentLink = _content.link;
        let title = _content.title;

        if (_data.parent_author) {
            title = _data.root_title;
            parentLink = `/${_data.category}/@${_data.parent_author}/${_data.parent_permlink}`;
        }

        return {
            data,
            title,
            parentLink,
            htmlContent,
            _data,
            _content,
            myAccountName: state.user.getIn(['current', 'username']),
        };
    },
    dispatch => ({
        onVote: (percent, { myAccountName, author, permlink }) => {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'vote',
                    operation: {
                        voter: myAccountName,
                        author,
                        permlink,
                        weight: percent * 10000,
                        __config: {
                            title: percent < 0 ? tt('voting_jsx.confirm_flag') : null,
                        },
                    },
                    successCallback: () => dispatch(user.actions.getAccount()),
                })
            );
        },
        onNotify: text => {
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    message: text,
                    dismissAfter: 5000,
                },
            });
        },
    })
)(CommentCard);
