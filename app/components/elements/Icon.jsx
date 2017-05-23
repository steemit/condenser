import React from 'react';

const icons = [
    'flags/4x3/all',
    'flags/4x3/ru',
    'flags/4x3/ua',
    'flags/4x3/by',
    'flags/4x3/am',
    'flags/4x3/kz',
    'flags/4x3/tj',
    'flags/4x3/md',
    'flags/4x3/es',
    'flags/4x3/in',
    'flags/4x3/pt',
    'flags/4x3/fr',
    'flags/4x3/us',
    "flags/4x3/rs",
    "flags/4x3/ar",
    "flags/4x3/cn",
    "flags/4x3/ro",
    'user',
    'share',
    'calendar',
    'chain',
    'caret-down',
    'chevron-up-circle',
    'chevron-down-circle',
    'chevron-left',
    'chatboxes',
    'chatbox',
    'facebook',
    'twitter',
    'linkedin',
    'pencil',
    'vk',
    'link',
    'clock',
    'extlink',
    'steem',
    'steemd',
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
    'photo',
    'line',
    'video',
    'eye',
    'location',
    'info_o',
    'feedback',
    'rocket-chat',
    'cog',
    'enter',
    'profile',
    'key',
    'reply',
    'replies',
    'wallet',
    'home',
    'lj'
];
const icons_map = {};
for (const i of icons) icons_map[i] = require(`app/assets/icons/${i}.svg`);

const rem_sizes = {'1x': '1.12', '1_5x': '1.5', '1_75x': '1.75', '2x': '2', '3x': '3.45', '4x': '4.60', '5x': '5.75', '10x': '10.0'};

export default class Icon extends React.Component {

    static propTypes = {
        name: React.PropTypes.string.isRequired,
        size: React.PropTypes.oneOf(['1x', '1_5x', '2x', '3x', '4x', '5x', '10x']),
        inverse: React.PropTypes.bool,
        className: React.PropTypes.string
    };

    render() {
        const {name, size, className} = this.props;
        let classes = 'Icon ' + name;
        let style = {display: 'inline-block', width: `${rem_sizes['1x']}rem`, height: `${rem_sizes['1x']}rem`};
        if (size) {
            classes += ' Icon_' + size;
            style = {display: 'inline-block', width: `${rem_sizes[size]}rem`, height: `${rem_sizes[size]}rem`};
        }
        if (className) {
            classes += ' ' + className;
        }

        return <span className={classes} style={style} dangerouslySetInnerHTML={{__html: icons_map[name]}} />;
    }
}
