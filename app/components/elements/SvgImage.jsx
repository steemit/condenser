import React from 'react';

export default class SvgImage extends React.Component {
    static propTypes = {
        name: React.PropTypes.string.isRequired,
        width: React.PropTypes.string.isRequired,
        height: React.PropTypes.string.isRequired,
        className: React.PropTypes.string
    };
    render() {
        const style = {display: 'inline-block', width: this.props.width, height: this.props.height};
        const image = require(`app/assets/images/${this.props.name}.svg`);
        const cn = 'SvgImage' + (this.props.className ? ' ' + this.props.className : '');
        return <span className={cn} style={style} dangerouslySetInnerHTML={{__html: image}} />;
    }
}
