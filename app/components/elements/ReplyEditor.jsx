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
import {Set} from 'immutable'
import {cleanReduxInput} from 'app/utils/ReduxForms'
import Remarkable from 'remarkable'
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';

const remarkable = new Remarkable({ html: true, linkify: false })
const RichTextEditor = process.env.BROWSER ? require('react-rte-image').default : null;
const RTE_DEFAULT = false

let saveEditorTimeout

// removes <html></html> wrapper if exists
function stripHtmlWrapper(text) {
    const m = text.match(/<html>\n?([\S\s]+?)\n?<\/html>/m);
    return m && m.length === 2 ? m[1] : text;
}

function addHtmlWrapper(body) {
    if(/^<html>/.test(body)) {
        const err = "Error: content passed to addHtmlWrapper is already wrapped";
        serverApiRecordEvent('assert_error', err);
        console.log(err);
        return body
    }
    if(!body || body.trim() === '') body = '';
    return `<html>\n${body}\n</html>`;
}

// See also MarkdownViewer render
const isHtmlTest = text =>
    /^<html>/.test(text) ||
    /^<p>[\S\s]*<\/p>/.test(text)

function stateToHtml(state) {
    let html = state.toString('html');
    if (html === '<p></p>') html = '';
    if (html === '<p><br></p>') html = '';
    return html
}

