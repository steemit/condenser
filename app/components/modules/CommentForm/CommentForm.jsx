import React from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';
import { connect } from 'react-redux';
import cn from 'classnames';
import tt from 'counterpart';
import transaction from 'app/redux/Transaction';
import { getTags } from 'shared/HtmlReady';
import DialogManager from 'app/components/elements/common/DialogManager';
import Icon from 'app/components/elements/Icon';
import MarkdownEditor from 'app/components/elements/postEditor/MarkdownEditor/MarkdownEditor';
import CommentFooter from 'app/components/elements/postEditor/CommentFooter';
import MarkdownViewer, {
    getRemarkable,
} from 'app/components/cards/MarkdownViewer';
import { checkPostHtml } from 'app/utils/validator';
import './CommentForm.scss';

const DRAFT_KEY = 'golos.comment.draft';

class CommentForm extends React.Component {
    static propTypes = {
        reply: PropTypes.bool,
        editMode: PropTypes.bool,
        params: PropTypes.object,
        jsonMetadata: PropTypes.object,
        onSuccess: PropTypes.func,
        onCancel: PropTypes.func,
    };

    constructor(props) {
        super(props);

        const { editMode } = this.props;

        this.state = {
            text: '',
            emptyBody: true,
            postError: null,
            uploadingCount: 0,
        };

        this._saveDraftLazy = throttle(this._saveDraft, 300, {
            leading: false,
        });
        this._checkBodyLazy = throttle(this._checkBody, 300, { leading: true });
        this._postSafe = this._safeWrapper(this._post);

        let isLoaded = false;

        try {
            isLoaded = this._tryLoadDraft();
        } catch (err) {
            console.warn('[Golos.io] Draft recovering failed:', err);
        }

        if (!isLoaded && editMode) {
            this._fillFromMetadata();
        }
    }

    _tryLoadDraft() {
        const { editMode, params } = this.props;

        const json = localStorage.getItem(DRAFT_KEY);

        if (json) {
            const draft = JSON.parse(json);

            if (
                draft.editMode !== editMode ||
                draft.permLink !== params.permlink
            ) {
                return;
            }

            const state = this.state;

            state.text = draft.text;
            state.emptyBody = draft.text.trim().length === 0;

            return true;
        }
    }

    _fillFromMetadata() {
        const { params } = this.props;
        this.state.text = params.body;
        this.state.emptyBody = false;
    }

    componentDidMount() {
        if (this.props.autoFocus) {
            setTimeout(() => {
                this.refs.editor.focus();
            }, 100);
        }
    }

    componentWillUnmount() {
        this._unmount = true;
    }

    render() {
        const { editMode } = this.props;

        const { text, emptyBody, postError, uploadingCount } = this.state;

        const allowPost = uploadingCount === 0 && !emptyBody;

        return (
            <div
                className={cn('CommentForm', {
                    CommentForm_edit: editMode,
                })}
            >
                <div className="CommentForm__work-area">
                    <div className="CommentForm__content">
                        <MarkdownEditor
                            ref="editor"
                            autoFocus
                            commentMode
                            initialValue={text}
                            placeholder={tt('g.reply')}
                            uploadImage={this._onUploadImage}
                            onChangeNotify={this._onTextChangeNotify}
                        />
                    </div>
                </div>
                <div className="CommentForm__footer">
                    <div className="CommentForm__footer-content">
                        <CommentFooter
                            ref="footer"
                            editMode={editMode}
                            errorText={postError}
                            postDisabled={!allowPost}
                            onPostClick={this._postSafe}
                            onCancelClick={this._onCancelClick}
                        />
                    </div>
                </div>
                {text ? (
                    <div className="CommentForm__preview">
                        <MarkdownViewer text={text} />
                    </div>
                ) : null}
                {uploadingCount > 0 ? (
                    <div className="CommentForm__spinner">
                        <Icon
                            name="clock"
                            size="4x"
                            className="CommentForm__spinner-inner"
                        />
                    </div>
                ) : null}
            </div>
        );
    }

    _onTextChangeNotify = () => {
        this._saveDraftLazy();
        this._checkBodyLazy();
    };

