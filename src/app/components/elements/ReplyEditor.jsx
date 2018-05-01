import React from 'react';
import reactForm from 'app/utils/ReactForm';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as userActions from 'app/redux/UserReducer';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import CategorySelector from 'app/components/cards/CategorySelector';
import { validateCategory } from 'app/components/cards/CategorySelector';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Tooltip from 'app/components/elements/Tooltip';
import sanitizeConfig, { allowedTags } from 'app/utils/SanitizeConfig';
import sanitize from 'sanitize-html';
import HtmlReady from 'shared/HtmlReady';
import * as globalActions from 'app/redux/GlobalReducer';
import { Set } from 'immutable';
import Remarkable from 'remarkable';
import Dropzone from 'react-dropzone';
import tt from 'counterpart';

const remarkable = new Remarkable({ html: true, linkify: false, breaks: true });

const RTE_DEFAULT = false;

class ReplyEditor extends React.Component {
    static propTypes = {
        // html component attributes
        formId: React.PropTypes.string.isRequired, // unique form id for each editor
        type: React.PropTypes.oneOf(['submit_story', 'submit_comment', 'edit']),
        successCallback: React.PropTypes.func, // indicator that the editor is done and can be hidden
        onCancel: React.PropTypes.func, // hide editor when cancel button clicked

        author: React.PropTypes.string, // empty or string for top-level post
        permlink: React.PropTypes.string, // new or existing category (default calculated from title)
        parent_author: React.PropTypes.string, // empty or string for top-level post
        parent_permlink: React.PropTypes.string, // new or existing category
        jsonMetadata: React.PropTypes.object, // An existing comment has its own meta data
        category: React.PropTypes.string, // initial value
        title: React.PropTypes.string, // initial value
        body: React.PropTypes.string, // initial value
        richTextEditor: React.PropTypes.func,
        payoutType: React.PropTypes.string,
    };

    static defaultProps = {
        isStory: false,
        author: '',
        parent_author: '',
        parent_permlink: '',
        type: 'submit_comment',
    };

    constructor(props) {
        super();
        this.state = { progress: {} };
        this.initForm(props);
    }

