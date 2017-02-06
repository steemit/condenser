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
    'photo',
    'line',
    'video',
    'eye',
    'location',
    'calendar',
];
const icons_map = {};
for (const i of icons) icons_map[i] = require(`app/assets/icons/${i}.svg`);

const rem_sizes = {'1x': '1.12', '1_5x': '1.5', '2x': '2', '3x': '3.45', '4x': '4.60', '5x': '5.75', '10x': '10.0'};

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