    _saveDraft = () => {
        const { editMode, params } = this.props;

        const body = this.refs.editor.getValue();

        this.setState({
            text: body,
        });

        try {
            const save = {
                editMode,
                permLink: params.permlink,
                text: body,
            };

            const json = JSON.stringify(save);

            localStorage.setItem(DRAFT_KEY, json);
        } catch (err) {
            console.warn('[Golos.io] Draft not saved:', err);
        }
    };

    _safeWrapper(callback) {
        return (...args) => {
            try {
                return callback(...args);
            } catch (err) {
                console.error(err);
                this.refs.footer.showPostError('Что-то пошло не так');
            }
        };
    }

    _post = () => {
        const { author, reply, editMode, params, jsonMetadata } = this.props;
        let error;

        const body = this.refs.editor.getValue();
        let html;

        if (!body || !body.trim()) {
            this.refs.footer.showPostError(tt('post_editor.empty_body_error'));
            return;
        }

        html = getRemarkable().render(body);

        const rtags = getTags(html);

        if ((error = checkPostHtml(rtags))) {
            this.refs.footer.showPostError(error.text);
            return;
        }

        const meta = {
            app: 'golos.io/0.1',
            format: 'markdown',
        };

        if (reply && !editMode) {
            try {
                meta.tags = JSON.parse(params.json_metadata).tags || [];
            } catch (err) {
                meta.tags = [];
            }
        } else {
            meta.tags = jsonMetadata.tags || [];
        }

        if (params && params.category && meta.tags[0] !== params.category) {
            meta.tags.unshift(params.category);
        }

        if (rtags.usertags.size) {
            meta.users = rtags.usertags;
        }

        if (rtags.images.size) {
            meta.image = rtags.images;
        }

        if (rtags.links.size) {
            meta.links = rtags.links;
        }

        const data = {
            author,
            body,
            category: meta.tags[0],
            json_metadata: meta,
            __config: {
                autoVote: false,
                originalBody: null,
            },
        };

        if (editMode) {
            data.permlink = params.permlink;
            data.parent_author = params.parent_author;
            data.parent_permlink = params.parent_permlink;
            data.__config.originalBody = params.body;
        } else {
            data.parent_author = params.author;
            data.parent_permlink = params.permlink;
            data.__config.comment_options = {};
        }

        this.props.onPost(
            data,
            () => {
                try {
                    localStorage.removeItem(DRAFT_KEY);
                } catch (err) {}

                this.props.onSuccess();
            },
            err => {
                this.refs.footer.showPostError(err.toString().trim());
            }
        );
    };

    _onCancelClick = async () => {
        const body = this.refs.editor.getValue();

        if (
            !body ||
            !body.trim() ||
            (await DialogManager.confirm(tt('comment_editor.cancel_comment')))
        ) {
            try {
                localStorage.removeItem(DRAFT_KEY);
            } catch (err) {}

            this.props.onCancel();
        }
    };

    _onUploadImage = (file, progress) => {
        this.setState(
            {
                uploadingCount: this.state.uploadingCount + 1,
            },
            () => {
                this.props.uploadImage({
                    file,
                    progress: data => {
                        if (!this._unmount) {
                            if (data && (data.url || data.error)) {
                                this.setState({
                                    uploadingCount:
                                        this.state.uploadingCount - 1,
                                });
                            }

                            progress(data);
                        }
                    },
                });
            }
        );
    };

    _checkBody() {
        const editor = this.refs.editor;

        if (editor) {
            const value = editor.getValue();

            this.setState({
                emptyBody: value.trim().length === 0,
            });
        }
    }
}

export default connect(
    state => ({
        author: state.user.getIn(['current', 'username']),
    }),
    dispatch => ({
        onPost(payload, onSuccess, onError) {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'comment',
                    operation: payload,
                    hideErrors: true,
                    errorCallback: onError,
                    successCallback: onSuccess,
                })
            );
        },
        uploadImage({ file, progress }) {
            dispatch({
                type: 'user/UPLOAD_IMAGE',
                payload: {
                    file,
                    progress: data => {
                        if (data && data.error) {
                            dispatch({
                                type: 'ADD_NOTIFICATION',
                                payload: {
                                    message: data.error,
                                    dismissAfter: 5000,
                                },
                            });
                        }

                        progress(data);
                    },
                },
            });
        },
    })
)(CommentForm);