    componentWillMount() {
        const { setMetaData, formId, jsonMetadata } = this.props;
        setMetaData(formId, jsonMetadata);

        if (process.env.BROWSER) {
            // Check for rte editor preference
            let rte =
                this.props.isStory &&
                JSON.parse(
                    localStorage.getItem('replyEditorData-rte') || RTE_DEFAULT
                );
            let raw = null;

            // Process initial body value (if this is an edit)
            const { body } = this.state;
            if (body.value) {
                raw = body.value;
            }

            // Check for draft data
            let draft = localStorage.getItem('replyEditorData-' + formId);
            if (draft) {
                draft = JSON.parse(draft);
                const { category, title } = this.state;
                if (category) category.props.onChange(draft.category);
                if (title) title.props.onChange(draft.title);
                raw = draft.body;
            }

            // If we have an initial body, check if it's html or markdown
            if (raw) {
                rte = isHtmlTest(raw);
            }

            // console.log("initial reply body:", raw || '(empty)')
            body.props.onChange(raw);
            this.setState({
                rte,
                rte_value: rte
                    ? stateFromHtml(this.props.richTextEditor, raw)
                    : null,
            });
        }
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.props.isStory) this.refs.titleRef.focus();
            else if (this.refs.postRef) this.refs.postRef.focus();
            else if (this.refs.rte) this.refs.rte._focus();
        }, 300);
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'ReplyEditor');

    componentWillUpdate(nextProps, nextState) {
        if (process.env.BROWSER) {
            const ts = this.state;
            const ns = nextState;

            // Save curent draft to localStorage
            if (
                ts.body.value !== ns.body.value ||
                (ns.category && ts.category.value !== ns.category.value) ||
                (ns.title && ts.title.value !== ns.title.value)
            ) {
                // also prevents saving after parent deletes this information
                const { formId } = nextProps;
                const { category, title, body } = ns;
                const data = {
                    formId,
                    title: title ? title.value : undefined,
                    category: category ? category.value : undefined,
                    body: body.value,
                };

                clearTimeout(saveEditorTimeout);
                saveEditorTimeout = setTimeout(() => {
                    // console.log('save formId', formId, body.value)
                    localStorage.setItem(
                        'replyEditorData-' + formId,
                        JSON.stringify(data, null, 0)
                    );
                    this.showDraftSaved();
                }, 500);
            }
        }
    }

    componentWillUnmount() {
        const { clearMetaData, formId } = this.props;
        clearMetaData(formId);
    }

    initForm(props) {
        const { isStory, type, fields } = props;
        const isEdit = type === 'edit';
        const maxKb = isStory ? 65 : 16;
        reactForm({
            fields,
            instance: this,
            name: 'replyForm',
            initialValues: props.initialValues,
            validation: values => ({
                title:
                    isStory &&
                    (!values.title || values.title.trim() === ''
                        ? tt('g.required')
                        : values.title.length > 255
                          ? tt('reply_editor.shorten_title')
                          : null),
                category: isStory && validateCategory(values.category, !isEdit),
                body: !values.body
                    ? tt('g.required')
                    : values.body.length > maxKb * 1024
                      ? tt('reply_editor.exceeds_maximum_length', { maxKb })
                      : null,
            }),
        });
    }

    onTitleChange = e => {
        const value = e.target.value;
        // TODO block links in title (they do not make good permlinks)
        const hasMarkdown = /(?:\*[\w\s]*\*|\#[\w\s]*\#|_[\w\s]*_|~[\w\s]*~|\]\s*\(|\]\s*\[)/.test(
            value
        );
        this.setState({
            titleWarn: hasMarkdown
                ? tt('reply_editor.markdown_not_supported')
                : '',
        });
        const { title } = this.state;
        title.props.onChange(e);
    };

    onCancel = e => {
        if (e) e.preventDefault();
        const { onCancel } = this.props;
        const { replyForm, body } = this.state;
        if (
            !body.value ||
            confirm(tt('reply_editor.are_you_sure_you_want_to_clear_this_form'))
        ) {
            replyForm.resetForm();
            this.setState({
                rte_value: stateFromHtml(this.props.richTextEditor),
            });
            this.setState({ progress: {} });
            if (onCancel) onCancel(e);
        }
    };

    // As rte_editor is updated, keep the (invisible) 'body' field in sync.
    onChange = rte_value => {
        this.setState({ rte_value });
        const html = stateToHtml(rte_value);
        const { body } = this.state;
        if (body.value !== html) body.props.onChange(html);
    };

    toggleRte = e => {
        e.preventDefault();
        const state = { rte: !this.state.rte };
        if (state.rte) {
            const { body } = this.state;
            state.rte_value = isHtmlTest(body.value)
                ? stateFromHtml(this.props.richTextEditor, body.value)
                : stateFromMarkdown(this.props.richTextEditor, body.value);
        }
        this.setState(state);
        localStorage.setItem('replyEditorData-rte', !this.state.rte);
    };
    showDraftSaved() {
        const { draft } = this.refs;
        draft.className = 'ReplyEditor__draft';
        void draft.offsetWidth; // reset animation
        draft.className = 'ReplyEditor__draft ReplyEditor__draft-saved';
    }

    onDrop = (acceptedFiles, rejectedFiles) => {
        if (!acceptedFiles.length) {
            if (rejectedFiles.length) {
                this.setState({
                    progress: { error: 'Please insert only image files.' },
                });
                console.log('onDrop Rejected files: ', rejectedFiles);
            }
            return;
        }
        const file = acceptedFiles[0];
        this.upload(file, file.name);
    };

    onOpenClick = () => {
        this.dropzone.open();
    };

    onPasteCapture = e => {
        try {
            if (e.clipboardData) {
                for (const item of e.clipboardData.items) {
                    if (item.kind === 'file' && /^image\//.test(item.type)) {
                        const blob = item.getAsFile();
                        this.upload(blob);
                    }
                }
            } else {
                // http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/
                // contenteditable element that catches all pasted data
                this.setState({ noClipboardData: true });
            }
        } catch (error) {
            console.error('Error analyzing clipboard event', error);
        }
    };

    upload = (file, name = '') => {
        const { uploadImage } = this.props;
        this.setState({
            progress: { message: tt('reply_editor.uploading') },
        });
        uploadImage(file, progress => {
            if (progress.url) {
                this.setState({ progress: {} });
                const { url } = progress;
                const image_md = `![${name}](${url})`;
                const { body } = this.state;
                const { selectionStart, selectionEnd } = this.refs.postRef;
                body.props.onChange(
                    body.value.substring(0, selectionStart) +
                        image_md +
                        body.value.substring(selectionEnd, body.value.length)
                );
            } else {
                this.setState({ progress });
            }
            setTimeout(() => {
                this.setState({ progress: {} });
            }, 4000); // clear message
        });
    };

    render() {
        const originalPost = {
            category: this.props.category,
            body: this.props.body,
        };
        const { onCancel, onTitleChange } = this;
        const { title, category, body } = this.state;
        const {
            reply,
            username,
            isStory,
            formId,
            noImage,
            author,
            permlink,
            parent_author,
            parent_permlink,
            type,
            jsonMetadata,
            state,
            successCallback,
            payoutType,
        } = this.props;
        const { submitting, valid, handleSubmit } = this.state.replyForm;
        const { postError, titleWarn, rte } = this.state;
        const { progress, noClipboardData } = this.state;
        const disabled = submitting || !valid;
        const loading = submitting || this.state.loading;

        const errorCallback = estr => {
            this.setState({ postError: estr, loading: false });
        };
        const successCallbackWrapper = (...args) => {
            this.setState({ loading: false });
            if (successCallback) successCallback(args);
        };
        const isEdit = type === 'edit';
        const isHtml = rte || isHtmlTest(body.value);
        const replyParams = {
            author,
            permlink,
            parent_author,
            parent_permlink,
            type,
            state,
            originalPost,
            isHtml,
            isStory,
            jsonMetadata,
            payoutType,
            successCallback: successCallbackWrapper,
            errorCallback,
        };
        const postLabel = username ? (
            <Tooltip t={tt('g.post_as_user', { username })}>
                {tt('g.post')}
            </Tooltip>
        ) : (
            tt('g.post')
        );
        const hasTitleError = title && title.touched && title.error;
        let titleError = null;
        // The Required title error (triggered onBlur) can shift the form making it hard to click on things..
        if (
            (hasTitleError &&
                (title.error !== tt('g.required') || body.value !== '')) ||
            titleWarn
        ) {
            titleError = (
                <div className={hasTitleError ? 'error' : 'warning'}>
                    {hasTitleError ? title.error : titleWarn}&nbsp;
                </div>
            );
        }

        // TODO: remove all references to these vframe classes. Removed from css and no longer needed.
        const vframe_class = isStory ? 'vframe' : '';
        const vframe_section_class = isStory ? 'vframe__section' : '';
        const vframe_section_shrink_class = isStory
            ? 'vframe__section--shrink'
            : '';
        const RichTextEditor = this.props.richTextEditor;

        return (
            <div className="ReplyEditor row">
                <div className="column small-12">
                    <div
                        ref="draft"
                        className="ReplyEditor__draft ReplyEditor__draft-hide"
                    >
                        {tt('reply_editor.draft_saved')}
                    </div>
                    <form
                        className={vframe_class}
                        onSubmit={handleSubmit(({ data }) => {
                            const startLoadingIndicator = () =>
                                this.setState({
                                    loading: true,
                                    postError: undefined,
                                });
                            reply({
                                ...data,
                                ...replyParams,
                                startLoadingIndicator,
                            });
                        })}
                        onChange={() => {
                            this.setState({ postError: null });
                        }}
                    >
                        <div className={vframe_section_shrink_class}>
                            {isStory && (
                                <span>
                                    <input
                                        type="text"
                                        className="ReplyEditor__title"
                                        onChange={onTitleChange}
                                        disabled={loading}
                                        placeholder={tt('reply_editor.title')}
                                        autoComplete="off"
                                        ref="titleRef"
                                        tabIndex={1}
                                        {...title.props}
                                    />
                                    <div
                                        className="float-right secondary"
                                        style={{ marginRight: '1rem' }}
                                    >
                                        {rte && (
                                            <a
                                                href="#"
                                                onClick={this.toggleRte}
                                            >
                                                {body.value
                                                    ? 'Raw HTML'
                                                    : 'Markdown'}
                                            </a>
                                        )}
                                        {!rte &&
                                            (isHtml || !body.value) && (
                                                <a
                                                    href="#"
                                                    onClick={this.toggleRte}
                                                >
                                                    {tt('reply_editor.editor')}
                                                </a>
                                            )}
                                    </div>
                                    {titleError}
                                </span>
                            )}
                        </div>

                        <div
                            className={
                                'ReplyEditor__body ' +
                                (rte
                                    ? `rte ${vframe_section_class}`
                                    : vframe_section_shrink_class)
                            }
                        >
                            {process.env.BROWSER && rte ? (
                                <RichTextEditor
                                    ref="rte"
                                    readOnly={loading}
                                    value={this.state.rte_value}
                                    onChange={this.onChange}
                                    onBlur={body.onBlur}
                                    tabIndex={2}
                                />
                            ) : (
                                <span>
                                    <Dropzone
                                        onDrop={this.onDrop}
                                        className={
                                            type === 'submit_story'
                                                ? 'dropzone'
                                                : 'none'
                                        }
                                        disableClick
                                        multiple={false}
                                        accept="image/*"
                                        ref={node => {
                                            this.dropzone = node;
                                        }}
                                    >
                                        <textarea
                                            {...body.props}
                                            ref="postRef"
                                            onPasteCapture={this.onPasteCapture}
                                            className={
                                                type === 'submit_story'
                                                    ? 'upload-enabled'
                                                    : ''
                                            }
                                            disabled={loading}
                                            rows={isStory ? 10 : 3}
                                            placeholder={
                                                isStory
                                                    ? tt('g.write_your_story')
                                                    : tt('g.reply')
                                            }
                                            autoComplete="off"
                                            tabIndex={2}
                                        />
                                    </Dropzone>
                                    <p className="drag-and-drop">
                                        {tt(
                                            'reply_editor.insert_images_by_dragging_dropping'
                                        )}
                                        {noClipboardData
                                            ? ''
                                            : tt(
                                                  'reply_editor.pasting_from_the_clipboard'
                                              )}
                                        {tt('reply_editor.or_by')}{' '}
                                        <a onClick={this.onOpenClick}>
                                            {tt('reply_editor.selecting_them')}
                                        </a>.
                                    </p>
                                    {progress.message && (
                                        <div className="info">
                                            {progress.message}
                                        </div>
                                    )}
                                    {progress.error && (
                                        <div className="error">
                                            {tt('reply_editor.image_upload')} :{' '}
                                            {progress.error}
                                        </div>
                                    )}
                                </span>
                            )}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            <div className="error">
                                {body.touched &&
                                    body.error &&
                                    body.error !== 'Required' &&
                                    body.error}
                            </div>
                        </div>

                        <div
                            className={vframe_section_shrink_class}
                            style={{ marginTop: '0.5rem' }}
                        >
                            {isStory && (
                                <span>
                                    <CategorySelector
                                        {...category.props}
                                        disabled={loading}
                                        isEdit={isEdit}
                                        tabIndex={3}
                                    />
                                    <div className="error">
                                        {(category.touched || category.value) &&
                                            category.error}&nbsp;
                                    </div>
                                </span>
                            )}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            {postError && (
                                <div className="error">{postError}</div>
                            )}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            {!loading && (
                                <button
                                    type="submit"
                                    className="button"
                                    disabled={disabled}
                                    tabIndex={4}
                                >
                                    {isEdit
                                        ? tt('reply_editor.update_post')
                                        : postLabel}
                                </button>
                            )}
                            {loading && (
                                <span>
                                    <br />
                                    <LoadingIndicator type="circle" />
                                </span>
                            )}
                            &nbsp;{' '}
                            {!loading &&
                                this.props.onCancel && (
                                    <button
                                        type="button"
                                        className="secondary hollow button no-border"
                                        tabIndex={5}
                                        onClick={onCancel}
                                    >
                                        {tt('g.cancel')}
                                    </button>
                                )}
                            {!loading &&
                                !this.props.onCancel && (
                                    <button
                                        className="button hollow no-border"
                                        tabIndex={5}
                                        disabled={submitting}
                                        onClick={onCancel}
                                    >
                                        {tt('g.clear')}
                                    </button>
                                )}
                            {!isEdit &&
                                this.props.payoutType != '50%' && (
                                    <div className="ReplyEditor__options float-right text-right">
                                        {tt('g.rewards')}
                                        {': '}
                                        {this.props.payoutType == '0%' &&
                                            tt('reply_editor.decline_payout')}
                                        {this.props.payoutType == '100%' &&
                                            tt('reply_editor.power_up_100')}
                                        {'. '}
                                        <a href={'/@' + username + '/settings'}>
                                            Update settings
                                        </a>
                                    </div>
                                )}
                        </div>
                        {!loading &&
                            !rte &&
                            body.value && (
                                <div
                                    className={
                                        'Preview ' + vframe_section_shrink_class
                                    }
                                >
                                    {!isHtml && (
                                        <div className="float-right">
                                            <a
                                                target="_blank"
                                                href="https://guides.github.com/features/mastering-markdown/"
                                                rel="noopener noreferrer"
                                            >
                                                {tt(
                                                    'reply_editor.markdown_styling_guide'
                                                )}
                                            </a>
                                        </div>
                                    )}
                                    <h6>{tt('g.preview')}</h6>
                                    <MarkdownViewer
                                        formId={formId}
                                        text={body.value}
                                        canEdit
                                        jsonMetadata={jsonMetadata}
                                        large={isStory}
                                        noImage={noImage}
                                    />
                                </div>
                            )}
                    </form>
                </div>
            </div>
        );
    }
}

