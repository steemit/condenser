import React from 'react';
import {reduxForm} from 'redux-form' // @deprecated, instead use: app/utils/ReactForm.js
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
import { translate } from 'app/Translator';
import { detransliterate, translateError } from 'app/utils/ParsersAndFormatters';
import {DEBT_TICKER} from 'config/client_config';

const remarkable = new Remarkable({ html: true, linkify: false, breaks: true })
const RichTextEditor = process.env.BROWSER ? require('react-rte-image').default : null;
const RTE_DEFAULT = false
//var htmlclean = require('htmlclean');

let saveEditorTimeout

// removes <html></html> wrapper if exists
function stripHtmlWrapper(text) {
    const m = text.match(/<html>\n*([\S\s]+?)?\n*<\/html>/m);
    return m && m.length === 2 ? m[1] : text;
}

// See also MarkdownViewer render
const isHtmlTest = text => /^<html>/.test(text)

function stateToHtml(state) {
    let html = state.toString('html');
    if (html === '<p></p>') html = '';
    if (html === '<p><br></p>') html = '';
    if(html == '') return ''
    return `<html>\n${html}\n</html>`;
}

function stateFromHtml(html = null) {
    if(!RichTextEditor) return null;
    if(html) html = stripHtmlWrapper(html)
    if(html && html.trim() == '') html = null
    return html ? RichTextEditor.createValueFromString(html, 'html')
                : RichTextEditor.createEmptyValue()
}

function stateFromMarkdown(markdown) {
    let html
    if(markdown && markdown.trim() !== '') {
        html = remarkable.render(markdown)
        html = HtmlReady(html).html // TODO: option to disable youtube conversion, @-links, img proxy
        //html = htmlclean(html) // normalize whitespace
        console.log("markdown converted to:", html)
    }
    return stateFromHtml(html)
}

class ReplyEditor extends React.Component {

    static propTypes = {

        // html component attributes
        formId: React.PropTypes.string.isRequired, // unique form id for each editor
        author: React.PropTypes.string, // empty or string for top-level post
        permlink: React.PropTypes.string, // new or existing category (default calculated from title)
        parent_author: React.PropTypes.string, // empty or string for top-level post
        parent_permlink: React.PropTypes.string, // new or existing category
        type: React.PropTypes.oneOf(['submit_feedback', 'submit_story', 'submit_comment', 'edit']),
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
            this.setState({ titleWarn: hasMarkdown ? translate('markdown_not_supported') : '' })
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
            let rte = this.props.isStory && JSON.parse(localStorage.getItem('replyEditorData-rte') || RTE_DEFAULT);
            let raw = null;

            // Process initial body value (if this is an edit)
            const {body} = this.props.fields
            if (body.value) {
                raw = body.value
            }

            // Check for draft data
            let draft = localStorage.getItem('replyEditorData-' + formId)
            if(draft) {
                draft = JSON.parse(draft)
                const {category, title} = this.props.fields
                if(category) category.onChange(draft.category)
                if(title) title.onChange(draft.title)
                raw = draft.body
            }

            // If we have an initial body, check if it's html or markdown
            if(raw) {
                rte = isHtmlTest(raw)
            }

            // console.log("initial reply body:", raw || '(empty)')
            body.onChange(raw)
            this.setState({
                rte,
                rte_value: rte ? stateFromHtml(raw) : null
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
                    body: body.value,
                }

                clearTimeout(saveEditorTimeout)
                saveEditorTimeout = setTimeout(() => {
                    localStorage.setItem('replyEditorData-' + formId, JSON.stringify(data, null, 0))
                    this.showDraftSaved()
                }, 500)
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
            const body = this.props.fields.body.value
            state.rte_value = isHtmlTest(body) ? stateFromHtml(body) : stateFromMarkdown(body)
        }
        this.setState(state);
        localStorage.setItem('replyEditorData-rte', !this.state.rte)
    }
    showDraftSaved() {
        const {draft} = this.refs
        draft.className = 'ReplyEditor__draft'
        void draft.offsetWidth; // reset animation
        draft.className = 'ReplyEditor__draft ReplyEditor__draft-saved'
    }

