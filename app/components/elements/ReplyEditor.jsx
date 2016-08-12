import React from 'react';
import {reduxForm} from 'redux-form'
import transaction from 'app/redux/Transaction';
import MarkdownViewer from 'app/components/cards/MarkdownViewer'
import CategorySelector from 'app/components/cards/CategorySelector'
import {validateCategory} from 'app/components/cards/CategorySelector'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import Tooltip from 'app/components/elements/Tooltip'
import sanitizeConfig, {allowedTags} from 'app/utils/SanitizeConfig'
import sanitize from 'sanitize-html'
import HtmlReady from 'shared/HtmlReady'
import g from 'app/redux/GlobalReducer'
import links from 'app/utils/Links'
import {Map, Set} from 'immutable'
import {cleanReduxInput} from 'app/utils/ReduxForms'

const RichTextEditor = process.env.BROWSER ? require('react-rte-image').default : null;
const RTE_DEFAULT = false

let saveEditorTimeout

// removes <html></html> wrapper if exists
function getHtml(text) {
    const m = text.match(/<html>([\S\s]*)<\/html>/m);
    return m && m.length === 2 ? m[1] : text;
}

const isHtmlTest = text =>
    /^<html>/.test(text) ||
    /^<p>/.test(text)


class ReplyEditor extends React.Component {

    static propTypes = {

        // html component attributes
        formId: React.PropTypes.string.isRequired, // unique form id for each editor
        author: React.PropTypes.string, // empty or string for top-level post
        permlink: React.PropTypes.string, // new or existing category (default calculated from title)
        parent_author: React.PropTypes.string, // empty or string for top-level post
        parent_permlink: React.PropTypes.string, // new or existing category
        type: React.PropTypes.oneOf(['submit_story', 'submit_comment', 'edit']),
        successCallback: React.PropTypes.func, // indicator that the editor is done and can be hidden
        onCancel: React.PropTypes.func, // hide editor when cancel button clicked
        jsonMetadata: React.PropTypes.object, // An existing comment has its own meta data

        category: React.PropTypes.string, // initial value
        title: React.PropTypes.string, // initial value
        body: React.PropTypes.string, // initial value

        //redux connect
        reply: React.PropTypes.func.isRequired,
        setMetaLink: React.PropTypes.func.isRequired,
        clearMetaData: React.PropTypes.func.isRequired,
        setMetaData: React.PropTypes.func.isRequired,
        metaLinkData: React.PropTypes.object,
        state: React.PropTypes.object.isRequired,
        hasCategory: React.PropTypes.bool.isRequired,
        isStory: React.PropTypes.bool.isRequired,
        username: React.PropTypes.string,

        // redux-form
        fields: React.PropTypes.object.isRequired,
        handleSubmit: React.PropTypes.func.isRequired,
        resetForm: React.PropTypes.func.isRequired,
        submitting: React.PropTypes.bool.isRequired,
        invalid: React.PropTypes.bool.isRequired,
    }

    static defaultProps = {
        isStory: false,
        author: '',
        parent_author: '',
        parent_permlink: '',
        type: 'submit_comment',
        metaLinkData: Map(),
    }

