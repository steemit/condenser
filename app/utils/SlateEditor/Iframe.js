import React from 'react'
import linksRe from 'app/utils/Links'

export default class Iframe extends React.Component {

    normalizeEmbedUrl = (url) => {
        let match;

        // Detect youtube URLs
        match = url.match(linksRe.youTubeId)
        if(match && match.length >= 2) {
            return 'https://www.youtube.com/embed/' + match[1]
        }

        // Detect vimeo
        match = url.match(linksRe.vimeoId)
        if(match && match.length >= 2) {
            return 'https://player.vimeo.com/video/' + match[1]
        }

        console.log("unable to auto-detect embed url", url)
        return null
    }

    onChange = (e) => {
        const { node, state, editor } = this.props
        const value = e.target.value

        const src = this.normalizeEmbedUrl(value) || value

        const next = editor
            .getState()
            .transform()
            .setNodeByKey(node.key, {data: {src}})
            .apply()

        editor.onChange(next)
    }

    onClick = (e) => {
        // stop propagation so that the void node itself isn't focused, since that would unfocus the input.
        e.stopPropagation()
    }

    render = () => {
        const { node, state, attributes } = this.props
        const isFocused = state.selection.hasEdgeIn(node)
        const className = isFocused ? 'active' : null
        const style = {background: 'black', color: 'white'}

        return (
            <div {...attributes} className={className} style={style}>
                {this.renderFrame()}
                Embed URL: {this.renderInput()}
            </div>
        )
    }

    renderFrame = () => {
        let src = this.props.node.data.get('src')
        src = this.normalizeEmbedUrl(src) || src

        const aspectStyle = {
            position: 'relative',
            paddingBottom: '56.2%',
            height: '0'
        }
        const lockStyle = {
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.1)'
        }
        const style = {
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%'
        }

        return (
            <div style={aspectStyle}>
                <iframe
                  type="text/html"
                  width="640"
                  height="360"
                  src={src}
                  frameBorder="0"
                  style={style}
                  webkitallowfullscreen
                  mozallowfullscreen
                  allowfullscreen
                >
                </iframe>
                <div style={lockStyle}></div>
            </div>
        )
    }

    renderInput = () => {
        const src = this.props.node.data.get('src')
        return (
            <input
              value={src}
              onChange={this.onChange}
              onClick={this.onClick}
              style={{ marginTop: '5px', background: 'black' }}
              size="70"
            />
        )
    }
}