    onPayoutTypeChange = (e) => {
        const payoutType = e.currentTarget.value
        this.setState({payoutType})
        if(payoutType !== '0%') localStorage.setItem('defaultPayoutType', payoutType)
    }

    render() {
        // NOTE title, category, and body are UI form fields ..
        const originalPost = {
            category: this.props.category,
            body: this.props.body,
        }
        const {onCancel, autoVoteOnChange} = this
        const {title, category, body, autoVote} = this.props.fields
        const {
            reply, username, isStory, formId, noImage,
            author, permlink, parent_author, parent_permlink, type, jsonMetadata,
            state, successCallback, handleSubmit, submitting, invalid,
        } = this.props
        const {postError, loading, titleWarn, rte, payoutType} = this.state
        const {onTitleChange} = this
        const errorCallback = estr => { this.setState({ postError: estr, loading: false }) }
        const successCallbackWrapper = (...args) => {
            this.setState({ loading: false })
            if (successCallback) successCallback(args)
        }
        const isEdit = type === 'edit'
        const isFeedback = type === 'submit_feedback'
        const isHtml = rte || isHtmlTest(body.value)
        // Be careful, autoVote can reset curation rewards.  Never autoVote on edit..
        const autoVoteValue = !isEdit && autoVote.value
        const replyParams = {
            author, permlink, parent_author, parent_permlink, type, state, originalPost, isHtml, isStory, isFeedback,
            jsonMetadata, autoVote: autoVoteValue, payoutType,
            successCallback: successCallbackWrapper, errorCallback
        }
        const postLabel = username ? <Tooltip t={translate('post_as') + ' “' + username + '”'}>{translate('post')}</Tooltip> : translate('post')
        const hasTitleError = title && title.touched && title.error
        let titleError = null
        // The Required title error (triggered onBlur) can shift the form making it hard to click on things..
        if ((hasTitleError && (title.error !== 'Required' || body.value !== '')) || titleWarn) {
            titleError = <div className={hasTitleError ? 'error' : 'warning'}>
                {hasTitleError ? translate(title.error.toLowerCase()) : titleWarn}&nbsp;
            </div>
        }

        // TODO: remove all references to these vframe classes. Removed from css and no longer needed.
        const vframe_class = isStory ? 'vframe' : '';
        const vframe_section_class = isStory ? 'vframe__section' : '';
        const vframe_section_shrink_class = isStory ? 'vframe__section--shrink' : '';

        return (
            <div className="ReplyEditor row">
                <div className="column small-12">
                    <div ref="draft" className="ReplyEditor__draft ReplyEditor__draft-hide">{translate('draft_saved')}.</div>
                    <form className={vframe_class}
                        onSubmit={handleSubmit(data => {
                            const loadingCallback = () => this.setState({loading: true, postError: undefined})
                            reply({ ...data, ...replyParams, loadingCallback })
                        })}
                        onChange={() => {this.setState({ postError: null })}}
                    >
                        <div className={vframe_section_shrink_class}>
                            {isStory && <span>
                                <input type="text" className="ReplyEditor__title" {...cleanReduxInput(title)} onChange={onTitleChange} disabled={loading} placeholder={translate('title')} autoComplete="off" ref="titleRef" tabIndex={1} />
                                <div className="float-right secondary" style={{marginRight: '1rem'}}>
                                    {rte && <a href="#" onClick={this.toggleRte}>{body.value ? translate('raw_html') : 'Markdown'}</a>}
                                    {!rte && <a href="#" onClick={this.toggleRte}>{translate('editor')}</a>}
                                </div>
                                {titleError}
                            </span>}
                        </div>

                        <div className={'ReplyEditor__body ' + (rte ? `rte ${vframe_section_class}` : vframe_section_shrink_class)}>
                            {process.env.BROWSER && rte ?
                                <RichTextEditor ref="rte"
                                    readOnly={loading}
                                    value={this.state.rte_value}
                                    onChange={this.onChange}
                                    onBlur={body.onBlur} tabIndex={2} />
                                :
                                <textarea {...cleanReduxInput(body)} disabled={loading} rows={isStory ? 10 : 3} placeholder={translate(isStory ? 'write_your_story' : 'reply')} autoComplete="off" ref="postRef" tabIndex={2} />
                            }
                        </div>
                        <div className={vframe_section_shrink_class}>
                            <div className="error">{body.touched && body.error && body.error !== 'Required' && body.error}</div>
                        </div>

                        <div className={vframe_section_shrink_class} style={{marginTop: '0.5rem'}}>
                            {isStory && !isFeedback && <span>
                                <CategorySelector {...category} disabled={loading} isEdit={isEdit} tabIndex={3} />
                                <div className="error">{(category.touched || category.value) && category.error}&nbsp;</div>
                            </span>}
                            {isStory && isFeedback && <span>
                              <div className="TagList__horizontal">
                                <a href="/created/ru--obratnaya-svyazx">{translate('feedback').split(' ').join('-')}</a>
                              </div>
                            </span>}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            {postError && <div className="error">{translateError(postError)}</div>}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            {!loading && <button type="submit" className="button" disabled={submitting || invalid} tabIndex={4}>{isEdit ? translate('update_post') : postLabel}</button>}
                            {loading && <span><br /><LoadingIndicator type="circle" /></span>}
                            &nbsp; {!loading && this.props.onCancel &&
                                <button type="button" className="secondary hollow button no-border" tabIndex={5} onClick={(e) => {e.preventDefault(); onCancel()}}>{translate("cancel")}</button>
                            }
                            {!loading && !this.props.onCancel && <button className="button hollow no-border" tabIndex={5} disabled={submitting} onClick={onCancel}>{translate("clear")}</button>}

                            {isStory && !isEdit && <div className="ReplyEditor__options float-right text-right">

                                {translate('rewards')}:&nbsp;
                                <select value={this.state.payoutType} onChange={this.onPayoutTypeChange} style={{color: this.state.payoutType == '0%' ? 'orange' : 'inherit'}}>
                                    <option value="100%">{translate('power_up_on')}</option>
                                    <option value="50%">{translate('default50_50')}</option>
                                    <option value="0%">{translate('decline_payout')}</option>
                                </select>

                                <br />
                                <label title="Check this to auto-upvote your post">
                                  {translate("upvote_own_post")}&nbsp;
                                  <input type="checkbox" checked={autoVote.value} onChange={autoVoteOnChange} />
                                </label>
                            </div>}
                        </div>
                        {!loading && !rte && body.value && <div className={'Preview ' + vframe_section_shrink_class}>
                            {!isHtml && <div className="float-right"><a target="_blank" href="https://golos.io/ru--golos/@on0tole/osnovy-oformleniya-postov-na-golose-polnyi-kurs-po-rabote-s-markdown">Полный курс по работе с Markdown</a></div>}
                            <h6>{translate("preview")}</h6>
                            <MarkdownViewer formId={formId} text={body.value} canEdit jsonMetadata={jsonMetadata} large={isStory} noImage={noImage} timeCteated={new Date()}/>
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
        const isStory = /submit_story|submit_feedback/.test(type) || (
            type === 'edit' && parent_author === ''
        )
        const isFeedback = type === 'submit_feedback'
        if (isStory) fields.push('title')
        if (isStory) fields.push('category')
        const isEdit = type === 'edit'
        const maxKb = isStory ? 100 : 16
        const validate = values => ({
            title: isStory && (
                !values.title || values.title.trim() === '' ? 'Required' :
                values.title.length > 255 ? 'Shorten title' :
                null
            ),
            category: isStory && !isFeedback && validateCategory(values.category, !isEdit),
            body: !values.body ? 'Required' :
                  values.body.length > maxKb * 1024 ? 'Exceeds maximum length ('+maxKb+'KB)' : null,
        })

        let {category, title, body} = ownProps
        if (/submit_/.test(type)) title = body = ''
        if(isStory && jsonMetadata && jsonMetadata.tags) {
            const detags = jsonMetadata.tags.map(tag => detransliterate(tag))
            category = Set([detransliterate(category), ...detags]).join(' ')
        }
        const ret = {
            ...ownProps,
            fields, validate, isStory, username,
            initialValues: {title, body, category}, state,
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
        reply: ({category, title, body, author, permlink, parent_author, parent_permlink, isHtml, isStory, isFeedback,
            type, originalPost, autoVote = false, payoutType = '50%',
            state, jsonMetadata,
            successCallback, errorCallback, loadingCallback
        }) => {
            // const post = state.global.getIn(['content', author + '/' + permlink])
            const username = state.user.getIn(['current', 'username'])

            // Parse categories:
            // if category string starts with russian symbol, add 'ru-' prefix to it
            // when transletirate it
            // This is needed to be able to detransletirate it back to russian in future (to show russian categories to user)
            // (all of this is needed because blockchain does not allow russian symbols in category)
            if (isFeedback) category = 'обратная-связь'
            if (category) {
                category = category
                    .split(' ')
                    .map(item => /^[а-яё]/.test(item) ? 'ru--' + detransliterate(item, true) : item)
                    .join(' ')
                    .trim()
            }

            const isEdit = type === 'edit'
            const isNew = /^submit_/.test(type)

            // Wire up the current and parent props for either an Edit or a Submit (new post)
            //'submit_story', 'submit_comment', 'edit'
            const linkProps =
                isNew ? { // submit new
                    parent_author: author,
                    parent_permlink: permlink,
                    author: username,
                    // permlink,  assigned in TransactionSaga
                } :
                // edit existing
                isEdit ? {author, permlink, parent_author, parent_permlink}
                : null

            if (!linkProps) throw new Error('Unknown type: ' + type)

            const formCategories = Set(category ? category.trim().replace(/#/g,"").split(/ +/) : [])
            const rootCategory = originalPost && originalPost.category ?
                originalPost.category : formCategories.first()
            const rootTag = /^[-a-z\d]+$/.test(rootCategory) ? rootCategory : null

            // If this is an HTML post, it MUST begin and end with the tag
            if(isHtml && !body.match(/^<html>[\s\S]*<\/html>$/)) {
                errorCallback('HTML posts must begin with <html> and end with </html>')
                return
            }

            let rtags
            {
                const html = isHtml ? body : remarkable.render(body)
                rtags = HtmlReady(html, {mutate: false})
            }

            allowedTags.forEach(tag => { rtags.htmltags.delete(tag) })
            if(isHtml) rtags.htmltags.delete('html') // html tag allowed only in HTML mode
            if(rtags.htmltags.size) {
                errorCallback('Please remove the following HTML elements from your post: ' + Array(...rtags.htmltags).map(tag => `<${tag}>`).join(', '))
                return
            }

            let allCategories = Set([...formCategories.toJS(), ...rtags.hashtags])
            if(rootTag) allCategories = allCategories.add(rootTag)

            // merge
            const meta = isEdit ? jsonMetadata : {}
            if(allCategories.size) meta.tags = allCategories.toJS(); else delete meta.tags
            if(rtags.usertags.size) meta.users = rtags.usertags; else delete meta.users
            if(rtags.images.size) meta.image = rtags.images; else delete meta.image
            if(rtags.links.size) meta.links = rtags.links; else delete meta.links

            if(isStory) {
                meta.app = "steemit/0.1"
                meta.format = isHtml ? 'html' : 'markdown'
            }

            // if(Object.keys(json_metadata.steem).length === 0) json_metadata = {}// keep json_metadata minimal
            const sanitizeErrors = []
            sanitize(body, sanitizeConfig({sanitizeErrors}))
            if(sanitizeErrors.length) {
                errorCallback(sanitizeErrors.join('.  '))
                return
            }

            if(meta.tags.length > 5) {
                const includingCategory = isEdit ? ` (including the category '${rootCategory}')` : ''
                errorCallback(`You have ${meta.tags.length} tags total${includingCategory}.  Please use only 5 in your post and category line.`)
                return
            }
            // loadingCallback starts the loading indicator
            loadingCallback()

            const originalBody = isEdit ? originalPost.body : null
            const __config = {originalBody, autoVote}

            // Avoid changing payout option during edits #735
            if(!isEdit) {
                switch(payoutType) {
                    case '0%': // decline payout
                        __config.comment_options = {
                            max_accepted_payout: '0.000 ' + DEBT_TICKER,
                        }
                        break;
                    case '100%': // 100% steem power payout
                        __config.comment_options = {
                            percent_steem_dollars: 0, // 10000 === 100% (of 50%)
                        }
                        break;
                    default: // 50% steem power, 50% sd+steem
                }
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

