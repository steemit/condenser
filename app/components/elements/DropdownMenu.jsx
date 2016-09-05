import React from 'react';
import { browserHistory } from 'react-router';
import Icon from 'app/components/elements/Icon.jsx';
import VerticalMenu from './VerticalMenu';

export default class DropdownMenu extends React.Component {
    static propTypes = {
        items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        selected: React.PropTypes.string,
        children: React.PropTypes.object,
        className: React.PropTypes.string,
        title: React.PropTypes.string,
        href: React.PropTypes.string,
        el: React.PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            shown: false,
            selected: props.selected
        };
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.hide);
    }

    show = (e) => {
        e.preventDefault();
        this.setState({shown: true});
        document.addEventListener('click', this.hide);
    };

    hide = () => {
        this.setState({shown: false});
        document.removeEventListener('click', this.hide);
    };

    navigate = (e) => {
        const a = e.target.nodeName.toLowerCase() === 'a' ? e.target : e.target.parentNode;
        this.setState({show: false});
        if (a.host !== window.location.host) return;
        e.preventDefault();
        browserHistory.push(a.pathname + a.search);
    };

    render() {
        const {el, items, selected, children, className, title, href} = this.props;
        const selectedEntry = items.find(i => i.value === selected)
        const selectedLabel = selectedEntry && selectedEntry.label ? selectedEntry.label : selected
        const entry = <a key="entry" href={href || '#'} onClick={this.show}>
            {children || <span>
                {/*selectedEntry && selectedEntry.icon && <Icon name={selectedEntry.icon} />*/}{/*looks bad on the deposit screen*/}
                {selectedLabel}
                <Icon name="dropdown-arrow" />
            </span>}
        </a>;
        const menu = <VerticalMenu key="menu" title={title} items={items} hideValue={selected} className="VerticalMenu" />;
        const cls = 'DropdownMenu' + (this.state.shown ? ' show' : '') + (className ? ` ${className}` : '')
        return React.createElement(el, {className: cls}, [entry, menu]);
    }
}