let saveEditorTimeout;

// removes <html></html> wrapper if exists
function stripHtmlWrapper(text) {
    const m = text.match(/<html>\n*([\S\s]+?)?\n*<\/html>/m);
    return m && m.length === 2 ? m[1] : text;
}

// See also MarkdownViewer render
const isHtmlTest = text => /^<html>/.test(text);

function stateToHtml(state) {
    let html = state.toString('html');
    if (html === '<p></p>') html = '';
    if (html === '<p><br></p>') html = '';
    if (html == '') return '';
    return `<html>\n${html}\n</html>`;
}

function stateFromHtml(RichTextEditor, html = null) {
    if (!RichTextEditor) return null;
    if (html) html = stripHtmlWrapper(html);
    if (html && html.trim() == '') html = null;
    return html
        ? RichTextEditor.createValueFromString(html, 'html')
        : RichTextEditor.createEmptyValue();
}

function stateFromMarkdown(RichTextEditor, markdown) {
    let html;
    if (markdown && markdown.trim() !== '') {
        html = remarkable.render(markdown);
        html = HtmlReady(html).html; // TODO: option to disable youtube conversion, @-links, img proxy
        //html = htmlclean(html) // normalize whitespace
        console.log('markdown converted to:', html);
    }
    return stateFromHtml(RichTextEditor, html);
}