function stateFromHtml(html = null) {
    if(!RichTextEditor) return null;
    if(html && html.trim() == '') html = null
    return html ? RichTextEditor.createValueFromString(html, 'html')
                : RichTextEditor.createEmptyValue()
}

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
        clearMetaData: React.PropTypes.func.isRequired,
        setMetaData: React.PropTypes.func.isRequired,
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
            this.setState({rte_value: stateFromHtml()})
            if(onCancel) onCancel(e)
        }
        this.onChange = this.onChange.bind(this);
        this.toggleRte = this.toggleRte.bind(this);
        this.autoVoteOnChange = () => {
            const {autoVote} = this.props.fields
            const key = 'replyEditorData-autoVote-story'
            localStorage.setItem(key, !autoVote.value)
            autoVote.onChange(!autoVote.value)
        }
    }

    componentWillMount() {
        const {setMetaData, formId, jsonMetadata} = this.props
        setMetaData(formId, jsonMetadata)

        if(process.env.BROWSER) {

            // Check for rte editor preference
            let rte  = this.props.isStory && JSON.parse(localStorage.getItem('replyEditorData-rte') || RTE_DEFAULT);
            let html = null;

            // Process initial body value (if this is an edit)
            const {body} = this.props.fields
            if (body.value) {
                html = body.value
            }

            // Check for draft data
            let draft = localStorage.getItem('replyEditorData-' + formId)
            if(draft) {
                draft = JSON.parse(draft)
                const {category, title} = this.props.fields
                if(category) category.onChange(draft.category)
                if(title) title.onChange(draft.title)
                html = draft.body
            }

            // If we have an initial body, check if it's html or markdown
            if(html) {
                rte = isHtmlTest(html)
                if(rte) html = stripHtmlWrapper(html)
            }

            body.onChange(html)
            this.setState({
                rte,
                rte_value: rte ? stateFromHtml(html) : null
            })
            this.setAutoVote()
            this.setState({payoutType: this.props.isStory ? (localStorage.getItem('defaultPayoutType') || '50%') : '50%'})
        }
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.props.isStory) this.refs.titleRef.focus()
            else if (this.refs.postRef) this.refs.postRef.focus()
            else if (this.refs.rte) this.refs.rte._focus()
        }, 300)
    }
    componentWillReceiveProps(nextProps) {
        if(process.env.BROWSER) {
            const tp = this.props.fields
            const np = nextProps.fields

            // Save curent draft to localStorage
            if(tp.body.value !== np.body.value ||
                (np.category && tp.category.value !== np.category.value) ||
                (np.title && tp.title.value !== np.title.value)
            ) { // also prevents saving after parent deletes this information
                const {fields: {category, title, body}, formId} = nextProps
                const data = {
                    formId,
                    title: title ? title.value : undefined,
                    category: category ? category.value : undefined,
                    body: this.state.rte ? addHtmlWrapper(body.value) : body.value,
                }

                clearTimeout(saveEditorTimeout)
                saveEditorTimeout = setTimeout(() => {
                    // console.log('save formId', formId, JSON.stringify(data, null, 0))
                    localStorage.setItem('replyEditorData-' + formId, JSON.stringify(data, null, 0))
                }, 350)
            }
        }
    }
    componentWillUnmount() {
        const {clearMetaData, formId} = this.props
        clearMetaData(formId)
    }

    // As rte_editor is updated, keep the (invisible) 'body' field in sync.
    onChange(rte_value) {
        this.setState({rte_value})
        const html = stateToHtml(rte_value)
        const body = this.props.fields.body
        if(body.value !== html) body.onChange(html);
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
    toggleRte(e) {
        e.preventDefault();
        const state = {rte: !this.state.rte};
        if (state.rte) {
            state.rte_value = stateFromHtml(this.props.fields.body.value);
        }
        this.setState(state);
        localStorage.setItem('replyEditorData-rte', !this.state.rte)
    }

    onPayoutTypeChange = (e) => {
        const payoutType = e.currentTarget.value
        this.setState({payoutType})
        if(payoutType !== '0%') localStorage.setItem('defaultPayoutType', payoutType)
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
            author, permlink, parent_author, parent_permlink, type, jsonMetadata,
            state, successCallback, handleSubmit, submitting, invalid, //lastComment,
        } = this.props
        const {postError, loading, titleWarn, rte, payoutType} = this.state
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
            author, permlink, parent_author, parent_permlink, type, state, originalPost, isHtml: rte,
            jsonMetadata, autoVote: autoVoteValue, payoutType,
            successCallback: successCallbackWrapper, errorCallback
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

                        <div className={'ReplyEditor__body ' + (rte ? `rte ${vframe_section_class}` : vframe_section_shrink_class)}>
                            {!body.value && isStory &&
                                <div className="float-right secondary" style={{marginRight: '1rem'}}>
                                    {rte && <a href="#" onClick={this.toggleRte}>Markdown</a>}
                                    {!rte && <a href="#" onClick={this.toggleRte}>Editor</a>}
                                </div>
                            }
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

                            {isStory && !isEdit && <div className="ReplyEditor__options float-right text-right">

                                Rewards:&nbsp;
                                <select value={this.state.payoutType} onChange={this.onPayoutTypeChange} style={{color: this.state.payoutType == '0%' ? 'orange' : 'inherit'}}>
                                    <option value="100%">Power Up 100%</option>
                                    <option value="50%">Default (50% / 50%)</option>
                                    <option value="0%">Decline Payout</option>
                                </select>

                                <br />
                                <label title="Check this to auto-upvote your post">
                                  Upvote post&nbsp;
                                  <input type="checkbox" checked={autoVote.value} onChange={autoVoteOnChange} />
                                </label>
                            </div>}
                        </div>
                        {!loading && !rte && body.value && <div className={'Preview ' + vframe_section_shrink_class}>
                            {<div className="float-right"><a target="_blank" href="https://guides.github.com/features/mastering-markdown/">Styling with Markdown is supported.</a></div>}
                            <h6>Preview</h6>
                            <MarkdownViewer formId={formId} text={body.value} canEdit jsonMetadata={jsonMetadata} large={isStory} noImage={noImage} />
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
        const ret = {
            ...ownProps,
            fields, validate, isStory, hasCategory, username,
            initialValues: {title, body, category}, state,
            // lastComment: current.get('lastComment'),
            formId,
        }
        return ret
    },

    // mapDispatchToProps
    dispatch => ({
        clearMetaData: (id) => {
            dispatch(g.actions.clearMeta({id}))
        },
        setMetaData: (id, jsonMetadata) => {
            dispatch(g.actions.setMetaData({id, meta: jsonMetadata ? jsonMetadata.steem : null}))
        },
        reply: ({category, title, body, author, permlink, parent_author, parent_permlink, isHtml,
            type, originalPost, autoVote = false, payoutType = '50%',
            state, jsonMetadata,
            successCallback, errorCallback, loadingCallback
        }) => {
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

            const formCategories = Set(category ? category.trim().replace(/#/g,"").split(/ +/) : [])
            const rootCategory = originalPost && originalPost.category ?
                originalPost.category : formCategories.first()
            const rootTag = /^[-a-z\d]+$/.test(rootCategory) ? rootCategory : null

            // If this is an HTML post, add <html> wrapper to mark it as so
            if(isHtml) body = addHtmlWrapper(body)

            let rtags
            {
                const html = isHtml ? body : remarkable.render(body)
                rtags = HtmlReady(html, {mutate: false})
            }

            allowedTags.forEach(tag => { rtags.htmltags.delete(tag) })
            rtags.htmltags.delete('html')
            if(rtags.htmltags.size) {
                errorCallback('Please remove the following HTML elements from your post: ' + Array(...rtags.htmltags).join(', '))
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
            // loadingCallback starts the loading indicator
            loadingCallback()

            const __config = {originalPost, autoVote}

            switch(payoutType) {
                case '0%': // decline payout
                    __config.comment_options = {
                        max_accepted_payout: '0.000 SBD',
                    }
                    break;
                case '100%': // 100% steem power payout
                    __config.comment_options = {
                        percent_steem_dollars: 0, // 10000 === 100% (of 50%)
                    }
                    break;
                default: // 50% steem power, 50% sd+steem
            }

            const operation = {
                ...linkProps,
                category: rootCategory, title, body,
                json_metadata: meta,
                __config
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'comment',
                operation,
                errorCallback,
                successCallback,
            }))
        },
    })
)(ReplyEditor)

