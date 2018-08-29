import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { Link } from 'react-router';
import styled from 'styled-components';
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
    display: ${props => (props.isCommentOpen ? 'block' : 'none')};
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
    overflow: hidden;
    text-overflow: ellipsis;
    color: #fff;
    background: #789821;
    cursor: default;
`;

const Title = styled.div`
    display: flex;
    position: relative;
    padding: 0 18px;
    ${props => (props.isCommentOpen ? `margin-bottom: 8px;` : `justify-content: space-between;`)};
    line-height: 29px;
    font-family: ${a => a.theme.fontFamily};
    font-size: 20px;
    font-weight: bold;
    color: #212121;
`;
const TitleIcon = Icon.extend`
    position: relative;
    height: 20px;
    margin-right: 6px;
    margin-bottom: -3px;
`;
const TitleLink = styled(Link)`
    color: #212121 !important;
    text-decoration: underline;
`;

const PostBody = styled(Link)`
    display: ${props => (props.isCommentOpen ? 'block' : 'none')};
    padding: 0 18px;
    font-family: ${a => a.theme.fontFamily};
    color: #959595 !important;
`;

const Footer = styled.div`
    position: relative;
    display: ${props => (props.isCommentOpen ? 'flex' : 'none')};
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
    ${props =>
        props.isCommentOpen
            ? ``
            : `justify-content: center;
               height: 50px;`};
`;

const Reply = styled.div`
    padding: 0 18px 18px 18px;
`;

const IconEdit = Icon.extend`
    position: absolute;
    top: 6px;
    right: 23px;
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
    width: 30px;
    height: 30px;
    cursor: pointer;
    ${props =>
        props.isCommentOpen
            ? ``
            : `transform: rotate(180deg); 
               color: #b7b7ba;`};
`;

const ReLinkWrapper = styled.div`
    display: flex;
    align-items: center;
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
        const { data, className } = this.props;
        const { showReply, isCommentOpen } = this.state;

        this._data = data.toJS();
        this._content = extractContent(immutableAccessor, data);

        return (
            <Root className={cn(className)} isCommentOpen={isCommentOpen}>
                {this._renderHeader()}
                {this._renderBodyRe()}
                {this._renderBodyText()}
                {this._renderFooter()}
                {showReply ? this._renderReplyEditor() : null}
            </Root>
        );
    }

    _renderHeader() {
        const author = this._data.author;
        const category = detransliterate(this._data.category);

        return (
            <Header isCommentOpen={this.state.isCommentOpen}>
                <HeaderLine>
                    <AuthorBlock>
                        <Avatar href={`/@${author}`}>
                            <Userpic account={author} size={42} />
                        </Avatar>
                        <PostDesc>
                            <AuthorName href={`/@${author}`}>{author}</AuthorName>
                            <PostDate>
                                <TimeAgoWrapper date={this._data.created} />
                            </PostDate>
                        </PostDesc>
                    </AuthorBlock>
                    <Filler />
                    <Category>{category}</Category>
                    <ToggleCommentOpen
                        onClick={this._toggleComment}
                        isCommentOpen={this.state.isCommentOpen}
                    >
                        <Icon name="chevron" width="12" height="7" />
                    </ToggleCommentOpen>
                </HeaderLine>
            </Header>
        );
    }

    _renderBodyRe() {
        const { myAccountName } = this.props;
        const { edit, isCommentOpen } = this.state;

        let title = this._content.title;
        let parentLink = this._content.link;

        if (this._data.parent_author) {
            title = this._data.root_title;
            parentLink = `/${this._data.category}/@${this._data.parent_author}/${
                this._data.parent_permlink
            }`;
        }

        const showEditButton = myAccountName === this._data.author;

        return (
            <Title isCommentOpen={this.state.isCommentOpen}>
                <ReLinkWrapper>
                    <TitleIcon name="comment" />
                    {tt('g.re2')}:{' '}
                    <TitleLink to={parentLink} onClick={this._onTitleClick}>
                        {title}
                    </TitleLink>
                </ReLinkWrapper>
                {showEditButton && !edit && isCommentOpen ? (
                    <IconEdit
                        name="pen"
                        size={20}
                        data-tooltip={'Редактировать комментарий'}
                        onClick={this._onEditClick}
                    />
                ) : null}
                {!isCommentOpen ? (
                    <ToggleCommentOpen onClick={this._toggleComment}>
                        <Icon name="chevron" width="12" height="7" />
                    </ToggleCommentOpen>
                ) : null}
            </Title>
        );
    }

    _renderBodyText() {
        const { edit } = this.state;

        return (
            <Fragment>
                {edit ? (
                    <CommentFormLoader
                        reply
                        editMode
                        params={this._data}
                        onSuccess={this._onEditDone}
                        onCancel={this._onEditDone}
                    />
                ) : (
                    <PostBody
                        to={this._content.link}
                        onClick={this._onClick}
                        dangerouslySetInnerHTML={{ __html: this._content.desc }}
                        isCommentOpen={this.state.isCommentOpen}
                    />
                )}
            </Fragment>
        );
    }

    _renderFooter() {
        const { data, myAccountName, allowInlineReply } = this.props;

        return (
            <Footer isCommentOpen={this.state.isCommentOpen}>
                <CommentVotePanel data={data} me={myAccountName} onChange={this._onVoteChange} />
                <CommentReplyBlock
                    count={data.get('children')}
                    link={this._content.link}
                    text="Комментарии"
                />
                {allowInlineReply && this._data.author !== myAccountName ? (
                    <ButtonStyled light onClick={this._onReplyClick}>
                        <Icon name="comment" size={18} /> Ответить
                    </ButtonStyled>
                ) : null}
            </Footer>
        );
    }

    _renderReplyEditor() {
        const { data } = this.props;

        return (
            <Reply>
                <CommentFormLoader
                    reply
                    params={data.toJS()}
                    onSuccess={this._onReplySuccess}
                    onCancel={this._onReplyCancel}
                />
            </Reply>
        );
    }

    _onTitleClick = e => {
        if (this.props.onClick) {
            e.preventDefault();

            const url = e.currentTarget.href;

            if (this._data.parent_author) {
                this.props.onClick({
                    permLink: `${this._data.parent_author}/${this._data.parent_permlink}`,
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
                url: this._content.link,
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
        const props = this.props;
        const { myVote } = this.state;

        if (await confirmVote(myVote, percent)) {
            this.props.onVote(percent, {
                myAccountName: props.myAccountName,
                author: props.data.get('author'),
                permlink: props.data.get('permlink'),
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
        return {
            myAccountName: state.user.getIn(['current', 'username']),
            data: state.global.getIn(['content', props.permLink]),
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
