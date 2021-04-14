import React from 'react';
import PropTypes from 'prop-types';
import reactForm from 'app/utils/ReactForm';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as userActions from 'app/redux/UserReducer';
import TagInput from 'app/components/cards/TagInput';
import { validateTagInput } from 'app/components/cards/TagInput';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import PostCategoryBanner from 'app/components/elements/PostCategoryBanner';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Tooltip from 'app/components/elements/Tooltip';
import sanitizeConfig, { allowedTags } from 'app/utils/SanitizeConfig';
import sanitize from 'sanitize-html';
import HtmlReady from 'shared/HtmlReady';
import { fromJS, Set, OrderedSet } from 'immutable';
import Remarkable from 'remarkable';
import Dropzone from 'react-dropzone';
import tt from 'counterpart';
import { userActionRecord } from 'app/utils/ServerApiClient';
import EditorMd from 'app/components/elements/Editor';

const remarkable = new Remarkable({ html: true, linkify: false, breaks: true });

const MAX_TAGS = 8;
const MAX_FILE_TO_UPLOAD = 10;
let imagesToUpload = [];

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

class ReplyEditorNew extends React.Component {
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
        this.state = {
            progress: {},
            imagesUploadCount: 0,
            cm: null,
            editorId: 'EditorID' + new Date().getTime(),
        };
        this.initForm(props);
    }

    componentWillMount() {
        const { formId } = this.props;
        if (process.env.BROWSER) {
            let raw = null;
            // Process initial body value (if this is an edit)
            const { body } = this.state;
            if (body) {
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

            body.props.onChange(raw);
        }

        // Overwrite category (even if draft loaded) if authoritative category was provided
        if (this.props.category) {
            if (this.state.tags) {
                this.state.tags.props.onChange(this.props.initialValues.tags);
            }
            this.checkTagsCommunity(this.props.category);
        }
    }
    parseToDOM(str) {
        var div = document.createElement('div');
        if (typeof str == 'string') div.innerHTML = str;
        return div;
    }

    domToString(dom) {
        return dom.innerHTML;
    }

    proxifyImages(doc) {
        if (!doc) return;
        [...doc.getElementsByTagName('img')].forEach(node => {
            const url = node.getAttribute('src');
            if (url.indexOf('/https:') > -1)
                node.setAttribute('src', `https:${url.split('/https:')[1]}`);
        });
        return doc;
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
                    body: body ? body.value : undefined,
                    payoutType,
                    beneficiaries,
                };

                clearTimeout(saveEditorTimeout);
                saveEditorTimeout = setTimeout(() => {
                    // console.log('save formId', formId, content)
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

    onEditorChange = content => {
        const { body } = this.state;
        body.props.onChange(content);
    };

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
        const { replyForm, body, cm } = this.state;
        if (
            !body.value ||
            confirm(tt('reply_editor.are_you_sure_you_want_to_clear_this_form'))
        ) {
            replyForm.resetForm();
            this.setState({ progress: {} });
            this.props.setPayoutType(formId, defaultPayoutType);
            this.props.setBeneficiaries(formId, []);
            cm.clear();
            if (onCancel) onCancel(e);
        }
    };

    // As rte_editor is updated, keep the (invisible) 'body' field in sync.
    onChange = rte_value => {
        /*this.refs.rte.setState({ state: rte_value });*/
        //const html = stateToHtml(rte_value);
        const { body } = this.state;
        //if (body.value !== html) body.props.onChange(rte_value);
        body.props.onChange(rte_value);
    };

    showDraftSaved() {
        const { draft } = this.refs;
        if (draft) {
            draft.className = 'ReplyEditor__draft';
            void draft.offsetWidth; // reset animation
            draft.className = 'ReplyEditor__draft ReplyEditor__draft-saved';
        }
    }

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
        let { imagesUploadCount, cm } = this.state;
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

        this.setState({ imagesUploadCount });
        cm.insertValue(`${placeholder}`);
    };

    upload = image => {
        console.log('image');
        console.log(image);
        const { uploadImage } = this.props;
        this.setState({
            progress: { message: tt('reply_editor.uploading') },
        });

        uploadImage(image.file, progress => {
            const { cm } = this.state;
            if (progress.url) {
                this.setState({ progress: {} });
                const { url } = progress;
                const imageMd = `![${image.file.name}](${url})`;
                // Replace temporary image MD tag with the real one
                const tmpContent = cm
                    .getMarkdown()
                    .replace(image.temporaryTag, imageMd);
                cm.setMarkdown(tmpContent);
                this.uploadNextImage();
            } else {
                if (progress.hasOwnProperty('error')) {
                    this.displayErrorMessage(progress.error);
                    const imageMd = `![${image.file.name}](UPLOAD FAILED)`;
                    // Remove temporary image MD tag
                    const tmpContent = cm
                        .getMarkdown()
                        .replace(image.temporaryTag, imageMd);
                    cm.setMarkdown(tmpContent);
                } else {
                    this.setState({ progress });
                }
            }
        });
    };

    onLoaded = cm => {
        this.setState({
            cm,
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
        } = this.props;
        const {
            submitting,
            valid,
            handleSubmit,
            resetForm,
        } = this.state.replyForm;
        const { postError, titleWarn } = this.state;
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
        const replyParams = {
            author,
            permlink,
            parent_author,
            parent_permlink,
            type,
            username,
            originalPost,
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
        const vframe_section_shrink_class = isStory
            ? 'vframe__section--shrink'
            : '';

        return (
            <div className="ReplyEditor row">
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
                            let body = data.body;
                            data.body = this.domToString(
                                this.proxifyImages(this.parseToDOM(body))
                            );
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
                                    {titleError}
                                </span>
                            )}
                        </div>

                        <div
                            className={
                                'ReplyEditor__body ' +
                                vframe_section_shrink_class
                            }
                        >
                            {process.env.BROWSER && (
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
                                    <EditorMd
                                        placeholder={
                                            this.props.isStory
                                                ? tt('g.write_your_story')
                                                : tt('g.reply')
                                        }
                                        onPasteCapture={this.onPasteCapture}
                                        onChange={this.onEditorChange}
                                        customUpload={this.onOpenClick}
                                        onLoaded={this.onLoaded}
                                        content={
                                            this.state.body
                                                ? this.state.body.value
                                                : null
                                        }
                                        editorId={this.state.editorId}
                                    />
                                </Dropzone>
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
                                            tags.error}&nbsp;
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
                                                {this.props.payoutType ==
                                                    '0%' &&
                                                    tt(
                                                        'reply_editor.decline_payout'
                                                    )}
                                                {this.props.payoutType ==
                                                    '50%' &&
                                                    tt(
                                                        'reply_editor.default_50_50'
                                                    )}
                                                {this.props.payoutType ==
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
                                                    this.showAdvancedSettings
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
                            {!isStory &&
                                !isEdit &&
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
                        <div className={vframe_section_shrink_class}>
                            {disabled && (
                                <span
                                    style={{
                                        fontSize: '14px',
                                        color: '#FF0000',
                                    }}
                                >
                                    {tt('reply_editor.tips')}
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

let saveEditorTimeout;

// See also MarkdownViewer render
const isHtmlTest = text => /^<html>/.test(text);

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
            };
        },

        // mapDispatchToProps
        dispatch => ({
            uploadImage: (file, progress) =>
                dispatch(userActions.uploadImage({ file, progress })),
            showAdvancedSettings: formId =>
                dispatch(userActions.showPostAdvancedSettings({ formId })),
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

                let rtags;
                {
                    const html = remarkable.render(body);
                    rtags = HtmlReady(html, {
                        mutate: false,
                        isProxifyImages: true,
                    });
                }

                allowedTags.forEach(tag => {
                    rtags.htmltags.delete(tag);
                });
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
                    meta.format = 'markdown';
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
    )(ReplyEditorNew);
