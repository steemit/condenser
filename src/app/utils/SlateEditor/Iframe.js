import React from 'react';
import linksRe from 'app/utils/Links';

export default class Iframe extends React.Component {
    normalizeEmbedUrl = url => {
        let match;

        // Detect youtube URLs
        match = url.match(linksRe.youTubeId);
        if (match && match.length >= 2) {
            return 'https://www.youtube.com/embed/' + match[1];
        }

        // Detect vimeo
        match = url.match(linksRe.vimeoId);
        if (match && match.length >= 2) {
            return 'https://player.vimeo.com/video/' + match[1];
        }

        // Detect twitch stream
        match = url.match(linksRe.twitch);
        if (match && match.length >= 3) {
            if (match[1] === undefined) {
                return (
                    'https://player.twitch.tv/?autoplay=false&channel=' +
                    match[2]
                );
            } else {
                return (
                    'https://player.twitch.tv/?autoplay=false&video=' + match[1]
                );
            }
        }

        // Detect dtube
        match = url.match(linksRe.dtubeId);
        if (match && match.length >= 2) {
            return 'https://emb.d.tube/#!/' + match[1];
        }

        console.log('unable to auto-detect embed url', url);
        return null;
    };

    onChange = e => {
        const { node, state, editor } = this.props;
        const value = e.target.value;

        const src = this.normalizeEmbedUrl(value) || value;

        const next = editor
            .getState()
            .transform()
            .setNodeByKey(node.key, { data: { src } })
            .apply();

        editor.onChange(next);
    };

    onClick = e => {
        // stop propagation so that the void node itself isn't focused, since that would unfocus the input.
        e.stopPropagation();
    };

    render = () => {
        const { node, state, attributes } = this.props;
        const isFocused = state.selection.hasEdgeIn(node);
        const className = isFocused ? 'active' : null;

        const lockStyle = {
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.1)',
        };

        return (
            <div {...attributes} className={className}>
                <div className="videoWrapper">
                    {this.renderFrame()}
                    <div style={lockStyle}>
                        {isFocused && <span>{this.renderInput()}</span>}
                    </div>
                </div>
            </div>
        );
    };

    renderFrame = () => {
        let src = this.props.node.data.get('src');
        src = this.normalizeEmbedUrl(src) || src;

        return (
            <iframe
                type="text/html"
                width="640"
                height="360"
                src={src}
                frameBorder="0"
                webkitallowfullscreen
                mozallowfullscreen
                allowfullscreen
            />
        );
    };

    renderInput = () => {
        const src = this.props.node.data.get('src');

        const style = {
            fontFamily: 'Arial',
            margin: '200px auto',
            width: '90%',
            padding: '1rem 0.5rem',
            background: 'rgba(255,255,255,0.9)',
            display: 'block',
            textAlign: 'center',
            color: 'black',
            borderRadius: '5px',
        };

        return (
            <input
                value={src}
                onChange={this.onChange}
                onClick={this.onClick}
                placeholder="Enter a YouTube or Vimeo URL..."
                style={style}
            />
        );
    };
}
