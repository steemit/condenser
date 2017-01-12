import React from 'react';

const icons = [
    'user',
    'share',
    'chevron-up-circle',
    'chevron-down-circle',
    'chevron-left',
    'chatboxes',
    'chatbox',
    'facebook',
    'twitter',
    'linkedin',
    'vk',
    'link',
    'clock',
    'extlink',
    'steem',
    'golos',
    'ether',
    'bitcoin',
    'bitshares',
    'dropdown-arrow',
    'printer',
    'search',
    'menu',
    'voter',
    'voters',
    'empty',
    'flag1',
    'flag2',
    'reblog',
];
const icons_map = {};
for (const i of icons) icons_map[i] = require(`app/assets/icons/${i}.svg`);

export default class Icon extends React.Component {

    static propTypes = {
        name: React.PropTypes.string.isRequired,
        size: React.PropTypes.oneOf(['1x', '1_5x', '2x', '3x', '4x', '5x', '10x']),
        inverse: React.PropTypes.bool,
        className: React.PropTypes.string
    };

    /* sometimes when you use same Icon in different components (or pages?),
    and it's get unmounted, Icon gets unmounted everywhere */
    shouldComponentUpdate(nextProps) {
      return this.props.name == nextProps.name
    }

    render() {
        const {name, size, className} = this.props;
        let classes = 'Icon ' + name;
        if (size) classes += ' Icon_' + size;
        if (className) classes += ' ' + className;
        return <span className={classes} dangerouslySetInnerHTML={{__html: icons_map[name]}} />;
    }
}
