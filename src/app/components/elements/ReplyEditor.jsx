import React from 'react';
import PropTypes from 'prop-types';
import reactForm from 'app/utils/ReactForm';
import { Map, fromJS, OrderedSet } from 'immutable';
import { connect } from 'react-redux';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as userActions from 'app/redux/UserReducer';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import TagInput, { validateTagInput } from 'app/components/cards/TagInput';
import SlateEditor, {
    serializeHtml,
    deserializeHtml,
    getDemoState,
} from 'app/components/elements/SlateEditor';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import PostCategoryBanner from 'app/components/elements/PostCategoryBanner';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Tooltip from 'app/components/elements/Tooltip';
import sanitizeConfig, { allowedTags } from 'app/utils/SanitizeConfig';
import sanitize from 'sanitize-html';
import HtmlReady from 'shared/HtmlReady';
import Remarkable from 'remarkable';
import Dropzone from 'react-dropzone';
import tt from 'counterpart';
import { userActionRecord } from 'app/utils/ServerApiClient';
import PrimaryNavigation from 'app/components/cards/PrimaryNavigation';
import SteemMarket from 'app/components/elements/SteemMarket';

const remarkable = new Remarkable({ html: true, linkify: false, breaks: true });

const RTE_DEFAULT = false;
const MAX_TAGS = 8;
const MAX_FILE_TO_UPLOAD = 10;
const imagesToUpload = [];