    constructor() {
        super()
        this.state = {}
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'ReplyEditor')
        this.onTitleChange = e => {
            const value = e.target.value
            // TODO block links in title (the do not make good permlinks)
            const hasMarkdown = /(?:\*[\w\s]*\*|\#[\w\s]*\#|_[\w\s]*_|~[\w\s]*~|\]\s*\(|\]\s*\[)/.test(value)
            this.setState({ titleWarn: hasMarkdown ? 'Markdown is not supported here' : '' })
            this.props.fields.title.onChange(e)
        }
        this.onCancel = e => {
            if(e) e.preventDefault()
            const {onCancel, resetForm} = this.props
            resetForm()
            this.setAutoVote()
            this.setState({rte_value: RichTextEditor ? RichTextEditor.createEmptyValue() : null})
            if(onCancel) onCancel(e)
        }
        this.onChange = this.onChange.bind(this);
        this.toggleRte = this.toggleRte.bind(this);
        this.focus = (e) => {
            if(e) e.stopPropagation()
            const {postRef, rte} = this.refs
            if(postRef)
                postRef.focus()
            else {
                if (e.target && e.target.className && e.target.className.indexOf('ReplyEditor__body') !== -1)
                    rte._focus();
            }
        }
        this.autoVoteOnChange = () => {
            const {autoVote} = this.props.fields
            const key = 'replyEditorData-autoVote-story'
            localStorage.setItem(key, !autoVote.value)
            autoVote.onChange(!autoVote.value)
        }
    }
    componentWillMount() {
        const {setMetaData, formId, jsonMetadata} = this.props
        if(process.env.BROWSER) {
            let editorData = localStorage.getItem('replyEditorData-' + formId)
            if(editorData) {
                editorData = JSON.parse(editorData)
                if(editorData.formId === formId) {
                    const {fields: {category, title, body}} = this.props
                    if(category) category.onChange(editorData.category)
                    if(title) title.onChange(editorData.title)
                    if (editorData.body) {
                        body.onChange(editorData.body)
                        const html = getHtml(editorData.body)
                        this.state.rte_value = RichTextEditor.createValueFromString(html, 'html')
                    }
                }
            }
            this.setAutoVote()
            const {body} = this.props.fields
            let rte = false
            if(process.env.BROWSER) {
                const {isStory} = this.props
                if(isStory)
                    rte = JSON.parse(localStorage.getItem('replyEditorData-rte') || RTE_DEFAULT);
            }
            let rte_value;
            if (RichTextEditor) {
                if (body.value) {
                    if (isHtmlTest(body.value)) {
                        rte = true;
                        const html = getHtml(body.value);
                        rte_value = RichTextEditor.createValueFromString(html, 'html')
                    } else {
                        rte = false;
                        rte_value = RichTextEditor.createEmptyValue();
                        // body.initialValue causes 100% cpu when editing http://localhost:3002/steemit/@cryptomental/can-a-viral-introduceyourself-post-be-engineered
                        // rte_value = RichTextEditor.createValueFromString(body.initialValue, 'html');
                    }
                } else {
                    rte_value = RichTextEditor.createEmptyValue();
                }
            }
            this.setState({rte, rte_value})
        }
        setMetaData(formId, jsonMetadata)
    }
    componentDidMount() {
        // focus
        setTimeout(() => {
            if (this.props.isStory) this.refs.titleRef.focus()
            else if (this.refs.postRef) this.refs.postRef.focus()
            else if (this.refs.rte) this.refs.rte._focus()
        }, 300)
    }
    componentWillReceiveProps(nextProps) {
        {
            const {fields: {body}} = nextProps
            let markdownViewerText = ''
            markdownViewerText += body.value
            this.setState({ markdownViewerText })
        }
        if(process.env.BROWSER) {
            const tp = this.props.fields
            const np = nextProps.fields
            if(tp.body.value !== np.body.value ||
                (np.category && tp.category.value !== np.category.value) ||
                (np.title && tp.title.value !== np.title.value)
            ) { // also prevents saving after parent deletes this information
                const {fields: {category, title, body}, formId} = nextProps
                const data = {formId}
                data.title = title ? title.value : undefined
                data.category = category ? category.value : undefined
                data.body = body.value
                clearTimeout(saveEditorTimeout)
                saveEditorTimeout = setTimeout(() => {
                    // console.log('save formId', formId)
                    localStorage.setItem('replyEditorData-' + formId, JSON.stringify(data, null, 0))
                }, 350)
            }
            if(tp.body.value !== np.body.value) {
                if(this.state.rte) {
                    const {body} = nextProps.fields
                    const html = getHtml(body.value)
                    this.state.rte_value = RichTextEditor.createValueFromString(html, 'html');
                }
            }
        }
    }
    componentWillUnmount() {
        const {clearMetaData, formId} = this.props
        clearMetaData(formId)
    }
    onChange(rte_value) {
        this.setState({rte_value})
        let html = rte_value.toString('html');
        if (html === '<p><br></p>') html = '';
        else if (html.indexOf('<html>') !== 0) html = `<html>\n${html}\n</html>`;
        const body = this.props.fields.body
        body.onChange(html);
    }
    setAutoVote() {
        const {isStory} = this.props
        if(isStory) {
            const {autoVote} = this.props.fields
            const key = 'replyEditorData-autoVote-story'
            const autoVoteDefault = JSON.parse(localStorage.getItem(key) || true)
            autoVote.onChange(autoVoteDefault)
        }
    }
    testForMetaLink(bodyText) {
        if(!bodyText) return
        // Check for links but not on every character (you'll get a lot of invalid links while typing)
        // Save the link in metaLink when it is complete.
        const {markdownViewerText} = this.state
        const oldLen = markdownViewerText ? markdownViewerText.length : 0
        const newLen = bodyText.length
        const bodyChanged = oldLen !== newLen
        if(!bodyChanged) return
        const match = bodyText.match(links.any)
        if(match) {
            const link = match[0]
            // body suddenly increases by more than one char
            const bodyPasted = oldLen + 1 < newLen
            const {formId, setMetaLink} = this.props
            if(bodyPasted)
                // pasted link is complete
                setMetaLink(formId, link)
            else {
                // user is typing
                if(this.state.typingLink === link) {
                    // the link stopped changing
                    setMetaLink(formId, link)
                } else
                    this.setState({typingLink: link})
            }
        }
    }
    toggleRte(e) {
        e.preventDefault();
        const state = {rte: !this.state.rte};
        if (state.rte) {
            state.rte_value = RichTextEditor.createValueFromString(this.props.fields.body.value, 'html');
        }
        this.setState(state);
        localStorage.setItem('replyEditorData-rte', !this.state.rte)
    }
    render() {
        // NOTE title, category, and body are UI form fields ..
        const originalPost = {
            title: this.props.title,
            category: this.props.category,
            body: this.props.body,
        }
        const {onCancel, autoVoteOnChange} = this
        const {title, category, body, autoVote} = this.props.fields
        const {
            reply, username, hasCategory, isStory, formId, noImage,
            author, permlink, parent_author, parent_permlink, type, jsonMetadata, metaLinkData,
            state, successCallback, handleSubmit, submitting, invalid, //lastComment,
        } = this.props
        const {postError, markdownViewerText, loading, titleWarn, rte} = this.state
        const {onTitleChange} = this
        const errorCallback = estr => { this.setState({ postError: estr, loading: false }) }
        const successCallbackWrapper = (...args) => {
            this.setState({ loading: false })
            if (successCallback) successCallback(args)
        }
        const isEdit = type === 'edit'
        // Be careful, autoVote can reset curation rewards.  Never autoVote on edit..
        const autoVoteValue = !isEdit && autoVote.value
        const replyParams = {
            author, permlink, parent_author, parent_permlink, type, state, originalPost,
            jsonMetadata, metaLinkData, autoVote: autoVoteValue, successCallback: successCallbackWrapper, errorCallback
        }
        const postLabel = username ? <Tooltip t={'Post as “' + username + '”'}>Post</Tooltip> : 'Post'
        const hasTitleError = title && title.touched && title.error
        let titleError = null
        // The Required title error (triggered onBlur) can shift the form making it hard to click on things..
        if ((hasTitleError && (title.error !== 'Required' || body.value !== '')) || titleWarn) {
            titleError = <div className={hasTitleError ? 'error' : 'warning'}>
                {hasTitleError ? title.error : titleWarn}&nbsp;
            </div>
        }
        let isHtml = false;
        let isMarkdown = false;
        if (body.value) {
            isMarkdown = !isHtmlTest(body.value);
            isHtml = !isMarkdown;
        }

        const vframe_class = isStory ? 'vframe' : '';
        const vframe_section_class = isStory ? 'vframe__section' : '';
        const vframe_section_shrink_class = isStory ? 'vframe__section--shrink' : '';

        return (
            <div className="ReplyEditor row">
                <div className="column small-12">
                    <form className={vframe_class}
                        onSubmit={handleSubmit(data => {
                            const loadingCallback = () => this.setState({loading: true, postError: undefined})
                            reply({ ...data, ...replyParams, loadingCallback })
                        })}
                        onChange={() => {this.setState({ postError: null })}}
                    >
                        <div className={vframe_section_shrink_class}>
                            {isStory && <span>
                                <input type="text" {...cleanReduxInput(title)} onChange={onTitleChange} disabled={loading} placeholder="Title" autoComplete="off" ref="titleRef" tabIndex={1} />
                                {titleError}
                            </span>}
                        </div>

                        <div className={'ReplyEditor__body ' + (rte ? `rte ${vframe_section_class}` : vframe_section_shrink_class)} onClick={this.focus}>
                            <div className="float-right secondary" style={{marginRight: '1rem'}}>
                                {rte && <a href="#" onClick={this.toggleRte}>{isHtml ? 'Raw HTML' : 'Markdown'}</a>}
                                {!rte && isStory && (isHtml || !body.value) && <a href="#" onClick={this.toggleRte}>Editor</a>}
                            </div>
                            {process.env.BROWSER && rte ?
                                <RichTextEditor ref="rte"
                                    readOnly={loading}
                                    value={this.state.rte_value}
                                    onChange={this.onChange}
                                    onBlur={body.onBlur} tabIndex={2} />
                                :
                                <textarea {...cleanReduxInput(body)} disabled={loading} rows={isStory ? 10 : 3} placeholder={isStory ? 'Write your story...' : 'Reply'} autoComplete="off" ref="postRef" tabIndex={2} />
                            }
                        </div>
                        <div className={vframe_section_shrink_class}>
                            <div className="error">{body.touched && body.error && body.error !== 'Required' && body.error}</div>
                        </div>

                        <div className={vframe_section_shrink_class} style={{marginTop: '0.5rem'}}>
                            {hasCategory && <span>
                                <CategorySelector {...category} disabled={loading} isEdit={isEdit} tabIndex={3} />
                                <div className="error">{category.touched && category.error && category.error}&nbsp;</div>
                            </span>}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            {postError && <div className="error">{postError}</div>}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            {!loading && <button type="submit" className="button" disabled={submitting || invalid} tabIndex={4}>{isEdit ? 'Update Post' : postLabel}</button>}
                            {loading && <span><br /><LoadingIndicator type="circle" /></span>}
                            &nbsp; {!loading && this.props.onCancel &&
                                <button type="button" className="secondary hollow button no-border" tabIndex={5} onClick={(e) => {e.preventDefault(); onCancel()}}>Cancel</button>
                            }
                            {!loading && !this.props.onCancel && <button className="button hollow no-border" tabIndex={5} disabled={submitting} onClick={onCancel}>Clear</button>}
                            {isStory && !isEdit && <div className="float-right">
                                <small onClick={autoVoteOnChange}>Upvote post</small>
                                &nbsp;&nbsp;
                                <input type="checkbox" {...cleanReduxInput(autoVote)} onChange={autoVoteOnChange} />
                            </div>}
                        </div>
                        {!loading && !rte && markdownViewerText && <div className={'Preview ' + vframe_section_shrink_class}>
                            {!isHtml && <div className="float-right"><a target="_blank" href="https://guides.github.com/features/mastering-markdown/">Styling with Markdown is supported.</a></div>}
                            <h6>Preview</h6>
                            <MarkdownViewer formId={formId} text={markdownViewerText} canEdit jsonMetadata={jsonMetadata} large={isStory} noImage={noImage} />
                        </div>}
                    </form>
                </div>
            </div>
        )
    }
}

