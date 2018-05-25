import React from 'react';

const icons = [
    'flags/1x1/all',
    'flags/1x1/ru',
    'flags/1x1/ua',
    'flags/1x1/by',
    'flags/1x1/am',
    'flags/1x1/kz',
    'flags/1x1/tj',
    'flags/1x1/md',
    'flags/1x1/es',
    'flags/1x1/in',
    'flags/1x1/pt',
    'flags/1x1/fr',
    'flags/1x1/us',
    "flags/1x1/rs",
    "flags/1x1/ar",
    "flags/1x1/cn",
    "flags/1x1/ro",
    'user',
    'share',
    'calendar',
    'chain',
    'caret-down',
    'chevron-up-circle',
    'chevron-down-circle',
    'chevron-left',
    'chatboxes',
    'cross',
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
    'telegram',
    'cog',
    'enter',
    'profile',
    'key',
    'reply',
    'replies',
    'wallet',
    'home',
    'lj',
    'arrow',
    'envelope',
    'male',
    'female',
    'money',
    'team',
    'rocket',
    'blockchain',
    'hf/hf1',
    'hf/hf2',
    'hf/hf3',
    'hf/hf4',
    'hf/hf5',
    'hf/hf6',
    'hf/hf7',
    'hf/hf8',
    'hf/hf9',
    'hf/hf10',
    'hf/hf11',
    'hf/hf12',
    'hf/hf13',
    'hf/hf14',
    'hf/hf15',
    'hf/hf16',
    'hf/hf17',
    'hf/hf18',
    'hf/hf19',
    'hf/hf20',
    'vote',
    'flag',
    'new/vk',
    'new/facebook',
    'new/telegram',
    'new/home',
    'new/blogging',
    'new/comment',
    'new/answer',
    'new/wallet',
    'new/setting',
    'new/logout',
    'new/bell',
    'new/messenger',
    'new/more',
    'new/like',
    'new/add',
    'new/search'
];
const icons_map = {};
for (const i of icons) icons_map[i] = require(`app/assets/icons/${i}.svg`);

const rem_sizes = {'0_75x': '0.75', '0_95x': '0.95', '1x': '1.12', '1_25x': '1.25', '1_5x': '1.5', '1_75x': '1.75', '2x': '2', '3x': '3.45', '4x': '4.60', '5x': '5.75', '10x': '10.0'};

export default class Icon extends React.Component {

    static propTypes = {
        name: React.PropTypes.string.isRequired,
        size: React.PropTypes.oneOf(['0_75x', '0_95x', '1x', '1_25x', '1_5x', '2x', '3x', '4x', '5x', '10x']),
        inverse: React.PropTypes.bool,
        className: React.PropTypes.string
    };

    render() {
        const {name, size, className} = this.props;
        let classes = 'Icon ' + name;
        let style = {display: 'inline-block', width: `${rem_sizes['1x']}rem`};
        if (size) {
            classes += ' Icon_' + size;
            style = {display: 'inline-block', width: `${rem_sizes[size]}rem`};
        }
        if (className) {
            classes += ' ' + className;
        }

        return <span className={classes} style={style} dangerouslySetInnerHTML={{__html: icons_map[name]}} />;
    }
}
