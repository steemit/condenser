import React from 'react';
import {connect} from 'react-redux'
import {Component} from 'react'
import Remarkable from 'remarkable'
import YoutubePreview from 'app/components/elements/YoutubePreview'
import sanitizeConfig, {noImageText} from 'app/utils/SanitizeConfig'
import {renderToString} from 'react-dom/server';
import sanitize from 'sanitize-html'
import HtmlReady from 'shared/HtmlReady'
import {translate} from 'app/Translator';
import EmbedView from 'app/components/elements/EmbedView';
import links from 'app/utils/Links';
import { isWhite } from 'app/utils/EmbedContentWhitelist';

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
        allowDangerousHTML: React.PropTypes.bool,
        timeCteated : React.PropTypes.object.isRequired,
    }

    static defaultProps = {
        className: '',
        large: false,
        allowDangerousHTML: false,
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

        const postDate = this.props.timeCteated.getTime();
        const scrapSince = new Date(Date.UTC(2017, 4, 5)).getTime(); //move to config
        const resolve = postDate > scrapSince;

        // Embed videos/content, link mentions and hashtags, etc...
        if(renderedText) renderedText = HtmlReady(renderedText, {}, resolve).html
        //console.log("MarkDown -> " + renderedText + " <-")
        // Complete removal of javascript and other dangerous tags..
        // The must remain as close as possible to dangerouslySetInnerHTML
        let cleanText = renderedText
        if (this.props.allowDangerousHTML === true) {
            console.log('WARN\tMarkdownViewer rendering unsanitized content')
        } else {
            cleanText = sanitize(renderedText, sanitizeConfig({large, highQualityPost, noImage: noImage && allowNoImage}))
        }

        if(/<\s*script/ig.test(cleanText)) {
            // Not meant to be complete checking, just a secondary trap and red flag (code can change)
            console.error('Refusing to render script tag in post text', cleanText)
            return <div></div>
        }

        const noImageActive = cleanText.indexOf(noImageText) !== -1

        // In addition to inserting the youtube compoennt, this allows react to compare separately preventing excessive re-rendering.
        let idx = 0
        const sections = []

        // HtmlReady inserts ~~~ embed:${id} type ~~~ and ~~~ embed:${url} ~~~
        for(let section of cleanText.split('~~~ embed:')) {
            let match = section.match(/^([A-Za-z0-9\_\-]+) (youtube|vimeo) ~~~/)
            if(match && match.length >= 3) {
                const id = match[1]
                const type = match[2]
                const w = large ? 640 : 480,
                      h = large ? 360 : 270
                if(type === 'youtube') {
                    sections.push(
                        <YoutubePreview key={idx++} width={w} height={h} youTubeId={id}
                            frameBorder="0" allowFullScreen="true" />
                    )
                } else if(type === 'vimeo') {
                    const url = `https://player.vimeo.com/video/${id}`
                    sections.push(
                        <div className="videoWrapper">
                            <iframe key={idx++} src={url} width={w} height={h} frameBorder="0"
                                webkitallowfullscreen mozallowfullscreen allowFullScreen></iframe>
                        </div>
                    )
                } else {
                    console.error('MarkdownViewer unknown embed type', type);
                }
                section = section.substring(`${id} ${type} ~~~`.length)
                if(section === '') continue
            }

            match = section.match(links.embedContent);
            if (resolve && (match && match.length > 1)) {
                const url = match[0];
                let a = match[1];

                if (a && isWhite(a)) {
                    sections.push(
                        <EmbedView key={idx++} contentUrl={url}/>
                    );

                    section = section.substring(`${url} ~~~`.length);
                    if(section === '') continue
                }

            }
            sections.push(<div key={idx++} dangerouslySetInnerHTML={{__html: section}} />)
        }

        const cn = 'Markdown' + (this.props.className ? ` ${this.props.className}` : '') + (html ? ' html' : '') + (large ? '' : ' MarkdownViewer--small')
        return (<div className={"MarkdownViewer " + cn}>
            {sections}
            {noImageActive && allowNoImage &&
                <div onClick={this.onAllowNoImage} className="MarkdownViewer__negative_group">
                    {translate('images_were_hidden_due_to_low_ratings')}.
                    <button style={{marginBottom: 0}} className="button hollow tiny float-right">{translate('show')}</button>
                </div>
            }
        </div>)
    }
}

export default connect(
    (state, ownProps) => {
        return {...ownProps}
    }
)(MarkdownViewer)