export default formId => reduxForm(
    // config
    {form: formId},
    // https://github.com/erikras/redux-form/issues/949
    // Warning: Failed propType: Required prop `form` was not specified in `ReduxFormConnector(ReplyEditor)`. Check the render method of `ConnectedForm`.

    // mapStateToProps
    (state, ownProps) => {
        // const current = state.user.get('current')||Map()
        const username = state.user.getIn(['current', 'username'])
        const fields = ['body', 'autoVote']
        const {type, parent_author, jsonMetadata} = ownProps
        const isStory = /submit_story/.test(type) || (
            /edit/.test(type) && parent_author === ''
        )
        const hasCategory = isStory // /submit_story/.test(type)
        if (isStory) {
            fields.push('title')
        }
        if (hasCategory) fields.push('category')
        const isEdit = type === 'edit'
        const maxKb = isStory ? 100 : 16
        const validate = values => ({
            title: isStory && (
                !values.title || values.title.trim() === '' ? 'Required' :
                values.title.length > 255 ? 'Shorten title' :
                null
            ),
            category: hasCategory && validateCategory(values.category, !isEdit),
            body: !values.body ? 'Required' :
                  values.body.length > maxKb * 1024 ? 'Exceeds maximum length ('+maxKb+'KB)' : null,
        })
        let {category, title, body} = ownProps

        if (/submit_/.test(type)) title = body = ''

        if(hasCategory && jsonMetadata && jsonMetadata.tags) {
            category = Set([category, ...jsonMetadata.tags]).join(' ')
        }
        const metaLinkData = state.global.getIn(['metaLinkData', formId])
        const ret = {
            ...ownProps,
            fields, validate, isStory, hasCategory, username,
            initialValues: {title, body, category}, state,
            // lastComment: current.get('lastComment'),
            formId,
            metaLinkData,
        }
        return ret
    },

    // mapDispatchToProps
    dispatch => ({
        setMetaLink: (/*id, link*/) => {
            // TODO
            // dispatch(g.actions.requestMeta({id, link}))
        },
        clearMetaData: (id) => {
            dispatch(g.actions.clearMeta({id}))
        },
        setMetaData: (id, jsonMetadata) => {
            dispatch(g.actions.setMetaData({id, meta: jsonMetadata ? jsonMetadata.steem : null}))
        },
        reply: ({category, title, body, author, permlink, parent_author, parent_permlink,
            type, originalPost, autoVote = false, state, jsonMetadata, /*metaLinkData,*/ successCallback, errorCallback, loadingCallback}) => {
            // const post = state.global.getIn(['content', author + '/' + permlink])
            const username = state.user.getIn(['current', 'username'])

            // Wire up the current and parent props for either an Edit or a Submit (new post)
            //'submit_story', 'submit_comment', 'edit'
            const linkProps =
                /^submit_/.test(type) ? { // submit new
                    parent_author: author,
                    parent_permlink: permlink,
                    author: username,
                    // permlink,  assigned in TransactionSaga
                } :
                // edit existing
                /^edit$/.test(type) ? {author, permlink, parent_author, parent_permlink}
                : null

            if (!linkProps) throw new Error('Unknown type: ' + type)

            const formCategories = Set(category ? category.split(/ +/) : [])
            const rootCategory = originalPost && originalPost.category ?
                originalPost.category : formCategories.first()
            const rootTag = /^[-a-z\d]+$/.test(rootCategory) ? rootCategory : null

            const rtags = HtmlReady(body, {mutate: false})
            allowedTags.forEach(tag => {rtags.htmltags.delete(tag)})
            rtags.htmltags.delete('html')
            if(rtags.htmltags.size) {
                errorCallback('Please remove the following tags from your post: ' + Array(...rtags.htmltags).join(', '))
                return
            }

            let allCategories = Set([...formCategories.toJS(), ...rtags.hashtags])
            if(rootTag) allCategories = allCategories.add(rootTag)

            // merge
            const meta = /edit/.test(type) ? jsonMetadata : {}
            if(allCategories.size) meta.tags = allCategories.toJS(); else delete meta.tags
            if(rtags.usertags.size) meta.users = rtags.usertags; else delete meta.users
            if(rtags.images.size) meta.image = rtags.images; else delete meta.image
            if(rtags.links.size) meta.links = rtags.links; else delete meta.links

            // const cp = prop => { if(metaLinkData.has(prop)) json_metadata.steem[prop] = metaLinkData.get(prop) }
            // cp('link')
            // cp('image')
            // cp('description')
            // if(Object.keys(json_metadata.steem).length === 0) json_metadata = {}// keep json_metadata minimal
            const sanitizeErrors = []
            sanitize(body, sanitizeConfig({sanitizeErrors}))
            if(sanitizeErrors.length) {
                errorCallback(sanitizeErrors.join('.  '))
                return
            }


            if(meta.tags.length > 5) {
                const includingCategory = /edit/.test(type) ? ` (including the category '${rootCategory}')` : ''
                errorCallback(`You have ${meta.tags.length} tags total${includingCategory}.  Please use only 5 in your post and category line.`)
                return
            }
            const operation = {
                ...linkProps,
                category: rootCategory, title, body,
                json_metadata: meta,
                __config: {originalPost, autoVote}
            }
            // loadingCallback starts the loading indicator
            loadingCallback()
            dispatch(transaction.actions.broadcastOperation({
                type: 'comment',
                operation,
                errorCallback,
                successCallback,
            }))
        },
    })
)(ReplyEditor)

