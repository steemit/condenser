import React from 'react';

const icons = [
    'user',
    'share',
    'chevron-up-circle',
    'chevron-down-circle',
    'chatboxes',
    'chatbox',
    'facebook',
    'twitter',
    'linkedin',
    'link',
    'clock',
    'extlink',
    'steem',
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
    'flag2'
];
const icons_map = {};
for (const i of icons) icons_map[i] = require(`app/assets/icons/${i}.svg`);

export default class Icon extends React.Component {

    static propTypes = {
        name: React.PropTypes.string.isRequired,
        size: React.PropTypes.oneOf(['1x', '2x', '3x', '4x', '5x', '10x']),
        inverse: React.PropTypes.bool,
        className: React.PropTypes.string
    };

    render() {
        const {name, size, className} = this.props;
        let classes = 'Icon ' + name;
        if (size) {
            classes += ' Icon_' + size;
        }
        if (className) {
            classes += ' ' + className;
        }

        return <span className={classes} dangerouslySetInnerHTML={{__html: icons_map[name]}} />;
    }
}