import { connect } from 'react-redux';
const richTextEditor = process.env.BROWSER
    ? require('react-rte-image').default
    : null;

export default formId =>
    connect(
        // mapStateToProps
        (state, ownProps) => {
            const username = state.user.getIn(['current', 'username']);
            const fields = ['body'];
            const { type, parent_author, jsonMetadata } = ownProps;
            const isEdit = type === 'edit';
            const isStory =
                /submit_story/.test(type) || (isEdit && parent_author === '');
            if (isStory) fields.push('title');
            if (isStory) fields.push('category');

            let { category, title, body } = ownProps;
            if (/submit_/.test(type)) title = body = '';
            if (isStory && jsonMetadata && jsonMetadata.tags) {
                category = Set([category, ...jsonMetadata.tags]).join(' ');
            }

            const payoutType = state.app.getIn(
                [
                    'user_preferences',
                    isStory ? 'defaultBlogPayout' : 'defaultCommentPayout',
                ],
                '50%'
            );

            const ret = {
                ...ownProps,
                fields,
                isStory,
                username,
                payoutType,
                initialValues: { title, body, category },
                state,
                formId,
                richTextEditor,
            };
            return ret;
        },

        // mapDispatchToProps
        dispatch => ({
            clearMetaData: id => {
                dispatch(globalActions.clearMeta({ id }));
            },
            setMetaData: (id, jsonMetadata) => {
                dispatch(
                    globalActions.setMetaData({
                        id,
                        meta: jsonMetadata ? jsonMetadata.steem : null,
                    })
                );
            },
            uploadImage: (file, progress) =>
                dispatch(userActions.uploadImage({ file, progress })),
            reply: ({
                category,
                title,
                body,
                author,
                permlink,
                parent_author,
                parent_permlink,
                isHtml,
                isStory,
                type,
                originalPost,
                payoutType = '50%',
                state,
                jsonMetadata,
                successCallback,
                errorCallback,
                startLoadingIndicator,
            }) => {
                // const post = state.global.getIn(['content', author + '/' + permlink])
                const username = state.user.getIn(['current', 'username']);

                const isEdit = type === 'edit';
                const isNew = /^submit_/.test(type);

                // Wire up the current and parent props for either an Edit or a Submit (new post)
                //'submit_story', 'submit_comment', 'edit'
                const linkProps = isNew
                    ? {
                          // submit new
                          parent_author: author,
                          parent_permlink: permlink,
                          author: username,
                          // permlink,  assigned in TransactionSaga
                      }
                    : // edit existing
                      isEdit
                      ? { author, permlink, parent_author, parent_permlink }
                      : null;

                if (!linkProps) throw new Error('Unknown type: ' + type);

                // If this is an HTML post, it MUST begin and end with the tag
                if (isHtml && !body.match(/^<html>[\s\S]*<\/html>$/)) {
                    errorCallback(
                        'HTML posts must begin with <html> and end with </html>'
                    );
                    return;
                }

                let rtags;
                {
                    const html = isHtml ? body : remarkable.render(body);
                    rtags = HtmlReady(html, { mutate: false });
                }

                allowedTags.forEach(tag => {
                    rtags.htmltags.delete(tag);
                });
                if (isHtml) rtags.htmltags.delete('html'); // html tag allowed only in HTML mode
                if (rtags.htmltags.size) {
                    errorCallback(
                        'Please remove the following HTML elements from your post: ' +
                            Array(...rtags.htmltags)
                                .map(tag => `<${tag}>`)
                                .join(', ')
                    );
                    return;
                }

                const formCategories = Set(
                    category
                        ? category
                              .trim()
                              .replace(/#/g, '')
                              .split(/ +/)
                        : []
                );
                const rootCategory =
                    originalPost && originalPost.category
                        ? originalPost.category
                        : formCategories.first();
                let allCategories = Set([...formCategories.toJS()]);
                if (/^[-a-z\d]+$/.test(rootCategory))
                    allCategories = allCategories.add(rootCategory);

                let postHashtags = [...rtags.hashtags];
                while (allCategories.size < 5 && postHashtags.length > 0) {
                    allCategories = allCategories.add(postHashtags.shift());
                }

                // merge
                const meta = isEdit ? jsonMetadata : {};
                if (allCategories.size) meta.tags = allCategories.toJS();
                else delete meta.tags;
                if (rtags.usertags.size) meta.users = rtags.usertags;
                else delete meta.users;
                if (rtags.images.size) meta.image = rtags.images;
                else delete meta.image;
                if (rtags.links.size) meta.links = rtags.links;
                else delete meta.links;

                meta.app = 'steemit/0.1';
                if (isStory) {
                    meta.format = isHtml ? 'html' : 'markdown';
                }

                // if(Object.keys(json_metadata.steem).length === 0) json_metadata = {}// keep json_metadata minimal
                const sanitizeErrors = [];
                sanitize(body, sanitizeConfig({ sanitizeErrors }));
                if (sanitizeErrors.length) {
                    errorCallback(sanitizeErrors.join('.  '));
                    return;
                }

                if (meta.tags.length > 5) {
                    const includingCategory = isEdit
                        ? tt('reply_editor.including_the_category', {
                              rootCategory,
                          })
                        : '';
                    errorCallback(
                        tt('reply_editor.use_limited_amount_of_tags', {
                            tagsLength: meta.tags.length,
                            includingCategory,
                        })
                    );
                    return;
                }

                startLoadingIndicator();

                const originalBody = isEdit ? originalPost.body : null;
                const __config = { originalBody };

                // Avoid changing payout option during edits #735
                if (!isEdit) {
                    switch (payoutType) {
                        case '0%': // decline payout
                            __config.comment_options = {
                                max_accepted_payout: '0.000 SBD',
                            };
                            break;
                        case '100%': // 100% steem power payout
                            __config.comment_options = {
                                percent_steem_dollars: 0, // 10000 === 100% (of 50%)
                            };
                            break;
                        default: // 50% steem power, 50% sd+steem
                    }
                }

                const operation = {
                    ...linkProps,
                    category: rootCategory,
                    title,
                    body,
                    json_metadata: meta,
                    __config,
                };
                dispatch(
                    transactionActions.broadcastOperation({
                        type: 'comment',
                        operation,
                        errorCallback,
                        successCallback,
                    })
                );
            },
        })
    )(ReplyEditor);