function allTags(userInput, originalCategory, hashtags) {
    // take space-delimited user input
    let tags = OrderedSet(
        userInput
            ? userInput
                  .trim()
                  .replace(/#/g, '')
                  .split(/ +/)
            : []
    );

    // remove original cat, if present
    if (originalCategory && /^[-a-z\d]+$/.test(originalCategory))
        tags = tags.delete(originalCategory);

    // append hashtags from post until limit is reached
    const tagged = [...hashtags];
    while (tags.size < MAX_TAGS && tagged.length > 0) {
        tags = tags.add(tagged.shift());
    }

    return tags;
}

class ReplyEditor extends React.Component {
    static propTypes = {
        // html component attributes
        formId: PropTypes.string.isRequired, // unique form id for each editor
        type: PropTypes.oneOf(['submit_story', 'submit_comment', 'edit']),
        successCallback: PropTypes.func, // indicator that the editor is done and can be hidden
        onCancel: PropTypes.func, // hide editor when cancel button clicked

        author: PropTypes.string, // empty or string for top-level post
        permlink: PropTypes.string, // new or existing category (default calculated from title)
        parent_author: PropTypes.string, // empty or string for top-level post
        parent_permlink: PropTypes.string, // new or existing category
        jsonMetadata: PropTypes.object, // An existing comment has its own meta data
        category: PropTypes.string, // initial value
        title: PropTypes.string, // initial value
        body: PropTypes.string, // initial value
        defaultPayoutType: PropTypes.string,
        payoutType: PropTypes.string,
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
        this.state = { progress: {}, imagesUploadCount: 0, draft_permlink: '' };
        this.initForm(props);
    }

    componentWillMount() {
        const { formId } = this.props;

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
                const { tags, title } = this.state;

                if (tags) {
                    this.checkTagsCommunity(draft.tags);
                    tags.props.onChange(draft.tags);
                }

                if (title) title.props.onChange(draft.title);
                if (draft.payoutType)
                    this.props.setPayoutType(formId, draft.payoutType);
                if (draft.beneficiaries)
                    this.props.setBeneficiaries(formId, draft.beneficiaries);
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
                rte_value: rte ? stateFromHtml(raw) : null,
            });
        }

        // Overwrite category (even if draft loaded) if authoritative category was provided
        if (this.props.category) {
            if (this.state.tags) {
                this.state.tags.props.onChange(this.props.initialValues.tags);
            }
            this.checkTagsCommunity(this.props.category);
        }
    }

    checkTagsCommunity(tagsInput) {
        let community = null;
        if (tagsInput) {
            const primary = tagsInput.split(' ')[0];
            if (primary.substring(0, 5) == 'hive-') {
                community = primary;
                this.setState({ disabledCommunity: null });
            }
        }
        this.setState({ community });
    }

    shiftTagInput() {
        const { tags } = this.state;
        const items = tags.value.split(' ');
        this.setState({ disabledCommunity: items.shift() });
        tags.props.onChange(items.join(' '));
    }

    unshiftTagInput(tag) {
        const { tags } = this.state;
        tags.props.onChange(tag + ' ' + tags.value);
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.refs.rte) this.refs.rte._focus();
            else if (this.props.isStory) this.refs.titleRef.focus();
            else if (this.refs.postRef) this.refs.postRef.focus();
        }, 300);
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'ReplyEditor');

    componentWillUpdate(nextProps, nextState) {
        if (process.env.BROWSER) {
            const ts = this.state;
            const ns = nextState;
            const tp = this.props;
            const np = nextProps;

            // Save curent draft to localStorage
            if (
                ts.body.value !== ns.body.value ||
                (ns.tags && ts.tags.value !== ns.tags.value) ||
                (ns.title && ts.title.value !== ns.title.value) ||
                np.payoutType !== tp.payoutType ||
                np.beneficiaries !== tp.beneficiaries
            ) {
                // also prevents saving after parent deletes this information
                const { formId, payoutType, beneficiaries } = np;
                const { tags, title, body } = ns;
                const data = {
                    formId,
                    title: title ? title.value : undefined,
                    tags: tags ? tags.value : undefined,
                    body: body.value,
                    payoutType,
                    beneficiaries,
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

            if (ns.tags && ts.tags && ts.tags.value !== ns.tags.value) {
                this.checkTagsCommunity(ns.tags.value);
            }
        }
    }

    initForm(props) {
        const { isStory, type, fields } = props;
        const isEdit = type === 'edit';
        const maxKb = isStory ? 64 : 16;
        reactForm({
            fields,
            instance: this,
            name: 'replyForm',
            initialValues: props.initialValues,
            validation: values => {
                let bodyValidation = null;
                if (!values.body) {
                    bodyValidation = tt('g.required');
                }
                if (
                    values.body &&
                    new Blob([values.body]).size >= maxKb * 1024 - 256
                ) {
                    bodyValidation = `Post body exceeds ${maxKb * 1024 -
                        256} bytes.`;
                }
                return {
                    title:
                        isStory &&
                        (!values.title || values.title.trim() === ''
                            ? tt('g.required')
                            : values.title.length > 255
                              ? tt('reply_editor.shorten_title')
                              : null),
                    tags: isStory && validateTagInput(values.tags, !isEdit),
                    body: bodyValidation,
                };
            },
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
        const { formId, onCancel, defaultPayoutType } = this.props;
        const { replyForm, body } = this.state;
        if (
            !body.value ||
            confirm(tt('reply_editor.are_you_sure_you_want_to_clear_this_form'))
        ) {
            replyForm.resetForm();
            if (this.refs.rte)
                this.refs.rte.setState({ state: stateFromHtml() });
            this.setState({ progress: {} });
            this.props.setPayoutType(formId, defaultPayoutType);
            this.props.setBeneficiaries(formId, []);
            if (onCancel) onCancel(e);
        }

        this.setState({ draft_permlink: '' });
    };

    clearDraft = deletedDraftPermlink => {
        const { draft_permlink } = this.state;
        if (draft_permlink === deletedDraftPermlink)
            this.setState({ draft_permlink: '' });
    };

    // As rte_editor is updated, keep the (invisible) 'body' field in sync.
    onChange = rte_value => {
        this.refs.rte.setState({ state: rte_value });
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
                ? stateFromHtml(body.value)
                : stateFromMarkdown(body.value);
        }
        this.setState(state);
        localStorage.setItem('replyEditorData-rte', !this.state.rte);
    };
    showDraftSaved() {
        const { draft } = this.refs;
        if (draft) {
            draft.className = 'ReplyEditor__draft';
            void draft.offsetWidth; // reset animation
            draft.className = 'ReplyEditor__draft ReplyEditor__draft-saved';
        }
    }

    onDraftsClose = draft => {
        const { username } = this.props;
        const { body, tags, title, rte } = this.state;
        let raw;

        if (tags) {
            this.checkTagsCommunity(draft.tags);
            tags.props.onChange(draft.tags);
        }

        if (title) title.props.onChange(draft.title);

        raw = draft.body;

        // If we have an initial body, check if it's html or markdown

        // console.log("initial reply body:", raw || '(empty)')
        body.props.onChange(raw);
        this.setState({ draft_permlink: `${username}^${draft.permlink}` });
    };

    showDrafts = e => {
        e.preventDefault();
        this.props.showDrafts(
            this.props.formId,
            this.onDraftsClose,
            this.clearDraft
        );
    };

    onClickSaveDraft = e => {
        e.preventDefault();
        this.saveDraft();
    };

    onTemplatesClose = template => {
        const { body } = this.state;
        let raw = '';

        if (body.value) {
            raw = body.value;
        }

        raw += `\n` + template;

        // If we have an initial body, check if it's html or markdown

        // console.log("initial reply body:", raw || '(empty)')
        body.props.onChange(raw);
        console.log(template);
    };

    showTemplates = e => {
        e.preventDefault();
        this.props.showTemplates(this.props.formId, this.onTemplatesClose);
    };
    saveDraft = () => {
        const draftList = JSON.parse(localStorage.getItem('draft-list')) || [];

        const editedDraft = {
            author: this.props.username,
            title: this.state.title.value,
            body: this.state.body.value,
            tags: this.state.tags.value,
            permlink: this.state.draft_permlink
                ? this.state.draft_permlink.split('^')[1]
                : `${this.props.username}-${
                      new Date()
                          .toISOString()
                          .replace(':', '-')
                          .split('.')[0]
                  }`,
            timestamp: new Date().toISOString(),
        };

        if (this.state.draft_permlink) {
            const draftIdx = draftList.findIndex(
                data =>
                    data.author === editedDraft.author &&
                    data.permlink === editedDraft.permlink
            );

            if (draftIdx > -1) {
                draftList[draftIdx] = editedDraft;
            }
        } else {
            draftList.push(editedDraft);
            this.setState({
                draft_permlink: `${this.props.username}^${
                    editedDraft.permlink
                }`,
            });
        }

        localStorage.setItem('draft-list', JSON.stringify(draftList));
        alert(`${tt('reply_editor.draft_save_message')}`);
    };

    showAdvancedSettings = e => {
        e.preventDefault();
        this.props.setPayoutType(this.props.formId, this.props.payoutType);
        this.props.showAdvancedSettings(this.props.formId);
    };

    displayErrorMessage = message => {
        this.setState({
            progress: { error: message },
        });

        setTimeout(() => {
            this.setState({ progress: {} });
        }, 6000); // clear message
    };

    onDrop = (acceptedFiles, rejectedFiles) => {
        if (!acceptedFiles.length) {
            if (rejectedFiles.length) {
                this.displayErrorMessage('Please insert only image files.');
                console.log('onDrop Rejected files: ', rejectedFiles);
            }
            return;
        }

        if (acceptedFiles.length > MAX_FILE_TO_UPLOAD) {
            this.displayErrorMessage(
                `Please upload up to maximum ${MAX_FILE_TO_UPLOAD} images.`
            );
            console.log('onDrop too many files to upload');
            return;
        }

        for (let fi = 0; fi < acceptedFiles.length; fi += 1) {
            const acceptedFile = acceptedFiles[fi];
            const imageToUpload = {
                file: acceptedFile,
                temporaryTag: '',
            };
            imagesToUpload.push(imageToUpload);
        }

        this.insertPlaceHolders();
        this.uploadNextImage();
    };

    onOpenClick = () => {
        this.dropzone.open();
    };

    onPasteCapture = e => {
        try {
            if (e.clipboardData) {
                // @TODO: currently it seems to capture only one file, try to find a fix for multiple files
                for (const item of e.clipboardData.items) {
                    if (item.kind === 'file' && /^image\//.test(item.type)) {
                        const blob = item.getAsFile();
                        imagesToUpload.push({
                            file: blob,
                            temporaryTag: '',
                        });
                    }
                }

                this.insertPlaceHolders();
                this.uploadNextImage();
            } else {
                // http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/
                // contenteditable element that catches all pasted data
                this.setState({ noClipboardData: true });
            }
        } catch (error) {
            console.error('Error analyzing clipboard event', error);
        }
    };

    uploadNextImage = () => {
        if (imagesToUpload.length > 0) {
            const nextImage = imagesToUpload.pop();
            this.upload(nextImage);
        }
    };

    insertPlaceHolders = () => {
        let { imagesUploadCount } = this.state;
        const { body } = this.state;
        const { selectionStart } = this.refs.postRef;
        let placeholder = '';

        for (let ii = 0; ii < imagesToUpload.length; ii += 1) {
            const imageToUpload = imagesToUpload[ii];

            if (imageToUpload.temporaryTag === '') {
                imagesUploadCount++;
                imageToUpload.temporaryTag = `![Uploading image #${
                    imagesUploadCount
                }...]()`;
                placeholder += `\n${imageToUpload.temporaryTag}\n`;
            }
        }

        this.setState({ imagesUploadCount: imagesUploadCount });

        // Insert the temporary tag where the cursor currently is
        body.props.onChange(
            body.value.substring(0, selectionStart) +
                placeholder +
                body.value.substring(selectionStart, body.value.length)
        );
    };

    upload = image => {
        const { uploadImage } = this.props;
        this.setState({
            progress: { message: tt('reply_editor.uploading') },
        });

        uploadImage(image.file, progress => {
            const { body } = this.state;

            if (progress.url) {
                this.setState({ progress: {} });
                const { url } = progress;
                const imageMd = `![${image.file.name}](${url})`;

                // Replace temporary image MD tag with the real one
                body.props.onChange(
                    body.value.replace(image.temporaryTag, imageMd)
                );

                this.uploadNextImage();
            } else {
                if (progress.hasOwnProperty('error')) {
                    this.displayErrorMessage(progress.error);
                    const imageMd = `![${image.file.name}](UPLOAD FAILED)`;

                    // Remove temporary image MD tag
                    body.props.onChange(
                        body.value.replace(image.temporaryTag, imageMd)
                    );
                } else {
                    this.setState({ progress });
                }
            }
        });
    };

    render() {
        const originalPost = {
            category: this.props.category,
            body: this.props.body,
        };
        const { onCancel, onTitleChange } = this;
        const { title, tags, body, community, disabledCommunity } = this.state;
        const {
            reply,
            username,
            isStory,
            formId,
            author,
            permlink,
            parent_author,
            parent_permlink,
            type,
            jsonMetadata,
            successCallback,
            defaultPayoutType,
            payoutType,
            beneficiaries,
            steemMarketData,
        } = this.props;
        const {
            submitting,
            valid,
            handleSubmit,
            resetForm,
        } = this.state.replyForm;
        const { postError, titleWarn, rte } = this.state;
        const { progress, noClipboardData } = this.state;
        const disabled = submitting || !valid;
        const loading = submitting || this.state.loading;

        const errorCallback = estr => {
            this.setState({ postError: estr, loading: false });
        };
        const isEdit = type === 'edit';
        const successCallbackWrapper = (...args) => {
            if (!isEdit) {
                resetForm();
            }
            this.setState({ loading: false });
            this.props.setPayoutType(formId, defaultPayoutType);
            this.props.setBeneficiaries(formId, []);
            if (successCallback) successCallback(args);
        };
        const isHtml = rte || isHtmlTest(body.value);
        const replyParams = {
            author,
            permlink,
            parent_author,
            parent_permlink,
            type,
            username,
            originalPost,
            isHtml,
            isStory,
            jsonMetadata,
            payoutType,
            beneficiaries,
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

        return (
            <div className="Post">
                <div className="post-content">
                    {isStory &&
                        !isEdit && (
                            <div className="c-sidebr-ads">
                                <PrimaryNavigation
                                    routeTag="post"
                                    category="undefined"
                                />
                            </div>
                        )}
                    <div className="post-main">
                        {isStory &&
                            !isEdit &&
                            username && (
                                <PostCategoryBanner
                                    communityName={community}
                                    disabledCommunity={disabledCommunity}
                                    username={username}
                                    onCancel={this.shiftTagInput.bind(this)}
                                    onUndo={this.unshiftTagInput.bind(this)}
                                />
                            )}
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
                                                placeholder={tt(
                                                    'reply_editor.title'
                                                )}
                                                autoComplete="off"
                                                ref="titleRef"
                                                tabIndex={1}
                                                {...title.props}
                                            />
                                            <div
                                                className=" secondary"
                                                style={{
                                                    marginRight: '1rem',
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}
                                            >
                                                <a
                                                    href="#"
                                                    onClick={this.showTemplates}
                                                    style={{ color: '#1FBF8F' }}
                                                >
                                                    {tt(
                                                        'reply_editor.template'
                                                    )}
                                                </a>
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
                                                            onClick={
                                                                this.toggleRte
                                                            }
                                                        >
                                                            {tt(
                                                                'reply_editor.editor'
                                                            )}
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
                                        <SlateEditor
                                            ref="rte"
                                            placeholder={
                                                isStory
                                                    ? 'Write your story...'
                                                    : 'Reply'
                                            }
                                            initialState={this.state.rte_value}
                                            onChange={this.onChange}
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
                                                multiple
                                                accept="image/*"
                                                ref={node => {
                                                    this.dropzone = node;
                                                }}
                                            >
                                                <textarea
                                                    {...body.props}
                                                    ref="postRef"
                                                    onPasteCapture={
                                                        this.onPasteCapture
                                                    }
                                                    className={
                                                        type === 'submit_story'
                                                            ? 'upload-enabled'
                                                            : ''
                                                    }
                                                    disabled={loading}
                                                    rows={isStory ? 10 : 3}
                                                    placeholder={
                                                        isStory
                                                            ? tt(
                                                                  'g.write_your_story'
                                                              )
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
                                                    {tt(
                                                        'reply_editor.selecting_them'
                                                    )}
                                                </a>
                                                .
                                            </p>
                                            {progress.message && (
                                                <div className="info">
                                                    {progress.message}
                                                </div>
                                            )}
                                            {progress.error && (
                                                <div className="error">
                                                    {tt(
                                                        'reply_editor.image_upload'
                                                    )}{' '}
                                                    : {progress.error}
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
                                            <TagInput
                                                {...tags.props}
                                                onChange={tags.props.onChange}
                                                disabled={loading}
                                                isEdit={isEdit}
                                                tabIndex={3}
                                            />
                                            <div className="error">
                                                {(tags.touched || tags.value) &&
                                                    tags.error}
                                                &nbsp;
                                            </div>
                                        </span>
                                    )}
                                </div>
                                <div className={vframe_section_shrink_class}>
                                    {isStory &&
                                        !isEdit && (
                                            <div className="ReplyEditor__options">
                                                <div>
                                                    <div>
                                                        {tt('g.rewards')}
                                                        {': '}
                                                        {this.props
                                                            .payoutType ==
                                                            '0%' &&
                                                            tt(
                                                                'reply_editor.decline_payout'
                                                            )}
                                                        {this.props
                                                            .payoutType ==
                                                            '50%' &&
                                                            tt(
                                                                'reply_editor.default_50_50'
                                                            )}
                                                        {this.props
                                                            .payoutType ==
                                                            '100%' &&
                                                            tt(
                                                                'reply_editor.power_up_100'
                                                            )}
                                                    </div>
                                                    <div>
                                                        {beneficiaries &&
                                                            beneficiaries.length >
                                                                0 && (
                                                                <span>
                                                                    {tt(
                                                                        'g.beneficiaries'
                                                                    )}
                                                                    {': '}
                                                                    {tt(
                                                                        'reply_editor.beneficiaries_set',
                                                                        {
                                                                            count:
                                                                                beneficiaries.length,
                                                                        }
                                                                    )}
                                                                </span>
                                                            )}
                                                    </div>
                                                    <a
                                                        href="#"
                                                        onClick={
                                                            this
                                                                .showAdvancedSettings
                                                        }
                                                    >
                                                        {tt(
                                                            'reply_editor.advanced_settings'
                                                        )}
                                                    </a>{' '}
                                                    <br />
                                                    &nbsp;
                                                </div>
                                            </div>
                                        )}
                                </div>
                                <div className={vframe_section_shrink_class}>
                                    {postError && (
                                        <div className="error">{postError}</div>
                                    )}
                                </div>
                                <div className={vframe_section_shrink_class}>
                                    <div className="button-container">
                                        <div className="item ">
                                            {!loading && (
                                                <button
                                                    type="submit"
                                                    className="button"
                                                    disabled={disabled}
                                                    tabIndex={4}
                                                >
                                                    {isEdit
                                                        ? tt(
                                                              'reply_editor.update_post'
                                                          )
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
                                        </div>
                                        {isStory && (
                                            <div className="item">
                                                {!loading && (
                                                    <button
                                                        className="button"
                                                        tabIndex={7}
                                                        disabled={disabled}
                                                        onClick={
                                                            this
                                                                .onClickSaveDraft
                                                        }
                                                    >
                                                        {this.state
                                                            .draft_permlink
                                                            ? tt(
                                                                  'reply_editor.draft_update'
                                                              )
                                                            : tt(
                                                                  'reply_editor.draft_save'
                                                              )}
                                                    </button>
                                                )}
                                                {!loading && (
                                                    <button
                                                        className="button"
                                                        tabIndex={6}
                                                        onClick={
                                                            this.showDrafts
                                                        }
                                                    >
                                                        {tt(
                                                            'reply_editor.draft'
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {!isStory &&
                                        !isEdit &&
                                        this.props.payoutType != '50%' && (
                                            <div className="ReplyEditor__options float-right text-right">
                                                {tt('g.rewards')}
                                                {': '}
                                                {this.props.payoutType ==
                                                    '0%' &&
                                                    tt(
                                                        'reply_editor.decline_payout'
                                                    )}
                                                {this.props.payoutType ==
                                                    '100%' &&
                                                    tt(
                                                        'reply_editor.power_up_100'
                                                    )}
                                                {'. '}
                                                <a
                                                    href={
                                                        '/@' +
                                                        username +
                                                        '/settings'
                                                    }
                                                >
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
                                                'Preview ' +
                                                vframe_section_shrink_class
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
                                                text={body.value}
                                                large={isStory}
                                            />
                                        </div>
                                    )}
                            </form>
                        </div>
                    </div>
                    {isStory &&
                        !isEdit && (
                            <div className="c-sidebr-market">
                                {!steemMarketData.isEmpty() && (
                                    <SteemMarket page="CoinMarketPlacePost" />
                                )}
                            </div>
                        )}
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
    let html = serializeHtml(state);
    if (html === '<p></p>') html = '';
    if (html === '<p><br></p>') html = '';
    if (html == '') return '';
    return `<html>\n${html}\n</html>`;
}

function stateFromHtml(html = null) {
    if (html) html = stripHtmlWrapper(html);
    if (html && html.trim() == '') html = null;
    return html ? deserializeHtml(html) : getDemoState();
}

//var htmlclean = require('htmlclean');
function stateFromMarkdown(markdown) {
    let html;
    if (markdown && markdown.trim() !== '') {
        html = remarkable.render(markdown);
        html = HtmlReady(html).html; // TODO: option to disable youtube conversion, @-links, img proxy
        //html = htmlclean(html) // normalize whitespace
        console.log('markdown converted to:', html);
    }
    return stateFromHtml(html);
}

export default formId =>
    connect(
        // mapStateToProps
        (state, ownProps) => {
            const username = state.user.getIn(['current', 'username']);
            const fields = ['body'];
            const { type, parent_author } = ownProps;
            const isEdit = type === 'edit';
            const isStory =
                /submit_story/.test(type) || (isEdit && !parent_author);
            if (isStory) fields.push('title');
            if (isStory) fields.push('tags');

            let { category, title, body } = ownProps;
            if (/submit_/.test(type)) title = body = '';
            // type: PropTypes.oneOf(['submit_story', 'submit_comment', 'edit'])

            const query = state.routing.locationBeforeTransitions.query;
            if (query && query.category) {
                category = query.category;
            }

            const jsonMetadata = ownProps.jsonMetadata
                ? ownProps.jsonMetadata instanceof Map
                  ? ownProps.jsonMetadata.toJS()
                  : ownProps.jsonMetadata
                : {};

            let tags = category;
            if (isStory && jsonMetadata && jsonMetadata.tags) {
                tags = OrderedSet([category, ...jsonMetadata.tags]).join(' ');
            }
            let isNSFWCommunity = false;
            isNSFWCommunity = state.global.getIn([
                'community',
                category,
                'is_nsfw',
            ]);
            if (isNSFWCommunity) {
                tags = `${tags} nsfw`;
            }
            const defaultPayoutType = state.app.getIn(
                [
                    'user_preferences',
                    isStory ? 'defaultBlogPayout' : 'defaultCommentPayout',
                ],
                '50%'
            );
            let payoutType = state.user.getIn([
                'current',
                'post',
                formId,
                'payoutType',
            ]);
            if (!payoutType) {
                payoutType = defaultPayoutType;
            }
            let beneficiaries = state.user.getIn([
                'current',
                'post',
                formId,
                'beneficiaries',
            ]);
            beneficiaries = beneficiaries ? beneficiaries.toJS() : [];
            const steemMarketData = state.app.get('steemMarket');

            // Post full
            /*
            const replyParams = {
                author,
                permlink,
                parent_author,
                parent_permlink,
                category,
                title,
                body: post.get('body'),
            }; */

            //ownProps:
            //  {...comment},
            //  author, permlink,
            //  body, title, category
            //  parent_author, parent_permlink,
            //  type, successCallback,
            //  successCallBack, onCancel
            return {
                ...ownProps,
                type, //XX
                jsonMetadata, //XX (if not reply)
                category,
                fields,
                isStory,
                username,
                defaultPayoutType,
                payoutType,
                beneficiaries,
                initialValues: { title, body, tags },
                formId,
                steemMarketData,
            };
        },

        // mapDispatchToProps
        dispatch => ({
            uploadImage: (file, progress) =>
                dispatch(userActions.uploadImage({ file, progress })),
            showAdvancedSettings: formId =>
                dispatch(userActions.showPostAdvancedSettings({ formId })),
            showDrafts: (formId, onDraftsClose, clearDraft) =>
                dispatch(
                    userActions.showPostDrafts({
                        formId,
                        onDraftsClose,
                        clearDraft,
                    })
                ),
            showTemplates: (formId, onTemplatesClose) =>
                dispatch(
                    userActions.showPostTemplates({ formId, onTemplatesClose })
                ),
            setPayoutType: (formId, payoutType) =>
                dispatch(
                    userActions.set({
                        key: ['current', 'post', formId, 'payoutType'],
                        value: payoutType,
                    })
                ),
            setBeneficiaries: (formId, beneficiaries) =>
                dispatch(
                    userActions.set({
                        key: ['current', 'post', formId, 'beneficiaries'],
                        value: fromJS(beneficiaries),
                    })
                ),
            reply: ({
                tags,
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
                beneficiaries = [],
                username,
                jsonMetadata,
                successCallback,
                errorCallback,
                startLoadingIndicator,
            }) => {
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

                const metaTags = allTags(
                    tags,
                    originalPost.category,
                    rtags.hashtags
                );

                // merge
                const meta = isEdit ? jsonMetadata : {};
                if (metaTags.size) meta.tags = metaTags.toJS();
                else delete meta.tags;
                if (rtags.usertags.size) meta.users = rtags.usertags;
                else delete meta.users;
                if (rtags.images.size)
                    meta.image = rtags.images; // TODO: save first image
                else delete meta.image;
                if (rtags.links.size)
                    meta.links = rtags.links; // TODO: remove? save first?
                else delete meta.links;

                meta.app = 'steemit/0.2';
                if (isStory) {
                    meta.format = isHtml ? 'html' : 'markdown';
                }

                const sanitizeErrors = [];
                sanitize(body, sanitizeConfig({ sanitizeErrors }));
                if (sanitizeErrors.length) {
                    errorCallback(sanitizeErrors.join('.  '));
                    return;
                }

                if (meta.tags && meta.tags.length > MAX_TAGS) {
                    const includingCategory = isEdit
                        ? tt('reply_editor.including_the_category', {
                              rootCategory: originalPost.category,
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
                    if (beneficiaries && beneficiaries.length > 0) {
                        if (!__config.comment_options) {
                            __config.comment_options = {};
                        }
                        __config.comment_options.extensions = [
                            [
                                0,
                                {
                                    beneficiaries: beneficiaries
                                        .sort(
                                            (a, b) =>
                                                a.username < b.username
                                                    ? -1
                                                    : a.username > b.username
                                                      ? 1
                                                      : 0
                                        )
                                        .map(elt => ({
                                            account: elt.username,
                                            weight: parseInt(elt.percent) * 100,
                                        })),
                                },
                            ],
                        ];
                    }
                }

                const operation = {
                    ...linkProps,
                    category: originalPost.category || metaTags.first(),
                    title,
                    body,
                    json_metadata: JSON.stringify(meta),
                    __config,
                };
                userActionRecord('comment', {
                    username,
                    is_edit: isEdit,
                    payout_type: payoutType,
                    comment_type: /-reply$/.test(formId) ? 'reply' : 'post',
                });
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
