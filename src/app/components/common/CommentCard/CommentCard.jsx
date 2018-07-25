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
    overflow: hidden;
    text-overflow: ellipsis;
    color: #fff;
    background: #789821;
    cursor: default;
`;

const Body = styled.div`
    position: relative;
    padding: 0 18px 12px;
`;
const Title = styled.div`
    margin-bottom: 8px;
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
    display: block;
    font-family: ${a => a.theme.fontFamily};
    color: #959595 !important;
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
`;

const Filler = styled.div`
    flex-grow: 1;
`;

const Root = styled.div`
    position: relative;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
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

class CommentCard extends PureComponent {
    static propTypes = {
        permLink: PropTypes.string,
        myAccount: PropTypes.string,
        data: PropTypes.object,
        grid: PropTypes.bool,
        allowInlineReply: PropTypes.bool,
        allowInlineEdit: PropTypes.bool,
    };

    state = {
        myVote: this._getMyVote(this.props),
        showReply: false,
        edit: false,
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
        const { data, className } = this.props;
        const { showReply } = this.state;

        const d = data.toJS();

        return (
            <Root className={cn(className)}>
                {this._renderHeader(d)}
                {this._renderBody(d)}
                {this._renderFooter()}
                {showReply ? this._renderReplyEditor() : null}
            </Root>
        );
    }

    _renderHeader(json) {
        const author = json.author;
        const category = detransliterate(json.category);

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
                                <TimeAgoWrapper date={json.created} />
                            </PostDate>
                        </PostDesc>
                    </AuthorBlock>
                    <Filler />
                    <Category>{category}</Category>
                </HeaderLine>
            </Header>
        );
    }

    _renderBody(json) {
        const { data, allowInlineEdit } = this.props;
        const { edit } = this.state;

        const p = extractContent(immutableAccessor, data);
        let title = p.title;
        let parentLink = p.link;

        if (json.parent_author) {
            title = json.root_title;
            parentLink = `/${json.category}/@${json.parent_author}/${json.parent_permlink}`;
        }

        return (
            <Body>
                <Title>
                    <TitleIcon name="comment" />
                    {tt('g.re2')}: <TitleLink to={parentLink}>{title}</TitleLink>
                    {allowInlineEdit && !edit ? (
                        <IconEdit
                            name="pen"
                            size={20}
                            data-tooltip={'Редактировать комментарий'}
                            onClick={this._onEditClick}
                        />
                    ) : null}
                </Title>
                {edit ? (
                    <CommentFormLoader
                        reply
                        editMode
                        params={data.toJS()}
                        onSuccess={this._onEditDone}
                        onCancel={this._onEditDone}
                    />
                ) : (
                    <PostBody to={p.link} dangerouslySetInnerHTML={{ __html: p.desc }} />
                )}
            </Body>
        );
    }

    _renderFooter() {
        const { data, myAccount, allowInlineReply } = this.props;

        return (
            <Footer>
                <VotePanel data={data} me={myAccount} onChange={this._onVoteChange} />
                {allowInlineReply ? (
                    <Fragment>
                        <Filler />
                        <Button light onClick={this._onReplyClick}>
                            <Icon name="comment_small" size={18} /> Ответить
                        </Button>
                    </Fragment>
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
                myAccount: props.myAccount,
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
