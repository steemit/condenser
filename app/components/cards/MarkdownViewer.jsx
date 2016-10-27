import React from 'react';
import {connect} from 'react-redux'
import {Component} from 'react'
import Remarkable from 'remarkable'
// import CardView from 'app/components/cards/CardView'
import YoutubePreview from 'app/components/elements/YoutubePreview'
import sanitizeConfig, {noImageText} from 'app/utils/SanitizeConfig'
import {renderToString} from 'react-dom/server';
import sanitize from 'sanitize-html'
import HtmlReady from 'shared/HtmlReady'

const remarkable = new Remarkable({
    html: true, // remarkable renders first then sanitize runs...
    breaks: true,
    linkify: false, // linkify is done locally
    typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
    quotes: '“”‘’'
})

class MarkdownViewer extends Component {

    static propTypes = {
        // HTML properties
        text: React.PropTypes.string,
        className: React.PropTypes.string,
        large: React.PropTypes.bool,
        // formId: React.PropTypes.string, // This is unique for every editor of every post (including reply or edit)
        canEdit: React.PropTypes.bool,
        jsonMetadata: React.PropTypes.object,
        highQualityPost: React.PropTypes.bool,
        noImage: React.PropTypes.bool,
    }

    static defaultProps = {
        className: '',
        large: false,
    }

    constructor() {
        super()
        this.state = {allowNoImage: true}
    }

    shouldComponentUpdate(np, ns) {
        return np.text !== this.props.text ||
        np.large !== this.props.large ||
        // np.formId !== this.props.formId ||
        np.canEdit !== this.props.canEdit ||
        ns.allowNoImage !== this.state.allowNoImage
    }

    onAllowNoImage = () => {
        this.setState({allowNoImage: false})
    }

    render() {
        const {noImage} = this.props
        const {allowNoImage} = this.state
        let {text} = this.props
        if (!text) text = '' // text can be empty, still view the link meta data
        const {large, /*formId, canEdit, jsonMetadata,*/ highQualityPost} = this.props

        let html = false;
        // See also ReplyEditor isHtmlTest
        const m = text.match(/^<html>([\S\s]*)<\/html>$/);
        if (m && m.length === 2) {
            html = true;
            text = m[1];
        } else {
            // See also ReplyEditor isHtmlTest
            html = /^<p>[\S\s]*<\/p>/.test(text)
        }

        // Strip out HTML comments. "JS-DOS" bug.
        text = text.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)')

        let renderedText = html ? text : remarkable.render(text)

        // Embed videos, link mentions and hashtags, etc...
        if(renderedText) renderedText = HtmlReady(renderedText).html

        // Complete removal of javascript and other dangerous tags..
        // The must remain as close as possible to dangerouslySetInnerHTML
        const cleanText = sanitize(renderedText, sanitizeConfig({large, highQualityPost, noImage: noImage && allowNoImage}))

        if(/<\s*script/ig.test(cleanText)) {
            // Not meant to be complete checking, just a secondary trap and red flag (code can change)
            console.error('Refusing to render script tag in post text', cleanText)
            return <div></div>
        }

        const noImageActive = cleanText.indexOf(noImageText) !== -1

        // In addition to inserting the youtube compoennt, this allows react to compare separately preventing excessive re-rendering.
        let idx = 0
        const sections = []
        // HtmlReady inserts ~~~ youtube:${id} ~~~
        for(let section of cleanText.split('~~~ youtube:')) {
            if(/^[A-Za-z0-9\_\-]+ ~~~/.test(section)) {
                const youTubeId = section.split(' ')[0]
                section = section.substring(youTubeId.length + ' ~~~'.length)
                const w = large ? 640 : 320,
                      h = large ? 480 : 180
                sections.push(
                    <YoutubePreview key={idx++} width={w} height={h} youTubeId={youTubeId}
                        frameBorder="0" allowFullScreen="true" />
                )
            }
            if(section === '') continue
            sections.push(<div key={idx++} dangerouslySetInnerHTML={{__html: section}} />)
        }

        const cn = 'Markdown' + (this.props.className ? ` ${this.props.className}` : '') + (html ? ' html' : '')
        return (<div className={"MarkdownViewer " + cn}>
            {sections}
            {noImageActive && allowNoImage &&
                <div onClick={this.onAllowNoImage} className="MarkdownViewer__negative_group">
                    Images were hidden due to low ratings.
                    <button style={{marginBottom: 0}} className="button hollow tiny float-right">Show</button>
                </div>
            }
        </div>)
        // <CardView formId={formId} canEdit={canEdit} metaLinkData={jsonMetadata ? jsonMetadata.steem : null} />
    }
}

export default connect(
    (state, ownProps) => {
        return {...ownProps}
    }
)(MarkdownViewer)
